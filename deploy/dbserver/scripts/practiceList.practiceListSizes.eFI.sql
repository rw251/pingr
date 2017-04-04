
									----------------------------------------------
										------PRACTICE LIST SIZE AND eFI--------
												-------AS OF TODAY--------
									----------------------------------------------
--v1
--includes eFI

									--TO RUN AS STORED PROCEDURE--

--IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.cvd.stroke.outcome') DROP PROCEDURE [pingr.cvd.stroke.outcome];
--GO
--CREATE PROCEDURE [pingr.cvd.stroke.outcome] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
--AS
--SET NOCOUNT ON

									--TO TEST ON THE FLY--
use PatientSafety_Records_Test
declare @refdate VARCHAR(10);
set @refdate = '2016-11-17';

--all patients currently alive
--has to come from patients table not sir all records as some patients may have no data in sir
IF OBJECT_ID('tempdb..#allPats') IS NOT NULL DROP TABLE #allPats
CREATE TABLE #allPats (PatID int);
insert into #allPats 
select patid from patients
where dead = 0 

--latest any code
IF OBJECT_ID('tempdb..#latestAnyCode') IS NOT NULL DROP TABLE #latestAnyCode
CREATE TABLE #latestAnyCode (PatID int, latestAnyCodeDate date, latestAnyCode varchar(512));
insert into #latestAnyCode
select s.PatID, latestAnyCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAnyCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #allPats)
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAnyCodeDate = s.EntryDate
group by s.PatID, latestAnyCodeDate

--latest dead code
IF OBJECT_ID('tempdb..#latestDeadCode') IS NOT NULL DROP TABLE #latestDeadCode
CREATE TABLE #latestDeadCode (PatID int, latestDeadCodeDate date, latestDeadCode varchar(512));
insert into #latestDeadCode
select s.PatID, latestDeadCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeadCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #allPats)
		and ReadCode in (select code from codeGroups where [group] = 'dead')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeadCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'dead')
group by s.PatID, latestDeadCodeDate

--latest dereg code
IF OBJECT_ID('tempdb..#latestDeregCode') IS NOT NULL DROP TABLE #latestDeregCode
CREATE TABLE #latestDeregCode (PatID int, latestDeregCodeDate date, latestDeregCode varchar(512));
insert into #latestDeregCode
select s.PatID, latestDeregCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestDeregCodeDate from SIR_ALL_Records
		where PatID in (select PatID from #allPats)
		and ReadCode in (select code from codeGroups where [group] = 'deRegistered')
		and EntryDate < @refdate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestDeregCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'deRegistered')
group by s.PatID, latestDeregCodeDate

