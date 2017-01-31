									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.copd.exacerbation.rehab') DROP PROCEDURE [pingr.copd.exacerbation.rehab];

GO
CREATE PROCEDURE [pingr.copd.exacerbation.rehab] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
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


--ELIGIBLE POPULATION
--#latestCopdCode
--NB min/max rubric checks if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestCopdCode') IS NOT NULL DROP TABLE #latestCopdCode
CREATE TABLE #latestCopdCode (PatID int, latestCopdCodeDate date, latestCopdCodeMin varchar(512), latestCopdCodeMax varchar(512), latestCopdCode varchar(512));
insert into #latestCopdCode (PatID, latestCopdCodeDate, latestCopdCodeMin, latestCopdCodeMax, latestCopdCode)
select s.PatID, latestCopdCodeDate, MIN(Rubric) as latestCopdCodeMin, MAX(Rubric) as latestCopdCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopdCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'copdQof')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdCodeDate = s.EntryDate
where ReadCode  in (select code from codeGroups where [group] = 'copdQof')
group by s.PatID, latestCopdCodeDate

--#age
IF OBJECT_ID('tempdb..#age') IS NOT NULL DROP TABLE #age
CREATE TABLE #age (PatID int, age int);
insert into #age (PatID, age)
select PatID, YEAR(@achieveDate) - year_of_birth as age from #latestCopdCode as c
	left outer join
		(select patid, year_of_birth from dbo.patients) as d on c.PatID = d.patid

--#latestCopdPermExCode
--NB min/max rubric check if there have been different codes on the same day
IF OBJECT_ID('tempdb..#latestCopdPermExCode') IS NOT NULL DROP TABLE #latestCopdPermExCode
CREATE TABLE #latestCopdPermExCode (PatID int, latestCopdPermExCodeDate date, latestCopdPermExCodeMin varchar(512), latestCopdPermExCodeMax varchar(512), 
	latestCopdPermExCode varchar(512));
insert into #latestCopdPermExCode 
	(PatID, latestCopdPermExCodeDate, latestCopdPermExCodeMin, latestCopdPermExCodeMax, latestCopdPermExCode)
select s.PatID, latestCopdPermExCodeDate, MIN(Rubric) as latestCopdPermExCodeMin, MAX(Rubric) as latestCopdPermExCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopdPermExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdPermExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'copdPermEx')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdPermExCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'copdPermEx')
and EntryDate < @refdate
group by s.PatID, latestCopdPermExCodeDate

--#latestCopdTempExCode
IF OBJECT_ID('tempdb..#latestCopdTempExCode') IS NOT NULL DROP TABLE #latestCopdTempExCode
CREATE TABLE #latestCopdTempExCode (PatID int, latestCopdTempExCodeDate date, latestCopdTempExCodeMin varchar(512), 
	latestCopdTempExCodeMax varchar(512), latestCopdTempExCode varchar(512));
insert into #latestCopdTempExCode 
select s.PatID, latestCopdTempExCodeDate, MIN(Rubric) as latestCopdTempExCodeMin, MAX(Rubric) as latestCopdTempExCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopdTempExCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdTempExCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] in ('copdTempEx','pulRehabTempExSs'))
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdTempExCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] in ('copdTempEx','pulRehabTempExSs'))
and EntryDate < @refdate
group by s.PatID, latestCopdTempExCodeDate

--#latestRegisteredCode
--codes relating to patient registration
IF OBJECT_ID('tempdb..#latestRegisteredCode') IS NOT NULL DROP TABLE #latestRegisteredCode
CREATE TABLE #latestRegisteredCode (PatID int, latestRegisteredCodeDate date, latestRegisteredCodeMin varchar(512), latestRegisteredCodeMax varchar(512), 
	latestRegisteredCode varchar(512));
insert into #latestRegisteredCode 
select s.PatID, latestRegisteredCodeDate, MIN(Rubric) as latestRegisteredCodeMin, MAX(Rubric) as latestRegisteredCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestRegisteredCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestRegisteredCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'registered')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestRegisteredCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'registered')
and EntryDate < @refdate
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
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
and EntryDate < @refdate
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
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'dead')
and EntryDate < @refdate
group by s.PatID, latestDeadCodeDate

--#deadTable 
--patients marked as dead in the demographics table
IF OBJECT_ID('tempdb..#deadTable') IS NOT NULL DROP TABLE #deadTable
CREATE TABLE #deadTable (PatID int, deadTable int, deadTableMonth int, deadTableYear int);
insert into #deadTable
	(PatID, deadTable, deadTableMonth, deadTableYear)	
select PatID, deadTable, deadTableMonth, deadTableYear from #latestCopdCode as c
	left outer join
		(select patid, dead as deadTable, month_of_death as deadTableMonth, year_of_death as deadTableYear from patients) as d on c.PatID = d.patid
			
--#firstCopd
--needed for the 'diagnosis within x months exclusion criterion'
IF OBJECT_ID('tempdb..#firstCopdCode') IS NOT NULL DROP TABLE #firstCopdCode
CREATE TABLE #firstCopdCode (PatID int, firstCopdCodeDate date, firstCopdCodeMin varchar(512), firstCopdCodeMax varchar(512), 
	firstCopdCode varchar(512));
insert into #firstCopdCode 
select s.PatID, firstCopdCodeDate, MIN(Rubric) as firstCopdCodeMin, MAX(Rubric) as firstCopdCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstCopdCode from SIR_ALL_Records s
	inner join (
		select PatID, MIN(EntryDate) as firstCopdCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'copdQof')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.firstCopdCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'copdQof')
and EntryDate < @refdate
group by s.PatID, firstCopdCodeDate

--#firstCopdCodeAfter
--if patients have had a permanent exclusion code: the first COPD date AFTER the LATEST exclusion
--needed for the 'diagnosis within x months exclusion criterion'
IF OBJECT_ID('tempdb..#firstCopdCodeAfter') IS NOT NULL DROP TABLE #firstCopdCodeAfter
CREATE TABLE #firstCopdCodeAfter (PatID int, firstCopdCodeAfterDate date, firstCopdCodeAfterMin varchar(512), 
	firstCopdCodeAfterMax varchar(512), firstCopdCodeAfter varchar(512)); --need this to exclude patients who have been diagnosed within 9/12 of target date as per QOF
insert into #firstCopdCodeAfter
select s.PatID, firstCopdCodeAfterDate, MIN(Rubric) as firstCopdCodeAfterMin, MAX(Rubric) as firstCopdCodeAfterMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstCopdCodeAfter from SIR_ALL_Records as s
	inner join 
	(
		select r.PatID, MIN(EntryDate) as firstCopdCodeAfterDate from SIR_ALL_Records as r
		inner join #latestCopdPermExCode as t on t.PatID = r.PatID
		where r.PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'copdQof')
		and EntryDate < @refdate
		and EntryDate > latestCopdPermExCodeDate --so if there is an exclusion code AND copd code on the same day, exclusion wins - if there are further copd codes afterwards then copd wins
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.firstCopdCodeAfterDate = s.EntryDate
inner join #latestCopdPermExCode as t on t.PatID = s.PatID
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'copdQof')
and EntryDate < @refdate
and EntryDate > latestCopdPermExCodeDate --so if there is an exclusion code AND copd code on the same day, exclusion wins - if there are further copd codes afterwards then copd wins
group by s.PatID, firstCopdCodeAfterDate

--#latestMrc2Code
IF OBJECT_ID('tempdb..#latestMrc2Code') IS NOT NULL DROP TABLE #latestMrc2Code
CREATE TABLE #latestMrc2Code (PatID int, latestMrc2CodeDate date, latestMrc2CodeMin varchar(512), latestMrc2CodeMax varchar(512), 
	latestMrc2Code varchar(512));
insert into #latestMrc2Code 
	(PatID, latestMrc2CodeDate, latestMrc2CodeMin, latestMrc2CodeMax, latestMrc2Code)
select s.PatID, latestMrc2CodeDate, MIN(Rubric) as latestMrc2CodeMin, MAX(Rubric) as latestMrc2CodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestMrc2Code from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestMrc2CodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'mrc2')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestMrc2CodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'mrc2')
and EntryDate < @refdate
group by s.PatID, latestMrc2CodeDate

--#latestMrcCode
IF OBJECT_ID('tempdb..#latestMrcCode') IS NOT NULL DROP TABLE #latestMrcCode
CREATE TABLE #latestMrcCode (PatID int, latestMrcCodeDate date, latestMrcCodeMin varchar(512), latestMrcCodeMax varchar(512), 
	latestMrcCode varchar(512));
insert into #latestMrcCode 
select s.PatID, latestMrcCodeDate, MIN(Rubric) as latestMrcCodeMin, MAX(Rubric) as latestMrcCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestMrcCode from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestMrcCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'mrc')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestMrcCodeDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'mrc')
and EntryDate < @refdate
group by s.PatID, latestMrcCodeDate

--#latestCopdExacThisFinancialYear
IF OBJECT_ID('tempdb..#latestCopdExacThisFinancialYear') IS NOT NULL DROP TABLE #latestCopdExacThisFinancialYear
CREATE TABLE #latestCopdExacThisFinancialYear (PatID int, latestCopdExacThisFinancialYearDate date, latestCopdExacThisFinancialYearMin varchar(512), latestCopdExacThisFinancialYearMax varchar(512), 
	latestCopdExacThisFinancialYear varchar(512), latestCopdExacThisFinancialYearType varchar(512));
insert into #latestCopdExacThisFinancialYear
select s.PatID, latestCopdExacThisFinancialYearDate, MIN(Rubric), MAX(Rubric), 
	case 
		when MIN(Rubric)=MAX(Rubric) then MAX(Rubric)
		when MIN(ReadCode) in (select code from codeGroups where [group] in ('copdExacSs','CopdHosp','copdExacNonSs')) then  MIN(Rubric) --so coding gets precedent
		else 'Differ' 
	end,
	case 
		when MAX(ReadCode) in (select code from codeGroups where [group] in ('copdExacSs','CopdHosp','copdExacNonSs')) or MIN(ReadCode) in (select code from codeGroups where [group] in ('copdExacSs','CopdHosp','copdExacNonSs')) then 'coded' --so coding gets precedent
		else 'tabs'
	end
