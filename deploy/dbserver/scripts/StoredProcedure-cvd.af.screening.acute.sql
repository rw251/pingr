--Perform manual pulse palpation for the presence of an irregular pulse that may indicate underlying atrial fibrillation in people presenting with any of the following:
--Breathlessness/dyspnoea
--Palpitations
--Syncope/dizziness
--Chest discomfort
--Stroke/ transient ischemic attack
--Confirm the diagnosis of AF with ECG


									--TO RUN AS STORED PROCEDURE--
IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.cvd.af.screeningAcute') DROP PROCEDURE [pingr.cvd.af.screeningAcute];
GO
CREATE PROCEDURE [pingr.cvd.af.screeningAcute] @refdate VARCHAR(10), @JustTheIndicatorNumbersPlease bit = 0
AS
SET NOCOUNT ON

									--TO TEST ON THE FLY--
--use PatientSafety_Records_Test
--declare @refdate VARCHAR(10);
--declare @JustTheIndicatorNumbersPlease bit;
--set @refdate = '2016-11-17';
--set @JustTheIndicatorNumbersPlease= 0;


declare @startDate datetime;
set @startDate = (select case
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-04-01' --1st April THIS YEAR
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-04-01' end); --1st April LAST YEAR

declare @endDate datetime;
set @endDate = (select case
	when MONTH(@refdate) >3 then CONVERT(VARCHAR,YEAR(@refdate)) + '-12-31' --31st Dec THIS YEAR
	when MONTH(@refdate) <4 then CONVERT(VARCHAR,(YEAR(@refdate) - 1)) + '-12-31' end); --31st Dec LAST YEAR

declare @daysLeft int;
set @daysLeft = (select DATEDIFF(day,@refdate,@endDate))

										-----------------------
										--ELIGIBLE POPULATION--
										-----------------------
-->=54
--from TODAY
IF OBJECT_ID('tempdb..#over54') IS NOT NULL DROP TABLE #over54
CREATE TABLE #over54 (PatID int);
insert into #over54
select PatID from practiceList as a
where age > 54

--latestAfCode
IF OBJECT_ID('tempdb..#latestAfCode') IS NOT NULL DROP TABLE #latestAfCode
CREATE TABLE #latestAfCode (PatID int, latestAfCodeDate date, latestAfCode varchar(512));
insert into #latestAfCode
select s.PatID, latestAfCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'af')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'af')
and s.PatID in (select PatID from #over54)
group by s.PatID, latestAfCodeDate

--latestAfTempExCode
IF OBJECT_ID('tempdb..#latestAfTempExCode') IS NOT NULL DROP TABLE #latestAfTempExCode
CREATE TABLE #latestAfTempExCode (PatID int, latestAfTempExCodeDate date, latestAfTempExCode varchar(512));
insert into #latestAfTempExCode
select s.PatID, latestAfTempExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfTempExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'afTempEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfTempExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'afTempEx')
and s.PatID in (select PatID from #over54)
group by s.PatID, latestAfTempExCodeDate

--latestAfPermExCode
IF OBJECT_ID('tempdb..#latestAfPermExCode') IS NOT NULL DROP TABLE #latestAfPermExCode
CREATE TABLE #latestAfPermExCode (PatID int, latestAfPermExCodeDate date, latestAfPermExCode varchar(512));
insert into #latestAfPermExCode
select s.PatID, latestAfPermExCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAfPermExCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'afPermEx')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAfPermExCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'afPermEx')
and s.PatID in (select PatID from #over54)
group by s.PatID, latestAfPermExCodeDate

--latestAnySxCode
IF OBJECT_ID('tempdb..#latestAnySxCode') IS NOT NULL DROP TABLE #latestAnySxCode
CREATE TABLE #latestAnySxCode (PatID int, latestAnySxCodeDate date, latestAnySxCode varchar(512));
insert into #latestAnySxCode
select s.PatID, latestAnySxCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestAnySxCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] in ('tiaQof','strokeIsch','cp', 'syncope', 'palps', 'sob', 'hfQof'))
		and Source != 'salfordt'
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestAnySxCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] in ('tiaQof','strokeIsch','cp', 'syncope', 'palps', 'sob','hfQof'))
and Source != 'salfordt'
and s.PatID in (select PatID from #over54)
group by s.PatID, latestAnySxCodeDate

										-----------------------
										------DENOMINATOR------
										-----------------------
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
CREATE TABLE #denominator (PatID int);
insert into #denominator
select a.PatID from #over54 as a 
left outer join (select * from #latestAnySxCode) as b on b.PatID = a.PatID
left outer join (select * from #latestAfCode) as l on l.PatID = a.PatID
left outer join (select * from #latestAfPermExCode) as m on m.PatID = a.PatID
left outer join (select * from #latestAfTempExCode) as n on n.PatID = a.PatID
where latestAnySxCodeDate >= @startDate
	and (latestAfCodeDate is null or (latestAfCodeDate < latestAfPermExCodeDate))
	and (latestAfTempExCodeDate is null or (latestAfTempExCodeDate < @startDate))

										-----------------------
										-------NUMERATOR-------
										-----------------------
--latestPulseRhythmCode
IF OBJECT_ID('tempdb..#latestPulseRhythmCode') IS NOT NULL DROP TABLE #latestPulseRhythmCode
CREATE TABLE #latestPulseRhythmCode (PatID int, latestPulseRhythmCodeDate date, latestPulseRhythmCode varchar(512));
insert into #latestPulseRhythmCode
select s.PatID, latestPulseRhythmCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPulseRhythmCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'pulseRhythm')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPulseRhythmCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'pulseRhythm')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestPulseRhythmCodeDate

--latestEcgCode
IF OBJECT_ID('tempdb..#latestEcgCode') IS NOT NULL DROP TABLE #latestEcgCode
CREATE TABLE #latestEcgCode (PatID int, latestEcgCodeDate date, latestEcgCode varchar(512));
insert into #latestEcgCode
select s.PatID, latestEcgCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestEcgCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] = 'ecg')
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestEcgCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] = 'ecg')
and s.PatID in (select PatID from #denominator)
group by s.PatID, latestEcgCodeDate

--numerator
IF OBJECT_ID('tempdb..#numerator') IS NOT NULL DROP TABLE #numerator
CREATE TABLE #numerator (PatID int, numerator int);
insert into #numerator
select a.PatID, 
case 
	when latestPulseRhythmCodeDate >= latestAnySxCodeDate or latestEcgCodeDate >= latestAnySxCodeDate then 1 
else 0 end 
from #denominator as a
left outer join (select * from #latestPulseRhythmCode) as b on b.PatID = a.PatID
left outer join (select * from #latestEcgCode) as c on c.PatID = a.PatID
left outer join (select * from #latestAnySxCode) as d on d.PatID = a.PatID


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

select 'cvd.af.screeningAcute', a.pracID, CONVERT(char(10), @refdate, 126), 
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

select a.PatID, 'cvd.af.screeningAcute',
		'<ul>'+
		'<li>Patient presented with <strong>''' + latestAnySxCode + ''' on ' + CONVERT(VARCHAR, latestAnySxCodeDate, 3) + '</strong>.</li>'+
		case 
			when numerator = 0 then '<li>They have not had their pulse rhythm assessed since.</li>' 
			when latestPulseRhythmCodeDate >= latestAnySxCodeDate then '<li>Latest pulse rhythm assessment was on ' + CONVERT(VARCHAR, latestPulseRhythmCodeDate, 3) + '.</li>'
			when latestEcgCodeDate >= latestAnySxCodeDate then '<li>Latest pulse rhythm assessment was on ' + CONVERT(VARCHAR, latestPulseRhythmCodeDate, 3) + '.</li>'
		end,
		DATEADD(year, 1, l.latestAnnualReviewCodeDate)
from #numerator as a
left outer join (select * from #latestAnySxCode) as b on b.PatID = a.PatID
left outer join (select * from #latestPulseRhythmCode) as k on k.PatID = a.PatID
left outer join (select * from #latestEcgCode) as c on c.PatID = a.PatID
left outer join latestAnnualReviewCode l on l.PatID = a.PatID


								---------------------------------------------------------
								-- Exit if we're just getting the indicator numbers -----
								---------------------------------------------------------
IF @JustTheIndicatorNumbersPlease = 1 RETURN;

					-----------------------------------------------------------------------------
					--------------------------IMPROVEMENT OPPS DATA------------------------------
					-----------------------------------------------------------------------------
--latestSobCode
IF OBJECT_ID('tempdb..#latestSobCode') IS NOT NULL DROP TABLE #latestSobCode
CREATE TABLE #latestSobCode (PatID int, latestSobCode varchar(512));
insert into #latestSobCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'sob')
group by s.PatID

--latestPalpsCode
IF OBJECT_ID('tempdb..#latestPalpsCode') IS NOT NULL DROP TABLE #latestPalpsCode
CREATE TABLE #latestPalpsCode (PatID int,  latestPalpsCode varchar(512));
insert into #latestPalpsCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'palps')
group by s.PatID

--latestSyncopeCode
IF OBJECT_ID('tempdb..#latestSyncopeCode') IS NOT NULL DROP TABLE #latestSyncopeCode
CREATE TABLE #latestSyncopeCode (PatID int, latestSyncopeCode varchar(512));
insert into #latestSyncopeCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'syncope')
group by s.PatID

--latestChestPainCode
IF OBJECT_ID('tempdb..#latestChestPainCode') IS NOT NULL DROP TABLE #latestChestPainCode
CREATE TABLE #latestChestPainCode (PatID int, latestChestPainCode varchar(512));
insert into #latestChestPainCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'cp')
group by s.PatID

--latestStrokeIschCode
IF OBJECT_ID('tempdb..#latestStrokeIschCode') IS NOT NULL DROP TABLE #latestStrokeIschCode
CREATE TABLE #latestStrokeIschCode (PatID int, latestStrokeIschCode varchar(512));
insert into #latestStrokeIschCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'strokeIsch')
group by s.PatID

--latestTiaCode
IF OBJECT_ID('tempdb..#latestTiaCode') IS NOT NULL DROP TABLE #latestTiaCode
CREATE TABLE #latestTiaCode (PatID int, latestTiaCode varchar(512));
insert into #latestTiaCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'tiaQof')
group by s.PatID

--latestHfCode
IF OBJECT_ID('tempdb..#latestHfCode') IS NOT NULL DROP TABLE #latestHfCode
CREATE TABLE #latestHfCode (PatID int, latestHfCode varchar(512));
insert into #latestHfCode
select s.PatID, MAX(Rubric) from SIR_ALL_Records as s
left outer join (select * from #latestAnySxCode) as a on a.PatID = s.PatID
where s.PatID in (select PatID from #numerator where numerator = 0)
and EntryDate = latestAnySxCodeDate
and ReadCode in (select code from codeGroups where [group] = 'hfQof')
group by s.PatID

--latestPulseRateCode
IF OBJECT_ID('tempdb..#latestPulseRateCode') IS NOT NULL DROP TABLE #latestPulseRateCode
CREATE TABLE #latestPulseRateCode (PatID int, latestPulseRateCodeDate date, latestPulseRateCode varchar(512));
insert into #latestPulseRateCode
select s.PatID, latestPulseRateCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestPulseRateCodeDate from SIR_ALL_Records
		where ReadCode like '242%'
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestPulseRateCodeDate = s.EntryDate
where ReadCode like '242%'
and s.PatID in (select PatID from #numerator where numerator = 0)
group by s.PatID, latestPulseRateCodeDate

--latestBpCode
IF OBJECT_ID('tempdb..#latestBpCode') IS NOT NULL DROP TABLE #latestBpCode
CREATE TABLE #latestBpCode(PatID int, latestBpCodeDate date, latestBpCode varchar(512));
insert into #latestBpCode
select s.PatID, latestBpCodeDate, MAX(Rubric) from SIR_ALL_Records as s
	inner join (
		select PatID, MAX(EntryDate) as latestBpCodeDate from SIR_ALL_Records
		where ReadCode in (select code from codeGroups where [group] in ('bp','sbp','dbp'))
		group by PatID
	) sub on sub.PatID = s.PatID and sub.latestBpCodeDate = s.EntryDate
where ReadCode in (select code from codeGroups where [group] in ('bp','sbp','dbp'))
and s.PatID in (select PatID from #numerator where numerator = 0)
group by s.PatID, latestBpCodeDate

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

--ALL PATIENTS
-->SEND LETTER
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Send letter' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Send letter to request pulse rhythm assessment using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient presented with ''' + latestAnySxCode + ''' on ' + CONVERT(VARCHAR, latestAnySxCodeDate, 3) + '.</li>'+
		'<li><strong>They have not had their pulse rhythm assessed since.</li></strong>'+
		'<li><a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE recommends they should have their pulse rhythm assessed to rule out AF</a>.</li>'+
		'<li>Use code 243.. [243..] to record pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from #latestAnySxCode) as b on b.PatID = a.PatID
left outer join (select * from #latestPulseRhythmCode) as k on k.PatID = a.PatID
where numerator = 0

union
--NO PRIM CARE CONTACT IN THE LAST YEAR
-->CHECK REGISTERED
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Registered?' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Check this patient is registered' as actionText,
	'Reasoning' +
		'<ul><li>No contact with your practice in the last year.</li>' +
		'<li>If <strong>not registered</strong> please add code <strong>92...</strong> [92...] to their records.</li>' +
		'<li>If <strong>dead</strong> please add code <strong>9134.</strong> [9134.] to their records.</li></ul>'
	as supportingText
from #numerator as a
left outer join (select PatID, latestPrimCareContactDate from latestPrimCareContact) as b on b.PatID = a.PatID
where numerator = 0
and latestPrimCareContactDate < DATEADD(year, -1, @refdate)

union
--REGULAR F2F CONTACT
-->DO WHEN NEXT COMES IN
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on medical record to assess pulse rhythm at next face-to-face contact using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfF2fContactsInLastYear, 3) + ' face-to-face contacts with your practice in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, @daysLeft, 3) + ' days left until the end of the financial year.</li>'+
		'<li>Patient is expected to have ' + CONVERT(VARCHAR, (noOfF2fContactsInLastYear*@daysLeft/365), 3) + ' further face-to-face contacts with your practice before then.</li>'+
		'<li>You could put a note in their record to remind the next person to see them to assess their pulse rhythm.</li>'+
		'<li>Either as an alert when you open the record, or as a consultation note.</li>'+
		'<li>Use code 243.. [243..] to record pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from noOfF2fContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfF2fContactsInLastYear*@daysLeft/365) >= 1

union
--REGULAR MEDS - PUT ON PX
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Prescription note' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on repeat prescriptions to ask patient to book appointment for pulse rhythm assessment' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has had ' + CONVERT(VARCHAR, noOfMedContactsInLastYear, 3) + ' medication prescriptions from you in the last year.</li>'+
		'<li>There are ' + CONVERT(VARCHAR, @daysLeft, 3) + ' days left until the end of the financial year.</li>'+
		'<li>Patient is expected to have ' + CONVERT(VARCHAR, (noOfMedContactsInLastYear*@daysLeft/365), 3) + ' further prescriptions from your practice before then.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from noOfMedContactsInLastYear) as b on b.PatID = a.PatID
where numerator = 0
and (noOfMedContactsInLastYear*@daysLeft/365) >= 1

union
--HASN'T YET HAD THEIR ANNUAL REVIEW
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Opportunistic' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Put note on medical record to assess pulse rhythm at annual review using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient has not yet had any annual reviews for their chronic diseases this financial year.</li>'+
		'<li>You could put a note in their record to remind the person who will do their annual review to assess their pulse rhythm.</li>'+
		'<li>Either as an alert when you open the record, or as a consultation note.</li>'+
		'<li>Use code 243.. [243..] to record the pulse rhythm.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestAnnualReviewCode) as b on b.PatID = a.PatID
where numerator = 0
and latestAnnualReviewCodeDate < @startDate

union
--HASN'T YET HAD THEIR FLU VACC
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'flu vacc' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	2 as priority,
	'Assess pulse rhythm at upcoming flu vaccination using code 243.. [243..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient is eligible for flu vaccination (>64 years old).</li>'+
		'<li>They haven''t any allergies or refusals, and haven''t had their flu vaccination this year yet.</li>'+
		'<li>Patients are eligible for flu vaccinations from August onwards.</li>'+
		'<li>Use code 243.. [243..] to record the pulse rhythm .</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestFluVacc) as b on b.PatID = a.PatID
left outer join (select * from latestFluVaccTempEx) as c on c.PatID = a.PatID
left outer join (select * from latestFluVaccPermEx) as d on d.PatID = a.PatID
where numerator = 0
and (latestFluVaccDate is null or latestFluVaccDate < @refdate)
and (latestFluVaccTempExDate is null or latestFluVaccTempExDate < @startDate)
and (latestFluVaccPermExDate is null or latestFluVaccPermExDate < latestFluVaccDate)
and @daysLeft < 122 --only appears later than august to coincide with flu vacc season 1/9/17 -> 1/1/18 = 122

union

--SUGGEST EXCLUDE
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Suggest exclude' as actionCat,
	1 as reasonNumber,
	@ptPercPoints as pointsPerAction,
	1 as priority,
	'Exclude patient from AF casefinding indicators using code 9hF.. [9hF..]' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>Patient is receiving palliative care.</li>'+
		'<li>They had palliative care code in their record in the last 12 months (''' + latestPalCode collate Latin1_General_100_CS_AS + ''') on ' + CONVERT(VARCHAR, latestPalCodeDate, 3) + '.</li>'+
		'</ul>'
	as supportingText
from #numerator as a
left outer join (select * from latestPalCode) as b on b.PatID = a.PatID 
left outer join (select * from latestPalPermExCode) as c on c.PatID = a.PatID 
where numerator = 0
and latestPalCodeDate > DATEADD(year, -1, @refdate) and (latestPalPermExCodeDate is null or latestPalPermExCodeDate < latestPalCodeDate)

union
--sob
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'sob' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestSobCode) as b on b.PatID = a.PatID
where numerator = 0
and latestSobCode is not null

union
--palps
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'palps' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestPalpsCode) as b on b.PatID = a.PatID
where numerator = 0
and latestPalpsCode is not null

union
--syncope
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'syncope' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestSyncopeCode) as b on b.PatID = a.PatID
where numerator = 0
and latestSyncopeCode is not null

union
--chest pain
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'ChestPain' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestChestPainCode) as b on b.PatID = a.PatID
where numerator = 0
and latestChestPainCode is not null

union
--StrokeIsch
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'StrokeIsch' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestStrokeIschCode) as b on b.PatID = a.PatID
where numerator = 0
and latestStrokeIschCode is not null

union
--Tia
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Tia' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestTiaCode) as b on b.PatID = a.PatID
where numerator = 0
and latestTiaCode is not null

union
--Hf
select a.PatID,
	'cvd.af.screeningAcute' as indicatorId,
	'Hf' as actionCat,
	null as reasonNumber,
	null as pointsPerAction,
	null as priority,
	null as actionText,
	null as supportingText
from #numerator as a
left outer join (select * from #latestHfCode) as b on b.PatID = a.PatID
where numerator = 0
and latestHfCode is not null

							---------------------------------------------------------------
							---------------ORG-LEVEL ACTION PRIORITY ORDER------------
							---------------------------------------------------------------

IF OBJECT_ID('tempdb..#reasonProportions') IS NOT NULL DROP TABLE #reasonProportions
CREATE TABLE #reasonProportions
	(pracID varchar(32), proportionId varchar(32), proportion float, numberPatients int, pointsPerAction float);
insert into #reasonProportions

--PTS WHO HAVE HAD PULSE RATE CHECKED SINCE LAST SX DATE
select c.pracID, 'pulseRateChecked', 
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator in (0,1) then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestPulseRateCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestPulseRateCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
left outer join (select * from #latestAnySxCode) as d on d.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PTS WHO HAVE HAD BP CHECKED SINCE SINCE LAST SX DATE
select c.pracID, 'bpChecked', 
	SUM(case when numerator = 0 and latestBpCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator in (0,1) then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestBpCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestBpCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestBpCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
left outer join (select * from #latestAnySxCode) as d on d.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PTS WHO HAVE HAD ANNUAL REVIEWS SINCE LAST SX DATE
select c.pracID, 'annualReview', 
	SUM(case when numerator = 0 and latestAnnualReviewCodeDate >= latestAnySxCodeDate then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator in (0,1) then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and (latestAnnualReviewCodeDate is null or latestAnnualReviewCodeDate < latestAnySxCodeDate) then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and (latestAnnualReviewCodeDate is null or latestAnnualReviewCodeDate < latestAnySxCodeDate) then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from latestAnnualReviewCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
left outer join (select * from #latestAnySxCode) as d on d.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--flu clinics
select e.pracID, 'fluVaccs', 
	SUM(case when indicatorId = 'cvd.af.screeningAcute' and actionCat = 'flu vacc' then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator in (0,1) then 1.0 else 0.0 end),0),
	SUM(case when indicatorId = 'cvd.af.screeningAcute' and actionCat = 'flu vacc' then 1.0 else 0.0 end),	
	SUM(case when indicatorId = 'cvd.af.screeningAcute' and actionCat = 'flu vacc' then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from [output.pingr.patActions]) as b on b.PatID = a.PatID
left outer join ptPractice as e on e.PatID = a.PatID
group by e.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0
and @daysLeft < 122 --only appears later than august to coincide with flu vacc season

union
--PROPORTION OF LATEST SX THAT ARE SOB THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'sob',
	SUM(case when numerator = 0 and latestSobCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestSobCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestSobCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestSobCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE palps THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'palps', 
	SUM(case when numerator = 0 and latestPalpsCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestPalpsCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestPalpsCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestPalpsCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE Syncope THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'Syncope', 
	SUM(case when numerator = 0 and latestSyncopeCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestSyncopeCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestSyncopeCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestSyncopeCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE ChestPain THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'ChestPain', 
	SUM(case when numerator = 0 and latestChestPainCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestChestPainCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestChestPainCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestChestPainCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE StrokeIsch THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'StrokeIsch', 
	SUM(case when numerator = 0 and latestStrokeIschCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestStrokeIschCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestStrokeIschCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestStrokeIschCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE Tia THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'Tia', 
	SUM(case when numerator = 0 and latestTiaCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestTiaCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestTiaCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestTiaCode) as b on b.PatID = a.PatID
left outer join ptPractice as c on c.PatID = a.PatID
group by c.pracID
having SUM(case when numerator in (0,1) then 1.0 else 0.0 end) > 0 --where denom is not 0

union
--PROPORTION OF LATEST SX THAT ARE HF THAT ARE NOT MEETING NUMERATOR
select c.pracID, 'Hf', 
	SUM(case when numerator = 0 and latestHfCode is not null then 1.0 else 0.0 end)
	/
	NULLIF(SUM(case when numerator = 0 then 1.0 else 0.0 end),0),
	SUM(case when numerator = 0 and latestHfCode is not null then 1.0 else 0.0 end),	
	SUM(case when numerator = 0 and latestHfCode is not null then 1.0 else 0.0 end)*@ptPercPoints
from #numerator as a
left outer join (select * from #latestHfCode) as b on b.PatID = a.PatID
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
	'cvd.af.screeningAcute' as indicatorId,
	'pulse rate' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when measuring pulse rate to casefind AF' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment to casefind AF <strong>have</strong> had their pulse rate measured.</li>' +
		'<li>Measuring pulse rate is a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'pulseRateChecked' 

union
--REMIND STAFF TO CHECK RHYTHM DURING BP MEASUREMENTS
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'bp measure' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when measuring blood pressure to casefind AF' as actionText,
	'Reasoning' +
		'<ul><li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment to casefind AF <strong>have</strong> had their BP measured.</li>' +
		'<li>Measuring BP is a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'bpChecked' 

union
--REMIND STAFF TO CHECK RHYTHM DURING ANNUAL REVIEWS
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'annual reviews' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Remind staff to assess patients'' pulse rhythm when doing chronic disease annual reviews to casefind AF' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>All patients who require a pulse rhythm assessment to casefind AF (according to NICE) should <strong>also</strong> have a chronic disease annual review.</li>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment <strong>have not</strong> yet had their chronic disease annual review.</li>' +
		'<li>Chronic disease annual reviews are a good opportunity to assess pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'annualReview' 

union
--ASSESS RHYTHM DURING FLU VACCS
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'flu vaccs' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	3 as priority,
	'Assess pulse rhythm to casefind AF during flu vaccination clinics' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>All patients who require a pulse rhythm assessment to casefind AF (according to NICE) are <strong>also</strong> eligible for flu vaccinations.</li>'+
		'<li>Flu vaccination season runs from August onwards.</li>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who require a pulse rhythm assessment <strong>have not</strong> yet had their flu vaccination this year.</li>' +
		'<li>Flu vaccination clinics are good opportunities to assess patient''s pulse rhythm.</li>'+
		'</ul>'
from #reasonProportions
where proportionId = 'fluVaccs' 

union
--SOB
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'sob' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient presents with shortness of breath' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with <strong>shortness of breath</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'sob' 

union
--palps
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'palps' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient presents with palpitations' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with <strong>palpitations</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'palps'

union
--Syncope
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'Syncope' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient presents with syncope or dizziness' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with <strong>syncope or dizziness</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'Syncope' 

union
--ChestPain
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'ChestPain' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient presents with chest pain' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with <strong>chest pain</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'ChestPain' 

union
--Ischaemic stroke
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'StrokeIsch' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient has had an ishaemic stroke' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with an <strong>ischaemic stroke</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'StrokeIsch' 

union
--TIA
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'Tia' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient has had a TIA' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with a <strong>TIA</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'Tia' 

union
--HF
select
	pracID as pracID,
	'cvd.af.screeningAcute' as indicatorId,
	'Hf' as actionCat,
	proportion as proportion,
	numberPatients as numberPatients,
	pointsPerAction as pointsPerAction,
	1 as priority,
	'Remind clinical staff to check pulse rhythm when a patient has developed heart failure' as actionText,
	'Reasoning' +
		'<ul>'+
		'<li>' + STR(numberPatients) + ' (' + STR(proportion*100) 
		+ '%) of patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> presented with <strong>heart failure</strong>.</li>' +
		'</ul>'
from #reasonProportions
where proportionId = 'Hf' 

							---------------------------------------------------------------
							----------------------TEXT FILE OUTPUTS------------------------
							---------------------------------------------------------------
insert into [pingr.text] (indicatorId, textId, text)

values
--OVERVIEW TAB
('cvd.af.screeningAcute','name','AF Casefinding 2: Patients with acute presentations'), --overview table name
('cvd.af.screeningAcute','tabText','AF Casefinding 2: Acute presentations'), --indicator tab text
('cvd.af.screeningAcute','description', --'show more' on overview tab
	'<strong>Definition:</strong> The proportion of patients aged 55 years and over who present with one or more of the following: shortness of breath, palpitations, chest pain, syncope, dizziness, stroke, TIA or heart failure between '+ 
		case
			when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +
	' and ' +
		case		
			when MONTH(@refdate) <4 then '31st December ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '31st December ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +		
' inclusive, and have had a pulse rhythm assessment afterwards.<br>'+
'<strong>Why this is important:</strong> <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE recommends these patients should have their pulse rhythm assessed to rule out AF</a>.'),
--INDICATOR TAB
--summary text
('cvd.af.screeningAcute','tagline',' of patients aged 55 years and over who presented with one or more of the following: shortness of breath, palpitations, chest pain, syncope, dizziness, stroke, TIA or heart failure between '+ 
	case
		when MONTH(@refdate) <4 then '1st April ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
		when MONTH(@refdate) >3 then '1st April ' + CONVERT(VARCHAR,YEAR(@refdate))
	end +
	' and ' +
		case		
			when MONTH(@refdate) <4 then '31st December ' + CONVERT(VARCHAR,(YEAR(@refdate) - 1))
			when MONTH(@refdate) >3 then '31st December ' + CONVERT(VARCHAR,YEAR(@refdate))
		end +		
' inclusive, have had a pulse rhythm assessment afterwards.'),
('cvd.af.screeningAcute','positiveMessage', --tailored text
null),
	--pt lists
('cvd.af.screeningAcute','valueId','latestSx'),
('cvd.af.screeningAcute','valueName','Presentation'),
('cvd.af.screeningAcute','dateORvalue','date'),
('cvd.af.screeningAcute','valueSortDirection','desc'),  -- 'asc' or 'desc'
('cvd.af.screeningAcute','showNextReviewDateColumn', 'true'),
('cvd.af.screeningAcute','tableTitle','All patients who require pulse rhythm assessment'),

	--imp opp charts (based on actionCat)
--ALL PATIENTS
-->SEND LETTER
('cvd.af.screeningAcute','opportunities.Send letter.name','Send letter to request pulse rhythm assessment'),
('cvd.af.screeningAcute','opportunities.Send letter.description','Patients who require pulse rhythm assessment. You may wish to send them a letter.'),
('cvd.af.screeningAcute','opportunities.Send letter.positionInBarChart','1'),

--NO PRIM CARE CONTACT IN THE LAST YEAR
-->CHECK REGISTERED
('cvd.af.screeningAcute','opportunities.Registered?.name','Check registered'),
('cvd.af.screeningAcute','opportunities.Registered?.description','Patients who have not had contact with your practice in the last 12 months - are they still registered with you?'),
('cvd.af.screeningAcute','opportunities.Registered?.positionInBarChart','4'),

--OPPORTUNISTIC
('cvd.af.screeningAcute','opportunities.Opportunistic.name','Opportunistic rhythm assessment'),
('cvd.af.screeningAcute','opportunities.Opportunistic.description','Patients who have regular contact with your practice. You may wish to put a note in their record to remind the next person who sees them assess their pulse rhythm.'),
('cvd.af.screeningAcute','opportunities.Opportunistic.positionInBarChart','2'),

--FLU VACC
('cvd.af.screeningAcute','opportunities.flu vacc.name','Flu vaccinations'),
('cvd.af.screeningAcute','opportunities.flu vacc.description','Patients who are due to have a flu vaccination this year. You may wish to assess their pulse rhythm when you give them their flu vaccination.'),
('cvd.af.screeningAcute','opportunities.flu vacc.positionInBarChart','5'),

--REGULAR MEDS - PUT ON PX
('cvd.af.screeningAcute','opportunities.Prescription note.name','Repeat medication note'),
('cvd.af.screeningAcute','opportunities.Prescription note.description','Patients who regularly get repeat medications from you. You may wish to put a note on their prescription to make an appointment to assess their pulse rhythm.'),
('cvd.af.screeningAcute','opportunities.Prescription note.positionInBarChart','3'),

--SUGGEST EXCLUDE
('cvd.af.screeningAcute','opportunities.Suggest exclude.name','Exclude?'),
('cvd.af.screeningAcute','opportunities.Suggest exclude.description','Patients who may benefit being excluded from this indicator e.g. palliative care patients.'),
('cvd.af.screeningAcute','opportunities.Suggest exclude.positionInBarChart','6'),

--sob
('cvd.af.screeningAcute','opportunities.sob.name','Shortness of breath'),
('cvd.af.screeningAcute','opportunities.sob.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>shortness of breath</strong>.'),
('cvd.af.screeningAcute','opportunities.sob.positionInBarChart','7'),

--palps
('cvd.af.screeningAcute','opportunities.palps.name','Palpitations'),
('cvd.af.screeningAcute','opportunities.palps.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>palpitations</strong>.'),
('cvd.af.screeningAcute','opportunities.palps.positionInBarChart','8'),

--syncope
('cvd.af.screeningAcute','opportunities.syncope.name','Syncope'),
('cvd.af.screeningAcute','opportunities.syncope.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>syncope or dizziness</strong>.'),
('cvd.af.screeningAcute','opportunities.syncope.positionInBarChart','9'),

--ChestPain
('cvd.af.screeningAcute','opportunities.ChestPain.name','Chest pain'),
('cvd.af.screeningAcute','opportunities.ChestPain.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>chest pain</strong>.'),
('cvd.af.screeningAcute','opportunities.ChestPain.positionInBarChart','10'),

--StrokeIsch
('cvd.af.screeningAcute','opportunities.StrokeIsch.name','Stroke'),
('cvd.af.screeningAcute','opportunities.StrokeIsch.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>stroke</strong>.'),
('cvd.af.screeningAcute','opportunities.StrokeIsch.positionInBarChart','11'),

--Tia
('cvd.af.screeningAcute','opportunities.Tia.name','TIA'),
('cvd.af.screeningAcute','opportunities.Tia.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>TIA</strong>.'),
('cvd.af.screeningAcute','opportunities.Tia.positionInBarChart','12'),

--Tia
('cvd.af.screeningAcute','opportunities.Hf.name','Heart failure'),
('cvd.af.screeningAcute','opportunities.Hf.description','Patients who have not had a pulse rhythm assessment in accordance with <a href=''https://cks.nice.org.uk/atrial-fibrillation#!diagnosissub'' target=''_blank'' title=''NICE AF Guidelines''>NICE guidelines</a> who presented with <strong>heart failure</strong>.'),
('cvd.af.screeningAcute','opportunities.Hf.positionInBarChart','13');


