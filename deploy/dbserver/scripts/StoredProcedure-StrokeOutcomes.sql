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
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;

--declare @startDate datetime;
--set @startDate = (select 
--case --for 12 monthly targets
--	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-03-31' --when today's date is before April, today is 31st March LAST year
--	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-03-31' --when today's date is after March, today is 31st March THIS year
--end);

--declare @endDate datetime;
--set @endDate = (select 
--case --for 12 monthly targets
--	when MONTH(@refdate) <4 then CONVERT(VARCHAR,YEAR(@refdate)) + '-03-31' --when today's date is before April, today is 31st March THIS year
--	when MONTH(@refdate) >3 then CONVERT(VARCHAR,(YEAR(@refdate) + 1)) + '-03-31' --when today's date is after March, today is 31st March NEXT year
--end);

									----------------------------------------------
											-------NO OF STROKES--------
											-------IN THE LAST YEAR--------
									----------------------------------------------

--patients with strokes this year IN HOSPITAL
--multiple patients included
IF OBJECT_ID('tempdb..#strokePts') IS NOT NULL DROP TABLE #strokePts
CREATE TABLE #strokePts (PatID int, strokeCodeDate date, strokeCode varchar(512), strokeRead varchar(512), strokeSource varchar(512), pracID varchar(512));
insert into #strokePts
select a.PatID, EntryDate, MAX(Rubric), ReadCode, Source,  pracID from SIR_ALL_Records as a
inner join ptPractice as b on a.PatID = b.PatID
where ReadCode in (select code from codeGroups where [group] in ('strokeQof'))
and EntryDate > DATEADD(month, -12, @refdate)
and EntryDate < @refdate
and Source = 'salfordt' --ONLY FROM HOSPITAL
group by a.PatID, EntryDate, Source, pracID, ReadCode

--no of strokes per practice this year
--multiple patients included
IF OBJECT_ID('tempdb..#strokePractices') IS NOT NULL DROP TABLE #strokePractices
CREATE TABLE #strokePractices (pracID varchar(1000), noStrokes int);
insert into #strokePractices 
select pracID, COUNT(*) from #strokePts as a
group by pracID

--no of strokes per patient this year
IF OBJECT_ID('tempdb..#numberOfStrokesPerPatient') IS NOT NULL DROP TABLE #numberOfStrokesPerPatient
CREATE TABLE #numberOfStrokesPerPatient (PatID int, numberOfStrokesPerPatient int);
insert into #numberOfStrokesPerPatient
select distinct PatID, count (*) from #strokePts
group by PatID

--latest stroke
IF OBJECT_ID('tempdb..#latestStrokeDate') IS NOT NULL DROP TABLE #latestStrokeDate
CREATE TABLE #latestStrokeDate (PatID int, latestStrokeDate date, latestStrokeCode varchar(512), latestStrokeRead varchar(512));
insert into #latestStrokeDate
select PatID, MAX(strokeCodeDate), strokeCode, strokeRead from #strokePts
group by PatID, strokeRead, strokeCode