--number of ANY codes AFTER a dereg code
IF OBJECT_ID('tempdb..#noCodesAfterDeregCode') IS NOT NULL DROP TABLE #noCodesAfterDeregCode
CREATE TABLE #noCodesAfterDeregCode (PatID int, noCodesAfterDeregCode int);
insert into #noCodesAfterDeregCode
select a.PatID, COUNT(*) from SIR_ALL_Records as a
left outer join (select * from #latestDeregCode) as b on a.PatID = b.PatID
where EntryDate >= latestDeregCodeDate
group by a.PatID

--practice list AS OF TODAY
IF OBJECT_ID('dbo.practiceList', 'U') IS NOT NULL DROP TABLE dbo.practiceList;
CREATE TABLE practiceList (PatID int, pracID varchar(1000), age int, gender varchar(1));
insert into practiceList
select a.PatID, gpcode, YEAR(@refdate) - year_of_birth, sex from #allPats as a
left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) as b on a.PatID = b.PatID
left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) as c on a.PatID = c.PatID
left outer join (select patid, gpcode, sex, year_of_birth from dbo.patients) as e on a.PatID = e.patid
left outer join (select * from #noCodesAfterDeregCode) as f on a.PatID = f.PatID
where 
	(latestDeadCode is null or latestDeadCodeDate not like '2010%') --pts with dead codes NOT in 2010 are still alive - it seems only pts who HAVE dead codes in 2010 are dead and have been incorrectly marked as NOT dead in patients table
	and (latestDeregCode is null or noCodesAfterDeregCode = 1) --either not deregistered, or dereg code is their last code - because could have a dereg code and registered with another practice in Salford
	
--practice list sizes AS OF TODAY
IF OBJECT_ID('dbo.practiceListSizes', 'U') IS NOT NULL DROP TABLE dbo.practiceListSizes
CREATE TABLE practiceListSizes (practiceId varchar(1000), practiceListSize int);
insert into practiceListSizes 
select pracID, COUNT(*) from practiceList as a
group by pracID

--eFI
--> 65 years old only?
--count up the deficit areas
--number of deficits / 36
--gives a score < 1
-->=0.24 = moderate
-->=0.12 = mild
-->=0.36 = severe
IF OBJECT_ID('dbo.eFI', 'U') IS NOT NULL DROP TABLE dbo.eFI;
CREATE TABLE eFI (PatID int, eFI float);
insert into eFI
select PatID, 
(max(case when [group] = 'efiActivity' then 1 else 0 end) +
max(case when [group] = 'efiAnaemia' then 1 else 0 end) +
max(case when [group] = 'efiArthritis' then 1 else 0 end) +
max(case when [group] = 'efiAf' then 1 else 0 end) +
max(case when [group] = 'efiCvd' then 1 else 0 end) +
max(case when [group] = 'efiCkd' then 1 else 0 end) +
max(case when [group] = 'efiDm' then 1 else 0 end) +
max(case when [group] = 'efiDizzy' then 1 else 0 end) +
max(case when [group] = 'efiDyspnoea' then 1 else 0 end) +
max(case when [group] = 'efiFalls' then 1 else 0 end) +
max(case when [group] = 'efiFoot' then 1 else 0 end) +
max(case when [group] = 'efiFracture' then 1 else 0 end) +
max(case when [group] = 'efiHearing' then 1 else 0 end) +
max(case when [group] = 'efiHf' then 1 else 0 end) +
max(case when [group] = 'efiHeartValve' then 1 else 0 end) +
max(case when [group] = 'efiHousebound' then 1 else 0 end) +
max(case when [group] = 'efiHtn' then 1 else 0 end) +
max(case when [group] = 'efiHypotension' then 1 else 0 end) +
max(case when [group] = 'efiIhd' then 1 else 0 end) +
max(case when [group] = 'efiMemo' then 1 else 0 end) +
max(case when [group] = 'efiMobility' then 1 else 0 end) +
max(case when [group] = 'efiOsteoporosis' then 1 else 0 end) +
max(case when [group] = 'efiParkinson' then 1 else 0 end) +
max(case when [group] = 'efiPeptic' then 1 else 0 end) +
max(case when [group] = 'efiPvd' then 1 else 0 end) +
max(case when [group] = 'efiRequire' then 1 else 0 end) +
max(case when [group] = 'efiResp' then 1 else 0 end) +
max(case when [group] = 'efiSkin' then 1 else 0 end) +
max(case when [group] = 'efiSleep' then 1 else 0 end) +
max(case when [group] = 'efiSocial' then 1 else 0 end) +
max(case when [group] = 'efiThyroid' then 1 else 0 end) +
max(case when [group] = 'efiUrinary' then 1 else 0 end) +
max(case when [group] = 'efiUrinarySys' then 1 else 0 end) +
max(case when [group] = 'efiVisual' then 1 else 0 end) +
max(case when [group] = 'efiWeight' then 1 else 0 end) +
case when --polypharmacy
	(max(case when ReadCode like 'a%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'b%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'c%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'd%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'e%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'f%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'g%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'h%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'i%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'j%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'k%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'l%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'm%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'n%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'o%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'p%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'q%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'r%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 's%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'u%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end) +
	max(case when ReadCode like 'y%' and EntryDate > DATEADD(year, -1, @refdate) then 1 else 0 end)) >= 5 
then 1 else 0 end) / 36.0 as eFI
from SIR_ALL_Records as a
	inner join codeGroups c on c.code = ReadCode
	left outer join	(select patid, year_of_birth from dbo.patients) as d on a.PatID = d.patid
where 
(ReadCode in (select code from codeGroups where [group] in ('efiActivity', 'efiAnaemia', 'efiArthritis', 'efiAf', 'efiCvd', 'efiCkd', 'efiDm',
'efiDizzy', 'efiDyspnoea', 'efiFalls', 'efiFoot', 'efiFracture', 'efiHearing', 'efiHf', 'efiHeartValve', 'efiHousebound', 'efiHtn', 'efiHypotension',
'efiIhd', 'efiMemo', 'efiMobility', 'efiOsteoporosis', 'efiParkinson', 'efiPeptic', 'efiPvd', 'efiRequire', 'efiResp', 'efiSkin', 'efiSleep', 'efiSocial', 'efiThyroid',
'efiUrinary','efiUrinarySys', 'efiVisual', 'efiWeight'))
or (ReadCode like '[abcdefghijklmnopqrsuy]%' and EntryDate > DATEADD(year, -1, @refdate)))
and YEAR(@refdate) - year_of_birth > 65 --over 65 only
and patid in (select PatID from practiceList)
group by PatID