------------------------------------------------------------------------------------------
-- AKI-kidney-function
--
-- Coded AKI in the last 3 months
-- eGFR & ACR checked within 3 months of AKI diagnosis
------------------------------------------------------------------------------------------

IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.aki.kidney.function') DROP PROCEDURE [pingr.aki.kidney.function];

GO
CREATE PROCEDURE [pingr.aki.kidney.function] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
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


-- #creatinineWithin3Months [07a]

-- 01a with creatinine checked within 3 months

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

--   There seem to be large numbers of eGFR checks within the 3 month window following the latest AKI code
--   We're just selecting the most recent in each case here

IF OBJECT_ID('tempdb..#eGFRWithin3Months') IS NOT NULL DROP TABLE #eGFRWithin3Months;
CREATE TABLE #eGFRWithin3Months (PatID int, latesteGFRCheckDate date, ReadCode varchar(255), latesteGFRCodeMin varchar(255), latesteGFRCodeMax varchar(255), latesteGFRCode varchar(255));
insert into #eGFRWithin3Months
select PatID, eGFRDate, ReadCode, eGFRCodeMin, eGFRCodeMax, eGFRCode from (
	select s.PatID, s.EntryDate as eGFRDate, ReadCode, MIN(Rubric) as eGFRCodeMin, MAX(Rubric) as eGFRCodeMax, case when MIN(Rubric)=MAX(Rubric) then MAX(Rubric) else 'Differ' end as eGFRCode, ROW_NUMBER() over (PARTITION BY s.PatID ORDER BY s.EntryDate DESC) rn
		from SIR_ALL_Records as s
		inner join #latestAKICode on #latestAKICode.PatID = s.PatID  
		and s.EntryDate >= #latestAKICode.latestAKICodeDate and s.EntryDate <= dateadd(month, 3, #latestAKICode.latestAKICodeDate)
		where s.ReadCode in ('451F.', '451E.', 'G2410')
		group by s.PatID, EntryDate, ReadCode
	) sub
	where rn = 1;


-- #acrWithin3Months [07g]

-- 01a with ACR checked within 3 months

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
-- GET ABC (TOP 10% BENCHMARK)
-----------------------------------------------------------------------------

declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 sum(case when numerator = 1 then 1.0 else 0.0 end) / SUM(case when denominator = 1 then 1.0 else 0.0 end) as perc from #eligiblePopulationAllData as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
	having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0
	order by perc desc) sub);


-----------------------------------------------------------------------------
-- DECLARE NUMERATOR, INDICATOR AND TARGET FROM DENOMINATOR TABLE
-----------------------------------------------------------------------------

declare @indicatorScore float;
set @indicatorScore = (select sum(case when numerator = 1 then 1 else 0 end)/sum(case when denominator = 1 then 1 else 0 end) from #eligiblePopulationAllData having SUM(case when denominator = 1 then 1.0 else 0.0 end) > 0);
declare @target float;
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

select 'aki.kidneyfunction.3months', b.pracID, CONVERT(char(10), @refdate, 126) as date, 
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

select a.PatID, 'aki.kidneyfunction.3months',
	'<ul>'+
	'<li>Patient had AKI diagnosis on ' + CONVERT(VARCHAR, latestAKICodeDate, 3) + '.</li>'+
	case
		when numerator = 1 then '<li>Their monitoring kidney function tests are <strong>up to date:</strong><ul>'
		else '<li>Their monitoring kidney function tests are <strong>NOT up to date:</strong><ul>'
	end +
	case 
		when latestCreatinineDate is NULL then '<li><strong>There is no Creatinine check on record for this patient since their AKI diagnosis.</strong></li>'
        else '<li><strong>This patient had a Creatinine check on ' + CONVERT(VARCHAR, latestCreatinineDate, 3) + '.</strong></li>'
	end + 
	case 
		when latesteGFRCheckDate is NULL then '<li><strong>There is no eGFR check on record for this patient since their AKI diagnosis.</strong></li>'
        else '<li><strong>This patient had an eGFR check on ' + CONVERT(VARCHAR, latesteGFRCheckDate, 3) + '.</strong></li>'
	end + 
	case 
		when latestACRDate is NULL then '<li><strong>There is no ACR check on record for this patient since their AKI diagnosis.</strong></li>'
        else '<li><strong>This patient had an ACR check on ' + CONVERT(VARCHAR, latestACRDate, 3) + '.</strong></li>'
	end + 
	'</ul></ul>'
	,
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

-- NO PRIM CARE CONTACT IN THE LAST YEAR
--> CHECK REGISTERED
select a.PatID,
	'aki.kidneyfunction.3months' as indicatorId,
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
where numerator = 0
and latestPrimCareContactDate < DATEADD(year, -1, @refdate)

union

-- REGULAR F2F CONTACT
--> DO WHEN NEXT COMES IN
select a.PatID,
	'aki.kidneyfunction.3months' as indicatorId,
	'Opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on medical record to check kidney function at next face-to-face contact' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfF2fContactsInLastYear, 3) + ' face-to-face contacts with your practice in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, datediff(day, @refDate, dateadd(month, 3, latestAKICodeDate)), 3) + ' days left for this patient to achieve the indicator.</li>'+
		'<li>Patient is expected to have ' + CONVERT(VARCHAR, (noOfF2fContactsInLastYear * datediff(day, @refDate, dateadd(month, 3, latestAKICodeDate)) / 365), 3) + ' further face-to-face contacts with your practice before then.</li>'+
		'<li>You could put a note in their record to remind the next person to see them to perform the following kidney function tests:'+
		'<ul>' +
			case 
				when latestCreatinineDate is NULL then '<li>Creatinine</li>' else ''
			end + 
			case 
				when latesteGFRCheckDate is NULL then '<li>eGFR</li>' else ''
			end + 
			case 
				when latestACRDate is NULL then '<li>ACR</li>' else ''
			end + 
		'</ul></li>' +
		'<li>Either as an alert when you open the record, or as a consultation note.</li>'+
		'</ul>'
	as supportingText
