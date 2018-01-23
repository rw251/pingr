--v8 23/1/18
--Added expected counts of strokes per practice

--v7 17/1/18
--Added adjusted rates / standardised incidence

--v6 14/5/17
--changed strokeqof to strokeIsch

--v5 19/4/17
--removed 'beta'

--v4 changes 5/4/17
--changes to make it fit into tab

--v4 changes 31/3/17
--bug fixes with dates in 'why'
--added both first ever and episode incidence - but used only first ever for indicator score
--added possible stroke as an action

--v3 changes 28/3/17
--GP data ONLY
--MULTIPLE strokes now INCLUDED because using GP data - is more reliable
--imp opp cats - first stroke or prev stroke
--counted from 1st april onwards
--no relevant org actions --> removed

--v2 changes 26/3/17
--each patient can have ONLY ONE stroke
--strokes measured from SRFT and GP
--no practice list calculation


									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.cvd.stroke.outcome') DROP PROCEDURE [pingr.cvd.stroke.outcome];
GO
CREATE PROCEDURE [pingr.cvd.stroke.outcome] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

									--TO TEST ON THE FLY--
--use PatientSafety_Records_Test
--declare @refdate VARCHAR(10);
--declare @JustTheIndicatorNumbersPlease bit;
--set @refdate = '2017-03-31' --'2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;

									----------------------------------------------
											-------NO OF STROKES--------
										-------SINCE APRIL LAST YEAR--------
									----------------------------------------------

