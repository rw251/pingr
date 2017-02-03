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

--Text
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pingr.text]') AND type in (N'U')) DROP TABLE [dbo].[pingr.text]
CREATE TABLE [pingr.text] (indicatorId varchar(512), textId varchar(512), text varchar(max))

--Patient-practice lookup table
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ptPractice]') AND type in (N'U')) DROP TABLE [dbo].[ptPractice]
CREATE TABLE [ptPractice] (PatID int, pracID varchar(1000))
insert into ptPractice
select patid, gpcode from patients

							---------------------------------------------------------------
							---------------------EXECUTE STORED PROCEDURES-----------------
							---------------------------------------------------------------

DECLARE	@return_value int

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
		when ReadCode in (select code from codeGroups where [group] = 'sbp') then 'SBP'
		when ReadCode in (select code from codeGroups where [group] = 'dbp') then 'DBP'
		when ReadCode in (select code from codeGroups where [group] = 'fev1') then 'FEV1'
	end as measure,
CodeValue as value, Source from SIR_ALL_Records
where ReadCode in (select code from codeGroups where [group] in ('egfr', 'acr', 'sbp', 'dbp','fev1'))
	and CodeValue is not NULL
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
	set @TELE = 5;
	set @FACE = 4;
	set @CON = 3;
	set @MED = 2;
	set @REC = 1;
	set @OTH = 0;
insert into [output.pingr.contacts](PatID, date, event)
select PatID, date,
	case
		when eventcode = 5 then 'Telephone contact'
		when eventcode = 4 then 'Face-to-face contact'
		when eventcode <=3 then 'Other code'
		end as event from
			(
				select PatID,
				max(
					case
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
						else @CON end
					) as eventcode,
					EntryDate as date from SIR_ALL_Records
					where PatID in (select distinct PatID from [dbo].[output.pingr.patActions])
					group by EntryDate, PatID
			) sub

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
		when ReadCode in (select code from codeGroups where [group] = 'MInow') then 'Myocardial infarction'
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
				then 'COPD exacerbation - uncoded'
		when ReadCode in (select code from codeGroups where [group] = 'pulRehabOfferedSs') then 'Pulmonary rehab offered'
		when ReadCode in (select code from codeGroups where [group] in ('asbp','adbp')) then 'Ambulatory BP reading'
	end as importantCode from SIR_ALL_Records
where (ReadCode in (select code from codeGroups where [group] in
	('pal', 'frail', 'housebound', 'bedridden', 'houseboundPermEx', 'ckdInvite', '9RX..', 'ckdTempEx', 'bpTempEx', 'posturalHypo',
	'phaeo', 'asthmaPermEx', 'asthmaQof', 'asthmaOther', 'asthmaSpiro', 'asthmaReview', 'asthmaRcp6', 'asthmaDrugs', 'pacemakerDefib',
	'sickSinus', '2/3heartBlock', 'porphyria', 'MInow', 'ASrepair', 'AS', 'gout', 'addisons', 'loopDiurAllergyAdverseReaction',
	'alphaAllergyAdverseReaction', 'PotSparDiurAllergyAdverseReaction', 'BBallergyAdverseReaction', 'CCBallergyAdverseReaction',
	'ARBallergyAdverseReaction', 'ACEIallergyAdverseReaction', 'thiazideAllergyAdverseReaction', 'whiteCoat', 'copdTempEx', 'pulRehabTempExSs',
	'mrc', 'CopdHosp','copdExacNonSs','copdExacSs','pulRehabOfferedSs'))
or ReadCode in ('fe62.','fe6i.','fe6j.','fe6s.', 'fe6t.','e311.','e312.','e315.','e316.','e3zF.','e3zG.','e3zm.','e3zn.','e3z5.','e3z6.','e3zA.',
					'e3zB.','e3zE.','e3zF.','e3zG.','e3zb.','e3zc.','e3zk.','e3zm.','e3zn.','e3zo.','e3zq.','e3zu.','e31b.','e758.','e75z.','e752.','e757.'))
and PatID in (select distinct PatID from [dbo].[output.pingr.patActions])

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
		'htnPermEx', 'oedema', 'oedemaPermEx', 'af','afPermEx', 'chdQof', 'hfQof','hfPermEx','anxiety','anxietyPermEx','hyperthyroid','hyperthyroidPermEx'))
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
