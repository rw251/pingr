									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.htn.treatment.bp') DROP PROCEDURE [pingr.htn.treatment.bp];
GO
CREATE PROCEDURE [pingr.htn.treatment.bp] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

									--TO TEST ON THE FLY--
--use PatientSafety_Records_Test
--declare @refdate VARCHAR(10);
--declare @JustTheIndicatorNumbersPlease bit;
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;

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
	when MONTH(@refdate) <4 then CONVERT(VARCHAR, YEAR(@refdate)) + '-03-31' --31st March
	when MONTH(@refdate) >3 then CONVERT(VARCHAR, (YEAR(@refdate) + 1)) + '-03-31' end); --31st March

--#latestHtnCode
--ELIGIBLE POPULATION
--NB min/max rubric checks if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestHtnCode') IS NOT NULL DROP TABLE #latestHtnCode
CREATE TABLE #latestHtnCode (PatID int, latestHtnCodeDate date, latestHtnCodeMin varchar(512), latestHtnCodeMax varchar(512), latestHtnCode varchar(512));
insert into #latestHtnCode (PatID, latestHtnCodeDate, latestHtnCodeMin, latestHtnCodeMax, latestHtnCode)
select s.PatID, latestHtnCodeDate, MIN(Rubric) as latestHtnCodeMin, MAX(Rubric) as latestHtnCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'htnQof')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnCodeDate = s.EntryDate
where ReadCode  in (select code from codeGroups where [group] = 'htnQof')
group by s.PatID, latestHtnCodeDate

--#age
IF OBJECT_ID('tempdb..#age') IS NOT NULL DROP TABLE #age
CREATE TABLE #age (PatID int, age int);
insert into #age (PatID, age)
select PatID, YEAR(@achieveDate) - year_of_birth as age from #latestHtnCode as c
	left outer join
		(select patid, year_of_birth from dbo.patients) as d on c.PatID = d.patid

--#latestHtnPermExCode
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestHtnPermExCode') IS NOT NULL DROP TABLE #latestHtnPermExCode
CREATE TABLE #latestHtnPermExCode (PatID int, latestHtnPermExCodeDate date, latestHtnPermExCodeMin varchar(512), latestHtnPermExCodeMax varchar(512),
	latestHtnPermExCode varchar(512));
insert into #latestHtnPermExCode
	(PatID, latestHtnPermExCodeDate, latestHtnPermExCodeMin, latestHtnPermExCodeMax, latestHtnPermExCode)
select s.PatID, latestHtnPermExCodeDate, MIN(Rubric) as latestHtnPermExCodeMin, MAX(Rubric) as latestHtnPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnPermExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestHtnCode)
		and ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnPermExCodeDate = s.EntryDate
where ReadCode  in (select code from codeGroups where [group] = 'htnPermEx')
group by s.PatID, latestHtnPermExCodeDate

--#latestHtnTempExCode
--temp exceptions: BP refused, max HTN medication, CKD indicators unsuitable
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestHtnTempExCode') IS NOT NULL DROP TABLE #latestHtnTempExCode
CREATE TABLE #latestHtnTempExCode (PatID int, latestHtnTempExCodeDate date, latestHtnTempExCodeMin varchar(512),
	latestHtnTempExCodeMax varchar(512), latestHtnTempExCode varchar(512));
insert into #latestHtnTempExCode
	(PatID, latestHtnTempExCodeDate, latestHtnTempExCodeMin, latestHtnTempExCodeMax, latestHtnTempExCode)
select s.PatID, latestHtnTempExCodeDate, MIN(Rubric) as latestHtnTempExCodeMin, MAX(Rubric) as latestHtnTempExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnTempExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnTempExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestHtnCode)
		and ReadCode in (select code from codeGroups where [group] in ('htnTempEx','bpTempEx'))
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnTempExCodeDate = s.EntryDate
where ReadCode  in (select code from codeGroups where [group] in ('htnTempEx','bpTempEx'))
group by s.PatID, latestHtnTempExCodeDate

--#latestRegisteredCode
--codes relating to patient registration
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestRegisteredCode') IS NOT NULL DROP TABLE #latestRegisteredCode
CREATE TABLE #latestRegisteredCode (PatID int, latestRegisteredCodeDate date, latestRegisteredCodeMin varchar(512), latestRegisteredCodeMax varchar(512),
	latestRegisteredCode varchar(512));
insert into #latestRegisteredCode
	(PatID, latestRegisteredCodeDate, latestRegisteredCodeMin, latestRegisteredCodeMax, latestRegisteredCode)
select s.PatID, latestRegisteredCodeDate, MIN(Rubric) as latestRegisteredCodeMin, MAX(Rubric) as latestRegisteredCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestRegisteredCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestRegisteredCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestHtnCode)
		and ReadCode in (select code from codeGroups where [group] = 'registered')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestRegisteredCodeDate = s.EntryDate
where ReadCode  in (select code from codeGroups where [group] = 'registered')
group by s.PatID, latestRegisteredCodeDate

--#latestDeregCode
--codes relating to patient DEregistration
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDeregCode') IS NOT NULL DROP TABLE #latestDeregCode
CREATE TABLE #latestDeregCode (PatID int, latestDeregCodeDate date, latestDeregCodeMin varchar(512), latestDeregCodeMax varchar(512),
	latestDeregCode varchar(512));
insert into #latestDeregCode
	(PatID, latestDeregCodeDate, latestDeregCodeMin, latestDeregCodeMax, latestDeregCode)
select s.PatID, latestDeregCodeDate, MIN(Rubric) as latestDeregCodeMin, MAX(Rubric) as latestDeregCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDeregCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeregCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestHtnCode)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'deRegistered')
group by s.PatID, latestDeregCodeDate

--#latestDeadCode
--codes relating to patient death
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDeadCode') IS NOT NULL DROP TABLE #latestDeadCode
CREATE TABLE #latestDeadCode (PatID int, latestDeadCodeDate date, latestDeadCodeMin varchar(512), latestDeadCodeMax varchar(512),
	latestDeadCode varchar(512));
insert into #latestDeadCode
	(PatID, latestDeadCodeDate, latestDeadCodeMin, latestDeadCodeMax, latestDeadCode)
select s.PatID, latestDeadCodeDate, MIN(Rubric) as latestDeadCodeMin, MAX(Rubric) as latestDeadCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDeadCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeadCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestHtnCode)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dead')
group by s.PatID, latestDeadCodeDate

--#deadTable
--patients marked as dead in the demographics table
IF OBJECT_ID('tempdb..#deadTable') IS NOT NULL DROP TABLE #deadTable
CREATE TABLE #deadTable (PatID int, deadTable int, deadTableMonth int, deadTableYear int);
insert into #deadTable
	(PatID, deadTable, deadTableMonth, deadTableYear)
select PatID, deadTable, deadTableMonth, deadTableYear from #latestHtnCode as c
	left outer join
		(select patid, dead as deadTable, month_of_death as deadTableMonth, year_of_death as deadTableYear from patients) as d on c.PatID = d.patid

--#firstHtnCode
--needed for the 'diagnosis within 9/12 exclusion criterion'
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#firstHtnCode') IS NOT NULL DROP TABLE #firstHtnCode
CREATE TABLE #firstHtnCode (PatID int, firstHtnCodeDate date, firstHtnCodeMin varchar(512), firstHtnCodeMax varchar(512),
	firstHtnCode varchar(512));
insert into #firstHtnCode
	(PatID, firstHtnCodeDate, firstHtnCodeMin, firstHtnCodeMax, firstHtnCode)
select s.PatID, firstHtnCodeDate, MIN(Rubric) as firstHtnCodeMin, MAX(Rubric) as firstHtnCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstHtnCode from SIR_ALL_Records s
	inner join (
		select PatID, MIN(EntryDate) as firstHtnCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'htnQof')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.firstHtnCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'htnQof')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, firstHtnCodeDate

--#firstHtnCodeAfter
--if patients have had a permanent exclusion code: the first CKD 3-5 date AFTER the exclusion
--needed for the 'diagnosis within 9/12 exclusion criterion'
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#firstHtnCodeAfter') IS NOT NULL DROP TABLE #firstHtnCodeAfter
CREATE TABLE #firstHtnCodeAfter (PatID int, firstHtnCodeAfterDate date, firstHtnCodeAfterMin varchar(512),
	firstHtnCodeAfterMax varchar(512), firstHtnCodeAfter varchar(512)); --need this to exclude patients who have been diagnosed within 9/12 of target date as per QOF
insert into #firstHtnCodeAfter
	(PatID, firstHtnCodeAfterDate, firstHtnCodeAfterMin, firstHtnCodeAfterMax, firstHtnCodeAfter)
select s.PatID, firstHtnCodeAfterDate, MIN(Rubric) as firstHtnCodeAfterMin, MAX(Rubric) as firstHtnCodeAfterMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstHtnCodeAfter from SIR_ALL_Records as s
	inner join (
		select r.PatID, MIN(EntryDate) as firstHtnCodeAfterDate from SIR_ALL_Records as r
			inner join #latestHtnPermExCode as t on t.PatID = r.PatID
		where ReadCode in (select code from codeGroups where [group] = 'htnQof')
		and EntryDate < @refdate
		and EntryDate > latestHtnPermExCodeDate --so if there is an exclusion code AND CKD code on the same day, exclusion wins - if there are further ckd codes afterwards then ckd wins
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.firstHtnCodeAfterDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'htnQof')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, firstHtnCodeAfterDate

--#latestDmCode
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDmCode') IS NOT NULL DROP TABLE #latestDmCode
CREATE TABLE #latestDmCode (PatID int, latestDmCodeDate date, latestDmCodeMin varchar(512), latestDmCodeMax varchar(512), latestDmCode varchar(512));
insert into #latestDmCode
	(PatID, latestDmCodeDate, latestDmCodeMin, latestDmCodeMax, latestDmCode)
select s.PatID, latestDmCodeDate, MIN(Rubric) as latestDmCodeMin, MAX(Rubric) as latestDmCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDmCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dm')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dm')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, latestDmCodeDate

--#latestDmPermExCode
--dm perm exclusions - i.e. DM resolved
--dm temp ex codes not included because this is a CKD indicator NOT a dm indicator
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDmPermExCode') IS NOT NULL DROP TABLE #latestDmPermExCode
CREATE TABLE #latestDmPermExCode (PatID int, latestDmPermExCodeDate date, latestDmPermExCodeMin varchar(512), latestDmPermExCodeMax varchar(512),
	latestDmPermExCode varchar(512));
insert into #latestDmPermExCode
	(PatID, latestDmPermExCodeDate, latestDmPermExCodeMin, latestDmPermExCodeMax, latestDmPermExCode)
select s.PatID, latestDmPermExCodeDate, MIN(Rubric) as latestDmPermExCodeMin, MAX(Rubric) as latestDmPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDmPermExCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, latestDmPermExCodeDate

--#firstDmCode
--patients' first DM code
--needed for the 'diagnosis within 9/12 exclusion criterion'
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#firstDmCode') IS NOT NULL DROP TABLE #firstDmCode
CREATE TABLE #firstDmCode (PatID int, firstDmCodeDate date, firstDmCodeMin varchar(512), firstDmCodeMax varchar(512), firstDmCode varchar(512));
insert into #firstDmCode
	(PatID, firstDmCodeDate, firstDmCodeMin, firstDmCodeMax, firstDmCode)
select s.PatID, firstDmCodeDate, MIN(Rubric) as latestDmCodeMin, MAX(Rubric) as latestDmCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstDmCode from SIR_ALL_Records as s
	inner join (
		select PatID, MIN(EntryDate) as firstDmCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dm')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.firstDmCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dm')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, firstDmCodeDate

--#firstDmCodeAfter
--if patients have had a permanent DM exclusion code: the first DM code date AFTER the exclusion
--needed for the 'diagnosis within 9/12 exclusion criterion'
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#firstDmCodeAfter') IS NOT NULL DROP TABLE #firstDmCodeAfter
CREATE TABLE #firstDmCodeAfter (PatID int, firstDmCodeAfterDate date, firstDmCodeAfterMin varchar(512),
	firstDmCodeAfterMax varchar(512), firstDmCodeAfter varchar(512)); --need this to exclude patients who have been diagnosed within 9/12 of target date as per QOF
insert into #firstDmCodeAfter
	(PatID, firstDmCodeAfterDate, firstDmCodeAfterMin, firstDmCodeAfterMax, firstDmCodeAfter)
select s.PatID, firstDmCodeAfterDate, MIN(Rubric) as firstDmCodeAfterMin, MAX(Rubric) as firstDmCodeAfterMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstDmCodeAfter from SIR_ALL_Records as s
	inner join (
		select r.PatID, MIN(EntryDate) as firstDmCodeAfterDate from SIR_ALL_Records as r
			inner join #latestDmPermExCode as t on t.PatID = r.PatID
		where ReadCode in (select code from codeGroups where [group] = 'dm')
		and EntryDate < @refdate
		and EntryDate > latestDmPermExCodeDate --so if there is an exclusion code AND DM code on the same day, exclusion wins - if there are further DM codes afterwards then DM wins
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.firstDmCodeAfterDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dm')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, firstDmCodeAfterDate

--#latestSbp
IF OBJECT_ID('tempdb..#latestSbp') IS NOT NULL DROP TABLE #latestSbp
CREATE TABLE #latestSbp (PatID int, latestSbpDate date, latestSbp int, sourceSbp varchar(12));
insert into #latestSbp
select s.PatID, latestSbpDate, MIN(CodeValue) as latestSbp, max(Source) as sourceSbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestSbpDate  from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'sbp')
		and EntryDate < @refdate
		and CodeValue is not null
		and CodeValue > 0
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestSbpDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'sbp')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, latestSbpDate

--#latestDbp
IF OBJECT_ID('tempdb..#latestDbp') IS NOT NULL DROP TABLE #latestDbp
CREATE TABLE #latestDbp (PatID int, latestDbpDate date, latestDbp int, sourceDbp varchar(12));
insert into #latestDbp
select s.PatID, latestDbpDate, MIN(CodeValue) as latestDbp, max(Source) as sourceDbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDbpDate  from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'dbp')
		and EntryDate < @refdate
		and CodeValue is not null
		and CodeValue > 0
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDbpDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dbp')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, latestDbpDate

--#latestAcr
IF OBJECT_ID('tempdb..#latestAcr') IS NOT NULL DROP TABLE #latestAcr
CREATE TABLE #latestAcr (PatID int, latestAcrDate date, latestAcr int);
insert into #latestAcr
	(PatID, latestAcrDate, latestAcr)
