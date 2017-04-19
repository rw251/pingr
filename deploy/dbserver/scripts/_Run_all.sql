--changes from 5/4/16:
--using codegroups for contacts
--used source for contacts

--changes from last version:
--changed contacts
--added pingr.practiceList.practiceListSizes.eFI to run all

IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.run-all') DROP PROCEDURE [pingr.run-all];

GO
CREATE PROCEDURE [pingr.run-all] @ReportDate VARCHAR(10)
AS
SET NOCOUNT ON --exclude row count results for call from R
SET ANSI_WARNINGS OFF -- prevent the "Warning: Null value is eliminated by an aggregate or other SET operation." error though BB needs to check this out at some point

							---------------------------------------------------------------
							--------------CREATE TABLES USED BY STORED PROCEDURES----------
							---------------------------------------------------------------
							--------------i.e.data unique to each indicator query----------
							---------------------------------------------------------------
-----------------------------------------------
--Denominator data: patient ids and indicator--
--A row for each patient in the denominator  --
--for each indicator. Patients not in the    --
--numerator also get a "why"                 --
-----------------------------------------------
-- PatID 		Patient id
-- indicatorId	Indicator id
-- why			Why this patient is flagging
--				this indicator.
-----------------------------------------------
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.denominators]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.denominators]
CREATE TABLE [output.pingr.denominators] (PatID int, indicatorId varchar(1000), why varchar(max))

------------------------------------------------------------------------------------------
--Pt-level data: improvement opportunity categories and actions							--
------------------------------------------------------------------------------------------
-- PatID 			Patient id
-- indicatorId		Indicator id
-- actionCat		Determines the bar that this belongs in on the
--					"Patients with imp opps" chart
-- reasonNumber		The number of reasons for this action.
--					Could be used for prioritisation but not at present
-- pointsPerAction	Number of % points that this patient represents in this indicator
--					Used to prioritise. (data driven prioritisation)
-- priority			How important the action is. Could be used for (subjective)
--					prioritisation but not at present.
-- actionText		The big bold text displayed to the user. THIS IS THE FIELD
--					THAT DETERMINES WHETHER TO DEDUPLICATE. e.g. Two actions with
--					the same actionText will be collapsed into one.
-- supportingText	The text that appears after clicking "show more". On deduplication
--					we just pick one of the supportingTexts - though in future could
--					get more clever about this.
--------------------------------------------------------------------------------------------
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.patActions]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.patActions]
CREATE TABLE [output.pingr.patActions] (PatID int, indicatorId varchar(1000), actionCat varchar(1000), reasonNumber int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max))

------------------------------------------------------------------------------------------
--Org level actions
------------------------------------------------------------------------------------------
-- pracID 			Practice id
-- indicatorId		Indicator id
-- actionCat		Not currently used but perhaps if aggregation at ccg level is needed.
-- proportion		Proportion of patients affected by this indicator?? Not currently used.
-- numberPatients	Number of patients for this action. Not currently used. Could be used
--					for prioritisation
-- pointsPerAction	Number of % points that this action represents in this indicator
--					Used to prioritise. (data driven prioritisation)
-- priority			How important the action is. Could be used for (subjective)
--					prioritisation but not at present.
-- actionText		The big bold text displayed to the user. THIS IS THE FIELD
--					THAT DETERMINES WHETHER TO DEDUPLICATE. e.g. Two actions with
--					the same actionText will be collapsed into one.
-- supportingText	The text that appears after clicking "show more". On deduplication
--					we just pick one of the supportingTexts - though in future could
--					get more clever about this.
--------------------------------------------------------------------------------------------
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.orgActions]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.orgActions]
CREATE TABLE [output.pingr.orgActions] (pracID varchar(1000), indicatorId varchar(1000),  actionCat varchar(1000), proportion float, numberPatients int, pointsPerAction float, priority int, actionText varchar(1000), supportingText varchar(max))

--Quality indicator results
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.indicator]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.indicator]
CREATE TABLE [output.pingr.indicator] (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float)

--Outcome indicator results
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.indicatorOutcome]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.indicatorOutcome]
CREATE TABLE [output.pingr.indicatorOutcome] (indicatorId varchar(1000), practiceId varchar(1000), date date, patientCount int, eventCount int, denominator int, standardisedIncidence float, benchmark float)