--second latest stroke
IF OBJECT_ID('tempdb..#secondLatestStrokeDate') IS NOT NULL DROP TABLE #secondLatestStrokeDate
CREATE TABLE #secondLatestStrokeDate (PatID int, secondLatestStrokeDate date);
insert into #secondLatestStrokeDate
select a.PatID, MAX(strokeCodeDate) from #strokePts as a
left outer join	 (select * from #latestStrokeDate) as b on a.PatID = b.PatID 
where strokeCodeDate < latestStrokeDate
group by a.PatID

--third latest stroke
IF OBJECT_ID('tempdb..#thirdLatestStrokeDate') IS NOT NULL DROP TABLE #thirdLatestStrokeDate
CREATE TABLE #thirdLatestStrokeDate (PatID int, thirdLatestStrokeDate date);
insert into #thirdLatestStrokeDate
select a.PatID, MAX(strokeCodeDate) from #strokePts as a
left outer join	 (select * from #secondLatestStrokeDate) as b on a.PatID = b.PatID 
where strokeCodeDate < secondLatestStrokeDate
group by a.PatID

--fourth latest stroke
IF OBJECT_ID('tempdb..#fourthLatestStrokeDate') IS NOT NULL DROP TABLE #fourthLatestStrokeDate
CREATE TABLE #fourthLatestStrokeDate (PatID int, fourthLatestStrokeDate date);
insert into #fourthLatestStrokeDate
select a.PatID, MAX(strokeCodeDate) from #strokePts as a
left outer join	 (select * from #thirdLatestStrokeDate) as b on a.PatID = b.PatID 
where strokeCodeDate < thirdLatestStrokeDate
group by a.PatID

--patients with strokes this year IN PRIMARY CARE
--multiple patients included
IF OBJECT_ID('tempdb..#primCareStroke') IS NOT NULL DROP TABLE #primCareStroke
CREATE TABLE #primCareStroke (PatID int, strokeCodeDate date, strokeCode varchar(512), strokeSource varchar(512), pracID varchar(512));
insert into #primCareStroke
select a.PatID, EntryDate, MAX(Rubric), Source,  pracID from SIR_ALL_Records as a
inner join ptPractice as b on a.PatID = b.PatID
where ReadCode in (select code from codeGroups where [group] in ('strokeQof'))
and EntryDate > DATEADD(month, -12, @refdate)
and EntryDate < @refdate
and Source != 'salfordt' --NOT FROM HOSPITAL
group by a.PatID, EntryDate, Source, pracID

--no of PRIM CARE strokes per patient this year
IF OBJECT_ID('tempdb..#numberOfPrimCareStrokesPerPatient') IS NOT NULL DROP TABLE #numberOfPrimCareStrokesPerPatient
CREATE TABLE #numberOfPrimCareStrokesPerPatient (PatID int, numberOfPrimCareStrokesPerPatient int);
insert into #numberOfPrimCareStrokesPerPatient
select distinct PatID, count (*) from #primCareStroke
group by PatID


									----------------------------------------------
											------PRACTICE LIST SIZE--------
												-------AS OF TODAY--------
									----------------------------------------------

--all patients
--not dead according to dead table or died > 1 year ago
IF OBJECT_ID('tempdb..#allPats') IS NOT NULL DROP TABLE #allPats
CREATE TABLE #allPats (PatID int, pracID varchar(1000));
insert into #allPats 
select distinct(a.PatID), pracID from SIR_ALL_Records as a
left outer join	(select patid, dead, month_of_death, year_of_death from patients) as b on a.PatID = b.patid
inner join ptPractice as c on a.PatID = c.PatID
where dead = 0 
--	or (dead = 1 and year_of_death < CONVERT(VARCHAR,YEAR(@refdate)) and (month_of_death < CONVERT(VARCHAR,MONTH(@refdate)))) --died > 1 year ago
--group by a.PatID

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

--number of ANY codes AFTER a dead code
IF OBJECT_ID('tempdb..#noCodesAfterDeadCode') IS NOT NULL DROP TABLE #noCodesAfterDeadCode
CREATE TABLE #noCodesAfterDeadCode (PatID int, noCodesAfterDeadCode int);
insert into #noCodesAfterDeadCode
select a.PatID, COUNT(*) from SIR_ALL_Records as a
left outer join (select * from #latestDeadCode) as b on a.PatID = b.PatID
where EntryDate > latestDeadCodeDate
group by a.PatID

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

--practice list AS OF TODAY
IF OBJECT_ID('tempdb..#practiceList') IS NOT NULL DROP TABLE #practiceList
CREATE TABLE #practiceList (PatID int, pracID varchar(1000), age int, gender varchar(1), latestAnyCode varchar(512), latestAnyCodeDate date, latestDeadCode varchar(512), latestDeadCodeDate date, noCodesAfterDeadCode int, latestDeregCode varchar(512), latestDeregCodeDate date);
insert into #practiceList
select a.PatID, pracID, YEAR(@refdate) - year_of_birth, sex, latestAnyCode, latestAnyCodeDate, latestDeadCode, latestDeadCodeDate, noCodesAfterDeadCode, latestDeregCode, latestDeregCodeDate from #allPats as a
left outer join (select PatID, latestDeadCode, latestDeadCodeDate from #latestDeadCode) as b on a.PatID = b.PatID
left outer join (select PatID, latestDeregCode, latestDeregCodeDate from #latestDeregCode) as c on a.PatID = c.PatID
left outer join (select PatID, latestAnyCode, latestAnyCodeDate from #latestAnyCode) as d on a.PatID = d.PatID
left outer join (select patid, sex, year_of_birth from dbo.patients) as e on a.PatID = e.patid
left outer join (select * from #noCodesAfterDeadCode) as f on a.PatID = f.PatID
where 
	(
		noCodesAfterDeadCode is null or noCodesAfterDeadCode < 5 --either 0 or < 5 codes after dead code
--		latestDeadCodeDate is null 
--		or ((latestDeadCodeDate < latestAnyCodeDate) and (latestAnyCode not like '%telephone%' and latestAnyCode not like '%administration%')) --either not dead, or has other codes after dead codes
	)
	and (latestDeregCodeDate is null or (latestDeregCodeDate < latestAnyCodeDate)) --either not deregistered, or has other other codes after deregistered code

--practice list sizes AS OF TODAY
IF OBJECT_ID('tempdb..#practiceListSizes') IS NOT NULL DROP TABLE #practiceListSizes
CREATE TABLE #practiceListSizes (practiceId varchar(1000), practiceListSize int);
insert into #practiceListSizes 
select pracID, COUNT(*) from #practiceList as a
group by pracID

									----------------------------------------------
											------STROKE INCIDENCE (RAW)--------
												------AS A PROPORTION--------
									----------------------------------------------


--stroke incidence FOR EVERY PRACTICE ORDERED ASCENDING
IF OBJECT_ID('tempdb..#strokeIncidence') IS NOT NULL DROP TABLE #strokeIncidence
CREATE TABLE #strokeIncidence (practiceId varchar(1000), noStrokes int, practiceListSize int, strokeIncidence float);
insert into #strokeIncidence
select pracID, noStrokes, practiceListSize, 
	case
		when noStrokes is NULL then 0 --prevents null when no strokes
		else cast(noStrokes as float)/cast(practiceListSize as float) 
	end as strokeIncidence 
from #practiceListSizes as a
left outer join (select * from #strokePractices) as b on b.pracID = a.practiceId
order by strokeIncidence asc

					-----------------------------------------------------------------------------
					---------------------GET ABC (TOP 10% BENCHMARK)-----------------------------
					-----------------------------------------------------------------------------
declare @abc float;
set @abc = (select round(avg(perc),2) from (
select top 5 strokeIncidence as perc from #strokeIncidence
order by perc desc) sub);

					-----------------------------------------------------------------------------
					--DECLARE NUMERATOR, INDICATOR AND TARGET FROM DENOMINATOR TABLE-------------
					-----------------------------------------------------------------------------

									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
--CREATE TABLE #indicator (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float);
--insert into #indicator

select 'cvd.stroke.outcome', practiceId, CONVERT(char(10), @refdate, 126), noStrokes, practiceListSize, null, @abc from #strokeIncidence

									----------------------------------------------
									-------POPULATE MAIN DENOMINATOR TABLE--------
									----------------------------------------------
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.denominators](PatID, indicatorId, why)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#denominators') IS NOT NULL DROP TABLE #denominators
--CREATE TABLE #denominators (PatID int, indicatorId varchar(1000), why varchar(max));
--insert into #denominators

select a.PatID, 'cvd.stroke.outcome',
	case 
		when numberOfStrokesPerPatient = 0 or numberOfStrokesPerPatient is null then 'Patient has not had a stroke recorded in hospital in the last 12 months.'
		when numberOfStrokesPerPatient = 1 then 'Patient had a stroke recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + '.'
		when numberOfStrokesPerPatient = 2 then 'Patient had strokes recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + '.'
		when numberOfStrokesPerPatient = 3 then 'Patient had strokes recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, thirdLatestStrokeDate, 3)+ '.'
		when numberOfStrokesPerPatient = 4 then 'Patient had strokes recorded in hospital in the last 12 monthson ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, thirdLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, fourthLatestStrokeDate, 3) + '.'
		when numberOfStrokesPerPatient > 4 then 'Patient had more than 4 strokes recorded in hospital in the last 12 months. The latest was on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + '.'
	end
from #practiceList as a
left outer join (select * from #numberOfStrokesPerPatient) as b on a.PatID = b.PatID
left outer join (select * from #latestStrokeDate) as c on a.PatID = c.PatID
left outer join (select * from #secondLatestStrokeDate) as d on a.PatID = d.PatID
left outer join (select * from #thirdLatestStrokeDate) as e on a.PatID = e.PatID
left outer join (select * from #fourthLatestStrokeDate) as f on a.PatID = f.PatID

									----------------------------------------------
									-------DEFINE % POINTS PER PATIENT------------
									----------------------------------------------

declare @ptPercPoints float;
set @ptPercPoints = (select 100 / COUNT (*) from #practiceList);

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

--STROKE - CODED
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'strokeCoded' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numberOfStrokesPerPatient as a
left outer join (select * from #numberOfPrimCareStrokesPerPatient) as b on b.PatID = a.PatID
where numberOfStrokesPerPatient is not null and numberOfPrimCareStrokesPerPatient is not null

union
--STROKE - UNCODED
select a.PatID,
	'cvd.stroke.outcome' as indicatorId,
	'strokeUncoded' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	5 as priority,
	'Record ''' + latestStrokeCode + ''' (using code ' + latestStrokeRead + '[' + latestStrokeRead + ']) on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + '.' as actionText,
	'Reasoning' +
		'<ul><li>'+
		case 
			when numberOfStrokesPerPatient = 1 then 'Patient had a stroke recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + '.'
			when numberOfStrokesPerPatient = 2 then 'Patient had strokes recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + '.'
			when numberOfStrokesPerPatient = 3 then 'Patient had strokes recorded in hospital in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, thirdLatestStrokeDate, 3)+ '.'
			when numberOfStrokesPerPatient = 4 then 'Patient had strokes recorded in hospital in the last 12 monthson ' + CONVERT(VARCHAR, latestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, secondLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, thirdLatestStrokeDate, 3) + ' and ' + CONVERT(VARCHAR, fourthLatestStrokeDate, 3) + '.'
			when numberOfStrokesPerPatient > 4 then 'Patient had more than 4 strokes recorded in hospital in the last 12 months. The latest was on ' + CONVERT(VARCHAR, latestStrokeDate, 3) + '.'
		end + '</li>' +
		'<li>But there is no recorded stroke in the GP record.</li>'
	as supportingText
from #numberOfStrokesPerPatient as a
left outer join (select * from #numberOfPrimCareStrokesPerPatient) as b on b.PatID = a.PatID
left outer join (select * from #latestStrokeDate) as c on c.PatID = a.PatID
left outer join (select * from #secondLatestStrokeDate) as d on d.PatID = a.PatID
left outer join (select * from #thirdLatestStrokeDate) as e on e.PatID = a.PatID
left outer join (select * from #fourthLatestStrokeDate) as f on f.PatID = a.PatID
where numberOfStrokesPerPatient is not null and numberOfPrimCareStrokesPerPatient is null

							---------------------------------------------------------------
							---------------SORT ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--STROKE - UNCODED
select pracID, 'strokeUncoded', 
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'strokeUncoded' then 1.0 else 0.0 end) --no of uncoded strokes
	/SUM(case when indicatorId = 'cvd.stroke.outcome' then 1.0 else 0.0 end), --out of total no of strokes
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'strokeUncoded' then 1.0 else 0.0 end),
	SUM(case when indicatorId = 'cvd.stroke.outcome' and actionCat = 'strokeUncoded' then 1.0 else 0.0 end)*@ptPercPoints
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

--CODE HTN
select
	pracID as pracID,
	'cvd.stroke.outcome' as indicatorId,
	'RemindToCodeStrokes' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to code strokes in GP record from hospital discharge summaries' as actionText,
	'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
	+ '%) of who have had a stroke recorded in hospital in the last 12 months have not had this recorded in the GP record.</li>' +
	'<li>You may wish to bring this up in your next practice meeting, or send a group message to all staff.</li></ul>'
from #reasonProportions
where proportionId = 'strokeUncoded' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--overview tab
('cvd.stroke.outcome','name','Strokes in hospital - last 12 months'), --overview table name
('cvd.stroke.outcome','tabText','Strokes in hospital'), --indicator tab text
('cvd.stroke.outcome','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients who have had a stroke recorded in hospital in the past 12 months.<br>'),
--indicator tab
--summary text
('cvd.stroke.outcome','tagline','of patients on your practice list had a stroke recorded in hospital in the past 12 months.'),
('cvd.stroke.outcome','positiveMessage', null), --tailored text
--	case 
--		when @indicatorScore >= @target and @indicatorScore >= @abc then 'Fantastic! You’ve achieved the Target <i>and</i> you’re in the top 10% of practices in Salford for this indicator!'
--		when @indicatorScore >= @target and @indicatorScore < @abc then 'Well done! You’ve achieved the Target! To improve even further, look through the recommended actions on this page and for the patients below.'
--		else 'You''ve not yet achieved the Target - but don''t be disheartened: Look through the recommended actions on this page and for the patients below for ways to improve.'
--	end),
--pt lists
('cvd.stroke.outcome','valueId','strokeHosp'),
('cvd.stroke.outcome','valueName','Latest stroke date'),
('cvd.stroke.outcome','dateORvalue','date'),
('cvd.stroke.outcome','valueSortDirection','desc'),  -- 'asc' or 'desc'
('cvd.stroke.outcome','tableTitle','All patients who have had a stroke recorded in hospital in the last 12 months '),

--imp opp charts
--based on actionCat

--STROKE - CODED
('cvd.stroke.outcome','opportunities.strokeCoded.name','Stroke - Coded'),
('cvd.stroke.outcome','opportunities.strokeCoded.description','Patients with a stroke recorded in hospital in the last 12 months that has been recorded in the GP record.'),
('cvd.stroke.outcome','opportunities.strokeCoded.positionInBarChart','2'),

--STROKE UNCODED
('cvd.stroke.outcome','opportunities.strokeUncoded.name','Stroke - Uncoded'),
('cvd.stroke.outcome','opportunities.strokeUncoded.description','Patients with a stroke recorded in hospital in the last 12 months that has <strong>NOT</strong> been recorded in the GP record.'),
('cvd.stroke.outcome','opportunities.strokeUncoded.positionInBarChart','1');
