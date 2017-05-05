--v2 5/3/17
--changed name to 'casefinding'

									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.htn.undiagnosed.med') DROP PROCEDURE [pingr.htn.undiagnosed.med];
GO
CREATE PROCEDURE [pingr.htn.undiagnosed.med] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
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
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,YEAR(@refdate)) + '-03-31' --31st March
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,(YEAR(@refdate) + 1)) + '-03-31' end); --31st March

--#currentHTNmedPts
IF OBJECT_ID('tempdb..#currentHTNmedPts') IS NOT NULL DROP TABLE #currentHTNmedPts
CREATE TABLE #currentHTNmedPts
	(PatID int, latestHTNmedEventDate date);
insert into #currentHTNmedPts
select a.PatID, max(latestHTNmedEventDate) from MEDICATION_EVENTS_HTN as a
	inner join
		(
	--select LAST event for EACH ingredient the patient has *EVER* been prescribed
			select PatID, MAX(EntryDate) as latestHTNmedEventDate from MEDICATION_EVENTS_HTN
			--remove ingredients not licensed for htn
			where Ingredient not in ('Sotalol', 'Triamterene', 'Bumetanide', 'Eplerenone', 'Tamsulosin', 'Alfuzosin')
			group by PatID
		) as b on b.PatID = a.PatID and b.latestHTNmedEventDate = a.EntryDate
--EXCLUDE any events that are a 'stopped' or 'error' event
where [Event] in ('DOSE DECREASED','DOSE INCREASED', 'STARTED', 'RESTARTED','ADHERENCE')
--remove ingredients not licensed for htn
and Ingredient not in ('Sotalol', 'Triamterene', 'Bumetanide', 'Eplerenone', 'Tamsulosin', 'Alfuzosin')
group by a.PatID

--#latestHtnCode
IF OBJECT_ID('tempdb..#latestHtnCode') IS NOT NULL DROP TABLE #latestHtnCode
CREATE TABLE #latestHtnCode (PatID int, latestHtnCodeDate date, latestHtnCodeMin varchar(512), latestHtnCodeMax varchar(512), latestHtnCode varchar(512));
insert into #latestHtnCode (PatID, latestHtnCodeDate, latestHtnCodeMin, latestHtnCodeMax, latestHtnCode)
select s.PatID, latestHtnCodeDate, MIN(Rubric) as latestHtnCodeMin, MAX(Rubric) as latestHtnCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'htnQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode  in (select code from codeGroups where [group] = 'htnQof')
group by s.PatID, latestHtnCodeDate

--#age
IF OBJECT_ID('tempdb..#age') IS NOT NULL DROP TABLE #age
CREATE TABLE #age (PatID int, age int);
insert into #age (PatID, age)
select PatID, YEAR(@achieveDate) - year_of_birth as age from #currentHTNmedPts as c
	left outer join
		(select patid, year_of_birth from dbo.patients) as d on c.PatID = d.patid

--#latestHtnPermExCode
IF OBJECT_ID('tempdb..#latestHtnPermExCode') IS NOT NULL DROP TABLE #latestHtnPermExCode
CREATE TABLE #latestHtnPermExCode (PatID int, latestHtnPermExCodeDate date, latestHtnPermExCodeMin varchar(512), latestHtnPermExCodeMax varchar(512),
	latestHtnPermExCode varchar(512));
insert into #latestHtnPermExCode
select s.PatID, latestHtnPermExCodeDate, MIN(Rubric) as latestHtnPermExCodeMin, MAX(Rubric) as latestHtnPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnPermExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
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
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'registered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestRegisteredCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
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
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
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
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'dead')
group by s.PatID, latestDeadCodeDate

--#deadTable
--patients marked as dead in the demographics table
IF OBJECT_ID('tempdb..#deadTable') IS NOT NULL DROP TABLE #deadTable
CREATE TABLE #deadTable (PatID int, deadTable int, deadTableMonth int, deadTableYear int);
insert into #deadTable
select PatID, deadTable, deadTableMonth, deadTableYear from #currentHTNmedPts as c
	left outer join
		(select patid, dead as deadTable, month_of_death as deadTableMonth, year_of_death as deadTableYear from patients) as d on c.PatID = d.patid

--#latestDmCode
--NB min/max codes check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestDmCode') IS NOT NULL DROP TABLE #latestDmCode
CREATE TABLE #latestDmCode (PatID int, latestDmCodeDate date, latestDmCodeMin varchar(512), latestDmCodeMax varchar(512), latestDmCode varchar(512));
insert into #latestDmCode
select s.PatID, latestDmCodeDate, MIN(Rubric) as latestDmCodeMin, MAX(Rubric) as latestDmCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDmCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'dm')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'dm')
group by s.PatID, latestDmCodeDate