select s.PatID, latestAcrDate, MIN(CodeValue) as latestAcr from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAcrDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'acr')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAcrDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'acr')
and s.PatID in (select PatID from #latestHtnCode)
group by s.PatID, latestAcrDate

--#dmProtPatient
IF OBJECT_ID('tempdb..#dmProtPatient') IS NOT NULL DROP TABLE #dmProtPatient
CREATE TABLE #dmProtPatient (PatID int, dmPatient int, protPatient int);
insert into #dmProtPatient
	(PatID, dmPatient, protPatient)
select a.PatID,
	case when
					(
						(latestDmCode is NULL) or (latestDmPermExCodeDate > latestDmCodeDate) --no DM code, or perm ex code AFTER DM code
					)
						or
					(
						(firstDmCodeDate > DATEADD(month, -9, @achievedate)) or (firstDmCodeAfterDate > DATEADD(month, -9, @achievedate)) --first DM code is within 9/12 of achievement date, or have been perm ex but then re-diagnosed within 9/12
					) then 0 else 1 end as dmPatient, --DM patient
	case when (latestAcr is null) or (latestAcr < 70) then 0 else 1 end as protPatient
from #latestHtnCode as a
		left outer join (select PatID, latestDmCodeDate, latestDmCode from #latestDmCode) b on b.PatID = a.PatID
		left outer join (select PatID, latestDmPermExCodeDate from #latestDmPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, firstDmCodeDate from #firstDmCode) d on d.PatID = a.PatID
		left outer join (select PatID, firstDmCodeAfterDate from #firstDmCodeAfter) e on e.PatID = a.PatID
		left outer join (select PatID, latestAcr from #latestAcr) f on f.PatID = a.PatID

--#bpTargetMeasuredControlled
IF OBJECT_ID('tempdb..#bpTargetMeasuredControlled') IS NOT NULL DROP TABLE #bpTargetMeasuredControlled
CREATE TABLE #bpTargetMeasuredControlled
	(PatID int, bpTarget varchar(512), bpMeasuredOk int, bpControlledOk int);
insert into #bpTargetMeasuredControlled
select a.PatID, 
	case
		when age <80 then '&lt;140/90'
		when age >=80 then '&gt;140/90'
	end as bpTarget, --SS
	case when (latestSbpDate > DATEADD(month, -12, @achievedate)) and (latestDbpDate > DATEADD(month, -12, @achievedate)) then 1 else 0 end as bpMeasuredOk,  --measured within 12/12 of achievedate (SS)
	case 
		when age <80 and latestSbp < 140 and latestDbp < 90 then 1 
		when age >=80 and latestSbp < 150 and latestDbp < 90 then 1
		else 0 
	end as bpControlledOk
from #latestHtnCode as a
		left outer join (select PatID, latestSbp, latestSbpDate from #latestSbp) b on b.PatID = a.PatID
		left outer join (select PatID, latestDbp, latestDbpDate from #latestDbp) c on c.PatID = a.PatID
		left outer join (select PatID, dmPatient, protPatient from #dmProtPatient) e on e.PatID = a.PatID
		left outer join (select PatID, age from #age) d on d.PatID = a.PatID

--#exclusions
IF OBJECT_ID('tempdb..#exclusions') IS NOT NULL DROP TABLE #exclusions
CREATE TABLE #exclusions
	(PatID int, ageExclude int, regCodeExclude int, deRegCodeExclude int, tempExExclude int,
	deadCodeExclude int, deadTableExclude int, diagExclude int, permExExclude int);
insert into #exclusions
select a.PatID,
	case when age < 17 then 1 else 0 end as ageExclude, -- Demographic exclusions: Under 18 at achievement date (from QOF v34 business rules)
	case when latestRegisteredCodeDate > DATEADD(month, -9, @achievedate) then 1 else 0 end as regCodeExclude, -- Registration date: > achievement date - 9/12 (from CKD ruleset_INLIQ_v32.0)
	case when latestDeregCodeDate > latestHtnCodeDate then 1 else 0 end as deRegCodeExclude, -- Exclude patients with deregistered codes AFTER their latest CKD 35 code
	case when latestHtnTempExCodeDate > DATEADD(month, -12, @achievedate) then 1 else 0 end as tempExExclude, -- Expiring exclusions: BP refusal or CKD not suitable or HTN max > achievement date - 12/12 (from QOF v34 business rules)
	case when latestDeadCodeDate > latestHtnCodeDate then 1 else 0 end as deadCodeExclude, -- Exclude patients with dead codes after their latest CKD35 code
	case when latestHtnPermExCodeDate > latestHtnCodeDate then 1 else 0 end as permExExclude, -- Permanent exclusions: CKD 1 or 2 or CKD resolved code afterwards (from QOF v34 business rules)
	case when deadTable = 1 then 1 else 0 end as deadTableExclude, -- Exclude patients listed as dead in the patients table
	case when (firstHtnCodeDate > DATEADD(month, -9, @achievedate)) or (firstHtnCodeAfterDate > DATEADD(month, -9, @achievedate)) then 1 else 0 end as diagExclude -- Diagnosis date: Latest CKD 3-5 code > target date - 9/12 (from CKD ruleset_INLIQ_v32.0)
from #latestHtnCode as a
	left outer join (select PatID, age from #age) b on b.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCodeDate, latestHtnPermExCode from #latestHtnPermExCode) c on c.PatID = a.PatID
	left outer join (select PatID, latestHtnTempExCodeDate, latestHtnTempExCode from #latestHtnTempExCode) d on d.PatID = a.PatID
	left outer join (select PatID, latestRegisteredCodeDate, latestRegisteredCode from #latestRegisteredCode) e on e.PatID = a.PatID
	left outer join (select PatID, latestDeregCodeDate, latestDeregCode from #latestDeregCode) f on f.PatID = a.PatID
	left outer join (select PatID, latestDeadCodeDate, latestDeadCode from #latestDeadCode) j on j.PatID = a.PatID
	left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) g on g.PatID = a.PatID
	left outer join (select PatID, firstHtnCodeDate, firstHtnCode from #firstHtnCode) h on h.PatID = a.PatID
	left outer join (select PatID, firstHtnCodeAfterDate, firstHtnCodeAfter from #firstHtnCodeAfter) i on i.PatID = a.PatID
	
--#denominator
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
select a.PatID,
	case when ageExclude = 0 and permExExclude  = 0 and tempExExclude  = 0 and regCodeExclude  = 0
		and diagExclude  = 0 and deRegCodeExclude  = 0 and 	deadCodeExclude  = 0 and deadTableExclude  = 0
		then 1 else 0 end as denominator
from #latestHtnCode as a
	left outer join (select PatID, ageExclude, permExExclude, tempExExclude, regCodeExclude, diagExclude,
					deRegCodeExclude, deadCodeExclude, deadTableExclude from #exclusions) b on b.PatID = a.PatID

--#numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID,
	case when denominator = 1 and bpMeasuredOk = 1 and bpControlledOk = 1 then 1 else 0 end as numerator
from #latestHtnCode as a
		left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
		left outer join (select PatID, bpMeasuredOk, bpControlledOk from #bpTargetMeasuredControlled) c on c.PatID = a.PatID

--#eligiblePopulationAllData
--all data from above combined into one table, plus numerator column
IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int,
	age int,
	latestHtnCodeDate date, latestHtnCode varchar(512),
	latestHtnPermExCode varchar(512), latestHtnPermExCodeDate date,
	latestHtnTempExCode varchar(512), latestHtnTempExCodeDate date,
	latestRegisteredCode varchar(512), latestRegisteredCodeDate date,
	latestDeregCode varchar(512), latestDeregCodeDate date,
	latestDeadCode varchar(512), latestDeadCodeDate date,
	deadTable int, deadTableMonth int, deadTableYear int,
	firstHtnCode varchar(512), firstHtnCodeDate date,
	firstHtnCodeAfter varchar(512), firstHtnCodeAfterDate date,
	latestDmCode varchar(512), latestDmCodeDate date,
	latestDmPermExCode varchar(512), latestDmPermExCodeDate date,
	firstDmCode varchar(512), firstDmCodeDate date,
	firstDmCodeAfter varchar(512), firstDmCodeAfterDate date,
	latestSbpDate date, latestSbp int, sourceSbp varchar(12),
	latestDbpDate date, latestDbp int, sourceDbp varchar(12),
	latestAcrDate date, latestAcr int,
	dmPatient int, protPatient int,
	bpMeasuredOK int, bpTarget varchar(512), bpControlledOk int,
	ageExclude int, permExExclude int, tempExExclude int, regCodeExclude int, diagExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int,
	denominator int,
	numerator int);
insert into #eligiblePopulationAllData
select a.PatID,
	age,
	a.latestHtnCodeDate, a.latestHtnCode,
	latestHtnPermExCode, latestHtnPermExCodeDate,
	latestHtnTempExCode, latestHtnTempExCodeDate,
	latestRegisteredCode, latestRegisteredCodeDate,
	latestDeregCode, latestDeregCodeDate,
	latestDeadCode, latestDeadCodeDate,
	deadTable, deadTableMonth, deadTableYear,
	firstHtnCode, firstHtnCodeDate,
	firstHtnCodeAfter, firstHtnCodeAfterDate,
	latestDmCode, latestDmCodeDate,
	latestDmPermExCode, latestDmPermExCodeDate,
	firstDmCode, firstDmCodeDate,
	firstDmCodeAfter, firstDmCodeAfterDate,
	latestSbpDate, latestSbp, sourceSbp,
	latestDbpDate, latestDbp, sourceDbp,
	latestAcrDate, latestAcr,
	dmPatient, protPatient,
	bpMeasuredOk, bpTarget, bpControlledOk,
	ageExclude, permExExclude, tempExExclude, regCodeExclude, diagExclude, deRegCodeExclude, deadCodeExclude, deadTableExclude,
	denominator,
	numerator
from #latestHtnCode as a
		left outer join (select PatID, age from #age) b on b.PatID = a.PatID
		left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestHtnTempExCode, latestHtnTempExCodeDate from #latestHtnTempExCode) d on d.PatID = a.PatID
		left outer join (select PatID, latestRegisteredCode, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) g on g.PatID = a.PatID
		left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) h on h.PatID = a.PatID
		left outer join (select PatID, firstHtnCode, firstHtnCodeDate from #firstHtnCode) i on i.PatID = a.PatID
		left outer join (select PatID, firstHtnCodeAfter, firstHtnCodeAfterDate from #firstHtnCodeAfter) j on j.PatID = a.PatID
		left outer join (select PatID, latestDmCode, latestDmCodeDate from #latestDmCode) k on k.PatID = a.PatID
		left outer join (select PatID, latestDmPermExCode, latestDmPermExCodeDate from #latestDmPermExCode) l on l.PatID = a.PatID
		left outer join (select PatID, firstDmCode, firstDmCodeDate from #firstDmCode) m on m.PatID = a.PatID
		left outer join (select PatID, firstDmCodeAfter, firstDmCodeAfterDate from #firstDmCodeAfter) n on n.PatID = a.PatID
		left outer join (select PatID, latestSbpDate, latestSbp, sourceSbp from #latestSbp) o on o.PatID = a.PatID
		left outer join (select PatID, latestDbpDate, latestDbp, sourceDbp from #latestDbp) p on p.PatID = a.PatID
		left outer join (select PatID, latestAcrDate, latestAcr from #latestAcr) r on r.PatID = a.PatID
		left outer join (select PatID, dmPatient, protPatient from #dmProtPatient) s on s.PatID = a.PatID
		left outer join (select PatID, bpMeasuredOk, bpTarget, bpControlledOk from #bpTargetMeasuredControlled) t on t.PatID = a.PatID
		left outer join (select PatID, ageExclude, permExExclude, tempExExclude, regCodeExclude, diagExclude, deRegCodeExclude,
						deadCodeExclude, deadTableExclude from #exclusions) u on u.PatID = a.PatID
		left outer join (select PatID, denominator from #denominator) v on v.PatID = a.PatID
		left outer join (select PatID, numerator from #numerator) w on w.PatID = a.PatID

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

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'htn.treatment.bp', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
	sum(case when numerator = 1 then 1 else 0 end) as numerator, 
	sum(case when denominator = 1 then 1 else 0 end) as denominator, @target as target, @abc 
from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID;

									----------------------------------------------
									-------POPULATE MAIN DENOMINATOR TABLE--------
									----------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why)


									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max));
--insert into #denominators

select PatID, 'htn.treatment.bp',
	case
		when bpMeasuredOK = 0 then 
			'<ul><li>Patient is on hypertension register.</li>' +
			'<li>Latest BP was measured on '+ CONVERT(VARCHAR, latestSbpDate, 3) + ' .</li>' +
			'<li>NICE recommends BP should be measured every 12 months from last April.</li></ul>' -- since ' +
--				case
--					when MONTH(@refdate) <4 then '1st October ' + CONVERT(VARCHAR,YEAR(@refdate - 1)) --when today's date is before April, it's 1st October LAST year
--					when MONTH(@refdate) >3 and MONTH(@refdate) <10 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate))) --when today's date is after March BUT before October, it's 1st April THIS year
--					when MONTH(@refdate) >9 then '1st October ' + CONVERT(VARCHAR,(YEAR(@refdate))) --when today's date is after September, it's 1st October THIS year
--				end +'.</li></ul>'
		when bpMeasuredOK = 1 and bpControlledOk = 0 then
			'<ul><li>Patient is on hypertension register and is ' + str(age) + ' years old.</li>' +
			'<li>Target BP is <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!scenario:1'' target=''_blank'' title="NICE BP">&lt;140/90 mmHg in patients under 80 years and &lt;150/90 mmHg in patients 80 years or older</a>.</li>' +
			'<li>Last BP was <strong>uncontrolled</strong>: ' +
				case
						when (age <80 and latestSbp >= 140) or (age >=80 and latestSbp >= 150) then '<strong>' + Str(latestSbp) + '</strong>'
						else Str(latestSbp)
					end
				+ '/' +
					case
						when latestDbp >= 90 then '<strong>' + Str(latestDbp) + '</strong>'
						else Str(latestDbp)
					end
				+ ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' + 
			case 
				when sourceSbp = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in the GP record.</li>'
			else ''
			end		
		when numerator = 1 then
			'<ul><li>Patient is on CKD register.</li>' +
			'<li>Last BP was controlled and taken in the last 6 months' + --since ' +
--				case
--					when MONTH(@refdate) <4 then '1st October ' + CONVERT(VARCHAR,YEAR(@refdate - 1)) --when today's date is before April, it's 1st October LAST year
--					when MONTH(@refdate) >3 and MONTH(@refdate) <10 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate))) --when today's date is after March BUT before October, it's 1st April THIS year
--					when MONTH(@refdate) >9 then '1st October ' + CONVERT(VARCHAR,(YEAR(@refdate))) --when today's date is after September, it's 1st October THIS year
--				end +
			': ' + Str(latestSbp) + '/' + Str(latestDbp) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>
			<li>This is in accordance with both the Salford Standards and <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!scenario:1'' target=''_blank'' title="NICE BP targets">NICE guidelines</a>.</li>' +
			case 
				when sourceSbp = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in the GP record.</li>'
			else ''
			end	
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

				---------------------------------------------------------------------------------------------------------------------
				--OBTAIN INFORMATION RELATED TO IMP OPPS FOR EACH PATIENT IN DENOMINATOR BUT *NOT* IN NUMERATOR----------------------
				---------------------------------------------------------------------------------------------------------------------
				--AS ABOVE, CREATE TEMP TABLES FOR EACH COLUMN OF DATA NEEDED, FROM EACH PATIENT IN DENOM BUT  BUT *NOT* IN NUMERATOR
				--COMBINE TABLES TOGETHER THAT NEED TO BE QUERIED TO CREATE NEW TABLES
				--THEN COMBINE ALL TABLES TOGETHER INTO ONE BIG TABLE TO BE QUERIED IN FUTURE
				---------------------------------------------------------------------------------------------------------------------

--#latestPalCode
IF OBJECT_ID('tempdb..#latestPalCode') IS NOT NULL DROP TABLE #latestPalCode
CREATE TABLE #latestPalCode
	(PatID int, latestPalCodeDate date, latestPalCodeMin varchar(512), latestPalCodeMax varchar(512), latestPalCode varchar(512));
insert into #latestPalCode
select s.PatID, latestPalCodeDate, MIN(Rubric) as latestPalCodeMin, MAX(Rubric) as latestPalCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestPalCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestPalCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'pal') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestPalCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'pal')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestPalCodeDate

--#latestPalPermExCode
IF OBJECT_ID('tempdb..#latestPalPermExCode') IS NOT NULL DROP TABLE #latestPalPermExCode
CREATE TABLE #latestPalPermExCode
	(PatID int, latestPalPermExCodeDate date, latestPalPermExCodeMin varchar(512), latestPalPermExCodeMax varchar(512),
		latestPalPermExCode varchar(512));
insert into #latestPalPermExCode
select s.PatID, latestPalPermExCodeDate, MIN(Rubric) as latestPalPermExCodeMin, MAX(Rubric) as latestPalPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestPalPermExCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestPalPermExCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'palPermEx') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestPalPermExCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'palPermEx')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestPalPermExCodeDate

--#latestFrailCode
IF OBJECT_ID('tempdb..#latestFrailCode') IS NOT NULL DROP TABLE #latestFrailCode
CREATE TABLE #latestFrailCode
	(PatID int, latestFrailCodeDate date, latestFrailCodeMin varchar(512), latestFrailCodeMax varchar(512), latestFrailCode varchar(512));
insert into #latestFrailCode
select s.PatID, latestFrailCodeDate, MIN(Rubric) as latestFrailCodeMin, MAX(Rubric) as latestFrailCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestFrailCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestFrailCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'frail') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestFrailCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'frail')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestFrailCodeDate

--#latestHouseBedboundCode
IF OBJECT_ID('tempdb..#latestHouseBedboundCode') IS NOT NULL DROP TABLE #latestHouseBedboundCode
CREATE TABLE #latestHouseBedboundCode
	(PatID int, latestHouseBedboundCodeDate date, latestHouseBedboundCodeMin varchar(512), latestHouseBedboundCodeMax varchar(512),
		latestHouseBedboundCode varchar(512));
insert into #latestHouseBedboundCode
select s.PatID, latestHouseBedboundCodeDate, MIN(Rubric) as latestHouseBedboundCodeMin, MAX(Rubric) as latestHouseBedboundCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHouseBedboundCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestHouseBedboundCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] in ('housebound', 'bedridden')) and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestHouseBedboundCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] in ('housebound', 'bedridden'))
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestHouseBedboundCodeDate

--#latestHouseBedboundPermExCode
IF OBJECT_ID('tempdb..#latestHouseBedboundPermExCode') IS NOT NULL DROP TABLE #latestHouseBedboundPermExCode
CREATE TABLE #latestHouseBedboundPermExCode
	(PatID int, latestHouseBedboundPermExCodeDate date, latestHouseBedboundPermExCodeMin varchar(512), latestHouseBedboundPermExCodeMax varchar(512),
		latestHouseBedboundPermExCode varchar(512));
insert into #latestHouseBedboundPermExCode
select s.PatID, latestHouseBedboundPermExCodeDate, MIN(Rubric) as latestHouseBedboundPermExCodeMin, MAX(Rubric) as latestHouseBedboundPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHouseBedboundPermExCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestHouseBedboundPermExCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'houseboundPermEx') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestHouseBedboundPermExCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'houseboundPermEx')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestHouseBedboundPermExCodeDate

--#latestCkd3rdInviteCode
IF OBJECT_ID('tempdb..#latestCkd3rdInviteCode') IS NOT NULL DROP TABLE #latestCkd3rdInviteCode
CREATE TABLE #latestCkd3rdInviteCode
	(PatID int, latestCkd3rdInviteCodeDate date, latestCkd3rdInviteCodeMin varchar(512), latestCkd3rdInviteCodeMax varchar(512),
		latestCkd3rdInviteCode varchar(512));
insert into #latestCkd3rdInviteCode
select s.PatID, latestCkd3rdInviteCodeDate, MIN(Rubric) as latestCkd3rdInviteCodeMin, MAX(Rubric) as latestCkd3rdInviteCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCkd3rdInviteCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestCkd3rdInviteCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'ckd3rdInvite') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestCkd3rdInviteCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'ckd3rdInvite')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestCkd3rdInviteCodeDate

--#numberOfCkdInviteCodesThisFinancialYear
IF OBJECT_ID('tempdb..#numberOfCkdInviteCodesThisFinancialYear') IS NOT NULL DROP TABLE #numberOfCkdInviteCodesThisFinancialYear
CREATE TABLE #numberOfCkdInviteCodesThisFinancialYear
	(PatID int, numberOfCkdInviteCodesThisFinancialYear int);
insert into #numberOfCkdInviteCodesThisFinancialYear
select PatID, count (*) from SIR_ALL_Records as numberOfCkdInviteCodesThisYear
	where ReadCode in (select code from codeGroups where [group] = 'ckdInvite')
		and EntryDate < @refdate
		and EntryDate > DATEADD(year, -1, @achievedate)
		and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
	group by PatID

--#latestWhiteCoatCode
IF OBJECT_ID('tempdb..#latestWhiteCoatCode') IS NOT NULL DROP TABLE #latestWhiteCoatCode
CREATE TABLE #latestWhiteCoatCode
	(PatID int, latestWhiteCoatCodeDate date, latestWhiteCoatCodeMin varchar(512), latestWhiteCoatCodeMax varchar(512),
		latestWhiteCoatCode varchar(512));
insert into #latestWhiteCoatCode
select s.PatID, latestWhiteCoatCodeDate, MIN(Rubric) as latestWhiteCoatCodeMin, MAX(Rubric) as latestWhiteCoatCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestWhiteCoatCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestWhiteCoatCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'whiteCoat') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestWhiteCoatCodeDate = s.EntryDate
where
	ReadCode in (select code from codeGroups where [group] = 'whiteCoat')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestWhiteCoatCodeDate

--#primCareContactInLastYear
--list of pat IDs that have had primary care contact in the last year
IF OBJECT_ID('tempdb..#primCareContactInLastYear') IS NOT NULL DROP TABLE #primCareContactInLastYear
CREATE TABLE #primCareContactInLastYear
	(PatID int);
insert into #primCareContactInLastYear
select PatID from SIR_ALL_Records
where EntryDate < @refdate
	and Source !='salfordt' --not hospital code
	and ReadCode not in (select code from codeGroups where [group] in ('occupations', 'admin', 'recordOpen', 'letterReceived', 'contactAttempt', 'dna')) --not admin code
	and EntryDate > DATEADD(year, -1, @refdate)
	and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by PatID

--#noPrimCareContactInLastYear
IF OBJECT_ID('tempdb..#noPrimCareContactInLastYear') IS NOT NULL DROP TABLE #noPrimCareContactInLastYear
CREATE TABLE #noPrimCareContactInLastYear
	(PatID int, noPrimCareContactInLastYear int);
insert into #noPrimCareContactInLastYear
select PatID, case when PatID in (select PatID from #primCareContactInLastYear) then 0 else 1 end as noPrimCareContactInLastYear
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0

--#secondLatestSbp
IF OBJECT_ID('tempdb..#secondLatestSbp') IS NOT NULL DROP TABLE #secondLatestSbp
CREATE TABLE #secondLatestSbp (PatID int, secondLatestSbpDate date, secondLatestSbp int);
insert into #secondLatestSbp
select a.PatID, secondLatestSbpDate, MIN(a.CodeValue) from SIR_ALL_Records as a
	inner join
		(
			select s.PatID, max(s.EntryDate) as secondLatestSbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestSbpDate from #latestSbp --i.e. select latest SBP date
					)sub on sub.PatID = s.PatID and sub.latestSbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'sbp')
			and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestSbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'sbp')
and a.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by a.PatID, secondLatestSbpDate

--#secondLatestDbp
IF OBJECT_ID('tempdb..#secondLatestDbp') IS NOT NULL DROP TABLE #secondLatestDbp
CREATE TABLE #secondLatestDbp (PatID int, secondLatestDbpDate date, secondLatestDbp int);
insert into #secondLatestDbp
select a.PatID, secondLatestDbpDate, MIN(a.CodeValue) from SIR_ALL_Records as a
	inner join
		(
			select s.PatID, max(s.EntryDate) as secondLatestDbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestDbpDate from #latestDbp --i.e. select latest DBP date
					)sub on sub.PatID = s.PatID and sub.latestDbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'dbp')
			and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestDbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dbp')
and a.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by a.PatID, secondLatestDbpDate

--secondLatestBpControlled
IF OBJECT_ID('tempdb..#secondLatestBpControlled') IS NOT NULL DROP TABLE #secondLatestBpControlled
CREATE TABLE #secondLatestBpControlled
	(PatID int, secondLatestBpControlled int);
insert into #secondLatestBpControlled
select a.PatID,
	case when
		(
			(dmPatient = 1 or protPatient = 1) and
			(secondLatestSbp < 130 and secondLatestDbp < 80) --SS
		)
			or
		(
			(dmPatient = 0 and protPatient = 0) and
			(secondLatestSbp < 140 and secondLatestDbp < 90) --SS
		) then 1 else 0 end as secondLatestBpControlled
from #eligiblePopulationAllData as a
		left outer join (select PatID, secondLatestSbp, secondLatestSbpDate from #secondLatestSbp) b on b.PatID = a.PatID
		left outer join (select PatID, secondLatestDbp, secondLatestDbpDate from #secondLatestDbp) c on c.PatID = a.PatID
where denominator = 1 and numerator = 0

							-----------------------------------------------------
							--------------------MEDICATIONS----------------------
							-----------------------------------------------------

--#latestMedOptimisation
IF OBJECT_ID('tempdb..#latestMedOptimisation') IS NOT NULL DROP TABLE #latestMedOptimisation
CREATE TABLE #latestMedOptimisation
	(PatID int, latestMedOptimisationDate date,
	latestMedOptimisationMin varchar(512), latestMedOptimisationMax varchar(512), latestMedOptimisation varchar(512), 
	latestMedOptimisationIngredientMin varchar(512), latestMedOptimisationIngredientMax varchar(512), latestMedOptimisationIngredient varchar(512),
	latestMedOptimisationDoseMin float, latestMedOptimisationDoseMax float, latestMedOptimisationDose float,
	latestMedOptimisationFamilyMin varchar(512), latestMedOptimisationFamilyMax varchar(512), latestMedOptimisationFamily varchar(512));
insert into #latestMedOptimisation
	select s.PatID, s.EntryDate,
		min(s.Event), max(s.Event), case when min(s.Event)=max(s.Event) then max(s.Event) else 'multiple medications' end,
		min(s.Ingredient), max(s.Ingredient), case when min(s.Ingredient)=max(s.Ingredient) then max(s.Ingredient) else 'multiple medications' end,
		min(s.Dose), max(s.Dose), case when min(s.Dose)=max(s.Dose) then max(s.Dose) else null end,
		min(s.Family), max(s.Family), case when min(s.Family)=max(s.Family) then max(s.Family) else 'multiple medications' end
		from MEDICATION_EVENTS_HTN as s
  		inner join
  			(
			 select PatID, MAX(EntryDate) as date from MEDICATION_EVENTS_HTN
			 where PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
			 group by PatID
  			) sub on sub.PatID = s.PatID and sub.date = s.EntryDate
	where
 		[Event] in ('DOSE INCREASED', 'STARTED', 'RESTARTED')
		and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, s.EntryDate
	
--#latestMedAdherence i.e. latest occurrence of anti-HTN (any) medication non-adherence
IF OBJECT_ID('tempdb..#latestMedAdherence') IS NOT NULL DROP TABLE #latestMedAdherence
CREATE TABLE #latestMedAdherence
	(PatID int, latestMedAdherenceDate date, 
	latestMedAdherenceIngredientMin varchar(512), latestMedAdherenceIngredientMax varchar(512), latestMedAdherenceIngredient varchar(512), 
	latestMedAdherenceDoseMin float, latestMedAdherenceDoseMax float, latestMedAdherenceDose float,
	latestMedAdherenceFamilyMin varchar(512), latestMedAdherenceFamilyMax varchar(512), latestMedAdherenceFamily varchar(512));
insert into #latestMedAdherence
	select s.PatID, s.EntryDate, 
		min(s.Ingredient), max(s.Ingredient), case when min(s.Ingredient)=max(s.Ingredient) then max(s.Ingredient) else 'multiple medications' end,  
		min(s.Dose), max(s.Dose), case when min(s.Dose)=max(s.Dose) then max(s.Dose) else 'multiple medications' end,  
		min(s.Family), max(s.Family), case when min(s.Family)=max(s.Family) then max(s.Family) else 'multiple medications' end  
		from MEDICATION_EVENTS_HTN as s
  		inner join
  			(
			 select PatID, MAX(EntryDate) as latestMedAdherenceDate from MEDICATION_EVENTS_HTN
			 where PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
			 group by PatID
  			) sub on sub.PatID = s.PatID and sub.latestMedAdherenceDate = s.EntryDate
	where
 		[Event] = 'ADHERENCE'
		and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, s.EntryDate

--#currentHTNmeds
IF OBJECT_ID('tempdb..#currentHTNmeds') IS NOT NULL DROP TABLE #currentHTNmeds
CREATE TABLE #currentHTNmeds
	(PatID int, currentMedEventDate date, currentMedIngredient varchar(512), currentMedFamily varchar(512), currentMedEvent varchar(512), currentMedDose float, currentMedMaxDose float);
insert into #currentHTNmeds
select a.PatID, a.EntryDate, a.Ingredient, a.Family, a.Event, a.Dose, c.MaxDose from MEDICATION_EVENTS_HTN as a
	inner join
		(
--select LAST event for EACH ingredient the patient has ever been prescribed
			select PatID, Ingredient, MAX(EntryDate) as LatestEventDate from MEDICATION_EVENTS_HTN 
			where PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
			group by PatID, Ingredient
		) as b on b.PatID = a.PatID and b.LatestEventDate = a.EntryDate and b.Ingredient = a.Ingredient
 	left outer join
 		(select Ingredient, MaxDose from drugIngredients) as c on b.Ingredient = c.Ingredient
where a.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0) 
--EXCLUDE any events that are a 'stopped' or 'error' event
and [Event] in ('DOSE DECREASED','DOSE INCREASED', 'STARTED', 'RESTARTED','ADHERENCE') 

--#htnMeds
--above table plus a column stating the number of different drugs in the same family the patient is taking
IF OBJECT_ID('tempdb..#htnMeds') IS NOT NULL DROP TABLE #htnMeds
CREATE TABLE #htnMeds
	(PatID int, currentMedEventDate date, currentMedIngredient varchar(512) COLLATE Latin1_General_100_CS_AS, currentMedFamily varchar(512), currentMedEvent varchar(512), currentMedDose float, currentMedMaxDose float, noIngredientsInFamily int);
insert into #htnMeds
select a.PatID, currentMedEventDate, a.currentMedIngredient, a.currentMedFamily, currentMedEvent, currentMedDose, currentMedMaxDose, noIngredientsInFamily from #currentHTNmeds as a
	inner join
		(
			select PatID, currentMedFamily, COUNT(*) as noIngredientsInFamily from #currentHTNmeds
			group by PatID, currentMedFamily
		) as b on b.PatID = a.PatID and b.currentMedFamily = a.currentMedFamily


--ALLERGIES AND CONTRA-INDICATIONS TO ANT-HTN MEDS
--------------------------------------------------
--1. Thiazides http://dx.doi.org/10.18578/BNF.748067014
	--Addison�s disease; hypercalcaemia; hyponatraemia; refractory hypokalaemia; symptomatic hyperuricaemia
--2. ACEI http://dx.doi.org/10.18578/BNF.569976968
	-- NIL!
--3. ARB http://dx.doi.org/10.18578/BNF.479478171
	--NIL!
--4. CCB
	--AMLODIPINE http://dx.doi.org/10.18578/BNF.109201061 Cardiogenic shock; ***significant aortic stenosis***; unstable angina
	--NIFEDIPINE http://dx.doi.org/10.18578/BNF.342536833 Acute attacks of angina; cardiogenic shock; ***significant aortic stenosis***; unstable angina; ***within 1 month of myocardial infarction***
	--LERCANIDIPINE http://dx.doi.org/10.18578/BNF.421178523 ***Acute porphyrias***; ***aortic stenosis***; uncontrolled heart failure; unstable angina; ***within 1 month of myocardial infarction***
	--LACIDIPINE http://dx.doi.org/10.18578/BNF.881677908 ***Acute porphyrias***; ***aortic stenosis***; ***avoid within 1 month of myocardial infarction***; cardiogenic shock; unstable angina
	--ISRADIPINE http://dx.doi.org/10.18578/BNF.786204349 ***Acute porphyrias***; cardiogenic shock;***during or within 1 month of myocardial infarction***; unstable angina
	--FELODIPINE http://dx.doi.org/10.18578/BNF.405039793 Cardiac outflow obstruction; significant cardiac valvular obstruction (e.g. ***aortic stenosis***); uncontrolled heart failure; unstable angina; ***within 1 month of myocardial infarction***
	--DILTIAZEM http://dx.doi.org/10.18578/BNF.873608533 ***Acute porphyrias***; left ventricular failure with pulmonary congestion; ***second- or third-degree AV block (unless pacemaker fitted)***; ***severe bradycardia***; ***sick sinus syndrome***
--5. BB http://dx.doi.org/10.18578/BNF.281805035
	--Asthma; cardiogenic shock; hypotension; marked bradycardia; metabolic acidosis;
	--phaeochromocytoma (apart from specific use with alpha-blockers); Prinzmetal�s angina; second-degree AV block;
	--severe peripheral arterial disease; sick sinus syndrome; third-degree AV block; uncontrolled heart failure
--6. Potassium Sparing Diuretics
	--EPLERENONE http://dx.doi.org/10.18578/BNF.845539498 ***Hyperkalaemia***
	--SPIRONOLACTONE http://dx.doi.org/10.18578/BNF.213718345 ***Addison�s disease***; anuria; ***hyperkalaemia***
	--AMILORIDE http://dx.doi.org/10.18578/BNF.840584388 ***Addison�s disease***; anuria; ***hyperkalaemia***
--7. Alpha blockers
	--DOXAZOSIN http://dx.doi.org/10.18578/BNF.782101311 History of micturition syncope (in patients with benign prostatic hypertrophy); ***history of postural hypotension***; monotherapy in patients with overflow bladder or anuria
	--INDORAMIN http://dx.doi.org/10.18578/BNF.222025343 ***Established heart failure***; history micturition syncope (when used for benign prostatic hyperplasia); ***history of postural hypotension (when used for benign prostatic hyperplasia)***
	--PRAZOSIN http://dx.doi.org/10.18578/BNF.444050694 History of micturition syncope; ***history of postural hypotension***; not recommended for congestive heart failure due to mechanical obstruction (e.g. ***aortic stenosis***)
	--TERAZOSIN http://dx.doi.org/10.18578/BNF.434025504 History of micturition syncope (in benign prostatic hyperplasia); ***history of postural hypotension (in benign prostatic hyperplasia)***
--8. Loop diuretics http://dx.doi.org/10.18578/BNF.267274341
	--Anuria; comatose and precomatose states associated with liver cirrhosis; renal failure due to nephrotoxic or hepatotoxic drugs;
	--***severe hypokalaemia***; ***severe hyponatraemia***

--#latestAllergyThiazideCode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyThiazideCode') IS NOT NULL DROP TABLE #latestAllergyThiazideCode
CREATE TABLE #latestAllergyThiazideCode
	(PatID int, latestAllergyThiazideCodeDate date, latestAllergyThiazideCode varchar(512));
insert into #latestAllergyThiazideCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'thiazideAllergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'thiazideAllergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyACEIcode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyACEIcode') IS NOT NULL DROP TABLE #latestAllergyACEIcode
CREATE TABLE #latestAllergyACEIcode
	(PatID int, latestAllergyACEIcodeDate date, latestAllergyACEIcode varchar(512));
insert into #latestAllergyACEIcode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'ACEIallergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'ACEIallergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyARBcode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyARBcode') IS NOT NULL DROP TABLE #latestAllergyARBcode
CREATE TABLE #latestAllergyARBcode
	(PatID int, latestAllergyARBcodeDate date, latestAllergyARBcode varchar(512));
insert into #latestAllergyARBcode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'ARBallergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'ARBallergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyCCBcode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyCCBcode') IS NOT NULL DROP TABLE #latestAllergyCCBcode
CREATE TABLE #latestAllergyCCBcode
	(PatID int, latestAllergyCCBcodeDate date, latestAllergyCCBcode varchar(512));
insert into #latestAllergyCCBcode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'CCBallergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'CCBallergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyBBcode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyBBcode') IS NOT NULL DROP TABLE #latestAllergyBBcode
CREATE TABLE #latestAllergyBBcode
	(PatID int, latestAllergyBBcodeDate date, latestAllergyBBcode varchar(512));
insert into #latestAllergyBBcode
	(PatID, latestAllergyBBcodeDate, latestAllergyBBcode)
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'BBallergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'BBallergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyPotSpareDiurCode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyPotSpareDiurCode') IS NOT NULL DROP TABLE #latestAllergyPotSpareDiurCode
CREATE TABLE #latestAllergyPotSpareDiurCode
	(PatID int, latestAllergyPotSpareDiurCodeDate date, latestAllergyPotSpareDiurCode varchar(512));
insert into #latestAllergyPotSpareDiurCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'PotSparDiurAllergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'PotSparDiurAllergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyAlphaCode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyAlphaCode') IS NOT NULL DROP TABLE #latestAllergyAlphaCode
CREATE TABLE #latestAllergyAlphaCode
	(PatID int, latestAllergyAlphaCodeDate date, latestAllergyAlphaCode varchar(512));
insert into #latestAllergyAlphaCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'alphaAllergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'alphaAllergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAllergyLoopDiurCode - i.e. allergy and 'adverse reaction' codes
IF OBJECT_ID('tempdb..#latestAllergyLoopDiurCode') IS NOT NULL DROP TABLE #latestAllergyLoopDiurCode
CREATE TABLE #latestAllergyLoopDiurCode
	(PatID int, latestAllergyLoopDiurCodeDate date, latestAllergyLoopDiurCode varchar(512));
insert into #latestAllergyLoopDiurCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'loopDiurAllergyAdverseReaction') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'loopDiurAllergyAdverseReaction') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAddisonsCode
IF OBJECT_ID('tempdb..#latestAddisonsCode') IS NOT NULL DROP TABLE #latestAddisonsCode
CREATE TABLE #latestAddisonsCode
	(PatID int, latestAddisonsCodeDate date, latestAddisonsCode varchar(512));
insert into #latestAddisonsCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'addisons') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'addisons') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestGoutCode
IF OBJECT_ID('tempdb..#latestGoutCode') IS NOT NULL DROP TABLE #latestGoutCode
CREATE TABLE #latestGoutCode
	(PatID int, latestGoutCodeDate date, latestGoutCode varchar(512));
insert into #latestGoutCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'gout') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'gout') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestGoutDrug
IF OBJECT_ID('tempdb..#latestGoutDrug') IS NOT NULL DROP TABLE #latestGoutDrug
CREATE TABLE #latestGoutDrug
	(PatID int, latestGoutDrugDate date, latestGoutDrug varchar(512));
insert into #latestGoutDrug
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'goutDrugs') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'goutDrugs') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestCalcium i.e. latest calcium blood test result
IF OBJECT_ID('tempdb..#latestCalcium') IS NOT NULL DROP TABLE #latestCalcium
CREATE TABLE #latestCalcium
	(PatID int, latestCalciumDate date, latestCalcium float, latestCalciumSource varchar(512));
insert into #latestCalcium
		select s.PatID, s.EntryDate, MAX(CodeValue), min(Source) from SIR_ALL_Records as s --max calcium on that day
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'calcium') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'calcium') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestSodium i.e. latest sodium blood test result
IF OBJECT_ID('tempdb..#latestSodium') IS NOT NULL DROP TABLE #latestSodium
CREATE TABLE #latestSodium
	(PatID int, latestSodiumDate date, latestSodium float, latestSodiumSource varchar(512));
insert into #latestSodium
		select s.PatID, s.EntryDate, MIN(CodeValue), min(Source) from SIR_ALL_Records as s --min sodium on that day
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'sodium') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'sodium') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestMinPotassium i.e. latest Potassium blood test result
IF OBJECT_ID('tempdb..#latestMinPotassium') IS NOT NULL DROP TABLE #latestMinPotassium
CREATE TABLE #latestMinPotassium
	(PatID int, latestMinPotassiumDate date, latestMinPotassium float, latestMinPotassiumSource varchar(512));
