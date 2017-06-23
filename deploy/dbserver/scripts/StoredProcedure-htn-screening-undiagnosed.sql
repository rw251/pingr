									--TO RUN AS STORED PROCEDURE--
--IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.htn.undiagnosed.screening') DROP PROCEDURE [pingr.htn.undiagnosed.screening];
--GO
--CREATE PROCEDURE [pingr.htn.undiagnosed.screening] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
--AS
--SET NOCOUNT ON

									--TO TEST ON THE FLY--
use PatientSafety_Records_Test
declare @refdate VARCHAR(10);
declare @JustTheIndicatorNumbersPlease bit;
set @refdate = '2016-11-17';
set @JustTheIndicatorNumbersPlease= 0;

-----------------------------------------------------------------------------------
--DEFINE ELIGIBLE POPULATION, EXCLUSIONS, DENOMINATOR, AND NUMERATOR --------------
-----------------------------------------------------------------------------------
--DEFINE ELIGIBLE POPULATION FIRST
--THEN CREATE TEMP TABLES FOR EACH COLUMN OF DATA NEEDED, FROM THE ELIGIBLE POP
--COMBINE TABLES TOGETHER THAT NEED TO BE QUERIED TO CREATE NEW TABLES
--THEN COMBINE ALL TABLES TOGETHER INTO ONE BIG TABLE TO BE QUERIED IN FUTURE
-----------------------------------------------------------------------------------
declare @achieveDate datetime;
set @achieveDate = (select case
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,YEAR(@refdate)) + '-03-31' --31st March
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,(YEAR(@refdate) + 1)) + '-03-31' end); --31st March

--#over40alive
IF OBJECT_ID('tempdb..#over40alive') IS NOT NULL DROP TABLE #over40alive
CREATE TABLE #over40alive (PatID int, age int);
insert into #over40alive (PatID, age)
select patid, YEAR(@achieveDate) - year_of_birth as age from dbo.patients as c
where ((YEAR(@achieveDate) - year_of_birth) > 39)
and dead = 0
	