from SIR_ALL_Records s
	inner join (
		select PatID, MAX(EntryDate) as latestCopdExacThisFinancialYearDate from SIR_ALL_Records
		where PatID in (select PatID from #latestCopdCode)
		and (
			(
	--Pred
				(
					(
						ReadCode in 
							(
								'fe62.', --PREDNISOLONE 5mg tablets = 2681 rows
								'fe6i.', --PREDNISOLONE 5mg e/c tablets = 8849 rows
								'fe6j.' --PREDNISOLONE 5mg soluble tablets = 759 rows
							)
						and 
							(
								(CodeUnits like '%8%') or
								(CodeUnits like '%eight%') or
								(CodeUnits like '%6%') or
								(CodeUnits like '%six%')
							)
					) 
					or
					(
						ReadCode = 'fe6s.' --PREDNISOLONE 20mg tablets = 4 rows - though higher doses than expected for exacerbations
						and 
							(
								(CodeUnits like '%2%') or
								(CodeUnits like '%two%')
							)
					) 
					or	
					(
						ReadCode = 'fe6t.' --PREDNISOLONE 10mg tablets = 3 rows - though higher doses than expected for exacerbations
						and 
							(
								(CodeUnits like '%3%') or
								(CodeUnits like '%three%')
							)
					)
				)
				or
		--amox or doxy 100mg tabs
				(
					ReadCode in 
						(
							'e311.', --	00	AMOXICILLIN 250mg capsules
							'e312.', --	00	AMOXICILLIN 500mg capsules
							'e315.', --	00	AMOXIL 250mg capsules
							'e316.', --	00	AMOXIL 500mg capsules
							'e3zF.', --	00	AMOXIDENT 250mg capsules
							'e3zG.', --	00	AMOXIDENT 500mg capsules
							'e3zm.', --	11	AMOXYCILLIN 125mg/5mL syrup
							'e3zn.', --	11	AMOXYCILLIN 250mg/5mL syrup
							'e3z5.', --	00	AMIX 250mg capsules
							'e3z6.', --	00	AMIX 500mg capsules
							'e3zA.', --	00	GALENAMOX TP 250mg capsules
							'e3zB.', --	00	GALENAMOX TP 500mg capsules
							'e3zE.', --	00	AMOXICILLIN 125mg/sachet sugar free powder
							'e3zF.', --	00	AMOXIDENT 250mg capsules
							'e3zG.', --	00	AMOXIDENT 500mg capsules
							'e3zb.', --	00	GALENAMOX 125mg/5mL sugar free suspension
							'e3zc.', --	00	GALENAMOX 250mg/5mL sugar free suspension
							'e3zk.', --	00	AMOXICILLIN 125mg/5mL sugar free suspension
							'e3zm.', --	00	AMOXICILLIN 125mg/5mL syrup
							'e3zn.', --	00	AMOXICILLIN 250mg/5mL syrup
							'e3zo.', --	00	AMOXICILLIN 125mg/1.25mL paediatric suspension
							'e3zq.', --	00	AMOXICILLIN powder 3g/sachet
							'e3zu.', --	00	AMOXICILLIN 250mg/5mL sugar free suspension
							'e31b.', --	00	AMOXIL 125mg/1.25mL paediatric suspension
							'e758.', --	00	DOXYCYCLINE 100mg capsules
							'e75z.', --	00	DOXYCYCLINE 100mg dispersible tablets
							'e752.', --	00	DOXYLAR 100mg capsules
							'e757.' --	00	VIBRAMYCIN-D 100mg dispersible tablets
						)
				)
			)
		or ReadCode in (select code from codeGroups where [group] in ('CopdHosp','copdExacNonSs','copdExacSs')) 
		)

		and EntryDate < @refdate
		and EntryDate > DATEADD(year, -1, @achievedate)
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestCopdExacThisFinancialYearDate = s.EntryDate
where s.PatID in (select PatID from #latestCopdCode)
and (
	ReadCode in 
			(
				'fe62.', --PREDNISOLONE 5mg tablets = 2681 rows
				'fe6i.', --PREDNISOLONE 5mg e/c tablets = 8849 rows
				'fe6j.', --	PREDNISOLONE 5mg soluble tablets = 759 rows
				'fe6s.', --PREDNISOLONE 20mg tablets = 4 rows - though higher doses than expected for exacerbations
				'fe6t.', --PREDNISOLONE 10mg tablets = 3 rows - though higher doses than expected for exacerbations
				'e311.', --	00	AMOXICILLIN 250mg capsules
				'e312.', --	00	AMOXICILLIN 500mg capsules
				'e315.', --	00	AMOXIL 250mg capsules
				'e316.', --	00	AMOXIL 500mg capsules
				'e3zF.', --	00	AMOXIDENT 250mg capsules
				'e3zG.', --	00	AMOXIDENT 500mg capsules
				'e3zm.', --	11	AMOXYCILLIN 125mg/5mL syrup
				'e3zn.', --	11	AMOXYCILLIN 250mg/5mL syrup
				'e3z5.', --	00	AMIX 250mg capsules
				'e3z6.', --	00	AMIX 500mg capsules
				'e3zA.', --	00	GALENAMOX TP 250mg capsules
				'e3zB.', --	00	GALENAMOX TP 500mg capsules
				'e3zE.', --	00	AMOXICILLIN 125mg/sachet sugar free powder
				'e3zF.', --	00	AMOXIDENT 250mg capsules
				'e3zG.', --	00	AMOXIDENT 500mg capsules
				'e3zb.', --	00	GALENAMOX 125mg/5mL sugar free suspension
				'e3zc.', --	00	GALENAMOX 250mg/5mL sugar free suspension
				'e3zk.', --	00	AMOXICILLIN 125mg/5mL sugar free suspension
				'e3zm.', --	00	AMOXICILLIN 125mg/5mL syrup
				'e3zn.', --	00	AMOXICILLIN 250mg/5mL syrup
				'e3zo.', --	00	AMOXICILLIN 125mg/1.25mL paediatric suspension
				'e3zq.', --	00	AMOXICILLIN powder 3g/sachet
				'e3zu.', --	00	AMOXICILLIN 250mg/5mL sugar free suspension
				'e31b.', --	00	AMOXIL 125mg/1.25mL paediatric suspension
				'e758.', --	00	DOXYCYCLINE 100mg capsules
				'e75z.', --	00	DOXYCYCLINE 100mg dispersible tablets
				'e752.', --	00	DOXYLAR 100mg capsules
				'e757.' --	00	VIBRAMYCIN-D 100mg dispersible tablets)
			)
	or ReadCode in (select code from codeGroups where [group] in ('CopdHosp','copdExacNonSs','copdExacSs')) 
	)
and EntryDate < @refdate
and EntryDate > DATEADD(year, -1, @achievedate)
group by s.PatID, latestCopdExacThisFinancialYearDate

--#firstPulRehabCodeAfterExac
--first pul rehab date AFTER the LATEST excaerbation
IF OBJECT_ID('tempdb..#firstPulRehabCodeAfterExac') IS NOT NULL DROP TABLE #firstPulRehabCodeAfterExac
CREATE TABLE #firstPulRehabCodeAfterExac (PatID int, firstPulRehabCodeAfterExacDate date, firstPulRehabCodeAfterExacMin varchar(512), 
	firstPulRehabCodeAfterExacMax varchar(512), firstPulRehabCodeAfterExac varchar(512)); --need this to exclude patients who have been diagnosed within 9/12 of target date as per QOF
insert into #firstPulRehabCodeAfterExac
select s.PatID, firstPulRehabCodeAfterExacDate, MIN(Rubric) as firstPulRehabCodeAfterExacMin, MAX(Rubric) as firstPulRehabCodeAfterExacMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as firstPulRehabCodeAfterExac from SIR_ALL_Records as s
	inner join 
	(
		select r.PatID, MIN(EntryDate) as firstPulRehabCodeAfterExacDate from SIR_ALL_Records as r
		inner join #latestCopdExacThisFinancialYear as t on t.PatID = r.PatID
		where r.PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'pulRehabOfferedSs')
		and EntryDate < @refdate
		and EntryDate >= latestCopdExacThisFinancialYearDate --so if there is an exac code AND pul rehab code on the same day, pul rehab wins
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.firstPulRehabCodeAfterExacDate = s.EntryDate
inner join #latestCopdExacThisFinancialYear as t on t.PatID = s.PatID
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'pulRehabOfferedSs')
and EntryDate < @refdate
and EntryDate >= latestCopdExacThisFinancialYearDate --so if there is an exac code AND pul rehab code on the same day, pul rehab wins
group by s.PatID, firstPulRehabCodeAfterExacDate


--#numberOfCodedCopdExacDatesLast2years
IF OBJECT_ID('tempdb..#numberOfCodedCopdExacDatesLast2years') IS NOT NULL DROP TABLE #numberOfCodedCopdExacDatesLast2years
CREATE TABLE #numberOfCodedCopdExacDatesLast2years 
	(PatID int, numberOfCodedCopdExacDatesLast2years int);