insert into #latestMinPotassium
		select s.PatID, s.EntryDate, MIN(CodeValue), min(Source) from SIR_ALL_Records as s --min Potassium on that day
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'potassium') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'potassium') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate


--#latestMaxPotassium i.e. latest Potassium blood test result
IF OBJECT_ID('tempdb..#latestMaxPotassium') IS NOT NULL DROP TABLE #latestMaxPotassium
CREATE TABLE #latestMaxPotassium
	(PatID int, latestMaxPotassiumDate date, latestMaxPotassium float, latestMaxPotassiumSource varchar (512));
insert into #latestMaxPotassium
		select s.PatID, s.EntryDate, max(CodeValue), min(Source) from SIR_ALL_Records as s --max Potassium on that day
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'potassium') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'potassium') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAScode
IF OBJECT_ID('tempdb..#latestAScode') IS NOT NULL DROP TABLE #latestAScode
CREATE TABLE #latestAScode
	(PatID int, latestAScodeDate date, latestAScode varchar(512));
insert into #latestAScode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'AS') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'AS') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestASrepairCode
IF OBJECT_ID('tempdb..#latestASrepairCode') IS NOT NULL DROP TABLE #latestASrepairCode
CREATE TABLE #latestASrepairCode
	(PatID int, latestASrepairCodeDate date, latestASrepairCode varchar(512));
