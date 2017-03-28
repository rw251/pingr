--v2
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
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;

									----------------------------------------------
											-------NO OF STROKES--------
											-------IN THE LAST YEAR--------
									----------------------------------------------

--latest stroke code in last year IN HOSPITAL RECORD
IF OBJECT_ID('tempdb..#latestStrokeHosp') IS NOT NULL DROP TABLE #latestStrokeHosp
CREATE TABLE #latestStrokeHosp (PatID int, latestStrokeHospDate date, latestStrokeHosp varchar(512), latestStrokeHospCode varchar(512));
insert into #latestStrokeHosp
select a.PatID, latestStrokeHospDate, MAX(Rubric), MAX(ReadCode) from SIR_ALL_Records as a
	inner join (
		select PatID, MAX(EntryDate) as latestStrokeHospDate from SIR_ALL_Records
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
		and EntryDate < @refdate
		and EntryDate > DATEADD(month, -12, @refdate)
		and Source = 'salfordt'
		group by PatID
	) as b on b.PatID = a.PatID and b.latestStrokeHospDate = a.EntryDate
where ReadCode  in (select code from codeGroups where [group] in ('strokeQof'))
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
and Source = 'salfordt'
group by a.PatID, latestStrokeHospDate

--latest stroke code in last year IN GP RECORD
IF OBJECT_ID('tempdb..#latestStrokeGp') IS NOT NULL DROP TABLE #latestStrokeGp
CREATE TABLE #latestStrokeGp (PatID int, latestStrokeGpDate date, latestStrokeGp varchar(512), latestStrokeGpCode varchar(512));
insert into #latestStrokeGp
select a.PatID, latestStrokeGpDate, MAX(Rubric), MAX(ReadCode) from SIR_ALL_Records as a
	inner join (
		select PatID, MAX(EntryDate) as latestStrokeGpDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] in ('strokeQof'))
		and EntryDate < @refdate
		and EntryDate > DATEADD(month, -12, @refdate)
		and Source != 'salfordt'
		group by PatID
	) as b on b.PatID = a.PatID and b.latestStrokeGpDate = a.EntryDate
where ReadCode  in (select code from codeGroups where [group] in ('strokeQof'))
and Source != 'salfordt'
group by a.PatID, latestStrokeGpDate

--combined strokes latest stroke list code in last year FROM HOSPITAL AND GP RECORD
IF OBJECT_ID('tempdb..#latestStrokeCombined') IS NOT NULL DROP TABLE #latestStrokeCombined
CREATE TABLE #latestStrokeCombined (PatID int, latestStrokeGpDate date, latestStrokeHospDate date, latestStrokeGp varchar(512), latestStrokeHosp varchar(512), latestStrokeGpCode varchar(512), latestStrokeHospCode varchar(512), pracID varchar(10));
insert into #latestStrokeCombined
select case when a.PatID is not null then a.PatID else b.PatID end, latestStrokeGpDate, latestStrokeHospDate, latestStrokeGp, latestStrokeHosp, latestStrokeGpCode, latestStrokeHospCode, gpcode from #latestStrokeGp as a
full outer join (select * from #latestStrokeHosp) as b on b.PatID = a.PatID
left outer join (select patid, gpcode from patients) as c on c.patid = case when a.PatID is not null then a.PatID else b.PatID end

--no of PATIENTS with strokes per practice this year
IF OBJECT_ID('tempdb..#strokePractices') IS NOT NULL DROP TABLE #strokePractices
CREATE TABLE #strokePractices (pracID varchar(1000), noStrokes int);
insert into #strokePractices 
select pracID, COUNT(*) from #latestStrokeCombined as a
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
from practiceListSizes as a
left outer join (select * from #strokePractices) as b on b.pracID = a.practiceId  collate Latin1_General_100_CI_AS
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
		when a.PatID in (select PatID from #latestStrokeCombined) and latestStrokeGpDate is not null then 'Patient had a stroke in the last 12 months on ' + CONVERT(VARCHAR, latestStrokeGpDate, 3) + '.'
		when a.PatID in (select PatID from #latestStrokeCombined) and latestStrokeGpDate is null then 'Patient had a stroke in the last 12 months <strong>recorded in hospital (but not the GP record)</strong> on ' + CONVERT(VARCHAR, latestStrokeHospDate, 3) + '.'
		else 'Patient has not had a stroke in the last 12 months.'
	end
from practiceList as a
left outer join (select * from #latestStrokeCombined) as b on a.PatID = b.PatID

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
									--TO RUN AS STORED PROCEDURE--
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonNumber, pointsPerAction, priority, actionText, supportingText)

									--TO TEST ON THE FLY--
--IF OBJECT_ID('tempdb..#patActions') IS NOT NULL DROP TABLE #patActions
--CREATE TABLE #patActions
--	(PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max));
--insert into #patActions

--STROKE - CODED
select PatID,
	'cvd.stroke.outcome' as indicatorId,
	'strokeCoded' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #latestStrokeCombined
where latestStrokeGp is not null

union
--STROKE - UNCODED
select PatID,
	'cvd.stroke.outcome' as indicatorId,
	'strokeUncoded' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	5 as priority,
	'Record ''' + latestStrokeHosp + ''' (using code ' + latestStrokeHospCode + '[' + latestStrokeHospCode + ']) on ' + CONVERT(VARCHAR, latestStrokeHospDate, 3) + '.' as actionText,
	'Reasoning' +
		'<ul>'+
			'<li>Patient had a stroke recorded in hospital on ' + CONVERT(VARCHAR, latestStrokeHospDate, 3) + '.</li>'+
			'<li>This does not seem to appear in the GP record.</li>'+
		'</ul>'
	as supportingText
from #latestStrokeCombined as a
where latestStrokeGp is null

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

--CODE STROKE
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
('cvd.stroke.outcome','name','Strokes in hospital - last 12 months (beta testing)'), --overview table name
('cvd.stroke.outcome','tabText','Strokes in hospital'), --indicator tab text
('cvd.stroke.outcome','description', --'show more' on overview tab
	'<strong>Definition:</strong> Patients who have had a stroke recorded in hospital in the past 12 months on your practice list.<br>'+
	'<strong>NB:</strong> Your practice list may appear 1-2% smaller than indicated due to opt outs from data sharing agreements'),
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