from #eligiblePopulationAllData as a
left outer join (select * from noOfF2fContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfF2fContactsInLastYear * datediff(day, @refDate, dateadd(month, 3, latestAKICodeDate)) / 365) >= 1.5

union

-- INFREQUENT F2F CONTACT
--> SEND LETTER
select a.PatID,
	'aki.kidneyfunction.3months' as indicatorId,
	'Send letter' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	3 as priority,
	'Send letter to request kidney function tests' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfF2fContactsInLastYear, 3) + ' face-to-face contacts with your practice in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, datediff(day, @refDate, dateadd(month, 3, latestAKICodeDate)), 3) + ' days ramaining for patient to achieve the indicator.</li>'+
		'<li>Patient is not expected to have any further face-to-face contacts with your practice before then.</li>'+
		'<li>Send a letter to patient asking them to arrange an appointment to have the following kidney function tests:'+
		'<ul>' +
			case 
				when latestCreatinineDate is NULL then '<li>Creatinine</li>' else ''
			end + 
			case 
				when latesteGFRCheckDate is NULL then '<li>eGFR</li>' else ''
			end + 
			case 
				when latestACRDate is NULL then '<li>ACR</li>' else ''
			end + 
		'</ul></li>' +		
		'</ul>'
	as supportingText
from #eligiblePopulationAllData as a
left outer join (select * from noOfF2fContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfF2fContactsInLastYear * datediff(day, @refDate, dateadd(month, 3, latestAKICodeDate)) / 365) < 1;


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
('aki.kidneyfunction.3months','name','AKI Kidney Function Tests'), --overview table name
('aki.kidneyfunction.3months','tabText','AKI Kidney Function Tests'), --indicator tab text
('aki.kidneyfunction.3months','description', --'show more' on overview tab
	'<strong>Definition:</strong> The proportion of patients diagnosed with AKI in the last 3 months who have had Creatinine, eGFR & ACR kidney function tests within 3 months of the diagnosis<br>'),

--INDICATOR TAB

--summary text
('aki.kidneyfunction.3months','tagline',' of patients diagnosed with AKI in the last 3 months who have had Creatinine, eGFR & ACR kidney function tests within 3 months of the diagnosis'),  -- FIXME
('aki.kidneyfunction.3months','positiveMessage', 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'),
--pt lists
('aki.kidneyfunction.3months','valueId','AKI'),
('aki.kidneyfunction.3months','valueName','Latest AKI'),
('aki.kidneyfunction.3months','dateORvalue','date'),
('aki.kidneyfunction.3months','valueSortDirection','desc'),  -- 'asc' or 'desc'
('aki.kidneyfunction.3months','tableTitle','Patients who have had AKI recorded since ' + CONVERT(VARCHAR, @startDate, 3) + '.'),

--imp opp charts (based on actionCat)

-->CHECK REGISTERED
('aki.kidneyfunction.3months','opportunities.Registered?.name','Check registered'),
('aki.kidneyfunction.3months','opportunities.Registered?.description','Patients who have not had contact with your practice in the last 12 months - are they still registered with you?'),
('aki.kidneyfunction.3months','opportunities.Registered?.positionInBarChart','1'),

--OPPORTUNISTIC
('aki.kidneyfunction.3months','opportunities.Opportunistic.name','Opportunistic kidney function tests'),
('aki.kidneyfunction.3months','opportunities.Opportunistic.description','Patients who have regular contact with your practice. You may wish to put a note in their record to remind the next person who sees them to test kidney function.'),
('aki.kidneyfunction.3months','opportunities.Opportunistic.positionInBarChart','2'),

-->SEND LETTER
('aki.kidneyfunction.3months','opportunities.Send letter.name','Send letter to request kidney function tests'),
('aki.kidneyfunction.3months','opportunities.Send letter.description','Patients who require kidney function tests. You may wish to send them a letter.'),
('aki.kidneyfunction.3months','opportunities.Send letter.positionInBarChart','3');






