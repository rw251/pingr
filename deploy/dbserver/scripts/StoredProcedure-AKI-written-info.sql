------------------------------------------------------------------------------------------
-- AKI-written-information
--
-- Coded AKI in the last 3 months
-- Written information on AKI received post diagnosis
------------------------------------------------------------------------------------------

IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.aki.written.info') DROP PROCEDURE [pingr.aki.written.info];

GO
CREATE PROCEDURE [pingr.aki.written.info] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

-------------------------------------------------------------------------------
-- ELIGIBLE POPULATION
-------------------------------------------------------------------------------

-- Start date is 3 months prior to report date

declare @startDate datetime;
set @startDate = DATEADD(month, -3, @refdate);

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


-- #writtenInformationReceivedAfterAKICoded [18]

-- NOTES:
-- ID of all patients that have written information on AKI (8OAG.) following the AKI code
-- gives date of most recent if there are multiple instances

 IF OBJECT_ID('tempdb..#writtenInformationReceivedAfterAKICoded') IS NOT NULL DROP TABLE #writtenInformationReceivedAfterAKICoded;
 CREATE TABLE #writtenInformationReceivedAfterAKICoded (PatID int, latestWrittenReceivedDate date);
 insert into #writtenInformationReceivedAfterAKICoded
	 select s.PatID, MAX(writtenReceivedDate) from #latestAKICode as s
	 inner join (
		select PatID, EntryDate as writtenReceivedDate from SIR_ALL_Records_Narrow
			where ReadCode = '8OAG.'		
			and EntryDate >= @startDate
		) sub on sub.PatID = s.PatID and writtenReceivedDate >= s.latestAKICodeDate
	 group by s.PatID;


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

-- FIXME: currently all patients from #writtenInformationReceivedAfterAKICoded as we have no exclusions

IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
	select a.PatID, 1
	from #writtenInformationReceivedAfterAKICoded as a
		left outer join (select PatID, denominator from #denominator) b on b.PatID = a.PatID;



-- #eligiblePopulationAllData

--all data from above combined into one table, plus denominator/numerator columns

IF OBJECT_ID('tempdb..#eligiblePopulationAllData') IS NOT NULL DROP TABLE #eligiblePopulationAllData
CREATE TABLE #eligiblePopulationAllData (PatID int, 
	latestAKICodeDate date, 
	latestAKICode varchar(255),
	writtenReceivedDate date,
	denominator int, 
	numerator int);
insert into #eligiblePopulationAllData
	select a.PatID, 
		a.latestAKICodeDate, a.latestAKICode, 
		latestWrittenReceivedDate,
		denominator, 
		numerator
	from #latestAKICode as a
			left outer join (select PatID, latestWrittenReceivedDate from #writtenInformationReceivedAfterAKICoded) b on b.PatID = a.PatID
			left outer join (select PatID, denominator from #denominator) c on c.PatID = a.PatID
			left outer join (select PatID, numerator from #numerator) d on d.PatID = a.PatID;
		
		
		
-------------------------------------------------------------------------------
-- GET ABC (TOP 10% BENCHMARK
-------------------------------------------------------------------------------

declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 sum(case when numerator = 1 then 1.0 else 0.0 end) / SUM(case when denominator = 1 then 1.0 else 0.0 end) as perc from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
	having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0
	order by perc desc) sub);


-------------------------------------------------------------------------------
-- DECLARE NUMERATOR, INDICATOR AND TARGET FROM DENOMINATOR TABLE
-------------------------------------------------------------------------------

declare @indicatorScore float;
set @indicatorScore = (select sum(case when numerator = 1 then 1 else 0 end)/sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0);
declare @target float;
-- FIXME: what value do we want here?
set @target = 1.0;
declare @numerator int;
set @numerator = (select sum(case when numerator = 1 then 1 else 0 end) from #eligiblePopulationAllData);
declare @denominator int;
set @denominator = (select sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData);


-------------------------------------------------------------------------------
-- POPULATE INDICATOR TABLE
-------------------------------------------------------------------------------
					
                    				--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'aki.writteninfo.FIXME', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
	sum(case when numerator = 1 then 1 else 0 end) as numerator, 
	sum(case when denominator = 1 then 1 else 0 end) as denominator, @target as target, @abc 
from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID;


-------------------------------------------------------------------------------
-- POPULATE MAIN DENOMINATOR TABLE 
-------------------------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why, nextReviewDate)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max), nextReviewDate date);
--insert into #denominators