--Text
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pingr.text]') AND type in (N'U')) DROP TABLE [dbo].[pingr.text]
CREATE TABLE [pingr.text] (indicatorId varchar(512), textId varchar(512), text varchar(max))

--Patient-practice lookup table
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ptPractice]') AND type in (N'U')) DROP TABLE [dbo].[ptPractice]
CREATE TABLE [ptPractice] (PatID int, pracID varchar(1000))
insert into ptPractice
select patid, gpcode from patients

--COPD patients
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pingr.copdPatients]') AND type in (N'U')) DROP TABLE [dbo].[pingr.copdPatients]
CREATE TABLE [pingr.copdPatients] (PatID int)

--The process indicator actions associated with the outcome indicators
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.indicatorMapping]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.indicatorMapping]
CREATE TABLE [output.pingr.indicatorMapping] (outcomeIndicatorId varchar(512), processIndicatorId varchar(512))
insert into [output.pingr.indicatorMapping]
values
('cvd.stroke.outcome', 'htn.treatment.bp'),
-- i.e. the actions for htn.treatment.bp will appear when viewing the cvd.stroke.outcome indicator.
('cvd.stroke.outcome', 'htn.undiagnosed.measures'),
('cvd.stroke.outcome', 'htn.undiagnosed.med')

							---------------------------------------------------------------
							---------------------EXECUTE STORED PROCEDURES-----------------
							---------------------------------------------------------------
DECLARE	@return_value int

--practice list and eFI FIRST

EXEC	@return_value = [dbo].[pingr.practiceList.practiceListSizes.eFI]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

--then rest of indicators
EXEC	@return_value = [dbo].[pingr.ckd.coding]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.ckd.undiagnosed]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.ckd.monitoring]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.ckd.treatment.bp]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.ckdAndDm.treatment.bp]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.ckdAndProt.treatment.bp]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.htn.treatment.bp]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.copd.exacerbation.rehab]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.htn.undiagnosed.med]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.htn.undiagnosed.measures]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.cvd.stroke.outcome]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

EXEC	@return_value = [dbo].[pingr.cvd.af.screening]
		@refdate = @ReportDate
IF @return_value != 0
BEGIN
	SELECT 1001;
	RETURN;
END

							---------------------------------------------------------------
							---------CREATE AND POPULATE PATIENT-LEVEL DATA TABLES---------
							---------------------------------------------------------------
							--------------i.e. data common to all queries------------------
							---------------------------------------------------------------

--physiological measures
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.measures]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.measures]
CREATE TABLE [output.pingr.measures] (PatID int, date date, measure varchar(100), value float, source varchar(20))
insert into [output.pingr.measures](PatID, date, measure, value, source)
select PatID, EntryDate as date,
	case
		when ReadCode in (select code from codeGroups where [group] = 'egfr') then 'eGFR'
		when ReadCode in (select code from codeGroups where [group] = 'acr') then 'ACR'
		when ReadCode in (select code from codeGroups where [group] = 'sbp') and Source != 'salfordt' then 'SBP'
		when ReadCode in (select code from codeGroups where [group] = 'dbp') and Source != 'salfordt' then 'DBP'
		when ReadCode in (select code from codeGroups where [group] = 'fev1') and Source != 'salfordt' then 'FEV1'
		when ReadCode in (select code from codeGroups where [group] = 'strokeQof') and Source != 'salfordt' then 'strokeHosp'
		when ReadCode in (select code from codeGroups where [group] = 'pulseRhythm') and Source != 'salfordt' then 'pulseRhythm'
	end as measure,
CodeValue as value, Source from SIR_ALL_Records
where
	(
		(ReadCode in (select code from codeGroups where [group] in ('egfr', 'acr', 'strokeQof')) and CodeValue is not NULL)
		or (ReadCode in (select code from codeGroups where [group] in ('strokeQof','pulseRhythm', 'sbp', 'dbp','fev1'))and Source != 'salfordt')
	)
	and PatID in (select distinct PatID from [dbo].[output.pingr.patActions])

--Contacts
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.contacts]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.contacts]
CREATE TABLE [output.pingr.contacts] (PatID int, date date, event varchar(100))
	DECLARE	@FACE int;
	DECLARE	@TELE int;
	DECLARE	@REC int;
	DECLARE	@CON int;
	DECLARE	@MED int;
	DECLARE	@OTH int;
	DECLARE	@HOSP int;
	DECLARE	@AE int;
	DECLARE	@TEST int;
	set @TELE = 7;
	set @AE = 6;
	set @HOSP = 5;
	set @FACE = 4;
	set @CON = 3;
	set @MED = 2;
	set @TEST = 1;
	set @OTH = 0;
