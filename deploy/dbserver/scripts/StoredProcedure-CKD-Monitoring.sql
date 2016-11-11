----------------------------------------------------------------------------------------------
--CKD MONITORING - v3.0 - 6/7/16
----------------------------------------------------------------------------------------------
--Indicator derived from: 
	--Discussions with Owain
	--NOT Salford Standards
	--NICE/QOF indicator NM109 (December 2015 version) The percentage of patients on the CKD register whose notes have a record of a urine albumin:creatinine ratio (or protein:creatinine ratio) test in the preceding 12 months
	--NICE CKD QS 6 - progression - https://www.nice.org.uk/guidance/QS5/chapter/Quality-statement-6-Progression
--Code lists derived from:
	--primarily QOF
	--synonyms and codelist sibling / parent / child searches
--Target: 90%

----------------------------------------------------------------------------------------------
--Text file:
----------------------------------------------------------------------------------------------

--name	Correct CKD monitoring
--description	<strong>Description:</strong> Patients with CKD (Stage 3 and above) who have received the <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'>correct frequency of eGFR monitoring based on their latest eGFR and ACR readings</a>. <br> <strong>Eligible patients:</strong> Patients with a CKD diagnostic code (stage 3 or above) who do not have an exclusion code. <br> <strong>Correct patients:</strong> Patients who have the correct frequency of monitoring <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'>based on their latest eGFR and/or ACR readings</a>.
--tagline	of your patients with a CKD code have been correctly monitored <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'>based on their latest eGFR and/or ACR readings</a>.
--positiveMessage	There's room for improvement - but don't be disheartened! Look through the recommended improvement actions on this page and for each patient.
--valueId	eGFR
--valueName	Latest eGFR
--dateORvalue	value
--tableTitle	All patients with improvement opportunities
--opportunities.underContact.name	Under monitored - contact with practice
--opportunities.underContact.description	Patients with a CKD code who have <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'><strong>not been monitored correctly based on their latest eGFR and ACR readings</strong></a> but who have had contact with your practice in the last year.
--opportunities.underNoContact.name	Under monitored - NO contact with practice
--opportunities.underNoContact.description	Patients with a CKD code who have <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'><strong>not been monitored correctly based on their latest eGFR and ACR readings</strong></a> and who have had <strong>no</strong> contact with your practice in the last year.
--opportunities.overMonitored.name	Over monitored
--opportunities.overMonitored.description	Patients with a CKD code who have had <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197'><strong>more than 4 eGFR readings in the last year</strong></a>.
--opportunities.acrTest.name	ACR missing
--opportunities.acrTest.description	Patients with a CKD code who do not have an ACR test result in their record to enable accurate <a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank">CKD monitoring</a>.
--opportunities.overdiagnosed.name	Overdiagnosed
--opportunities.overdiagnosed.description	Patients with a CKD code whose <a target='_blank' href='http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2'><strong>latest eGFR readings do not meet the criteria for CKD diagnosis stage 3 or above</strong></a>.
--opportunities.suggestExclude.name	Suggest exclude
--opportunities.suggestExclude.description	Patients with a CKD code who may <strong>benefit from being excluded</strong> from CKD quality indicators.


----------------------------------------------------------------------------------------------
--Changes:
----------------------------------------------------------------------------------------------
--16/7/6-'#' added to Read codes
--v2.2 - sql writing added

----------------------------------------------------------------------------------------------
--Improvement analytic categories:
----------------------------------------------------------------------------------------------
--Undermonitored - f2f/tel/med contact in last 1 year
	--acr known
	--acr unkown
--Undermonitored - no contact in last 1 year
	--acr known
	--acr unkown
--Overmonitored - >= 4 tests/yr
--Overdiagnosed
--Suggest exclude
--Needs ACR test
	
----------------------------------------------------------------------------------------------
--Organisational plan ideas
----------------------------------------------------------------------------------------------
---hire nurse
---educational session