--#latestDmPermExCode
--dm perm exclusions - i.e. DM resolved
--dm temp ex codes not included because this is NOT a dm indicator
IF OBJECT_ID('tempdb..#latestDmPermExCode') IS NOT NULL DROP TABLE #latestDmPermExCode
CREATE TABLE #latestDmPermExCode (PatID int, latestDmPermExCodeDate date, latestDmPermExCodeMin varchar(512), latestDmPermExCodeMax varchar(512),
	latestDmPermExCode varchar(512));
insert into #latestDmPermExCode
select s.PatID, latestDmPermExCodeDate, MIN(Rubric) as latestDmPermExCodeMin, MAX(Rubric) as latestDmPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestDmPermExCode from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDmPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDmPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'dmPermEx')
group by s.PatID, latestDmPermExCodeDate

--#latestCkd35code
IF OBJECT_ID('tempdb..#latestCkd35code') IS NOT NULL DROP TABLE #latestCkd35code
CREATE TABLE #latestCkd35code (PatID int, latestCkd35codeDate date, latestCkd35codeMin varchar(512), latestCkd35codeMax varchar(512), latestCkd35code varchar(512));
insert into #latestCkd35code (PatID, latestCkd35codeDate, latestCkd35codeMin, latestCkd35codeMax, latestCkd35code)
select s.PatID, latestCkd35codeDate, MIN(Rubric) as latestCkd35codeMin, MAX(Rubric) as latestCkd35codeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCkd35code from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCkd35codeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'ckd35')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCkd35codeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode  in (select code from codeGroups where [group] = 'ckd35')
group by s.PatID, latestCkd35codeDate

--#latestCkdPermExCode
--permanent exclusions codes: CKD1/2, or ckd resolved
IF OBJECT_ID('tempdb..#latestCkdPermExCode') IS NOT NULL DROP TABLE #latestCkdPermExCode
CREATE TABLE #latestCkdPermExCode (PatID int, latestCkdPermExCodeDate date, latestCkdPermExCodeMin varchar(512), latestCkdPermExCodeMax varchar(512),
	latestCkdPermExCode varchar(512));
insert into #latestCkdPermExCode
	(PatID, latestCkdPermExCodeDate, latestCkdPermExCodeMin, latestCkdPermExCodeMax, latestCkdPermExCode)
select s.PatID, latestCkdPermExCodeDate, MIN(Rubric) as latestCkdPermExCodeMin, MAX(Rubric) as latestCkdPermExCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCkdPermExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCkdPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'ckdPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCkdPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode  in (select code from codeGroups where [group] = 'ckdPermEx')
group by s.PatID, latestCkdPermExCodeDate

--#latestAcr
IF OBJECT_ID('tempdb..#latestAcr') IS NOT NULL DROP TABLE #latestAcr
CREATE TABLE #latestAcr (PatID int, latestAcrDate date, latestAcr int, sourceAcr varchar(256));
insert into #latestAcr
select s.PatID, latestAcrDate, MIN(CodeValue) as latestAcr, max(Source) as sourceAcr from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAcrDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'acr')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAcrDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'acr')
group by s.PatID, latestAcrDate

--#latestOedema
IF OBJECT_ID('tempdb..#latestOedema') IS NOT NULL DROP TABLE #latestOedema
CREATE TABLE #latestOedema (PatID int, latestOedemaDate date, latestOedema varchar(256));
insert into #latestOedema
select s.PatID, latestOedemaDate, max(Rubric) as latestOedema from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestOedemaDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'oedema')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestOedemaDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'oedema')
group by s.PatID, latestOedemaDate

--#latestOedemaPermEx
IF OBJECT_ID('tempdb..#latestOedemaPermEx') IS NOT NULL DROP TABLE #latestOedemaPermEx
CREATE TABLE #latestOedemaPermEx (PatID int, latestOedemaPermExDate date, latestOedemaPermEx varchar(256));
insert into #latestOedemaPermEx
select s.PatID, latestOedemaPermExDate, max(Rubric) as latestOedemaPermEx from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestOedemaPermExDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'oedemaPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestOedemaPermExDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'oedemaPermEx')
group by s.PatID, latestOedemaPermExDate

--#latestAf
IF OBJECT_ID('tempdb..#latestAf') IS NOT NULL DROP TABLE #latestAf
CREATE TABLE #latestAf (PatID int, latestAfDate date, latestAf varchar(256));
insert into #latestAf
select s.PatID, latestAfDate, max(Rubric) as latestAf from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'af')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'af')
group by s.PatID, latestAfDate

--#latestAfPermEx
IF OBJECT_ID('tempdb..#latestAfPermEx') IS NOT NULL DROP TABLE #latestAfPermEx
CREATE TABLE #latestAfPermEx (PatID int, latestAfPermExDate date, latestAfPermEx varchar(256));
insert into #latestAfPermEx
select s.PatID, latestAfPermExDate, max(Rubric) as latestAfPermEx from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfPermExDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'afPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfPermExDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'afPermEx')
group by s.PatID, latestAfPermExDate