insert into [output.pingr.contacts](PatID, date, event)
select PatID, date,
	case
		when eventcode = 7 then 'Telephone'
		when eventcode = 6 then 'A+E'
		when eventcode = 5 then 'Hospital'
		when eventcode = 4 then 'Face-to-face'
		--when eventcode = 3 then 'Other contact'
		when eventcode = 2 then 'Medication'
		when eventcode = 1 then 'Investigation'
		else null
		end as event from
			(
				select PatID,
--				max(
					case
						--when (ReadCode like 'ALLERGY%' OR ReadCode like 'EMIS' OR ReadCode like 'EGTON' OR ReadCode like 'CLEAT') then @CON
						when ReadCode in (select code from codeGroups where [group] = 'medication') and Source != 'salfordt' then @MED
						--when LEN(ReadCode) <=4 then @OTH
						--when ReadCode like '[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%' then @CON
						--when ReadCode like '0%' then @CON
						when ReadCode in (select code from codeGroups where [group] = 'f2f') and Source != 'salfordt' then @FACE
						--when ReadCode like '3%' then @CON
						when ReadCode in (select code from codeGroups where [group] = 'test') and Source != 'salfordt' then @TEST
						--when ReadCode like '6%' then @CON
						when ReadCode in (select code from codeGroups where [group] = 'hospital') and Source != 'salfordt' then @HOSP
						--when ReadCode like '8B%' then @CON
						when ReadCode in (select code from codeGroups where [group] = 'a+e') and Source != 'salfordt' then @AE
						when ReadCode in (select code from codeGroups where [group] = 'tel') and Source != 'salfordt' then @TELE
						--when ReadCode like '8H[ABCDHKMPQRSTUVWYZpckenmojiklprs]%' then @CON
						--when ReadCode like '8H[EFGIJLNOXdabgfhqtuvwxyz]%' then @REC
						--when ReadCode like '8[^BH]%' then @CON
						--when ReadCode like '9N3G%' then @CON
						--when ReadCode like '9%' then @REC
						--when ReadCode like '~%' then @CON
						--when ReadCode like '$%' then @REC
						when Source = 'salfordt' then @HOSP
						else NULL end
						
		--			) 
					as eventcode,
					EntryDate as date from SIR_ALL_Records
					where PatID in (select distinct PatID from [dbo].[output.pingr.patActions])
					group by EntryDate, PatID, ReadCode, Source
			) sub
WHERE eventcode in (1,2,4,5,6,7)