insert into #numberOfCodedCopdExacDatesLast2years
select PatID, count(distinct EntryDate) from SIR_ALL_Records 
	where ReadCode in (select code from codeGroups where [group] = 'copdExacSs') 
		and EntryDate < @refdate 
		and EntryDate > DATEADD(year, -2, @refdate)
		and PatID in (select PatID from #latestCopdCode)
group by PatID

--#numberOfCodedAndUncodedCopdExacDatesLast2years
IF OBJECT_ID('tempdb..#numberOfCodedAndUncodedCopdExacDatesLast2years') IS NOT NULL DROP TABLE #numberOfCodedAndUncodedCopdExacDatesLast2years
CREATE TABLE #numberOfCodedAndUncodedCopdExacDatesLast2years
	(PatID int, numberOfCodedAndUncodedCopdExacDatesLast2years int);
insert into #numberOfCodedAndUncodedCopdExacDatesLast2years
select PatID, count(distinct EntryDate) from SIR_ALL_Records
	where
		(
			(
	--Pred
				(
					(
						ReadCode in 
							(
								'fe62.', --PREDNISOLONE 5mg tablets = 2681 rows
								'fe6i.', --PREDNISOLONE 5mg e/c tablets = 8849 rows
								'fe6j.'
							) --	PREDNISOLONE 5mg soluble tablets = 759 rows
						and 
							(
								(CodeUnits like '%8%') or
								(CodeUnits like '%eight%') or
								(CodeUnits like '%6%') or
								(CodeUnits like '%six%')
							)
					) 
					or
					(
						ReadCode = 'fe6s.' --PREDNISOLONE 20mg tablets = 4 rows - though higher doses than expected for exacerbations
						and 
							(
								(CodeUnits like '%2%') or
								(CodeUnits like '%two%')
							)
					) 
					or	
					(
						ReadCode = 'fe6t.' --PREDNISOLONE 10mg tablets = 3 rows - though higher doses than expected for exacerbations
						and 
							(
								(CodeUnits like '%3%') or
								(CodeUnits like '%three%')
							)
					)
				)
				or
		--amox or doxy 100mg tabs
				(
					ReadCode in 
						(
							'e311.', --	00	AMOXICILLIN 250mg capsules
							'e312.', --	00	AMOXICILLIN 500mg capsules
							'e315.', --	00	AMOXIL 250mg capsules
							'e316.', --	00	AMOXIL 500mg capsules
							'e3zF.', --	00	AMOXIDENT 250mg capsules
							'e3zG.', --	00	AMOXIDENT 500mg capsules
							'e3zm.', --	11	AMOXYCILLIN 125mg/5mL syrup
							'e3zn.', --	11	AMOXYCILLIN 250mg/5mL syrup
							'e3z5.', --	00	AMIX 250mg capsules
							'e3z6.', --	00	AMIX 500mg capsules
							'e3zA.', --	00	GALENAMOX TP 250mg capsules
							'e3zB.', --	00	GALENAMOX TP 500mg capsules
							'e3zE.', --	00	AMOXICILLIN 125mg/sachet sugar free powder
							'e3zF.', --	00	AMOXIDENT 250mg capsules
							'e3zG.', --	00	AMOXIDENT 500mg capsules
							'e3zb.', --	00	GALENAMOX 125mg/5mL sugar free suspension
							'e3zc.', --	00	GALENAMOX 250mg/5mL sugar free suspension
							'e3zk.', --	00	AMOXICILLIN 125mg/5mL sugar free suspension
							'e3zm.', --	00	AMOXICILLIN 125mg/5mL syrup
							'e3zn.', --	00	AMOXICILLIN 250mg/5mL syrup
							'e3zo.', --	00	AMOXICILLIN 125mg/1.25mL paediatric suspension
							'e3zq.', --	00	AMOXICILLIN powder 3g/sachet
							'e3zu.', --	00	AMOXICILLIN 250mg/5mL sugar free suspension
							'e31b.', --	00	AMOXIL 125mg/1.25mL paediatric suspension
							'e758.', --	00	DOXYCYCLINE 100mg capsules
							'e75z.', --	00	DOXYCYCLINE 100mg dispersible tablets
							'e752.', --	00	DOXYLAR 100mg capsules
							'e757.' --	00	VIBRAMYCIN-D 100mg dispersible tablets
						)
				)
			)
		or ReadCode in (select code from codeGroups where [group] in ('CopdHosp','copdExacNonSs','copdExacSs')) 
		)
		and EntryDate < @refdate 
		and EntryDate > DATEADD(year, -2, @refdate)
		and PatID in (select PatID from #latestCopdCode)
group by PatID

--#exclusions
IF OBJECT_ID('tempdb..#exclusions') IS NOT NULL DROP TABLE #exclusions
CREATE TABLE #exclusions 
	(PatID int, ageExclude int, regCodeExclude int, deRegCodeExclude int, tempExExclude int, 
	deadCodeExclude int, deadTableExclude int, diagExclude int, permExExclude int);
insert into #exclusions
select a.PatID,
	case when age < 17 then 1 else 0 end as ageExclude, -- Demographic exclusions: Under 18 at achievement date (from QOF v34 business rules)
	case when latestRegisteredCodeDate > DATEADD(month, -3, @achievedate) then 1 else 0 end as regCodeExclude, -- Registration date: > achievement date - 3/12 (from COPD ruleset_v34.0 Version Date: 31/03/2016)
	case when latestDeregCodeDate > latestCopdCodeDate then 1 else 0 end as deRegCodeExclude, -- Exclude patients with deregistered codes AFTER their latest copd code
	case when latestCopdTempExCodeDate > DATEADD(month, -12, @achievedate) then 1 else 0 end as tempExExclude, -- Expiring exclusions - 12/12 (from SS)
	case when latestDeadCodeDate > latestCopdCodeDate then 1 else 0 end as deadCodeExclude, -- Exclude patients with dead codes after their latest copd code
	case when latestCopdPermExCodeDate > latestCopdCodeDate then 1 else 0 end as permExExclude, -- Permanent exclusions
	case when deadTable = 1 then 1 else 0 end as deadTableExclude, -- Exclude patients listed as dead in the patients table
	case when (firstCopdCodeDate > DATEADD(month, -3, @achievedate)) or (firstCopdCodeAfterDate > DATEADD(month, -3, @achievedate)) then 1 else 0 end as diagExclude -- Diagnosis date > achievement date - 3/12 (from COPD ruleset_v34.0 Version Date: 31/03/2016)
from #latestCopdCode as a
	left outer join (select PatID, age from #age) b on b.PatID = a.PatID
	left outer join (select PatID, latestCopdPermExCodeDate, latestCopdPermExCode from #latestCopdPermExCode) c on c.PatID = a.PatID
	left outer join (select PatID, latestCopdTempExCodeDate, latestCopdTempExCode from #latestCopdTempExCode) d on d.PatID = a.PatID
	left outer join (select PatID, latestRegisteredCodeDate, latestRegisteredCode from #latestRegisteredCode) e on e.PatID = a.PatID
	left outer join (select PatID, latestDeregCodeDate, latestDeregCode from #latestDeregCode) f on f.PatID = a.PatID
	left outer join (select PatID, latestDeadCodeDate, latestDeadCode from #latestDeadCode) j on j.PatID = a.PatID
	left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) g on g.PatID = a.PatID
	left outer join (select PatID, firstCopdCodeDate, firstCopdCode from #firstCopdCode) h on h.PatID = a.PatID
	left outer join (select PatID, firstCopdCodeAfterDate, firstCopdCodeAfter from #firstCopdCodeAfter) i on i.PatID = a.PatID

--#denominator
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
select a.PatID,
	case when
		(latestMrc2CodeDate is not null and latestMrc2CodeDate = latestMrcCodeDate and latestMrc2CodeDate > DATEADD(year, -5, @achievedate)) --pt is mrc2 latest code in last 5 years
		and (latestCopdExacThisFinancialYearDate is not null and latestCopdExacThisFinancialYearDate > DATEADD(month, -12, @achievedate)) --exacerbation in the current achievement year
		and --no exclusions
			ageExclude = 0 and permExExclude  = 0 and tempExExclude  = 0 and regCodeExclude  = 0 
			and diagExclude  = 0 and deRegCodeExclude  = 0 and 	deadCodeExclude  = 0 and deadTableExclude  = 0 
	then 1 
	else 0 
	end as denominator
from #latestCopdCode as a
	left outer join (select PatID, ageExclude, permExExclude, tempExExclude, regCodeExclude, diagExclude, deRegCodeExclude, deadCodeExclude, deadTableExclude from #exclusions) b on b.PatID = a.PatID
	left outer join (select PatID, latestMrc2CodeDate from #latestMrc2Code) c on c.PatID = a.PatID
	left outer join (select PatID, latestMrcCodeDate from #latestMrcCode) d on d.PatID = a.PatID
	left outer join (select PatID, latestCopdExacThisFinancialYearDate from #latestCopdExacThisFinancialYear) e on e.PatID = a.PatID

--#numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID,
	case when 
		denominator = 1
		and (firstPulRehabCodeAfterExacDate is not null and firstPulRehabCodeAfterExacDate >=  DATEADD(month, -2, latestCopdExacThisFinancialYearDate))
		then 1 
		else 0 
		end as numerator
from #latestCopdCode as a
		left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
		left outer join (select PatID, firstPulRehabCodeAfterExacDate from #firstPulRehabCodeAfterExac) c on c.PatID = a.PatID
		left outer join (select PatID, latestCopdExacThisFinancialYearDate from #latestCopdExacThisFinancialYear) d on d.PatID = a.PatID

--#eligiblePopulationAllData
--all data from above combined into one table, plus numerator column
IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int, 
	age int, 
	latestCopdCodeDate date, latestCopdCode varchar(512), 
	latestCopdPermExCode varchar(512), latestCopdPermExCodeDate date, 
	latestCopdTempExCode varchar(512), latestCopdTempExCodeDate date, 
	latestRegisteredCode varchar(512), latestRegisteredCodeDate date, 
	latestDeregCode varchar(512), latestDeregCodeDate date, 
	latestDeadCode varchar(512), latestDeadCodeDate date, 
	deadTable int, deadTableMonth int, deadTableYear int, 
	firstCopdCode varchar(512), firstCopdCodeDate date, 
	firstCopdCodeAfter varchar(512), firstCopdCodeAfterDate date, 
	latestMrc2Code varchar(512), latestMrc2CodeDate date, 
	latestMrcCode varchar(512), latestMrcCodeDate date, 
	latestCopdExacThisFinancialYear varchar(512), latestCopdExacThisFinancialYearDate date, latestCopdExacThisFinancialYearType varchar(512),
	firstPulRehabCodeAfterExac varchar(512), firstPulRehabCodeAfterExacDate date,
	ageExclude int, permExExclude int, tempExExclude int, regCodeExclude int, diagExclude int, deRegCodeExclude int, deadCodeExclude int, deadTableExclude int, 
	denominator int, 
	numerator int);
insert into #eligiblePopulationAllData
select a.PatID, 
	age, 
	a.latestCopdCodeDate, a.latestCopdCode, 
	latestCopdPermExCode, latestCopdPermExCodeDate, 
	latestCopdTempExCode, latestCopdTempExCodeDate, 
	latestRegisteredCode, latestRegisteredCodeDate, 
	latestDeregCode, latestDeregCodeDate, 
	latestDeadCode, latestDeadCodeDate, 
	deadTable, deadTableMonth, deadTableYear, 
	firstCopdCode, firstCopdCodeDate, 
	firstCopdCodeAfter, firstCopdCodeAfterDate, 
	latestMrc2Code, latestMrc2CodeDate, 
	latestMrcCode, latestMrcCodeDate, 
	latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearDate, latestCopdExacThisFinancialYearType,
	firstPulRehabCodeAfterExac, firstPulRehabCodeAfterExacDate, 
	ageExclude, permExExclude, tempExExclude, regCodeExclude, diagExclude, deRegCodeExclude, deadCodeExclude, deadTableExclude, 
	denominator, 
	numerator
from #latestCopdCode as a
		left outer join (select PatID, age from #age) b on b.PatID = a.PatID
		left outer join (select PatID, latestCopdPermExCode, latestCopdPermExCodeDate from #latestCopdPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestCopdTempExCode, latestCopdTempExCodeDate from #latestCopdTempExCode) d on d.PatID = a.PatID
		left outer join (select PatID, latestRegisteredCode, latestRegisteredCodeDate from #latestRegisteredCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) g on g.PatID = a.PatID
		left outer join (select PatID, deadTable, deadTableMonth, deadTableYear from #deadTable) h on h.PatID = a.PatID
		left outer join (select PatID, firstCopdCode, firstCopdCodeDate from #firstCopdCode) i on i.PatID = a.PatID
		left outer join (select PatID, firstCopdCodeAfter, firstCopdCodeAfterDate from #firstCopdCodeAfter) j on j.PatID = a.PatID
		left outer join (select PatID, latestMrc2Code, latestMrc2CodeDate from #latestMrc2Code) k on k.PatID = a.PatID
		left outer join (select PatID, latestMrcCode, latestMrcCodeDate from #latestMrcCode) l on l.PatID = a.PatID
		left outer join (select PatID, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearDate, latestCopdExacThisFinancialYearType from #latestCopdExacThisFinancialYear) m on m.PatID = a.PatID
		left outer join (select PatID, firstPulRehabCodeAfterExac, firstPulRehabCodeAfterExacDate from #firstPulRehabCodeAfterExac) n on n.PatID = a.PatID
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
set @target = 0.75;

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'copd.exacerbation.rehab', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
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

select PatID, 'copd.exacerbation.rehab',
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' +
			case 
				when latestCopdExacThisFinancialYearType = 'tabs' then '(This may not be coded in the record, and may only appear as a prescription of antibiotics and/or steroids'
				else ''
			end + 
		'</li>'+
		'<li>Last recorded breathlessness level was <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!diagnosisadditional:2" target="_blank" title="NICE Clinical Knowledge Summary: COPD">MRC stage 2</a> on ' + CONVERT(VARCHAR, latestMrc2CodeDate, 3) + '. </li>'+
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend these patients are offered pulmonary rehabilitation < 2 months afterwards because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'
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

								---------------------------------------------------------
											-- IN DENOM BUT NOT IN NUM -----
								---------------------------------------------------------

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

--#latestCopd3rdInviteCode
IF OBJECT_ID('tempdb..#latestCopd3rdInviteCode') IS NOT NULL DROP TABLE #latestCopd3rdInviteCode
CREATE TABLE #latestCopd3rdInviteCode 
	(PatID int, latestCopd3rdInviteCodeDate date, latestCopd3rdInviteCodeMin varchar(512), latestCopd3rdInviteCodeMax varchar(512), 
		latestCopd3rdInviteCode varchar(512));
insert into #latestCopd3rdInviteCode
select s.PatID, latestCopd3rdInviteCodeDate, MIN(Rubric) as latestCopd3rdInviteCodeMin, MAX(Rubric) as latestCopd3rdInviteCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopd3rdInviteCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestCopd3rdInviteCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'copd3rdInvite') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestCopd3rdInviteCodeDate = s.EntryDate
where 
	ReadCode in (select code from codeGroups where [group] = 'copd3rdInvite')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestCopd3rdInviteCodeDate

--#numberOfCopdInviteCodesThisFinancialYear
IF OBJECT_ID('tempdb..#numberOfCopdInviteCodesThisFinancialYear') IS NOT NULL DROP TABLE #numberOfCopdInviteCodesThisFinancialYear
CREATE TABLE #numberOfCopdInviteCodesThisFinancialYear 
	(PatID int, numberOfCopdInviteCodesThisFinancialYear int);
insert into #numberOfCopdInviteCodesThisFinancialYear
select PatID, count (*) from SIR_ALL_Records as numberOfCopdInviteCodesThisFinancialYear
	where ReadCode in (select code from codeGroups where [group] = 'copdInvite') 
		and EntryDate < @refdate 
		and EntryDate > DATEADD(year, -1, @achievedate)
		and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
	group by PatID

--LATEST UNCODED pul rehab date BEFORE the LATEST exacerbation
IF OBJECT_ID('tempdb..#latestUncodedPulRehabCodeBeforeExac') IS NOT NULL DROP TABLE #latestUncodedPulRehabCodeBeforeExac
CREATE TABLE #latestUncodedPulRehabCodeBeforeExac 
	(PatID int, latestUncodedPulRehabCodeBeforeExacDate date, latestUncodedPulRehabCodeBeforeExac varchar(512)); 
insert into #latestUncodedPulRehabCodeBeforeExac
select s.PatID, latestUncodedPulRehabCodeBeforeExacDate, MAX(Rubric) as latestUncodedPulRehabCodeBeforeExac from SIR_ALL_Records as s
	inner join 
	(
		select r.PatID, MAX(EntryDate) as latestUncodedPulRehabCodeBeforeExacDate from SIR_ALL_Records as r
		inner join #latestCopdExacThisFinancialYear as t on t.PatID = r.PatID
		where r.PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'pulRehabUncoded')
		and EntryDate < @refdate
		and EntryDate < latestCopdExacThisFinancialYearDate
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.latestUncodedPulRehabCodeBeforeExacDate = s.EntryDate
inner join #latestCopdExacThisFinancialYear as t on t.PatID = s.PatID
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'pulRehabUncoded')
and EntryDate < @refdate
and EntryDate < latestCopdExacThisFinancialYearDate
group by s.PatID, latestUncodedPulRehabCodeBeforeExacDate

--FIRST UNCODED pul rehab date AFTER the LATEST exacerbation
IF OBJECT_ID('tempdb..#firstUncodedPulRehabCodeAfterExac') IS NOT NULL DROP TABLE #firstUncodedPulRehabCodeAfterExac
CREATE TABLE #firstUncodedPulRehabCodeAfterExac 
	(PatID int, firstUncodedPulRehabCodeAfterExacDate date, firstUncodedPulRehabCodeAfterExac varchar(512)); 
insert into #firstUncodedPulRehabCodeAfterExac
select s.PatID, firstUncodedPulRehabCodeAfterExacDate, MAX(Rubric) as firstUncodedPulRehabCodeAfterExac from SIR_ALL_Records as s
	inner join 
	(
		select r.PatID, MIN(EntryDate) as firstUncodedPulRehabCodeAfterExacDate from SIR_ALL_Records as r
		inner join #latestCopdExacThisFinancialYear as t on t.PatID = r.PatID
		where r.PatID in (select PatID from #latestCopdCode)
		and ReadCode in (select code from codeGroups where [group] = 'pulRehabUncoded')
		and EntryDate < @refdate
		and EntryDate >= latestCopdExacThisFinancialYearDate --so if there is an exac code AND pul rehab code on the same day, it = pul rehab
		group by r.PatID
	) sub on sub.PatID = s.PatID and sub.firstUncodedPulRehabCodeAfterExacDate = s.EntryDate
inner join #latestCopdExacThisFinancialYear as t on t.PatID = s.PatID
where s.PatID in (select PatID from #latestCopdCode)
and ReadCode in (select code from codeGroups where [group] = 'pulRehabUncoded')
and EntryDate < @refdate
and EntryDate >= latestCopdExacThisFinancialYearDate --so if there is an exac code AND pul rehab code on the same day, it = pul rehab
group by s.PatID, firstUncodedPulRehabCodeAfterExacDate

--#latestAnyExceptionCode
--ANY quality indicator
IF OBJECT_ID('tempdb..#latestAnyExceptionCode') IS NOT NULL DROP TABLE #latestAnyExceptionCode
CREATE TABLE #latestAnyExceptionCode
	(PatID int, latestAnyExceptionCodeDate date, latestAnyExceptionCodeMin varchar(512), latestAnyExceptionCodeMax varchar(512), 
		latestAnyExceptionCode varchar(512));
insert into #latestAnyExceptionCode
select s.PatID, latestAnyExceptionCodeDate, MIN(Rubric) as latestAnyExceptionCodeMin, MAX(Rubric) as latestAnyExceptionCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestAnyExceptionCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestAnyExceptionCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'exception') and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestAnyExceptionCodeDate = s.EntryDate
where 
	ReadCode in (select code from codeGroups where [group] = 'exception')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestAnyExceptionCodeDate

--#latestCopdAsthmaDrugCode
--no asthma / copd drugs for > 1 year - do they have copd?
IF OBJECT_ID('tempdb..#latestCopdAsthmaDrugCode') IS NOT NULL DROP TABLE #latestCopdAsthmaDrugCode
CREATE TABLE #latestCopdAsthmaDrugCode
	(PatID int, latestCopdAsthmaDrugCodeDate date, latestCopdAsthmaDrugCodeMin varchar(512), latestCopdAsthmaDrugCodeMax varchar(512), 
		latestCopdAsthmaDrugCode varchar(512));
insert into #latestCopdAsthmaDrugCode
select s.PatID, latestCopdAsthmaDrugCodeDate, MIN(Rubric) as latestCopdAsthmaDrugCodeMin, MAX(Rubric) as latestCopdAsthmaDrugCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopdAsthmaDrugCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestCopdAsthmaDrugCodeDate from SIR_ALL_Records
							where 
									(
							--Pred
										(
											(
												ReadCode in 
													(
														'fe62.', --PREDNISOLONE 5mg tablets = 2681 rows
														'fe6i.', --PREDNISOLONE 5mg e/c tablets = 8849 rows
														'fe6j.'
													) --	PREDNISOLONE 5mg soluble tablets = 759 rows
												and 
													(
														(CodeUnits like '%8%') or
														(CodeUnits like '%eight%') or
														(CodeUnits like '%6%') or
														(CodeUnits like '%six%')
													)
											) 
											or
											(
												ReadCode = 'fe6s.' --PREDNISOLONE 20mg tablets = 4 rows - though higher doses than expected for exacerbations
												and 
													(
														(CodeUnits like '%2%') or
														(CodeUnits like '%two%')
													)
											) 
											or	
											(
												ReadCode = 'fe6t.' --PREDNISOLONE 10mg tablets = 3 rows - though higher doses than expected for exacerbations
												and 
													(
														(CodeUnits like '%3%') or
														(CodeUnits like '%three%')
													)
											)
										)
										or
								--inhalers
										(ReadCode in (select code from codeGroups where [group] = 'copdAsthmaDrugs'))
									)
							and EntryDate < @refdate					
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestCopdAsthmaDrugCodeDate = s.EntryDate
where 
	(
--Pred
		(
			(
				ReadCode in 
					(
						'fe62.', --PREDNISOLONE 5mg tablets = 2681 rows
						'fe6i.', --PREDNISOLONE 5mg e/c tablets = 8849 rows
						'fe6j.'
					) --	PREDNISOLONE 5mg soluble tablets = 759 rows
				and 
					(
						(CodeUnits like '%8%') or
						(CodeUnits like '%eight%') or
						(CodeUnits like '%6%') or
						(CodeUnits like '%six%')
					)
			) 
			or
			(
				ReadCode = 'fe6s.' --PREDNISOLONE 20mg tablets = 4 rows - though higher doses than expected for exacerbations
				and 
					(
						(CodeUnits like '%2%') or
						(CodeUnits like '%two%')
					)
			) 
			or	
			(
				ReadCode = 'fe6t.' --PREDNISOLONE 10mg tablets = 3 rows - though higher doses than expected for exacerbations
				and 
					(
						(CodeUnits like '%3%') or
						(CodeUnits like '%three%')
					)
			)
		)
		or
--inhalers
		(ReadCode in (select code from codeGroups where [group] = 'copdAsthmaDrugs'))
	)
	and EntryDate < @refdate 
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestCopdAsthmaDrugCodeDate

--#latestCopdExcludedCode
IF OBJECT_ID('tempdb..#latestCopdExcludedCode') IS NOT NULL DROP TABLE #latestCopdExcludedCode
CREATE TABLE #latestCopdExcludedCode
	(PatID int, latestCopdExcludedCodeDate date, latestCopdExcludedCodeMin varchar(512), latestCopdExcludedCodeMax varchar(512), 
		latestCopdExcludedCode varchar(512));
insert into #latestCopdExcludedCode
select s.PatID, latestCopdExcludedCodeDate, MIN(Rubric) as latestCopdExcludedCodeMin, MAX(Rubric) as latestCopdExcludedCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCopdExcludedCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestCopdExcludedCodeDate from SIR_ALL_Records
							where ReadCode = '1I70.'	--00	Chronic obstructive pulmonary disease excluded by spirometry
							and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestCopdExcludedCodeDate = s.EntryDate
where 
	ReadCode = '1I70.'	--00	Chronic obstructive pulmonary disease excluded by spirometry
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestCopdExcludedCodeDate

--#latestMiNowCode
IF OBJECT_ID('tempdb..#latestMiNowCode') IS NOT NULL DROP TABLE #latestMiNowCode
CREATE TABLE #latestMiNowCode
	(PatID int, latestMiNowCodeDate date, latestMiNowCodeMin varchar(512), latestMiNowCodeMax varchar(512), 
		latestMiNowCode varchar(512));
insert into #latestMiNowCode
select s.PatID, latestMiNowCodeDate, MIN(Rubric) as latestMiNowCodeMin, MAX(Rubric) as latestMiNowCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestMiNowCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestMiNowCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'MInow')
							and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestMiNowCodeDate = s.EntryDate
where 
	ReadCode in (select code from codeGroups where [group] = 'MInow')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestMiNowCodeDate

--#latestUnstableAnginaCode
IF OBJECT_ID('tempdb..#latestUnstableAnginaCode') IS NOT NULL DROP TABLE #latestUnstableAnginaCode
CREATE TABLE #latestUnstableAnginaCode
	(PatID int, latestUnstableAnginaCodeDate date, latestUnstableAnginaCodeMin varchar(512), latestUnstableAnginaCodeMax varchar(512), 
		latestUnstableAnginaCode varchar(512));
insert into #latestUnstableAnginaCode
select s.PatID, latestUnstableAnginaCodeDate, MIN(Rubric) as latestUnstableAnginaCodeMin, MAX(Rubric) as latestUnstableAnginaCodeMax, 
	case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestUnstableAnginaCode from SIR_ALL_Records as s
		inner join (select PatID, MAX(EntryDate) as latestUnstableAnginaCodeDate from SIR_ALL_Records
							where ReadCode in (select code from codeGroups where [group] = 'unstableAngina')
							and EntryDate < @refdate
							and PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
							group by PatID
					) sub on sub.PatID = s.PatID and sub.latestUnstableAnginaCodeDate = s.EntryDate
where 
	ReadCode in (select code from codeGroups where [group] = 'unstableAngina')
	and s.PatID in (select PatID from #eligiblePopulationAllData where denominator = 1 and numerator = 0)
group by s.PatID, latestUnstableAnginaCodeDate


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
		latestCopd3rdInviteCodeDate date, latestCopd3rdInviteCode varchar(512),
		numberOfCopdInviteCodesThisFinancialYear int,
		latestUncodedPulRehabCodeBeforeExacDate date, latestUncodedPulRehabCodeBeforeExac varchar(512),
		firstUncodedPulRehabCodeAfterExacDate date, firstUncodedPulRehabCodeAfterExac varchar(512),
		latestAnyExceptionCodeDate date, latestAnyExceptionCode varchar(512),
		latestCopdAsthmaDrugCodeDate date, latestCopdAsthmaDrugCode varchar(512),
		latestCopdExcludedCodeDate date,latestCopdExcludedCode varchar(512),
		latestMiNowCodeDate date, latestMiNowCode varchar(512),
		latestUnstableAnginaCodeDate date, latestUnstableAnginaCode varchar(512)		
	);
insert into #impOppsData
select a.PatID,
		latestPalCodeDate, latestPalCode,
		latestPalPermExCodeDate, latestPalPermExCode,
		latestFrailCodeDate, latestFrailCode,
		latestHouseBedboundCodeDate, latestHouseBedboundCode,
		latestHouseBedboundPermExCodeDate, latestHouseBedboundPermExCode,
		latestCopd3rdInviteCodeDate, latestCopd3rdInviteCode,
		numberOfCopdInviteCodesThisFinancialYear,
		latestUncodedPulRehabCodeBeforeExacDate, latestUncodedPulRehabCodeBeforeExac,
		firstUncodedPulRehabCodeAfterExacDate, firstUncodedPulRehabCodeAfterExac,
		latestAnyExceptionCodeDate, latestAnyExceptionCode,
		latestCopdAsthmaDrugCodeDate, latestCopdAsthmaDrugCode,
		latestCopdExcludedCodeDate,latestCopdExcludedCode,
		latestMiNowCodeDate, latestMiNowCode,
		latestUnstableAnginaCodeDate, latestUnstableAnginaCode	
from #eligiblePopulationAllData as a
		left outer join (select PatID, latestPalCodeDate, latestPalCode from #latestPalCode) b on b.PatID = a.PatID
		left outer join (select PatID, latestPalPermExCodeDate, latestPalPermExCode from #latestPalPermExCode) c on c.PatID = a.PatID
		left outer join (select PatID, latestFrailCodeDate, latestFrailCode from #latestFrailCode) d on d.PatID = a.PatID
		left outer join (select PatID, latestHouseBedboundCodeDate, latestHouseBedboundCode from #latestHouseBedboundCode) e on e.PatID = a.PatID
		left outer join (select PatID, latestHouseBedboundPermExCodeDate, latestHouseBedboundPermExCode from #latestHouseBedboundPermExCode) f on f.PatID = a.PatID
		left outer join (select PatID, latestCopd3rdInviteCodeDate, latestCopd3rdInviteCode from #latestCopd3rdInviteCode) g on g.PatID = a.PatID
		left outer join (select PatID, numberOfCopdInviteCodesThisFinancialYear from #numberOfCopdInviteCodesThisFinancialYear) h on h.PatID = a.PatID
		left outer join (select PatID, latestUncodedPulRehabCodeBeforeExacDate, latestUncodedPulRehabCodeBeforeExac from #latestUncodedPulRehabCodeBeforeExac) i on i.PatID = a.PatID
		left outer join (select PatID, firstUncodedPulRehabCodeAfterExacDate, firstUncodedPulRehabCodeAfterExac from #firstUncodedPulRehabCodeAfterExac) j on j.PatID = a.PatID
		left outer join (select PatID, latestAnyExceptionCodeDate, latestAnyExceptionCode from #latestAnyExceptionCode) pp on pp.PatID = a.PatID
		left outer join (select PatID, latestCopdAsthmaDrugCodeDate, latestCopdAsthmaDrugCode from #latestCopdAsthmaDrugCode) qq on qq.PatID = a.PatID
		left outer join (select PatID, latestCopdExcludedCodeDate,latestCopdExcludedCode from #latestCopdExcludedCode) ss on ss.PatID = a.PatID
		left outer join (select PatID, latestMiNowCodeDate, latestMiNowCode from #latestMiNowCode) tt on tt.PatID = a.PatID
		left outer join (select PatID, latestUnstableAnginaCodeDate, latestUnstableAnginaCode from #latestUnstableAnginaCode) uu on uu.PatID = a.PatID
where denominator = 1 and numerator = 0

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

--EXACERBATION (CODED OR UNCODED) < 2/12 AGO
select a.PatID,
	'copd.exacerbation.rehab' as indicatorId,
	'Offer pul rehab (lt 2/12)' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Offer pulmonary rehab (using code 9NSL. [#9NSL.])' as actionText,
	'Suggested action'+
		'<ul>'+
		'<li>Offer pulmonary rehab using code 9NSL. [#9NSL.].</li>'+
			'<ul>'+
			'<li>Patients can self-refer via <a href="http://www.salfordcommunityleisure.co.uk/lifestyles/active-lifestyles/cardiac-pulmonary-cancer-rehab-classes" target="_blank" title="Salford Community Lifestyles: Pulmonary Rehabilitation Classes">Salford Community Lifestyles</a> or <a href="https://www.way2wellbeing.org.uk/health/long-term-conditions/copd/getting-support/" target="_blank" title="way2wellbeing: COPD information">Breathing Better</a>.</li>'+
			'<li>Provide a <a href="https://www.blf.org.uk/support-for-you/exercise/pulmonary-rehabilitation" title="British Lung Foundation" target="_blank">Patient Information Leaflet on Pulmonary Rehabilitation</a>.</li>'+
			'</ul>'+
		'</li>'+
		'<li>If patient is unsuitable, use code 9kf0. [#9kf0.]</li>'+
		'<li>If patient declines, use code 8IA9. [#8IA9.]</li>'+
		'</ul>'+
	'Reasoning'+
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' +
			case 
				when latestCopdExacThisFinancialYearType = 'tabs' then '(This may not be coded in the record, and may only appear as a prescription of antibiotics and/or steroids'
				else ''
			end + 
		'</li>'+
		'<li>Last recorded breathlessness level was <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!diagnosisadditional:2" target="_blank" title="NICE Clinical Knowledge Summary: COPD">MRC stage 2</a> on ' + CONVERT(VARCHAR, latestMrc2CodeDate, 3) + '. </li>'+
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend these patients are offered pulmonary rehabilitation < 2 months afterwards because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'</ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearDate, firstCopdCodeDate, latestCopdExacThisFinancialYearType, latestMrc2CodeDate from #eligiblePopulationAllData) as b on b.PatID = a.PatID
where latestCopdExacThisFinancialYearDate > DATEADD(MONTH, -2, @refdate)
union

--EXACERBATION (CODED OR UNCODED) > 2/12 AGO - AND STILL NO REHAB
select a.PatID,
	'copd.exacerbation.rehab' as indicatorId,
	'Offer pul rehab (gt 2/12)' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Offer pulmonary rehab (using code 9NSL. [#9NSL.])' as actionText,
	'Suggested action'+
		'<ul>'+
		'<li>Offer pulmonary rehab using code 9NSL. [#9NSL.].</li>'+
			'<ul>'+
			'<li>Patients can self-refer via <a href="http://www.salfordcommunityleisure.co.uk/lifestyles/active-lifestyles/cardiac-pulmonary-cancer-rehab-classes" target="_blank" title="Salford Community Lifestyles: Pulmonary Rehabilitation Classes">Salford Community Lifestyles</a> or <a href="https://www.way2wellbeing.org.uk/health/long-term-conditions/copd/getting-support/" target="_blank" title="way2wellbeing: COPD information">Breathing Better</a>.</li>'+
			'<li>Provide a <a href="https://www.blf.org.uk/support-for-you/exercise/pulmonary-rehabilitation" title="British Lung Foundation" target="_blank">Patient Information Leaflet on Pulmonary Rehabilitation</a>.</li>'+
			'</ul>'+
		'</li>'+
		'<li>If patient is unsuitable, use code 9kf0. [#9kf0.]</li>'+
		'<li>If patient declines, use code 8IA9. [#8IA9.]</li>'+
		'</ul>'+
	'Reasoning'+
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' +
			case 
				when latestCopdExacThisFinancialYearType = 'tabs' then '(This may not be coded in the record, and may only appear as a prescription of antibiotics and/or steroids'
				else ''
			end + 
		'</li>'+
		'<li>Last recorded breathlessness level was <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!diagnosisadditional:2" target="_blank" title="NICE Clinical Knowledge Summary: COPD">MRC stage 2</a> on ' + CONVERT(VARCHAR, latestMrc2CodeDate, 3) + '. </li>'+
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend these patients are offered pulmonary rehabilitation < 2 months afterwards because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'<li>They have <strong>still</strong> not yet been offered pulmonary rehabilitation since this exacerbation.</li>'+
		'</ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, firstPulRehabCodeAfterExacDate, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearType, latestCopdExacThisFinancialYearDate, firstCopdCodeDate, latestMrc2CodeDate from #eligiblePopulationAllData) as b on b.PatID = a.PatID
where latestCopdExacThisFinancialYearDate <= DATEADD(MONTH, -2, @refdate)
and firstPulRehabCodeAfterExacDate is null
union

--UNCODED EXACERBATION
select a.PatID,
	'copd.exacerbation.rehab' as indicatorId,
	'Uncoded exac' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Record ''COPD exacerbation'' (using code H3122 [H3122]) on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' as actionText,
	'Reasoning'+
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.</li>' +
		'<li>This appears to <strong>not be coded</strong> in their record.</strong>'+
		'<li>Coding exacerbations properly can help identify patients who need follow-up actions, like pulmonary rehab, which can <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'</ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, firstPulRehabCodeAfterExacDate, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearType, latestCopdExacThisFinancialYearDate, firstCopdCodeDate, latestMrc2CodeDate from #eligiblePopulationAllData) as b on b.PatID = a.PatID
where latestCopdExacThisFinancialYearType = 'tabs'
union

--UNCODED REHAB NEAR EXAC (CODED OR UNCODED)
	--AT ANY TIME IN THE FINANCIAL YEAR
	--AND NOT IN NUM 
	--6/52 BEFORE AN EXAC
	--2/12 AFTER AN EXAC
select a.PatID,
	'copd.exacerbation.rehab' as indicatorId,
	'Code pul rehab' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Record ''Pulmonary rehabilitation offered'' (using code 9NSL. [#9NSL.])' as actionText,
	'Suggested action'+
		'<ul>'+
		'<li>Record ''Pulmonary rehabilitation offered'' using code 9NSL. [#9NSL.] on date ' +
			case
				when 
					firstUncodedPulRehabCodeAfterExacDate <= DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
					and latestUncodedPulRehabCodeBeforeExacDate < DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate)
				then CONVERT(VARCHAR, firstUncodedPulRehabCodeAfterExacDate, 3) --less than or equal to 2/12 beyond latest exac code
				when 
					latestUncodedPulRehabCodeBeforeExacDate >= DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate) 
					and firstUncodedPulRehabCodeAfterExacDate > DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
				then CONVERT(VARCHAR, latestUncodedPulRehabCodeBeforeExacDate, 3) --greater than or equal to 6/52 before latest exac code - becuase that's the minimum pul rehab lasts
				else CONVERT(VARCHAR, firstUncodedPulRehabCodeAfterExacDate, 3) --both true
			end +
		'.</li>'+
		'</ul>'+
	'Reasoning'+
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' +
			case 
				when latestCopdExacThisFinancialYearType = 'tabs' then '(This may not be coded in the record, and may only appear as a prescription of antibiotics and/or steroids'
				else ''
			end + 
		'</li>'+
		'<li>Last recorded breathlessness level was <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!diagnosisadditional:2" target="_blank" title="NICE Clinical Knowledge Summary: COPD">MRC stage 2</a> on ' + CONVERT(VARCHAR, latestMrc2CodeDate, 3) + '. </li>'+
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend these patients are offered pulmonary rehabilitation < 2 months afterwards because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'<li>Patient had code <strong>' +
			case
				when 
					firstUncodedPulRehabCodeAfterExacDate <= DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
					and latestUncodedPulRehabCodeBeforeExacDate < DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate)
				then firstUncodedPulRehabCodeAfterExac --less than or equal to 2/12 beyond latest exac code
				when 
					latestUncodedPulRehabCodeBeforeExacDate >= DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate) 
					and firstUncodedPulRehabCodeAfterExacDate > DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
				then latestUncodedPulRehabCodeBeforeExac --greater than or equal to 6/52 before latest exac code - becuase that's the minimum pul rehab lasts
				else firstUncodedPulRehabCodeAfterExac --both true
			end +
		'</strong> on <strong>' + 
			case
				when 
					firstUncodedPulRehabCodeAfterExacDate <= DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
					and latestUncodedPulRehabCodeBeforeExacDate < DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate)
				then CONVERT(VARCHAR, firstUncodedPulRehabCodeAfterExacDate, 3) --less than or equal to 2/12 beyond latest exac code
				when 
					latestUncodedPulRehabCodeBeforeExacDate >= DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate) 
					and firstUncodedPulRehabCodeAfterExacDate > DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
				then CONVERT(VARCHAR, latestUncodedPulRehabCodeBeforeExacDate, 3) --greater than or equal to 6/52 before latest exac code - becuase that's the minimum pul rehab lasts
				else CONVERT(VARCHAR, firstUncodedPulRehabCodeAfterExacDate, 3) --both true
			end +
		'</strong>, which suggests they had Pulmonary Rehabilitation' +
			case
				when 
					firstUncodedPulRehabCodeAfterExacDate <= DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
					and latestUncodedPulRehabCodeBeforeExacDate < DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate)
				then 'less than 6 weeks before their latest COPD exacerbation - <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE recommends pulmonary rehab programmes should last at least 6 weeks</a>, so it is likely this patient received rehab whilst they had their exacerbation'
				when 
					latestUncodedPulRehabCodeBeforeExacDate >= DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate) 
					and firstUncodedPulRehabCodeAfterExacDate < DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate) 
				then '< 2 months after their latest COPD exacerbation'
				else 'either during or < 2 months after their latest COPD exacerbation'
			end +
		'</li>'+
		'<li>This only counts towards your <a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards score</a> if you use code 9NSL. [#9NSL.] (''Pulmonary rehabilitation offered'') to record they received pulmonary rehabilitation.</li>'+
		'</ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearDate, latestCopdExacThisFinancialYearType, firstCopdCodeDate, latestMrc2CodeDate from #eligiblePopulationAllData) as b on b.PatID = a.PatID
where
	(firstUncodedPulRehabCodeAfterExacDate <= DATEADD(MONTH, 2, latestCopdExacThisFinancialYearDate))
	or (latestUncodedPulRehabCodeBeforeExacDate > DATEADD(WEEK, -6, latestCopdExacThisFinancialYearDate))
union

--SUGGEST EXCLUDE
select a.PatID,
	'copd.exacerbation.rehab' as indicatorId,
	'Suggest exclude' as actionCat,
	(case when (latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)
	then 1 else 0 end) +
	(case when latestFrailCode is not null
	then 1 else 0 end) +
	(case when (latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate)
	then 1 else 0 end) +
	(case when latestMiNowCodeDate > DATEADD(MONTH, -6, @achievedate) or latestUnstableAnginaCodeDate > DATEADD(year, -1, @refdate)
	then 1 else 0 end)+
	(case when latestAnyExceptionCodeDate > DATEADD(year, -1, @achievedate)
	then 1 else 0 end) +
	(case when (latestCopd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCopdInviteCodesThisFinancialYear > 2
	then 1 else 0 end) +
	(case when latestCopdAsthmaDrugCodeDate < DATEADD(year, -1, @refdate)
	then 1 else 0 end) +
	(case when latestCopdExcludedCodeDate > latestCopdCodeDate
	then 1 else 0 end)
	as reasonNumber,
	@ptPercPoints as pointsPerAction,
	3 as priority,
	'Add code(s): ' +
	(case
		when
			((latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate))
			or
			(latestFrailCode is not null)
			or
			((latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate))
			or
			(latestMiNowCodeDate > DATEADD(MONTH, -6, @achievedate) or latestUnstableAnginaCodeDate > DATEADD(year, -1, @refdate))
			or
			(latestAnyExceptionCodeDate > DATEADD(year, -1, @achievedate))
		then '9kf0. ''Patient unsuitable for pulmonary rehabilitation'' [#9kf0.]'
		else ''
	end) +
	(case
		when (latestCopd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCopdInviteCodesThisFinancialYear > 2
		then '8IA9.	''Pulmonary rehabilitation declined'' [8IA9.]'
		else ''
	end) +
	(case
		when 
			(latestCopdAsthmaDrugCodeDate < DATEADD(year, -1, @refdate))
			or
			(latestCopdExcludedCodeDate > latestCopdCodeDate)
		then '2126F ''COPD resolved'' [#2126F]'
		else ''
	end)
	as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has COPD (since ' + CONVERT(VARCHAR, firstCopdCodeDate, 3) + ').</li>'+
		'<li>Latest COPD exacerbation was on ' + CONVERT(VARCHAR, latestCopdExacThisFinancialYearDate, 3) + '.' +
			case 
				when latestCopdExacThisFinancialYearType = 'tabs' then '(This may not be coded in the record, and may only appear as a prescription of antibiotics and/or steroids'
				else ''
			end + 
		'</li>'+
		'<li>Last recorded breathlessness level was <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!diagnosisadditional:2" target="_blank" title="NICE Clinical Knowledge Summary: COPD">MRC stage 2</a> on ' + CONVERT(VARCHAR, latestMrc2CodeDate, 3) + '. </li>'+
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend these patients are offered pulmonary rehabilitation < 2 months afterwards because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		(case
			when
				((latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate))
				or
				(latestFrailCode is not null)
				or
				((latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate))
				or
				(latestMiNowCodeDate > DATEADD(MONTH, -6, @achievedate) or latestUnstableAnginaCodeDate > DATEADD(year, -1, @refdate))
				or
				(latestAnyExceptionCodeDate > DATEADD(year, -1, @achievedate))
			then
				'<li>Patient has' +
					case when (latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)
					then 'code <strong>' + latestPalCode + '</strong> on ' + CONVERT(VARCHAR, latestPalCodeDate, 3) COLLATE Latin1_General_CI_AS + '; ' else '' end +
					case when latestFrailCode is not null
					then '<li>code <strong>' + latestFrailCode + '</strong> on ' + CONVERT(VARCHAR, latestFrailCodeDate, 3) + '; ' else '' end +
					case when (latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate)
					then '<li>code <strong>' + latestHouseBedboundCode + '</strong> on ' + CONVERT(VARCHAR, latestHouseBedboundCodeDate, 3) COLLATE Latin1_General_CI_AS + ';' else '' end +
					case when latestMiNowCodeDate > DATEADD(MONTH, -6, @achievedate)
					then '<li>code <strong>' + latestMiNowCode + '</strong> on ' + CONVERT(VARCHAR, latestMiNowCodeDate, 3) COLLATE Latin1_General_CI_AS + '; ' else '' end +
					case when latestUnstableAnginaCodeDate > DATEADD(year, -1, @refdate)
					then '<li>code <strong>' + latestUnstableAnginaCode + '</strong> on ' + CONVERT(VARCHAR, latestUnstableAnginaCodeDate, 3) COLLATE Latin1_General_CI_AS + '; ' else '' end +
			' so is likely <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">unsuitable for pulmonary rehab according to NICE</a>.</li>'
			else ''
		end) +
		(case when latestAnyExceptionCodeDate > DATEADD(year, -1, @achievedate)
		then '<li>Patient had code <strong>''' + latestAnyExceptionCode + '''</strong> on ' + CONVERT(VARCHAR, latestAnyExceptionCodeDate, 3) + ', so is also likely to be excepted from pulmonary rehab indicators too.</li>' else '' end) +
		(case when (latestCopd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCopdInviteCodesThisFinancialYear > 2
		then '<li>Patient has had 3 COPD invites since last April, so would likely also refuse pulmonary rehab.</li>' else '' end) +
		(case when latestCopdAsthmaDrugCodeDate < DATEADD(year, -1, @refdate)
		then '<li>Patient has had no COPD medications issued for over a year, so may not acutally have COPD.</li>' else '' end) +
		(case when latestCopdExcludedCodeDate > latestCopdCodeDate
		then '<li>Patient has code <strong>''' + latestCopdExcludedCode + '''</strong> on ' + CONVERT(VARCHAR, latestCopdExcludedCodeDate, 3) + ', so may not acutally have COPD.</li>' else '' end) +
	'</ul>Useful information' +
		'<ul><li>' + (select text from regularText where [textId] = 'ExceptionReportingReasons') + '</li></ul>'
	as supportingText
from #impOppsData as a
	left outer join (select PatID, latestCopdCodeDate, latestCopdExacThisFinancialYear, latestCopdExacThisFinancialYearType, latestMrc2CodeDate, firstCopdCodeDate, latestCopdExacThisFinancialYearDate from #eligiblePopulationAllData) as c on c.PatID = a.PatID
where
	((latestPalCodeDate > DATEADD(year, -1, @refdate)) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate))
	or latestFrailCode is not null
	or ((latestHouseBedboundCodeDate is not null) and (latestHouseBedboundPermExCodeDate is null or latestHouseBedboundPermExCodeDate < latestHouseBedboundCodeDate))
	or (latestMiNowCodeDate > DATEADD(MONTH, -6, @achievedate) or latestUnstableAnginaCodeDate > DATEADD(year, -1, @refdate))
	or (latestAnyExceptionCodeDate > DATEADD(year, -1, @achievedate))
	or ((latestCopd3rdInviteCodeDate > DATEADD(year, -1, @achievedate)) or numberOfCopdInviteCodesThisFinancialYear > 2)
	or (latestCopdAsthmaDrugCodeDate < DATEADD(year, -1, @refdate))
	or latestCopdExcludedCodeDate > latestCopdCodeDate


							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions


--EXACERBATION (CODED OR UNCODED) > 2/12 AGO (WHETHER OR NOT THEY RECEIVED REHAB AFTER 2/12)
select c.pracID, 'missedRehab', 
	SUM(case when denominator = 1 and numerator = 0 and latestCopdExacThisFinancialYearDate <= DATEADD(MONTH, -2, @refdate) then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when denominator = 1 and numerator = 0 and latestCopdExacThisFinancialYearDate <= DATEADD(MONTH, -2, @refdate) then 1.0 else 0.0 end),	
	SUM(case when denominator = 1 and numerator = 0 and latestCopdExacThisFinancialYearDate <= DATEADD(MONTH, -2, @refdate)  then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--UNCODED EXACERBATIONS - *ALL* COPD PATIENTS
select c.pracID, 'uncodedExacerbations', 
	SUM(case when latestCopdCode is not null and latestCopdExacThisFinancialYearType = 'tabs' then 1.0 else 0.0 end)
	/
	SUM(case when latestCopdCode is not null and latestCopdExacThisFinancialYear is not null then 1.0 else 0.0 end),
	SUM(case when latestCopdCode is not null and latestCopdExacThisFinancialYearType = 'tabs' then 1.0 else 0.0 end),
	SUM(case when latestCopdCode is not null and latestCopdExacThisFinancialYearType = 'tabs' then 1.0 else 0.0 end)*@ptPercPoints
from #eligiblePopulationAllData as a
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--INDICATOR SCORE
select c.pracID, 'indicatorScore', 
	SUM(case when denominator = 1 and numerator = 0 then 1.0 else 0.0 end)
	/
	SUM(case when denominator = 1 then 1.0 else 0.0 end),
	SUM(case when denominator = 1 and numerator = 0 then 1.0 else 0.0 end),	
	SUM(case when denominator = 1 and numerator = 0 then 1.0 else 0.0 end)*@ptPercPoints
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

--EDUCATION SESSION - PUL REHAB SPEED
select
	pracID as pracID,
	'copd.exacerbation.rehab' as indicatorId,
	'educationSession' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Provide education to staff on importance of quick referral to pulmonary rehab following a COPD exacerbation' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of eligible patients did not meet the <a href="#indicators/copd/exacerbation/rehab">COPD exacerbation pulmonary rehab referral standard</a> because they were not referred to pulmonary rehab within 2 months of an exacerbation.</li>' +
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend COPD patients with MRC 2 stage breathlessness are offered pulmonary rehabilitation < 2 months after an exacerbation because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'
from #reasonProportions
where proportionId = 'missedRehab' 


union
--SET UP AUTOMATIC REFERRAL SYSTEM TO PULMONAR REHAB
select
	pracID as pracID,
	'copd.exacerbation.rehab' as indicatorId,
	'automaticReferralSystem' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Set up a system to automatically refer COPD patients with MRC2 stage breathlessness to pulmonary rehab after an exacerbation' as actionText,
	'Suggested actions' +
		'<ul>'+
		'<li>Ensure all clinicians are aware to refer relevant  patients for pulmonary rehab when they diagnose an exacerbation.</li>' +
		'<li>Consult PINGR at least monthly to see which patients have recently had an exacerbation <a href="#indicators/copd/exacerbation/rehab">here</a>.</li>' +
		'<li>Inform patients on how to self-refer to pulmonary rehab self-refer via <a href="http://www.salfordcommunityleisure.co.uk/lifestyles/active-lifestyles/cardiac-pulmonary-cancer-rehab-classes" target="_blank" title="Salford Community Lifestyles: Pulmonary Rehabilitation Classes">Salford Community Lifestyles</a> or <a href="https://www.way2wellbeing.org.uk/health/long-term-conditions/copd/getting-support/" target="_blank" title="way2wellbeing: COPD information">Breathing Better</a>.</li>' +
		'<li>Code this in their record using 9NSL. [#9NSL.].</li>'+
		'</ul>'+
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of eligible patients not meet the <a href="#indicators/copd/exacerbation/rehab">COPD exacerbation pulmonary rehab referral standard</a> because they were not referred to pulmonary rehab within 2 months of an exacerbation.</li>' +
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend COPD patients with MRC 2 stage breathlessness are offered pulmonary rehabilitation < 2 months after an exacerbation because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'missedRehab' 

union
--SELF-REFER
select
	pracID as pracID,
	'copd.exacerbation.rehab' as indicatorId,
	'selfRefer' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Advise COPD patients with MRC stage 2 breathlessness to self-refer to pulmonary rehab once they have an exacerbation' as actionText,
	'Suggested actions' +
		'<ul>'+
		'<li>Inform patients on how to self-refer to pulmonary rehab self-refer via <a href="http://www.salfordcommunityleisure.co.uk/lifestyles/active-lifestyles/cardiac-pulmonary-cancer-rehab-classes" target="_blank" title="Salford Community Lifestyles: Pulmonary Rehabilitation Classes">Salford Community Lifestyles</a> or <a href="https://www.way2wellbeing.org.uk/health/long-term-conditions/copd/getting-support/" target="_blank" title="way2wellbeing: COPD information">Breathing Better</a>.</li>' +
		'<li>Provide a <a href="https://www.blf.org.uk/support-for-you/exercise/pulmonary-rehabilitation" title="British Lung Foundation" target="_blank">Patient Information Leaflet on Pulmonary Rehabilitation</a>.</li>'+
		'<li>When this happens, code it in their record using 9NSL. [#9NSL.].</li>'+
		'</ul>'+
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of eligible patients have not yet met the <a href="#indicators/copd/exacerbation/rehab">COPD exacerbation pulmonary rehab referral standard</a> because they have not yet been referred to pulmonary rehab within 2 months of an exacerbation.</li>' +
		'<li><a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend COPD patients with MRC 2 stage breathlessness are offered pulmonary rehabilitation < 2 months after an exacerbation because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'indicatorScore' 

union
--CODE EXACERBATIONS
select
	pracID as pracID,
	'copd.exacerbation.rehab' as indicatorId,
	'codeExacerbations' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Advise to code COPD exacerbations using code H3122 ''Acute exacerbation of COPD'' [H3122]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of COPD patients who were treated for COPD exacerbations did not have this coded properly in their record.</li>' +
		'<li>Coding exacerbations properly can help identify patients who need follow-up actions, like pulmonary rehab, which can <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'uncodedExacerbations' 


							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--OVERVIEW TAB
('copd.exacerbation.rehab','name','COPD MRC Stage 2 Pulmonary Rehab Following Exacerbation'), --overview table name
('copd.exacerbation.rehab','tabText','COPD Pul Rehab'), --indicator tab text
('copd.exacerbation.rehab','description', --'show more' on overview tab
	'<strong>Definition:</strong>Patients with COPD identified as MRC 2 in last 5 years with an exacerbation (coded or <strong>or uncoded</strong>) recorded after '+ 
		case
			when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
			when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
		end +
	' who have been offered or declined Pulmonary Rehabilitation within 2 months of exacerbation.<br>'+
	'<strong>Why this is important:<a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards</a> and <a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE guidelines</a> recommend COPD patients with MRC 2 stage breathlessness are offered pulmonary rehabilitation < 2 months after an exacerbation because <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">evidence suggests it may decrease hospital admission and mortality risk, and increase exercise capacity and quality of life</a>.<br>'),
--INDICATOR TAB
	--summary text
('copd.exacerbation.rehab','tagline',' of patients with COPD and MRC 2 breathlesssness in last 5 years with an exacerbation (coded or <strong>or uncoded</strong>) after '+ 
	case
		when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
		when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
	end +
	' have been offered or declined Pulmonary Rehabilitation within 2 months of exacerbation.'),
('copd.exacerbation.rehab','positiveMessage', --tailored text
	case 
		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Salford Standard target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Salford Standard target! To improve even further, look through the recommended actions on this page and for the patients below.'
		else 'You''ve not yet achieved the Salford Standard target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
	end),
	--pt lists
('copd.exacerbation.rehab','valueId','FEV1'),
('copd.exacerbation.rehab','valueName','Latest FEV1'),
('copd.exacerbation.rehab','dateORvalue','value'),
('copd.exacerbation.rehab','valueSortDirection','desc'),  -- 'asc' or 'desc'
('copd.exacerbation.rehab','tableTitle','All patients with improvement opportunities'),

	--imp opp charts (based on actionCat)
--EXACERBATION (CODED OR UNCODED) < 2/12 AGO
('copd.exacerbation.rehab','opportunities.Offer pul rehab (lt 2/12).name','COPD exacerbation &lt; 2 ago - no pulmonary rehab'),
('copd.exacerbation.rehab','opportunities.Offer pul rehab (lt 2/12).description','COPD patients with MRC Stage 2 breathlessness who have had a COPD exacerbation in the last 2 months (coded or <strong>or uncoded</strong>) and have not been referred for pulmonary rehab'),
('copd.exacerbation.rehab','opportunities.Offer pul rehab (lt 2/12).positionInBarChart','1'),

--EXACERBATION (CODED OR UNCODED) > 2/12 AGO - AND STILL NO REHAB
('copd.exacerbation.rehab','opportunities.Offer pul rehab (gt 2/12).name','COPD exacerbation &gt; 2 ago - no pulmonary rehab'),
('copd.exacerbation.rehab','opportunities.Offer pul rehab (gt 2/12).description','COPD patients with MRC Stage 2 breathlessness who had an exacerbation (coded or <strong>or uncoded</strong>) after '+
		case
			when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
			when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
		end +
	' but more than 2 months ago and have not been offered pulmonary rehab'),
('copd.exacerbation.rehab','opportunities.Offer pul rehab (gt 2/12).positionInBarChart','2'),

--UNCODED EXACERBATION
('copd.exacerbation.rehab','opportunities.Uncoded exac.name','Uncoded COPD exacerbation'),
('copd.exacerbation.rehab','opportunities.Uncoded exac.description','COPD patients with MRC Stage 2 breathlessness who had an <strong>uncoded</strong> exacerbation after '+
		case
			when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
			when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
		end +
	' - this should be coded to improve record keeping'),
('copd.exacerbation.rehab','opportunities.Uncoded exac.positionInBarChart','3'),

--UNCODED REHAB NEAR EXAC (CODED OR UNCODED)
('copd.exacerbation.rehab','opportunities.Code pul rehab.name','Code pulmonary rehabilitation'),
('copd.exacerbation.rehab','opportunities.Code pul rehab.description','COPD patients with MRC Stage 2 breathlessness that had uncoded pulmonary rehabilitation around the time of an exacerbation (coded or <strong>or uncoded</strong>) after '+
		case
			when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
			when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
		end +
	' - this should be coded to improve your Salford Standards score and record-keeping'),
('copd.exacerbation.rehab','opportunities.Code pul rehab.positionInBarChart','4'),

--SUGGEST EXCLUDE
('copd.exacerbation.rehab','opportunities.Suggest exclude.name','Suggest exclude'),
('copd.exacerbation.rehab','opportunities.Suggest exclude.description','COPD patients with MRC Stage 2 breathlessness that had an exacerbation (coded or <strong>or uncoded</strong>) since '+
		case
			when MONTH(@refdate) <4 then '1st April' + CONVERT(VARCHAR,YEAR(@refdate))
			when MONTH(@refdate) >3 then '1st April' + CONVERT(VARCHAR,(YEAR(@refdate) + 1))
		end +
	' but may be unsuitable for pulmonary rehab and should therefore be excluded from this quality indicator.'),
('copd.exacerbation.rehab','opportunities.Suggest exclude.positionInBarChart','5');