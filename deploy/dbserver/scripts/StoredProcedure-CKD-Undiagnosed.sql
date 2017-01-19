
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.ckd.undiagnosed') DROP PROCEDURE [pingr.ckd.undiagnosed];

GO
CREATE PROCEDURE [pingr.ckd.undiagnosed] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON --exclude row count results for call from R

--declare @refdate datetime;
--set @refdate = '2016-06-17'; --SIR_ALL
--declare @window int;
--set @window = 12;

--create temp tables
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
IF OBJECT_ID('tempdb..#latestEgfrACR') IS NOT NULL DROP TABLE #latestEgfrACR
IF OBJECT_ID('tempdb..#classify') IS NOT NULL DROP TABLE #classify
IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
IF OBJECT_ID('tempdb..#suggestExclude') IS NOT NULL DROP TABLE #suggestExclude

CREATE TABLE #denominator (PatID int, dead int, egfr int, diag int, exclusion int);
CREATE TABLE #latestEgfrACR (PatID int, egfrMax float, latestEgfrDate date, acrMax float, latestAcrDate date, code varchar (8), codeDate date);
CREATE TABLE #classify (PatID int, egfrMax float, acrMax float, code varchar (8), correct varchar (8), correct_read varchar (100));
CREATE TABLE #indicator (PatID int, code varchar (8), correct varchar (8), indicator varchar (5));
CREATE TABLE #suggestExclude (PatID int, palliative int, palDate date, frail int, frailDate date, housebound int, houseboundDate date, threeInvites int, threeInvitesDate date);

--create permanent tables for export
--if not exists (select * from sysobjects where name='outContacts' and xtype='U') CREATE TABLE outContacts (PatID int, date date, event varchar(100));
--if not exists (select * from sysobjects where name='outImpCodes' and xtype='U') CREATE TABLE outImpCodes (PatID int, date date, importantCode varchar(100));
--if not exists (select * from sysobjects where name='outDiagnoses' and xtype='U') CREATE TABLE outDiagnoses (PatID int, date date, diagnosis varchar(100), subcategory varchar(100));
--if not exists (select * from sysobjects where name='outMeasures' and xtype='U') CREATE TABLE outMeasures (PatID int, date date, measure varchar(100), value float);
--if not exists (select * from sysobjects where name='outDemographics' and xtype='U') CREATE TABLE outDemographics (PatID int, age int, sex varchar (100));
--if not exists (select * from sysobjects where name='outImpOppCatsAndActions' and xtype='U') CREATE TABLE outImpOppCatsAndActions (PatID int, impOppCat varchar(1000), action varchar(1000), short_action varchar(1000), long_action varchar(1000), reason varchar(1000), evidence varchar(1000));
--if not exists (select * from sysobjects where name='outIndicator' and xtype='U') CREATE TABLE outIndicator (date date, numerator int, denominator int, target float);

--------------------------------------------------------------------------------
---Start loop for indicator table
--------------------------------------------------------------------------------
--truncate table outIndicator