insert into #latestASrepairCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'ASrepair') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'ASrepair') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestMIcode
IF OBJECT_ID('tempdb..#latestMIcode') IS NOT NULL DROP TABLE #latestMIcode
CREATE TABLE #latestMIcode
	(PatID int, latestMIcodeDate date, latestMIcode varchar(512));
insert into #latestMIcode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'MInow') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'MInow') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestPorphyriaCode
IF OBJECT_ID('tempdb..#latestPorphyriaCode') IS NOT NULL DROP TABLE #latestPorphyriaCode
CREATE TABLE #latestPorphyriaCode
	(PatID int, latestPorphyriaCodeDate date, latestPorphyriaCode varchar(512));
insert into #latestPorphyriaCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'porphyria') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'porphyria') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestHeartBlockCode
IF OBJECT_ID('tempdb..#latestHeartBlockCode') IS NOT NULL DROP TABLE #latestHeartBlockCode
CREATE TABLE #latestHeartBlockCode
	(PatID int, latestHeartBlockCodeDate date, latestHeartBlockCode varchar(512));
insert into #latestHeartBlockCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = '2/3heartBlock') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = '2/3heartBlock') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestSickSinusCode
IF OBJECT_ID('tempdb..#latestSickSinusCode') IS NOT NULL DROP TABLE #latestSickSinusCode
CREATE TABLE #latestSickSinusCode
	(PatID int, latestSickSinusCodeDate date, latestSickSinusCode varchar(512));
insert into #latestSickSinusCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'sickSinus') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'sickSinus') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestPacemakerCode
IF OBJECT_ID('tempdb..#latestPacemakerCode') IS NOT NULL DROP TABLE #latestPacemakerCode
CREATE TABLE #latestPacemakerCode
	(PatID int, latestPacemakerCodeDate date, latestPacemakerCode varchar(512));
insert into #latestPacemakerCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'pacemakerDefib') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'pacemakerDefib') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestPulse
IF OBJECT_ID('tempdb..#latestPulse') IS NOT NULL DROP TABLE #latestPulse
CREATE TABLE #latestPulse
	(PatID int, latestPulseDate date, latestPulseValue int);
insert into #latestPulse
		select s.PatID, s.EntryDate, MIN(CodeValue) from SIR_ALL_Records as s --min pulse on the latest day
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'pulseRate') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'pulseRate') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAsthmaCode
IF OBJECT_ID('tempdb..#latestAsthmaCode') IS NOT NULL DROP TABLE #latestAsthmaCode
CREATE TABLE #latestAsthmaCode
	(PatID int, latestAsthmaCodeDate date, latestAsthmaCode varchar(512));
insert into #latestAsthmaCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] in ('asthmaQof', 'asthmaOther', 'asthmaSpiro', 'asthmaReview', 'asthmaRcp6', 'asthmaDrugs')) and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] in ('asthmaQof', 'asthmaOther', 'asthmaSpiro', 'asthmaReview', 'asthmaRcp6', 'asthmaDrugs')) and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate

--#latestAsthmaPermExCode
IF OBJECT_ID('tempdb..#latestAsthmaPermExCode') IS NOT NULL DROP TABLE #latestAsthmaPermExCode
CREATE TABLE #latestAsthmaPermExCode
	(PatID int, latestAsthmaPermExCodeDate date, latestAsthmaPermExCode varchar(512));
insert into #latestAsthmaPermExCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'asthmaPermEx') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'asthmaPermEx') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate


--#latestPhaeoCode
IF OBJECT_ID('tempdb..#latestPhaeoCode') IS NOT NULL DROP TABLE #latestPhaeoCode
CREATE TABLE #latestPhaeoCode
	(PatID int, latestPhaeoCodeDate date, latestPhaeoCode varchar(512));
insert into #latestPhaeoCode
	(PatID, latestPhaeoCodeDate, latestPhaeoCode)
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'phaeo') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'phaeo') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate


--#latestPosturalHypoCode
IF OBJECT_ID('tempdb..#latestPosturalHypoCode') IS NOT NULL DROP TABLE #latestPosturalHypoCode
CREATE TABLE #latestPosturalHypoCode
	(PatID int, latestPosturalHypoCodeDate date, latestPosturalHypoCode varchar(512));
insert into #latestPosturalHypoCode
		select s.PatID, s.EntryDate, MAX(Rubric) from SIR_ALL_Records as s
	  		inner join
	  			(
				 select PatID, MAX(EntryDate) as codeDate from SIR_ALL_Records
				 where ReadCode in (select code from codeGroups where [group] = 'posturalHypo') and EntryDate < @refdate
				 and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
				 group by PatID
	  			) sub on sub.PatID = s.PatID and sub.codeDate = s.EntryDate
		where
			ReadCode in (select code from codeGroups where [group] = 'posturalHypo') and
			s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
		group by s.PatID, s.EntryDate


--#impOppsData
--all data from above combined into one table
IF OBJECT_ID('tempdb..#impOppsData') IS NOT NULL DROP TABLE #impOppsData
CREATE TABLE #impOppsData
	(PatID int,
		latestPalCodeDate date, latestPalCode varchar(512),
		latestPalPermExCodeDate date, latestPalPermExCode varchar(512),
		latestFrailCodeDate date, latestFrailCode varchar(512),
		latestHouseBedboundCodeDate date, latestHouseBedboundCode varchar(512),
		latestHouseBedboundPermExCodeDate date, latestHouseBedboundPermExCode varchar(512),
		latestCkd3rdInviteCodeDate date, latestCkd3rdInviteCode varchar(512),
		numberOfCkdInviteCodesThisFinancialYear int,
		latestWhiteCoatCodeDate date, latestWhiteCoatCode varchar(512),
		noPrimCareContactInLastYear int,
		secondLatestSbpDate date, secondLatestSbp int,
		secondLatestDbpDate date, secondLatestDbp int,
		secondLatestBpControlled int,
		latestMedOptimisation varchar(512), latestMedOptimisationDate date, latestMedOptimisationIngredient varchar(512), latestMedOptimisationDose float, latestMedOptimisationFamily varchar(512),
		latestMedAdherenceDate date, latestMedAdherenceIngredient varchar(512), latestMedAdherenceDose float, latestMedAdherenceFamily varchar(512),
		latestAllergyThiazideCodeDate date, latestAllergyThiazideCode varchar(512),
		latestAllergyACEIcodeDate date, latestAllergyACEIcode varchar(512),
		latestAllergyARBcodeDate date, latestAllergyARBcode varchar(512),
		latestAllergyCCBcodeDate date, latestAllergyCCBcode varchar(512),
		latestAllergyBBcodeDate date, latestAllergyBBcode varchar(512),
		latestAllergyPotSpareDiurCodeDate date, latestAllergyPotSpareDiurCode varchar(512),
		latestAllergyAlphaCodeDate date, latestAllergyAlphaCode varchar(512),
		latestAllergyLoopDiurCodeDate date, latestAllergyLoopDiurCode varchar(512),
		latestAddisonsCodeDate date, latestAddisonsCode varchar(512),
		latestGoutCodeDate date, latestGoutCode varchar(512),
		latestGoutDrugDate date, latestGoutDrug varchar(512),
		latestCalciumDate date, latestCalcium float, latestCalciumSource varchar(512),
		latestSodiumDate date, latestSodium float, latestSodiumSource varchar(512),
		latestMinPotassiumDate date, latestMinPotassium float, latestMinPotassiumSource varchar(512),
		latestMaxPotassiumDate date, latestMaxPotassium float, latestMaxPotassiumSource varchar (512),
		latestAScodeDate date, latestAScode varchar(512),
		latestASrepairCodeDate date, latestASrepairCode varchar(512),
		latestMIcodeDate date, latestMIcode varchar(512),
		latestPorphyriaCodeDate date, latestPorphyriaCode varchar(512),
		latestHeartBlockCodeDate date, latestHeartBlockCode varchar(512),
		latestSickSinusCodeDate date, latestSickSinusCode varchar(512),
		latestPacemakerCodeDate date, latestPacemakerCode varchar(512),
		latestPulseDate date, latestPulseValue int,
		latestAsthmaCodeDate date, latestAsthmaCode varchar(512),
		latestAsthmaPermExCodeDate date, latestAsthmaPermExCode varchar(512),
		latestPhaeoCodeDate date, latestPhaeoCode varchar(512),
		latestPosturalHypoCodeDate date, latestPosturalHypoCode varchar(512)
	);
insert into #impOppsData
select a.PatID,
		latestPalCodeDate, latestPalCode,
		latestPalPermExCodeDate, latestPalPermExCode,
		latestFrailCodeDate, latestFrailCode,
		latestHouseBedboundCodeDate, latestHouseBedboundCode,
		latestHouseBedboundPermExCodeDate, latestHouseBedboundPermExCode,
		latestCkd3rdInviteCodeDate, latestCkd3rdInviteCode,
		numberOfCkdInviteCodesThisFinancialYear,
		latestWhiteCoatCodeDate, latestWhiteCoatCode,
		noPrimCareContactInLastYear,
		secondLatestSbpDate, secondLatestSbp,
		secondLatestDbpDate, secondLatestDbp,
		secondLatestBpControlled,

		latestMedOptimisation, latestMedOptimisationDate, latestMedOptimisationIngredient, latestMedOptimisationDose, latestMedOptimisationFamily,
		latestMedAdherenceDate, latestMedAdherenceIngredient, latestMedAdherenceDose, latestMedAdherenceFamily,

		latestAllergyThiazideCodeDate, latestAllergyThiazideCode,
		latestAllergyACEIcodeDate, latestAllergyACEIcode,
		latestAllergyARBcodeDate, latestAllergyARBcode,
		latestAllergyCCBcodeDate, latestAllergyCCBcode,
		latestAllergyBBcodeDate, latestAllergyBBcode,
		latestAllergyPotSpareDiurCodeDate, latestAllergyPotSpareDiurCode,
		latestAllergyAlphaCodeDate, latestAllergyAlphaCode,
		latestAllergyLoopDiurCodeDate, latestAllergyLoopDiurCode,
		latestAddisonsCodeDate, latestAddisonsCode,
		latestGoutCodeDate, latestGoutCode,
		latestGoutDrugDate, latestGoutDrug,
		latestCalciumDate, latestCalcium, latestCalciumSource,
		latestSodiumDate, latestSodium, latestSodiumSource,
		latestMinPotassiumDate, latestMinPotassium, latestMinPotassiumSource,
		latestMaxPotassiumDate, latestMaxPotassium, latestMaxPotassiumSource,
		latestAScodeDate, latestAScode,
		latestASrepairCodeDate, latestASrepairCode,
		latestMIcodeDate, latestMIcode,
		latestPorphyriaCodeDate, latestPorphyriaCode,
		latestHeartBlockCodeDate, latestHeartBlockCode,
		latestSickSinusCodeDate, latestSickSinusCode,
		latestPacemakerCodeDate, latestPacemakerCode,
		latestPulseDate, latestPulseValue,
		latestAsthmaCodeDate, latestAsthmaCode,
		latestAsthmaPermExCodeDate, latestAsthmaPermExCode,
		latestPhaeoCodeDate, latestPhaeoCode,
		latestPosturalHypoCodeDate, latestPosturalHypoCode