--Important codes
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.impCodes]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.impCodes]
CREATE TABLE [output.pingr.impCodes] (PatID int, date date, importantCode varchar(100))
insert into [output.pingr.impCodes](PatID, date, importantCode)
select PatID, EntryDate as date,
	case
		when ReadCode in (select code from codeGroups where [group] = 'pal') then 'Palliative'
		when ReadCode in (select code from codeGroups where [group] = 'frail') then 'Frail'
		when ReadCode in (select code from codeGroups where [group] = 'housebound') then 'Housebound'
		when ReadCode in (select code from codeGroups where [group] = 'bedridden') then 'Bedridden'
		when ReadCode in (select code from codeGroups where [group] = 'houseboundPermEx') then 'Not housebound'
		when ReadCode in (select code from codeGroups where [group] = 'ckdInvite') then 'CKD invite'
		when ReadCode in ('9RX..') then 'Urine specimen declined'
		when ReadCode in (select code from codeGroups where [group] = 'ckdTempEx') then 'CKD exception code'
		when ReadCode in (select code from codeGroups where [group] = 'bpTempEx') then 'BP exception code'
		when ReadCode in (select code from codeGroups where [group] = 'posturalHypo') then 'Postural hypotension'
		when ReadCode in (select code from codeGroups where [group] in ('asthmaOther', 'asthmaSpiro', 'asthmaReview', 'asthmaRcp6', 'asthmaDrugs')) then 'Asthma-related code'
		when ReadCode in (select code from codeGroups where [group] = 'pacemakerDefib') then 'Pacemaker or defibrillator'
		when ReadCode in (select code from codeGroups where [group] = 'sickSinus') then 'Sick sinus syndrome'
		when ReadCode in (select code from codeGroups where [group] = '2/3heartBlock') then 'Heart block'
		when ReadCode in (select code from codeGroups where [group] = 'ASrepair') then 'Aortic repair'
		when ReadCode in (select code from codeGroups where [group] = 'loopDiurAllergyAdverseReaction') then 'Loop Diuretic allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'alphaAllergyAdverseReaction') then 'Alpha Blocker allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'PotSparDiurAllergyAdverseReaction') then 'Potassium Sparing Diuretic allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'BBallergyAdverseReaction') then 'Beta Blocker allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'CCBallergyAdverseReaction') then 'Calcium Channel Blocker allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'ARBallergyAdverseReaction') then 'ARB allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'ACEIallergyAdverseReaction') then 'ACE Inhibitor  diuretic allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'thiazideAllergyAdverseReaction') then 'Thiazide Diuretic allergy or adverse reaction'
		when ReadCode in (select code from codeGroups where [group] = 'copdTempEx') then 'COPD exception code'
		when ReadCode in (select code from codeGroups where [group] = 'pulRehabTempExSs') then 'Pulmonary rehab exception code'
		when ReadCode in (select code from codeGroups where [group] = 'mrc') then 'MRC breathlessness scale'
		when ReadCode in (select code from codeGroups where [group] in ('CopdHosp','copdExacNonSs','copdExacSs')) then 'COPD exacerbation - coded'
		when	(((ReadCode in ('fe62.','fe6i.','fe6j.')and((CodeUnits like '%8%')or(CodeUnits like '%eight%') or(CodeUnits like '%6%') or(CodeUnits like '%six%')))
				or(ReadCode = 'fe6s.' and ((CodeUnits like '%2%') or(CodeUnits like '%two%')))
				or(ReadCode = 'fe6t.' and ((CodeUnits like '%3%') or(CodeUnits like '%three%'))))
				or(ReadCode in ('e311.','e312.','e315.','e316.','e3zF.','e3zG.','e3zm.','e3zn.','e3z5.','e3z6.','e3zA.',
					'e3zB.','e3zE.','e3zF.','e3zG.','e3zb.','e3zc.','e3zk.','e3zm.','e3zn.','e3zo.','e3zq.','e3zu.','e31b.','e758.','e75z.','e752.','e757.')))
		and PatID in (select PatID from [pingr.copdPatients])
				then 'COPD exacerbation - uncoded'
		when ReadCode in (select code from codeGroups where [group] = 'pulRehabOfferedSs') then 'Pulmonary rehab offered'
		when ReadCode in (select code from codeGroups where [group] in ('asbp','adbp')) then 'Ambulatory BP reading'
		when ReadCode in (select code from codeGroups where [group] in ('strokeQof')) and Source = 'salfordt' then '?Stroke in hospital'
	end as importantCode from SIR_ALL_Records
where (ReadCode in (select code from codeGroups where [group] in
	('pal', 'frail', 'housebound', 'bedridden', 'houseboundPermEx', 'ckdInvite', '9RX..', 'ckdTempEx', 'bpTempEx', 'posturalHypo',
	'asthmaOther', 'asthmaSpiro', 'asthmaReview', 'asthmaRcp6', 'asthmaDrugs', 'pacemakerDefib',
	'sickSinus', '2/3heartBlock', 'ASrepair', 'loopDiurAllergyAdverseReaction',
	'alphaAllergyAdverseReaction', 'PotSparDiurAllergyAdverseReaction', 'BBallergyAdverseReaction', 'CCBallergyAdverseReaction',
	'ARBallergyAdverseReaction', 'ACEIallergyAdverseReaction', 'thiazideAllergyAdverseReaction', 'copdTempEx', 'pulRehabTempExSs',
	'mrc', 'CopdHosp','copdExacNonSs','copdExacSs','pulRehabOfferedSs','asbp','adbp')))
	or	((((ReadCode in ('fe62.','fe6i.','fe6j.')and((CodeUnits like '%8%')or(CodeUnits like '%eight%') or(CodeUnits like '%6%') or(CodeUnits like '%six%')))
				or(ReadCode = 'fe6s.' and ((CodeUnits like '%2%') or(CodeUnits like '%two%')))
				or(ReadCode = 'fe6t.' and ((CodeUnits like '%3%') or(CodeUnits like '%three%'))))
				or(ReadCode in ('e311.','e312.','e315.','e316.','e3zF.','e3zG.','e3zm.','e3zn.','e3z5.','e3z6.','e3zA.',
					'e3zB.','e3zE.','e3zF.','e3zG.','e3zb.','e3zc.','e3zk.','e3zm.','e3zn.','e3zo.','e3zq.','e3zu.','e31b.','e758.','e75z.','e752.','e757.')))
		and PatID in (select PatID from [pingr.copdPatients]))
	or ReadCode in (select code from codeGroups where [group] in ('strokeQof')) and Source = 'salfordt'