--------------------------------------------------------------------------------
---Create denominator table - patients with eGFR<60 and/or CKD code >=3
--------------------------------------------------------------------------------
--truncate table #denominator
insert into #denominator (PatID, egfr, diag, exclusion)
select PatID, SUM(egfr) as egfr, SUM(diag) as diag, SUM(exclusion) as exclusion from (

--Find patients with latest eGFR readings < 60, and at least 1 eGFR reading < 60 at least 90 days before with no values between these dates > 60
select a.PatID, 1 as egfr, 0 as diag, 0 as exclusion from SIR_ALL_Records a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join(
		select parent.PatID, max(EntryDate) as most_recent_egfr_gt_90_days_ago, max(child.most_recent_egfr_date) as most_recent_egfr_date from SIR_ALL_Records parent
			inner join patients p on p.patid = parent.PatID and p.dead != 1 --and p.gpcode='P87016'
			inner join (
				select PatID, MAX(EntryDate) as most_recent_egfr_date from SIR_ALL_Records
				inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
				where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
				and EntryDate < @refdate
				and CodeValue is not null
				and CodeValue > 0
				group by PatID) child on child.PatID = parent.PatID and parent.EntryDate < DATEADD(day, -90, child.most_recent_egfr_date)
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and CodeValue is not null
		and CodeValue > 0
		and EntryDate < @refdate
		group by parent.PatID
	) sub on sub.PatID = a.PatID and EntryDate >= sub.most_recent_egfr_gt_90_days_ago and EntryDate <= sub.most_recent_egfr_date
where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
and CodeValue is not null
and CodeValue > 0
and EntryDate < @refdate
group by a.PatID
having MAX(CodeValue) < 60

union

--Find patients with a CKD read code >=stage 3 at ANY TIME, and NO CKD resolved, or CKD 1-2 code afterwards
SELECT c.PatID, 0 as egfr, 1 as diag, 0 as exclusion from
-----select most recent CKD read code >=stage 3
(
	(SELECT PatID, MAX(EntryDate) AS ckd FROM SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
          WHERE ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
	and EntryDate < @refdate
	GROUP BY PatID) as c
-----no 'CKD resolved' or 'CKD 1-2' code afterwards
     LEFT OUTER JOIN
		(SELECT PatID, MAX(EntryDate) AS ckd FROM SIR_ALL_Records
			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
			WHERE ReadCode IN ('2126E', '1Z10.', '1Z11.', '1Z17.', '1Z18.', '1Z19.', '1Z1A.', '1Z1M.', '1Z1Q.', 'K051.', 'K052.', '1Z1N.', '1Z1P.', '1Z1R.', '1Z1S.')
     and EntryDate < @refdate
     GROUP BY PatID) AS B ON c.PatID = B.PatID
)
WHERE B.ckd IS NULL OR B.ckd < c.ckd


union

--Find patients with a QOF CKD exclusion read code (EXPIRING) in last 12 months
select a.PatID, 0 as egfr, 0 as diag, 1 as exclusion from SIR_ALL_Records a
inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('9hE0.','9hE1.','9hE..')
and EntryDate > DATEADD(month, -12, @refdate)
and EntryDate < @refdate
group by a.PatID

--Close denominator table
) sub
group by sub.PatID;
--17s full SIR data
--9s single practice

