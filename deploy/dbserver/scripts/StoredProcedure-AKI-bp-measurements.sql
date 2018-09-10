------------------------------------------------------------------------------------------
-- AKI-bp-measurements
-- Population 01a and BP checked within 3 months of AKI diagnosis
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


-- #bpChecked3MonthsAfterAKICoded [13b]

-- NOTES:
-- ID of all patients that have had a BP check within 3 months of an AKI code, and the date of the most recent check
--   What if the patient had multiple BP checks within the 3 month window?
--  FIXME: > or >= for date test?

IF OBJECT_ID('tempdb..#bpChecked3MonthsAfterAKICoded') IS NOT NULL DROP TABLE #bpChecked3MonthsAfterAKICoded;
CREATE TABLE #bpChecked3MonthsAfterAKICoded (PatID int, bpCheckDate date, bpCheckCodeMin varchar(255), bpCheckCodeMax varchar(255), bpCheckCode varchar(255));
insert into #bpChecked3MonthsAfterAKICoded
select PatID, bpCheckDate, bpCheckCodeMin, bpCheckCodeMax, bpCheckCode from (
	select s.PatID, EntryDate as bpCheckDate, MIN(Rubric) as bpCheckCodeMin, MAX(Rubric) as bpCheckCodeMax, case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as bpCheckCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn 
 		from SIR_ALL_Records as s
		inner join #latestAKICode on #latestAKICode.PatID = s.PatID  
		and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where ReadCode in (select code from codeGroups where [group] in ('bp', 'sdp', 'dbp'))	
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

-- FIXME: currently all patients from #bpChecked3MonthsAfterAKICoded as we have no exclusions

IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
	select a.PatID, 1
	from #bpChecked3MonthsAfterAKICoded as a
		left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID;



-- #eligiblePopulationAllData

--all data from above combined into one table, plus denominator/numerator columns


IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int, 
	latestAKICodeDate date, 
	latestAKICode varchar(255),
	bpCheckDate date,
	denominator int, 
	numerator int);
insert into #eligiblePopulationAllData
	select a.PatID, 
		a.latestAKICodeDate, a.latestAKICode, 
		bpCheckDate,
		denominator, 
		numerator
	from #latestAKICode as a
			left outer join (select PatID, bpCheckDate from #bpChecked3MonthsAfterAKICoded) b on b.PatID = a.PatID
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
set @target = 1.0;
declare @numerator int;
set @numerator = (select sum(case when numerator = 1 then 1 else 0 end) from #eligiblePopulationAllData);
declare @denominator int;
set @denominator = (select sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData);


-----------------------------------------------------------------------------
------------------------POPULATE INDICATOR TABLE-----------------------------
-----------------------------------------------------------------------------
					
                    				--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'aki.bp.3months', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
	sum(case when numerator = 1 then 1 else 0 end) as numerator, 
	sum(case when denominator = 1 then 1 else 0 end) as denominator, @target as target, @abc 
from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID;


----------------------------------------------
-------POPULATE MAIN DENOMINATOR TABLE--------
----------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why, nextReviewDate)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max), nextReviewDate date);
--insert into #denominators

select a.PatID, 'aki.bp.3months',
	'<ul>'+
	'<li>Patient had AKI diagnosis ' + CONVERT(VARCHAR, latestAKICodeDate, 3) + '.</li>'+
	case
		when numerator = 1 then '<li>Their monitoring blood tests are <strong>up to date:</strong><ul>'
		else '<li>Their monitoring blood tests are <strong>NOT up to date:</strong><ul>'
	end +
	case 
		when bpCheckDate is NULL then '<li><strong>There is no BP check on record for this patient.</strong></li>'
        else '<li><strong>This patient had a BP check on ' + CONVERT(VARCHAR, bpCheckDate, 3) + '.</strong></li>'
	end + '</ul></ul>'
	,
	DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from #eligiblePopulationAllData as a
left outer join latestAnnualReviewCode l on l.PatID = a.PatID;

---------------------------------------------------------
-- Exit if we're just getting the indicator numbers -----
---------------------------------------------------------

IF @JustTheIndicatorNumbersPlease = 1 RETURN;



