------------------------------------------------------------------------------------------
-- AKI-kidney-function
-- Population 01a and creatinine, eGFR & ACR checked within 3 months of AKI diagnosis
------------------------------------------------------------------------------------------

-- FIXME: temporary, to be replaced by standard boostrapping code

declare @refdate datetime;
set @refdate = GETDATE();


-- Report period

declare @monthdelta int; 
set @monthdelta = -50;

declare @startDate datetime;
set @startDate = DATEADD(month, @monthdelta, @refdate);


-- ELIGIBLE POPULATION

-- #latestAKICode [01a]

-- NOTE: this query can be simplified if we don't care about the ReadCode
-- in that case we only need the inner query

IF OBJECT_ID('tempdb..#latestAKICode') IS NOT NULL DROP TABLE #latestAKICode;
CREATE TABLE #latestAKICode (PatID int, latestAKICodeDate date, latestAKICode varchar(255));
insert into #latestAKICode
	select s.PatID, s.EntryDate, s.ReadCode from SIR_ALL_Records_Narrow as s
		inner join (
			select PatID, MAX(EntryDate) as latestAKICodeDate from SIR_ALL_Records_Narrow
			where ReadCode in ('K04C.', 'K04E.', 'K04..', 'K04D.')
			and EntryDate >= @startDate
			group by PatID) sub on sub.PatID = s.PatID and latestAKICodeDate = s.EntryDate
	where s.ReadCode in ('K04C.', 'K04E.', 'K04..', 'K04D.')
	group by s.PatID, s.EntryDate, s.ReadCode;


-- #creatinineWithin3Months [07a]

-- 01a with creatinine checked within 3 months

--  NOTES: > or >= for date test?
--    Often multiple codes on the same date, but rubric seems to be the same 

IF OBJECT_ID('tempdb..#creatinineWithin3Months') IS NOT NULL DROP TABLE #creatinineWithin3Months;
CREATE TABLE #creatinineWithin3Months (PatID int, latestCreatinineDate date, latestCreatinineCodeMin varchar(255), latestCreatinineCodeMax varchar(255), latestCreatinineCode varchar(255));
insert into #creatinineWithin3Months
select PatID, latestCreatinineDate, latestCreatinineCodeMin, latestCreatinineCodeMax, latestCreatinineCode from (
	select s.PatID, EntryDate as latestCreatinineDate, MIN(Rubric) as latestCreatinineCodeMin, MAX(Rubric) as latestCreatinineCodeMax, case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestCreatinineCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn 
 		from SIR_ALL_Records as s
		inner join #latestAKICode on #latestAKICode.PatID = s.PatID  
		and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where s.ReadCode = '44J3.'
		group by s.PatID, EntryDate
	) sub
	where rn = 1;


-- #eGFRWithin3Months [07d]

-- 01a with eGFR checked within 3 months

--  FIXME: > or >= for date test?
-- NOTE:
--   There seem to be large numbers of eGFR checks within the 3 month window following the latest AKI code
--   We're just selecting the most recent in each case here

IF OBJECT_ID('tempdb..#eGFRWithin3Months') IS NOT NULL DROP TABLE #eGFRWithin3Months;
CREATE TABLE #eGFRWithin3Months (PatID int, latesteGFRCheckDate date, ReadCode varchar(255), latesteGFRCodeMin varchar(255), latesteGFRCodeMax varchar(255), latesteGFRCode varchar(255));
insert into #eGFRWithin3Months
select PatID, eGFRDate, ReadCode, eGFRCodeMin, eGFRCodeMax, eGFRCode from (
	select s.PatID, s.EntryDate as eGFRDate, ReadCode, MIN(Rubric) as eGFRCodeMin, MAX(Rubric) as eGFRCodeMax, case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as eGFRCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn
		from SIR_ALL_Records as s
		inner join #latestAKICode on #latestAKICode.PatID = s.PatID  
		and s.EntryDate > #latestAKICode.latestAKICodeDate and s.EntryDate < dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where s.ReadCode in ('451F.', '451E.', 'G2410')
		group by s.PatID, EntryDate, ReadCode
	) sub
	where rn = 1;


-- #acrWithin3Months [07g]

-- 01a with ACR checked within 3 months

--  FIXME: > or >= for date test?

IF OBJECT_ID('tempdb..#acrWithin3Months') IS NOT NULL DROP TABLE #acrWithin3Months;
CREATE TABLE #acrWithin3Months (PatID int, latestACRDate date, latestACRCodeMin varchar(255), latestACRCodeMax varchar(255), latestACRCode varchar(255));
insert into #acrWithin3Months
select PatID, latestACRDate, latestACRCodeMin, latestACRCodeMax, latestACRCode from (
	select s.PatID, EntryDate as latestACRDate, MIN(Rubric) as latestACRCodeMin, MAX(Rubric) as latestACRCodeMax, case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as latestACRCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn 
 		from SIR_ALL_Records as s
		inner join #latestAKICode on #latestAKICode.PatID = s.PatID  
		and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where s.ReadCode = '46TC.'
		group by s.PatID, EntryDate
	) sub
	where rn = 1;



-- #exclusions 

-- FIXME: what exclusions do we need?


-- #denominator

-- FIXME: currently all patients from [01a] as we have no exclusions

IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int, denominator int);
insert into #denominator
	select PatID, 1
	from #latestAKICode;


-- #numerator

-- Patients appearing in #creatinineWithin3Months, #eGFRWithin3Months and #acrWithin3Months
-- currently no exclusions

IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID,
	case 
		when denominator = 1 
		and latestCreatinineDate is not null
		and latesteGFRCheckDate is not null
		and latestACRDate is not null
		then 1 
	else 0 
	end as numerator
from #latestAKICode as a
	left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID
	left outer join (select PatID, latestCreatinineDate from #creatinineWithin3Months) c on c.PatID = a.PatID
	left outer join (select PatID, latesteGFRCheckDate from #eGFRWithin3Months) d on d.PatID = a.PatID
	left outer join (select PatID, latestACRDate from #acrWithin3Months) e on e.PatID = a.PatID



-- #eligiblePopulationAllData

--all data from above combined into one table, plus denominator/numerator columns

IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int, 
	latestAKICodeDate date, 
	latestAKICode varchar(255),
	latestCreatinineDate date, 
	latesteGFRCheckDate date, 
	latestACRDate date, 
	denominator int, 
	numerator int);
insert into #eligiblePopulationAllData
	select a.PatID, 
		a.latestAKICodeDate, a.latestAKICode, 
		latestCreatinineDate,
		latesteGFRCheckDate,
		latestACRDate,
		denominator, 
		numerator
	from #latestAKICode as a
			left outer join (select PatID, latestCreatinineDate from #creatinineWithin3Months) b on b.PatID = a.PatID
			left outer join (select PatID, latesteGFRCheckDate from #eGFRWithin3Months) c on c.PatID = a.PatID
			left outer join (select PatID, latestACRDate from #acrWithin3Months) d on d.PatID = a.PatID
			left outer join (select PatID, denominator from #denominator) e on e.PatID = a.PatID
			left outer join (select PatID, numerator from #numerator) f on f.PatID = a.PatID;
		
		
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
set @indicatorScore = (select sum(case when numerator = 1 then 1 else 0 end)/sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0);
declare @target float;
-- FIXME: what value do we want here?
set @target = 0.75;
declare @numerator int;
set @numerator = (select sum(case when numerator = 1 then 1 else 0 end) from #eligiblePopulationAllData);
declare @denominator int;
set @denominator = (select sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData);