--------------------------------------------------------------------------------
---Create #latestEgfrACR table from #denominator table EXCLUDING EXCEPTIONS
--------------------------------------------------------------------------------
--truncate table #latestEgfrACR
insert into #latestEgfrACR (PatID, egfrMax, latestEgfrDate, acrMax, latestAcrDate, code, codeDate)
select PatID, SUM(egfrMax) as egfrMax, MAX(latestEgfrDate), SUM(acrMax) as acrMax, MAX(latestAcrDate), MAX(code), MAX(codeDate) from (

--Obtain max value on the day of the latest eGFR reading for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, MAX(CodeValue) as egfrMax, MAX(latestEgfrDate) as latestEgfrDate, NULL as acrMax, NULL as latestAcrDate, NULL as code, NULL as codeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestEgfrDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and PatID in (select PatID from #denominator where exclusion = 0)
		and EntryDate < @refdate
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestEgfrDate = s.EntryDate
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and EntryDate < @refdate
		group by s.PatID
union

--Obtain max value of the latest ACR reading for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, NULL as egfrMax, Null as latestEgfrDate, MAX(CodeValue) as acrMax, MAX(latestAcrDate) as latestAcrDate, NULL as code, NULL as codeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestAcrDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('46TC.', '46TD.') and (CodeUnits is null or CodeUnits='g/mol' or CodeUnits='mg/mmol')
		and PatID in (select PatID from #denominator where exclusion = 0)
		and EntryDate < @refdate
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestAcrDate = s.EntryDate
		where ReadCode in ('46TC.', '46TD.')
		and EntryDate < @refdate
		group by s.PatID

union

--Obtain latest CKD diagnostic code for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, NULL as egfrMax, NULL as latestEgfrDate, NULL as acrMax, NULL as latestAcrDate, case
	when ReadCode in ('1Z12.','K053.') then 'G3'
	when ReadCode in ('1Z13.','K054.') then 'G4'
	when ReadCode in ('1Z14.','K055.') then 'G5'
	when ReadCode in ('1Z15.') then 'G3a'
	when ReadCode in ('1Z16.') then 'G3b'
	when ReadCode in ('1Z1B.') then 'G3 A2/3'
	when ReadCode in ('1Z1C.') then 'G3 A1'
	when ReadCode in ('1Z1D.') then 'G3a A2/3'
	when ReadCode in ('1Z1E.', '1Z1T.') then 'G3a A1'
	when ReadCode in ('1Z1F.') then 'G3b A2/3'
	when ReadCode in ('1Z1G.', '1Z1X.') then 'G3b A1'
	when ReadCode in ('1Z1H.') then 'G4 A2/3'
	when ReadCode in ('1Z1J.', '1Z1a.') then 'G4 A1'
	when ReadCode in ('1Z1K.') then 'G5 A2/3'
	when ReadCode in ('1Z1L.', '1Z1d.') then 'G5 A1'
	when ReadCode in ('1Z1V.') then 'G3a A2'
	when ReadCode in ('1Z1W.') then 'G3a A3'
	when ReadCode in ('1Z1Y.') then 'G3b A2'
	when ReadCode in ('1Z1Z.') then 'G3b A2'
	when ReadCode in ('1Z1b.') then 'G4 A2'
	when ReadCode in ('1Z1c.') then 'G4 A3'
	when ReadCode in ('1Z1e.') then 'G5 A2'
	when ReadCode in ('1Z1f.') then 'G5 A3'
end as code, MAX(latestCodeDate) as CodeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestCodeDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
		and EntryDate < @refdate
		and PatID in (select PatID from #denominator where exclusion = 0)
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestCodeDate = s.EntryDate
		where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
		and EntryDate < @refdate
		group by s.PatID, ReadCode

--Close latestEgfrACR table
) sub
group by sub.PatID;
--01:15 full SIR data
--00:29 single practice

--------------------------------------------------------------------------------
---classify patients CKD stage based on latestEgfrACR table into classify table
--------------------------------------------------------------------------------
--truncate table #classify
insert into #classify (PatID, egfrMax, acrMax, code, correct, correct_read)
select PatID, egfrMax, acrMax, code,
	case
		--when egfrMax > 90 and acrMax is null then 'G1'
		--when egfrMax > 90 and acrMax < 3 then 'G1 A1'
		--when egfrMax > 90 and acrMax between 3 and 30 then 'G1 A2'
		--when egfrMax > 90 and acrMax > 30 then 'G1 A3'
		--when egfrMax between 60 and 89 and acrMax is null then 'G2'
		--when egfrMax between 60 and 89 and acrMax < 3 then 'G2 A1'
		--when egfrMax between 60 and 89 and acrMax between 3 and 30 then 'G2 A2'
		--when egfrMax between 60 and 89 and acrMax > 30 then 'G2 A3'
		when egfrMax between 45 and 59 and acrMax is null then 'G3a'
		when egfrMax between 45 and 59 and acrMax < 3 then 'G3a A1'
		when egfrMax between 45 and 59 and acrMax between 3 and 30 then 'G3a A2'
		when egfrMax between 45 and 59 and acrMax > 30 then 'G3a A3'
		when egfrMax between 30 and 44 and acrMax is null then 'G3b'
		when egfrMax between 30 and 44 and acrMax < 3 then 'G3b A1'
		when egfrMax between 30 and 44 and acrMax between 3 and 30 then 'G3b A2'
		when egfrMax between 30 and 44 and acrMax > 30 then 'G3b A3'
		when egfrMax between 15 and 29 and acrMax is null then 'G4'
		when egfrMax between 15 and 29 and acrMax < 3 then 'G4 A1'
		when egfrMax between 15 and 29 and acrMax between 3 and 30 then 'G4 A2'
		when egfrMax between 15 and 29 and acrMax > 30 then 'G4 A3'
		when egfrMax < 15 and acrMax is null then 'G5'
		when egfrMax < 15 and acrMax < 3 then 'G5 A1'
		when egfrMax < 15 and acrMax between 3 and 30 then 'G5 A2'
		when egfrMax < 15 and acrMax > 30 then 'G5 A3'
	end as correct,
	case
		when egfrMax between 45 and 59 and acrMax is null then '1Z15. (CKD stage G3a) [#1Z15.]'
		when egfrMax between 45 and 59 and acrMax < 3 then '1Z1T. (CKD stage G3aA1) [#1Z1T.]'
		when egfrMax between 45 and 59 and acrMax between 3 and 30 then '1Z1V. (CKD stage G3aA2) [#1Z1V.]'
		when egfrMax between 45 and 59 and acrMax > 30 then '1Z1W. (CKD stage G3aA3) [#1Z1W.]'
		when egfrMax between 30 and 44 and acrMax is null then '1Z16. (CKD stage G3b ) [#1Z16.]'
		when egfrMax between 30 and 44 and acrMax < 3 then '1Z1X. (CKD stage G3bA1) [#1Z1X.]'
		when egfrMax between 30 and 44 and acrMax between 3 and 30 then '1Z1Y. (CKD stage G3bA2) [#1Z1Y.]'
		when egfrMax between 30 and 44 and acrMax > 30 then '1Z1Z. (CKD stage G3bA3) [#1Z1Z.]'
		when egfrMax between 15 and 29 and acrMax is null then 'K054. (CKD stage G4) [#K054.]'
		when egfrMax between 15 and 29 and acrMax < 3 then '1Z1a. (CKD stage G4A1) [#1Z1a.]'
		when egfrMax between 15 and 29 and acrMax between 3 and 30 then '1Z1b. (CKD stage G4A2) [#1Z1b.]'
		when egfrMax between 15 and 29 and acrMax > 30 then '1Z1c. (CKD stage G4A3) [#1Z1c.]'
		when egfrMax < 15 and acrMax is null then 'K055. (CKD stage G5) [#K055.]'
		when egfrMax < 15 and acrMax < 3 then '1Z1d. (CKD stage G5A1) [#1Z1d.]'
		when egfrMax < 15 and acrMax between 3 and 30 then '1Z1e. (CKD stage G5A2) [#1Z1e.]'
		when egfrMax < 15 and acrMax > 30 then '1Z1f. (CKD stage G5A3) [#1Z1f.]'
	end as correct_read
from #latestEgfrACR;

--0s full SIR

------------------------------
----create indicator table
------------------------------
--truncate table #indicator
insert into #indicator (PatID, code, correct, indicator)
select PatID, code, correct,
	case
		when code is not null and correct is not null then 'right'
		else 'wrong'
	end as indicator
from #classify;
--0s full SIR

-----------------------------
----Get benchmark from top 10% (5 practices)
----------------------------
declare @val float;
set @val = (select round(avg(perc),2) from (
select top 5 sum(case when indicator='right' then 1.0 else 0.0 end) / SUM(case when code is not null then 1.0 else 0.0 end) as perc from #indicator as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
	having SUM(case when code is not null then 1.0 else 0.0 end) > 0
	order by perc desc) sub);
	
									----------------------------------------------
									-------DEFINE % POINTS PER PATIENT------------
									----------------------------------------------

declare @ptPercPoints float;
set @ptPercPoints = 
(select 100 / SUM(case when code is not null then 1.0 else 0.0 end) 
from #indicator);


--------------------------------------------------------------------------------
--Declare indicator, numerator, denominator, target
--------------------------------------------------------------------------------
--declare @numerator int;
--declare @denominator int;
--set @numerator = (select COUNT(*) from #indicator where indicator='right');
--set @denominator = (select COUNT(*) from #indicator where correct is not null); --only select pts for denominator where they have CKD based on eGFR readings; excludes overdiagnosed from the denominator
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)
--select CONVERT(char(10), @refdate, 126) as date, @numerator as numerator, @denominator as denominator, 0.75 as target;
select 'ckd.diagnosis.undiagnosed', 'ALL', CONVERT(char(10), @refdate, 126) as date, sum(case when indicator='right' then 1 else 0 end) as numerator, SUM(case when code is not null then 1 else 0 end) as denominator, 0.75 as target, @val from #indicator as a
union
select 'ckd.diagnosis.undiagnosed',b.pracID, CONVERT(char(10), @refdate, 126) as date, sum(case when indicator='right' then 1 else 0 end) as numerator, SUM(case when code is not null then 1 else 0 end) as denominator, 0.75 as target, @val from #indicator as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
--0s full SIR

----------------------------------------------
--POPULATE MAIN DENOMINATOR TABLE-------------
----------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why)
									
									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max));
--insert into #denominators

select d.PatID, 'ckd.diagnosis.undiagnosed',
	'<li>Latest eGFR:<strong> ' + Str(e.egfrMax) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '<li>Latest ACR: <strong>Nil</strong></li><li></strong>Latest CKD code: <strong> Nil</strong></li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>'
from #indicator d
		inner join #classify c on c.PatID = d.PatID
		inner join #latestEgfrACR e on e.PatID = d.PatID
where d.code is not null

---------------------------------------------------------
-- Exit if we're just getting the indicator numbers -----
---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;

--set @refdate = dateadd(month, 2, @refdate)
--end --finish loop for indicator table

--------------------------------------------------------------------------------
---Create suggested exclusion improvement category
--------------------------------------------------------------------------------
insert into #suggestExclude(PatID, palliative, palDate, frail, frailDate, housebound, houseboundDate, threeInvites, threeInvitesDate)
select PatID, SUM(palliative) as palliative, MAX(palDate), SUM(frail) as frail, MAX(frailDate), SUM(housebound) as housebound, MAX(houseboundDate), SUM(threeInvites) as threeInvites, MAX(threeInvitesDate) from (

--Insert patients with a palliative care read code at ANY TIME
select a.PatID, 1 as palliative, MAX(EntryDate) as palDate, 0 as frail, NULL as frailDate, 0 as housebound, NULL as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate from SIR_ALL_Records as a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('8CM1.','8CM10','8CM1000','8CM11','8CM1100','8CM12','8CM13','8CM1300','8CM14','8CM1400','8CM16','8CM17','8CM18','8CM4.','8CME.','8CMQ.','8CMW3','8CMW300','8CMb.','G870.','9367.','9EB5.','9G8..','9K9..','9NNd.','9NNf0','9Ng7.','9NgD.','9c0L0','9c0M.','9c0N.','9c0P.','ZV57C','ZV57C00','1Z01.','2JE..','8B2a.','8BA2.','8BAP.','8BAS.','8BAT.','8BAe.','8BJ1.','8H6A.','8H7L.','8H7g.','8HH7.','8IEE.')
and EntryDate < @refdate
group by a.PatID

union

--Insert patients with a frailty read code at ANY TIME
select a.PatID, 0 as palliative, NULL as paldate, 1 as frail, MAX(EntryDate) as frailDate, 0 as housebound, NULL as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate from SIR_ALL_Records as a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode like '2Jd%' or ReadCode in ('38QI.','38GD.','69D9.','38Qk.','38DW.','ZQ3T.','HNGNQRF75')
and EntryDate < @refdate
group by a.PatID

union

--Insert patients with a housebound read code at ANY TIME and no non-housebound code afterwards
SELECT c.PatID, 0 as palliative, NULL as paldate, 0 as frail, NULL as frailDate, 1 as housebound, c.house as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate FROM
-----select most recent housebound code
(
	(SELECT PatID, MAX(EntryDate) AS house FROM SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
          WHERE ReadCode in ('13CA.','13CV.','6AG..')
	and EntryDate < @refdate
	GROUP BY PatID) as c
-----select no 'not housebound' code afterwards
     LEFT OUTER JOIN
		(SELECT PatID, MAX(EntryDate) AS house FROM SIR_ALL_Records
			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
			WHERE ReadCode IN ('13CW.')
     and EntryDate < @refdate
     GROUP BY PatID) AS B ON c.PatID = B.PatID
)
WHERE B.house IS NULL OR B.house < c.house

union

--Insert patients with 3 CKD invites since the lastest April date
select a.PatID, 0 as palliative, NULL as paldate, 0 as frail, NULL as frailDate, 0 as housebound, NULL as houseboundDate, 1 as threeInvites, MAX(EntryDate) as threeInvitesDate from SIR_ALL_Records a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('9Ot2.')
and
(
	(
		month(@refdate) >= 4 and month(EntryDate)>=4 and year(EntryDate)=year(@refdate)
	)

	OR

	(
		(
			month(@refdate) < 4
		)

		AND

		(
			(
				month(EntryDate)>=4 and year(EntryDate)=year(@refdate)-1
			)

			OR

			(
				month(EntryDate)<4 and year(EntryDate)=year(@refdate)
			)
		)
	)
)
and EntryDate < @refdate
group by a.PatID

--Close #suggestExclude table
) sub
group by sub.PatID;
--0s full SIR

-------------------------------------------------------------------------------------
---Create improvement analytic categories + associated actions (one query per action)
-------------------------------------------------------------------------------------
--Possibilities:
--Add code
	-- pts with known ACR
	-- pts without ACR
--ACR test (those without ACR)
--Suggest exclude

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
--CREATE TABLE #patActions
--	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #patActions

--ADD CODE
--Add code -- pts with known ACR
select d.PatID, 'ckd.diagnosis.undiagnosed', 'addCode' as actionCat,
--		'addCodeAcrKnown' as reasonCat,
		1 as reasonNumber,
		@ptPercPoints as pointsPerAction,
		4 as priority,
		'Add code ' + c.correct_read as actionText,
		'Reasoning<ul><li>Latest eGFR:<strong> ' + Str(e.egfrMax) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '<li></strong>Latest ACR: <strong>' + Str(e.acrMax) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestAcrDate, 3) + '<li></strong>Latest CKD code: <strong> Nil</strong></li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>' as supportingText
	from #indicator d
		inner join #classify c on c.PatID = d.PatID
		inner join #latestEgfrACR e on e.PatID = d.PatID
	where d.code is null and d.correct in ('G3a A1', 'G3a A2', 'G3a A3', 'G3b A1', 'G3b A2', 'G3b A3', 'G4 A1', 'G4 A2', 'G4 A3', 'G5 A1', 'G5 A2', 'G5 A3') and d.indicator = 'wrong'

union
--Add code -- pts with UNknown ACR
select d.PatID, 'ckd.diagnosis.undiagnosed', 'addCode' as actionCat,
--		'addCodeAcrUnknown' as reasonCat,
		1 as reasonNumber,
		@ptPercPoints as pointsPerAction,
		4 as priority,
		'Add code ' + c.correct_read as actionText,
		'Reasoning<ul><li>Latest eGFR:<strong> ' + Str(e.egfrMax) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '<li>Latest ACR: <strong>Nil</strong></li><li></strong>Latest CKD code: <strong> Nil</strong></li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>' as supportingText
	from #indicator d
		inner join #classify c on c.PatID = d.PatID
		inner join #latestEgfrACR e on e.PatID = d.PatID
	where d.code is null and d.correct in ('G3a', 'G3b', 'G4', 'G5') and d.indicator = 'wrong'

union
--ACR TEST
--ACR test (those without ACR)
select d.PatID, 'ckd.diagnosis.undiagnosed', 'acrTest' as actionCat,
--		'acrTest' as reasonCat,
		1 as reasonNumber,
		@ptPercPoints as pointsPerAction,
		4 as priority,
		'Offer ACR test' as actionText,
		'Reasoning<ul><li>This patient has undiagnosed CKD (see above)<li>They do not have an ACR reading in their record<li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>' as supportingText
	from #indicator d
	left outer join (
		select PatID from SIR_ALL_Records
		where ReadCode = '9RX..'
		and EntryDate > DATEADD(month, -12, @refdate)
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = d.PatID
	where
		d.correct in ('G3a','G3b','G4','G5') and
		d.code is null and
		d.indicator = 'wrong'
		and sub.PatID is null

union
--SUGGEST EXCLUDE CATEGORY
---suggestExclude - palliative
select d.PatID, 'ckd.diagnosis.undiagnosed', 'suggestExclude' as actionCat,
--	'suggestExcludePal' as reasonCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	4 as priority,
	'Add CKD exception code 9hE0. (palliative) [#9hE0.]' as actionText,
	'Reasoning<ul><li><strong>Palliative care</strong> code on <strong>' + CONVERT(VARCHAR, l.palDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.palliative = 1) and d.indicator = 'wrong'

union
---suggestExclude - frail
select d.PatID, 'ckd.diagnosis.undiagnosed', 'suggestExclude' as actionCat,
--	'suggestExcludeFrail' as reasonCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	4 as priority,
	'Add CKD exception code 9hE0. (frail) [#9hE0.]' as actionText,
	'Reasoning<ul><li><strong>Frailty</strong> code on <strong>' + CONVERT(VARCHAR, l.frailDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.frail = 1) and d.indicator = 'wrong'

union
---suggestExclude - housebound
select d.PatID, 'ckd.diagnosis.undiagnosed', 'suggestExclude' as actionCat,
--	'suggestExcludeHouse' as reasonCat,
	@ptPercPoints as pointsPerAction,
	1 as reasonNumber,
	4 as priority,
	'Add CKD exception code 9hE0. (housebound) [#9hE0.]' as actionText,
	'Reasoning<ul><li><strong>Housebound</strong> code on <strong>' + CONVERT(VARCHAR, l.houseboundDate, 3) + '</strong> (and no ''not housebound'' code afterwards)</li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.housebound = 1) and d.indicator = 'wrong'

union
---suggestExclude - three invites
select d.PatID, 'ckd.diagnosis.undiagnosed', 'suggestExclude' as actionCat,
--	'suggestExclude3Invites' as reasonCat,
	@ptPercPoints as pointsPerAction,
	1 as reasonNumber,
	4 as priority,
	'Add CKD exception code 9hE.. (3 invites) [#9hE..]' as actionText,
	'Reasoning<ul><li><strong>Three invites for CKD monitoring</strong> code on <strong>' + CONVERT(VARCHAR, l.threeInvitesDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.threeInvites = 1) and d.indicator = 'wrong'

--0s full SIR

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text](indicatorId, textId, text)
values
('ckd.diagnosis.undiagnosed','name','CKD diagnosis'),
('ckd.diagnosis.undiagnosed','tabText','CKD diagnose'),
('ckd.diagnosis.undiagnosed','description','<strong>Description:</strong> Patients with a diagnosis of CKD (Stage 3 or above) based on their <a target=''_blank'' href=''http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2''>eGFR and ACR readings</a>. <br> <strong>Eligible patients:</strong> Patients with recent eGFR readings persistently less than 60 mL/min/1.73 m2 who do not have an exclusion code. <br> <strong>Correct patients:</strong> Patients who have a diagnostic code of CKD stage 3 or above.'),
('ckd.diagnosis.undiagnosed','tagline','of your patients with CKD <a href=''http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2'' target=''_blank''>according to their latest eGFR and/or ACR readings</a> have a CKD code in their records.'),
('ckd.diagnosis.undiagnosed','positiveMessage','Well done! For tips on how to improve further, look through the recommended improvement actions on this page and for each patient.'),
('ckd.diagnosis.undiagnosed','valueId','eGFR'),
('ckd.diagnosis.undiagnosed','valueName','Latest eGFR'),
('ckd.diagnosis.undiagnosed','dateORvalue','value'),
('ckd.diagnosis.undiagnosed','valueSortDirection','asc'),
('ckd.diagnosis.undiagnosed','tableTitle','All patients with improvement opportunities'),
('ckd.diagnosis.undiagnosed','opportunities.addCode.name','Add a diagnostic code'),
('ckd.diagnosis.undiagnosed','opportunities.addCode.description','Patients who have CKD <a href=''http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2'' target=''_blank''>according to their latest eGFR and/or ACR readings</a> but have no CKD code in their record.'),
('ckd.diagnosis.undiagnosed','opportunities.addCode.positionInBarChart','1'),
('ckd.diagnosis.undiagnosed','opportunities.acrTest.name','ACR missing'),
('ckd.diagnosis.undiagnosed','opportunities.acrTest.description','Patients with a CKD code who do not have an ACR test result in their record to enable accurate <a href=''http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2'' target=''_blank''>CKD diagnosis</a>.'),
('ckd.diagnosis.undiagnosed','opportunities.acrTest.positionInBarChart','2'),
('ckd.diagnosis.undiagnosed','opportunities.suggestExclude.name','Suggest exclude'),
('ckd.diagnosis.undiagnosed','opportunities.suggestExclude.description','Patients with a CKD code who may <strong>benefit from being excluded</strong> from CKD quality indicators.'),
('ckd.diagnosis.undiagnosed','opportunities.suggestExclude.positionInBarChart',	'3')