from #eligiblePopulationAllData as a
		left outer join (select PatID, latestPalCodeDate, latestPalCode from #latestPalCode) b on b.PatID = a.PatID
		left outer join (select PatID, latestPalPermExCodeDate, latestPalPermExCode from #latestPalPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestFrailCodeDate, latestFrailCode from #latestFrailCode) d on d.PatID = a.PatID
		left outer join (select PatID, latestHouseBedboundCodeDate, latestHouseBedboundCode from #latestHouseBedboundCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestHouseBedboundPermExCodeDate, latestHouseBedboundPermExCode from #latestHouseBedboundPermExCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestCkd3rdInviteCodeDate, latestCkd3rdInviteCode from #latestCkd3rdInviteCode) g on g.PatID = a.PatID
		left outer join (select PatID, numberOfCkdInviteCodesThisFinancialYear from #numberOfCkdInviteCodesThisFinancialYear) h on h.PatID = a.PatID
		left outer join (select PatID, latestWhiteCoatCodeDate, latestWhiteCoatCode from #latestWhiteCoatCode) i on i.PatID = a.PatID
		left outer join (select PatID, noPrimCareContactInLastYear from #noPrimCareContactInLastYear) j on j.PatID = a.PatID
		left outer join (select PatID, secondLatestSbpDate, secondLatestSbp from #secondLatestSbp) pp on pp.PatID = a.PatID
		left outer join (select PatID, secondLatestDbpDate, secondLatestDbp from #secondLatestDbp) qq on qq.PatID = a.PatID
		left outer join (select PatID, secondLatestBpControlled from #secondLatestBpControlled) ss on ss.PatID = a.PatID
		left outer join (select PatID, latestMedOptimisation, latestMedOptimisationDate, latestMedOptimisationIngredient, latestMedOptimisationDose, latestMedOptimisationFamily from #latestMedOptimisation) l on l.PatID = a.PatID
		left outer join (select PatID, latestMedAdherenceDate, latestMedAdherenceIngredient, latestMedAdherenceDose, latestMedAdherenceFamily from #latestMedAdherence) m on m.PatID = a.PatID
		left outer join (select PatID, latestAllergyThiazideCodeDate, latestAllergyThiazideCode from #latestAllergyThiazideCode) o on o.PatID = a.PatID
		left outer join (select PatID, latestAllergyACEIcodeDate, latestAllergyACEIcode from #latestAllergyACEIcode) p on p.PatID = a.PatID
		left outer join (select PatID, latestAllergyARBcodeDate, latestAllergyARBcode from #latestAllergyARBcode) q on q.PatID = a.PatID
		left outer join (select PatID, latestAllergyCCBcodeDate, latestAllergyCCBcode  from #latestAllergyCCBcode) r on r.PatID = a.PatID
		left outer join (select PatID, latestAllergyBBcodeDate, latestAllergyBBcode from #latestAllergyBBcode) s on s.PatID = a.PatID
		left outer join (select PatID, latestAllergyPotSpareDiurCodeDate, latestAllergyPotSpareDiurCode from #latestAllergyPotSpareDiurCode) t on t.PatID = a.PatID
		left outer join (select PatID, latestAllergyAlphaCodeDate, latestAllergyAlphaCode from #latestAllergyAlphaCode) u on u.PatID = a.PatID
		left outer join (select PatID, latestAllergyLoopDiurCodeDate, latestAllergyLoopDiurCode from #latestAllergyLoopDiurCode) v on v.PatID = a.PatID
		left outer join (select PatID, latestAddisonsCodeDate, latestAddisonsCode from #latestAddisonsCode) w on w.PatID = a.PatID
		left outer join (select PatID, latestGoutCodeDate, latestGoutCode  from #latestGoutCode) x on x.PatID = a.PatID
		left outer join (select PatID, latestGoutDrugDate, latestGoutDrug  from #latestGoutDrug) y on y.PatID = a.PatID
		left outer join (select PatID, latestCalciumDate, latestCalcium, latestCalciumSource  from #latestCalcium) z on z.PatID = a.PatID
		left outer join (select PatID, latestSodiumDate, latestSodium, latestSodiumSource from #latestSodium) aa on aa.PatID = a.PatID
		left outer join (select PatID, latestMinPotassiumDate, latestMinPotassium, latestMinPotassiumSource from #latestMinPotassium) bb on bb.PatID = a.PatID
		left outer join (select PatID, latestMaxPotassiumDate, latestMaxPotassium, latestMaxPotassiumSource from #latestMaxPotassium) cc on cc.PatID = a.PatID
		left outer join (select PatID, latestAScodeDate, latestAScode from #latestAScode) dd on dd.PatID = a.PatID
		left outer join (select PatID, latestASrepairCodeDate, latestASrepairCode from #latestASrepairCode) ee on ee.PatID = a.PatID
		left outer join (select PatID, latestMIcodeDate, latestMIcode from #latestMIcode) ff on ff.PatID = a.PatID
		left outer join (select PatID, latestPorphyriaCodeDate, latestPorphyriaCode from #latestPorphyriaCode) gg on gg.PatID = a.PatID
		left outer join (select PatID, latestHeartBlockCodeDate, latestHeartBlockCode from #latestHeartBlockCode) hh on hh.PatID = a.PatID
		left outer join (select PatID, latestSickSinusCodeDate, latestSickSinusCode from #latestSickSinusCode) ii on ii.PatID = a.PatID
		left outer join (select PatID, latestPacemakerCodeDate, latestPacemakerCode from #latestPacemakerCode) jj on jj.PatID = a.PatID
		left outer join (select PatID, latestPulseDate, latestPulseValue from #latestPulse) kk on kk.PatID = a.PatID
		left outer join (select PatID, latestAsthmaCodeDate, latestAsthmaCode from #latestAsthmaCode) ll on ll.PatID = a.PatID
		left outer join (select PatID, latestAsthmaPermExCodeDate, latestAsthmaPermExCode from #latestAsthmaPermExCode) mm on mm.PatID = a.PatID
		left outer join (select PatID, latestPhaeoCodeDate, latestPhaeoCode from #latestPhaeoCode) nn on nn.PatID = a.PatID
		left outer join (select PatID, latestPosturalHypoCodeDate, latestPosturalHypoCode from #latestPosturalHypoCode) oo on oo.PatID = a.PatID
where denominator = 1 and numerator = 0

							---------------------------------------------------------------
							-------------------MEDICATION SUGGESTIONS----------------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#medSuggestion') IS NOT NULL DROP TABLE #medSuggestion
CREATE TABLE #medSuggestion
	(PatID int, family varchar(max), start_or_inc varchar(12), reasonText varchar(max), usefulInfo varchar(max), reasonNumber int, priority int);
insert into #medSuggestion

--IMPORTANT NOTE
--because #htnmeds has multiple rows per patient for each drug they are on:
--1) to state whether patients are on or not on combinations of medications, they have to be written separately
	--e.g. to say a patient is not on an acei and also not on an arb this has to be written:
	--PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI') and PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
	--not:
	--PatID not in (select PatID from #htnMeds where currentMedFamily in ('ACEI','ARB'))
	--because the second example is looking for rows where a medication is BOTH an acei AND an arb, which is impossible
--2) to state that a patient is NOT on a medication, it has to be written that: 
	--'they are NOT in the group of patients prescribed that medication'
	--e.g. PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'ACEI')
	--not, 'they are in the group of patients NOT prescribed that medication'
	--e.g. PatID in (select PatID from #htnMeds where currentMedFamily != 'ACEI')
	--because in the second example, the patient may have ANOTHER row of medication in the table that is not an acei, and so will still be returned

--1st line: start ACEI
	--not on htn meds OR on htn meds but not ace/arb
	--AND 
			--<55 or or is a dm or is a prot patient
			--or (>= 55 AND is not dm and is not a prot patient) AND has CI/allergy to CCB
		--OR on htn meds including a CCB but not ace/arb
	--AND no allergies/CIs to ACE-I
select distinct a.PatID,
	'ACE inhibitor (e.g.'+
	--<a href="http://dx.doi.org/10.18578/BNF.437242180" title="BNF" target="_blank">
	' lisinopril 5mg or 10mg'+
	--</a>
	')' 
	as family,
	'Start' as start_or_inc,
	case 
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'CCB')
		then '<li>Patient has hypertension but isn''t prescribed an ACE inhibitor, ARB or CCB. ' +
			case when age < 55 then 'Patient is &lt; 55 years old. ' else '' end +
			case when dmPatient = 1 then 'Patient has diabetes. ' else '' end +
			case when protPatient = 1 then 'Patient''s latest ACR was &gt; 70. ' else '' end
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
		then '<li>Patient has hypertension and is prescribed a CCB but not an ACE inhibitor or ARB.'
	else ''
	end + '</li><li>' +
	case 
		when age > 54 and ((latestAllergyCCBcode is not null and latestAScode is not null and (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) and latestPorphyriaCode is not null))
		then 'Patient is 55 years or older, so NICE usually recommends starting a CCB <strong>but</strong> there is a documented contraindication (' +
			case when latestAllergyCCBcode is not null then latestAllergyCCBcode + ' on ' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) + '; ' else '' end +
			case when latestAScode is not null then latestAScode + ' on ' + CONVERT(VARCHAR, latestAScodeDate, 3) + '; ' else '' end +
			case when latestMIcode is not null then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
			case when latestMIcodeDate > DATEADD(month, -1, @refdate) then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
			case when latestPorphyriaCode is not null then latestPorphyriaCode + ' on ' + CONVERT(VARCHAR, latestPorphyriaCodeDate, 3) + '; ' else '' end +
			').'
	else '' +
	' Therefore NICE recommends starting an ACE inhibitor (patient has no documented allergies or contra-indications).</li></ul>'
	end as reasonText,
	(select text from regularText where [textId] = 'linkNiceAceiArbCkd') as usefulInfo,
	(case when age < 55 then 1 else 0 end) + (case when dmPatient = 1 then 1 else 0 end) + (case when protPatient = 1 then 1 else 0 end) as reasonNumber,
	2 as priority
from #impOppsData as a
	left outer join (select PatID, currentMedFamily from #htnMeds) as b on b.PatID = a.PatID
	left outer join (select PatID, dmPatient, protPatient, age from #eligiblePopulationAllData) as c on c.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	and
	--not on htn meds OR on htn meds but not ace/arb
	--AND 
			--<55 or is a dm or is a prot patient
			--or (>= 55 AND is not dm and is not a prot patient) AND has CI/allergy to CCB
		--OR on htn meds including a CCB but not ace/arb
		(
			(
				(
					a.PatID not in (select PatID from #htnMeds) --not on htn meds
						or ( --OR on htn meds but not ace/arb
							a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI') 
							and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
							)
				)
					and 
					(
						age < 55 or dmPatient = 1 or protPatient = 1 --<55 or is a dm or is a prot patient
						or
						(
							age > 54 --or >= 55 AND is not dm and is not a prot patient
							and ((latestAllergyCCBcode is not null and latestAScode is not null and (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) and latestPorphyriaCode is not null)) --AND has CI/allergy to CCB
						) 
					)
			)
			or 
			( --OR on htn meds including a CCB but not ace/arb
				a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
				and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI')
				and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
			)
		)
	and (latestAllergyACEIcode is null and latestMaxPotassium < 5.1) --no CIs: http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!prescribinginfosub

union
--1st line (alternative): start ARB
--SAME AS ACEI ABOVE + ALLERGY TO ACEI
select distinct a.PatID,
	'ARB (e.g. '+
	--<a href="http://dx.doi.org/10.18578/BNF.958956352" title="BNF" target="_blank">
	'losartan 25mg or 50mg'+
	--</a>
	')' as family,
	'Start' as start_or_inc,
	case 
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'CCB')
		then '<li>Patient has hypertension but isn''t prescribed an ACE inhibitor, ARB or CCB. ' +
			case when age < 55 then 'Patient is &lt; 55 years old. ' else '' end +
			case when dmPatient = 1 then 'Patient has diabetes. ' else '' end +
			case when protPatient = 1 then 'Patient''s latest ACR was &gt; 70. ' else '' end
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
		then '<li>Patient has hypertension and is prescribed a CCB but not an ACE inhibitor or ARB'
	else ''
	end + '</li><li>' +
	case 
		when age > 54 and ((latestAllergyCCBcode is not null and latestAScode is not null and (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) and latestPorphyriaCode is not null))
		then 'Patient is 55 years or older, so NICE usually recommends starting a CCB <strong>but</strong> there is a documented contraindication (' +
			case when latestAllergyCCBcode is not null then latestAllergyCCBcode + ' on ' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) + '; ' else '' end +
			case when latestAScode is not null then latestAScode + ' on ' + CONVERT(VARCHAR, latestAScodeDate, 3) + '; ' else '' end +
			case when latestMIcode is not null then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
			case when latestMIcodeDate > DATEADD(month, -1, @refdate) then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
			case when latestPorphyriaCode is not null then latestPorphyriaCode + ' on ' + CONVERT(VARCHAR, latestPorphyriaCodeDate, 3) + '; ' else '' end +
		'), as well as contraindications to ACE inhibitors (' +
				case
					when latestAllergyACEIcode is not null then latestAllergyACEIcode + 'on' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3)
					when latestAllergyACEIcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				end +
		'). Therefore NICE recommends starting an ARB instead.</li></ul>'
	else ''	
	end as reasonText,
	(select text from regularText where [textId] = 'linkNiceAceiArbCkd') as usefulInfo,
	(case when age < 55 then 1 else 0 end) + (case when dmPatient = 1 then 1 else 0 end) + (case when protPatient = 1 then 1 else 0 end) as reasonNumber,
	2 as priority
from #impOppsData as a
	left outer join (select PatID, currentMedFamily from #htnMeds) as b on b.PatID = a.PatID
	left outer join (select PatID, dmPatient, protPatient, age from #eligiblePopulationAllData) as c on c.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	and
	--not on htn meds OR on htn meds but not ace/arb
	--AND 
			--<55 or is a dm or is a prot patient
			-- or (>= 55 AND is not dm and is not a prot patient) AND has CI/allergy to CCB
		--OR on htn meds including a CCB but not ace/arb
		(
			(
				(
					a.PatID not in (select PatID from #htnMeds) --not on htn meds
						or ( --OR on htn meds but not ace/arb
							a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI') 
							and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
							)
				)
					and 
					(
						age < 55 or dmPatient = 1 or protPatient = 1 --<55 or is a dm or is a prot patient
						or
						(
							age > 54 --or (>= 55 AND is not dm and is not a prot patient)
							and ((latestAllergyCCBcode is not null and latestAScode is not null and (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) and latestPorphyriaCode is not null)) --AND has CI/allergy to CCB
						) 
					)
			)
			or 
			( --OR on htn meds including a CCB but not ace/arb
				a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
				and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI')
				and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
			)
		)
	and (latestAllergyACEIcode is not null) --allergy to ACEI
	and (latestAllergyARBcode is null and latestMaxPotassium < 5.1) --no CIs to ARBs: http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!prescribinginfosub

union

--1st line (also): start CCB
--OPPOSITE INIDICATIONS TO ACE/ARB i.e.
	--not on htn meds OR on htn meds but not CCB
	--AND 
			--(<55 or is a dm ro is a prot patient) AND has CI/allergy to ACE AND ARB
			--OR >= 55
		--OR on htn meds including an ace/arb but not CCB
	--AND no allergies/CIs to CCB
select distinct a.PatID,
	'Calcium Channel Blocker (e.g. '+
	--<a href="http://dx.doi.org/10.18578/BNF.109201061" title="BNF" target="_blank">
	'amlodipine 5mg'+
	--</a>
	')' as family,
	'Start' as start_or_inc,
	case 
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ACEI') and a.PatID not in (select PatID from #htnMeds where currentMedFamily = 'ARB')
		then '<li>Patient has hypertension but isn''t prescribed an ACE inhibitor, ARB or CCB' +
			case when age > 54 then '. Patient is 55 years or older' else '' end --+
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')
		then '<li>Patient has hypertension and is prescribed an ACE inhibitor or ARB but not a CCB'
	else ''
	end + '.</li><li>' +
	case 
		when (age < 55 or dmPatient = 1 or protPatient = 1) and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium >= 5.1)
		then 'Patient ' +
			case when age < 55 then 'is less than 55 years old;' else '' end +
			case when dmPatient = 1 then ' has diabetes;' else '' end +
			case when protPatient = 1 then ' has an ACR &gt; 70' else '' end +
			'. NICE usually recommends an ACE inhibitor or ARB <strong>but</strong> there are documented contraindications(' +
			case
				when latestAllergyACEIcode is not null then latestAllergyACEIcode + 'on' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3)
				when latestAllergyACEIcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
			else ''
			end +
			' and ' +
			case
				when latestAllergyARBcode is not null then latestAllergyARBcode + 'on' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3)
				when latestAllergyARBcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				else ''
			end +
		'). </li><li>'
	else ''
	end +
	'Therefore NICE recommends starting an Calcium Channel Blocker inhibitor (patient has no documented allergies or contra-indications).</li></ul>'
	as reasonText,
	(select text from regularText where [textId] = 'linkNiceCcbHtn') as usefulInfo,
	(case when age > 54 then 1 else 0 end) + (case when dmPatient = 0 then 1 else 0 end) + (case when protPatient = 0 then 1 else 0 end) as reasonNumber,
	3 as priority
from #impOppsData as a
	left outer join (select PatID, currentMedFamily from #htnMeds) as b on b.PatID = a.PatID
	left outer join (select PatID, bpMeasuredOK, bpControlledOk, age, dmPatient, protPatient from #eligiblePopulationAllData) as c on c.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	--not on htn meds OR on htn meds but not CCB
	--AND 
			--(<55 or is a dm or is a prot patient) AND has CI/allergy to ACE AND ARB
			--OR >= 55
		--OR on htn meds including an ace/arb but not CCB
	--AND no allergies/CIs to CCB
	and	(
			(
				(a.PatID not in (select PatID from #htnMeds) or a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'CCB'))
					and 
					(--(<55 or is a dm or is a prot patient) AND has CI/allergy to ACE AND ARB
						((age < 55 or dmPatient = 1 or protPatient = 1) and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium >= 5.1))
						or --OR >= 55
						age > 54 
					)
			)
			or 
			(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
				and 
					(
						a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI')
						or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')
					)
			)
		)
	and (latestAllergyCCBcode is null and latestAScode is null and (latestMIcodeDate is null or latestMIcodeDate < DATEADD(month, -1, @refdate)) and latestPorphyriaCode is null) --no CIs

union
--2nd line: start thiazide
select distinct a.PatID,
	'Indapamide (e.g. '+
	--<a href="http://dx.doi.org/10.18578/BNF.748067014" title="BNF" target="_blank">
	'2.5mg'+
	--</a>
	')' as family,
	'Start' as start_or_inc,
	 case
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') and (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB) and a Calcium Channel Blocker, but not a thiazide diuretic.</li>' +
			'<li>NICE recommends starting Indapamide (patient has no documented allergies or contra-indications).</li></ul>'
		when (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')) and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB) and there is a documented contraindication to Calcium Channel Blockers' +
				case
					when latestAllergyCCBcode is not null then '(' + latestAllergyCCBcode + 'on' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) +')'
					when latestAllergyCCBcode is null then ''
				end +
			', so Indapamide is preferred.</li></ul>'
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0) then
			'<li>Patient is prescribed a Calcium Channel Blocker and there are documented contraindications to both ACE Inhibitors (' +
				(case
					when latestAllergyACEIcode is not null then latestAllergyACEIcode + 'on' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3)
					when latestAllergyACEIcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				end )+
			') and ARBs (' +
				(case
					when latestAllergyARBcode is not null then latestAllergyARBcode + 'on' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3)
					when latestAllergyARBcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				end) +
			'), so Indapamide is preferred.</li></ul>'
		when (a.PatID not in (select PatID from #htnMeds) and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0) and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)) then
			'<li>Patient is not prescribed anti-hypertensive medication.</li>' +
			'<li><strong>But</strong> there are contra-indications to ACE Inhibitors (' +
				(case
					when latestAllergyACEIcode is not null then latestAllergyACEIcode + 'on' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3)
					when latestAllergyACEIcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				end) +
			') and ARBs (' +
				(case
					when latestAllergyARBcode is not null then latestAllergyARBcode + 'on' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3)
					when latestAllergyARBcode is null and latestMaxPotassium > 5.0 then 'potassium ' + STR(latestMaxPotassium) + 'on' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3)
				end) +
			') and CCBs' +
				(case
					when latestAllergyCCBcode is not null then '(' + latestAllergyCCBcode + 'on' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) +')'
					when latestAllergyCCBcode is null then ''
				end) +
			', so Indapamide is preferred.</li></ul>'
		else ''
	end as reasonText,
	(select text from regularText where [textId] = 'linkNiceThiazideHtn') as usefulInfo,
	1 as reasonNumber,
	3 as priority
from #impOppsData as a
	left outer join (select PatID, currentMedFamily from #htnMeds) as b on b.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	and
	(	
		( --at stage 2 (i.e. on an ACEI or ARB, and on a CCB)
			a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
			and (
					a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI')
					or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')
				)
		) 
		or --on ACEI / ARB but CI to CCB
		(
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null))
		or --on CCB but CI to both ACEI and ARB
		(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0))
		or --not on htn meds but CI to CCB, ACEI and ARB
		(a.PatID not in (select PatID from #htnMeds) and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0) and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null))
	)
	and (latestAllergyThiazideCode is null and latestCalcium < 3 and latestSodium > 130 and latestGoutCode is null) --no CIs
	and a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')  --not already on a thiazide
	and a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'DIUR_LOOP') --not already on a loop diuretic

union
--3rd line: spironolactone, alpha, or beta
select distinct a.PatID,
	case
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily ='DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null then 'Spironolactone (e.g. '+
		-- <a http://dx.doi.org/10.18578/BNF.213718345" title="Spironolactone BNF" target="_blank">
		'25mg'+
		--</a>
		')'
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null then 'Alpha Blocker (e.g. '+
		--<a http://dx.doi.org/10.18578/BNF.782101311" title="Doxazosin BNF" target="_blank" >
		'Doxazosin 1mg'+
		--</a>
		')'
		when a.PatID not in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null then 'Beta Blocker (e.g. '+
		--<a http://dx.doi.org/10.18578/BNF.281805035" title="BNF" target="_blank">
		'Bisoprolol 5mg'+
		--</a>
		')'
		else ''
	end as family,
	'Start' as start_or_inc,
	case
		when (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')) 
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB), Calcium Channel Blocker, and Thiazide-type Diuretic.</li>'
		when (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')) 
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null) 
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB) and Calcium Channel Blocker, and has a contraindication to Thiazide-type diuretics (' +
				case when latestAllergyThiazideCode is not null then latestAllergyThiazideCode + ' on ' + CONVERT(VARCHAR, latestAllergyThiazideCodeDate, 3) + '; ' else '' end +
				case when latestCalcium >2.9 then 'latest calcium ' +  Str(latestCalcium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestCalciumDate, 3) + '; ' else '' end +
				case when latestSodium < 130 then 'latest sodium ' +  Str(latestSodium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestSodiumDate, 3) + '; ' else '' end +
				case when latestGoutCode is not null then latestGoutCode + ' on ' + CONVERT(VARCHAR, latestGoutCodeDate, 3) + '; ' else '' end +
			').</li>'
		when (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')) 
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null) 
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB) and has contraindications to Calcium Channel Blockers (' +
				case when latestAllergyCCBcode is not null then latestAllergyCCBcode + ' on ' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) + '; ' else '' end +
				case when latestAScode is not null then latestAScode + ' on ' + CONVERT(VARCHAR, latestAScodeDate, 3) + '; ' else '' end +
				case when latestMIcode is not null then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestMIcodeDate > DATEADD(month, -1, @refdate) then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestPorphyriaCode is not null then latestPorphyriaCode + ' on ' + CONVERT(VARCHAR, latestPorphyriaCodeDate, 3) + '; ' else '' end +
			') and Thiazide-type Diuretics (' +
				case when latestAllergyThiazideCode is not null then latestAllergyThiazideCode + ' on ' + CONVERT(VARCHAR, latestAllergyThiazideCodeDate, 3) + '; ' else '' end +
				case when latestCalcium >2.9 then 'latest calcium ' +  Str(latestCalcium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestCalciumDate, 3) + '; ' else '' end +
				case when latestSodium < 130 then 'latest sodium ' +  Str(latestSodium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestSodiumDate, 3) + '; ' else '' end +
				case when latestGoutCode is not null then latestGoutCode + ' on ' + CONVERT(VARCHAR, latestGoutCodeDate, 3) + '; ' else '' end +
			').</li>'
		when (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB')) 
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null) 
		then '<li>Patient is prescribed an ACE Inhibitor (or ARB) and Thiazide-type Diuretic, but has contraindications to Calcium Channel Blockers (' +
				case when latestAllergyCCBcode is not null then latestAllergyCCBcode + ' on ' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) + '; ' else '' end +
				case when latestAScode is not null then latestAScode + ' on ' + CONVERT(VARCHAR, latestAScodeDate, 3) + '; ' else '' end +
				case when latestMIcode is not null then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestMIcodeDate > DATEADD(month, -1, @refdate) then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestPorphyriaCode is not null then latestPorphyriaCode + ' on ' + CONVERT(VARCHAR, latestPorphyriaCodeDate, 3) + '; ' else '' end +
			').</li>'
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0) 
		then '<li>Patient is prescribed a Calcium Channel Blocker and Thiazide-type Diuretic, but has contraindications to ACE Inhibitors and ARBs (' +
				case when latestAllergyACEIcode is not null then latestAllergyACEIcode + ' on ' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3) + '; ' else '' end +
				case when latestAllergyARBcode is not null then latestAllergyARBcode + ' on ' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3) + '; ' else '' end +
				case when latestMaxPotassium > 5.0 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end +
			').</li>'
		when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null)
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0) 
		then '<li>Patient is prescribed a Calcium Channel Blocker but has contraindications to Thiazide-type Diuretics (' +
				case when latestAllergyThiazideCode is not null then latestAllergyThiazideCode + ' on ' + CONVERT(VARCHAR, latestAllergyThiazideCodeDate, 3) + '; ' else '' end +
				case when latestCalcium > 2.9 then 'latest calcium ' +  Str(latestCalcium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestCalciumDate, 3) + '; ' else '' end +
				case when latestSodium < 130 then 'latest sodium ' +  Str(latestSodium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestSodiumDate, 3) + '; ' else '' end +
				case when latestGoutCode is not null then latestGoutCode + ' on ' + CONVERT(VARCHAR, latestGoutCodeDate, 3) + '; ' else '' end +
			') and ACE Inhibitors and ARBs (' +
				case when latestAllergyACEIcode is not null then latestAllergyACEIcode + ' on ' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3) + '; ' else '' end +
				case when latestAllergyARBcode is not null then latestAllergyARBcode + ' on ' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3) + '; ' else '' end +
				case when latestMaxPotassium > 5.0 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end +
			').</li>'
		when a.PatID not in (select PatID from #htnMeds)
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0)
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null) 
		then '<li>Patient is not on antihypertensive medication but has contraindications to ACE Inhibitors and ARBs (' +
				case when latestAllergyACEIcode is not null then latestAllergyACEIcode + ' on ' + CONVERT(VARCHAR, latestAllergyACEIcodeDate, 3) + '; ' else '' end +
				case when latestAllergyARBcode is not null then latestAllergyARBcode + ' on ' + CONVERT(VARCHAR, latestAllergyARBcodeDate, 3) + '; ' else '' end +
				case when latestMaxPotassium > 5.0 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end +
			') and Calcium Channel Blockers (' +
				case when latestAllergyCCBcode is not null then latestAllergyCCBcode + ' on ' + CONVERT(VARCHAR, latestAllergyCCBcodeDate, 3) + '; ' else '' end +
				case when latestAScode is not null then latestAScode + ' on ' + CONVERT(VARCHAR, latestAScodeDate, 3) + '; ' else '' end +
				case when latestMIcode is not null then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestMIcodeDate > DATEADD(month, -1, @refdate) then latestMIcode + ' on ' + CONVERT(VARCHAR, latestMIcodeDate, 3) + '; ' else '' end +
				case when latestPorphyriaCode is not null then latestPorphyriaCode + ' on ' + CONVERT(VARCHAR, latestPorphyriaCodeDate, 3) + '; ' else '' end +
			') and Thiazide-type Diuretics (' +
				case when latestAllergyThiazideCode is not null then latestAllergyThiazideCode + ' on ' + CONVERT(VARCHAR, latestAllergyThiazideCodeDate, 3) + '; ' else '' end +
				case when latestCalcium >2.9 then 'latest calcium ' +  Str(latestCalcium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestCalciumDate, 3) + '; ' else '' end +
				case when latestSodium < 130 then 'latest sodium ' +  Str(latestSodium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestSodiumDate, 3) + '; ' else '' end +
				case when latestGoutCode is not null then latestGoutCode + ' on ' + CONVERT(VARCHAR, latestGoutCodeDate, 3) + '; ' else '' end +
			').</li>'
		else ''
	end +
	'<li>NICE recommends starting either Spironolactone, an Alpha Blocker, or a Beta Blocker.</li>' +
	case
		when
			(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null)
		then '</li>Patient has no contra-indications to any of these medications.</li></ul>'
		when
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') or latestAllergyPotSpareDiurCode is not null or latestMaxPotassium > 4.5 or latestAddisonsCode is not null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null)
		then '</li>Patient is already prescribed, or has a contra-indication to Spironolactone (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'DIUR_POT') else '' end) +
			(case when latestAllergyPotSpareDiurCode is not null then latestAllergyPotSpareDiurCode + ' on ' + CONVERT(VARCHAR, latestAllergyPotSpareDiurCodeDate, 3) + '; ' else '' end) +
			(case when latestMaxPotassium > 4.5 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end) +
			(case when latestAddisonsCode is not null then latestAddisonsCode + ' on ' + CONVERT(VARCHAR, latestAddisonsCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		when
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') or latestAllergyPotSpareDiurCode is not null or latestMaxPotassium > 4.5 or latestAddisonsCode is not null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ALPHA') or latestAllergyAlphaCode is not null or latestPosturalHypoCode is not null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null)
		then '</li>Patient is already prescribed, or has a contra-indication to Spironolactone (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'DIUR_POT') else '' end) +
			(case when latestAllergyPotSpareDiurCode is not null then latestAllergyPotSpareDiurCode + ' on ' + CONVERT(VARCHAR, latestAllergyPotSpareDiurCodeDate, 3) + '; ' else '' end) +
			(case when latestMaxPotassium > 4.5 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end) +
			(case when latestAddisonsCode is not null then latestAddisonsCode + ' on ' + CONVERT(VARCHAR, latestAddisonsCodeDate, 3) + '; ' else '' end) +
			') and Alpha Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ALPHA') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'ALPHA') else '' end) +
			(case when latestAllergyAlphaCode is not null then latestAllergyAlphaCode + ' on ' + CONVERT(VARCHAR, latestAllergyAlphaCodeDate, 3) + '; ' else '' end) +
			(case when latestPosturalHypoCode is not null then latestPosturalHypoCode + ' on ' + CONVERT(VARCHAR, latestPosturalHypoCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		when
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') or latestAllergyPotSpareDiurCode is not null or latestMaxPotassium > 4.5 or latestAddisonsCode is not null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily ='BB') or latestAllergyBBcode is not null or latestAsthmaCode is not null or latestPulseValue < 46 or latestPhaeoCode is not null or latestHeartBlockCodeDate is not null or latestSickSinusCodeDate is not null)
		then '</li>Patient is already prescribed, or has a contra-indication to Spironolactone (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'DIUR_POT') else '' end) +
			(case when latestAllergyPotSpareDiurCode is not null then latestAllergyPotSpareDiurCode + ' on ' + CONVERT(VARCHAR, latestAllergyPotSpareDiurCodeDate, 3) + '; ' else '' end) +
			(case when latestMaxPotassium > 4.5 then 'latest potassium ' +  Str(latestMaxPotassium, 3, 0) + ' on ' + CONVERT(VARCHAR, latestMaxPotassiumDate, 3) + '; ' else '' end) +
			(case when latestAddisonsCode is not null then latestAddisonsCode + ' on ' + CONVERT(VARCHAR, latestAddisonsCodeDate, 3) + '; ' else '' end) +
			') and Beta Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily ='BB') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'BB') else '' end) +
			(case when latestAllergyBBcode is not null then latestAllergyBBcode + ' on ' + CONVERT(VARCHAR, latestAllergyBBcodeDate, 3) + '; ' else '' end) +
			(case when latestAsthmaCode is not null then latestAsthmaCode + ' on ' + CONVERT(VARCHAR, latestAsthmaCodeDate, 3) + '; ' else '' end) +
			(case when latestPulseValue < 46 then 'latest pulse ' +  Str(latestPulseValue, 3, 0) + ' on ' + CONVERT(VARCHAR, latestPulseValue, 3) + '; ' else '' end) +
			(case when latestPhaeoCode is not null then latestPhaeoCode + ' on ' + CONVERT(VARCHAR, latestPhaeoCodeDate, 3) + '; ' else '' end) +
			(case when latestHeartBlockCode is not null then latestHeartBlockCode + ' on ' + CONVERT(VARCHAR, latestHeartBlockCodeDate, 3) + '; ' else '' end) +
			(case when latestSickSinusCode is not null then latestSickSinusCode + ' on ' + CONVERT(VARCHAR, latestSickSinusCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		when
			(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily ='ALPHA') or latestAllergyAlphaCode is not null or latestPosturalHypoCode is not null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily ='BB') or latestAllergyBBcode is not null or latestAsthmaCode is not null or latestPulseValue < 46 or latestPhaeoCode is not null or latestHeartBlockCodeDate is not null or latestSickSinusCodeDate is not null)
		then '</li>Patient is already prescribed, or has a contra-indication to Alpha Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ALPHA') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'ALPHA') else '' end) +
			(case when latestAllergyAlphaCode is not null then latestAllergyAlphaCode + ' on ' + CONVERT(VARCHAR, latestAllergyAlphaCodeDate, 3) + '; ' else '' end) +
			(case when latestPosturalHypoCode is not null then latestPosturalHypoCode + ' on ' + CONVERT(VARCHAR, latestPosturalHypoCodeDate, 3) + '; ' else '' end) +
			') and Beta Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'BB') then 'patient is prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'BB') else '' end) +
			(case when latestAllergyBBcode is not null then latestAllergyBBcode + ' on ' + CONVERT(VARCHAR, latestAllergyBBcodeDate, 3) + '; ' else '' end) +
			(case when latestAsthmaCode is not null then latestAsthmaCode + ' on ' + CONVERT(VARCHAR, latestAsthmaCodeDate, 3) + '; ' else '' end) +
			(case when latestPulseValue < 46 then 'latest pulse ' +  Str(latestPulseValue, 3, 0) + ' on ' + CONVERT(VARCHAR, latestPulseDate, 3) + '; ' else '' end) +
			(case when latestPhaeoCode is not null then latestPhaeoCode + ' on ' + CONVERT(VARCHAR, latestPhaeoCodeDate, 3) + '; ' else '' end) +
			(case when latestHeartBlockCode is not null then latestHeartBlockCode + ' on ' + CONVERT(VARCHAR, latestHeartBlockCodeDate, 3) + '; ' else '' end) +
			(case when latestSickSinusCode is not null then latestSickSinusCode + ' on ' + CONVERT(VARCHAR, latestSickSinusCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		when
			(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily ='ALPHA') or latestAllergyAlphaCode is not null or latestPosturalHypoCode is not null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null)
		then '</li>Patient has a contra-indication to Alpha Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ALPHA') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'ALPHA') else '' end) +
			(case when latestAllergyAlphaCode is not null then latestAllergyAlphaCode + ' on ' + CONVERT(VARCHAR, latestAllergyAlphaCodeDate, 3) + '; ' else '' end) +
			(case when latestPosturalHypoCode is not null then latestPosturalHypoCode + ' on ' + CONVERT(VARCHAR, latestPosturalHypoCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		when
			(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily = 'DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null)
			and (a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null)
			and (a.PatID in (select PatID from #htnMeds where currentMedFamily ='BB') or latestAllergyBBcode is not null or latestAsthmaCode is not null or latestPulseValue < 46 or latestPhaeoCode is not null or latestHeartBlockCodeDate is not null or latestSickSinusCodeDate is not null)
		then '</li>Patient has a contra-indication to Beta Blockers (' +
			(case when a.PatID in (select PatID from #htnMeds where currentMedFamily = 'BB') then 'patient is already prescribed ' + (select max(currentMedIngredient) from #currentHTNmeds where currentMedFamily = 'BB') else '' end) +
			(case when latestAllergyBBcode is not null then latestAllergyBBcode + ' on ' + CONVERT(VARCHAR, latestAllergyBBcodeDate, 3) + '; ' else '' end) +
			(case when latestAsthmaCode is not null then latestAsthmaCode + ' on ' + CONVERT(VARCHAR, latestAsthmaCodeDate, 3) + '; ' else '' end) +
			(case when latestPulseValue < 46 then 'latest pulse ' +  Str(latestPulseValue, 3, 0) + ' on ' + CONVERT(VARCHAR, latestPulseDate, 3) + '; ' else '' end) +
			(case when latestPhaeoCode is not null then latestPhaeoCode + ' on ' + CONVERT(VARCHAR, latestPhaeoCodeDate, 3) + '; ' else '' end) +
			(case when latestHeartBlockCode is not null then latestHeartBlockCode + ' on ' + CONVERT(VARCHAR, latestHeartBlockCodeDate, 3) + '; ' else '' end) +
			(case when latestSickSinusCode is not null then latestSickSinusCode + ' on ' + CONVERT(VARCHAR, latestSickSinusCodeDate, 3) + '; ' else '' end) +
			').</li></ul>'
		else ''
	end as reasonText,
		case
			when a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null then (select text from regularText where [textId] = 'linkNiceSpiroHtn')
			when a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null then (select text from regularText where [textId] = 'linkNiceAlphaHtn')
			when a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null then (select text from regularText where [textId] = 'linkNiceBbHtn')
		end as usefulInfo,
	1 as reasonNumber,
	3 as priority
from #impOppsData as a
	left outer join (select PatID, currentMedFamily, currentMedIngredient from #htnMeds) as b on b.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	and
	(--at stage 3 (i.e. on an ACEI or ARB, CCB, and thiazide)
	(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
	and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
	and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
		or --on ACEI / ARB and CCB but CI to thiazide
		(
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null)
		)
		or --on ACEI / ARB but CI to CCB and thiazide
		(
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null)
		)
		or --on ACEI / ARB and thiazide but CI to CCB
		(
			(a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ACEI') or a.PatID in (select PatID from #htnMeds where currentMedFamily = 'ARB'))
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
		)
		or --on CCB and thiazide but CI to ACEI / ARB
		(
			a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB') 
			and a.PatID in (select PatID from #htnMeds where currentMedFamily = 'DIUR_THI')
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0)
		)
		or --on CCB but CI to thiazide and ACEI / ARB
		(
			a.PatID in (select PatID from #htnMeds where currentMedFamily = 'CCB')
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null)
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0)
		)
		or --not on htn meds but CI to ACEI / ARB and CCB and thiazide
		(
			a.PatID not in (select PatID from #htnMeds)
			and ((latestAllergyACEIcode is not null and latestAllergyARBcode is not null) or latestMaxPotassium > 5.0)
			and (latestAllergyCCBcode is not null or latestAScode is not null or (latestMIcodeDate is not null or latestMIcodeDate > DATEADD(month, -1, @refdate)) or latestPorphyriaCode is not null)
			and (latestAllergyThiazideCode is not null or latestCalcium > 2.9 or latestSodium < 130 or latestGoutCode is not null)
		)
	)
	and
	(
		(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='DIUR_POT') and latestAllergyPotSpareDiurCode is null and latestMaxPotassium < 4.6 and latestAddisonsCode is null) --not already on a pot sparing diuretic and no CIs
		or
		(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='ALPHA') and latestAllergyAlphaCode is null and latestPosturalHypoCode is null)--not already on an Alpha and no CIs
		or
		(a.PatID NOT in (select PatID from #htnMeds where currentMedFamily ='BB') and latestAllergyBBcode is null and latestAsthmaCode is null and latestPulseValue > 45 and latestPhaeoCode is null and latestHeartBlockCodeDate is null and latestSickSinusCodeDate is null) --not already on BB and no CIs
	)

union
--increase current medication
select distinct a.PatID,
--	case
--		when currentMedFamily = 'ACEI' and currentMedDose < currentMedMaxDose and latestMaxPotassium < 5.1 then 'ACE inhibitor'
--		when currentMedFamily = 'CCB' and currentMedDose < currentMedMaxDose then 'Calcium Channel Blocker'
--		when currentMedFamily = 'DIUR_THI' and currentMedDose < currentMedMaxDose then 'Thiazide-type Diuretic'
--		when currentMedFamily = 'ARB' and currentMedDose < currentMedMaxDose then 'Angiotension II Receptor Blocker'
--		when currentMedFamily = 'BB' and currentMedDose < currentMedMaxDose then 'Beta Blocker'
--		when currentMedFamily = 'DIUR_POT' and currentMedDose < currentMedMaxDose then 'Potassium-sparing Diuretic'
--		when currentMedFamily = 'ALPHA' and currentMedDose < currentMedMaxDose then 'Alpha Blocker'
--		when currentMedFamily = 'DIUR_LOOP' and currentMedDose < currentMedMaxDose then 'Loop Diuretic'
--	end
	--'<a href="' + BNF + '" target="_blank">' +
	currentMedIngredient
	--+ '</a>'
	COLLATE Latin1_General_CI_AS as family,
	'Increase' as start_or_inc,
	'<li>Patient is currently prescribed ' + currentMedIngredient COLLATE Latin1_General_CI_AS + ' ' +
		case
			when currentMedIngredient COLLATE Latin1_General_CI_AS = 'Bisoprolol' then Str(currentMedDose, 6, 2)
			else Str(currentMedDose, 6)
		end
	+ ' mg per day. <a href="' + BNF + '" target="_blank" title="BNF">Max dose is ' + Str(currentMedMaxDose, 3, 0)+ ' mg per day</a>.</li></ul>' as reasonText,
	'<a href="' + BNF + '" target="_blank" title="BNF">'+ currentMedIngredient COLLATE Latin1_General_CI_AS +' BNF guidance</a>' as usefulInfo,
	1 as reasonNumber,
	2 as priority
from #htnMeds as a
	left outer join (select PatID, age, bpMeasuredOK, bpControlledOk from #eligiblePopulationAllData) as b on b.PatID = a.PatID
	left outer join (select PatID, latestAllergyACEIcode, latestMaxPotassium from #impOppsData) as c on c.PatID = a.PatID
	left outer join (select Ingredient, BNF from drugIngredients) as d on d.Ingredient = a.currentMedIngredient
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	and
	(
		(currentMedFamily = 'ACEI' and currentMedDose < currentMedMaxDose and latestMaxPotassium < 5.1)
		or
		(currentMedFamily = 'CCB' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'DIUR_THI' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'ARB' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'BB' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'DIUR_POT' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'ALPHA' and currentMedDose < currentMedMaxDose)
		or
		(currentMedFamily = 'DIUR_LOOP' and currentMedDose < currentMedMaxDose)
	)

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

--CHECK REGISTERED
select a.PatID,
	'htn.treatment.bp' as indicatorId,
	'Registered?' as actionCat,
--	'No contact' as reasonCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Check this patient is registered' as actionText,
	'Reasoning' +
		'<ul><li>No contact with your practice in the last year.</ul>' +
	'If <strong>not registered</strong> please add code <strong>92...</strong> [#92...] to their records.<br><br>' +
	'If <strong>dead</strong> please add code <strong>9134.</strong> [#9134.] to their records.<br><br>' +
	'Useful information' +
		'<ul><li>' +
			case
					when dmPatient = 1 then (select text from regularText where [textId] = 'linkNiceBpMxCkdDm')
					when dmPatient = 0 then (select text from regularText where [textId] = 'linkNiceBpMxCkd')
			end + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkPilCkdBp') + '</li></ul>'
	as supportingText
from #impOppsData as a
left outer join (select PatID, dmPatient, protPatient from #eligiblePopulationAllData) as b on b.PatID = a.PatID
	where
		noPrimCareContactInLastYear = 1

union

--MEASURE BP
select a.PatID,
	'htn.treatment.bp' as indicatorId,
	'Measure BP' as actionCat,
--	case
--		--No BP + no contact
--		when noPrimCareContactInLastYear = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then 'No BP + no contact'
--		--No BP + contact
--		when noPrimCareContactInLastYear = 0 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then 'No BP + contact'
--		--BP uncontrolled BUT second latest BP controlled (one-off high)
--		when secondLatestBpControlled = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 'BP uncontrolled BUT second latest BP controlled (one-off high)'
--		--BP uncontrolled + medication change after
--		when latestMedOptimisationDate >= latestSbpDate and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 'BP uncontrolled + medication change after'
--		--BP uncontrolled BUT near target
--		when (((dmPatient = 1 or protPatient = 1) and	(b.latestSbp < 140 and b.latestDbp < 90)) or ((dmPatient = 0 and protPatient = 0) and (b.latestSbp < 150 and b.latestDbp < 100))) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 'BP uncontrolled BUT near target'
--	end as reasonCat,
	--No BP + no contact
	(case when noPrimCareContactInLastYear = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then 1 else 0 end) +
	--No BP + contact
	(case when noPrimCareContactInLastYear = 0 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then 1 else 0 end) +
	--BP uncontrolled BUT second latest BP controlled (one-off high)
	(case when secondLatestBpControlled = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 1 else 0 end) +
	--BP uncontrolled + medication change after
	(case when latestMedOptimisationDate >= latestSbpDate and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 1 else 0 end) +
	--BP uncontrolled BUT near target
	(case when (((dmPatient = 1 or protPatient = 1) and	(b.latestSbp < 140 and b.latestDbp < 90)) or ((dmPatient = 0 and protPatient = 0) and (b.latestSbp < 150 and b.latestDbp < 100))) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 1 else 0 end)
	as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Measure this patient''s BP' as actionText,
	'Reasoning' +
		(case
		--No BP
			when a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then '<ul><li>Patient has hypertension and has no BP reading since last April.</ul>'
		--Any BP
			else
				'<ul><li>Patient has hypertension and their last BP was <strong>uncontrolled</strong>: ' +
					case
						when ((dmPatient = 1 or protPatient = 1) and (latestSbp >= 130)) or ((dmPatient = 0 and protPatient = 0) and (latestSbp >= 140)) then '<strong>' + Str(latestSbp) + '</strong>'
						else Str(latestSbp)
					end
				+ '/' +
					case
						when ((dmPatient = 1 or protPatient = 1) and (latestDbp >= 80)) or ((dmPatient = 0 and protPatient = 0) and (latestDbp >= 90)) then '<strong>' + Str(latestDbp) + '</strong>'
						else Str(latestDbp)
					end
				+ ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
				case 
					when sourceSbp = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in the GP record.</li>'
				else ''
				end	+		
				'<li>Target: ' + b.bpTarget + ' - because patient has CKD' +
					case
						when dmPatient = 1 then ' and diabetes'
						when protPatient = 1 then ' and ACR &gt; 70 on ' + CONVERT(VARCHAR, latestAcrDate, 3)
						else ''
					end +
			' (' + (select text from regularText where [textId] = 'linkNiceBpTargetsCkd') COLLATE Latin1_General_CI_AS + ').</li>'
		end) +
		(case
		--BP uncontrolled BUT near target
			when (((dmPatient = 1 or protPatient = 1) and	(b.latestSbp < 140 and b.latestDbp < 90)) or ((dmPatient = 0 and protPatient = 0) and (b.latestSbp < 150 and b.latestDbp < 100))) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then
				'<li>This is only <strong>slightly (&lt;10mmHg)</strong> over target. So it may be worth re-measuring their BP in case it has now come down.</li></ul>'
			else ''
		end) +
		(case
		--BP uncontrolled BUT second latest BP controlled (one-off high)
			when secondLatestBpControlled = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then
				'<li><strong>Previous BP</strong> was <strong>controlled</strong>: ' + Str(secondLatestSbp) + '/' + Str(secondLatestDbp) + ' on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '. So it may be worth re-measuring in case this was a one-off.</li></ul>'
			else ''
		end) +
		(case
		--BP uncontrolled + medication change after
			when latestMedOptimisationDate >= latestSbpDate and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then
				'<li><strong>' + latestMedOptimisationIngredient + '</strong> was <strong>' + latestMedOptimisation + '</strong> on <strong>' + CONVERT(VARCHAR, latestMedOptimisationDate, 3) + '</strong>.</li>' + '. So it may be worth re-measuring BP in case it has now come down.</li></ul>'
			else ''
		end) +
		(case
		--No BP + no contact
			when noPrimCareContactInLastYear = 1 and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0) then
				'Because they have <strong>not</strong> had contact with your practice in the last year, it may be best to:' +
					'<ul><li><strong>Telephone</strong> them. If so, please add code <strong>9Ot4. (CKD telephone invite)</strong> [#9Ot4.] to their records.</li>' +
					'<li>Send them a <strong>letter</strong>. If so, please add code <strong>9Ot0. (CKD 1st letter)</strong> [#9Ot0.] or <strong>9Ot1. (CKD 2nd letter)</strong> [#9Ot1.] or <strong>9Ot2. (CKD 3rd letter)</strong> [#9Ot2.] to their records.</li></ul>'
			else
		--Any contact
				'Because they <strong>have</strong> had contact with your practice in the last year, it may be possible to:' +
					'<ul><li>Measure their BP <strong>opportunistically</strong> next time they are seen.</li>' +
					'<li>Put a <strong>message on their prescription</strong> to make an appointment.</li>' +
					'<li><strong>Telephone</strong> them. If so, please add code <strong>9Ot4. (CKD telephone invite)</strong> [#9Ot4.] to their records.</li>' +
					'<li>Send them a <strong>letter</strong>. If so, please add code <strong>9Ot0. (CKD 1st letter)</strong> [#9Ot0.] or <strong>9Ot1. (CKD 2nd letter)</strong> or <strong>9Ot2. (CKD 3rd letter)</strong> to their records.</li></ul>'
		end) +
	'Useful information' +
		'<ul><li>' +
			case
					when dmPatient = 1 then (select text from regularText where [textId] = 'linkNiceBpMxCkdDm')
					when dmPatient = 0 then (select text from regularText where [textId] = 'linkNiceBpMxCkd')
			end + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkPilCkdBp') + '</li></ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, latestSbp, latestDbp, latestSbpDate, bpTarget,  dmPatient, protPatient, latestAcrDate, sourceSbp from #eligiblePopulationAllData) as b on b.PatID = a.PatID
where
	a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 0)
	or
	(
		a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
		and
		(
			(secondLatestBpControlled = 1)
			or
			(latestMedOptimisationDate >= latestSbpDate)
			or
			((dmPatient = 1 or protPatient = 1) and	(b.latestSbp < 140 and b.latestDbp < 90))
			or
			((dmPatient = 0 and protPatient = 0) and (b.latestSbp < 150 and b.latestDbp < 100))
		)

	)

union

--MEDICATION SUGGESTION
select a.PatID,
	'htn.treatment.bp' as indicatorId,
	'Medication optimisation' as actionCat,
--	start_or_inc + ' ' + family as reasonCat,
	reasonNumber as reasonNumber,
	@ptPercPoints as pointsPerAction,
	priority as priority,
	start_or_inc + ' ' + family as actionText,
	'Reasoning' +
		'<ul><li>Patient has hypertension and their last BP was <strong>uncontrolled</strong>: ' +
				case
					when ((dmPatient = 1 or protPatient = 1) and (latestSbp >= 130)) or ((dmPatient = 0 and protPatient = 0) and (latestSbp >= 140)) then '<strong>' + Str(latestSbp) + '</strong>'
					else Str(latestSbp)
				end
			+ '/' +
				case
					when ((dmPatient = 1 or protPatient = 1) and (latestDbp >= 80)) or ((dmPatient = 0 and protPatient = 0) and (latestDbp >= 90)) then '<strong>' + Str(latestDbp) + '</strong>'
					else Str(latestDbp)
				end
			+ ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
			case 
				when sourceSbp = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in the GP record.</li>'
			else ''
			end	+		
			'<li>Target: ' + b.bpTarget + ' - because patient has CKD' +
				case
					when dmPatient = 1 then ' and diabetes'
					when protPatient = 1 then ' and ACR &gt; 70 on ' + CONVERT(VARCHAR, b.latestAcrDate, 3)
					else ''
				end +
		' (' + (select text from regularText where [textId] = 'linkNiceBpTargetsCkd') COLLATE Latin1_General_CI_AS + ').</li>'
	+ reasonText +
	'Useful information' +
		'<ul><li>' + usefulInfo + '</li>' +
		'<li>' +
			case
					when dmPatient = 1 then (select text from regularText where [textId] = 'linkNiceBpMxCkdDm')
					when dmPatient = 0 then (select text from regularText where [textId] = 'linkNiceBpMxCkd')
			end + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkPilCkdBp') + '</li></ul>' as supportingText
from #medSuggestion as a
	left outer join (select PatID, latestSbp, latestDbp, latestSbpDate, bpTarget, dmPatient, protPatient, latestAcrDate, sourceSbp from #eligiblePopulationAllData) as b on b.PatID = a.PatID
	left outer join (select PatID, currentMedIngredient from #htnMeds) as c on c.PatID = a.PatID
	left outer join (select Ingredient, BNF from drugIngredients) as d on d.Ingredient = c.currentMedIngredient

union

--SUGGEST EXCLUDE
select a.PatID,
	'htn.treatment.bp' as indicatorId,
	'Suggest exclude' as actionCat,
--	case
--		when (latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate) then 'Palliative'
--		when latestFrailCode is not null then 'Frail'
--		when (latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate) then 'House or bed bound'
--		when (latestCkd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCkdInviteCodesThisFinancialYear > 2 then '3 invites'
--		when a.PatID in (select PatID from #currentHTNmeds group by PatID having count(distinct currentMedFamily) > 3) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 'Maximum medication'
--		when a.PatID in (select PatID from #htnMeds) and a.PatID NOT in (select PatID from #medSuggestion) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0) then 'Maximum tolerated medication'
--		else ''
--	end as reasonCat,
	(case when (latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)
	then 1 else 0 end) +
	(case when latestFrailCode is not null
	then 1 else 0 end) +
	(case when (latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate)
	then 1 else 0 end) +
	(case when (latestCkd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCkdInviteCodesThisFinancialYear > 2
	then 1 else 0 end) +
	(case when a.PatID in (select PatID from #currentHTNmeds group by PatID having count(distinct currentMedFamily) > 3) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	then 1 else 0 end) +
	(case when a.PatID in (select PatID from #htnMeds) and a.PatID NOT in (select PatID from #medSuggestion) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
	then 1 else 0 end)
	as reasonNumber,
	@ptPercPoints as pointsPerAction,
	3 as priority,
	'Exclude this patient from hypertension indicators using code(s): ' +
	(case
		when
			((latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate))
			or
			(latestFrailCode is not null)
			or
			((latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate))
		then '9hE1. (patient unsuitable) [9hE1.] '
		else ''
	end) +
	(case
		when (latestCkd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCkdInviteCodesThisFinancialYear > 2
		then '9hE0. (informed dissent) [9hE0.] '
		else ''
	end) +
	(case
		when a.PatID in (select PatID from #currentHTNmeds group by PatID having count(distinct currentMedFamily) > 3) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
		then '8BL0. (maximal tolerated therapy) [8BL0.] '
		else ''
	end) +
	(case
		when a.PatID in (select PatID from #htnMeds) and a.PatID NOT in (select PatID from #medSuggestion) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
		then '8BL0. (maximal tolerated therapy) [8BL0.] '
		else ''
	end) as actionText,
	'Reasoning<ul>' +
		(case when (latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)
		then '<li>Patient has code <strong> ''' + latestPalCode + '''</strong> on ' + CONVERT(VARCHAR, latestPalCodeDate, 3) + '.</li>' else '' end) +
		(case when latestFrailCode is not null
		then '<li>Patient has code <strong>''' + latestFrailCode + '''</strong> on ' + CONVERT(VARCHAR, latestFrailCodeDate, 3) + '.</li>' else '' end) +
		(case when (latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate)
		then '<li>Patient has code <strong>''' + latestHouseBedboundCode + '''</strong> on ' + CONVERT(VARCHAR, latestHouseBedboundCodeDate, 3) + '.</li>' else '' end) +
		(case when (latestCkd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCkdInviteCodesThisFinancialYear > 2
		then '<li>Patient has had 3 CKD invites since last April.</li>' else '' end) +
		(case
			when a.PatID in (select PatID from #currentHTNmeds group by PatID having count(distinct currentMedFamily) > 3) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
			then
				'<li>Last BP was <strong>uncontrolled</strong>: ' +
						case
							when ((dmPatient = 1 or protPatient = 1) and (latestSbp >= 130)) or ((dmPatient = 0 and protPatient = 0) and (latestSbp >= 140)) then '<strong>' + Str(latestSbp) + '</strong>'
							else Str(latestSbp)
						end
					+ '/' +
						case
							when ((dmPatient = 1 or protPatient = 1) and (latestDbp >= 80)) or ((dmPatient = 0 and protPatient = 0) and (latestDbp >= 90)) then '<strong>' + Str(latestDbp) + '</strong>'
							else Str(latestDbp)
						end
					+ ' on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
					'<li>Target: ' + bpTarget + ' - because patient has CKD' +
						case
							when dmPatient = 1 then ' and diabetes'
							when protPatient = 1 then ' and ACR > 70 on ' + CONVERT(VARCHAR, latestAcrDate, 3)
							else ''
						end +
				' (' + (select text from regularText where [textId] = 'linkNiceBpTargetsCkd') COLLATE Latin1_General_CI_AS + ').</li>' +
				'<li><strong>And</strong> patient is prescribed <strong>4 or more</strong> classes of hypertensive medication.</li>'
			else ''
			end) +
		(case
			when a.PatID in (select PatID from #htnMeds) and a.PatID NOT in (select PatID from #medSuggestion) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0)
			then
				'<li>Last BP was <strong>uncontrolled</strong>: ' +
						case
							when ((dmPatient = 1 or protPatient = 1) and (latestSbp >= 130)) or ((dmPatient = 0 and protPatient = 0) and (latestSbp >= 140)) then '<strong>' + Str(latestSbp) + '</strong>'
							else Str(latestSbp)
						end
					+ '/' +
						case
							when ((dmPatient = 1 or protPatient = 1) and (latestDbp >= 80)) or ((dmPatient = 0 and protPatient = 0) and (latestDbp >= 90)) then '<strong>' + Str(latestDbp) + '</strong>'
							else Str(latestDbp)
						end
					+ ' on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
					'<li>Target: ' + bpTarget + ' - because patient has CKD' +
						case
							when dmPatient = 1 then ' and diabetes'
							when protPatient = 1 then ' and ACR &gt; 70 on ' + CONVERT(VARCHAR, latestAcrDate, 3)
							else ''
						end +
				' (' + (select text from regularText where [textId] = 'linkNiceBpTargetsCkd') COLLATE Latin1_General_CI_AS + ').</li>' +
				'<li>Patient has contraindications to, or is taking all BP medications recommendeded by NICE.</li>'
			else ''
			end) +
	'</ul>Useful information' +
		'<ul><li>' + (select text from regularText where [textId] = 'ExceptionReportingReasons') + '</li></ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, currentMedFamily from #currentHTNmeds) as b on b.PatID = a.PatID
	left outer join (select PatID, bpMeasuredOK, bpControlledOk, dmPatient, protPatient, latestSbp, latestDbp, latestSbpDate, bpTarget, latestAcrDate from #eligiblePopulationAllData) as c on c.PatID = a.PatID
where
	((latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate))
	or (latestFrailCode is not null)
	or((latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate))
	or((latestCkd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCkdInviteCodesThisFinancialYear > 2)
	or(a.PatID in (select PatID from #currentHTNmeds group by PatID having count(distinct currentMedFamily) > 3) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0))
	or(a.PatID in (select PatID from #htnMeds) and a.PatID NOT in (select PatID from #medSuggestion) and a.PatID in (select PatID from #eligiblePopulationAllData where bpMeasuredOK = 1 and bpControlledOk = 0))

 
							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--No BP + contact with practice
select c.pracID, 'noBpYesContact', 
	SUM(case when denominator = 1 and bpMeasuredOK = 0 and noPrimCareContactInLastYear = 0 then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when denominator = 1 and bpMeasuredOK = 0 and noPrimCareContactInLastYear = 0 then 1.0 else 0.0 end),	
	SUM(case when denominator = 1 and bpMeasuredOK = 0 and noPrimCareContactInLastYear = 0 then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, noPrimCareContactInLastYear from #impOppsData) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--Uncontrolled + within 10mmHg of target
select c.pracID, 'uncontrolledClose', 
	SUM(case when
		(
			((dmPatient = 1 or protPatient = 1) and (latestSbp < 140 and latestDbp < 90)) or
			((dmPatient = 0 and protPatient = 0) and (latestSbp < 150 and latestDbp < 100))
		)
		and
		denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
	then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when
		(
			((dmPatient = 1 or protPatient = 1) and (latestSbp < 140 and latestDbp < 90)) or
			((dmPatient = 0 and protPatient = 0) and (latestSbp < 150 and latestDbp < 100))
		)
		and
		denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
	then 1.0 else 0.0 end),
	SUM(case when
	(
		((dmPatient = 1 or protPatient = 1) and (latestSbp < 140 and latestDbp < 90)) or
		((dmPatient = 0 and protPatient = 0) and (latestSbp < 150 and latestDbp < 100))
	)
	and
	denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
	then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--No optimisation after high reading (therapeutic inertia)
select c.pracID, 'rxInertia', 
	SUM(case when
		denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
		and (latestMedOptimisationDate is null or (latestMedOptimisationDate < latestSbpDate))
	then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when
		denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
		and (latestMedOptimisationDate is null or (latestMedOptimisationDate < latestSbpDate))
	then 1.0 else 0.0 end),
	SUM(case when
		denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0
		and (latestMedOptimisationDate is null or (latestMedOptimisationDate < latestSbpDate))
	then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, latestMedOptimisationDate from #impOppsData) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--'measure' actions
select c.pracID, 'measureActions', 
	SUM(case when indicatorId = 'htn.treatment.bp' and actionCat = 'Measure BP' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.treatment.bp' and actionCat = 'Measure BP' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.treatment.bp' and actionCat = 'Measure BP' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, indicatorId, actionCat from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--uncontrolled
select c.pracID, 'uncontrolled', 
	SUM(case when denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0 then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0 then 1.0 else 0.0 end),
	SUM(case when denominator = 1 and bpMeasuredOK = 1 and bpControlledOk = 0 then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0


							---------------------------------------------------------------
							----------------------ORG-LEVEL ACTIONS------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
--CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #orgActions

--BP MACHINE IN WAITING ROOM
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'BpMachineWr' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Put BP machine in waiting room' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients are not meeting the CKD BP indicator because they haven''t had their BP measured <strong>BUT</strong> have had contact with your practice in the last year.</li>' +
		'<li>With a BP machine in your waiting room, patients can take their own BP whilst they wait and give their readings to your receptionists.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li></ul>' as supportingText
from #reasonProportions
where proportionId = 'noBpYesContact' 


union
--WORK WITH LOCAL PHARMACY
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'localPharmacy' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Work with your local pharmacy to enable them to take blood pressure readings' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients are not meeting the CKD BP indicator because they have not had their BP measured <strong>BUT</strong> have had medication issued in the last year.</li>' +
		'<li>Pharmacies can take their blood pressure when they issue their medication and send the readings to you.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where [textId] = 'RpsGuidanceBp') + '</li></ul>' as supportingText
from #reasonProportions
where proportionId = 'noBpYesContact' 

union
--INTRODUCE ABPM
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'abpm' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority, --higher priority because also inline with NICE guidelines for HTN diagnosis
	'Introduce an ambulatory BP monitoring service' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients are not meeting the CKD BP indicator because they have uncontrolled BP <strong>but</strong> are within &lt; 10 mmHg of their BP target.</li>' +
		'<li>Often high blood pressure readings taken in surgery are normal at home.</li>' +
		'<li>This would also follow NICE guidance for hypertension diagnosis.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where [textId] = 'linkBhsAbpm') + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkPatientUkAbpm') + '</li>' +
		'<li>'  + (select text from regularText where [textId] = 'linkNiceHtn') + '</li>' +
		'</ul>'
	as supportingText
from #reasonProportions
where proportionId = 'uncontrolledClose' 

union
--ENCOURAGE BP WITH NURSE / AHP
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'nurseMeasure' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	2 as priority, --higher priority because good practice and evidence-based
	'Encourage patients with CKD to see the nurse or AHP to measure their blood pressure' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients are not meeting the CKD BP indicator because they have uncontrolled BP <strong>but</strong> are within &lt; 10 mmHg of their BP target.</li>' +
		'<li>BP is on average 7/4 mmHg lower when measured with nurses rather than doctors.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where textId = 'linkBjgpBpDoctorsHigher') + '</li>' +
		'</ul>'
	as supportingText
from #reasonProportions
where proportionId = 'uncontrolledClose' 

union
--EDUCATIONAL SESSION
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'educationSession' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Hold an educational session for your practice staff on NICE hypertension guidelines' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients not meeting the CKD BP indicator did not have their medication changed after their latest <strong>uncontrolled</strong> BP reading.</li>' +
		'<li>This <strong>may</strong> indicate that staff are unaware of medication optimisation guidelines or the importance of BP control.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where textId = 'niceBpPresentation') + '</li>' +
		'</ul>'
		as supportingText
from #reasonProportions
where proportionId = 'rxInertia' 

union
--PATHWAY PRINT-OUT
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'pathwayPrint' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Print a copy of NICE hypertension targets and medication pathway for each room in your practice' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients not meeting the CKD BP indicator did not have their medication changed after their latest <strong>uncontrolled</strong> BP reading.</li>' +
		'<li>This <strong>may</strong> indicate that staff are unaware of medication optimisation guidelines or the importance of BP control.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where textId = 'niceBpPathway') + '</li>' +
		'</ul>'
		as supportingText
from #reasonProportions
where proportionId = 'rxInertia' 

union
--ENCOURAGE HBPM
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'hbpm' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	2 as priority, --higher because good practice
	'Encourage patients with CKD to measure their blood pressure at home' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients not meeting the CKD BP indicator may benefit from having their BP re-measured (e.g. they have not had their BP measured, or are only just over their target).</li>' +
		'<li>This could be achieved by asking patients to measure their own BP.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where textId = 'linkBhsHbpmProtocol') + '</li>' +
		'<li>'  + (select text from regularText where textId = 'linkBhsHbpmHowToPatients') + '</li>' +
		'<li>'  + (select text from regularText where textId = 'linkBhsHbpmPil') + '</li>' +
		--'<li>'  + (select text from regularText where textId = 'linkBhsHbpmDiary') + '</li>' +
		--'<li>'  + (select text from regularText where textId = 'linkBhsHbpmGuide') + '</li>' +
		--'<li>'  + (select text from regularText where textId = 'linkBhsHbpmCaseStudies') + '</li>' +
		'</ul>'
		as supportingText
from #reasonProportions
where proportionId = 'measureActions' 

union
--VACCINATION CLINICS
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'vaccClinic' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Take blood pressure readings during upcoming vaccination programmes e.g. flu, shingles, whooping cough.' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients not meeting the CKD BP indicator may benefit from having their BP re-measured (e.g. they have not had their BP measured, or are only just over their target).</li></ul>' +
		'Useful information' +
		'<ul><li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li></ul>' as supportingText
from #reasonProportions
where proportionId = 'measureActions' 

union
--LIFESTYLE
select
	pracID as pracID,
	'htn.treatment.bp' as indicatorId,
	'lifestyle' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Reinforce lifestyle advice to patients with CKD at every appointment' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) patients not meeting the CKD BP indicator have uncontrolled blood pressure.</li>' +
		'<li>Advice on diet, exercise, alcohol reduction, weight loss, smoking cessation and exercise can help reduce blood pressure.</li></ul>' +
	'Useful information' +
		'<ul><li>'  + (select text from regularText where textId = 'DashDietSheet') + '</li>' +
		'<li>'  + (select text from regularText where textId = 'HtnDietExSheet') + '</li>' +
		'<li>'  + (select text from regularText where textId = 'BpUkDietSheet') + '</li>' +
		'<li>'  + (select text from regularText where textId = 'BpExSheet') + '</li>' +
		'</ul>'
		as supportingText
from #reasonProportions
where proportionId = 'uncontrolled' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--overview tab
('htn.treatment.bp','name','Hypertension blood pressure control'), --overview table name
('htn.treatment.bp','tabText','HTN BP Control'), --indicator tab text
('htn.treatment.bp','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients on the hypertension register with a BP recorded in the last 12 months (since ' +
	case
		when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
		when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
	end +
	') where the latest BP is &lt;140/90 mmHg for patients under 80 years and &lt;150/90 mmHg in patients 80 years or older.<br>' + 
	'<strong>Why this is important:</strong> Cardiovascular disease is the biggest cause of death across the globe.<br>' +
	'<strong>Useful information:</strong>' +
	'<ul><li>'  + (select text from regularText where [textId] = 'linkBmjCkdBp') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkNiceBpTargetsCkd') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkNiceBpMxCkd') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkSsCkdAki') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkPilCkdBp') + '</li></ul>'),
--indicator tab
--summary text
('htn.treatment.bp','tagline','of your patients on the hypertension register have had a BP measurement in the 12 months (from ' +
	case
		when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
		when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
	end +
	') where the latest BP is <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!scenario:1'' target=''_blank'' title="NICE BP targets">&lt;140/90 mmHg in patients under 80 years and &lt;150/90 mmHg in patients 80 years or older</a>.'),
('htn.treatment.bp','positiveMessage', --tailored text
	case 
		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Salford Standard target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Salford Standard target! To improve even further, look through the recommended actions on this page and for the patients below.'
		else 'You''ve not yet achieved the Salford Standard target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
	end),
--pt lists
('htn.treatment.bp','valueId','SBP'),
('htn.treatment.bp','valueName','Latest SBP'),
('htn.treatment.bp','dateORvalue','both'),
('htn.treatment.bp','valueSortDirection','desc'),  -- 'asc' or 'desc'
('htn.treatment.bp','tableTitle','All patients with improvement opportunities'),

--imp opp charts
--based on actionCat

--registered?
('htn.treatment.bp','opportunities.Registered?.name','Check registered'),
('htn.treatment.bp','opportunities.Registered?.description','Patients who have not had contact with your practice in the last 12 months - are they still registered with you?'),
('htn.treatment.bp','opportunities.Registered?.positionInBarChart','3'),

--Measure BP
('htn.treatment.bp','opportunities.Measure BP.name','Measure BP'),
('htn.treatment.bp','opportunities.Measure BP.description','Patients who may achieve the indicator by simply re-measuring their BP i.e. those without a BP reading, or with a one-off high reading, recent medication optimisation, or only slightly uncontrolled BP.'),
('htn.treatment.bp','opportunities.Measure BP.positionInBarChart','1'),

--MEDICATION SUGGESTION
('htn.treatment.bp','opportunities.Medication optimisation.name','Medication suggestion'),
('htn.treatment.bp','opportunities.Medication optimisation.description','Patients with uncontrolled BP who are prescribed suboptimal medication.'),
('htn.treatment.bp','opportunities.Medication optimisation.positionInBarChart',	'2'),

--SUGGEST EXCLUDE
('htn.treatment.bp','opportunities.Suggest exclude.name','Suggest exclude'),
('htn.treatment.bp','opportunities.Suggest exclude.description','Patients who may benefit from being excluded from this quality indicators.'),
('htn.treatment.bp','opportunities.Suggest exclude.positionInBarChart',	'4')