-- FIXME: the 'why' text is minimal - do we want to elaborate?

select a.PatID, 'aki.writteninfo.FIXME',
	'<ul>'+
	'<li>Patient had AKI diagnosis on ' + CONVERT(VARCHAR, latestAKICodeDate, 3) + '.</li>'+
	case
		when numerator = 1 then '<li>They received written information on ' + CONVERT(VARCHAR, writtenReceivedDate, 3) + '</li>'
		else '<li>They have <strong>NOT received any written information since their AKI diagnosis</strong></li>'
	end + 
	'</ul>',
	DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from #eligiblePopulationAllData as a
left outer join latestAnnualReviewCode l on l.PatID = a.PatID;


-------------------------------------------------------------------------------
-- Exit if we're just getting the indicator numbers 
-------------------------------------------------------------------------------

IF @JustTheIndicatorNumbersPlease = 1 RETURN;


-------------------------------------------------------------------------------
-- DEFINE % POINTS PER PATIENT
-------------------------------------------------------------------------------

-- FIXME: is this method correct? There seems to be differences between indicators

declare @ptPercPoints float;
set @ptPercPoints = 
(select 100 / SUM(case when denominator = 1 then 1.0 else 0.0 end) 
from #eligiblePopulationAllData);



-------------------------------------------------------------------------------
-- PATIENT-LEVEL ACTIONS
-------------------------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
--CREATE TABLE #patActions
--	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #patActions

-- FIXME: what actions?

-- NO PRIM CARE CONTACT IN THE LAST YEAR
--> CHECK REGISTERED
select a.PatID,
	'aki.writteninfo.FIXME' as indicatorId,
	'Registered?' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Check this patient is registered' as actionText,
	'Reasoning' +
		'<ul><li>No contact with your practice in the last year.</li>' +
		'<li>If <strong>not registered</strong> please add code <strong>92...</strong> [92...] to their records.</li>' +
		'<li>If <strong>dead</strong> please add code <strong>9134.</strong> [9134.] to their records.</li></ul>'
	as supportingText
from #eligiblePopulationAllData as a
left outer join (select PatID, latestPrimCareContactDate from latestPrimCareContact) as b on b.PatID = a.PatID
where numerator is NULL
and latestPrimCareContactDate < DATEADD(year, -1, @refdate)



-------------------------------------------------------------------------------
-- ORG-LEVEL ACTIONS
-------------------------------------------------------------------------------						

									--TO RUN AS STORED PROCEDURE--
-- insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
--CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #orgActions

-- TODO


-------------------------------------------------------------------------------
-- TEXT FILE OUTPUTS
-------------------------------------------------------------------------------						

insert into [pingr.text] (indicatorId, textId, text)

values
--OVERVIEW TAB
('aki.writteninfo.FIXME','name','AKI Written Information'), --overview table name
('aki.writteninfo.FIXME','tabText','AKI Written Info'), --indicator tab text
('aki.writteninfo.FIXME','description', --'show more' on overview tab
	'<strong>Definition:</strong> The proportion of patients diagnosed with AKI in the last 3 months who have received written information since the diagnosis<br>'+
    '<strong>Why this is important:</strong> FIXME '),

--INDICATOR TAB

--summary text
('aki.writteninfo.FIXME','tagline',' of patients diagnosed with AKI in the last 3 months who have received written information since the diagnosis'),  -- FIXME
('aki.writteninfo.FIXME','positiveMessage', 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'),

--pt lists
('aki.writteninfo.3months','valueId','AKI'),
('aki.writteninfo.3months','valueName','Latest AKI'),
('aki.writteninfo.3months','dateORvalue','date'),
('aki.writteninfo.3months','valueSortDirection','desc'),  -- 'asc' or 'desc'
('aki.writteninfo.3months','tableTitle','Patients who have had AKI recorded since ' + CONVERT(VARCHAR, @startDate, 3) + '.'),

--imp opp charts (based on actionCat)

-->CHECK REGISTERED
('aki.writteninfo.FIXME','opportunities.Registered?.name','Check registered'),
('aki.writteninfo.FIXME','opportunities.Registered?.description','Patients who have not had contact with your practice in the last 12 months - are they still registered with you?'),
('aki.writteninfo.FIXME','opportunities.Registered?.positionInBarChart','1');

-- FIXME: update as per actions