--Diagnoses
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.diagnoses]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.diagnoses]
CREATE TABLE [output.pingr.diagnoses] (PatID int, date date, diagnosis varchar(100), subcategory varchar(100))
insert into [output.pingr.diagnoses](PatID, date, diagnosis, subcategory)
select PatID, EntryDate as date,
	case --MUST INCLUDE THE SUBCAT CODES
		when ReadCode in (select code from codeGroups where [group] in ('ckd35','ckdPermEx')) then 'CKD'
		when ReadCode in (select code from codeGroups where [group] in ('dm','dmPermEx')) then 'Diabetes'
		when ReadCode in (select code from codeGroups where [group] = 'phaeo') then 'Phaeochromocytoma'
		when ReadCode in (select code from codeGroups where [group] in ('asthmaQof', 'asthmaPermEx')) then 'Asthma'
		when ReadCode in (select code from codeGroups where [group] = 'porphyria') then 'Porphyria'
		when ReadCode in (select code from codeGroups where [group] = 'MInow') then 'Post-MI'
		when ReadCode in (select code from codeGroups where [group] = 'AS') then 'Aortic stenosis'
		when ReadCode in (select code from codeGroups where [group] = 'gout') then 'Gout'
		when ReadCode in (select code from codeGroups where [group] = 'addisons') then 'Addisons'
		when ReadCode in (select code from codeGroups where [group] = 'whiteCoat') then 'White coat hypertension'
		when ReadCode in (select code from codeGroups where [group] in ('copdQof', 'copdPermEx')) then 'COPD'
		when ReadCode in (select code from codeGroups where [group] = 'unstableAngina') then 'Unstable angina'
		when ReadCode in (select code from codeGroups where [group] in ('htnQof','htnPermEx')) then 'Hypertension'
		when ReadCode in (select code from codeGroups where [group] in ('oedema','oedemaPermEx')) then 'Oedema'
		when ReadCode in (select code from codeGroups where [group] in ('af','afPermEx')) then 'Atrial Fibrillation'
		when ReadCode in (select code from codeGroups where [group] = 'chdQof') then 'Ischaemic Heart Disease'
		when ReadCode in (select code from codeGroups where [group] in ('hfQof','hfPermEx')) then 'Heart Failure'
		when ReadCode in (select code from codeGroups where [group] in ('anxiety','anxietyPermEx')) then 'Anxiety'
		when ReadCode in (select code from codeGroups where [group] in ('hyperthyroid','hyperthyroidPermEx')) then 'Hyperthyroidism'
		when ReadCode in (select code from codeGroups where [group] in ('strokeQof')) then 'Stroke'
		when ReadCode in (select code from codeGroups where [group] in ('tiaQof')) then 'TIA'
	end as diagnosis,
	case --MUST APPEAR IN DIAGNOSIS CASE WHENS ABOVE
		when ReadCode in ('1Z12.','K053.') then 'Stage 3'
		when ReadCode in ('1Z13.','K054.') then 'Stage 4'
		when ReadCode in ('1Z14.','K055.') then 'Stage 5'
		when ReadCode in ('1Z15.') then 'Stage 3a'
		when ReadCode in ('1Z16.') then 'Stage 3b'
		when ReadCode in ('1Z1B.') then 'Stage 3 A2/3'
		when ReadCode in ('1Z1C.') then 'Stage 3 A1'
		when ReadCode in ('1Z1D.') then 'Stage 3a A2/3'
		when ReadCode in ('1Z1E.', '1Z1T.') then 'Stage 3a A1'
		when ReadCode in ('1Z1F.') then 'Stage 3b A2/3'
		when ReadCode in ('1Z1G.', '1Z1X.') then 'Stage 3b A1'
		when ReadCode in ('1Z1H.') then 'Stage 4 A2/3'
		when ReadCode in ('1Z1J.', '1Z1a.') then 'Stage 4 A1'
		when ReadCode in ('1Z1K.') then 'Stage 5 A2/3'
		when ReadCode in ('1Z1L.', '1Z1d.') then 'Stage 5 A1'
		when ReadCode in ('1Z1V.') then 'Stage 3a A2'
		when ReadCode in ('1Z1W.') then 'Stage 3a A3'
		when ReadCode in ('1Z1Y.') then 'Stage 3b A2'
		when ReadCode in ('1Z1Z.') then 'Stage 3b A2'
		when ReadCode in ('1Z1b.') then 'Stage 4 A2'
		when ReadCode in ('1Z1c.') then 'Stage 4 A3'
		when ReadCode in ('1Z1e.') then 'Stage 5 A2'
		when ReadCode in ('1Z1f.') then 'Stage 5 A3'
		when ReadCode in ('2126E') then 'CKD resolved'
		when ReadCode in ('1Z10.') then 'Stage 1'
		when ReadCode in ('1Z11.') then 'Stage 2'
		when ReadCode in ('1Z17.') then 'Stage 1 A2/A3'
		when ReadCode in ('1Z18.', '1Z1M.') then 'Stage 1 A1'
		when ReadCode in ('1Z19.') then 'Stage 2 A2/A3'
		when ReadCode in ('1Z1A.', '1Z1Q.') then 'Stage 2 A1'
		when ReadCode in ('1Z1N.') then 'Stage 1 A2'
		when ReadCode in ('1Z1P.') then 'Stage 1 A3'
		when ReadCode in ('1Z1R.') then 'Stage 2 A2'
		when ReadCode in ('1Z1S.') then 'Stage 2 A3'
		when ReadCode in ('K051.') then 'Stage 1'
		when ReadCode in ('K052.') then 'Stage 2'
		when ReadCode in (select code from codeGroups where [group] in ('dmPermEx')) then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] in ('asthmaPermEx')) then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] in ('copdPermEx')) then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'htnPermEx') then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'oedemaPermEx') then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'afPermEx') then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'hfPermEx') then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'anxietyPermEx') then 'Resolved'
		when ReadCode in (select code from codeGroups where [group] = 'hyperthyroidPermEx') then 'Resolved'
	end as subcategory from SIR_ALL_Records
