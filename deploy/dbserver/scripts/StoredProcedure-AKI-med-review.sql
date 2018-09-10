------------------------------------------------------------------------------------------
-- AKI-medication-review
-- Population 01a and medication review within 1/2/3 months of AKI diagnosis
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



-- #medReview1MonthAfterAKICoded [09b]

-- NOTES:
-- DISABLED
-- ID of all patients that have had a medication review within 1 months of an AKI code, and the date of the most recent review
--   What if the patient had multiple reviews within the window?
--   Do we need the rubric related to the check?
--   FIXME: > or >= for date test?

-- IF OBJECT_ID('tempdb..#medReview1MonthAfterAKICoded') IS NOT NULL DROP TABLE #medReview1MonthAfterAKICoded;
-- CREATE TABLE #medReview1MonthAfterAKICoded (PatID int, medReviewDate date, medReviewCode varchar(255));
-- insert into #medReview1MonthAfterAKICoded
-- 	select PatID, medReviewDate, medReviewCode from (	
-- 		select s.PatID, s.EntryDate as medReviewDate, ReadCode as medReviewCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn
-- 	 	from SIR_ALL_Records_Narrow as s
-- 	 	inner join #latestAKICode on #latestAKICode.PatID = s.PatID 
-- 	 	and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 1, #latestAKICode.latestAKICodeDate)
-- 		where s.ReadCode in ('8B3S.', '8B3V.', '8B3x.', '8BMa.', '8BT..', '8BIC.', '8B3h.', '8B3y.', '8BMX.', '8BI..', '8B31B', '8B318', '8B314')
-- 	) sub
-- 	where rn = 1;


-- #medReview2MonthsAfterAKICoded [19b]

-- EXLUDE THOSE IN #medReview1MonthAfterAKICoded

-- NOTES:
-- DISABLED
-- ID of all patients that have had a medication review within 2 months of an AKI code, and the date of the most recent review
--   What if the patient had multiple reviews within the window?
--   Do we need the rubric related to the check?
--   FIXME: > or >= for date test?

-- IF OBJECT_ID('tempdb..#medReview2MonthsAfterAKICoded') IS NOT NULL DROP TABLE #medReview2MonthsAfterAKICoded;
-- CREATE TABLE #medReview2MonthsAfterAKICoded (PatID int, medReviewDate date, medReviewCode varchar(255));
-- insert into #medReview2MonthsAfterAKICoded
-- 	select PatID, medReviewDate, medReviewCode from (	
-- 		select s.PatID, s.EntryDate as medReviewDate, ReadCode as medReviewCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn
-- 	 	from SIR_ALL_Records_Narrow as s
-- 	 	inner join #latestAKICode on #latestAKICode.PatID = s.PatID 
-- 	 	and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 2, #latestAKICode.latestAKICodeDate)
-- 		where s.ReadCode in ('8B3S.', '8B3V.', '8B3x.', '8BMa.', '8BT..', '8BIC.', '8B3h.', '8B3y.', '8BMX.', '8BI..', '8B31B', '8B318', '8B314')
-- 	) sub
-- 	where rn = 1;


-- #medReview3MonthsAfterAKICoded [19b]

-- NOTES:
-- ID of all patients that have had a medication review within 3 months of an AKI code, and the date of the most recent review
--   What if the patient had multiple reviews within the window?
--   Do we need the rubric related to the check?
--   FIXME: > or >= for date test?

IF OBJECT_ID('tempdb..#medReview3MonthsAfterAKICoded') IS NOT NULL DROP TABLE #medReview3MonthsAfterAKICoded;
CREATE TABLE #medReview3MonthsAfterAKICoded (PatID int, medReviewDate date, medReviewCode varchar(255));
insert into #medReview3MonthsAfterAKICoded
	select PatID, medReviewDate, medReviewCode from (	
		select s.PatID, s.EntryDate as medReviewDate, ReadCode as medReviewCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn
	 	from SIR_ALL_Records_Narrow as s
	 	inner join #latestAKICode on #latestAKICode.PatID = s.PatID 
	 	and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where s.ReadCode in ('8B3S.', '8B3V.', '8B3x.', '8BMa.', '8BT..', '8BIC.', '8B3h.', '8B3y.', '8BMX.', '8BI..', '8B31B', '8B318', '8B314')
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

-- FIXME: currently all patients from #medReview3MonthsAfterAKICoded as we have no exclusions

IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
	select a.PatID, 1
	from #medReview3MonthsAfterAKICoded as a
		left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID;



-- #eligiblePopulationAllData

--all data from above combined into one table, plus denominator/numerator columns

IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int, 
	latestAKICodeDate date, 
	latestAKICode varchar(255),
	medReviewDate date,
	medReviewCode varchar(255),
	denominator int, 
	numerator int);
insert into #eligiblePopulationAllData
	select a.PatID, 
		a.latestAKICodeDate, a.latestAKICode, 
		medReviewDate, medReviewCode,
		denominator, 
		numerator
	from #latestAKICode as a
			left outer join (select PatID, medReviewDate, medReviewCode from #medReview3MonthsAfterAKICoded) b on b.PatID = a.PatID
			left outer join (select PatID, denominator from #denominator) c on c.PatID = a.PatID
			left outer join (select PatID, numerator from #numerator) d on d.PatID = a.PatID;
		
			
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