--#latestSbp
IF OBJECT_ID('tempdb..#latestSbp') IS NOT NULL DROP TABLE #latestSbp
CREATE TABLE #latestSbp (PatID int, latestSbpDate date, latestSbp int, latestSbpSource varchar(12));
insert into #latestSbp
select s.PatID, latestSbpDate, max(CodeValue) as latestSbp, max(Source) as latestSbpSource from SIR_ALL_Records as s
	inner join (
	-- find latest BP
		select PatID, MAX(EntryDate) as latestSbpDate  from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'sbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestSbpDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'sbp')
and s.PatID in (select PatID from #over40alive)
group by s.PatID, latestSbpDate

--#latestDbp
IF OBJECT_ID('tempdb..#latestDbp') IS NOT NULL DROP TABLE #latestDbp
CREATE TABLE #latestDbp (PatID int, latestDbpDate date, latestDbp int, latestDbpSource varchar(12));
insert into #latestDbp
select s.PatID, latestDbpDate, max(CodeValue) as latestDbp, max(Source) as latestDbpSource from SIR_ALL_Records as s
	inner join (
	-- find latest BP
		select PatID, MAX(EntryDate) as latestDbpDate  from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDbpDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dbp')
and s.PatID in (select PatID from #over40alive)
group by s.PatID, latestDbpDate

--#latestHtnCode
IF OBJECT_ID('tempdb..#latestHtnCode') IS NOT NULL DROP TABLE #latestHtnCode
CREATE TABLE #latestHtnCode (PatID int, latestHtnCodeDate date, latestHtnCodeMin varchar(512), latestHtnCodeMax varchar(512), latestHtnCode varchar(512));
insert into #latestHtnCode (PatID, latestHtnCodeDate, latestHtnCodeMin, latestHtnCodeMax, latestHtnCode)
select s.PatID, latestHtnCodeDate, MIN(Rubric) as latestHtnCodeMin, MAX(Rubric) as latestHtnCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode in (select code from codeGroups where [group] = 'htnQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode  in (select code from codeGroups where [group] = 'htnQof')
group by s.PatID, latestHtnCodeDate

--#latestHtnPermExCode
IF OBJECT_ID('tempdb..#latestHtnPermExCode') IS NOT NULL DROP TABLE #latestHtnPermExCode
CREATE TABLE #latestHtnPermExCode (PatID int, latestHtnPermExCodeDate date, latestHtnPermExCodeMin varchar(512), latestHtnPermExCodeMax varchar(512),
	latestHtnPermExCode varchar(512));
insert into #latestHtnPermExCode
select s.PatID, latestHtnPermExCodeDate, MIN(Rubric) as latestHtnPermExCodeMin, MAX(Rubric) as latestHtnPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnPermExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode  in (select code from codeGroups where [group] = 'htnPermEx')
group by s.PatID, latestHtnPermExCodeDate

--#latestRegisteredCode
--codes relating to patient registration
IF OBJECT_ID('tempdb..#latestRegisteredCode') IS NOT NULL DROP TABLE #latestRegisteredCode
CREATE TABLE #latestRegisteredCode (PatID int, latestRegisteredCodeDate date, latestRegisteredCodeMin varchar(512), latestRegisteredCodeMax varchar(512),
	latestRegisteredCode varchar(512));
insert into #latestRegisteredCode
	(PatID, latestRegisteredCodeDate, latestRegisteredCodeMin, latestRegisteredCodeMax, latestRegisteredCode)
select s.PatID, latestRegisteredCodeDate, MIN(Rubric) as latestRegisteredCodeMin, MAX(Rubric) as latestRegisteredCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestRegisteredCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestRegisteredCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode in (select code from codeGroups where [group] = 'registered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestRegisteredCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode  in (select code from codeGroups where [group] = 'registered')
group by s.PatID, latestRegisteredCodeDate

--#latestDeregCode
--codes relating to patient DEregistration
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDeregCode') IS NOT NULL DROP TABLE #latestDeregCode
CREATE TABLE #latestDeregCode (PatID int, latestDeregCodeDate date, latestDeregCodeMin varchar(512), latestDeregCodeMax varchar(512),
	latestDeregCode varchar(512));
insert into #latestDeregCode
select s.PatID, latestDeregCodeDate, MIN(Rubric) as latestDeregCodeMin, MAX(Rubric) as latestDeregCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDeregCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeregCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
group by s.PatID, latestDeregCodeDate

--#latestDeadCode
--codes relating to patient death
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDeadCode') IS NOT NULL DROP TABLE #latestDeadCode
CREATE TABLE #latestDeadCode (PatID int, latestDeadCodeDate date, latestDeadCodeMin varchar(512), latestDeadCodeMax varchar(512),
	latestDeadCode varchar(512));
insert into #latestDeadCode
select s.PatID, latestDeadCodeDate, MIN(Rubric) as latestDeadCodeMin, MAX(Rubric) as latestDeadCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDeadCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeadCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode in (select code from codeGroups where [group] = 'dead')
group by s.PatID, latestDeadCodeDate

--#latestCode
--codes relating to patient death
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestCode') IS NOT NULL DROP TABLE #latestCode
CREATE TABLE #latestCode (PatID int, latestCodeDate date, latestCode varchar(512));
insert into #latestCode
select s.PatID, latestCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #over40alive)
		and ReadCode like '%'
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCodeDate = s.EntryDate
where s.PatID in (select PatID from #over40alive)
and ReadCode like '%'
group by s.PatID, latestCodeDate

--#exclusions
IF OBJECT_ID('tempdb..#exclusions') IS NOT NULL DROP TABLE #exclusions
CREATE TABLE #exclusions
	(PatID int, htnExclude int, permExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int);
insert into #exclusions
select a.PatID,
	case when latestHtnCodeDate is not null then 1 else 0 end as htnExclude,
	case when latestHtnPermExCodeDate is not null then 1 else 0 end as permExclude,
	case when latestRegisteredCodeDate > DATEADD(month, -3, @achievedate) then 1 else 0 end as regCodeExclude, -- Registration date: > achievement date - 9/12 (from CKD ruleset_INLIQ_v32.0)
	case when latestDeregCodeDate > latestCodeDate then 1 else 0 end as deRegCodeExclude, -- Exclude patients with deregistered codes AFTER their latest CKD 35 code
	case when latestDeadCodeDate > latestCodeDate then 1 else 0 end as deadCodeExclude -- Exclude patients with dead codes after their latest CKD35 code
from #over40alive as a
	left outer join (select PatID, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
	left outer join (select PatID, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
	left outer join (select PatID, latestDeadCodeDate from #latestDeadCode) j on j.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCodeDate from #latestHtnPermExCode) h on h.PatID = a.PatID
	left outer join (select PatID, latestHtnCodeDate from #latestHtnCode) i on i.PatID = a.PatID
	left outer join (select PatID, latestCodeDate from #latestCode) l on l.PatID = a.PatID
	
--#denominator
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
select a.PatID,
	case when htnExclude = 0 and permExclude = 0 and regCodeExclude  = 0
		and deRegCodeExclude  = 0 and deadCodeExclude = 0 
		then 1 else 0 end as denominator
from #over40alive as a
	left outer join (select PatID, htnExclude, regCodeExclude,
					deRegCodeExclude, deadCodeExclude, permExclude from #exclusions) b on b.PatID = a.PatID

--#numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID,
	case 
		when denominator = 1 and (latestSbpDate > DATEADD(year, -5, @refdate)) and (latestDbpDate > DATEADD(year, -5, @refdate)) then 1 
	else 0 
	end as numerator
from #over40alive as a
	left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
	left outer join (select PatID, latestSbpDate from #latestSbp) d on d.PatID = a.PatID
	left outer join (select PatID, latestDbpDate from #latestDbp) e on e.PatID = a.PatID

--#eligiblePopulationAllData
--all data from above combined into one table, plus numerator column
IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (
	PatID int,
	latestSbpDate date, latestSbp int, latestSbpSource varchar(12),
	latestDbpDate date, latestDbp int, latestDbpSource varchar(12),
	latestHtnCodeDate date, latestHtnCode varchar(512),
	latestHtnPermExCode varchar(512), latestHtnPermExCodeDate date,
	latestRegisteredCode varchar(512), latestRegisteredCodeDate date,
	latestDeregCode varchar(512), latestDeregCodeDate date,
	latestDeadCode varchar(512), latestDeadCodeDate date,
	latestCode varchar(512), latestCodeDate date,
	htnExclude int, permExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int,
	denominator int,
	numerator int);
insert into #eligiblePopulationAllData
select 
	a.PatID,
	latestSbpDate, latestSbp, latestSbpSource,
	latestDbpDate, latestDbp, latestDbpSource,
	latestHtnCodeDate, latestHtnCode,
	latestHtnPermExCode, latestHtnPermExCodeDate,
	latestRegisteredCode, latestRegisteredCodeDate,
	latestDeregCode, latestDeregCodeDate,
	latestDeadCode, latestDeadCodeDate,
	latestCode, latestCodeDate,
	htnExclude, permExclude, regCodeExclude, deRegCodeExclude, deadCodeExclude,
	denominator,
	numerator
from #over40alive as a
		left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestRegisteredCode, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) g on g.PatID = a.PatID
		left outer join (select PatID, htnExclude, permExclude, regCodeExclude, deRegCodeExclude,
						deadCodeExclude from #exclusions) u on u.PatID = a.PatID
		left outer join (select PatID, denominator from #denominator) v on v.PatID = a.PatID
		left outer join (select PatID, numerator from #numerator) w on w.PatID = a.PatID
		left outer join (select PatID, latestHtnCodeDate, latestHtnCode from #latestHtnCode) x on x.PatID = a.PatID
		left outer join (select PatID, latestSbpDate, latestSbp, latestSbpSource from #latestSbp) ii on ii.PatID = a.PatID
		left outer join (select PatID, latestDbpDate, latestDbp, latestDbpSource from #latestDbp) jj on jj.PatID = a.PatID
		left outer join (select PatID, latestCode, latestCodeDate from #latestCode) kk on kk.PatID = a.PatID

					-----------------------------------------------------------------------------
					---------------------GET ABC (TOP 10% BENCHMARK)-----------------------------
					-----------------------------------------------------------------------------
declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 sum(case when numerator = 1 then 1.0 else 0.0 end) / SUM(case when denominator = 1 then 1.0 else 0.0 end) as perc from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
	having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0
	order by perc desc) sub);

					-----------------------------------------------------------------------------
					--DECLARE NUMERATOR, INDICATOR AND TARGET FROM DENOMINATOR TABLE-------------
					-----------------------------------------------------------------------------
declare @indicatorScore float;
set @indicatorScore = (select sum(case when numerator = 1 then 1 else 0 end)/sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData);
declare @target float;
set @target = 0.80;
declare @numerator int;
set @numerator = (select sum(case when numerator = 1 then 1 else 0 end) from #eligiblePopulationAllData);
declare @denominator int;
set @denominator = (select sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData);


									--TO RUN AS STORED PROCEDURE--
--insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
insert into #indicator

select 'htn.undiagnosed.screening', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
	sum(case when numerator = 1 then 1 else 0 end) as numerator, 
	sum(case when denominator = 1 then 1 else 0 end) as denominator, @target as target, @abc 
from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID;

									----------------------------------------------
									-------POPULATE MAIN DENOMINATOR TABLE--------
									----------------------------------------------
									--TO RUN AS STORED PROCEDURE--
--insert into [output.pingr.denominators](PatID, indicatorId, why)


									--TO TEST ON THE FLY--
IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max));
insert into #denominators

select PatID, 'htn.undiagnosed.screening',
case
	when numerator = 1 then
		'<li>Patient &ge; 40, not on the hypertension register, and has had a blood pressure recorded in the last 5 years.</li>' +
		case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end
	when numerator = 0 then 
		'<li>Patient &ge; 40, not on the hypertension register, and has <strong>not</strong> had a blood pressure recorded in the last 5 years.</li>'
	else ''
end	
from #eligiblePopulationAllData 
where denominator = 1;

									----------------------------------------------
									-------DEFINE % POINTS PER PATIENT------------
									----------------------------------------------

declare @ptPercPoints float;
set @ptPercPoints = 
(select 100 / SUM(case when denominator = 1 then 1.0 else 0.0 end) 
from #eligiblePopulationAllData);

								---------------------------------------------------------
								-- Exit if we're just getting the indicator numbers -----
								---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;


--#numberOfF2fCodesInLastYear
IF OBJECT_ID('tempdb..#numberOfF2fCodesInLastYear') IS NOT NULL DROP TABLE #numberOfF2fCodesInLastYear
CREATE TABLE #numberOfF2fCodesInLastYear
	(PatID int, numberOfF2fCodesInLastYear int);
insert into #numberOfF2fCodesInLastYear
select PatID, count (*) from SIR_ALL_Records
where
(ReadCode like '2%'
or ReadCode like '6A%'
or ReadCode like '65%'
or ReadCode like '8B31[356]%'
or ReadCode like '8B3[3569ADEfilOqRxX]%'
or ReadCode in ('8BS3.')
or ReadCode like '8H[4-8]%'
or ReadCode like '94Z%'
or ReadCode like '9N1C%'
or ReadCode like '9N21%'
or ReadCode in ('9kF1.','9kR..','9HB5.')
or ReadCode like '9H9%')
and EntryDate > DATEADD(year, -1, @refdate)
and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by PatID

--#numberOfPxInLastYear
IF OBJECT_ID('tempdb..#numberOfPxInLastYear') IS NOT NULL DROP TABLE #numberOfPxInLastYear
CREATE TABLE #numberOfPxInLastYear
	(PatID int, numberOfPxInLastYear int);
insert into #numberOfPxInLastYear
select PatID, count (*) from SIR_ALL_Records
where
ReadCode like '[abcdefghijklmnopqrstuvwxyz]%'
and EntryDate > DATEADD(year, -1, @refdate)
and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by PatID

--#latestPrimCareContact
--codes relating to patient death
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestPrimCareContact') IS NOT NULL DROP TABLE #latestPrimCareContact
CREATE TABLE #latestPrimCareContact (PatID int, latestPrimCareContactDate date, latestPrimCareContact varchar(512));
insert into #latestPrimCareContact
select s.PatID, latestPrimCareContactDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPrimCareContactDate from SIR_ALL_Records
		where PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		and Source !='salfordt' --not hospital code
		and ReadCode not in (select code from codeGroups where [group] in ('occupations', 'admin', 'recordOpen', 'letterReceived', 'contactAttempt', 'dna')) --not admin code
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPrimCareContactDate = s.EntryDate
where s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
and Source !='salfordt' --not hospital code
and ReadCode not in (select code from codeGroups where [group] in ('occupations', 'admin', 'recordOpen', 'letterReceived', 'contactAttempt', 'dna')) --not admin code
group by s.PatID, latestPrimCareContactDate

--#impOppsData
--all data from above combined into one table
IF OBJECT_ID('tempdb..#impOppsData') IS NOT NULL DROP TABLE #impOppsData
CREATE TABLE #impOppsData
	(PatID int, numberOfF2fCodesInLastYear int, numberOfPxInLastYear int, latestPrimCareContactDate date, latestPrimCareContact varchar(512));
insert into #impOppsData
select a.PatID, numberOfF2fCodesInLastYear, numberOfPxInLastYear, latestPrimCareContactDate, latestPrimCareContact
from #eligiblePopulationAllData as a
		left outer join (select PatID, numberOfF2fCodesInLastYear from #numberOfF2fCodesInLastYear) b on b.PatID = a.PatID
		left outer join (select PatID, numberOfPxInLastYear from #numberOfPxInLastYear) c on c.PatID = a.PatID
		left outer join (select PatID, latestPrimCareContactDate, latestPrimCareContact from #latestPrimCareContact) d on d.PatID = a.PatID
where denominator = 1 and numerator = 0


							---------------------------------------------------------------
							----------------------PT-LEVEL ACTIONS-------------------------
							---------------------------------------------------------------
									--TO RUN AS STORED PROCEDURE--
--insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
CREATE TABLE #patActions
	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
insert into #patActions

--CHECK REGISTERED
select a.PatID,
	'htn.undiagnosed.screening' as indicatorId,
	'Registered?' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Check this patient is registered' as actionText,
	'Reasoning' +
		'<ul><li>No contact with your practice in the last year.</ul>' +
	'If <strong>not registered</strong> please add code <strong>92...</strong> [#92...] to their records.<br><br>' +
	'If <strong>dead</strong> please add code <strong>9134.</strong> [#9134.] to their records.<br><br>'
	as supportingText
from #impOppsData as a
	where
		latestPrimCareContactDate < DATEADD(year, -1, @refdate)

union
--REGULAR F2F CONTACT
select PatID,
	'htn.undiagnosed.screening' as indicatorId,
	'opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Check patient''s BP opportunistically' as actionText,
	'Reasoning' +
	'<ul>'+
	'<li>Patient &ge; 40, not on the hypertension register, and has <strong>not</strong> had a blood pressure recorded in the last 5 years.</li>'+
	'<li>They have had &ge; 3 face-to-face contacts with your surgery in the last year.</li>' +
	'<li>You may be able to opportunistically measure their BP next time they consult.</li>' +
	'</ul>'
	as supportingText
from #impOppsData
where numberOfF2fCodesInLastYear > 2

--REGULAR MEDICATION
select PatID,
	'htn.undiagnosed.screening' as indicatorId,
	'prescription' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Remind patient to get BP measured on repeat prescription' as actionText,
	'Reasoning' +
	'<ul>'+
	'<li>Patient &ge; 40, not on the hypertension register, and has <strong>not</strong> had a blood pressure recorded in the last 5 years.</li>'+
	'<li>They''ve had &ge; 12 prescriptions in the last year, so sending them a message on their repeat prescription may work.</li>' +
	'</ul>'
	as supportingText
from #impOppsData
where numberOfPxInLastYear > 11


--****what about sending letter / text / phonecall - would they like pingr to do automatically?
--shouldn't be number of CODES in the last year - should be the number of DIFFERENT DATES - see number of copd exacerbations query

							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--'diagnose' actions
select c.pracID, 'diagnose', 
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'diagnose' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'diagnose' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'diagnose' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, indicatorId, actionCat from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--'abpm' actions
select c.pracID, 'abpm', 
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'abpm' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'abpm' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.screening' and actionCat = 'abpm' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, indicatorId, actionCat from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

							---------------------------------------------------------------
							----------------------ORG-LEVEL ACTIONS------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
--insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
insert into #orgActions

--CODE HTN
select
	pracID as pracID,
	'htn.undiagnosed.screening' as indicatorId,
	'Educate' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff of <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title="NICE Hypertension Diagnosis">NICE guidance on hypertension diagnosis</a>' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients with raised blood pressure at your practice meet criteria for a hypertension diagnosis, but <strong>are not</strong> on the hyptertension register.</li>' +
		'<li>This is important because currently the recorded prevalence of hypertension in Salford is lower than expected. Finding undiagnosed patients can help provide better care and increase your QOF scores.</li></ul>'
from #reasonProportions
where proportionId = 'diagnose' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--overview tab
('htn.undiagnosed.screening','name','Undiagnosed hypertension - BP measures'), --overview table name
('htn.undiagnosed.screening','tabText','HTN Diagnosis - Measures'), --indicator tab text
('htn.undiagnosed.screening','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients with persistently raised blood pressure that are on the hypertension register.<br>' + 
	'<strong>Why this is important:</strong> The recorded prevalence of hypertension in Salford is lower than expected. Finding undiagnosed patients can help provide better care and increase your QOF scores.<br>'),
--indicator tab
--summary text
('htn.undiagnosed.screening','tagline','of patients with persistently raised blood pressure are on the hypertension register.'),
('htn.undiagnosed.screening','positiveMessage', --tailored text
	case 
		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Target! To improve even further, look through the recommended actions on this page and for the patients below.'
		else 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
	end),
--pt lists
('htn.undiagnosed.screening','valueId','SBP'),
('htn.undiagnosed.screening','valueName','Latest SBP'),
('htn.undiagnosed.screening','dateORvalue','value'),
('htn.undiagnosed.screening','valueSortDirection','desc'),  -- 'asc' or 'desc'
('htn.undiagnosed.screening','tableTitle','All patients with persistently raised blood pressure <strong>not</strong> on the hypertension register'),

--imp opp charts
--based on actionCat

--EXPLANATORY CONDITION ABSENT
('htn.undiagnosed.screening','opportunities.diagnose.name','Hypertension diagnostic criteria met'),
('htn.undiagnosed.screening','opportunities.diagnose.description','Patients with persistently raised blood pressure who meet the criteria for hypertension diagnosis who are <strong>not</strong> on the hypertension register.'),
('htn.undiagnosed.screening','opportunities.diagnose.positionInBarChart','1'),

--EXPLANATORY CONDITION PRESENT
('htn.undiagnosed.screening','opportunities.abpm.name','Need ambulatory (or home) blood pressure monitoring'),
('htn.undiagnosed.screening','opportunities.abpm.description','Patients with persistently raised blood pressure who need ambulatory (or home) blood pressure monitoring to rule in or rule out a hypertension diagnosis.'),
('htn.undiagnosed.screening','opportunities.abpm.positionInBarChart','2');