declare @startDate datetime;
set @startDate = (select case
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-04-01' --1st April THIS YEAR
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-04-01' end); --1st April LAST YEAR
	
--strokes EVER RECORDED IN GP RECORD
--multiple patients included
IF OBJECT_ID('tempdb..#strokePtsGp') IS NOT NULL DROP TABLE #strokePtsGp
CREATE TABLE #strokePtsGp (PatID int, gender varchar(2), age int, strokeCodeDate date, strokeCode varchar(512), strokeRead varchar(512), strokeSource varchar(512), pracID varchar(512));
insert into #strokePtsGp
select a.PatID, gender, age, EntryDate, MAX(Rubric), ReadCode, Source,  c.pracID from SIR_ALL_Records as a
inner join ptPractice as b on a.PatID = b.PatID
left outer join practiceList as c on a.PatID = c.PatID
where ReadCode in (select code from codeGroups where [group] in ('strokeIsch'))
and EntryDate <= @refdate
and Source != 'salfordt' --ONLY FROM GP RECORD
group by a.PatID, gender, age, EntryDate, Source, c.pracID, ReadCode

--no of strokes per patient BEFORE START DATE
IF OBJECT_ID('tempdb..#numberOfStrokesPerPatientBeforeStartDate') IS NOT NULL DROP TABLE #numberOfStrokesPerPatientBeforeStartDate
CREATE TABLE #numberOfStrokesPerPatientBeforeStartDate (PatID int, numberOfStrokesPerPatientBeforeStartDate int);
insert into #numberOfStrokesPerPatientBeforeStartDate
select distinct PatID, count (*) from #strokePtsGp
where strokeCodeDate < @startDate
group by PatID

--latest stroke BEFORE START DATE
IF OBJECT_ID('tempdb..#latestStrokeDateBeforeStartDate') IS NOT NULL DROP TABLE #latestStrokeDateBeforeStartDate
CREATE TABLE #latestStrokeDateBeforeStartDate (PatID int, latestStrokeDateBeforeStartDate date, latestStrokeCode varchar(512), latestStrokeRead varchar(512));
insert into #latestStrokeDateBeforeStartDate
select PatID, MAX(strokeCodeDate), strokeCode, strokeRead from #strokePtsGp
where strokeCodeDate < @startDate
group by PatID, strokeRead, strokeCode

--second latest stroke BEFORE START DATE
IF OBJECT_ID('tempdb..#secondLatestStrokeDateBeforeStartDate') IS NOT NULL DROP TABLE #secondLatestStrokeDateBeforeStartDate
CREATE TABLE #secondLatestStrokeDateBeforeStartDate (PatID int, secondLatestStrokeDateBeforeStartDate date);
insert into #secondLatestStrokeDateBeforeStartDate
select a.PatID, MAX(strokeCodeDate) from #strokePtsGp as a
left outer join	 (select * from #latestStrokeDateBeforeStartDate) as b on a.PatID = b.PatID 
where strokeCodeDate < latestStrokeDateBeforeStartDate
group by a.PatID

--third latest stroke BEFORE START DATE
IF OBJECT_ID('tempdb..#thirdLatestStrokeDateBeforeStartDate') IS NOT NULL DROP TABLE #thirdLatestStrokeDateBeforeStartDate
CREATE TABLE #thirdLatestStrokeDateBeforeStartDate (PatID int, thirdLatestStrokeDateBeforeStartDate date);
insert into #thirdLatestStrokeDateBeforeStartDate
select a.PatID, MAX(strokeCodeDate) from #strokePtsGp as a
left outer join	 (select * from #secondLatestStrokeDateBeforeStartDate) as b on a.PatID = b.PatID 
where strokeCodeDate < secondLatestStrokeDateBeforeStartDate
group by a.PatID

--no of strokes per patient SINCE START DATE
IF OBJECT_ID('tempdb..#numberOfStrokesPerPatientSinceStartDate') IS NOT NULL DROP TABLE #numberOfStrokesPerPatientSinceStartDate
CREATE TABLE #numberOfStrokesPerPatientSinceStartDate (PatID int, numberOfStrokesPerPatientSinceStartDate int);
insert into #numberOfStrokesPerPatientSinceStartDate
select distinct PatID, count (*) from #strokePtsGp
where strokeCodeDate >= @startDate
group by PatID

--latest stroke SINCE START DATE
IF OBJECT_ID('tempdb..#latestStrokeDateSinceStartDate') IS NOT NULL DROP TABLE #latestStrokeDateSinceStartDate
CREATE TABLE #latestStrokeDateSinceStartDate (PatID int, latestStrokeDateSinceStartDate date, latestStrokeCode varchar(512), latestStrokeRead varchar(512));
insert into #latestStrokeDateSinceStartDate
select PatID, MAX(strokeCodeDate), strokeCode, strokeRead from #strokePtsGp
where strokeCodeDate >= @startDate
group by PatID, strokeRead, strokeCode

--second latest stroke SINCE START DATE
IF OBJECT_ID('tempdb..#secondLatestStrokeDateSinceStartDate') IS NOT NULL DROP TABLE #secondLatestStrokeDateSinceStartDate
CREATE TABLE #secondLatestStrokeDateSinceStartDate (PatID int, secondLatestStrokeDateSinceStartDate date);
insert into #secondLatestStrokeDateSinceStartDate
select a.PatID, MAX(strokeCodeDate) from #strokePtsGp as a
left outer join	 (select * from #latestStrokeDateSinceStartDate) as b on a.PatID = b.PatID 
where strokeCodeDate < latestStrokeDateSinceStartDate
and strokeCodeDate >= @startDate
group by a.PatID

--third latest stroke SINCE START DATE
IF OBJECT_ID('tempdb..#thirdLatestStrokeDateSinceStartDate') IS NOT NULL DROP TABLE #thirdLatestStrokeDateSinceStartDate
CREATE TABLE #thirdLatestStrokeDateSinceStartDate (PatID int, thirdLatestStrokeDateSinceStartDate date);
insert into #thirdLatestStrokeDateSinceStartDate
select a.PatID, MAX(strokeCodeDate) from #strokePtsGp as a
left outer join	 (select * from #secondLatestStrokeDateSinceStartDate) as b on a.PatID = b.PatID 
where strokeCodeDate < secondLatestStrokeDateSinceStartDate
and strokeCodeDate >= @startDate
group by a.PatID

--all strokes EVER RECORDED IN HOSPITAL
--multiple patients included
IF OBJECT_ID('tempdb..#strokePtsHosp') IS NOT NULL DROP TABLE #strokePtsHosp
CREATE TABLE #strokePtsHosp (PatID int, strokeCodeDate date, strokeCode varchar(512), strokeRead varchar(512), strokeSource varchar(512), pracID varchar(512));
insert into #strokePtsHosp
select a.PatID, EntryDate, MAX(Rubric), ReadCode, Source,  pracID from SIR_ALL_Records as a
inner join ptPractice as b on a.PatID = b.PatID
where ReadCode in (select code from codeGroups where [group] in ('strokeQof'))
		and (Rubric like '%stroke%' --guard against rubric over-writes
			or Rubric like '%haemorrhage%'
			or  Rubric like '%occlusion%'
			or  Rubric like '%stenosis%'
			or  Rubric like '%infarction%'
			or  Rubric like '%CVA%'
			or  Rubric like '%lacunar%'
			or  Rubric like '%cerebral%'
			or  Rubric like '%Wallenberg%')
		and (Rubric not like '%unknown%' --guard against rubric over-writes
			and Rubric not like '%no %'
			and Rubric not like '%negative%'
			and Rubric not like '%ruled out%'
			and Rubric not like '%absent%'
			and Rubric not like '%possible%'
			and Rubric not like '%probable%'
			and Rubric not like '%previous%'
			and Rubric not like '%suspect%'
			and Rubric not like '%epilepsy%'
			and Rubric not like '%[0-9]%')--no dates
and EntryDate <= @refdate
and Source = 'salfordt' --ONLY FROM GP RECORD
group by a.PatID, EntryDate, Source, pracID, ReadCode

--latest HOSPITAL stroke SINCE START DATE
IF OBJECT_ID('tempdb..#latestHospitalStrokeDateSinceStartDate') IS NOT NULL DROP TABLE #latestHospitalStrokeDateSinceStartDate
CREATE TABLE #latestHospitalStrokeDateSinceStartDate (PatID int, latestHospitalStrokeDateSinceStartDate date, latestStrokeCode varchar(512), latestStrokeRead varchar(512));
insert into #latestHospitalStrokeDateSinceStartDate
select PatID, MAX(strokeCodeDate), strokeCode, strokeRead from #strokePtsHosp
where strokeCodeDate >= @startDate
group by PatID, strokeRead, strokeCode

									----------------------------------------------
										------STROKE INCIDENCE (RAW)--------
											------AS A PROPORTION--------
									----------------------------------------------
--no of strokes PER PRACTICE SINCE START DATE
--EPISODE INDICENCE I.E. MULTIPLE STROKES PER PATIENT
IF OBJECT_ID('tempdb..#numberOfStrokesPerPractice') IS NOT NULL DROP TABLE #numberOfStrokesPerPractice
CREATE TABLE #numberOfStrokesPerPractice (pracID varchar(1000), numberOfStrokesPerPractice int);
insert into #numberOfStrokesPerPractice
select pracID, COUNT(*) from #strokePtsGp as a
where strokeCodeDate >= @startDate
group by pracID

--stroke incidence FOR EVERY PRACTICE ORDERED ASCENDING
--EPISODE INDICENCE i.e. multiple strokes per patient
IF OBJECT_ID('tempdb..#episodeStrokeIncidence') IS NOT NULL DROP TABLE #episodeStrokeIncidence
CREATE TABLE #episodeStrokeIncidence (practiceId varchar(1000), numberOfStrokesPerPractice int, practiceListSize int, episodeStrokeIncidence float);
insert into #episodeStrokeIncidence
select practiceId, numberOfStrokesPerPractice, practiceListSize, 
	case
		when numberOfStrokesPerPractice is NULL then 0 --prevents null when no strokes
		else cast(numberOfStrokesPerPractice as float)/cast(practiceListSize as float) 
	end as episodeStrokeIncidence 
from practiceListSizes as a
left outer join (select * from #numberOfStrokesPerPractice) as b on b.pracID = a.practiceId  collate Latin1_General_100_CI_AS
order by episodeStrokeIncidence asc

--no of PATIENTS WHO HAVE HAD strokes PER PRACTICE SINCE START DATE
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#numberOfStrokePatientsPerPractice') IS NOT NULL DROP TABLE #numberOfStrokePatientsPerPractice
CREATE TABLE #numberOfStrokePatientsPerPractice (pracID varchar(1000), numberOfStrokePatientsPerPractice int);
insert into #numberOfStrokePatientsPerPractice
select pracID, COUNT(distinct(PatID)) from #strokePtsGp as a
where strokeCodeDate >= @startDate
group by pracID

--stroke incidence FOR EVERY PRACTICE ORDERED ASCENDING
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#firstEverStrokeIncidence') IS NOT NULL DROP TABLE #firstEverStrokeIncidence
CREATE TABLE #firstEverStrokeIncidence (practiceId varchar(1000), numberOfStrokePatientsPerPractice int, practiceListSize int, firstEverStrokeIncidence float);
insert into #firstEverStrokeIncidence
select practiceId, numberOfStrokePatientsPerPractice, practiceListSize, 
	case
		when numberOfStrokePatientsPerPractice is NULL then 0 --prevents null when no strokes in a practice
		else cast(numberOfStrokePatientsPerPractice as float)/cast(practiceListSize as float) 
	end as firstEverStrokeIncidence 
from practiceListSizes as a
left outer join (select * from #numberOfStrokePatientsPerPractice) as b on b.pracID = a.practiceId  collate Latin1_General_100_CI_AS
order by firstEverStrokeIncidence asc

					-----------------------------------------------------------------------------
					---------------------STANDARDISED INCIDENCE-----------------------------
					-----------------------------------------------------------------------------

--Get number of strokes for each age and gender category for each practice
--no of PATIENTS WHO HAVE HAD strokes PER PRACTICE SINCE START DATE
--FIRST EVER INDICENCE i.e. only one stroke per patient

IF OBJECT_ID('tempdb..#numberOfStrokePatientsPerPracticeByAgeGender') IS NOT NULL DROP TABLE #numberOfStrokePatientsPerPracticeByAgeGender
CREATE TABLE #numberOfStrokePatientsPerPracticeByAgeGender (ageRange varchar(8), gender varchar(8), type varchar(256), area varchar(256), count int);
insert into #numberOfStrokePatientsPerPracticeByAgeGender

select '0-10', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '0-10', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '0-10', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and strokeCodeDate >= @startDate
group by pracID
union

select '11-20', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '11-20', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '11-20', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and strokeCodeDate >= @startDate
group by pracID
union

select '21-30', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '21-30', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '21-30', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and strokeCodeDate >= @startDate
group by pracID
union

select '31-40', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '31-40', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '31-40', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and strokeCodeDate >= @startDate
group by pracID
union

select '41-50', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '41-50', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '41-50', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and strokeCodeDate >= @startDate
group by pracID
union

select '51-60', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '51-60', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '51-60', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and strokeCodeDate >= @startDate
group by pracID
union

select '61-70', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '61-70', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '61-70', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and strokeCodeDate >= @startDate
group by pracID
union

select '71-80', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '71-80', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '71-80', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and strokeCodeDate >= @startDate
group by pracID
union

select '81-90', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '81-90', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '81-90', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and strokeCodeDate >= @startDate
group by pracID
union

select '91-100', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '91-100', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '91-100', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and strokeCodeDate >= @startDate
group by pracID
union

select '>100', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '>100', gender, 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '>100', 'Both', 'numberOfStrokePatients', pracID, COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and strokeCodeDate >= @startDate
group by pracID

--Get stroke rates for each age and gender category for each practice
--stroke incidence FOR EVERY PRACTICE ORDERED ASCENDING
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#firstEverStrokeIncidenceByAgeGender') IS NOT NULL DROP TABLE #firstEverStrokeIncidenceByAgeGender
CREATE TABLE #firstEverStrokeIncidenceByAgeGender 
	(ageRange varchar(8), gender varchar(8), area varchar(256), firstEverStrokeIncidenceByAgeGender float);
insert into #firstEverStrokeIncidenceByAgeGender
select a.ageRange, a.gender, b.area, 
	case
		when c.count is NULL then 0 --prevents null when no strokes in a practice
		else cast(c.count as float)/cast(b.count as float) 
	end as firstEverStrokeIncidenceByAgeGender 
from ageGenderStructureSalford as a
left outer join ageGenderStructureEachPractice as b on b.ageRange = a.ageRange and b.gender = a.gender 
left outer join #numberOfStrokePatientsPerPracticeByAgeGender as c on c.ageRange = b.ageRange COLLATE Latin1_General_CI_AS and c.gender = b.gender COLLATE Latin1_General_CI_AS and c.area = b.area COLLATE Latin1_General_CI_AS

--STANDARDISED INCIDENCE
--Get total expected stroke PATIENTS per practice IF they had the same age and gender structure as the whole of salford
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#standardisedFirstEverStrokeIncidenceByAgeGender') IS NOT NULL DROP TABLE #standardisedFirstEverStrokeIncidenceByAgeGender
CREATE TABLE #standardisedFirstEverStrokeIncidenceByAgeGender
	(area varchar(256), standardisedFirstEverStrokeIncidenceByAgeGenderPer1000 float);
insert into #standardisedFirstEverStrokeIncidenceByAgeGender
select a.area, sum(firstEverStrokeIncidenceByAgeGender*count)/SUM(count)*1000 from #firstEverStrokeIncidenceByAgeGender as a
left outer join ageGenderStructureSalford as b on b.ageRange = a.ageRange COLLATE Latin1_General_CI_AS and b.gender = a.gender COLLATE Latin1_General_CI_AS 
where a.gender != 'Both'
group by a.area

					-----------------------------------------------------------------------------
					---------------------EXPECTED COUNTS-----------------------------
					-----------------------------------------------------------------------------

--Get number of strokes for each age and gender category for WHOLE OF SALFORD
--no of PATIENTS WHO HAVE HAD strokes SINCE START DATE
--FIRST EVER INDICENCE i.e. only one stroke per patient
	
IF OBJECT_ID('tempdb..#numberOfStrokePatientsSalfordWholeByAgeGender') IS NOT NULL DROP TABLE #numberOfStrokePatientsSalfordWholeByAgeGender
CREATE TABLE #numberOfStrokePatientsSalfordWholeByAgeGender (ageRange varchar(8), gender varchar(8), type varchar(256), count int);
insert into #numberOfStrokePatientsSalfordWholeByAgeGender

select '0-10', gender, 'numberOfStrokePatientsSalford',COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '0-10', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '0-10', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age <= 10 and strokeCodeDate >= @startDate
group by pracID
union

select '11-20', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '11-20', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '11-20', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >10 and age <= 20 and strokeCodeDate >= @startDate
group by pracID
union

select '21-30', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '21-30', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '21-30', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >20 and age <= 30 and strokeCodeDate >= @startDate
group by pracID
union

select '31-40', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '31-40', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '31-40', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >30 and age <= 40 and strokeCodeDate >= @startDate
group by pracID
union

select '41-50', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '41-50', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '41-50', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >40 and age <= 50 and strokeCodeDate >= @startDate
group by pracID
union

select '51-60', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '51-60', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '51-60', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >50 and age <= 60 and strokeCodeDate >= @startDate
group by pracID
union

select '61-70', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '61-70', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '61-70', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >60 and age <= 70 and strokeCodeDate >= @startDate
group by pracID
union

select '71-80', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '71-80', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '71-80', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >70 and age <= 80 and strokeCodeDate >= @startDate
group by pracID
union

select '81-90', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '81-90', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '81-90', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >80 and age <= 90 and strokeCodeDate >= @startDate
group by pracID
union

select '91-100', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '91-100', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '91-100', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >90 and age <= 100 and strokeCodeDate >= @startDate
group by pracID
union

select '>100', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and gender = 'M' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '>100', gender, 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and gender = 'F' and strokeCodeDate >= @startDate
group by gender, pracID
union
select '>100', 'Both', 'numberOfStrokePatientsSalford', COUNT(distinct(PatID)) from #strokePtsGp
where age >100 and strokeCodeDate >= @startDate
group by pracID


--Get stroke rates for each age and gender category for WHOLE OF SALFORD
--stroke incidence
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#firstEverStrokeIncidenceSalfordWholeByAgeGender') IS NOT NULL DROP TABLE #firstEverStrokeIncidenceSalfordWholeByAgeGender
CREATE TABLE #firstEverStrokeIncidenceSalfordWholeByAgeGender 
	(ageRange varchar(8), gender varchar(8), firstEverStrokeIncidenceSalfordWholeByAgeGender float);
insert into #firstEverStrokeIncidenceSalfordWholeByAgeGender
select a.ageRange, a.gender,
	case
		when c.count is NULL then 0 --prevents null when no strokes in a practice
		else cast(c.count as float)/cast(a.count as float) 
	end as firstEverStrokeIncidenceByAgeGender 
from ageGenderStructureSalford as a
left outer join #numberOfStrokePatientsSalfordWholeByAgeGender as c on c.ageRange = a.ageRange COLLATE Latin1_General_CI_AS and c.gender = a.gender COLLATE Latin1_General_CI_AS

--EXPECTED COUNTS
--Get total expected stroke PATIENTS per practice IF they had the same STROKE RATE across age and gender categories as the whole of salford
--FIRST EVER INDICENCE i.e. only one stroke per patient
IF OBJECT_ID('tempdb..#expectedFirstEverStrokeIncidenceByAgeGenderPerPractice') IS NOT NULL DROP TABLE #expectedFirstEverStrokeIncidenceByAgeGenderPerPractice
CREATE TABLE #expectedFirstEverStrokeIncidenceByAgeGenderPerPractice
	(area varchar(256), expectedFirstEverStrokeIncidenceByAgeGenderPerPractice float);
insert into #expectedFirstEverStrokeIncidenceByAgeGenderPerPractice
select area, sum(firstEverStrokeIncidenceSalfordWholeByAgeGender*count) from #firstEverStrokeIncidenceSalfordWholeByAgeGender as a
left outer join ageGenderStructureEachPractice as b on b.ageRange = a.ageRange COLLATE Latin1_General_CI_AS and b.gender = a.gender COLLATE Latin1_General_CI_AS 
where a.gender != 'Both'
group by area

					-----------------------------------------------------------------------------
					---------------------GET ABC (TOP 10% BENCHMARK)-----------------------------
					-----------------------------------------------------------------------------
					---------------------	FIRST EVER INCIDENCE -----------------------------
					-----------------------------------------------------------------------------


declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 firstEverStrokeIncidence as perc from #firstEverStrokeIncidence
order by perc desc) sub);

					-----------------------------------------------------------------------------
					--DECLARE NUMERATOR, INDICATOR AND TARGET FROM DENOMINATOR TABLE-------------
					-----------------------------------------------------------------------------
					---------------------	FIRST EVER INCIDENCE -----------------------------
					-----------------------------------------------------------------------------


									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicatorOutcome](indicatorId, practiceId, date, patientCount, eventCount, denominator, standardisedIncidence, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicatorOutcome') IS NOT NULL DROP TABLE #indicatorOutcome
--CREATE TABLE #indicatorOutcome (indicatorId varchar(1000), practiceId varchar(1000), date date, patientCount int, eventCount int, denominator int, standardisedIncidence float, benchmark float);
--insert into #indicatorOutcome

select 'cvd.stroke.outcome', a.practiceId, CONVERT(char(10), @refdate, 126), numberOfStrokePatientsPerPractice, numberOfStrokesPerPractice, a.practiceListSize, standardisedFirstEverStrokeIncidenceByAgeGender, @abc from #firstEverStrokeIncidence as a
left outer join (select * from #episodeStrokeIncidence) as b on b.practiceId = a.practiceId
left outer join #standardisedFirstEverStrokeIncidenceByAgeGender as c on c.area = a.practiceId

									----------------------------------------------
									-------POPULATE MAIN DENOMINATOR TABLE--------
									----------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why, nextReviewDate)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max), nextReviewDate date);
--insert into #denominators

select a.PatID, 'cvd.stroke.outcome',
	case 
		when numberOfStrokesPerPatientSinceStartDate = 0 or numberOfStrokesPerPatientSinceStartDate is null then 'Patient has not had a stroke recorded on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.<br>'
		when numberOfStrokesPerPatientSinceStartDate = 1 then 'Patient had a stroke recorded on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' on ' + CONVERT(VARCHAR, latestStrokeDateSinceStartDate, 3) + '.<br>'
		when numberOfStrokesPerPatientSinceStartDate = 2 then 'Patient had strokes recorded on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' on ' + CONVERT(VARCHAR, secondLatestStrokeDateSinceStartDate, 3) + ' and ' + CONVERT(VARCHAR, latestStrokeDateSinceStartDate , 3) + '.<br>'
		when numberOfStrokesPerPatientSinceStartDate = 3 then 'Patient had strokes recorded on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' on ' + CONVERT(VARCHAR, thirdLatestStrokeDateSinceStartDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDateSinceStartDate, 3) + ' and ' + CONVERT(VARCHAR, latestStrokeDateSinceStartDate, 3)+ '.<br>'
		when numberOfStrokesPerPatientSinceStartDate > 3 then 'Patient had more than 3 strokes recorded on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '. The latest was  ' + CONVERT(VARCHAR, latestStrokeDateSinceStartDate, 3) + '.<br>'
	end +
	case 
		when (numberOfStrokesPerPatientBeforeStartDate = 0 or numberOfStrokesPerPatientBeforeStartDate is null) then 'And they have not had a stroke before this date.'
		when numberOfStrokesPerPatientBeforeStartDate = 1 then 'And they had a stroke before this date on ' + CONVERT(VARCHAR, latestStrokeDateBeforeStartDate, 3) + '.<br>'
		when numberOfStrokesPerPatientBeforeStartDate = 2 then 'And they had strokes before this date on ' + CONVERT(VARCHAR, secondLatestStrokeDateBeforeStartDate, 3) + ' and ' + CONVERT(VARCHAR, latestStrokeDateBeforeStartDate, 3) + '.<br>'
		when numberOfStrokesPerPatientBeforeStartDate = 3 then 'And they had strokes documented before this date on ' + CONVERT(VARCHAR, thirdLatestStrokeDateBeforeStartDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDateBeforeStartDate, 3) + ' and ' + CONVERT(VARCHAR, latestStrokeDateBeforeStartDate, 3)+ '.<br>'
		when numberOfStrokesPerPatientBeforeStartDate > 3 then 'And they had more than 3 strokes recorded before this date. The latest was  ' + CONVERT(VARCHAR, latestStrokeDateBeforeStartDate, 3) + '.<br>'
	end,
		DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from practiceList as a
left outer join (select * from #numberOfStrokesPerPatientSinceStartDate) as b on a.PatID = b.PatID
left outer join (select * from #latestStrokeDateSinceStartDate) as c on a.PatID = c.PatID
left outer join (select * from #secondLatestStrokeDateSinceStartDate) as d on a.PatID = d.PatID
left outer join (select * from #thirdLatestStrokeDateSinceStartDate) as e on a.PatID = e.PatID
left outer join (select * from #latestStrokeDateBeforeStartDate) as f on a.PatID = f.PatID
left outer join (select * from #secondLatestStrokeDateBeforeStartDate) as g on a.PatID = g.PatID
left outer join (select * from #thirdLatestStrokeDateBeforeStartDate) as h on a.PatID = h.PatID
left outer join (select * from #numberOfStrokesPerPatientBeforeStartDate) as i on a.PatID = i.PatID
left outer join latestAnnualReviewCode l on l.PatID = a.PatID

									----------------------------------------------
									-------DEFINE % POINTS PER PATIENT------------
									----------------------------------------------

declare @ptPercPoints float;
set @ptPercPoints = (select 100 / COUNT (*) from practiceList);

								---------------------------------------------------------
								-- Exit if we're just getting the indicator numbers -----
								---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;

							---------------------------------------------------------------
							----------------------PT-LEVEL ACTIONS-------------------------
							---------------------------------------------------------------
							---------------------------------------------------------------
						---***HAS TO INCLUDE ALL PATIENTS WHO HAVE HAD THE OUTCOME***----------
							---------------------------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
--CREATE TABLE #patActions
--	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #patActions

--FIRST STROKE
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'firstStroke' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numberOfStrokesPerPatientSinceStartDate as a 
left outer join (select * from #numberOfStrokesPerPatientBeforeStartDate) as b on b.PatID = a.PatID
where numberOfStrokesPerPatientSinceStartDate = 1 and (numberOfStrokesPerPatientBeforeStartDate = 0 or numberOfStrokesPerPatientBeforeStartDate is null)

union
--PREVIOUS STROKE
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'previousStroke' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numberOfStrokesPerPatientSinceStartDate as a 
left outer join (select * from #numberOfStrokesPerPatientBeforeStartDate) as b on b.PatID = a.PatID
where numberOfStrokesPerPatientSinceStartDate > 0 and numberOfStrokesPerPatientBeforeStartDate > 0

union
--MULTIPLE STROKES SINCE START DATE
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'multipleStroke' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numberOfStrokesPerPatientSinceStartDate as a 
left outer join (select * from #numberOfStrokesPerPatientBeforeStartDate) as b on b.PatID = a.PatID
where numberOfStrokesPerPatientSinceStartDate > 1

union
--STROKE - UNCODED
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'possibleStroke' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	5 as priority,
	'Possible stroke in hospital on ' + CONVERT(VARCHAR, latestHospitalStrokeDateSinceStartDate, 3) + '.' as actionText,
	'Reasoning' +
		'<ul>'+
			'<li>Patient had ''' + latestStrokeCode + ''' recorded in hospital on ' + CONVERT(VARCHAR, latestHospitalStrokeDateSinceStartDate, 3) + '.</li>'+
			'<li>This does not seem to appear in the GP record.</li>'+
			'<li>If this truly was a stroke, you can record it using code ' + latestStrokeRead + '[' + latestStrokeRead + ']) on ' + CONVERT(VARCHAR, latestHospitalStrokeDateSinceStartDate, 3) + '.</li>'+
		'</ul>'
	as supportingText
from #latestHospitalStrokeDateSinceStartDate as a
inner join (select * from #numberOfStrokesPerPatientSinceStartDate) as b on b.PatID = a.PatID
where numberOfStrokesPerPatientSinceStartDate = 0 or numberOfStrokesPerPatientSinceStartDate is null

							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--STROKE - UNCODED
select pracID, 'strokeUncoded', 
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'possibleStroke' then 1.0 else 0.0 end) --no of uncoded strokes
	/SUM(case when indicatorId = 'cvd.stroke.outcome' then 1.0 else 0.0 end), --out of total no of strokes
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'possibleStroke' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'possibleStroke' then 1.0 else 0.0 end)*@ptPercPoints
from [output.pingr.patActions] as a
left outer join ptPractice as b on b.PatID = a.PatID
group by pracID
having SUM(case when indicatorId = 'cvd.stroke.outcome' then 1.0 else 0.0 end) > 0 --where denom is not 0
							---------------------------------------------------------------
							----------------------ORG-LEVEL ACTIONS------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
--CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #orgActions

--CODE STROKE
select
	pracID as pracID,
	'cvd.stroke.outcome' as indicatorId,
	'reviewPossibleStrokes' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Review patients with possible strokes' as actionText,
	'<ul><li>' + STR(numberPatients) + ' patients may have had a stroke in hospital since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' that is not in the GP record.</li>' +
	'<li>You may wish to review this list <a href="#indicators/cvd/stroke/outcome">here</a>.</li></ul>'
from #reasonProportions
where proportionId = 'possibleStroke' 
							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)
values
--overview tab
('cvd.stroke.outcome','name','Strokes since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end)), --overview table name
('cvd.stroke.outcome','tabText','Strokes since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end)), --indicator tab text
('cvd.stroke.outcome','description', --'show more' on overview tab
	'<strong>Definition:</strong> Number of patients who have had a stroke recorded since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' out of your practice list.<br>'+
	'<strong>NB:</strong> Your practice list may appear 1-2% smaller than it actually is due to opt outs from data sharing agreements'),
--indicator tab
--summary text
('cvd.stroke.outcome','tagline','of patients on your practice list had a stroke recorded since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),
('cvd.stroke.outcome','positiveMessage',null),
--pt list
('cvd.stroke.outcome','valueId','strokeHosp'),
('cvd.stroke.outcome','valueName','Latest stroke date'),
('cvd.stroke.outcome','dateORvalue','date'),
('cvd.stroke.outcome','valueSortDirection','desc'),  -- 'asc' or 'desc'
('cvd.stroke.outcome','tableTitle','Patients who have had a stroke recorded since 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),

--imp opp charts
--based on actionCat

--FIRST STROKE
('cvd.stroke.outcome','opportunities.firstStroke.name','Patients with their first ever stroke on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),
('cvd.stroke.outcome','opportunities.firstStroke.description','Patients who have had their first ever stroke on or after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),
('cvd.stroke.outcome','opportunities.firstStroke.positionInBarChart','1'),

--PREVIOUS STROKE
('cvd.stroke.outcome','opportunities.previousStroke.name','Patients with strokes both before <strong>and</strong> after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end)),
('cvd.stroke.outcome','opportunities.previousStroke.description','Patients who have had strokes both before <strong>and</strong> after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),
('cvd.stroke.outcome','opportunities.previousStroke.positionInBarChart','2'),

--MULTIPLE STROKES SINCE START DATE
('cvd.stroke.outcome','opportunities.multipleStroke.name','Patients with multiple strokes after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end)),
('cvd.stroke.outcome','opportunities.multipleStroke.description','Patients who may have had multiple strokes after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + '.'),
('cvd.stroke.outcome','opportunities.multipleStroke.positionInBarChart','3'),

--POSSIBLE STROKES
('cvd.stroke.outcome','opportunities.possibleStroke.name','Patients with <strong>possible</strong> strokes after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end)),
('cvd.stroke.outcome','opportunities.possibleStroke.description','Patients who <strong>may</strong> have had a stroke in hospital after 1st April ' + (case when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) end) + ' that is not in the GP record.'),
('cvd.stroke.outcome','opportunities.possibleStroke.positionInBarChart','4');