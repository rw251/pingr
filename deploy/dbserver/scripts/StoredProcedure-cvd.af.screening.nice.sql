--v4 12/5/17
--removed reasons from pt-level actions so no duplication with other AF casefiding indicator

--v3 18/4/17
--enddate changed to 31/12 to align with TR's visits
--added evidence from NICE as per Shaun

--v2 18/4/17
--used perm tables for some of duplicated action queries instead

--The proportion of patients registered at the practice aged 65 years and over 
--who have been diagnosed with one or more of the following conditions: 
--hypertension, diabetes, CKD, PAD, stroke or COPD 
--and who have had a pulse rhythm assessment in the last 12 months.

									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.cvd.af.screening') DROP PROCEDURE [pingr.cvd.af.screening];
GO
CREATE PROCEDURE [pingr.cvd.af.screening] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

									--TO TEST ON THE FLY--
--use PatientSafety_Records_Test
--declare @refdate VARCHAR(10);
--declare @JustTheIndicatorNumbersPlease bit;
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;


declare @startDate datetime;
set @startDate = (select case
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-04-01' --1st April THIS YEAR
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-04-01' end); --1st April LAST YEAR

declare @endDate datetime;
set @endDate = (select case
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-12-31' --31st Dec THIS YEAR
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-12-31' end); --31st Dec LAST YEAR

declare @daysLeft int;
set @daysLeft = (select DATEDIFF(day,@refdate,@endDate))

										-----------------------
										--ELIGIBLE POPULATION--
										-----------------------
-->=64
--from TODAY
IF OBJECT_ID('tempdb..#over64') IS NOT NULL DROP TABLE #over64
CREATE TABLE #over64 (PatID int);
insert into #over64
select PatID from practiceList as a
where age > 64

--latestAfCode
IF OBJECT_ID('tempdb..#latestAfCode') IS NOT NULL DROP TABLE #latestAfCode
CREATE TABLE #latestAfCode (PatID int, latestAfCodeDate date, latestAfCode varchar(512));
insert into #latestAfCode
select s.PatID, latestAfCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'af')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'af')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestAfCodeDate

--latestAfTempExCode
IF OBJECT_ID('tempdb..#latestAfTempExCode') IS NOT NULL DROP TABLE #latestAfTempExCode
CREATE TABLE #latestAfTempExCode (PatID int, latestAfTempExCodeDate date, latestAfTempExCode varchar(512));
insert into #latestAfTempExCode
select s.PatID, latestAfTempExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfTempExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'afTempEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfTempExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'afTempEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestAfTempExCodeDate

--latestAfPermExCode
IF OBJECT_ID('tempdb..#latestAfPermExCode') IS NOT NULL DROP TABLE #latestAfPermExCode
CREATE TABLE #latestAfPermExCode (PatID int, latestAfPermExCodeDate date, latestAfPermExCode varchar(512));
insert into #latestAfPermExCode
select s.PatID, latestAfPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'afPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'afPermEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestAfPermExCodeDate

--latestHtnCode
IF OBJECT_ID('tempdb..#latestHtnCode') IS NOT NULL DROP TABLE #latestHtnCode
CREATE TABLE #latestHtnCode (PatID int, latestHtnCodeDate date, latestHtnCode varchar(512));
insert into #latestHtnCode
select s.PatID, latestHtnCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'htnQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'htnQof')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestHtnCodeDate

--latestHtnPermExCode
IF OBJECT_ID('tempdb..#latestHtnPermExCode') IS NOT NULL DROP TABLE #latestHtnPermExCode
CREATE TABLE #latestHtnPermExCode (PatID int, latestHtnPermExCodeDate date, latestHtnPermExCode varchar(512));
insert into #latestHtnPermExCode
select s.PatID, latestHtnPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestHtnPermExCodeDate

