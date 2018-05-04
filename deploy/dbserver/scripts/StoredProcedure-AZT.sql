--Perform manual pulse palpation for the presence of an irregular pulse that may indicate underlying atrial fibrillation in people presenting with any of the following:
--Breathlessness/dyspnoea
--Palpitations
--Syncope/dizziness
--Chest discomfort
--Stroke/ transient ischemic attack
--Confirm the diagnosis of AF with ECG


									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.meds.azt.monitor') DROP PROCEDURE [pingr.meds.azt.monitor];
GO
CREATE PROCEDURE [pingr.meds.azt.monitor] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

									--TO TEST ON THE FLY--
--use PatientSafety_Records_Test
--declare @refdate VARCHAR(10);
--declare @JustTheIndicatorNumbersPlease bit;
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;


declare @startDate datetime;
set @startDate = DATEADD(month, -3, @refdate);

declare @endDate datetime;
set @endDate = @refdate;

-- declare @daysLeft int;
-- set @daysLeft = (select DATEDIFF(day,@refdate,@endDate))

										-----------------------
										--ELIGIBLE POPULATION--
										-----------------------

-- Currently on AZT - use algorithm in future????
IF OBJECT_ID('tempdb..#AZT') IS NOT NULL DROP TABLE #AZT
CREATE TABLE #AZT (PatID int, latestAZTCodeDate date);
insert into #AZT
select s.PatID, latestAZTCodeDate from SIR_ALL_Records_Narrow as s
	inner join (
		select PatID, MAX(EntryDate) as latestAZTCodeDate from SIR_ALL_Records_Narrow
		where ReadCode in (select code from codeGroups where [group] = 'azt')
		and EntryDate >= @startDate
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAZTCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'azt')
group by s.PatID, latestAZTCodeDate

										-----------------------
										------DENOMINATOR------
										-----------------------
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int);
insert into #denominator
select PatID from #AZT


										-----------------------
										-------NUMERATOR-------
										-----------------------

IF OBJECT_ID('tempdb..#latestFBCCode') IS NOT NULL DROP TABLE #latestFBCCode
CREATE TABLE #latestFBCCode (PatID int, latestFBCCodeDate date, latestFBCCode varchar(512), latestFBCLocation varchar(10));
insert into #latestFBCCode
select s.PatID, latestFBCCodeDate, MAX(Rubric), case when MAX(Source) != MIN(Source) then 'GP' when MAX(Source) = 'salfordt' then 'Hospital' else 'GP' end from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestFBCCodeDate from SIR_ALL_Records_Narrow
		where ReadCode in (select code from codeGroups where [group] = 'fbc')
		and PatID in (select PatID from #denominator)
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestFBCCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'fbc')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestFBCCodeDate

IF OBJECT_ID('tempdb..#latestLFTCode') IS NOT NULL DROP TABLE #latestLFTCode
CREATE TABLE #latestLFTCode (PatID int, latestLFTCodeDate date, latestLFTCode varchar(512), latestLFTLocation varchar(10));
insert into #latestLFTCode
select s.PatID, latestLFTCodeDate, MAX(Rubric), case when MAX(Source) != MIN(Source) then 'GP' when MAX(Source) = 'salfordt' then 'Hospital' else 'GP' end from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestLFTCodeDate from SIR_ALL_Records_Narrow
		where ReadCode in (select code from codeGroups where [group] = 'lft')
		and PatID in (select PatID from #denominator)
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestLFTCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'lft')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestLFTCodeDate

IF OBJECT_ID('tempdb..#latestUECode') IS NOT NULL DROP TABLE #latestUECode
CREATE TABLE #latestUECode (PatID int, latestUECodeDate date, latestUECode varchar(512), latestUELocation varchar(10));
insert into #latestUECode
select s.PatID, latestUECodeDate, MAX(Rubric), case when MAX(Source) != MIN(Source) then 'GP' when MAX(Source) = 'salfordt' then 'Hospital' else 'GP' end from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestUECodeDate from SIR_ALL_Records_Narrow
		where ReadCode in (select code from codeGroups where [group] = 'U+E')
		and PatID in (select PatID from #denominator)
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestUECodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'U+E')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestUECodeDate

--numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID, 
	case 
		when latestUECodeDate >= @startDate and latestLFTCodeDate >= @startDate and latestFBCCodeDate >= @startDate then 1
	else 0 end 
from #denominator as a
left outer join (select * from #latestFBCCode) as b on b.PatID = a.PatID
left outer join (select * from #latestLFTCode) as c on c.PatID = a.PatID
left outer join (select * from #latestUECode) as d on d.PatID = a.PatID


					-----------------------------------------------------------------------------
					------------------------POPULATE INDICATOR TABLE-----------------------------
					-----------------------------------------------------------------------------
declare @target float;
set @target = null;
declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 sum(case when numerator = 1 then 1.0 else 0.0 end) / sum(case when numerator in (0,1) then 1.0 else 0.0 end) as perc from #numerator as a
inner join ptPractice as b on a.PatID = b.PatID
group by b.pracID
having sum(case when numerator in (0,1) then 1.0 else 0.0 end) > 0
order by perc desc) sub);
declare @ptPercPoints float;
set @ptPercPoints = 
(select 100 / SUM(case when numerator in (0,1) then 1.0 else 0.0 end) 
from #numerator
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0);

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'meds.azt.monitor', a.pracID, CONVERT(char(10), @refdate, 126), 
sum(case when numerator = 1 then 1 else 0 end), sum(case when numerator in (0,1) then 1 else 0 end), null, @abc 
from ptPractice as a
--select from ptPractice file so get 48 rows - one for each practice
left outer join #numerator as b on a.PatID = b.PatID
group by a.pracID;

					-----------------------------------------------------------------------------
					------------------------POPULATE DENOMINATOR TABLE---------------------------
					-----------------------------------------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why, nextReviewDate)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max), nextReviewDate date);
--insert into #denominators

select a.PatID, 'meds.azt.monitor',
		'<ul>'+
		'<li>Patient had AZT prescription on ' + CONVERT(VARCHAR, latestAZTCodeDate, 3) + '.</li>'+
		case
			when numerator = 1 then '<li>Their monitoring blood tests are <strong>up to date:</strong><ul>'
			when numerator = 0 then '<li>Their monitoring blood tests are <strong>NOT up to date:</strong><ul>'
		end +
		case 
			when latestFBCCodeDate is NULL then '<li><strong>There is no FBC on record for this patient.</strong></li>'
			when latestFBCCodeDate >= @startDate then '<li>Their latest FBC was on ' + CONVERT(VARCHAR, latestFBCCodeDate, 3) + '. ' +
				case when latestFBCLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
			else '<li><strong>Their latest FBC was more than 3 months ago on ' + CONVERT(VARCHAR, latestFBCCodeDate, 3) + '.</strong>'+
				case when latestFBCLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
		end +
		case 
			when latestLFTCodeDate is NULL then '<li><strong>There is no LFT on record for this patient.</strong></li>'
			when latestLFTCodeDate >= @startDate then '<li>Their latest LFT was on ' + CONVERT(VARCHAR, latestLFTCodeDate, 3) + '. ' +
				case when latestLFTLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
			else '<li><strong>Their latest LFT was more than 3 months ago on ' + CONVERT(VARCHAR, latestLFTCodeDate, 3) + '.</strong>'+
				case when latestLFTLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
		end +
		case 
			when latestUECodeDate is NULL then '<li><strong>There is no U+E on record for this patient.</strong></li>'
			when latestUECodeDate >= @startDate then '<li>Their latest U+E was on ' + CONVERT(VARCHAR, latestUECodeDate, 3) + '. ' +
				case when latestUELocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
			else '<li><strong>Their latest U+E was more than 3 months ago on ' + CONVERT(VARCHAR, latestUECodeDate, 3) + '.</strong>'+
				case when latestUELocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong>' else '' end
			 + '.</li>'
		end + '</ul></ul>'
		,
		DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from #numerator as a