--#latestChd
IF OBJECT_ID('tempdb..#latestChd') IS NOT NULL DROP TABLE #latestChd
CREATE TABLE #latestChd (PatID int, latestChdDate date, latestChd varchar(256));
insert into #latestChd
select s.PatID, latestChdDate, max(Rubric) as latestChd from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestChdDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] in ('chdQof','MInow'))
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestChdDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] in ('chdQof','MInow'))
group by s.PatID, latestChdDate

--#latestHf
IF OBJECT_ID('tempdb..#latestHf') IS NOT NULL DROP TABLE #latestHf
CREATE TABLE #latestHf (PatID int, latestHfDate date, latestHf varchar(256));
insert into #latestHf
select s.PatID, latestHfDate, max(Rubric) as latestHf from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHfDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'hfQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHfDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'hfQof')
group by s.PatID, latestHfDate

--#latestHfPermEx
IF OBJECT_ID('tempdb..#latestHfPermEx') IS NOT NULL DROP TABLE #latestHfPermEx
CREATE TABLE #latestHfPermEx (PatID int, latestHfPermExDate date, latestHfPermEx varchar(256));
insert into #latestHfPermEx
select s.PatID, latestHfPermExDate, max(Rubric) as latestHfPermEx from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHfPermExDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'hfPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHfPermExDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'hfPermEx')
group by s.PatID, latestHfPermExDate

--#latestSbp
IF OBJECT_ID('tempdb..#latestSbp') IS NOT NULL DROP TABLE #latestSbp
CREATE TABLE #latestSbp (PatID int, latestSbpDate date, latestSbp int, sourceSbp varchar(256));
insert into #latestSbp
select s.PatID, latestSbpDate, MIN(CodeValue) as latestSbp, max(Source) as sourceSbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestSbpDate  from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'sbp')
		and EntryDate < @refdate
		and CodeValue is not null
		and CodeValue > 0
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestSbpDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'sbp')
group by s.PatID, latestSbpDate

--#latestDbp
IF OBJECT_ID('tempdb..#latestDbp') IS NOT NULL DROP TABLE #latestDbp
CREATE TABLE #latestDbp (PatID int, latestDbpDate date, latestDbp int, sourceSbp varchar(256));
insert into #latestDbp
select s.PatID, latestDbpDate, MIN(CodeValue) as latestDbp, max(Source) as sourceSbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDbpDate  from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'dbp')
		and EntryDate < @refdate
		and CodeValue is not null
		and CodeValue > 0
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDbpDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'dbp')
group by s.PatID, latestDbpDate

--#secondLatestSbp
IF OBJECT_ID('tempdb..#secondLatestSbp') IS NOT NULL DROP TABLE #secondLatestSbp
CREATE TABLE #secondLatestSbp (PatID int, secondLatestSbpDate date, secondLatestSbp int, sourceSecondLatestSbp varchar(256));
insert into #secondLatestSbp
select a.PatID, secondLatestSbpDate, MIN(a.CodeValue), max(Source) as sourceSecondLatestSbp from SIR_ALL_Records as a
	inner join
		(
			select s.PatID, max(s.EntryDate) as secondLatestSbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestSbpDate from #latestSbp --i.e. select latest SBP date
					)sub on sub.PatID = s.PatID and sub.latestSbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'sbp')
			and s.PatID in (select PatID from #currentHTNmedPts)
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestSbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'sbp')
and a.PatID in (select PatID from #currentHTNmedPts)
group by a.PatID, secondLatestSbpDate

--#secondLatestDbp
IF OBJECT_ID('tempdb..#secondLatestDbp') IS NOT NULL DROP TABLE #secondLatestDbp
CREATE TABLE #secondLatestDbp (PatID int, secondLatestDbpDate date, secondLatestDbp int, sourceSecondLatestDbp varchar(256));
insert into #secondLatestDbp
select a.PatID, secondLatestDbpDate, MIN(a.CodeValue), max(Source) as sourceSecondLatestDbp from SIR_ALL_Records as a
	inner join
		(
			select s.PatID, max(s.EntryDate) as secondLatestDbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestDbpDate from #latestDbp --i.e. select latest DBP date
					)sub on sub.PatID = s.PatID and sub.latestDbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'dbp')
			and s.PatID in (select PatID from #currentHTNmedPts)
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestDbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dbp')
and a.PatID in (select PatID from #currentHTNmedPts)
group by a.PatID, secondLatestDbpDate

--#latestAsbp
IF OBJECT_ID('tempdb..#latestAsbp') IS NOT NULL DROP TABLE #latestAsbp
CREATE TABLE #latestAsbp (PatID int, latestAsbpDate date, latestAsbp int);
insert into #latestAsbp
select s.PatID, latestAsbpDate, MIN(CodeValue) as latestAsbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAsbpDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'asbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAsbpDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'asbp')
group by s.PatID, latestAsbpDate

--#latestAdbp
IF OBJECT_ID('tempdb..#latestAdbp') IS NOT NULL DROP TABLE #latestAdbp
CREATE TABLE #latestAdbp (PatID int, latestAdbpDate date, latestAdbp int);
insert into #latestAdbp
select s.PatID, latestAdbpDate, MIN(CodeValue) as latestAdbp from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAdbpDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'adbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAdbpDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'adbp')
group by s.PatID, latestAdbpDate

--#latestAnxiety
IF OBJECT_ID('tempdb..#latestAnxiety') IS NOT NULL DROP TABLE #latestAnxiety
CREATE TABLE #latestAnxiety (PatID int, latestAnxietyDate date, latestAnxiety varchar(256));
insert into #latestAnxiety
select s.PatID, latestAnxietyDate, max(Rubric) as latestAnxiety from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAnxietyDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'anxiety')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAnxietyDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'anxiety')
group by s.PatID, latestAnxietyDate

