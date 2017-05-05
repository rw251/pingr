--v2 5/3/17
--changed to make clear that abpm/hbpm in reason / why
--changed name to 'casefinding'
--hospital readings STILL included
--added additional category tci for repeat measure if > 6/12 ago

									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.htn.undiagnosed.measures') DROP PROCEDURE [pingr.htn.undiagnosed.measures];
GO
CREATE PROCEDURE [pingr.htn.undiagnosed.measures] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
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
-- filter only those >= 140
and CodeValue >= 140
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
-- filter only those >= 90
and CodeValue >= 90
group by s.PatID, latestDbpDate

--#secondLatestSbp
IF OBJECT_ID('tempdb..#secondLatestSbp') IS NOT NULL DROP TABLE #secondLatestSbp
CREATE TABLE #secondLatestSbp (PatID int, secondLatestSbpDate date, secondLatestSbp int, secondLatestSbpSource varchar(12));
insert into #secondLatestSbp
select a.PatID, secondLatestSbpDate, max(a.CodeValue), max(Source) as secondLatestSbpSource from SIR_ALL_Records as a
	inner join
		(
	-- find 2nd latest BP
			select s.PatID, max(s.EntryDate) as secondLatestSbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestSbpDate from #latestSbp --i.e. select latest SBP date
					)sub on sub.PatID = s.PatID and sub.latestSbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'sbp')
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestSbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'sbp')
-- filter only those >= 140
and CodeValue >= 140
group by a.PatID, secondLatestSbpDate

--#secondLatestDbp
IF OBJECT_ID('tempdb..#secondLatestDbp') IS NOT NULL DROP TABLE #secondLatestDbp
CREATE TABLE #secondLatestDbp (PatID int, secondLatestDbpDate date, secondLatestDbp int, secondLatestDbpSource varchar(12));
insert into #secondLatestDbp
select a.PatID, secondLatestDbpDate, max(a.CodeValue), max(Source) as secondLatestDbpSource from SIR_ALL_Records as a
	inner join
		(
		-- find 2nd latest BP
			select s.PatID, max(s.EntryDate) as secondLatestDbpDate from SIR_ALL_Records as s
				inner join
					(
						select PatID, latestDbpDate from #latestDbp --i.e. select latest DBP date
					)sub on sub.PatID = s.PatID and sub.latestDbpDate > s.EntryDate --i.e. select max date where the latest SBP date is still greate (the second to last date)
			where ReadCode in (select code from codeGroups where [group] = 'dbp')
			group by s.PatID
		) sub on sub.PatID = a.PatID and sub.secondLatestDbpDate = a.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dbp')
-- filter only those >= 90
and CodeValue >= 90
group by a.PatID, secondLatestDbpDate

--#raisedBP
IF OBJECT_ID('tempdb..#raisedBP') IS NOT NULL DROP TABLE #raisedBP
CREATE TABLE #raisedBP 
	(PatID int, 
	latestSbpDate date, latestSbp int, latestDbpDate date, latestDbp int,
	secondLatestSbpDate date, secondLatestSbp int, secondLatestDbpDate date, secondLatestDbp int);
insert into #raisedBP
select a.PatID,
	latestSbpDate, latestSbp, latestDbpDate, latestDbp,
	secondLatestSbpDate, secondLatestSbp, secondLatestDbpDate, secondLatestDbp