left outer join (select * from #latestFBCCode) as b on b.PatID = a.PatID
left outer join (select * from #latestLFTCode) as c on c.PatID = a.PatID
left outer join (select * from #latestUECode) as d on d.PatID = a.PatID
left outer join (select * from #AZT) as e on e.PatID = a.PatID
left outer join latestAnnualReviewCode l on l.PatID = a.PatID

-- TODO Add FBC, LFT and U+E to measurements - needs thought as e.g. FBC has ~10 different values - don't want to clog up the lifeline

								---------------------------------------------------------
								-- Exit if we're just getting the indicator numbers -----
								---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;

					-----------------------------------------------------------------------------
					--------------------------IMPROVEMENT OPPS DATA------------------------------
					-----------------------------------------------------------------------------
-- TODO nothing added as using above tables.
-- TODO or maybe just the hospital monitoring temp table
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

-- Need FBC

-- Need LFT

-- Need U+E


--ALL PATIENTS
-->Need FBC
select a.PatID,
	'meds.azt.monitor' as indicatorId,
	'Do FBC' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Perform FBC' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient had AZT prescription on ' + CONVERT(VARCHAR, latestAZTCodeDate, 3) + '.</li>'+
		case 
			when latestFBCCodeDate is NULL then '<li><strong>There is no FBC on record for this patient.</strong></li>'
			else '<li><strong>Their latest FBC was more than 3 months ago on ' + CONVERT(VARCHAR, latestFBCCodeDate, 3) + '.</strong> ' +
				case when latestFBCLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong></li>' else '</li>' end
		end +
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from #latestFBCCode) as b on b.PatID = a.PatID
left outer join (select * from #AZT) as c on c.PatID = a.PatID
where numerator = 0 and (latestFBCCodeDate is NULL OR latestFBCCodeDate < @startDate)

union

-->Need LFT
select a.PatID,
	'meds.azt.monitor' as indicatorId,
	'Do LFT' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Perform LFT' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient had AZT prescription on ' + CONVERT(VARCHAR, latestAZTCodeDate, 3) + '.</li>'+
		case 
			when latestLFTCodeDate is NULL then '<li><strong>There is no LFT on record for this patient.</strong></li>'
			else '<li><strong>Their latest LFT was more than 3 months ago on ' + CONVERT(VARCHAR, latestLFTCodeDate, 3) + '.</strong> ' +
				case when latestLFTLocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong></li>' else '</li>' end
		end +
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from #latestLFTCode) as b on b.PatID = a.PatID
left outer join (select * from #AZT) as c on c.PatID = a.PatID
where numerator = 0 and (latestLFTCodeDate is NULL OR latestLFTCodeDate < @startDate)

union

-->Need U+E
select a.PatID,
	'meds.azt.monitor' as indicatorId,
	'Do U+E' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Perform U+E' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient had AZT prescription on ' + CONVERT(VARCHAR, latestAZTCodeDate, 3) + '.</li>'+
		case 
			when latestUECodeDate is NULL then '<li><strong>There is no U+E on record for this patient.</strong></li>'
			else '<li><strong>Their latest U+E was more than 3 months ago on ' + CONVERT(VARCHAR, latestUECodeDate, 3) + '.</strong> ' +
				case when latestUELocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong></li>' else '</li>' end
		end +
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from #latestUECode) as b on b.PatID = a.PatID
left outer join (select * from #AZT) as c on c.PatID = a.PatID
where numerator = 0 and (latestUECodeDate is NULL OR latestUECodeDate < @startDate)

-- union

--> Hospital monitored
-- select a.PatID,
-- 	'meds.azt.monitor' as indicatorId,
-- 	'hospitalMonitor' as actionCat,
-- 	1 as reasonNumber,
-- 	@ptPercPoints as pointsPerAction,
-- 	1 as priority,
-- 	'Perform U+E' as actionText,
-- 	'Reasoning' +
-- 		'<ul>'+
-- 		'<li>Patient had AZT prescription on ' + CONVERT(VARCHAR, latestAZTCodeDate, 3) + '.</li>'+
-- 		case 
-- 			when latestUECodeDate is NULL then '<li><strong>There is no U+E on record for this patient.</strong></li>'
-- 			else '<li><strong>Their latest U+E was more than 3 months ago on ' + CONVERT(VARCHAR, latestUECodeDate, 3) + '.</strong> ' +
-- 				case when latestUELocation = 'Hospital' then '<strong>This was done at SRFT so it may not show on EMIS/Vision</strong></li>' else '</li>' end
-- 		end +
-- 		'</ul>'
-- 	as supportingText
-- from #numerator as a
-- left outer join (select * from #latestUECode) as b on b.PatID = a.PatID
-- left outer join (select * from #AZT) as c on c.PatID = a.PatID
-- where numerator = 0 and (latestUECodeDate is NULL OR latestUECodeDate < @startDate)

							---------------------------------------------------------------
							---------------ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--ONLY ONE ORG ACTION FOR THIS INDICATOR
select c.pracID, 'dmardTemplate', 
	SUM(case when numerator = 0 then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator in (0,1) then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0


							---------------------------------------------------------------
							----------------------ORG-LEVEL ACTIONS------------------------
							---------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.orgActions](pracID, indicatorId, actionCat, proportion, numberPatients, pointsPerAction, priority, actionText, supportingText)

										--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#orgActions') IS NOT NULL DROP TABLE #orgActions
--CREATE TABLE #orgActions (pracID varchar(1000), indicatorId varchar(1000), actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #orgActions


--REMIND STAFF TO CHECK RHYTHM DURING RATE
select
	pracID as pracID,
	'meds.azt.monitor' as indicatorId,
	'dmard template' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to use the DMARD template in EMIS or Vision.' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require monitoring for azathioprine <strong>have not</strong> had all their blood tests done in the last three months.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'dmardTemplate' 


							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--OVERVIEW TAB
('meds.azt.monitor','name','Azathioprine monitoring'), --overview table name
('meds.azt.monitor','tabText','AZT monitoring'), --indicator tab text
('meds.azt.monitor','description', --'show more' on overview tab
	'<strong>Definition:</strong> The proportion of patients prescribed AZT in the last 3 months who have also had an FBC, LFT and U+E in the last 3 months (including when done in SRFT). <br>'+ 
	'<strong>Why this is important:</strong> <a href=''https://cks.nice.org.uk/dmards#!scenario:2'' target=''_blank'' title=''NICE DMARD Guidelines''>NICE recommends patients on AZT should have monitoring at least every 3 months</a>.'),
--INDICATOR TAB
--summary text
('meds.azt.monitor','tagline',' of patients prescribed AZT in the last 3 months have had an FBC, LFT and U+E in the last 3 months (including when done in SRFT). '),
('meds.azt.monitor','positiveMessage', --tailored text
null),
	--pt lists
	-- TODO sort out value ids and name - need possibly latest date of any of the tests - or oldest date of any of the tests
('meds.azt.monitor','valueId','latestSx'),
('meds.azt.monitor','valueName','Presentation'),
('meds.azt.monitor','dateORvalue','date'),
('meds.azt.monitor','valueSortDirection','desc'),  -- 'asc' or 'desc'
('meds.azt.monitor','showNextReviewDateColumn', 'true'),
('meds.azt.monitor','tableTitle','Patients with overdue AZT monitoring'),


	--imp opp charts (based on actionCat)
--ALL PATIENTS
-->NEED FBC
('meds.azt.monitor','opportunities.Do FBC.name','Needs FBC'),
('meds.azt.monitor','opportunities.Do FBC.description','Patients who require an FBC.'),
('meds.azt.monitor','opportunities.Do FBC.positionInBarChart','1'),

-->NEED LFT
('meds.azt.monitor','opportunities.Do LFT.name','Needs LFT'),
('meds.azt.monitor','opportunities.Do LFT.description','Patients who require an LFT'),
('meds.azt.monitor','opportunities.Do LFT.positionInBarChart','2'),

--NEED U+E
('meds.azt.monitor','opportunities.Do U+E.name','Needs U+E'),
('meds.azt.monitor','opportunities.Do U+E.description','Patients who require a U+E.'),
('meds.azt.monitor','opportunities.Do U+E.positionInBarChart','3'),

--HOSPITAL DMARD MONITORING
('meds.azt.monitor','opportunities.hospitalMonitor.name','Hospital monitored'),
('meds.azt.monitor','opportunities.hospitalMonitor.description','Patients who monitored in hospital.'),
('meds.azt.monitor','opportunities.hospitalMonitor.positionInBarChart','4');