--------------------------------------------------------------------------------------------------
--NOTES / TO DO--
--------------------------------------------------------------------------------------------------
--27/5/16
--Just egfr monitoring at moment
--overmonitoring - just if had more than 4 per year (as that's the max recommended) - gets v difficult if stages change over time based on prior egfr readings to calculate more tailored time periods
--Only pts w CKD diagnosis code in their records
--Frequency based on their recent readings NOT their coded diagnosis
--Includes overdiagnosed - should it? (it's already in the coding indicator...) Should be almagamated into suggested exclusions?
--Overdiagnosed pts
	--Are only overmonitored (they cannot be in 'under monitored' by definition because they don't have an egfr due date to calculate from the correct coding) i.e. >4 tests / year
	--Should be separate category? Or just included in 'overmonitored'?
	--We're not including overdiagnosed pts that have had ANY eGFR tests - as their most recent eGFR test could have been the one that showed they were overdiagnosed - we COULD however, have an additional category for overdiagnosed pts that have had 2-4 tests / year? Or incorproate that into the existing one (i.e. >4 test per year)?
	--still need monitoring if at risk of CKD though?
--Includes needs ACR test - should it?
--No contact = nil for 1 year - should it? 
--Does not include undiagnosed pts
--Does not state when last contact was on action plans (like does for egfr readings) - that OK? Or is it enough to see on the lifeline? 
--ONce an ACR test is done (for those that don't have one), the future date for eGFR testing may change in future
--Overdiagnosed patients are counted as 'correctly monitored' at the moment - is that OK? should they not? or should they be removed?


--Check happy with indicator (numerator / denominator) definition - is slightly different from Salford standards and NICE QS
--Undiagnosed includes patients that HAVE and DO NOT have an ACR reading - should they be split up? Surely not many with ACR reading and no code? And they will then go into the other category once a CKD code is added anyway. Or would prefer to highlight them?
--our staging calcualtions may be based on eGFRs years ago - want time limit on that? or save for frequency of tests indicator?
--Staging (ACR) is only based on the latest reading - doesn’t take into account if one-off readings that need further testing before coding
--Doesn’t include patients who need further testing (e.g. one off eGFR < 60) – AKI?
--actions don't take into account if patients never been seen before - would like on list to order by consultation date?
--Currently accepts ‘stage 3’ (i.e. not 3a or 3b) as an acceptable coding level - but suggests an acr reading
--Currently accepts A2/3 (i.e. not specifying the exact CKD stage - just 'proteinuria') as an acceptable level
--For threeInvites add 3rd invites where they're combinations of verbal and 1st or 2nd letter invites - see codes below
--add bed ridden / mobility very poor as suggested exclusions? see code '13C..' (Mobility - social functioning)
--would want to know which patients had been excluded (QOF exclusions)?
--**baseline regression analysis*** are there other action plans around looking at the age of those undiagnosed? to suggest something about educating practice teams? E.g. not to ignore older patients?
--Doesn’t include patients who may need referral / rapid progression: http://www.ncbi.nlm.nih.gov/books/NBK328138/
--Doesn't include people at risk of CKD (like in NICE QS)
--Doesn’t use frailty risk prediction tool
--There are a group of patients where coding is correct but is not based on ACR readings (i.e. G3a/4/4/5) - they need an ACR reading - they currently classified as being wrong and needing an ACR (under wrongUnknown - acr suggestion) - do these need separating out? they will also come under the testing indicator too.
--Suggested exclusion patients may not have a CKD diagnostic code - should we only suggest excluding these patients if they have a diagnosis code? They would still come up as suggested to be coded though in the undiagnosed imp opp category though!

--OT happy for now - re-visit - 17/5/16 - pts in wrongUnknown cat will also show up in the testing indicator (when written) that need an ACR reading

--OT happy 17/5/16 - Pimarily based on QOF definitions of CKD
--OT happy 17/5/16 - QOF business rules include G1 A2,	G1 A3, G2 A2, and G2 A3 as 'CKD 3-5' ('1Z1P.', '1Z1R.', '1Z1S.') - I have not - OK?
--OT happy 17/5/16 - we have used codes for ACR readings only (46TC., 46TD.) NOT PCR (44lzX, 44lD.)
--OT happy 17/5/16 - we have not used codes for proteinuria in CKD, apparently they are in QOF? (i.e. 	R1100	00	[D]Albuminuria; R110.	00	[D]Proteinuria; R1103	00	[D]Microalbuminuria; R110z	00	[D]Proteinuria NOS)
--OT happy 17/5/16 - Exception reporting code only valid for 12/12

----------------------------------------------------------------------------------------------------------
--CODES USED-- (**NEED TO DO THIS USING RICHARD'S PROGRAMME IN FUTURE**)
-----------------------------------------------------------------------------------------------------------
--From NICE CKD ruleset v32 03/07/2015 (from Shaun Rowark) - Read v2 only as no CTV3 in SIR (CTV3 only used in TPP SystmOne - http://www.hscic.gov.uk/miquest)
	--(Chronic kidney disease codes 3-5) 1Z12. 1Z13. 1Z14. 1Z15. 1Z16. 1Z1B. – 1Z1L. 1Z1N. 1Z1P. 1Z1R. 1Z1S. 1Z1T. 1Z1V . 1Z1W. 1Z1X. 1Z1Y. 1Z1Z. 1Z1a. 1Z1b. 1Z1c. 1Z1d. 1Z1e. 1Z1f. K053. K054. K055.
	--(Chronic kidney disease codes 1-2) 1Z10. 1Z11. 1Z17. – 1Z1A. 1Z1M. 1Z1Q. K051. K052. (excluded)
	--(Chronic kidney disease resolved codes) 2126E
	--(Chronic kidney disease exception reporting codes) - last 12/12 - 9hE1. 9hE0.
	--(Codes for declined to give urine specimen) 9RX..
	--(Codes for Albumin:Creatinine & Protein:Creatinine Ratio for CKD) 44lD. 44lzX 46TC. 46TD.
	--(Codes for proteinuria for CKD) 1Z1B. 1Z1D. 1Z1F . 1Z1H. 1Z1K. R110. R1100 R1103 R110z

--		CKD>=3
--		1Z12.	00	Chronic kidney disease stage 3
--		1Z13.	00	Chronic kidney disease stage 4
--		1Z14.	00	Chronic kidney disease stage 5
--		1Z15.	00	Chronic kidney disease stage 3A
--		1Z16.	00	Chronic kidney disease stage 3B
--		1Z1B.	00	Chronic kidney disease stage 3 with proteinuria
--		1Z1C.	00	Chronic kidney disease stage 3 without proteinuria
--		1Z1D.	00	Chronic kidney disease stage 3A with proteinuria
--		1Z1E.	00	Chronic kidney disease stage 3A without proteinuria
--		1Z1F.	00	Chronic kidney disease stage 3B with proteinuria
--		1Z1G.	00	Chronic kidney disease stage 3B without proteinuria
--		1Z1H.	00	Chronic kidney disease stage 4 with proteinuria
--		1Z1J.	00	Chronic kidney disease stage 4 without proteinuria
--		1Z1K.	00	Chronic kidney disease stage 5 with proteinuria
--		1Z1L.	00	Chronic kidney disease stage 5 without proteinuria
--		1Z1T.	00	CKD G3aA1 - chronic kidney disease with glomerular filtration rate category G3a and albuminuria category A1
--		1Z1V.	00	CKD G3aA2 - chronic kidney disease with glomerular filtration rate category G3a and albuminuria category A2
--		1Z1W.	00	CKD G3aA3 - chronic kidney disease with glomerular filtration rate category G3a and albuminuria category A3
--		1Z1X.	00	CKD G3bA1 - chronic kidney disease with glomerular filtration rate category G3b and albuminuria category A1
--		1Z1Y.	00	CKD G3bA2 - chronic kidney disease with glomerular filtration rate category G3b and albuminuria category A2
--		1Z1Z.	00	CKD G3bA3 - chronic kidney disease with glomerular filtration rate category G3b and albuminuria category A3
--		1Z1a.	00	CKD G4A1 - chronic kidney disease with glomerular filtration rate category G4 and albuminuria category A1
--		1Z1b.	00	CKD G4A2 - chronic kidney disease with glomerular filtration rate category G4 and albuminuria category A2
--		1Z1c.	00	CKD G4A3 - chronic kidney disease with glomerular filtration rate category G4 and albuminuria category A3
--		1Z1d.	00	CKD G5A1 - chronic kidney disease with glomerular filtration rate category G5 and albuminuria category A1
--		1Z1e.	00	CKD G5A2 - chronic kidney disease with glomerular filtration rate category G5 and albuminuria category A2
--		1Z1f.	00	CKD G5A3 - chronic kidney disease with glomerular filtration rate category G5 and albuminuria category A3
--		K053.	00	Chronic kidney disease stage 3
--		K054.	00	Chronic kidney disease stage 4
--		K055.	00	Chronic kidney disease stage 5
				
--		Not CKD >=3
--		2126E	00	Chronic kidney disease resolved
--		1Z10.	00	Chronic kidney disease stage 1
--		1Z11.	00	Chronic kidney disease stage 2
--		1Z17.	00	Chronic kidney disease stage 1 with proteinuria
--		1Z18.	00	Chronic kidney disease stage 1 without proteinuria
--		1Z19.	00	Chronic kidney disease stage 2 with proteinuria
--		1Z1A.	00	Chronic kidney disease stage 2 without proteinuria
--		1Z1M.	00	CKD G1A1 - chronic kidney disease with glomerular filtration rate category G1 and albuminuria category A1
--		1Z1N.	00	CKD G1A2 - chronic kidney disease with glomerular filtration rate category G1 and albuminuria category A2
--		1Z1P.	00	CKD G1A3 - chronic kidney disease with glomerular filtration rate category G1 and albuminuria category A3
--		1Z1Q.	00	CKD G2A1 - chronic kidney disease with glomerular filtration rate category G2 and albuminuria category A1
--		1Z1R.	00	CKD G2A2 - chronic kidney disease with glomerular filtration rate category G2 and albuminuria category A2
--		1Z1S.	00	CKD G2A3 - chronic kidney disease with glomerular filtration rate category G2 and albuminuria category A3
--		K051.	00	Chronic kidney disease stage 1
--		K052.	00	Chronic kidney disease stage 2      


--Additional ones from Salford standard read code dictionary v2 and TRUD Read code v2 dictionary (v1/4/16)
		--9Ot2.	00	Chronic kidney disease monitoring third letter
		--9Ot0.	00	Chronic kidney disease monitoring first letter
		--9Ot3.	00	Chronic kidney disease monitoring verbal invite
		--9Ot1.	00	Chronic kidney disease monitoring second letter
		--9Ot4.	00	Chronic kidney disease monitoring telephone invite
		--451K. eGFR using CKD Epidemiology Collaboration formula per 1.73 square metre
		--451N. eGFR using creatinine (CKD-EPI) per 1.73 square metres
		--451M. eGFR using cystatin C (CKD-EPI) per 1.73 square metres
		--451F. GFR
		--451E. GFR calculated by abbreviated MDRD
		--451G. GFR calculated by abbreviated MDRD adjusted for African American origin

----------------------------------------------------------------------------------------------------------
--SYNONYMS CHECKED-- (**NEED TO DO THIS USING RICHARD'S PROGRAMME IN FUTURE**)
-----------------------------------------------------------------------------------------------------------
--From Read code v2 dictionary (v 1/4/16)
	--'renal' - done
	--'kidney' - done
	--'ckd' - done
	--check no new acr / egfr codes - done

----------------------------------------------------------------------------------------------------------
--CODES NOT BEING USED-- (**NEED TO DO THIS USING RICHARD'S PROGRAMME IN FUTURE**)
-----------------------------------------------------------------------------------------------------------
--	R1100	00	[D]Albuminuria
--	R110.	00	[D]Proteinuria
--	R1103	00	[D]Microalbuminuria
--	R110z	00	[D]Proteinuria NOS
--'renal transplant'
--haemodialysis codes
--'renal function' codes (i.e. not actual measurement values)
--AKI codes
--9mG..	00	Renal function monitoring invitation
--9mG0.	00	Renal function monitoring invitation first letter
--9mG1.	00	Renal function monitoring invitation second letter
--9mG2.	00	Renal function monitoring invitation third letter
--K06..	00	Renal failure unspecified
--K060.	00	Renal impairment
--K0D..	00	End-stage renal disease
--8A6..	11	Kidney function monitoring
--68D1.	11	Chronic kidney disease screening
--R144.	11	[D]Kidney function test abnormal
--14OY.	00	At risk of chronic kidney disease
--Q20yz	12	Kidney injury due to birth trauma
--SP154	11	Kidney failure as a complication of care
--66i..	00	Chronic kidney disease monitoring
--6AA..	00	Chronic kidney disease annual review
--4Z1..	00	Chronic kidney disease laboratory study
--9Ot..	00	Chronic kidney disease monitoring administration
--9Ni9.	00	Did not attend chronic kidney disease monitoring clinic
--7P140	00	Glomerular filtration rate testing
--4511.	00	Renal function tests normal
--4512.	00	Renal function tests abnormal
--4513.	00	Creatinine clearance-glom filt
--45130	00	Creatinine clearance-glom filt normal
--45131	00	Creatinine clearance-glom filt abnormal
--451Z.	00	Renal function test NOS
--451A.	00	Estimated creatinine clearance
--4517.	00	Creatinine clearance test
--44J7.	00	Albumin / creatinine ratio



IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.ckd.monitoring') DROP PROCEDURE [pingr.ckd.monitoring];

GO
CREATE PROCEDURE [pingr.ckd.monitoring] @refdate VARCHAR(10)
AS
SET NOCOUNT ON --exclude row count results for call from R

--declare @refdate datetime;
--set @refdate = '2016-06-17'; --SIR_ALL
--declare @window int;
--set @window = 12;

--create temp tables
IF OBJECT_ID('tempdb..#denominator') IS NOT NULL DROP TABLE #denominator
IF OBJECT_ID('tempdb..#latestEgfrACR') IS NOT NULL DROP TABLE #latestEgfrACR
IF OBJECT_ID('tempdb..#classify') IS NOT NULL DROP TABLE #classify
IF OBJECT_ID('tempdb..#indicator') IS NOT NULL DROP TABLE #indicator
IF OBJECT_ID('tempdb..#suggestExclude') IS NOT NULL DROP TABLE #suggestExclude
IF OBJECT_ID('tempdb..#contacts') IS NOT NULL DROP TABLE #contacts
IF OBJECT_ID('tempdb..#egfrDue') IS NOT NULL DROP TABLE #egfrDue
IF OBJECT_ID('tempdb..#NoEgfrs') IS NOT NULL DROP TABLE #NoEgfrs

CREATE TABLE #denominator (PatID int, dead int, egfr int, diag int, exclusion int);
CREATE TABLE #latestEgfrACR (PatID int, egfrMax float, latestEgfrDate date, acrMax float, latestAcrDate date, code varchar (8), codeDate date);
CREATE TABLE #classify (PatID int, egfrMax float, latestEgfrDate date, acrMax float, latestAcrDate date, code varchar (8), correct varchar (8), correct_read varchar (100));
CREATE TABLE #indicator (PatID int, code varchar (8), correct varchar (8), underMonitored int, overMonitored int);
CREATE TABLE #suggestExclude (PatID int, palliative int, palDate date, frail int, frailDate date, housebound int, houseboundDate date, threeInvites int, threeInvitesDate date);
CREATE TABLE #contacts (PatID int, event varchar(100), date date);
CREATE TABLE #egfrDue (PatID int, egfrDue date);
CREATE TABLE #NoEgfrs (PatID int, NoEgfrs int);

--create permanent tables for export
--if not exists (select * from sysobjects where name='outContacts' and xtype='U') CREATE TABLE outContacts (PatID int, date date, event varchar(100));
--if not exists (select * from sysobjects where name='outImpCodes' and xtype='U') CREATE TABLE outImpCodes (PatID int, date date, importantCode varchar(100));
--if not exists (select * from sysobjects where name='outDiagnoses' and xtype='U') CREATE TABLE outDiagnoses (PatID int, date date, diagnosis varchar(100), subcategory varchar(100));
--if not exists (select * from sysobjects where name='outMeasures' and xtype='U') CREATE TABLE outMeasures (PatID int, date date, measure varchar(100), value float);
--if not exists (select * from sysobjects where name='outDemographics' and xtype='U') CREATE TABLE outDemographics (PatID int, age int, sex varchar (100));
--if not exists (select * from sysobjects where name='outImpOppCatsAndActions' and xtype='U') CREATE TABLE outImpOppCatsAndActions (PatID int, impOppCat varchar(1000), action varchar(1000), short_action varchar(1000), long_action varchar(1000), reason varchar(1000), evidence varchar(1000));
--if not exists (select * from sysobjects where name='outIndicator' and xtype='U') CREATE TABLE outIndicator (date date, numerator int, denominator int, target float);

--------------------------------------------------------------------------------
---Start loop for indicator table
--------------------------------------------------------------------------------
--truncate table outIndicator
--declare @refdate datetime;
--set @refdate = DATEADD(year, -4, @RefDate);
--while (@refdate <= @RefDate)
--begin

--------------------------------------------------------------------------------
---Create denominator table - patients with eGFR<60 and/or CKD code >=3
--------------------------------------------------------------------------------
--truncate table #denominator
insert into #denominator (PatID, egfr, diag, exclusion)
select PatID, SUM(egfr) as egfr, SUM(diag) as diag, SUM(exclusion) as exclusion from (

--Find patients with latest eGFR readings < 60, and at least 1 eGFR reading < 60 at least 90 days before with no values between these dates > 60
select a.PatID, 1 as egfr, 0 as diag, 0 as exclusion from SIR_ALL_Records a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join(
		select parent.PatID, max(EntryDate) as most_recent_egfr_gt_90_days_ago, max(child.most_recent_egfr_date) as most_recent_egfr_date from SIR_ALL_Records parent
			inner join patients p on p.patid = parent.PatID and p.dead != 1 --and p.gpcode='P87016'
			inner join (
				select PatID, MAX(EntryDate) as most_recent_egfr_date from SIR_ALL_Records
				inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
				where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
				and EntryDate < @refdate
				and CodeValue is not null
				and CodeValue > 0
				group by PatID) child on child.PatID = parent.PatID and parent.EntryDate < DATEADD(day, -90, child.most_recent_egfr_date)
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and CodeValue is not null
		and CodeValue > 0
		and EntryDate < @refdate
		group by parent.PatID
	) sub on sub.PatID = a.PatID and EntryDate >= sub.most_recent_egfr_gt_90_days_ago and EntryDate <= sub.most_recent_egfr_date
where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
and CodeValue is not null
and CodeValue > 0
and EntryDate < @refdate
group by a.PatID
having MAX(CodeValue) < 60

union

--Find patients with a CKD read code >=stage 3 at ANY TIME, and NO CKD resolved, or CKD 1-2 code afterwards
SELECT c.PatID, 0 as egfr, 1 as diag, 0 as exclusion from
-----select most recent CKD read code >=stage 3
(
	(SELECT PatID, MAX(EntryDate) AS ckd FROM SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
          WHERE ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
	and EntryDate < @refdate
	GROUP BY PatID) as c
-----no 'CKD resolved' or 'CKD 1-2' code afterwards
     LEFT OUTER JOIN
		(SELECT PatID, MAX(EntryDate) AS ckd FROM SIR_ALL_Records
			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
			WHERE ReadCode IN ('2126E', '1Z10.', '1Z11.', '1Z17.', '1Z18.', '1Z19.', '1Z1A.', '1Z1M.', '1Z1Q.', 'K051.', 'K052.', '1Z1N.', '1Z1P.', '1Z1R.', '1Z1S.')                                            
     and EntryDate < @refdate
     GROUP BY PatID) AS B ON c.PatID = B.PatID
)
WHERE B.ckd IS NULL OR B.ckd < c.ckd


union

--Find patients with a QOF CKD exclusion read code (EXPIRING) in last 12 months
select a.PatID, 0 as egfr, 0 as diag, 1 as exclusion from SIR_ALL_Records a
inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('9hE0.','9hE1.','9hE..')
and EntryDate > DATEADD(month, -12, @refdate)
and EntryDate < @refdate
group by a.PatID 

--Close denominator table
) sub
group by sub.PatID;
--17s full SIR data
--9s single practice

--------------------------------------------------------------------------------
---Create #latestEgfrACR table from #denominator table EXCLUDING EXCEPTIONS
--------------------------------------------------------------------------------
--truncate table #latestEgfrACR
insert into #latestEgfrACR (PatID, egfrMax, latestEgfrDate, acrMax, latestAcrDate, code, codeDate)
select PatID, SUM(egfrMax) as egfrMax, MAX(latestEgfrDate), SUM(acrMax) as acrMax, MAX(latestAcrDate), MAX(code), MAX(codeDate) from (

--Obtain max value on the day of the latest eGFR reading for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, MAX(CodeValue) as egfrMax, MAX(latestEgfrDate) as latestEgfrDate, NULL as acrMax, NULL as latestAcrDate, NULL as code, NULL as codeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestEgfrDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and PatID in (select PatID from #denominator where exclusion = 0)
		and EntryDate < @refdate
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestEgfrDate = s.EntryDate
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and EntryDate < @refdate
		group by s.PatID
union

--Obtain max value of the latest ACR reading for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, NULL as egfrMax, Null as latestEgfrDate, MAX(CodeValue) as acrMax, MAX(latestAcrDate) as latestAcrDate, NULL as code, NULL as codeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestAcrDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('46TC.', '46TD.') and (CodeUnits is null or CodeUnits='g/mol' or CodeUnits='mg/mmol')
		and PatID in (select PatID from #denominator where exclusion = 0)
		and EntryDate < @refdate
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestAcrDate = s.EntryDate
		where ReadCode in ('46TC.', '46TD.')
		and EntryDate < @refdate
		group by s.PatID		

union

--Obtain latest CKD diagnostic code for each patient in #denominator table EXCLUDING EXCEPTIONS
select s.PatID, NULL as egfrMax, NULL as latestEgfrDate, NULL as acrMax, NULL as latestAcrDate, case 
	when ReadCode in ('1Z12.','K053.') then 'G3'
	when ReadCode in ('1Z13.','K054.') then 'G4'
	when ReadCode in ('1Z14.','K055.') then 'G5'
	when ReadCode in ('1Z15.') then 'G3a'
	when ReadCode in ('1Z16.') then 'G3b'
	when ReadCode in ('1Z1B.') then 'G3 A2/3'
	when ReadCode in ('1Z1C.') then 'G3 A1'
	when ReadCode in ('1Z1D.') then 'G3a A2/3'
	when ReadCode in ('1Z1E.', '1Z1T.') then 'G3a A1'
	when ReadCode in ('1Z1F.') then 'G3b A2/3'
	when ReadCode in ('1Z1G.', '1Z1X.') then 'G3b A1'
	when ReadCode in ('1Z1H.') then 'G4 A2/3'
	when ReadCode in ('1Z1J.', '1Z1a.') then 'G4 A1'
	when ReadCode in ('1Z1K.') then 'G5 A2/3'
	when ReadCode in ('1Z1L.', '1Z1d.') then 'G5 A1'
	when ReadCode in ('1Z1V.') then 'G3a A2'
	when ReadCode in ('1Z1W.') then 'G3a A3'
	when ReadCode in ('1Z1Y.') then 'G3b A2'
	when ReadCode in ('1Z1Z.') then 'G3b A2'
	when ReadCode in ('1Z1b.') then 'G4 A2'
	when ReadCode in ('1Z1c.') then 'G4 A3'
	when ReadCode in ('1Z1e.') then 'G5 A2'
	when ReadCode in ('1Z1f.') then 'G5 A3'
end as code, MAX(latestCodeDate) as CodeDate from SIR_ALL_Records as s
	inner join patients p on p.patid = s.PatID and p.dead != 1 --and p.gpcode='P87016'
	inner join (
		select PatID, MAX(EntryDate) as latestCodeDate  from SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
		where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
		and EntryDate < @refdate
		and PatID in (select PatID from #denominator where exclusion = 0)
		group by PatID ) sub on sub.PatID = s.PatID and sub.latestCodeDate = s.EntryDate
		where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.')
		and EntryDate < @refdate
		group by s.PatID, ReadCode
	
--Close latestEgfrACR table
) sub
group by sub.PatID;
--01:15 full SIR data
--00:29 single practice

--------------------------------------------------------------------------------
---classify patients CKD stage based on latestEgfrACR table into classify table
--------------------------------------------------------------------------------
--truncate table #classify
insert into #classify (PatID, egfrMax, latestEgfrDate, acrMax, latestAcrDate, code, correct, correct_read)
select PatID, egfrMax, latestEgfrDate, acrMax, latestAcrDate, code,
	case	
		--when egfrMax > 90 and acrMax is null then 'G1'
		--when egfrMax > 90 and acrMax < 3 then 'G1 A1'
		--when egfrMax > 90 and acrMax between 3 and 30 then 'G1 A2'
		--when egfrMax > 90 and acrMax > 30 then 'G1 A3'
		--when egfrMax between 60 and 89 and acrMax is null then 'G2'
		--when egfrMax between 60 and 89 and acrMax < 3 then 'G2 A1'
		--when egfrMax between 60 and 89 and acrMax between 3 and 30 then 'G2 A2'
		--when egfrMax between 60 and 89 and acrMax > 30 then 'G2 A3'
		when egfrMax between 45 and 59 and acrMax is null then 'G3a'
		when egfrMax between 45 and 59 and acrMax < 3 then 'G3a A1'
		when egfrMax between 45 and 59 and acrMax between 3 and 30 then 'G3a A2'
		when egfrMax between 45 and 59 and acrMax > 30 then 'G3a A3'
		when egfrMax between 30 and 44 and acrMax is null then 'G3b'
		when egfrMax between 30 and 44 and acrMax < 3 then 'G3b A1'
		when egfrMax between 30 and 44 and acrMax between 3 and 30 then 'G3b A2'
		when egfrMax between 30 and 44 and acrMax > 30 then 'G3b A3'
		when egfrMax between 15 and 29 and acrMax is null then 'G4'
		when egfrMax between 15 and 29 and acrMax < 3 then 'G4 A1'
		when egfrMax between 15 and 29 and acrMax between 3 and 30 then 'G4 A2'
		when egfrMax between 15 and 29 and acrMax > 30 then 'G4 A3'
		when egfrMax < 15 and acrMax is null then 'G5'
		when egfrMax < 15 and acrMax < 3 then 'G5 A1'
		when egfrMax < 15 and acrMax between 3 and 30 then 'G5 A2'
		when egfrMax < 15 and acrMax > 30 then 'G5 A3'
	end as correct,
	case
		when egfrMax between 45 and 59 and acrMax is null then '1Z15. (CKD stage G3a) [#1Z15.]'
		when egfrMax between 45 and 59 and acrMax < 3 then '1Z1T. (CKD stage G3a A1) [#1Z1T.]'
		when egfrMax between 45 and 59 and acrMax between 3 and 30 then '1Z1V. (CKD stage G3aA2) [#1Z1V.]'
		when egfrMax between 45 and 59 and acrMax > 30 then '1Z1W. (CKD stage G3a A3) [#1Z1W.]'
		when egfrMax between 30 and 44 and acrMax is null then '1Z16. (CKD stage G3b ) [#1Z16.]'
		when egfrMax between 30 and 44 and acrMax < 3 then '1Z1X. (CKD stage G3b A1) [#1Z1X.]'
		when egfrMax between 30 and 44 and acrMax between 3 and 30 then '1Z1Y. (CKD stage G3b A2) [#1Z1Y.]'
		when egfrMax between 30 and 44 and acrMax > 30 then '1Z1Z. (CKD stage G3b A3) [#1Z1Z.]'
		when egfrMax between 15 and 29 and acrMax is null then 'K054. (CKD stage G4) [#K054.]'
		when egfrMax between 15 and 29 and acrMax < 3 then '1Z1a. (CKD stage G4 A1) [#1Z1a.]'
		when egfrMax between 15 and 29 and acrMax between 3 and 30 then '1Z1b. (CKD stage G4 A2) [#1Z1b.]'
		when egfrMax between 15 and 29 and acrMax > 30 then '1Z1c. (CKD stage G4 A3) [#1Z1c.]'
		when egfrMax < 15 and acrMax is null then 'K055. (CKD stage G5) [#K055.]'
		when egfrMax < 15 and acrMax < 3 then '1Z1d. (CKD stage G5 A1) [#1Z1d.]'
		when egfrMax < 15 and acrMax between 3 and 30 then '1Z1e. (CKD stage G5 A2) [#1Z1e.]'
		when egfrMax < 15 and acrMax > 30 then '1Z1f. (CKD stage G5 A3) [#1Z1f.]'
	end as correct_read
from #latestEgfrACR;

--0s full SIR

--------------------------------------------------------------------------------
---eGFR due date and no of tests
--------------------------------------------------------------------------------
--truncate table #egfrDue
insert into #egfrDue (PatID, egfrDue)
select PatID,
	case
		when correct in ('G3a','G3a A1','G3a A2') then DATEADD(month, 12, latestEgfrDate)
		when correct in ('G3a A3','G3b','G3b A1','G3b A2','G3b A3','G4','G4 A1','G4 A2') then DATEADD(month, 6, latestEgfrDate)
		when correct in ('G4 A3') then DATEADD(month, 4, latestEgfrDate)
		when correct in ('G5','G5 A1','G5 A2','G5 A3') then DATEADD(month, 3, latestEgfrDate)
		when correct is NULL then NULL
	end as egfrDue
from #classify;

--------------------------------------------------------------------------------
---No of eGFRs in last year
--------------------------------------------------------------------------------
--truncate table #NoEgfrs
insert into #NoEgfrs (PatID, NoEgfrs)
select PatID, COUNT(*) as noEgfrs
	FROM ( -- select all unique patientId/Entrydata combinations
		select PatID, EntryDate from SIR_ALL_Records
		where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.')
		and Source not like 'salfordt%' --not hospital results
		and EntryDate > DATEADD(year,-1, @refdate)
		group by PatID, EntryDate 
		) sub
		group by sub.PatID

--0s full SIR

------------------------------
----create indicator table
------------------------------
--truncate table #indicator
insert into #indicator (PatID, code, correct, underMonitored, overMonitored)
select d.PatID, code, correct,
	case
		when ((egfrDue < @refdate) and (egfrDue > latestEgfrDate)) OR (NoEgfrs is NULL and correct is not null) then 1
		else NULL
	end as underMonitored,
	case
		when NoEgfrs > 4 then 1
		else NULL
	end as overMonitored
from #classify as d
	inner join #egfrDue c on c.PatID = d.PatID
	left outer join #NoEgfrs e on e.PatID = d.PatID
	where d.code is not null --only select pts for denominator where they have a CKD code in their records
--0s full SIR

-----------------------------
----Get benchmark from top 10% (5 practices)
----------------------------
declare @val float;
set @val = (select round(avg(perc),2) from (
select top 5 sum(case when underMonitored is NULL and overMonitored is NULL then 1.0 else 0.0 end) / cast(count(*) as float) as perc from #indicator as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
	order by perc desc) sub);
	
--------------------------------------------------------------------------------
--Declare indicator, numerator, denominator, target
--------------------------------------------------------------------------------
--declare @numerator int;
--declare @denominator int;
--set @numerator = (select COUNT(*) from #indicator where underMonitored is NULL and overMonitored is NULL);
--set @denominator = (select COUNT(*) from #indicator);  
insert into [output.pingr.indicator](indicatorId, practiceId, date, numerator, denominator, target, benchmark)
--select CONVERT(char(10), @refdate, 126) as date, @numerator as numerator, @denominator as denominator, 0.75 as target;
select 'ckd.diagnosis.monitoring',b.pracID, CONVERT(char(10), @refdate, 126) as date, sum(case when underMonitored is NULL and overMonitored is NULL then 1 else 0 end) as numerator, COUNT(*) as denominator, 0.75 as target, @val from #indicator as a
	inner join ptPractice as b on a.PatID = b.PatID
	group by b.pracID
--0s full SIR

--set @refdate = dateadd(month, 2, @refdate)
--end --finish loop for indicator table

--------------------------------------------------------------------------------
---Create suggested exclusion improvement category
--------------------------------------------------------------------------------
insert into #suggestExclude(PatID, palliative, palDate, frail, frailDate, housebound, houseboundDate, threeInvites, threeInvitesDate)
select PatID, SUM(palliative) as palliative, MAX(palDate), SUM(frail) as frail, MAX(frailDate), SUM(housebound) as housebound, MAX(houseboundDate), SUM(threeInvites) as threeInvites, MAX(threeInvitesDate) from (

--Insert patients with a palliative care read code at ANY TIME
select a.PatID, 1 as palliative, MAX(EntryDate) as palDate, 0 as frail, NULL as frailDate, 0 as housebound, NULL as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate from SIR_ALL_Records as a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('8CM1.','8CM10','8CM1000','8CM11','8CM1100','8CM12','8CM13','8CM1300','8CM14','8CM1400','8CM16','8CM17','8CM18','8CM4.','8CME.','8CMQ.','8CMW3','8CMW300','8CMb.','G870.','9367.','9EB5.','9G8..','9K9..','9NNd.','9NNf0','9Ng7.','9NgD.','9c0L0','9c0M.','9c0N.','9c0P.','ZV57C','ZV57C00','1Z01.','2JE..','8B2a.','8BA2.','8BAP.','8BAS.','8BAT.','8BAe.','8BJ1.','8H6A.','8H7L.','8H7g.','8HH7.','8IEE.')
and EntryDate < @refdate
group by a.PatID

union

--Insert patients with a frailty read code at ANY TIME
select a.PatID, 0 as palliative, NULL as paldate, 1 as frail, MAX(EntryDate) as frailDate, 0 as housebound, NULL as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate from SIR_ALL_Records as a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode like '2Jd%' or ReadCode in ('38QI.','38GD.','69D9.','38Qk.','38DW.','ZQ3T.','HNGNQRF75')
and EntryDate < @refdate
group by a.PatID

union

--Insert patients with a housebound read code at ANY TIME and no non-housebound code afterwards
SELECT c.PatID, 0 as palliative, NULL as paldate, 0 as frail, NULL as frailDate, 1 as housebound, c.house as houseboundDate, 0 as threeInvites, NULL as threeInvitesDate FROM 
-----select most recent housebound code
(
	(SELECT PatID, MAX(EntryDate) AS house FROM SIR_ALL_Records
		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
          WHERE ReadCode in ('13CA.','13CV.','6AG..')
	and EntryDate < @refdate
	GROUP BY PatID) as c
-----select no 'not housebound' code afterwards
     LEFT OUTER JOIN
		(SELECT PatID, MAX(EntryDate) AS house FROM SIR_ALL_Records
			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
			WHERE ReadCode IN ('13CW.')                                            
     and EntryDate < @refdate
     GROUP BY PatID) AS B ON c.PatID = B.PatID
)
WHERE B.house IS NULL OR B.house < c.house

union

--Insert patients with 3 CKD invites since the lastest April date
select a.PatID, 0 as palliative, NULL as paldate, 0 as frail, NULL as frailDate, 0 as housebound, NULL as houseboundDate, 1 as threeInvites, MAX(EntryDate) as threeInvitesDate from SIR_ALL_Records a
	inner join patients p on p.patid = a.PatID and p.dead != 1 --and p.gpcode='P87016'
where ReadCode in ('9Ot2.') 
and 
(
	(
		month(@refdate) >= 4 and month(EntryDate)>=4 and year(EntryDate)=year(@refdate)
	)
	
	OR
	
	(
		(
			month(@refdate) < 4
		)
		
		AND
		 
		(
			(
				month(EntryDate)>=4 and year(EntryDate)=year(@refdate)-1
			) 
			
			OR 
			
			(
				month(EntryDate)<4 and year(EntryDate)=year(@refdate)
			)
		)
	)
)
and EntryDate < @refdate
group by a.PatID 

--Close #suggestExclude table
) sub
group by sub.PatID;
--0s full SIR

-------------------------------------------------------------------------------------
---Create contacts table
-------------------------------------------------------------------------------------
DECLARE	@FACE int;
DECLARE	@TELE int;
DECLARE	@REC int;
DECLARE	@CON int;
DECLARE	@MED int;
DECLARE	@OTH int;
set @TELE = 5;
set @FACE = 4;
set @CON = 3;
set @MED = 2;
set @REC = 1;
set @OTH = 0;
insert into #contacts(PatID, date, event)
select PatID, date, 
	case
		when eventcode = 5 then 'Telephone contact'
		when eventcode = 4 then 'Face-to-face'
		when eventcode = 3 then 'Other contact'
		when eventcode = 2 then 'Medication'
		when eventcode <= 1 then 'Other'
		end as event from 
			(select l.PatID,
				max(case 
						when (ReadCode like 'ALLERGY%' OR ReadCode like 'EMIS' OR ReadCode like 'EGTON' OR ReadCode like 'CLEAT') then @CON
						when LEN(ReadCode) >= 8 then @MED
						when LEN(ReadCode) = 6 then @MED
						when ReadCode like '[ABCDEFGHIJKLMNOPQRSTUVWXYZ][ABCDEFGHIJKLMNOPQRSTUVWXYZ][ABCDEFGHIJKLMNOPQRSTUVWXYZ][ABCDEFGHIJKLMNOPQRSTUVWXYZ]___' THEN @MED
						when LEN(ReadCode) <=4 then @OTH
						when ReadCode like '[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%' then @CON
						when ReadCode like '[abcdefghijklmnopqrstuvwxyz]%' then @MED
						when ReadCode like '0%' then @CON
						when ReadCode like '1%' then @CON
						when ReadCode like '2%' then @FACE
						when ReadCode like '3%' then @CON
						when ReadCode like '4%' then @REC
						when ReadCode like '5%' then @REC
						when ReadCode in ('6A2..','6A9..','6AA..','6AB..','662d.','662e.','66AS.','66AS0','66AT.','66BB.','66f0.','66YJ.','66YM.','661Q.','66480','6AH..','6A9..','66p0.','6A2..','66Ay.','66Az.','69DC.') then @FACE --annual review
						when ReadCode like '6A%' then @FACE --patient reviewed
						when ReadCode like '65%' then @FACE
						when ReadCode like '6%' then @CON
						when ReadCode like '7%' then @REC
						when ReadCode like '8B31[356]%' then @FACE
						when ReadCode like '8B3[3569ADEfilOqRxX]%' then @FACE
						when ReadCode like '8B3[168hHjklNSTUVy]%' then @MED
						when ReadCode like '8B4%' then @MED
						when ReadCode like '8B%' then @CON
						when ReadCode in ('8BS3.') then @FACE
						when ReadCode like '8H[1-3]%' then @REC
						when ReadCode like '8H[4-8]%' then @FACE
						when ReadCode like '8H9%' then @TELE
						when ReadCode like '8H[ABCDHKMPQRSTUVWYZpckenmojiklprs]%' then @CON
						when ReadCode like '8H[EFGIJLNOXdabgfhqtuvwxyz]%' then @REC
						when ReadCode like '8[^BH]%' then @CON
						when ReadCode like '94Z%' then @FACE
						when ReadCode like '9N1C%' then @FACE
						when ReadCode like '9N21%' then @FACE
						when ReadCode like '9N31%' then @TELE
						when ReadCode like '9N3G%' then @CON
						when ReadCode like '9N3A%' then @TELE
						when ReadCode like '9%' then @REC
						when ReadCode in ('9kF1.','9kR..','9HB5.') then @FACE --patient reviewed / annual review
						when ReadCode like '9H9%' then @FACE
						when ReadCode like '~%' then @CON
						when ReadCode like '$%' then @REC
						else @CON
					end) as eventcode,
					EntryDate as date from #indicator as l
						left outer join
							(select PatID, ReadCode, EntryDate from SIR_ALL_Records
							 inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
							 ) as d
						on l.PatID = d.PatID
						group by EntryDate, l.PatID) as m
						
-------------------------------------------------------------------------------------
---Create improvement analytic categories + associated actions (one query per action)
-------------------------------------------------------------------------------------
--Undermonitored - f2f/tel/med contact in last 1 year
	--acr known
	--acr unkown
--Undermonitored - no contact in last 1 year
	--acr known
	--acr unkown
--Overmonitored - >= 4 tests/yr
--Overdiagnosed
--Suggest exclude
--Needs ACR test

--truncate table outImpOppCatsAndActions
insert into [output.pingr.patActions](PatID, indicatorId, actionCat, reasonCat, reasonNumber, priority, actionText, supportingText)

--UNDERMONITORED 
-- F2F/TEL/MED CONTACT IN LAST 1 year
	--Acr known
select d.PatID, 'ckd.diagnosis.monitoring','underContact' as actionCat,
		'underContactAcrKnown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Offer eGFR test via phone or letter' as actionText, 
		'Reasoning<ul><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li><li></strong>Latest ACR: <strong>' + Str(e.acrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestAcrDate, 3) + '</li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong> on <strong>' + CONVERT(VARCHAR, e.codeDate, 3) + '</strong></li><li>eGFR was due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
	inner join (
		select PatID, max(date) as MostRecentContact from #contacts
		where event in ('Telephone contact','Face-to-face','Other contact','Medication')
		group by PatID
		) f on f.PatID = d.PatID
where 
	d.underMonitored = 1 and
	d.correct in ('G3a A1', 'G3a A2', 'G3a A3', 'G3b A1', 'G3b A2', 'G3b A3', 'G4 A1', 'G4 A2', 'G4 A3', 'G5 A1', 'G5 A2', 'G5 A3') and
	f.MostRecentContact > dateadd(year, -1, @refdate) --contact in last 1 year

union
	--Acr unknown
select d.PatID, 'ckd.diagnosis.monitoring','underContact' as actionCat,
		'underContactAcrUnknown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Offer eGFR test via phone or letter' as actionText, 
		'Reasoning<ul><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li><li></strong>Latest ACR: <strong>Nil</strong></li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong></li><li>eGFR was due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
	inner join (
		select PatID, max(date) as MostRecentContact from #contacts
		where event in ('Telephone contact','Face-to-face','Other contact','Medication')
		group by PatID
		) f on f.PatID = d.PatID
where 
	d.underMonitored = 1 and
	d.correct in ('G3a', 'G3b', 'G4', 'G5') and
	f.MostRecentContact > dateadd(year, -1, @refdate) --contact in last 1 year
	
union
--UNDERMONITORED 
-- NO CONTACT IN LAST 1 year
	--Acr known
select d.PatID, 'ckd.diagnosis.monitoring','underNoContact' as actionCat,
		'underNoContactAcrKnown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Check this patient is still registered at your practice' as actionText, 
		'Reasoning<ul><li>This patient has not had contact with your practice for > 1 year</li><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li><li></strong>Latest ACR: <strong>' + Str(e.acrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestAcrDate, 3) + '</li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong></li><li>eGFR was due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
	inner join (
		select PatID, max(date) as MostRecentContact from #contacts
		where event in ('Telephone contact','Face-to-face','Other contact','Medication')
		group by PatID
		) f on f.PatID = d.PatID
where 
	d.underMonitored = 1 and  
	d.correct in ('G3a A1', 'G3a A2', 'G3a A3', 'G3b A1', 'G3b A2', 'G3b A3', 'G4 A1', 'G4 A2', 'G4 A3', 'G5 A1', 'G5 A2', 'G5 A3') and
	f.MostRecentContact <= dateadd(year, -1, @refdate) --NO contact in <= 1 year
	
union
	--Acr unknown
select d.PatID, 'ckd.diagnosis.monitoring','underNoContact' as actionCat,
		'underNoContactAcrUnknown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Check this patient is still registered at your practice' as actionText, 
		'Reasoning<ul><li>This patient has not had contact with your practice for > 1 year</li><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li></li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong></li><li>eGFR was due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
	inner join (
		select PatID, max(date) as MostRecentContact from #contacts
		where event in ('Telephone contact','Face-to-face','Other contact','Medication')
		group by PatID
		) f on f.PatID = d.PatID
where 
	d.underMonitored = 1 and 
	d.correct in ('G3a', 'G3b', 'G4', 'G5') and
	f.MostRecentContact <= dateadd(year, -1, @refdate) --NO contact in <= 1 year
	
union
--OVERMONITORED 
	--Acr known
select d.PatID, 'ckd.diagnosis.monitoring','overMonitored' as actionCat,
		'overMonitoredAcrKnown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Add to patient''s record: CKD monitoring not needed until ' + CONVERT(VARCHAR, g.egfrDue, 3) as actionText, 
		'Reasoning<ul><li>This patient has had > 4 eGFRs in the last year</li><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li><li></strong>Latest ACR: <strong>' + Str(e.acrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestAcrDate, 3) + '</li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong></li><li>eGFR next due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #contacts f on f.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
where 
	d.correct in ('G3a A1', 'G3a A2', 'G3a A3', 'G3b A1', 'G3b A2', 'G3b A3', 'G4 A1', 'G4 A2', 'G4 A3', 'G5 A1', 'G5 A2', 'G5 A3') and 
	d.overMonitored = 1

union
		--Acr unknown
select d.PatID, 'ckd.diagnosis.monitoring','overMonitored' as actionCat,
		'overMonitoredAcrUnknown' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Add to patient''s record: CKD monitoring not needed until ' + CONVERT(VARCHAR, g.egfrDue, 3) as actionText, 
		'Reasoning<ul><li>This patient has had > 4 eGFRs in the last year</li><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '</li><li></strong>Latest ACR: <strong> Nil</li><li></strong>Correct CKD stage: <strong>' + c.correct + '</strong></li><li>eGFR next due:<strong> ' + CONVERT(VARCHAR, g.egfrDue, 3) + '</li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:2/-616197" target="_blank"><strong>NICE guidance on CKD monitoring</strong></a></li></ul>' as supportingText
from #indicator d
	inner join #classify c on c.PatID = d.PatID
	inner join #latestEgfrACR e on e.PatID = d.PatID
	inner join #contacts f on f.PatID = d.PatID
	inner join #egfrDue g on g.PatID = d.PatID
where 
	d.correct in ('G3a', 'G3b', 'G4', 'G5') and
	d.overMonitored = 1	

union
--ACR TEST NEEDED (ACR unknown)
select d.PatID, 'ckd.diagnosis.monitoring','acrTest' as actionCat,
		'acrTest' as reasonCat,
		1 as reasonNumber,
		4 as priority,
		'Offer ACR test' as actionText, 
		'Reasoning<ul><li>This patient has CKD<li>They do not have an ACR reading in their record<li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>' as supportingText
from #indicator d
		inner join #classify c on c.PatID = d.PatID
		inner join #latestEgfrACR e on e.PatID = d.PatID
--no urine test refusal in last 12/12
		left outer join (
		select PatID from SIR_ALL_Records
		where ReadCode = '9RX..'
		and EntryDate > DATEADD(month, -12, @refdate)
		and EntryDate < @refdate
		group by PatID
		) sub on sub.PatID = d.PatID
	where
		d.correct in ('G3a','G3b','G4','G5') and
		(d.underMonitored = 1 or d.overMonitored = 1)
		and sub.PatID is null

union
--OVERDIAGNOSED
select d.PatID, 'ckd.diagnosis.monitoring','overdiagnosed' as actionCat,
	'overdiagnosed_eGFR_reading' as reasonCat,
	1 as reasonNumber,
	4 as priority,
	'Add code 2126E (CKD resolved) [#2126E]' as actionText, 
	'Reasoning<ul><li>Latest eGFR:<strong> ' + Str(e.egfrMax, 2, 0) + '</strong> on <strong>' + CONVERT(VARCHAR, e.latestEgfrDate, 3) + '<li></strong>Latest CKD code: <strong>' + d.code + '</strong> on <strong>' + CONVERT(VARCHAR, e.codeDate, 3) + '</strong></li><li><a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!diagnosissub:2" target="_blank"><strong>NICE guidance on CKD diagnosis</strong></a></li></ul>' as supportingText
	from #indicator d
	left outer join #latestEgfrACR as e on d.PatID = e.PatID
	where 
		d.code is not NULL and 
		d.correct is NULL and 
		(d.underMonitored = 1 or d.overMonitored = 1)

union
--SUGGEST EXCLUDE CATEGORY
---suggestExclude - palliative
select d.PatID, 'ckd.diagnosis.monitoring','suggestExclude' as actionCat,
	'suggestExcludePal' as reasonCat,
	1 as reasonNumber,
	4 as priority,
	'Add CKD exception code 9hE0. (palliative) [#9hE0.]' as actionText, 
	'Reasoning<ul><li><strong>Palliative care</strong> code on <strong>' + CONVERT(VARCHAR, l.palDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.palliative = 1) and (d.underMonitored = 1 or d.overMonitored = 1)

union
---suggestExclude - frail
select d.PatID, 'ckd.diagnosis.monitoring','suggestExclude' as actionCat,
	'suggestExcludeFrail' as reasonCat,
	1 as reasonNumber,
	4 as priority,
	'Add CKD exception code 9hE0. (frail) [#9hE0.]' as actionText, 
	'Reasoning<ul><li><strong>Frailty</strong> code on <strong>' + CONVERT(VARCHAR, l.frailDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.frail = 1) and (d.underMonitored = 1 or d.overMonitored = 1)

union
---suggestExclude - housebound
select d.PatID, 'ckd.diagnosis.monitoring','suggestExclude' as actionCat,
	'suggestExcludeHouse' as reasonCat,
	'Add CKD exception code 9hE0. (housebound) [#9hE0.]' as actionText, 
	1 as reasonNumber,
	4 as priority,
	'Reasoning<ul><li><strong>Housebound</strong> code on <strong>' + CONVERT(VARCHAR, l.houseboundDate, 3) + '</strong> (and no ''not housebound'' code afterwards)</li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.housebound = 1) and (d.underMonitored = 1 or d.overMonitored = 1)

union
---suggestExclude - three invites
select d.PatID, 'ckd.diagnosis.monitoring','suggestExclude' as actionCat,
	'suggestExclude3Invites' as reasonCat,
	'Add CKD exception code 9hE.. (3 invites) [#9hE..]' as actionText, 
	'Reasoning<ul><li><strong>Three invites for CKD monitoring</strong> code on <strong>' + CONVERT(VARCHAR, l.threeInvitesDate, 3) + '</strong></li></ul>' as supportingText
	from #indicator as d
	left outer join #suggestExclude as l on d.PatID = l.PatID
	where (l.threeInvites = 1) and (d.underMonitored = 1 or d.overMonitored = 1)

--0s full SIR

--------------------------------------------------------------------------------
--Extract patient data
--------------------------------------------------------------------------------
--demographics
--truncate table outDemographics
--insert into [output.pingr.demographics](PatID, age, sex)
--select l.PatID, YEAR (@refdate) - year_of_birth as age, sex from #indicator as l
	--left outer join
		--(select patid, year_of_birth, sex from dbo.patients) as d 
	--on l.PatID = d.patid
--0s full SIR

--All ACR and eGFR readings
--truncate table outMeasures
--insert into [output.pingr.measures](PatID, date, measure, value)
--select l.PatID, EntryDate as date,
--	case
--		when d.ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.') then 'eGFR'
--		when d.ReadCode in ('46TC.', '46TD.') then 'ACR'
--	end as measure,
--CodeValue as value from #indicator as l
--	left outer join
--		(select PatID, ReadCode, CodeValue, EntryDate from SIR_ALL_Records 
--			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
--			where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.','46TC.', '46TD.')
--			and CodeValue is not NULL) as d
--	on l.PatID = d.PatID
--	where ReadCode in ('451E.','451F.', '451G.', '451M.', '451N.', '451K.', '46TC.', '46TD.')
--	and CodeValue is not NULL
--8s full SIR
--1s single practice
	
--All CKD diagnostic codes
--truncate table outDiagnoses
--insert into [output.pingr.diagnoses](PatID, date, diagnosis, subcategory)
--select l.PatID, EntryDate as date,
--	case
--		when d.ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.', '2126E', '1Z10.', '1Z11.', '1Z17.', '1Z18.', '1Z19.', '1Z1A.', '1Z1M.', '1Z1Q.', 'K051.', 'K052.', '1Z1N.', '1Z1P.', '1Z1R.', '1Z1S.') then 'CKD'
--	end as diagnosis,
--	case
--		when ReadCode in ('1Z12.','K053.') then 'G3'
--		when ReadCode in ('1Z13.','K054.') then 'G4'
--		when ReadCode in ('1Z14.','K055.') then 'G5'
--		when ReadCode in ('1Z15.') then 'G3a'
--		when ReadCode in ('1Z16.') then 'G3b'
--		when ReadCode in ('1Z1B.') then 'G3 A2/3'
--		when ReadCode in ('1Z1C.') then 'G3 A1'
--		when ReadCode in ('1Z1D.') then 'G3a A2/3'
--		when ReadCode in ('1Z1E.', '1Z1T.') then 'G3a A1'
--		when ReadCode in ('1Z1F.') then 'G3b A2/3'
--		when ReadCode in ('1Z1G.', '1Z1X.') then 'G3b A1'
--		when ReadCode in ('1Z1H.') then 'G4 A2/3'
--		when ReadCode in ('1Z1J.', '1Z1a.') then 'G4 A1'
--		when ReadCode in ('1Z1K.') then 'G5 A2/3'
--		when ReadCode in ('1Z1L.', '1Z1d.') then 'G5 A1'
--		when ReadCode in ('1Z1V.') then 'G3a A2'
--		when ReadCode in ('1Z1W.') then 'G3a A3'
--		when ReadCode in ('1Z1Y.') then 'G3b A2'
--		when ReadCode in ('1Z1Z.') then 'G3b A2'
--		when ReadCode in ('1Z1b.') then 'G4 A2'
--		when ReadCode in ('1Z1c.') then 'G4 A3'
--		when ReadCode in ('1Z1e.') then 'G5 A2'
--		when ReadCode in ('1Z1f.') then 'G5 A3'
--		when ReadCode in ('2126E') then 'CKD resolved'
--		when ReadCode in ('1Z10.') then 'G1'
--		when ReadCode in ('1Z11.') then 'G2'
--		when ReadCode in ('1Z17.') then 'G1 A2/A3'
--		when ReadCode in ('1Z18.', '1Z1M.') then 'G1 A1'
--		when ReadCode in ('1Z19.') then 'G2 A2/A3'
--		when ReadCode in ('1Z1A.', '1Z1Q.') then 'G2 A1'
--		when ReadCode in ('1Z1N.') then 'G1 A2'
--		when ReadCode in ('1Z1P.') then 'G1 A3'
--		when ReadCode in ('1Z1R.') then 'G2 A2'
--		when ReadCode in ('1Z1S.') then 'G2 A3'
--		when ReadCode in ('K051.') then 'G1'
--		when ReadCode in ('K052.') then 'G2'
--	end as subcategory		
--	from #indicator as l
--	left outer join
--		(select PatID, ReadCode, EntryDate from SIR_ALL_Records 
--		inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
--		where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.', '2126E', '1Z10.', '1Z11.', '1Z17.', '1Z18.', '1Z19.', '1Z1A.', '1Z1M.', '1Z1Q.', 'K051.', 'K052.', '1Z1N.', '1Z1P.', '1Z1R.', '1Z1S.')) as d
--	on l.PatID = d.PatID
--	where ReadCode in ('1Z12.','1Z13.','1Z14.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.','1Z1F.','1Z1G.','1Z1H.','1Z1J.','1Z1K.','1Z1L.','K053.','K054.','K055.', '1Z1f.', '1Z1a.', '1Z1b.', '1Z1c.', '1Z1c.', '1Z1e.', '1Z1T.', '1Z1V.', '1Z1W.', '1Z1X.', '1Z1Y.', '1Z1Z.', '2126E', '1Z10.', '1Z11.', '1Z17.', '1Z18.', '1Z19.', '1Z1A.', '1Z1M.', '1Z1Q.', 'K051.', 'K052.', '1Z1N.', '1Z1P.', '1Z1R.', '1Z1S.')
--0s

--Important codes
--truncate table outImpCodes
insert into [output.pingr.impCodes](PatID, date, importantCode)
select l.PatID, EntryDate as date,
	case
		when d.ReadCode in ('8CM1.','8CM10','8CM1000','8CM11','8CM1100','8CM12','8CM13','8CM1300','8CM14','8CM1400','8CM16','8CM17','8CM18','8CM4.','8CME.','8CMQ.','8CMW3','8CMW300','8CMb.','G870.','9367.','9EB5.','9G8..','9K9..','9NNd.','9NNf0','9Ng7.','9NgD.','9c0L0','9c0M.','9c0N.','9c0P.','ZV57C','ZV57C00','1Z01.','2JE..','8B2a.','8BA2.','8BAP.','8BAS.','8BAT.','8BAe.','8BJ1.','8H6A.','8H7L.','8H7g.','8HH7.','8IEE.') then 'palliative'
		when d.ReadCode like '2Jd%' or ReadCode in ('38QI.','38GD.','69D9.','38Qk.','38DW.','ZQ3T.','HNGNQRF75') then 'frail'
		when d.ReadCode in ('13CA.','13CV.','6AG..') then 'housebound'
		when d.ReadCode in ('13CW.') then 'notHousebound'
		when d.ReadCode in ('9Ot0.','9Ot1.','9Ot2.','9Ot3.', '9Ot4.') then 'CKDinvite'
		when d.ReadCode in ('9RX..') then 'Urine specimen declined'
		when d.ReadCode in ('9hE0.','9hE1.','9hE..') then 'CKD exception code'
	end as importantCode from #indicator as l
	inner join
		(select PatID, ReadCode, EntryDate from SIR_ALL_Records 
			inner join patients p on p.patid = SIR_ALL_Records.PatID and p.dead != 1 --and p.gpcode='P87016'
			where ReadCode like '2Jd%' or ReadCode in ('9Ot0.','9Ot1.','9Ot2.','9Ot3.', '9Ot4.','13CW.','13CA.','13CV.','6AG..','38QI.','38GD.','69D9.','38Qk.','38DW.','ZQ3T.','HNGNQRF75','8CM1.','8CM10','8CM1000','8CM11','8CM1100','8CM12','8CM13','8CM1300','8CM14','8CM1400','8CM16','8CM17','8CM18','8CM4.','8CME.','8CMQ.','8CMW3','8CMW300','8CMb.','G870.','9367.','9EB5.','9G8..','9K9..','9NNd.','9NNf0','9Ng7.','9NgD.','9c0L0','9c0M.','9c0N.','9c0P.','ZV57C','ZV57C00','1Z01.','2JE..','8B2a.','8BA2.','8BAP.','8BAS.','8BAT.','8BAe.','8BJ1.','8H6A.','8H7L.','8H7g.','8HH7.','8IEE.')) as d
	on l.PatID = d.PatID
	
--Contacts
--truncate table outContacts
--insert into [output.pingr.contacts](PatID, date, event)
--select PatID, date, event from #contacts

--------------------------------------------------------------------------------
--export data files
--------------------------------------------------------------------------------
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outContacts" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\contacts.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outImpCodes" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\important codes.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outDiagnoses" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\diagnoses.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outMeasures" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\measures.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outDemographics" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\demographics.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outImpOppCatsAndActions" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\impOppCatsAndActions.txt" -T -c'
--EXEC xp_cmdshell 'bcp "select * from P8701617062016.dbo.outIndicator" queryout "C:\Users\MPHStudent\Desktop\pingr\data\in\ckd.diagnosis.monitoring\indicator.txt" -T -c'
	 

-- 5-10min full SIR
-- 10s single practice