from #latestSbp as a
left outer join (select PatID, latestDbpDate, latestDbp from #latestDbp) b on b.PatID = a.PatID
left outer join (select PatID, secondLatestSbpDate, secondLatestSbp from #secondLatestSbp) c on c.PatID = a.PatID
left outer join (select PatID, secondLatestDbpDate, secondLatestDbp from #secondLatestDbp) d on d.PatID = a.PatID
where latestSbp is not null and latestDbp is not null and secondLatestSbp is not null and secondLatestDbp is not null

--#latestHtnCode
IF OBJECT_ID('tempdb..#latestHtnCode') IS NOT NULL DROP TABLE #latestHtnCode
CREATE TABLE #latestHtnCode (PatID int, latestHtnCodeDate date, latestHtnCodeMin varchar(512), latestHtnCodeMax varchar(512), latestHtnCode varchar(512));
insert into #latestHtnCode (PatID, latestHtnCodeDate, latestHtnCodeMin, latestHtnCodeMax, latestHtnCode)
select s.PatID, latestHtnCodeDate, MIN(Rubric) as latestHtnCodeMin, MAX(Rubric) as latestHtnCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestHtnCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestHtnCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'htnQof')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
and ReadCode  in (select code from codeGroups where [group] = 'htnQof')
group by s.PatID, latestHtnCodeDate

--#latestWhiteCoatCode
IF OBJECT_ID('tempdb..#latestWhiteCoatCode') IS NOT NULL DROP TABLE #latestWhiteCoatCode
CREATE TABLE #latestWhiteCoatCode (PatID int, latestWhiteCoatCodeDate date, latestWhiteCoatCodeMin varchar(512), latestWhiteCoatCodeMax varchar(512), latestWhiteCoatCode varchar(512));
insert into #latestWhiteCoatCode (PatID, latestWhiteCoatCodeDate, latestWhiteCoatCodeMin, latestWhiteCoatCodeMax, latestWhiteCoatCode)
select s.PatID, latestWhiteCoatCodeDate, MIN(Rubric) as latestWhiteCoatCodeMin, MAX(Rubric) as latestWhiteCoatCodeMax,
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestWhiteCoatCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestWhiteCoatCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'whiteCoat')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestWhiteCoatCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
and ReadCode  in (select code from codeGroups where [group] = 'whiteCoat')
group by s.PatID, latestWhiteCoatCodeDate


--#latestAsbpValue
IF OBJECT_ID('tempdb..#latestAsbpValue') IS NOT NULL DROP TABLE #latestAsbpValue
CREATE TABLE #latestAsbpValue (PatID int, latestAsbpValueDate date, latestAsbpValue int, latestAsbpValueSource varchar(12));
insert into #latestAsbpValue
select s.PatID, latestAsbpValueDate, max(CodeValue), max(Source) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAsbpValueDate from SIR_ALL_Records
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'asbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAsbpValueDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
and ReadCode in (select code from codeGroups where [group] = 'asbp')
group by s.PatID, latestAsbpValueDate

--#latestAdbpValue
IF OBJECT_ID('tempdb..#latestAdbpValue') IS NOT NULL DROP TABLE #latestAdbpValue
CREATE TABLE #latestAdbpValue (PatID int, latestAdbpValueDate date, latestAdbpValue int, latestAdbpValueSource varchar(12));
insert into #latestAdbpValue
select s.PatID, latestAdbpValueDate, max(CodeValue), max(Source) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAdbpValueDate from SIR_ALL_Records
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'adbp')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAdbpValueDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
and ReadCode in (select code from codeGroups where [group] = 'adbp')
group by s.PatID, latestAdbpValueDate

--#currentHtnMeds
IF OBJECT_ID('tempdb..#currentHtnMeds') IS NOT NULL DROP TABLE #currentHtnMeds
CREATE TABLE #currentHtnMeds
	(PatID int, currentHtnMeds int);
insert into #currentHtnMeds
select PatID, 
	case when PatID in 
			(select a.PatID from MEDICATION_EVENTS_HTN as a
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
			group by a.PatID)
	then 1
	else 0 end
from #raisedBP