--latestDmCode
IF OBJECT_ID('tempdb..#latestDmCode') IS NOT NULL DROP TABLE #latestDmCode
CREATE TABLE #latestDmCode (PatID int, latestDmCodeDate date, latestDmCode varchar(512));
insert into #latestDmCode
select s.PatID, latestDmCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dm')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dm')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestDmCodeDate

--latestDmPermExCode
IF OBJECT_ID('tempdb..#latestDmPermExCode') IS NOT NULL DROP TABLE #latestDmPermExCode
CREATE TABLE #latestDmPermExCode (PatID int, latestDmPermExCodeDate date, latestDmPermExCode varchar(512));
insert into #latestDmPermExCode
select s.PatID, latestDmPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestDmPermExCodeDate

--latestCkdCode
IF OBJECT_ID('tempdb..#latestCkdCode') IS NOT NULL DROP TABLE #latestCkdCode
CREATE TABLE #latestCkdCode (PatID int, latestCkdCodeDate date, latestCkdCode varchar(512));
insert into #latestCkdCode
select s.PatID, latestCkdCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestCkdCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'ckd35')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCkdCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'ckd35')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestCkdCodeDate

--latestCkdPermExCode
IF OBJECT_ID('tempdb..#latestCkdPermExCode') IS NOT NULL DROP TABLE #latestCkdPermExCode
CREATE TABLE #latestCkdPermExCode (PatID int, latestCkdPermExCodeDate date, latestCkdPermExCode varchar(512));
insert into #latestCkdPermExCode
select s.PatID, latestCkdPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestCkdPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'ckdPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCkdPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'ckdPermEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestCkdPermExCodeDate

--latestPadCode
IF OBJECT_ID('tempdb..#latestPadCode') IS NOT NULL DROP TABLE #latestPadCode
CREATE TABLE #latestPadCode (PatID int, latestPadCodeDate date, latestPadCode varchar(512));
insert into #latestPadCode
select s.PatID, latestPadCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPadCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'padQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPadCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'padQof')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestPadCodeDate

--no padPermExCode exists

--latestStrokeCode
IF OBJECT_ID('tempdb..#latestStrokeCode') IS NOT NULL DROP TABLE #latestStrokeCode
CREATE TABLE #latestStrokeCode (PatID int, latestStrokeCodeDate date, latestStrokeCode varchar(512));
insert into #latestStrokeCode
select s.PatID, latestStrokeCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestStrokeCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'strokeQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestStrokeCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'strokeQof')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestStrokeCodeDate

--no strokePermExCode exists

--latestCopdCode
IF OBJECT_ID('tempdb..#latestCopdCode') IS NOT NULL DROP TABLE #latestCopdCode
CREATE TABLE #latestCopdCode (PatID int, latestCopdCodeDate date, latestCopdCode varchar(512));
insert into #latestCopdCode
select s.PatID, latestCopdCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'copdQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'copdQof')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestCopdCodeDate

--latestCopdPermExCode
IF OBJECT_ID('tempdb..#latestCopdPermExCode') IS NOT NULL DROP TABLE #latestCopdPermExCode
CREATE TABLE #latestCopdPermExCode (PatID int, latestCopdPermExCodeDate date, latestCopdPermExCode varchar(512));
insert into #latestCopdPermExCode
select s.PatID, latestCopdPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'copdPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'copdPermEx')
and s.PatID in (select PatID from #over64)
group by s.PatID, latestCopdPermExCodeDate

										-----------------------
										------DENOMINATOR------
										-----------------------
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int);
insert into #denominator
select a.PatID from #over64 as a 
left outer join (select * from #latestHtnCode) as b on b.PatID = a.PatID
left outer join (select * from #latestHtnPermExCode) as c on c.PatID = a.PatID
left outer join (select * from #latestDmCode) as d on d.PatID = a.PatID
left outer join (select * from #latestDmPermExCode) as e on e.PatID = a.PatID
left outer join (select * from #latestCkdCode) as f on f.PatID = a.PatID
left outer join (select * from #latestCkdPermExCode) as g on g.PatID = a.PatID
left outer join (select * from #latestPadCode) as h on h.PatID = a.PatID
left outer join (select * from #latestStrokeCode) as i on i.PatID = a.PatID
left outer join (select * from #latestCopdCode) as j on j.PatID = a.PatID
left outer join (select * from #latestCopdPermExCode) as k on k.PatID = a.PatID
left outer join (select * from #latestAfCode) as l on l.PatID = a.PatID
left outer join (select * from #latestAfPermExCode) as m on m.PatID = a.PatID
left outer join (select * from #latestAfTempExCode) as n on n.PatID = a.PatID
where 
	(
		(latestHtnCodeDate is not null and (latestHtnPermExCodeDate is null or latestHtnPermExCodeDate < latestHtnCodeDate))
		or 	(latestDmCodeDate is not null and (latestDmPermExCodeDate is null or latestDmPermExCodeDate < latestDmCodeDate))
		or 	(latestCkdCodeDate is not null and (latestCkdPermExCodeDate is null or latestCkdPermExCodeDate < latestCkdCodeDate))
		or	latestPadCodeDate is not null
		or	latestStrokeCodeDate is not null
		or 	(latestCopdCodeDate is not null and (latestCopdPermExCodeDate is null or latestCopdPermExCodeDate < latestCopdCodeDate))
	)
	and (latestAfCodeDate is null or (latestAfCodeDate < latestAfPermExCodeDate))
	and (latestAfTempExCodeDate is null or (latestAfTempExCodeDate < @startDate))

										-----------------------
										-------NUMERATOR-------
										-----------------------
--latestPulseRhythmCode
IF OBJECT_ID('tempdb..#latestPulseRhythmCode') IS NOT NULL DROP TABLE #latestPulseRhythmCode
CREATE TABLE #latestPulseRhythmCode (PatID int, latestPulseRhythmCodeDate date, latestPulseRhythmCode varchar(512));
insert into #latestPulseRhythmCode
select s.PatID, latestPulseRhythmCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPulseRhythmCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'pulseRhythm')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPulseRhythmCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'pulseRhythm')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestPulseRhythmCodeDate

--numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID, case when latestPulseRhythmCodeDate >= @startDate then 1 else 0 end 
from #denominator as a
left outer join (select * from #latestPulseRhythmCode) as b on b.PatID = a.PatID

					-----------------------------------------------------------------------------
					------------------------POPULATE INDICATOR TABLE-----------------------------
					-----------------------------------------------------------------------------
declare @target float;
set @target = 0.8;
declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 sum(case when numerator = 1 then 1.0 else 0.0 end) / sum(case when numerator = 0 then 1.0 else 0.0 end) as perc from #numerator as a
inner join ptPractice as b on a.PatID = b.PatID
group by b.pracID
having sum(case when numerator = 0 then 1.0 else 0.0 end) > 0
order by perc desc) sub);
declare @ptPercPoints float;
set @ptPercPoints = 
(select 100 / SUM(case when numerator = 0 then 1.0 else 0.0 end) 
from #numerator
having SUM(case when numerator = 0 then 1.0 else 0.0 end) > 0);

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'cvd.af.screening', b.pracID, CONVERT(char(10), @refdate, 126), 
sum(case when numerator = 1 then 1 else 0 end), sum(case when numerator in (0,1) then 1 else 0 end), null, @abc 
from #numerator as a
inner join ptPractice as b on a.PatID = b.PatID
group by b.pracID;

					-----------------------------------------------------------------------------
					------------------------POPULATE DENOMINATOR TABLE---------------------------
					-----------------------------------------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why, nextReviewDate)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max), nextReviewDate date);
--insert into #denominators

select a.PatID, 'cvd.af.screening',
		'<ul>'+
		'<li>Patient has:</li>'+
			'<ul>'+
				case when latestHtnCodeDate is not null then '<li>Hypertension</li>' else '' end+
				case when latestDmCodeDate is not null then '<li>Diabetes</li>' else '' end+
				case when latestCkdCodeDate is not null then '<li>CKD stage 3 or above</li>' else '' end+
				case when latestPadCodeDate is not null then '<li>Peripheral arterial disease</li>' else '' end+
				case when latestStrokeCodeDate is not null then '<li>Previous stroke</li>' else '' end+
				case when latestCopdCodeDate is not null then '<li>COPD</li>' else '' end+
			'</ul>'+
		case 
			when latestPulseRhythmCodeDate is null then '<li><strong>They have never had their pulse rhythm assessed.</li></strong>' 
			when latestPulseRhythmCodeDate is not null then '<li><strong>Latest pulse rhythm assessment was on ' + CONVERT(VARCHAR, latestPulseRhythmCodeDate, 3) + '.</li></strong>'
		end,
		DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from #numerator as a
left outer join (select * from #latestHtnCode) as b on b.PatID = a.PatID
left outer join (select * from #latestDmCode) as d on d.PatID = a.PatID
left outer join (select * from #latestCkdCode) as f on f.PatID = a.PatID
left outer join (select * from #latestPadCode) as h on h.PatID = a.PatID
left outer join (select * from #latestStrokeCode) as i on i.PatID = a.PatID
left outer join (select * from #latestCopdCode) as j on j.PatID = a.PatID
left outer join (select * from #latestPulseRhythmCode) as k on k.PatID = a.PatID
left outer join latestAnnualReviewCode l on l.PatID = a.PatID


								---------------------------------------------------------
								-- Exit if we're just getting the indicator numbers -----
								---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;

					-----------------------------------------------------------------------------
					--------------------------IMPROVEMENT OPPS DATA------------------------------
					-----------------------------------------------------------------------------

--latestPulseRateCode
IF OBJECT_ID('tempdb..#latestPulseRateCode') IS NOT NULL DROP TABLE #latestPulseRateCode
CREATE TABLE #latestPulseRateCode (PatID int, latestPulseRateCodeDate date, latestPulseRateCode varchar(512));
insert into #latestPulseRateCode
select s.PatID, latestPulseRateCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPulseRateCodeDate from SIR_ALL_Records
		where ReadCode like '242%'
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPulseRateCodeDate = s.EntryDate
where ReadCode like '242%'
and s.PatID in (select PatID from #numerator where numerator = 0)
group by s.PatID, latestPulseRateCodeDate

--latestBpCode
IF OBJECT_ID('tempdb..#latestBpCode') IS NOT NULL DROP TABLE #latestBpCode
CREATE TABLE #latestBpCode(PatID int, latestBpCodeDate date, latestBpCode varchar(512));
insert into #latestBpCode
select s.PatID, latestBpCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestBpCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] in ('bp','sbp','dbp'))
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestBpCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] in ('bp','sbp','dbp'))
and s.PatID in (select PatID from #numerator where numerator = 0)
group by s.PatID, latestBpCodeDate

							---------------------------------------------------------------
							----------------------PT-LEVEL ACTIONS-------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
--CREATE TABLE #patActions
--	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #patActions

--ALL PATIENTS
-->SEND LETTER
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Send letter' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Send letter to request pulse rhythm assessment using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		--'<li>Patient has:</li>'+
		--	'<ul>'+
		--		case when latestHtnCodeDate is not null then '<li>Hypertension</li>' else '' end+
		--		case when latestDmCodeDate is not null then '<li>Diabetes</li>' else '' end+
		--		case when latestCkdCodeDate is not null then '<li>CKD stage 3 or above</li>' else '' end+
		--		case when latestPadCodeDate is not null then '<li>Peripheral arterial disease</li>' else '' end+
		--		case when latestStrokeCodeDate is not null then '<li>Previous stroke</li>' else '' end+
		--		case when latestCopdCodeDate is not null then '<li>COPD</li>' else '' end+
		--	'</ul>'+
		--'<li>NICE recommends they should have their pulse rhythm assessed every 12 months to casefind AF.</li>'+
		case 
			when latestPulseRhythmCodeDate is null then '<li><strong>They have never had their pulse rhythm assessed.</strong></li>' 
			when latestPulseRhythmCodeDate is not null then '<li><strong>Latest pulse rhythm assessment was on ' + CONVERT(VARCHAR, latestPulseRhythmCodeDate, 3) + '.</strong></li>'
		end+
		'<li>Use code 243.. [243..] to record pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from #latestHtnCode) as b on b.PatID = a.PatID
left outer join (select * from #latestDmCode) as d on d.PatID = a.PatID
left outer join (select * from #latestCkdCode) as f on f.PatID = a.PatID
left outer join (select * from #latestPadCode) as h on h.PatID = a.PatID
left outer join (select * from #latestStrokeCode) as i on i.PatID = a.PatID
left outer join (select * from #latestCopdCode) as j on j.PatID = a.PatID
left outer join (select * from #latestPulseRhythmCode) as k on k.PatID = a.PatID
where numerator = 0

union
--NO PRIM CARE CONTACT IN THE LAST YEAR
-->CHECK REGISTERED
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Registered?' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Check this patient is registered' as actionText,
	'Reasoning' +
		'<ul><li>No contact with your practice in the last year.</li>' +
		'<li>If <strong>not registered</strong> please add code <strong>92...</strong> [92...] to their records.</li>' +
		'<li>If <strong>dead</strong> please add code <strong>9134.</strong> [9134.] to their records.</li></ul>'
	as supportingText
from #numerator as a
left outer join (select PatID, latestPrimCareContactDate from latestPrimCareContact) as b on b.PatID = a.PatID
where numerator = 0
and latestPrimCareContactDate < DATEADD(year, -1, @refdate)

union
--REGULAR F2F CONTACT
-->DO WHEN NEXT COMES IN
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on medical record to assess pulse rhythm at next face-to-face contact using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfF2fContactsInLastYear, 3) + ' face-to-face contacts with your practice in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, @daysLeft, 3) + ' days left until the end of the financial year.</li>'+
		'<li>Patient is expected to have ' + CONVERT(VARCHAR, (noOfF2fContactsInLastYear*@daysLeft/365), 3) + ' further face-to-face contacts with your practice before then.</li>'+
		'<li>You could put a note in their record to remind the next person to see them to assess their pulse rhythm.</li>'+
		'<li>Either as an alert when you open the record, or as a consultation note.</li>'+
		'<li>Use code 243.. [243..] to record pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from noOfF2fContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfF2fContactsInLastYear*@daysLeft/365) >= 1

union
--REGULAR MEDS - PUT ON PX
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Prescription note' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on repeat prescriptions to ask patient to book appointment for pulse rhythm assessment' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfMedContactsInLastYear, 3) + ' medication prescriptions from you in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, @daysLeft, 3) + ' days left until the end of the financial year.</li>'+
		'<li>Patient is expected to have ' + CONVERT(VARCHAR, (noOfMedContactsInLastYear*@daysLeft/365), 3) + ' further prescriptions from your practice before then.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from noOfMedContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfMedContactsInLastYear*@daysLeft/365) >= 1

union
--HASN'T YET HAD THEIR ANNUAL REVIEW
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on medical record to assess pulse rhythm at annual review using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has not yet had any annual reviews for their chronic diseases this financial year.</li>'+
		'<li>You could put a note in their record to remind the person who will do their annual review to assess their pulse rhythm.</li>'+
		'<li>Either as an alert when you open the record, or as a consultation note.</li>'+
		'<li>Use code 243.. [243..] to record the pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestAnnualReviewCode) as b on b.PatID = a.PatID
where numerator = 0
and latestAnnualReviewCodeDate < @startDate

union
--HASN'T YET HAD THEIR FLU VACC
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'flu vacc' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Assess pulse rhythm at upcoming flu vaccination using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient is eligible for flu vaccination (>64 years old).</li>'+
		'<li>They haven''t any allergies or refusals, and haven''t had their flu vaccination this year yet.</li>'+
		'<li>Patients are eligible for flu vaccinations from August onwards.</li>'+
		'<li>Use code 243.. [243..] to record the pulse rhythm .</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestFluVacc) as b on b.PatID = a.PatID
left outer join (select * from latestFluVaccTempEx) as c on c.PatID = a.PatID
left outer join (select * from latestFluVaccPermEx) as d on d.PatID = a.PatID
where numerator = 0
and (latestFluVaccDate is null or latestFluVaccDate < @refdate)
and (latestFluVaccTempExDate is null or latestFluVaccTempExDate < @startDate)
and (latestFluVaccPermExDate is null or latestFluVaccPermExDate < latestFluVaccDate)
and @daysLeft < 122 --only appears later than august to coincide with flu vacc season

union
--SUGGEST EXCLUDE
select a.PatID,
	'cvd.af.screening' as indicatorId,
	'Suggest exclude' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Exclude patient from AF casefinding indicators using code 9hF.. [9hF..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient is palliative care patient.</li>'+
		'<li>They had palliative care code in the last 12 months (''' + latestPalCode + ''') on ' + CONVERT(VARCHAR, latestPalCodeDate, 3) + '.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestPalCode) as b on b.PatID = a.PatID
left outer join (select * from latestPalPermExCode) as c on c.PatID = a.PatID
where numerator = 0
and latestPalCodeDate > DATEADD(year, -1, @refdate) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)

							---------------------------------------------------------------
							---------------ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--PTS WHO HAVE HAD PULSE RATE CHECKED SINCE START DATE
select c.pracID, 'pulseRateChecked', 
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= @startDate then 1.0 else 0.0 end)
	/
	SUM(case when numerator in (0,1) then 1.0 else 0.0 end),
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= @startDate then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= @startDate then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestPulseRateCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PTS WHO HAVE HAD BP CHECKED SINCE START DATE
select c.pracID, 'bpChecked', 
	SUM(case when numerator = 0 and latestBpCodeDate >= @startDate then 1.0 else 0.0 end)
	/
	SUM(case when numerator in (0,1) then 1.0 else 0.0 end),
	SUM(case when numerator = 0 and latestBpCodeDate >= @startDate then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestBpCodeDate >= @startDate then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestBpCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PTS WHO HAVE HAD ANNUAL REVIEWS SINCE START DATE
select c.pracID, 'annualReview', 
	SUM(case when numerator = 0 and latestAnnualReviewCodeDate >= @startDate then 1.0 else 0.0 end)
	/
	SUM(case when numerator in (0,1) then 1.0 else 0.0 end),
	SUM(case when numerator = 0 and (latestAnnualReviewCodeDate is null or latestAnnualReviewCodeDate < @startDate) then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and (latestAnnualReviewCodeDate is null or latestAnnualReviewCodeDate < @startDate) then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from latestAnnualReviewCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--flu clinics
select e.pracID, 'fluVaccs', 
	SUM(case when indicatorId = 'cvd.af.screening' and actionCat = 'flu vacc' then 1.0 else 0.0 end)
	/
	SUM(case when numerator in (0,1) then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'cvd.af.screening' and actionCat = 'flu vacc' then 1.0 else 0.0 end),	
	SUM(case when indicatorId = 'cvd.af.screening' and actionCat = 'flu vacc' then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as e on e.PatID = a.PatID
group by e.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0
and @daysLeft < 122 --only appears later than august to coincide with flu vacc season

							---------------------------------------------------------------
							----------------------ORG-LEVEL ACTIONS------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
--CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #orgActions

--REMIND STAFF TO CHECK RHYTHM DURING RATE
select
	pracID as pracID,
	'cvd.af.screening' as indicatorId,
	'pulse rate' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when measuring pulse rate to casefind AF' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment to casefind AF <strong>have</strong> had their pulse rate measured.</li>' +
		'<li>Measuring pulse rate is a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'pulseRateChecked' 

union
--REMIND STAFF TO CHECK RHYTHM DURING BP MEASUREMENTS
select
	pracID as pracID,
	'cvd.af.screening' as indicatorId,
	'bp measure' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when measuring blood pressure to casefind AF' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment to casefind AF <strong>have</strong> had their BP measured.</li>' +
		'<li>Measuring BP is a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'bpChecked' 

union
--REMIND STAFF TO CHECK RHYTHM DURING ANNUAL REVIEWS
select
	pracID as pracID,
	'cvd.af.screening' as indicatorId,
	'annual reviews' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when doing chronic disease annual reviews to casefind AF' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>All patients who require a pulse rhythm assessment to casefind AF (according to NICE) should <strong>also</strong> have a chronic disease annual review.</li>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment <strong>have not</strong> yet had their chronic disease annual review.</li>' +
		'<li>Chronic disease annual reviews are a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'annualReview' 

union
--ASSESS RHYTHM DURING FLU VACCS
select
	pracID as pracID,
	'cvd.af.screening' as indicatorId,
	'flu vaccs' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Assess pulse rhythm to casefind AF during flu vaccination clinics' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>All patients who require a pulse rhythm assessment to casefind AF (according to NICE) are <strong>also</strong> eligible for flu vaccinations.</li>'+
		'<li>Flu vaccination season runs from August onwards.</li>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment <strong>have not</strong> yet had their flu vaccination this year.</li>' +
		'<li>Flu vaccination clinics are good opportunities to assess patient''s pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'fluVaccs' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--OVERVIEW TAB
('cvd.af.screening','name','AF Casefinding 1: Patients with long-term conditions'), --overview table name
('cvd.af.screening','tabText','AF Casefinding 1: LTCs'), --indicator tab text
('cvd.af.screening','description', --'show more' on overview tab
	'<strong>Definition:</strong> The proportion of patients registered at the practice aged 65 years and over diagnosed with one or more of the following conditions: hypertension, diabetes, CKD, PAD, stroke or COPD, and have had a pulse rhythm assessment between '+ 
		case
			when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +
	' to ' +
		case		
			when MONTH(@refdate) <4 then '31st December ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '31st December ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +		
' inclusive.<br>'+
'<strong>Why this is important:</strong> See recommendation <a href=''https://www.nice.org.uk/guidance/cg180/chapter/1-Recommendations#diagnosis-and-assessment'' target=''_blank'' title=''NICE AF Guidelines''>1.1.1</a> from NICE guideline on atrial fibrillation, recommendations <a href=''https://www.nice.org.uk/guidance/cg127/chapter/1-Guidance#measuring-blood-pressure'' target=''_blank'' title=''NICE Hypertension Guidelines''>1.1.2 and 1.2.1</a> from NICE guideline on hypertension, recommendations <a href=''https://www.nice.org.uk/guidance/ng17/chapter/1-Recommendations#control-of-cardiovascular-risk'' target=''_blank'' title=''NICE DM T1 Guidelines''>1.13.1 (type 1)</a> and <a href=''https://www.nice.org.uk/guidance/ng28/chapter/1-Recommendations#blood-pressure-management-2'' target=''_blank'' title=''NICE DM T2 Guidelines''>1.4.1 (type 2)</a> from NICE guidelines on type 1 and type 2 diabetes in adults, recommendation <a href=''https://www.nice.org.uk/guidance/CG182/chapter/1-Recommendations#pharmacotherapy'' target=''_blank'' title=''NICE CKD Guidelines''>1.6.1</a> from NICE guideline on CKD, recommendation <a href=''https://www.nice.org.uk/guidance/cg147/chapter/1-Guidance#secondary-prevention-of-cardiovascular-disease-in-people-with-peripheral-arterial-disease'' target=''_blank'' title=''NICE PAD Guidelines''>1.2.1</a> from NICE guideline on PAD and recommendation <a href=''https://www.nice.org.uk/guidance/CG68/chapter/1-Guidance#maintenance-or-restoration-of-homeostasis'' target=''_blank'' title=''NICE Stroke Guidelines''>1.5.3.2</a> from NICE guideline on stroke.'),
--INDICATOR TAB
--summary text
('cvd.af.screening','tagline',' of patients aged 65 years and over diagnosed with one or more of the following conditions: hypertension, diabetes, CKD, PAD, stroke or COPD have had a pulse rhythm assessment between '+ 
	case
		when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
		when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
	end +
	' to ' +
		case		
			when MONTH(@refdate) <4 then '31st December ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '31st December ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +		
' inclusive.'),
('cvd.af.screening','positiveMessage', --tailored text
null),
	--pt lists
('cvd.af.screening','valueId','pulseRhythm'),
('cvd.af.screening','valueName','Latest pulse rhythm'),
('cvd.af.screening','dateORvalue','date'),
('cvd.af.screening','valueSortDirection','asc'),  -- 'asc' or 'desc'
('cvd.af.screening','showNextReviewDateColumn', 'true'),
('cvd.af.screening','tableTitle','All patients who require pulse rhythm assessment'),

	--imp opp charts (based on actionCat)
--ALL PATIENTS
-->SEND LETTER
('cvd.af.screening','opportunities.Send letter.name','Send letter to request pulse rhythm assessment'),
('cvd.af.screening','opportunities.Send letter.description','Patients who require pulse rhythm assessment. You may wish to send them a letter.'),
('cvd.af.screening','opportunities.Send letter.positionInBarChart','1'),

--NO PRIM CARE CONTACT IN THE LAST YEAR
-->CHECK REGISTERED
('cvd.af.screening','opportunities.Registered?.name','Check registered'),
('cvd.af.screening','opportunities.Registered?.description','Patients who have not had contact with your practice in the last 12 months - are they still registered with you?'),
('cvd.af.screening','opportunities.Registered?.positionInBarChart','4'),

--OPPORTUNISTIC
('cvd.af.screening','opportunities.Opportunistic.name','Opportunistic rhythm assessment'),
('cvd.af.screening','opportunities.Opportunistic.description','Patients who have regular contact with your practice. You may wish to put a note in their record to remind the next person who sees them assess their pulse rhythm.'),
('cvd.af.screening','opportunities.Opportunistic.positionInBarChart','2'),

--FLU VACC
('cvd.af.screening','opportunities.flu vacc.name','Flu vaccinations'),
('cvd.af.screening','opportunities.flu vacc.description','Patients who are due to have a flu vaccination this year. You may wish to assess their pulse rhythm when you give them their flu vaccination.'),
('cvd.af.screening','opportunities.flu vacc.positionInBarChart','5'),

--REGULAR MEDS - PUT ON PX
('cvd.af.screening','opportunities.Prescription note.name','Repeat medication note'),
('cvd.af.screening','opportunities.Prescription note.description','Patients who regularly get repeat medications from you. You may wish to put a note on their prescription to make an appointment to assess their pulse rhythm.'),
('cvd.af.screening','opportunities.Prescription note.positionInBarChart','3'),

--SUGGEST EXCLUDE
('cvd.af.screening','opportunities.Suggest exclude.name','Exclude?'),
('cvd.af.screening','opportunities.Suggest exclude.description','Patients who may benefit being excluded from this indicator e.g. palliative care patients.'),
('cvd.af.screening','opportunities.Suggest exclude.positionInBarChart','6');