where
	(
		ReadCode in (select code from codeGroups where [group] in ('ckd35','ckdPermEx', 'dm','dmPermEx','phaeo','asthmaQof',
		'asthmaPermEx','porphyria','MInow','AS','gout','addisons','whiteCoat','dmPermEx','asthmaPermEx', 'copdQof', 'copdPermEx', 'htnQof',
		'htnPermEx', 'oedema', 'oedemaPermEx', 'af','afPermEx', 'chdQof', 'hfQof','hfPermEx','anxiety','anxietyPermEx','hyperthyroid','hyperthyroidPermEx',
		'strokeQof','tiaQof'))
		or ReadCode in ('1Z12.','K053.','1Z13.','K054.','1Z14.','K055.','1Z15.','1Z16.','1Z1B.','1Z1C.','1Z1D.','1Z1E.', '1Z1T.',
		'1Z1F.','1Z1G.','1Z1X.','1Z1H.','1Z1J.', '1Z1a.','1Z1K.','1Z1L.', '1Z1d.','1Z1V.','1Z1W.','1Z1Y.','1Z1Z.','1Z1b.','1Z1c.',
		'1Z1e.','1Z1f.','2126E','1Z10.','1Z11.','1Z17.','1Z18.', '1Z1M.','1Z19.','1Z1A.', '1Z1Q.','1Z1N.','1Z1P.','1Z1R.','1Z1S.','K051.','K052.')
	)
and PatID in (select distinct PatID from [dbo].[output.pingr.patActions])

--Demographics
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.demographics]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.demographics]
CREATE TABLE [output.pingr.demographics] (PatID int, nhsNumber bigint, age int, sex varchar(100), pracID varchar(1000))
insert into [output.pingr.demographics]
select p.patid, n.nhsNumber, YEAR (@ReportDate) - year_of_birth as age, sex, gpcode from dbo.patients p
inner join patientsNHSNumbers n on n.patid = p.patid

SELECT 0
RETURN