--#latestAnxietyPermEx
IF OBJECT_ID('tempdb..#latestAnxietyPermEx') IS NOT NULL DROP TABLE #latestAnxietyPermEx
CREATE TABLE #latestAnxietyPermEx (PatID int, latestAnxietyPermExDate date, latestAnxietyPermEx varchar(256));
insert into #latestAnxietyPermEx
select s.PatID, latestAnxietyPermExDate, max(Rubric) as latestAnxietyPermEx from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAnxietyPermExDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'anxietyPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAnxietyPermExDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'anxietyPermEx')
group by s.PatID, latestAnxietyPermExDate

--#latestHyperthyroid
IF OBJECT_ID('tempdb..#latestHyperthyroid') IS NOT NULL DROP TABLE #latestHyperthyroid
CREATE TABLE #latestHyperthyroid (PatID int, latestHyperthyroidDate date, latestHyperthyroid varchar(256));
insert into #latestHyperthyroid
select s.PatID, latestHyperthyroidDate, max(Rubric) as latestHyperthyroid from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHyperthyroidDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'hyperthyroid')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHyperthyroidDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'hyperthyroid')
group by s.PatID, latestHyperthyroidDate

--#latestHyperthyroidPermEx
IF OBJECT_ID('tempdb..#latestHyperthyroidPermEx') IS NOT NULL DROP TABLE #latestHyperthyroidPermEx
CREATE TABLE #latestHyperthyroidPermEx (PatID int, latestHyperthyroidPermExDate date, latestHyperthyroidPermEx varchar(256));
insert into #latestHyperthyroidPermEx
select s.PatID, latestHyperthyroidPermExDate, max(Rubric) as latestHyperthyroidPermEx from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestHyperthyroidPermExDate from SIR_ALL_Records
		where PatID in (select PatID from #currentHTNmedPts)
		and ReadCode in (select code from codeGroups where [group] = 'hyperthyroidPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHyperthyroidPermExDate = s.EntryDate
where s.PatID in (select PatID from #currentHTNmedPts)
and ReadCode in (select code from codeGroups where [group] = 'hyperthyroidPermEx')
group by s.PatID, latestHyperthyroidPermExDate

--#exclusions
IF OBJECT_ID('tempdb..#exclusions') IS NOT NULL DROP TABLE #exclusions
CREATE TABLE #exclusions
	(PatID int, ageExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int, permExclude int);
insert into #exclusions
select a.PatID,
	case when age < 17 then 1 else 0 end as ageExclude, -- Demographic exclusions: Under 18 at achievement date (from QOF v34 business rules)
	case when latestRegisteredCodeDate > DATEADD(month, -9, @achievedate) then 1 else 0 end as regCodeExclude, -- Registration date: > achievement date - 9/12 (from CKD ruleset_INLIQ_v32.0)
	case when latestDeregCodeDate > latestHTNmedEventDate then 1 else 0 end as deRegCodeExclude, -- Exclude patients with deregistered codes AFTER their latest CKD 35 code
	case when latestDeadCodeDate > latestHTNmedEventDate then 1 else 0 end as deadCodeExclude, -- Exclude patients with dead codes after their latest CKD35 code
	case when deadTable = 1 then 1 else 0 end as deadTableExclude, -- Exclude patients listed as dead in the patients table
	case when latestHtnPermExCodeDate is not null and (latestHtnCodeDate is null or (latestHtnCodeDate < latestHtnPermExCodeDate)) then 1 else 0 end as permExclude
from #currentHTNmedPts as a
	left outer join (select PatID, age from #age) b on b.PatID = a.PatID
	left outer join (select PatID, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
	left outer join (select PatID, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
	left outer join (select PatID, latestDeadCodeDate from #latestDeadCode) j on j.PatID = a.PatID
	left outer join (select PatID, deadTable from #deadTable) g on g.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCodeDate from #latestHtnPermExCode) h on h.PatID = a.PatID
	left outer join (select PatID, latestHtnCodeDate from #latestHtnCode) i on i.PatID = a.PatID
	
--#denominator
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
select a.PatID,
	case when ageExclude = 0 and regCodeExclude  = 0
		and deRegCodeExclude  = 0 and deadCodeExclude = 0 
		and deadTableExclude  = 0 and permExclude = 0
		then 1 else 0 end as denominator
from #currentHTNmedPts as a
	left outer join (select PatID, ageExclude, regCodeExclude,
					deRegCodeExclude, deadCodeExclude, deadTableExclude, permExclude from #exclusions) b on b.PatID = a.PatID

--#numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID,
	case 
		when denominator = 1 
		and latestHtnCode is not null and (latestHtnPermExCode is null or (latestHtnPermExCodeDate < latestHtnCodeDate))then 1 
	else 0 
	end as numerator
from #currentHTNmedPts as a
	left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
	left outer join (select PatID, latestHtnCode, latestHtnCodeDate from #latestHtnCode) d on d.PatID = a.PatID

--#eligiblePopulationAllData
--all data from above combined into one table, plus numerator column
IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (
	PatID int, latestHTNmedEventDate date,
	latestHtnCodeDate date, latestHtnCode varchar(512),
	age int,
	latestHtnPermExCode varchar(512), latestHtnPermExCodeDate date,
	latestRegisteredCode varchar(512), latestRegisteredCodeDate date,
	latestDeregCode varchar(512), latestDeregCodeDate date,
	latestDeadCode varchar(512), latestDeadCodeDate date,
	deadTable int, deadTableMonth int, deadTableYear int,
	latestDmCode varchar(512), latestDmCodeDate date,
	latestDmPermExCode varchar(512), latestDmPermExCodeDate date,
	latestCkd35codeDate date, latestCkd35code varchar(512),
	latestCkdPermExCodeDate date, latestCkdPermExCode varchar(512),
	latestAcrDate date, latestAcr int, sourceAcr varchar(256),
	latestOedemaDate date, latestOedema varchar(256),
	latestOedemaPermExDate date, latestOedemaPermEx varchar(256),
	latestAfDate date, latestAf varchar(256),
	latestAfPermExDate date, latestAfPermEx varchar(256),
	latestChdDate date, latestChd varchar(256),
	latestHfDate date, latestHf varchar(256),
	latestHfPermExDate date, latestHfPermEx varchar(256),
	latestSbpDate date, latestSbp int,
	latestDbpDate date, latestDbp int,
	latestAsbpDate date, latestAsbp int,
	latestAdbpDate date, latestAdbp int,
	latestAnxietyDate date, latestAnxiety varchar(256),
	latestAnxietyPermExDate date, latestAnxietyPermEx varchar(256),
	latestHyperthyroidDate date, latestHyperthyroid varchar(256),
	latestHyperthyroidPermExDate date, latestHyperthyroidPermEx varchar(256),
	ageExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int,
	denominator int,
	numerator int);
insert into #eligiblePopulationAllData
select 
	a.PatID, latestHTNmedEventDate,
	latestHtnCodeDate, latestHtnCode,
	age,
	latestHtnPermExCode, latestHtnPermExCodeDate,
	latestRegisteredCode, latestRegisteredCodeDate,
	latestDeregCode, latestDeregCodeDate,
	latestDeadCode, latestDeadCodeDate,
	deadTable, deadTableMonth, deadTableYear,
	latestDmCode, latestDmCodeDate,
	latestDmPermExCode, latestDmPermExCodeDate,
	latestCkd35codeDate, latestCkd35code,
	latestCkdPermExCodeDate, latestCkdPermExCode,
	latestAcrDate, latestAcr, sourceAcr,
	latestOedemaDate, latestOedema ,
	latestOedemaPermExDate, latestOedemaPermEx ,
	latestAfDate, latestAf ,
	latestAfPermExDate, latestAfPermEx ,
	latestChdDate, latestChd ,
	latestHfDate, latestHf ,
	latestHfPermExDate, latestHfPermEx,
	latestSbpDate, latestSbp, 
	latestDbpDate, latestDbp,
	latestAsbpDate, latestAsbp,
	latestAdbpDate, latestAdbp,
	latestAnxietyDate, latestAnxiety,
	latestAnxietyPermExDate, latestAnxietyPermEx,
	latestHyperthyroidDate, latestHyperthyroid,
	latestHyperthyroidPermExDate, latestHyperthyroidPermEx,
	ageExclude, regCodeExclude, deRegCodeExclude, deadCodeExclude, deadTableExclude,
	denominator,
	numerator
from #currentHTNmedPts as a
		left outer join (select PatID, age from #age) b on b.PatID = a.PatID
		left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestRegisteredCode, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) g on g.PatID = a.PatID
		left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) h on h.PatID = a.PatID
		left outer join (select PatID, latestDmCode, latestDmCodeDate from #latestDmCode) k on k.PatID = a.PatID
		left outer join (select PatID, latestDmPermExCode, latestDmPermExCodeDate from #latestDmPermExCode) l on l.PatID = a.PatID
		left outer join (select PatID, latestAcrDate, latestAcr, sourceAcr from #latestAcr) r on r.PatID = a.PatID
		left outer join (select PatID, ageExclude, regCodeExclude, deRegCodeExclude,
						deadCodeExclude, deadTableExclude from #exclusions) u on u.PatID = a.PatID
		left outer join (select PatID, denominator from #denominator) v on v.PatID = a.PatID
		left outer join (select PatID, numerator from #numerator) w on w.PatID = a.PatID
		left outer join (select PatID, latestHtnCodeDate, latestHtnCode from #latestHtnCode) x on x.PatID = a.PatID
		left outer join (select PatID, latestCkd35codeDate, latestCkd35code from #latestCkd35code) y on y.PatID = a.PatID
		left outer join (select PatID, latestCkdPermExCodeDate, latestCkdPermExCode from #latestCkdPermExCode) z on z.PatID = a.PatID
		left outer join (select PatID, latestOedemaDate, latestOedema  from #latestOedema) bb on bb.PatID = a.PatID
		left outer join (select PatID, latestOedemaPermExDate, latestOedemaPermEx from #latestOedemaPermEx) cc on cc.PatID = a.PatID
		left outer join (select PatID, latestAfDate, latestAf from #latestAf) dd on dd.PatID = a.PatID
		left outer join (select PatID, latestAfPermExDate, latestAfPermEx from #latestAfPermEx) ee on ee.PatID = a.PatID
		left outer join (select PatID, latestChdDate, latestChd  from #latestChd) ff on ff.PatID = a.PatID
		left outer join (select PatID, latestHfDate, latestHf from #latestHf) gg on gg.PatID = a.PatID
		left outer join (select PatID, latestHfPermExDate, latestHfPermEx from #latestHfPermEx) hh on hh.PatID = a.PatID
		left outer join (select PatID, latestSbpDate, latestSbp from #latestSbp) ii on ii.PatID = a.PatID
		left outer join (select PatID, latestDbpDate, latestDbp from #latestDbp) jj on jj.PatID = a.PatID
		left outer join (select PatID, latestAsbpDate, latestAsbp from #latestAsbp) mm on w.PatID = mm.PatID
		left outer join (select PatID, latestAdbpDate, latestAdbp from #latestAdbp) nn on w.PatID = nn.PatID
		left outer join (select PatID, latestAnxiety, latestAnxietyDate from #latestAnxiety) oo on oo.PatID = a.PatID
		left outer join (select PatID, latestAnxietyPermEx, latestAnxietyPermExDate from #latestAnxietyPermEx) pp on pp.PatID = a.PatID
		left outer join (select PatID, latestHyperthyroid, latestHyperthyroidDate from #latestHyperthyroid) qq on qq.PatID = mm.PatID
		left outer join (select PatID, latestHyperthyroidPermEx, latestHyperthyroidPermExDate from #latestHyperthyroidPermEx) rr on rr.PatID = nn.PatID

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

select 'htn.undiagnosed.med', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
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

select PatID, 'htn.undiagnosed.med',
case
	when numerator = 1 then
	'<li>Patient is prescribed anti-hypertensive medication, and is not on hypertension register.</li>'
	when numerator = 0 then
	'<li>Patient is prescribed anti-hypertensive medication, <strong>but</strong> is not on hypertension register.</li>'
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
			where PatID in (select PatID from #currentHTNmedPts)
			group by PatID, Ingredient
		) as b on b.PatID = a.PatID and b.LatestEventDate = a.EntryDate and b.Ingredient = a.Ingredient
 	left outer join
 		(select Ingredient, MaxDose from drugIngredients) as c on b.Ingredient = c.Ingredient
where a.PatID in (select PatID from #currentHTNmedPts) 
--EXCLUDE any events that are a 'stopped' or 'error' event
and [Event] in ('DOSE DECREASED','DOSE INCREASED', 'STARTED', 'RESTARTED','ADHERENCE')
and c.Ingredient not in ('Sotalol', 'Triamterene', 'Bumetanide', 'Eplerenone', 'Tamsulosin', 'Alfuzosin')


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

--EXPLANATORY CONDITION ABSENT
select PatID,
	'htn.undiagnosed.med' as indicatorId,
	'Condition absent' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Add Hypertension diagnosis using code G2... [G2...]' as actionText,
	'Reasoning' +
	'<ul>'+
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_THI') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)) then '<li>Patient is prescribed a thiazide diuretic but has no evidence of other indications for it (e.g. oedema or heart failure).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_POT') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)) then '<li>Patient is prescribed a potassium-sparing diuretic (e.g. spironolactone) but has no evidence of other indications for it (e.g. oedema or heart failure).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_LOOP') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)) then '<li>Patient is prescribed a loop diuretic (e.g. furosemide) but has no evidence of other indications for it (e.g. oedema or heart failure).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ACEI') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate))) then '<li>Patient is prescribed an ACE-inhibitor but has no evidence of other indications for it (e.g. ACR &ge; 30, diabetes or heart failure).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ARB') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate))) then '<li>Patient is prescribed an Angiotensin Receptor Blocker but has no evidence of other indications for it (e.g. ACR &ge; 30 or diabetes or heart failure).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'CCB') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate))) then '<li>Patient is prescribed an Calcium Channel Blocker but has no evidence of other indications for it (e.g. ACR &ge; 30 or diabetes).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'BB') and (latestChd is null and (latestHf is null or (latestHfPermExDate >= latestHfDate)) and (latestAf is null or (latestAfPermExDate >= latestAfDate)) and (latestAcr <30 or latestAcr is null)) then '<li>Patient is prescribed an Beta Blocker but has no evidence of other indications for it (e.g. ischaemic heart disease, heart failure, AF or ACR &gt; 30.</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ALPHA') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate))) then '<li>Patient is prescribed an Alpha Blocker but has no evidence of other indications for it (e.g. ACR &ge; 30 or diabetes).</li>' else '' end +
	case when PatID in (select PatID from #currentHTNmeds where currentMedIngredient = 'Propranolol') and (latestAnxiety is null or (latestAnxietyPermExDate >= latestAnxietyDate)) and (latestHyperthyroid is null or (latestHyperthyroidPermExDate >= latestHyperthyroidDate)) then '<li>Patient is prescribed Propranolol but has no evidence of other indications for it (e.g. hyperthyroidism or anxiety).</li>' else '' end +
	'<li>So it is likely they are prescribed these medications for hypertension.</li>'+
	'<li>This is important because currently the recorded prevalence of hypertension in Salford is lower than expected. And finding undiagnosed patients can help provide better care and increase your QOF scores.</li>'+
	'<li>If they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and 
	(
		(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_THI') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_POT') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)) )
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_LOOP') and (latestOedemaDate is null or (latestOedemaPermExDate >= latestOedemaDate)) and (latestHf is null or (latestHfPermExDate >= latestHfDate)) )
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ACEI') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate))) and (latestHf is null or (latestHfPermExDate >= latestHfDate)))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ARB') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate)))  and (latestHf is null or (latestHfPermExDate >= latestHfDate)))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'CCB') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate))))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'BB') and (latestChd is null and (latestHf is null or (latestHfPermExDate >= latestHfDate)) and (latestAf is null or (latestAfPermExDate >= latestAfDate)) and (latestAcr <30 or latestAcr is null)))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ALPHA') and ((latestAcr <30 or latestAcr is null) and (latestDmCode is null or (latestDmPermExCodeDate >= latestDmCodeDate))))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedIngredient = 'Propranolol') and (latestAnxiety is null or (latestAnxietyPermExDate >= latestAnxietyDate)) and (latestHyperthyroid is null or (latestHyperthyroidPermExDate >= latestHyperthyroidDate)))
	)		
	
union
--EXPLANATORY CONDITION PRESENT
select PatID,
	'htn.undiagnosed.med' as indicatorId,
	'Condition present' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Review whether patient has hypertension - add code G2... [G2...] if they have' as actionText,
	'Reasoning' +
	'<ul>'+
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_THI') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
			then '<li>Patient is prescribed a thiazide diuretic. This may be because they have oedema or heart failure.</li>' 
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_POT') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
			then '<li>Patient is prescribed a potassium-sparing diuretic (e.g. spironolactone). This may be because they have oedema or heart failure.</li>'
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_LOOP') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
			then '<li>Patient is prescribed a loop diuretic (e.g. furosemide). This may be because they have oedema or heart failure.</li>' 
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ACEI') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
			then '<li>Patient is prescribed an ACE-inhibitor. This maybe because their latest ACR is &ge; 30, or they have diabetes or heart failure.</li>' 
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ARB') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
			then '<li>Patient is prescribed an Angiotensin Receptor Blocker. This maybe because their latest ACR is &ge; 30, or they have diabetes or heart failure.</li>'
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'CCB') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate))))
			then '<li>Patient is prescribed an Calcium Channel Blocker. This maybe because their latest ACR is &ge; 30 AND/OR they have diabetes.</li>' 
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'BB') and (latestChd is not null or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))) or (latestAf is not null and (latestAfPermEx is null or (latestAfPermExDate < latestAfDate))) or latestAcr >= 30)
			then '<li>Patient is prescribed an Beta Blocker. This maybe because they have ischaemic heart disease, heart failure, AF or ACR &ge; 30.</li>' 
			else ''
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ALPHA') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate))))
			then '<li>Patient is prescribed an Alpha Blocker. This maybe because their latest ACR is &ge; 30 AND/OR they have diabetes.</li>'
			else '' 
		end +
		case 
			when PatID in (select PatID from #currentHTNmeds where currentMedIngredient = 'Propranolol') and ((latestAnxietyDate is not null and (latestAnxietyPermExDate is null or (latestAnxietyPermExDate < latestAnxietyDate))) or (latestHyperthyroid is not null and (latestHyperthyroidPermEx is null or (latestHyperthyroidPermExDate < latestHyperthyroidDate))))
			then '<li>Patient is prescribed Propranolol. This may be because they have anxiety or hyperthyroidism.</li>'
			else '' 
		end +
	'<li><strong>However</strong>, if they also have hypertension please add code G2... [G2...].</li>'+
	'<li>If they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'<li>This is important because currently the recorded prevalence of hypertension in Salford is lower than expected. And finding undiagnosed patients can help provide better care and increase your QOF scores.</li>'+
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and 
	(
		(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_THI') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate)))))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_POT') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate)))))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'DIUR_LOOP') and ((latestOedemaDate is not null and (latestOedemaPermExDate is null or (latestOedemaPermExDate < latestOedemaDate))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate)))))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ACEI') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate)))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ARB') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate)))) or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'CCB') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate)))))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'BB') and (latestChd is not null or (latestHf is not null and (latestHfPermEx is null or (latestHfPermExDate < latestHfDate))) or (latestAf is not null and (latestAfPermEx is null or (latestAfPermExDate < latestAfDate))) or latestAcr >= 30))
	or 	(PatID in (select PatID from #currentHTNmeds where currentMedFamily = 'ALPHA') and (latestAcr >= 30 or (latestDmCode is not null and (latestDmPermExCodeDate is null or (latestDmPermExCodeDate < latestDmCodeDate)))))
	or	(PatID in (select PatID from #currentHTNmeds where currentMedIngredient = 'Propranolol') and ((latestAnxietyDate is not null and (latestAnxietyPermExDate is null or (latestAnxietyPermExDate < latestAnxietyDate))) or (latestHyperthyroid is not null and (latestHyperthyroidPermEx is null or (latestHyperthyroidPermExDate < latestHyperthyroidDate)))))
	)		

							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--'measure' actions
select c.pracID, 'Condition absent', 
	SUM(case when indicatorId = 'htn.undiagnosed.med' and actionCat = 'Condition absent' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.med' and actionCat = 'Condition absent' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.med' and actionCat = 'Condition absent' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, indicatorId, actionCat from [output.pingr.patActions]) as b on b.PatID = a.PatID
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

--CODE HTN
select
	pracID as pracID,
	'htn.undiagnosed.med' as indicatorId,
	'CodeHTN' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Inform all clinical staff to record hypertension in patient''s records using code G2... [G2...] ' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients on anti-hypertensive medication with no other clinical indication <strong>do not</strong> have a recorded diagnosis of hyptertension.</li>' +
		'<li>This is important because currently the recorded prevalence of hypertension in Salford is lower than expected. Finding undiagnosed patients can help provide better care and increase your QOF scores.</li></ul>'
from #reasonProportions
where proportionId = 'Condition absent' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--overview tab
('htn.undiagnosed.med','name','Hypertension Casefinding 2: Anti-Hypertensive medication'), --overview table name
('htn.undiagnosed.med','tabText','HTN Casefinding 2: Medication'), --indicator tab text
('htn.undiagnosed.med','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients prescribed anti-hypertensive medication that are on the hypertension register. <strong>Patients <i>not</i> on the register <i>may</i> have undiagnosed hypertension</strong>. (Though some may have these medications prescribed for other reasons.)<br>' + 
	'<strong>Why this is important:</strong> The recorded prevalence of hypertension in Salford is lower than expected. Finding undiagnosed patients can help provide better care and increase your QOF scores.<br>'),
--indicator tab
--summary text
('htn.undiagnosed.med','tagline','of patients currently prescribed anti-hypertensive medication are on the hypertension register. <strong>Patients <i>not</i> on the register <i>may</i> have undiagnosed hypertension</strong>. (Though some may have these medications prescribed for other reasons.)'),
('htn.undiagnosed.med','positiveMessage', --tailored text
	case 
		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Target! To improve even further, look through the recommended actions on this page and for the patients below.'
		else 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
	end),
--pt lists
('htn.undiagnosed.med','valueId','SBP'),
('htn.undiagnosed.med','valueName','Latest SBP'),
('htn.undiagnosed.med','dateORvalue','value'),
('htn.undiagnosed.med','valueSortDirection','desc'),  -- 'asc' or 'desc'
('htn.undiagnosed.med','tableTitle','All patients currently prescribed anti-hypertensive medication <strong>not</strong> on the hypertension register'),

--imp opp charts
--based on actionCat

--EXPLANATORY CONDITION ABSENT
('htn.undiagnosed.med','opportunities.Condition absent.name','Relevant non-hypertension condition <strong>absent</strong>'),
('htn.undiagnosed.med','opportunities.Condition absent.description','Patients currently prescribed anti-hypertensive medication <strong>not</strong> on the hypertension register with <strong>no</strong> other condition that could explain the prescription - these patients are most likely to have hypertension'),
('htn.undiagnosed.med','opportunities.Condition absent.positionInBarChart','1'),

--EXPLANATORY CONDITION PRESENT
('htn.undiagnosed.med','opportunities.Condition present.name','Relevant non-hypertension condition <strong>present</strong>'),
('htn.undiagnosed.med','opportunities.Condition present.description','Patients currently prescribed anti-hypertensive medication <strong>not</strong> on the hypertension register <strong>with</strong> other conditions that could explain the prescription - these patients may not have hypertension'),
('htn.undiagnosed.med','opportunities.Condition present.positionInBarChart','2');