--#age
IF OBJECT_ID('tempdb..#age') IS NOT NULL DROP TABLE #age
CREATE TABLE #age (PatID int, age int);
insert into #age (PatID, age)
select PatID, YEAR(@achieveDate) - year_of_birth as age from #raisedBP as c
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
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'htnPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestHtnPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
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
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'registered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestRegisteredCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
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
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
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
		where PatID in (select PatID from #raisedBP)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where s.PatID in (select PatID from #raisedBP)
and ReadCode in (select code from codeGroups where [group] = 'dead')
group by s.PatID, latestDeadCodeDate

--#deadTable
--patients marked as dead in the demographics table
IF OBJECT_ID('tempdb..#deadTable') IS NOT NULL DROP TABLE #deadTable
CREATE TABLE #deadTable (PatID int, deadTable int, deadTableMonth int, deadTableYear int);
insert into #deadTable
select PatID, deadTable, deadTableMonth, deadTableYear from #raisedBP as c
	left outer join
		(select patid, dead as deadTable, month_of_death as deadTableMonth, year_of_death as deadTableYear from patients) as d on c.PatID = d.patid

--#exclusions
IF OBJECT_ID('tempdb..#exclusions') IS NOT NULL DROP TABLE #exclusions
CREATE TABLE #exclusions
	(PatID int, ambulatoryExclude int, ageExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int, permExclude int);
insert into #exclusions
select a.PatID,
	case when latestAsbpValue < 135 and latestAdbpValue < 85 then 1 else 0 end as ambulatoryExclude, -- Demographic exclusions: Under 18 at achievement date (from QOF v34 business rules)
	case when age < 17 then 1 else 0 end as ageExclude, -- Demographic exclusions: Under 18 at achievement date (from QOF v34 business rules)
	case when latestRegisteredCodeDate > DATEADD(month, -3, @achievedate) then 1 else 0 end as regCodeExclude, -- Registration date: > achievement date - 9/12 (from CKD ruleset_INLIQ_v32.0)
	case when latestDeregCodeDate > latestSbpDate then 1 else 0 end as deRegCodeExclude, -- Exclude patients with deregistered codes AFTER their latest CKD 35 code
	case when latestDeadCodeDate > latestSbpDate then 1 else 0 end as deadCodeExclude, -- Exclude patients with dead codes after their latest CKD35 code
	case when deadTable = 1 then 1 else 0 end as deadTableExclude, -- Exclude patients listed as dead in the patients table
	case when latestHtnPermExCodeDate is not null and (latestHtnCodeDate is null or (latestHtnCodeDate < latestHtnPermExCodeDate)) then 1 else 0 end as permExclude
from #raisedBP as a
	left outer join (select PatID, age from #age) b on b.PatID = a.PatID
	left outer join (select PatID, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
	left outer join (select PatID, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
	left outer join (select PatID, latestDeadCodeDate from #latestDeadCode) j on j.PatID = a.PatID
	left outer join (select PatID, deadTable from #deadTable) g on g.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCodeDate from #latestHtnPermExCode) h on h.PatID = a.PatID
	left outer join (select PatID, latestHtnCodeDate from #latestHtnCode) i on i.PatID = a.PatID
	left outer join (select PatID, latestAsbpValue, latestAsbpValueDate from #latestAsbpValue) l on l.PatID = a.PatID
	left outer join (select PatID, latestAdbpValue, latestAdbpValueDate from #latestAdbpValue) k on k.PatID = a.PatID
	
--#denominator
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
select a.PatID,
	case when ambulatoryExclude = 0 and ageExclude = 0 and regCodeExclude  = 0
		and deRegCodeExclude  = 0 and deadCodeExclude = 0 
		and deadTableExclude  = 0 and permExclude = 0
		then 1 else 0 end as denominator
from #raisedBP as a
	left outer join (select PatID, ambulatoryExclude, ageExclude, regCodeExclude,
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
from #raisedBP as a
	left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
	left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
	left outer join (select PatID, latestHtnCode, latestHtnCodeDate from #latestHtnCode) d on d.PatID = a.PatID

--#eligiblePopulationAllData
--all data from above combined into one table, plus numerator column
IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (
	PatID int,
	latestHtnCodeDate date, latestHtnCode varchar(512),
	age int,
	latestHtnPermExCode varchar(512), latestHtnPermExCodeDate date,
	latestRegisteredCode varchar(512), latestRegisteredCodeDate date,
	latestDeregCode varchar(512), latestDeregCodeDate date,
	latestDeadCode varchar(512), latestDeadCodeDate date,
	latestWhiteCoatCode varchar(512), latestWhiteCoatCodeDate date,
	deadTable int, deadTableMonth int, deadTableYear int,
	latestSbpDate date, latestSbp int, latestSbpSource varchar(12),
	latestDbpDate date, latestDbp int, latestDbpSource varchar(12),
	secondLatestSbpDate date, secondLatestSbp int, secondLatestSbpSource varchar(12),
	secondLatestDbpDate date, secondLatestDbp int, secondLatestDbpSource varchar(12),
	latestAsbpValueDate date, latestAsbpValue int, latestAsbpValueSource varchar(12),
	latestAdbpValueDate date, latestAdbpValue int, latestAdbpValueSource varchar(12),
	currentHtnMeds int,
	ambulatoryExclude int, ageExclude int, regCodeExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int,
	denominator int,
	numerator int);
insert into #eligiblePopulationAllData
select 
	a.PatID,
	latestHtnCodeDate, latestHtnCode,
	age,
	latestHtnPermExCode, latestHtnPermExCodeDate,
	latestRegisteredCode, latestRegisteredCodeDate,
	latestDeregCode, latestDeregCodeDate,
	latestDeadCode, latestDeadCodeDate,
	latestWhiteCoatCode, latestWhiteCoatCodeDate,
	deadTable, deadTableMonth, deadTableYear,
	a.latestSbpDate, a.latestSbp, latestSbpSource,
	a.latestDbpDate, a.latestDbp, latestDbpSource,
	a.secondLatestSbpDate, a.secondLatestSbp, secondLatestSbpSource,
	a.secondLatestDbpDate, a.secondLatestDbp, secondLatestDbpSource,
	latestAsbpValueDate, latestAsbpValue, latestAsbpValueSource,
	latestAdbpValueDate, latestAdbpValue, latestAdbpValueSource,
	currentHtnMeds,
	ambulatoryExclude, ageExclude, regCodeExclude, deRegCodeExclude, deadCodeExclude, deadTableExclude,
	denominator,
	numerator
from #raisedBP as a
		left outer join (select PatID, age from #age) b on b.PatID = a.PatID
		left outer join (select PatID, latestHtnPermExCode, latestHtnPermExCodeDate from #latestHtnPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestRegisteredCode, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) g on g.PatID = a.PatID
		left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) h on h.PatID = a.PatID
		left outer join (select PatID, ambulatoryExclude, ageExclude, regCodeExclude, deRegCodeExclude,
						deadCodeExclude, deadTableExclude from #exclusions) u on u.PatID = a.PatID
		left outer join (select PatID, denominator from #denominator) v on v.PatID = a.PatID
		left outer join (select PatID, numerator from #numerator) w on w.PatID = a.PatID
		left outer join (select PatID, latestHtnCodeDate, latestHtnCode from #latestHtnCode) x on x.PatID = a.PatID
		left outer join (select PatID, latestSbpDate, latestSbp, latestSbpSource from #latestSbp) ii on ii.PatID = a.PatID
		left outer join (select PatID, latestDbpDate, latestDbp, latestDbpSource from #latestDbp) jj on jj.PatID = a.PatID
		left outer join (select PatID, secondLatestSbpDate, secondLatestSbp, secondLatestSbpSource from #secondLatestSbp) oo on oo.PatID = a.PatID
		left outer join (select PatID, secondLatestDbpDate, secondLatestDbp, secondLatestDbpSource from #secondLatestDbp) pp on pp.PatID = a.PatID
		left outer join (select PatID, latestAsbpValueDate, latestAsbpValue, latestAsbpValueSource from #latestAsbpValue) mm on mm.PatID = a.PatID
		left outer join (select PatID, latestAdbpValueDate, latestAdbpValue, latestAdbpValueSource from #latestAdbpValue) nn on nn.PatID = a.PatID
		left outer join (select PatID, latestWhiteCoatCodeDate, latestWhiteCoatCode from #latestWhiteCoatCode) qq on qq.PatID = a.PatID
		left outer join (select PatID, currentHtnMeds from #currentHtnMeds) rr on rr.PatID = a.PatID

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
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'htn.undiagnosed.measures', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
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

select PatID, 'htn.undiagnosed.measures',
case
	when numerator = 1 then
		'<li>Patient is <strong>on</strong> the hypertension register.</li>' +
		'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
		case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +
		'<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' +
		case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end
	when numerator = 0 then 
		'<li>Patient is <strong>not</strong> on the hypertension register.</li>'+
		'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
		case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +
		case when secondLatestSbp is not null then '<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' else '' end +
		case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +
		case when latestAsbpValue is not null then '<li>Latest ambulatory blood pressure was ' + rtrim(Str(latestAsbpValue)) + '/' + ltrim(Str(latestAdbpValue)) + ' mmHg on ' + CONVERT(VARCHAR, latestAsbpValueDate, 3) + '.</li>' else '' end +
		case when latestAsbpValueSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
		case when latestSbp >= 180 or latestDbp >= 110 then '<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests that patients should be diagnosed with hypertension if they have BP &ge; 180/110 mmHg</a>.' else '' end +
		case when latestSbp < 180 and latestDbp < 110 and (latestAsbpValue >= 135 or latestAdbpValue >= 85) then '<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests patients should be diagnosed with hypertension if they have ambulatory / home BP &ge; 135/85 mmHg</a>.' else '' end +
		case when latestSbp < 180 and latestDbp < 110 and (latestAdbpValue is null and latestAsbpValue is null) then '<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests patients with 2 blood pressure readings &ge; 140/90 should be offered ambulatory (or home) blood pressure monitoring to diagnose hypertension</a>.' else '' end
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

--OVER 180/110 --> DIAGNOSE
select PatID,
	'htn.undiagnosed.measures' as indicatorId,
	'diagnose' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Add Hypertension diagnosis using code G2... [G2...]' as actionText,
	'Reasoning' +
	'<ul>'+
	'<li>Patient is <strong>not</strong> on the hypertension register.</li>'+
	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests that patients should be diagnosed with hypertension if they have BP &ge; 180/110 mmHg</a>.</li>'+
	'<li>If you believe they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and (latestSbp >= 180 or latestDbp >= 110)

union
--OVER 140/90 x 2 + ABPM > 135/85 --> DIAGNOSE
select PatID,
	'htn.undiagnosed.measures' as indicatorId,
	'diagnose' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Add Hypertension diagnosis using code G2... [G2...]' as actionText,
	'Reasoning' +
	'<ul>'+
	'<li>Patient is <strong>not</strong> on the hypertension register.</li>'+
	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' +
	case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>Latest ambulatory / home blood pressure was ' + rtrim(Str(latestAsbpValue)) + '/' + ltrim(Str(latestAdbpValue)) + ' mmHg on ' + CONVERT(VARCHAR, latestAdbpValueDate, 3) + '.</li>' +
	case when latestAsbpValueSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests that patients should be diagnosed with hypertension if they have ambulatory / home BP &ge; 135/85 mmHg</a>.</li>'+
	'<li>If you believe they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and latestSbp < 180 and latestDbp < 110
and (latestAsbpValue >= 135 or latestAdbpValue >= 85)

union
--OVER 140/90 x 2 --> ABPM
select PatID,
	'htn.undiagnosed.measures' as indicatorId,
	'abpm' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Offer ambulatory (or home) blood pressure monitoring using code 8HRH. [8HRH.]' as actionText,
	'Reasoning' +
	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' +
	case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE suggests that patients with 2 blood pressure readings &ge; 140/90 should be offered ambulatory (or home) blood pressure monitoring to diagnose hypertension</a></li>.'+
	'<li>If you believe they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'</ul>' +
	'Useful information' +
	'<ul>' +
	'<li>'  + (select text from regularText where textId = 'linkBhsHbpmHowToPatients') + '</li>' +
	'<li>'  + (select text from regularText where textId = 'linkBhsHbpmPil') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkBhsAbpm') + '</li>' +
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and latestSbp < 180 and latestDbp < 110
and secondLatestSbp is not null and secondLatestDbp is not null
and latestAdbpValue is null and latestAsbpValue is null
--ambulatoryExclude would exclude patients where abpm has been low
--if abpm high then appear above

union
--WHITE COAT --> ABPM
select PatID,
	'htn.undiagnosed.measures' as indicatorId,
	'abpm' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	3 as priority,
	'Offer ambulatory (or home) blood pressure monitoring using code 8HRH. [8HRH.]' as actionText,
	'Reasoning' +
	'<li>Patient has ''white coat'' hypertension in their record on ' + CONVERT(VARCHAR, latestWhiteCoatCodeDate, 3) + '.</li>' +
	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' +
	case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>There is no record of them having ambulatory (or home) blood pressure monitoring before.'+
	'<li><a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>The diagnosis of whitecoat hypertension should be confirmed with ambulatory (or home) blood pressure monitoring</a>.'+
	'<li>However if you believe they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
	'</ul>' +
	'Useful information' +
	'<ul>' +
	'<li>'  + (select text from regularText where textId = 'linkBhsHbpmHowToPatients') + '</li>' +
	'<li>'  + (select text from regularText where textId = 'linkBhsHbpmPil') + '</li>' +
	'<li>'  + (select text from regularText where [textId] = 'linkBhsAbpm') + '</li>' +
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and latestWhiteCoatCode is not null
and latestAsbpValue is null and latestAdbpValue is null

--union
--UNTREATED
--select PatID,
--	'htn.undiagnosed.measures' as indicatorId,
--	'treat' as actionCat,
--	1 as reasonNumber,
--	@ptPercPoints as pointsPerAction,
--	1 as priority,
--	'Start treatment for hypertension' as actionText,
--	'Reasoning' +
--	'<li>Patient may have hypertension but is not currently being treated for it.</li>' +
--	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
--	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
--	'<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' +
--	case when secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
--	'<li>If you believe they <strong>do not</strong> have hypertension please add code 21261 ''Hypertension resolved'' [21261].</li>'+
--	'</ul>'
--	as supportingText
--from #eligiblePopulationAllData
--where denominator = 1 and numerator = 0
--and currentHtnMeds = 0

union
--RE-MEASURE
select PatID,
	'htn.undiagnosed.measures' as indicatorId,
	'remeasure' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Re-measure blood pressure' as actionText,
	'Reasoning' +
	'<li>Latest blood pressure was ' + rtrim(Str(latestSbp)) + '/' + ltrim(Str(latestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, latestSbpDate, 3) + '.</li>' +
	case when latestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	case when latestSbp < 180 or latestDbp < 110 then '<li>Second latest blood pressure was ' + rtrim(Str(secondLatestSbp)) + '/' + ltrim(Str(secondLatestDbp)) + ' mmHg on ' + CONVERT(VARCHAR, secondLatestSbpDate, 3) + '.</li>' else '' end +
	case when (latestSbp < 180 or latestDbp < 110) and secondLatestSbpSource = 'salfordt' then '<li>This reading was taken in <strong>hospital</strong> so may not appear in your record.</li>' else '' end +		
	'<li>They may have <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>hypertension according to NICE criteria</a>.'+
	'<li><strong>But</strong> their latest blood pressure was measured over 6 months ago, so you may wish to re-measure it first.</li><br>'+
	'</ul>'
	as supportingText
from #eligiblePopulationAllData
where denominator = 1 and numerator = 0
and latestSbpDate < DATEADD(month, -6, @refdate)

							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--'diagnose' actions
select c.pracID, 'diagnose', 
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'diagnose' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'diagnose' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'diagnose' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join (select PatID, indicatorId, actionCat from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--'abpm' actions
select c.pracID, 'abpm', 
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'abpm' then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'abpm' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'htn.undiagnosed.measures' and actionCat = 'abpm' then 1.0 else 0.0 end)*@ptPercPoints
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
	'htn.undiagnosed.measures' as indicatorId,
	'Educate' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff of <a href=''https://cks.nice.org.uk/hypertension-not-diabetic#!diagnosissub'' target=''_blank'' title=''NICE Hypertension Diagnosis''>NICE guidance on hypertension diagnosis</a>' as actionText,
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
('htn.undiagnosed.measures','name','Hypertension Casefinding 1: Raised blood pressure'), --overview table name
('htn.undiagnosed.measures','tabText','HTN Casefinding 1: Raised BP'), --indicator tab text
('htn.undiagnosed.measures','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients with persistently raised blood pressure that are on the hypertension register. <strong>Patients <i>not</i> on the register<i>may</i> have undiagnosed hypertension</strong>.<br>' + 
	'<strong>Why this is important:</strong> The recorded prevalence of hypertension in Salford is lower than expected. Finding undiagnosed patients can help provide better care and increase your QOF scores.<br>'),
--indicator tab
--summary text
('htn.undiagnosed.measures','tagline','of patients with persistently raised blood pressure are correctly on the hypertension register. <strong>Patients <i>not</i> on the register <i>may</i> have undiagnosed hypertension</strong>.'),
('htn.undiagnosed.measures','positiveMessage', --tailored text
	case 
		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Target! To improve even further, look through the recommended actions on this page and for the patients below.'
		else 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
	end),
--pt lists
('htn.undiagnosed.measures','valueId','SBP'),
('htn.undiagnosed.measures','valueName','Latest SBP'),
('htn.undiagnosed.measures','dateORvalue','value'),
('htn.undiagnosed.measures','valueSortDirection','desc'),  -- 'asc' or 'desc'
('htn.undiagnosed.measures','tableTitle','All patients with persistently raised blood pressure <strong>not</strong> who may have undiagnosed hypertension'),

--imp opp charts
--based on actionCat

--DIAGNOSE
('htn.undiagnosed.measures','opportunities.diagnose.name','Hypertension diagnostic criteria met'),
('htn.undiagnosed.measures','opportunities.diagnose.description','Patients with persistently raised blood pressure who meet the criteria for hypertension diagnosis who are <strong>not</strong> on the hypertension register.'),
('htn.undiagnosed.measures','opportunities.diagnose.positionInBarChart','1'),

--ABPM
('htn.undiagnosed.measures','opportunities.abpm.name','Need ambulatory (or home) blood pressure monitoring'),
('htn.undiagnosed.measures','opportunities.abpm.description','Patients with persistently raised blood pressure who need ambulatory (or home) blood pressure monitoring to rule in or rule out a hypertension diagnosis.'),
('htn.undiagnosed.measures','opportunities.abpm.positionInBarChart','2'),

--UNTREATED
--('htn.undiagnosed.measures','opportunities.treat.name','Untreated'),
--('htn.undiagnosed.measures','opportunities.treat.description','Patients with persistently raised blood pressure who are currently not receiving hypertensive treatment.'),
--('htn.undiagnosed.measures','opportunities.treat.positionInBarChart','3');

--UNTREATED
('htn.undiagnosed.measures','opportunities.remeasure.name','Re-measure'),
('htn.undiagnosed.measures','opportunities.remeasure.description','Patients whose latest BP reading was more than 6 months ago.'),
('htn.undiagnosed.measures','opportunities.remeasure.positionInBarChart','3');