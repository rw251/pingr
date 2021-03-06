--to quickly put new *lists* of codes into this document
--use find / replace function
--change dropdown at bottom to use 'regular expressions'
--in 'find what' field put: ^{[A-Za-z0-9.][A-Za-z0-9.][A-Za-z0-9.][A-Za-z0-9.][A-Za-z0-9.]}$
--this finds all 5 digit read code values
--replace with whatever you want, with \1 representing the read code
--e.g. ('\1', 'pal'),
--can be referred to in a query like a temp table, but without the '#'
IF OBJECT_ID('dbo.codeGroups', 'U') IS NOT NULL DROP TABLE dbo.codeGroups;
CREATE TABLE codeGroups (code varchar(512), [group] varchar(512));
CREATE NONCLUSTERED INDEX [ix_codegroups_group] ON [dbo].[codeGroups] 
(
	[group] ASC
)
INCLUDE ( [code]) WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY];

insert into codeGroups
values

--changes from last version
	--removed some dead codes

					----------------------------------------------
					---ALLERGIES AND ADVERSE REACTIONS------------
					----------------------------------------------
--THIAZIDES
--from codelist creator 25/10/16 Read v2 April 2016  "synonyms": ["thiazide", "AMILORIDE", "amiloride", "BENDROFLUMETHIAZIDE", "bendroflumethiazide","bendrofluazide","CHLORTALIDONE","chlortalidone", "chlorthalidone", "Chlorothiazide",  "CLOPAMIDE",  "clopamide",  "CO-AMILOZIDE",   "co-amilozide","CO-FLUMACTONE", "co-flumactone", "co-tenidone", "CO-TENIDONE", "CO-TRIAMTERZIDE", "co-triamterzide", "CO-ZIDOCAPT", "co-zidocapt", "CYCLOPENTHIAZIDE","cyclopenthiazide", "chorTHalidone","HYDROCHLOROTHIAZIDE","hydrochlorothiazide","Hydroflumethiazide","INDAPAMIDE","indapamide","METOLAZONE","metolazone","HYDROCHLOROTHIAZIDE","XIPAMIDE","xipamide"
	('TJE40', 'thiazideAllergyAdverseReaction'),
	--('TJE43', 'thiazideAllergyAdverseReaction'), amiloride (is potassium sparing)
	('TJE30', 'thiazideAllergyAdverseReaction'),
	('TJE3.', 'thiazideAllergyAdverseReaction'),
	('TJE31', 'thiazideAllergyAdverseReaction'),
	('TJE32', 'thiazideAllergyAdverseReaction'),
	('TJE33', 'thiazideAllergyAdverseReaction'),
	('TJE34', 'thiazideAllergyAdverseReaction'),
	('TJE35', 'thiazideAllergyAdverseReaction'),
	('TJE36', 'thiazideAllergyAdverseReaction'),
	('TJE3z', 'thiazideAllergyAdverseReaction'),
	('U60E3', 'thiazideAllergyAdverseReaction'),
	('8I78.', 'thiazideAllergyAdverseReaction'),
	
--ACE-I
--from codelist creator 25/10/16 Read v2 April 2016   "synonyms": ["ace inhibitor", "angiotensin converting enzyme inhibitor", "CAPTOPRIL", "captopril", "CO-ZIDOCAPT", "co-zidocapt", "ENALAPRIL", "enalapril", "FOSINOPRIL", "fosinopril", "IMIDAPRIL", "imidapril", "LISINOPRIL", "lisinopril", "MOEXIPRIL", "PERINDOPRIL", "perindopril", "QUINAPRIL", "quinapril", "RAMIPRIL", "ramipril", "TRANDOLAPRIL", "trandolapril", "Cilazapril", "angiotensin-converting-enzyme"]
	('ZV14D', 'ACEIallergyAdverseReaction'),
	('U60C4', 'ACEIallergyAdverseReaction'),
	('TJC77', 'ACEIallergyAdverseReaction'),
	('TJC78', 'ACEIallergyAdverseReaction'),
	('TJC79', 'ACEIallergyAdverseReaction'),
	('8I74.', 'ACEIallergyAdverseReaction'),
	('8I3D.', 'ACEIallergyAdverseReaction'), --Angiotensin converting enzyme inhibitor declined
	('8I28.', 'ACEIallergyAdverseReaction'),
	('8I2H.', 'ACEIallergyAdverseReaction'),
	('8B6T.', 'ACEIallergyAdverseReaction'),
	('8B6Q.', 'ACEIallergyAdverseReaction'), --Patient on maximal tolerated angiotensin converting enzyme inhibitor therapy
	('14LM.', 'ACEIallergyAdverseReaction'),

--ARB
--from codelist creator 25/10/16 Read v2 April 2016 "synonyms": ["ARB", "angiotensin", "VALSARTAN","valsartan","AZILSARTAN","azilsartan","CANDESARTAN","candesartan","EPROSARTAN","eprosartan","IRBESARTAN","irbesartan","LOSARTAN","losartan","OLMESARTAN","olesartan","olmesartan","TELMISARTAN","telmisartan","VALSARTAN","valsartan"]
('ZV14E', 'ARBallergyAdverseReaction'),
('U60CB', 'ARBallergyAdverseReaction'),
('8I75.', 'ARBallergyAdverseReaction'),
('8I3P.', 'ARBallergyAdverseReaction'),--Angiotensin II receptor antagonist declined
('8I2H.', 'ARBallergyAdverseReaction'),
('8B6T.', 'ARBallergyAdverseReaction'),--Patient on maximal tolerated angiotensin II receptor antagonist therapy
('14LN.', 'ARBallergyAdverseReaction'),

--CCB
--from codelist creator 25/10/16 Read v2 April 2016 "synonyms": [ "calcium channel blocker", "AMLODIPINE", "amlodipine", "DILTIAZEM", "diltiazem", "FELODIPINE", "felodipine", "ISRADIPINE", "isradipine", "LACIDIPINE", "lacidipine", "LERCANIDIPINE", "lercanidipine", "NICARDIPINE", "nicardipine", "NIFEDIPINE", "nifedipine", "NIMODIPINE", "nimodipine", "VERAPAMIL", "verapamil"]
('TJC46', 'CCBallergyAdverseReaction'),
('TJC47', 'CCBallergyAdverseReaction'),
('U60C1', 'CCBallergyAdverseReaction'),
('8I77.', 'CCBallergyAdverseReaction'),
('8I3I.', 'CCBallergyAdverseReaction'),
('8I2B.', 'CCBallergyAdverseReaction'),

--BB
--from codelist creator 25/10/16 Read v2 April 2016 "synonyms": ["beta blocker", "TIMOLOL", "timolol", "CARTEOLOL", "carteolol", "Carvedilol", "LEVOBUNOLOL", "levobunolol", "NADOLOL", "nadolol", "OXPRENOLOL", "oxprenolol", "PINDOLOL", "pindolol", "PROPRANOLOL", "propranolol", "SOTALOL", "sotalol", "ACEBUTOLOL", "acebutolol", "ATENOLOL", "atenolol", "BETAXOLOL", "betaxolol", "BISOPROLOL", "bisoprolol", "BISOPROLOL", "CELIPROLOL", "celiprolol", "CO-TENIDONE", "co-tenidone", "ESMOLOL", "esmolol", "METOPROLOL", "metoprolol", "NEBIVOLOL", "nebivolol", "practolol", "labetalol"]
('ZVu6i', 'BBallergyAdverseReaction'),
('ZVu6o', 'BBallergyAdverseReaction'),
('ZVu6q', 'BBallergyAdverseReaction'),
('ZV14C', 'BBallergyAdverseReaction'),
('U60B9', 'BBallergyAdverseReaction'),
('U60BA', 'BBallergyAdverseReaction'),
('U60BB', 'BBallergyAdverseReaction'),
('U60B7', 'BBallergyAdverseReaction'),
('TJC61', 'BBallergyAdverseReaction'),
('TJC6.', 'BBallergyAdverseReaction'),
('TJC62', 'BBallergyAdverseReaction'),
('TJC63', 'BBallergyAdverseReaction'),
('TJC64', 'BBallergyAdverseReaction'),
('TJC65', 'BBallergyAdverseReaction'),
('TJC66', 'BBallergyAdverseReaction'),
('TJC67', 'BBallergyAdverseReaction'),
('TJC68', 'BBallergyAdverseReaction'),
('TJC6z', 'BBallergyAdverseReaction'),
('TJC00', 'BBallergyAdverseReaction'),
('TJC02', 'BBallergyAdverseReaction'),
('14LL.', 'BBallergyAdverseReaction'),
('8IAS.', 'BBallergyAdverseReaction'),
('8IAT.', 'BBallergyAdverseReaction'),
('8IAV.', 'BBallergyAdverseReaction'),
('8I73.', 'BBallergyAdverseReaction'),
('8I7K.', 'BBallergyAdverseReaction'),
('8I7L.', 'BBallergyAdverseReaction'),
('8I7M.', 'BBallergyAdverseReaction'),
('8I36.', 'BBallergyAdverseReaction'),
('8I26.', 'BBallergyAdverseReaction'),
('8I2g.', 'BBallergyAdverseReaction'),
('8I2h.', 'BBallergyAdverseReaction'),
('8I2i.', 'BBallergyAdverseReaction'),
('8B6V.', 'BBallergyAdverseReaction'),

--Potassium sparing diuretics
--from codelist creator 25/10/16 Read v2 April 2016 "synonyms": ["potassium sparing", "AMILORIDE", "amiloride", "potassium-sparing", "CO-AMILOFRUSE", "co-amilofruse", "CO-AMILOZIDE", "co-amilozide", "CO-TRIAMTERZIDE", "co-triamterzide", "TRIAMTERENE", "CO-FLUMACTONE", "co-flumactone", "EPLERENONE", "eplerenone", "SPIRONOLACTONE", "spironolactone"]
('TJE43', 'PotSparDiurAllergyAdverseReaction'),
('TJE44', 'PotSparDiurAllergyAdverseReaction'),
('TJE45', 'PotSparDiurAllergyAdverseReaction'),
('8I3K0', 'PotSparDiurAllergyAdverseReaction'),
('8I3K1', 'PotSparDiurAllergyAdverseReaction'),
('8I2L.', 'PotSparDiurAllergyAdverseReaction'),
('8I2D0', 'PotSparDiurAllergyAdverseReaction'),
('U60E5', 'PotSparDiurAllergyAdverseReaction'),

--Alpha blocker
--from codelist creator 25/10/16 Read v2 April 2016 "synonyms": ["Alpha-adrenoceptor", "alpha adrenoceptor", "ALFUZOSIN", "alfuzosin","DOXAZOSIN", "doxazosin", "INDORAMIN", "indoramin","PRAZOSIN","prazosin","TAMSULOSIN","tamsulosin","TERAZOSIN","terazosin"]
('TJC76', 'alphaAllergyAdverseReaction'),
('8I79.', 'alphaAllergyAdverseReaction'),
('TJB31', 'alphaAllergyAdverseReaction'),
('U60C7', 'alphaAllergyAdverseReaction'),
('U60B6', 'alphaAllergyAdverseReaction'),

--Loop diuretics
--from codelist creator 25/10/16 Read v2 April 2016   "synonyms": ["loop diuretic","BUMETANIDE","bumetanide","CO-AMILOFRUSE","co-amilofruse","FUROSEMIDE","furosemide","frusemide","TORASEMIDE","torasemide","etacrynic","piretanide","ethacrynic"]
('TJE41', 'loopDiurAllergyAdverseReaction'),
('TJE42', 'loopDiurAllergyAdverseReaction'),
('U60E4', 'loopDiurAllergyAdverseReaction'),

----------------------------------------------
---OTHER CODES--------------------------------
----------------------------------------------
--anxiety
--from code list cretor 3/2/17 Read v2 April 2016   "synonyms":     "anxiety",   "anxious",   "panic",   "nerves",   "nervous",   "neurotic",   "hysteria",   "phobia",   "fear",   "phobic",   "stress",   "adjustment"
('TG11.', 'anxiety'), --
('TG110', 'anxiety'), --
('TG111', 'anxiety'), --
('TG112', 'anxiety'), --
('TG11z', 'anxiety'), --
('TG1..', 'anxiety'), --
('Eu930', 'anxiety'), --
('Eu931', 'anxiety'), --
('Eu932', 'anxiety'), --
('Eu606', 'anxiety'), --
('Eu40.', 'anxiety'), --
('Eu400', 'anxiety'), --
('Eu401', 'anxiety'), --
('Eu402', 'anxiety'), --
('Eu403', 'anxiety'), --
('Eu40y', 'anxiety'), --
('Eu40z', 'anxiety'), --
('Eu4..', 'anxiety'), --
('Eu41.', 'anxiety'), --
('Eu410', 'anxiety'), --
('Eu411', 'anxiety'), --
('Eu412', 'anxiety'), --
('Eu413', 'anxiety'), --
('Eu41y', 'anxiety'), --
('Eu41z', 'anxiety'), --
('Eu43.', 'anxiety'), --
('Eu054', 'anxiety'), --
('E2D0.', 'anxiety'), --
('E2D00', 'anxiety'), --
('E2D01', 'anxiety'), --
('E2D0z', 'anxiety'), --
('E2920', 'anxiety'), --
('E292.', 'anxiety'), --
('E2924', 'anxiety'), --
('E292y', 'anxiety'), --
('E292z', 'anxiety'), --
('E280.', 'anxiety'), --
('E28..', 'anxiety'), --
('E281.', 'anxiety'), --
('E282.', 'anxiety'), --
('E283.', 'anxiety'), --
('E284.', 'anxiety'), --
('E28z.', 'anxiety'), --
('E2021', 'anxiety'), --
('E202.', 'anxiety'), --
('E2022', 'anxiety'), --
('E2020', 'anxiety'), --
('E2023', 'anxiety'), --
('E2024', 'anxiety'), --
('E2025', 'anxiety'), --
('E2026', 'anxiety'), --
('E2027', 'anxiety'), --
('E2028', 'anxiety'), --
('E2029', 'anxiety'), --
('E202A', 'anxiety'), --
('E202B', 'anxiety'), --
('E202C', 'anxiety'), --
('E202D', 'anxiety'), --
('E202E', 'anxiety'), --
('E202z', 'anxiety'), --
('E200.', 'anxiety'), --
('E2000', 'anxiety'), --
('E2001', 'anxiety'), --
('E2002', 'anxiety'), --
('E2003', 'anxiety'), --
('E2004', 'anxiety'), --
('E2005', 'anxiety'), --
('E200z', 'anxiety'), --
('E20..', 'anxiety'), --
('E201.', 'anxiety'), --
('E204.', 'anxiety'), --
('8T23.', 'anxiety'), --
('8HHp.', 'anxiety'), --
('8G94.', 'anxiety'), --
('38Du1', 'anxiety'), --
('2258.', 'anxiety'), --
('225J.', 'anxiety'), --
('2259.', 'anxiety'), --
('1B1V.', 'anxiety'), --
('1B12.', 'anxiety'), --
('1B13.', 'anxiety'), --
('173f.', 'anxiety'), --

--anxiety resolved
('2126J', 'anxietyPermEx'),--	00	Anxiety resolved

--ACR
--from SS
('46TC.', 'acr'),
('46TD.', 'acr'),
	
--Addisons
--from codelist creator 26/10/16 Read v2 April 2016   "synonyms": ["addison"]
('F3950', 'addisons'),
('C1541', 'addisons'),
('A176.', 'addisons'),

--AF atrial fibrillation
--from: Atrial fibrillation ruleset_v34.0
--http://content.digital.nhs.uk/media/21000/Atrial-fibrillation-rulesetv340/pdf/Atrial_fibrillation_ruleset_v34.0.pdf
('G573.', 'af'), --	00	Atrial fibrillation and flutter
('G5730', 'af'), --	00	Atrial fibrillation
('G5732', 'af'), --	00	Paroxysmal atrial fibrillation
('G5733', 'af'), --	00	Non-rheumatic atrial fibrillation
('G5734', 'af'), --	00	Permanent atrial fibrillation
('G5735', 'af'), --	00	Persistent atrial fibrillation
('G5737', 'af'), --	00	Chronic atrial fibrillation
('G5738', 'af'), --	00	Typical atrial flutter
('G5739', 'af'), --	00	Atypical atrial flutter
('G573z', 'af'), --	00	Atrial fibrillation and flutter NOS

--AF resolved atrial fibrillation
--from: Atrial fibrillation ruleset_v34.0
--http://content.digital.nhs.uk/media/21000/Atrial-fibrillation-rulesetv340/pdf/Atrial_fibrillation_ruleset_v34.0.pdf
('212R.', 'afPermEx'), --	00	Atrial fibrillation resolved

--AF temp ex
--from: Atrial fibrillation ruleset_v34.0
--http://content.digital.nhs.uk/media/21000/Atrial-fibrillation-rulesetv340/pdf/Atrial_fibrillation_ruleset_v34.0.pdf
('9hF1.', 'afTempEx'),
('9hF0.', 'afTempEx'),
('9hF..', 'afTempEx'),

--chd
--from: Secondary Prevention of Coronary Heart Disease ruleset_v32.0
--http://content.digital.nhs.uk/media/17368/Secondary-Prevention-of-Coronary-Heart-Disease-rulesetv320/pdf/Secondary_Prevention_of_Coronary_Heart_Disease_ruleset_v32.0.pdf
('G3...', 'chdQof'), --	00	Ischaemic heart disease
('G30..', 'chdQof'), --	00	Acute myocardial infarction
('G300.', 'chdQof'), --	00	Acute anterolateral infarction
('G301.', 'chdQof'), --	00	Other specified anterior myocardial infarction
('G3010', 'chdQof'), --	00	Acute anteroapical infarction
('G3011', 'chdQof'), --	00	Acute anteroseptal infarction
('G301z', 'chdQof'), --	00	Anterior myocardial infarction NOS
('G302.', 'chdQof'), --	00	Acute inferolateral infarction
('G303.', 'chdQof'), --	00	Acute inferoposterior infarction
('G304.', 'chdQof'), --	00	Posterior myocardial infarction NOS
('G305.', 'chdQof'), --	00	Lateral myocardial infarction NOS
('G306.', 'chdQof'), --	00	True posterior myocardial infarction
('G307.', 'chdQof'), --	00	Acute subendocardial infarction
('G3070', 'chdQof'), --	00	Acute non-Q wave infarction
('G3071', 'chdQof'), --	00	Acute non-ST segment elevation myocardial infarction
('G308.', 'chdQof'), --	00	Inferior myocardial infarction NOS
('G309.', 'chdQof'), --	00	Acute Q-wave infarct
('G30B.', 'chdQof'), --	00	Acute posterolateral myocardial infarction
('G30X.', 'chdQof'), --	00	Acute transmural myocardial infarction of unspecified site
('G30X0', 'chdQof'), --	00	Acute ST segment elevation myocardial infarction
('G30y.', 'chdQof'), --	00	Other acute myocardial infarction
('G30y0', 'chdQof'), --	00	Acute atrial infarction
('G30y1', 'chdQof'), --	00	Acute papillary muscle infarction
('G30y2', 'chdQof'), --	00	Acute septal infarction
('G30yz', 'chdQof'), --	00	Other acute myocardial infarction NOS
('G30z.', 'chdQof'), --	00	Acute myocardial infarction NOS
('G31..', 'chdQof'), --	00	Other acute and subacute ischaemic heart disease
--G310.	00	Postmyocardial infarction syndrome
('G311.', 'chdQof'), --	00	Preinfarction syndrome
('G3110', 'chdQof'), --	00	Myocardial infarction aborted
('G3111', 'chdQof'), --	00	Unstable angina
('G3112', 'chdQof'), --	00	Angina at rest
('G3113', 'chdQof'), --	00	Refractory angina
('G3114', 'chdQof'), --	00	Worsening angina
('G3115', 'chdQof'), --	00	Acute coronary syndrome
('G311z', 'chdQof'), --	00	Preinfarction syndrome NOS
('G312.', 'chdQof'), --	00	Coronary thrombosis not resulting in myocardial infarction
('G31y.', 'chdQof'), --	00	Other acute and subacute ischaemic heart disease
('G31y0', 'chdQof'), --	00	Acute coronary insufficiency
('G31y1', 'chdQof'), --	00	Microinfarction of heart
('G31y2', 'chdQof'), --	00	Subendocardial ischaemia
('G31y3', 'chdQof'), --	00	Transient myocardial ischaemia
('G31yz', 'chdQof'), --	00	Other acute and subacute ischaemic heart disease NOS
('G32..', 'chdQof'), --	00	Old myocardial infarction
('G33..', 'chdQof'), --	00	Angina pectoris
('G330.', 'chdQof'), --	00	Angina decubitus
('G3300', 'chdQof'), --	00	Nocturnal angina
('G330z', 'chdQof'), --	00	Angina decubitus NOS
--G331.	00	Prinzmetal's angina
--G332.	00	Coronary artery spasm
('G33z.', 'chdQof'), --	00	Angina pectoris NOS
('G33z0', 'chdQof'), --	00	Status anginosus
('G33z1', 'chdQof'), --	00	Stenocardia
('G33z2', 'chdQof'), --	00	Syncope anginosa
('G33z3', 'chdQof'), --	00	Angina on effort
('G33z4', 'chdQof'), --	00	Ischaemic chest pain
('G33z5', 'chdQof'), --	00	Post infarct angina
('G33z6', 'chdQof'), --	00	New onset angina
('G33z7', 'chdQof'), --	00	Stable angina
('G33zz', 'chdQof'), --	00	Angina pectoris NOS
('G34..', 'chdQof'), --	00	Other chronic ischaemic heart disease
('G340.', 'chdQof'), --	00	Coronary atherosclerosis
('G3400', 'chdQof'), --	00	Single coronary vessel disease
('G3401', 'chdQof'), --	00	Double coronary vessel disease
('G342.', 'chdQof'), --	00	Atherosclerotic cardiovascular disease
('G343.', 'chdQof'), --	00	Ischaemic cardiomyopathy
('G344.', 'chdQof'), --	00	Silent myocardial ischaemia
('G34y.', 'chdQof'), --	00	Other specified chronic ischaemic heart disease
('G34y0', 'chdQof'), --	00	Chronic coronary insufficiency
('G34y1', 'chdQof'), --	00	Chronic myocardial ischaemia
('G34yz', 'chdQof'), --	00	Other specified chronic ischaemic heart disease NOS
('G34z.', 'chdQof'), --	00	Other chronic ischaemic heart disease NOS
('G34z0', 'chdQof'), --	00	Asymptomatic coronary heart disease
('G35..', 'chdQof'), --	00	Subsequent myocardial infarction
('G350.', 'chdQof'), --	00	Subsequent myocardial infarction of anterior wall
('G351.', 'chdQof'), --	00	Subsequent myocardial infarction of inferior wall
('G353.', 'chdQof'), --	00	Subsequent myocardial infarction of other sites
('G35X.', 'chdQof'), --	00	Subsequent myocardial infarction of unspecified site
('G38..', 'chdQof'), --	00	Postoperative myocardial infarction
('G380.', 'chdQof'), --	00	Postoperative transmural myocardial infarction of anterior wall
('G381.', 'chdQof'), --	00	Postoperative transmural myocardial infarction of inferior wall
('G382.', 'chdQof'), --	00	Postoperative transmural myocardial infarction of other sites
('G383.', 'chdQof'), --	00	Postoperative transmural myocardial infarction of unspecified site
('G384.', 'chdQof'), --	00	Postoperative subendocardial myocardial infarction
('G38z.', 'chdQof'), --	00	Postoperative myocardial infarction, unspecified
('G39..', 'chdQof'), --	00	Coronary microvascular disease
('G3y..', 'chdQof'), --	00	Other specified ischaemic heart disease
('G3z..', 'chdQof'), --	00	Ischaemic heart disease NOS
('Gyu3.', 'chdQof'), --	00	[X]Ischaemic heart diseases
('Gyu30', 'chdQof'), --	00	[X]Other forms of angina pectoris
--Gyu31	00	[X]Other current complications following acute myocardial infarction
('Gyu32', 'chdQof'), --	00	[X]Other forms of acute ischaemic heart disease
('Gyu33', 'chdQof'), --	00	[X]Other forms of chronic ischaemic heart disease
('Gyu34', 'chdQof'), --	00	[X]Acute transmural myocardial infarction of unspecified site
('Gyu35', 'chdQof'), --	00	[X]Subsequent myocardial infarction of other sites
('Gyu36', 'chdQof'), --	00	[X]Subsequent myocardial infarction of unspecified site

--stroke
--from: STIA ruleset_v34.0 
--http://content.digital.nhs.uk/media/21023/Stroke-and-Transient-Ischaemic-Attack-rulesetv340/pdf/Stroke_and_Transient_Ischaemic_Attack_ruleset_v34.0.pdf
('G61..', 'strokeQof'), --	00	Intracerebral haemorrhage
('G610.', 'strokeQof'), --	00	Cortical haemorrhage
('G611.', 'strokeQof'), --	00	Internal capsule haemorrhage
('G612.', 'strokeQof'), --	00	Basal nucleus haemorrhage
('G613.', 'strokeQof'), --	00	Cerebellar haemorrhage
('G614.', 'strokeQof'), --	00	Pontine haemorrhage
('G615.', 'strokeQof'), --	00	Bulbar haemorrhage
('G616.', 'strokeQof'), --	00	External capsule haemorrhage
--G617.	00	Intracerebral haemorrhage, intraventricular
('G618.', 'strokeQof'), --	00	Intracerebral haemorrhage, multiple localized
('G619.', 'strokeQof'), --	00	Lobar cerebral haemorrhage
('G61X.', 'strokeQof'), --	00	Intracerebral haemorrhage in hemisphere, unspecified
('G61X0', 'strokeQof'), --	00	Left sided intracerebral haemorrhage, unspecified
('G61X1', 'strokeQof'), --	00	Right sided intracerebral haemorrhage, unspecified
('G61z.', 'strokeQof'), --	00	Intracerebral haemorrhage NOS
('G63y0', 'strokeQof'), --	00	Cerebral infarct due to thrombosis of precerebral arteries
('G63y1', 'strokeQof'), --	00	Cerebral infarction due to embolism of precerebral arteries
('G64..', 'strokeQof'), --	00	Cerebral arterial occlusion
('G640.', 'strokeQof'), --	00	Cerebral thrombosis
('G6400', 'strokeQof'), --	00	Cerebral infarction due to thrombosis of cerebral arteries
('G641.', 'strokeQof'), --	00	Cerebral embolism
('G6410', 'strokeQof'), --	00	Cerebral infarction due to embolism of cerebral arteries
('G64z.', 'strokeQof'), --	00	Cerebral infarction NOS
('G64z0', 'strokeQof'), --	00	Brainstem infarction
('G64z1', 'strokeQof'), --	00	Wallenberg syndrome
('G64z2', 'strokeQof'), --	00	Left sided cerebral infarction
('G64z3', 'strokeQof'), --	00	Right sided cerebral infarction
('G64z4', 'strokeQof'), --	00	Infarction of basal ganglia
('G66..', 'strokeQof'), --	00	Stroke and cerebrovascular accident unspecified
('G660.', 'strokeQof'), --	00	Middle cerebral artery syndrome
('G661.', 'strokeQof'), --	00	Anterior cerebral artery syndrome
('G662.', 'strokeQof'), --	00	Posterior cerebral artery syndrome
('G663.', 'strokeQof'), --	00	Brain stem stroke syndrome
('G664.', 'strokeQof'), --	00	Cerebellar stroke syndrome
('G665.', 'strokeQof'), --	00	Pure motor lacunar syndrome
('G666.', 'strokeQof'), --	00	Pure sensory lacunar syndrome
('G667.', 'strokeQof'), --	00	Left sided CVA
('G668.', 'strokeQof'), --	00	Right sided CVA
--G669.	00	Cerebral palsy, not congenital or infantile, acute
('G6760', 'strokeQof'), --	00	Cerebral infarction due to cerebral venous thrombosis, nonpyogenic
('G6W..', 'strokeQof'), --	00	Cerebral infarction due to unspecified occlusion or stenosis of precerebral arteries
('G6X..', 'strokeQof'), --	00	Cerebral infarction due to unspecified occlusion or stenosis of cerebral arteries
('Gyu62', 'strokeQof'), --	00	[X]Other intracerebral haemorrhage
('Gyu62', 'strokeQof'), --	00	[X]Other intracerebral haemorrhage
('Gyu63', 'strokeQof'), --	00	[X]Cerebral infarction due to unspecified occlusion or stenosis of cerebral arteries
('Gyu64', 'strokeQof'), --	00	[X]Other cerebral infarction
('Gyu65', 'strokeQof'), --	00	[X]Occlusion and stenosis of other precerebral arteries
('Gyu66', 'strokeQof'), --	00	[X]Occlusion and stenosis of other cerebral arteries
('Gyu6F', 'strokeQof'), --	00	[X]Intracerebral haemorrhage in hemisphere, unspecified
('Gyu6G', 'strokeQof'), --	00	[X]Cerebral infarction due to unspecified occlusion or stenosis of precerebral arteries

--stroke - ischaemic
--codelist creator - agreed with TR 19/4/17
--indented are not in qof
('Gyu63', 'strokeIsch'),--	[X]Cereb in/uns oc,stn/cereb a,[X]Cerebrl infarctn due/unspcf occlusn or sten/cerebrl artrs,[X]Cerebral infarction due to unspecified occlusion or stenosis of cerebral arteries
('Gyu64', 'strokeIsch'),--	[X]Other cerebral infarction
('Gyu6G', 'strokeIsch'),--	[X]Cer inf,un oc/st precer art,[X]Cereb infarct due unsp occlus/stenos precerebr arteries,[X]Cerebral infarction due to unspecified occlusion or stenosis of precerebral arteries
('Gyu65', 'strokeIsch'),--	[X]Oc+steno/o precerebral artr,[X]Occlusion and stenosis of other precerebral arteries,[X]Oc+steno/o precerebral artr,[X]Occlusion and stenosis of other precerebral arteries,[X]Oc+steno/o precerebral artr,[X]Occlusion and stenosis of other precerebral arteries
('Gyu66', 'strokeIsch'),--	[X]Oc+sten/o cerebral arteries,[X]Occlusion and stenosis of other cerebral arteries,[X]Oc+sten/o cerebral arteries,[X]Occlusion and stenosis of other cerebral arteries,[X]Oc+sten/o cerebral arteries,[X]Occlusion and stenosis of other cerebral arteries
	('G6770', 'strokeIsch'),--	Occlusn+stenos/midl cerebr art,Occlusion and stenosis of middle cerebral artery
	('G6771', 'strokeIsch'),--	Occlusn+stenos/anter cereb art,Occlusion and stenosis of anterior cerebral artery
	('G6772', 'strokeIsch'),--	Occlusn+stenos/post cerebr art,Occlusion and stenosis of posterior cerebral artery
	('G6773', 'strokeIsch'),--	Occlusn+stenos/cerebellar art,Occlusion and stenosis of cerebellar arteries
	('G6774', 'strokeIsch'),--	Occl/sten/mult+bilat cereb art,Occlusion+stenosis of multiple and bilat cerebral arteries,Occlusion and stenosis of multiple and bilateral cerebral arteries
('G6760', 'strokeIsch'),--	Cere infct/cere vn thrm,nonpyo,Cereb infarct due cerebral venous thrombosis, nonpyogenic,Cerebral infarction due to cerebral venous thrombosis, nonpyogenic
('G64..', 'strokeIsch'),--	Cerebral arterial occlusion
('G640.', 'strokeIsch'),--	Cerebral thrombosis
('G641.', 'strokeIsch'),--	Cerebral embolism
('G64z.', 'strokeIsch'),--	Cerebral infarction NOS
('G6400', 'strokeIsch'),--	Cerebr infct/throm/cerebrl art,Cerebral infarction due to thrombosis of cerebral arteries
('G6410', 'strokeIsch'),--	Cerebr infct/embol/cerebrl art,Cerebral infarction due to embolism of cerebral arteries
('G64z0', 'strokeIsch'),--	Brainstem infarction
('G64z1', 'strokeIsch'),--	Wallenberg syndrome
('G64z2', 'strokeIsch'),--	Left sided cerebral infarction
('G64z200', 'strokeIsch'),--	Left sided cerebral infarction
('G64z3', 'strokeIsch'),--	Right sided cerebral infarct,Right sided cerebral infarction
('G64z4', 'strokeIsch'),--	Infarction of basal ganglia
('G66..', 'strokeIsch'),--	Stroke/CVA unspecified,Stroke and cerebrovascular accident unspecified
('G6W..', 'strokeIsch'),--	Cer inf,un oc/st precer art,Cereb infarct due unsp occlus/stenos precerebr arteries,Cerebral infarction due to unspecified occlusion or stenosis of precerebral arteries
('G6X..', 'strokeIsch'),--	Cereb in/uns oc,stn/cereb a,Cerebrl infarctn due/unspcf occlusn or sten/cerebrl artrs,Cerebral infarction due to unspecified occlusion or stenosis of cerebral arteries
('G660.', 'strokeIsch'),--	Middle cerebral artery syndrm,Middle cerebral artery syndrome
('G661.', 'strokeIsch'),--	Anterior cerebral artery syn,Anterior cerebral artery syndrome
('G662.', 'strokeIsch'),--	Posterior cerebral artery syn,Posterior cerebral artery syndrome
('G663.', 'strokeIsch'),--	Brain stem stroke syndrome
('G664.', 'strokeIsch'),--	Cerebellar stroke syndrome
('G665.', 'strokeIsch'),--	Pure motor lacunar syndrome
('G666.', 'strokeIsch'),--	Pure sensory lacunar syndrome
('G667.', 'strokeIsch'),--	Left sided CVA
('G668.', 'strokeIsch'),--	Right sided CVA
	('G63..', 'strokeIsch'),--	Precerebral arterial occlusion,Precerebral arterial occlusion
('G63y0', 'strokeIsch'),--	Cerebr infct/throm/precere art,Cerebral infarct due to thrombosis of precerebral arteries
	('G63y.', 'strokeIsch'),--	Other precerebral artery occl.,Other precerebral artery occlusion
('G63y1', 'strokeIsch'),--	Cerebr infct/embol/precere art,Cerebral infarction due to embolism of precerebral arteries

('G65..', 'tiaQof'), --	00	Transient cerebral ischaemia
('G650.', 'tiaQof'), --	00	Basilar artery syndrome
('G651.', 'tiaQof'), --	00	Vertebral artery syndrome
('G6510', 'tiaQof'), --	00	Vertebro-basilar artery syndrome
('G652.', 'tiaQof'), --	00	Subclavian steal syndrome
('G653.', 'tiaQof'), --	00	Carotid artery syndrome hemispheric
('G654.', 'tiaQof'), --	00	Multiple and bilateral precerebral artery syndromes
('G656.', 'tiaQof'), --	00	Vertebrobasilar insufficiency
('G657.', 'tiaQof'), --	00	Carotid territory transient ischaemic attack
('G65y.', 'tiaQof'), --	00	Other transient cerebral ischaemia
('G65z.', 'tiaQof'), --	00	Transient cerebral ischaemia NOS
('G65z0', 'tiaQof'), --	00	Impending cerebral ischaemia
('G65z1', 'tiaQof'), --	00	Intermittent cerebral ischaemia
('G65zz', 'tiaQof'), --	00	Transient cerebral ischaemia NOS
('ZV12D', 'tiaQof'), --	00	[V]Personal history of transient ischaemic attack
('Fyu55', 'tiaQof'), --	00	[X]Other transient cerebral ischaemic attacks and related syndromes

--ecg
--codelist creator
('32130', 'ecg'),--	Exercise ECG normal
('32131', 'ecg'),--	Exercise ECG abnormal
('32140', 'ecg'),--	Ambulatory ECG normal
('32141', 'ecg'),--	Ambulatory ECG abnormal
('R1431', 'ecg'),--	[D]ECG electrocardiogram abn.,[D]Electrocardiogram (ECG) abnormal
('9E52.', 'ecg'),--	Life ass.exam.+ ECG completed
('8A52.', 'ecg'),--	Continuous ECG monitoring
('8A57.', 'ecg'),--	ECG rhythm strip monitoring,Electrocardiogram rhythm strip monitoring
('7P0GA', 'ecg'),--	72 hour ambulatry ECG mntoring,72 hour ambulatory electrocardiographic monitoring
('7P0G.', 'ecg'),--	Diagnostic electrocardiography
('7P0G0', 'ecg'),--	Implant electrocar loop record,Implantation of electrocardiography loop recorder,Implant electrocar loop record,Implantation of electrocardiography loop recorder
('7P0G1', 'ecg'),--	24 hour ambulatory electrocard,24 hour ambulatory electrocardiography,24 hour ambulatory electrocard,24 hour ambulatory electrocardiography
('7P0G2', 'ecg'),--	48 hour ambulatory electrocard,48 hour ambulatory electrocardiography,48 hour ambulatory electrocard,48 hour ambulatory electrocardiography
('7P0G3', 'ecg'),--	Exercise electrocardiography,Exercise electrocardiography
('7P0G4', 'ecg'),--	Holt extend electrocard record,Holter extended electrocardiographic recording,Holt extend electrocard record,Holter extended electrocardiographic recording
('7P0G5', 'ecg'),--	Cardiomemo electrocard monitor,Cardiomemo electrocardiographic monitoring,Cardiomemo electrocard monitor,Cardiomemo electrocardiographic monitoring
('7P0G6', 'ecg'),--	Rem electrocard loop record,Removal of electrocardiography loop recorder,Rem electrocard loop record,Removal of electrocardiography loop recorder
('3213.', 'ecg'),--	Exercise ECG
('321..', 'ecg'),--	ECG - general
('3212.', 'ecg'),--	Standard ECG
('3214.', 'ecg'),--	Ambulatory ECG
('3215.', 'ecg'),--	ECG not done
('3216.', 'ecg'),--	ECG normal
('3217.', 'ecg'),--	ECG abnormal
('3218.', 'ecg'),--	ECG - improved
('3219.', 'ecg'),--	ECG equivocal
('321A.', 'ecg'),--	ECG - no new changes
('321B.', 'ecg'),--	12 lead ECG
('321C.', 'ecg'),--	ECG sinus rhythm
('321D.', 'ecg'),--	Send 24 hour ECG for interprtn,Sending of 24 hour electrocardiogram for interpretation
('321Z.', 'ecg'),--	ECG - general - NOS
('32...', 'ecg'),--	Electrocardiography
('321C0', 'ecg'),--	ECG: sinus bradycardia
('321C1', 'ecg'),--	ECG: sinus tachycardia
('322..', 'ecg'),--	ECG: myocardial ischaemia
('323..', 'ecg'),--	ECG: myocardial infarction
('324..', 'ecg'),--	ECG:left ventricle hypertrophy
('325..', 'ecg'),--	ECG:right ventricle hypertrop.
('326..', 'ecg'),--	ECG: ectopic beats
('327..', 'ecg'),--	ECG: supraventricul arrhythmia,ECG: supraventricular arrhythmia
('328..', 'ecg'),--	ECG: ventricular arrhythmia
('329..', 'ecg'),--	ECG: heart block
('32A..', 'ecg'),--	ECG: P wave
('32B..', 'ecg'),--	ECG: Q wave
('32C..', 'ecg'),--	ECG: R wave
('32D..', 'ecg'),--	ECG: S wave
('32E..', 'ecg'),--	ECG: S-T interval
('32F..', 'ecg'),--	ECG: T wave
('32G..', 'ecg'),--	ECG: U wave
('32H..', 'ecg'),--	ECG: F wave
('32I..', 'ecg'),--	ECG: P-R interval
('32J..', 'ecg'),--	ECG: QRS complex
('32K..', 'ecg'),--	ECG: Q-T interval
('32L..', 'ecg'),--	ECG: left ventricular strain
('32M..', 'ecg'),--	24 Hour ECG
('3221.', 'ecg'),--	ECG: no myocardial ischaemia
('3222.', 'ecg'),--	ECG:shows myocardial ischaemia
('322Z.', 'ecg'),--	ECG: myocardial ischaemia NOS
('3231.', 'ecg'),--	ECG: no myocardial infarction
('3232.', 'ecg'),--	ECG: old myocardial infarction
('3233.', 'ecg'),--	ECG: antero-septal infarct.
('3234.', 'ecg'),--	ECG:posterior/inferior infarct
('3235.', 'ecg'),--	ECG: subendocardial infarct
('3236.', 'ecg'),--	ECG: lateral infarction
('323Z.', 'ecg'),--	ECG: myocardial infarct NOS
('3241.', 'ecg'),--	ECG: no LVH
('3242.', 'ecg'),--	ECG: shows LVH
('324Z.', 'ecg'),--	ECG: LVH NOS
('3251.', 'ecg'),--	ECG: no RVH
('3252.', 'ecg'),--	ECG: shows RVH
('325Z.', 'ecg'),--	ECG: RVH NOS
('3261.', 'ecg'),--	ECG: no ectopic beats
('3262.', 'ecg'),--	ECG: extrasystole
('3263.', 'ecg'),--	ECG: ventricular ectopics
('3264.', 'ecg'),--	ECG: atrial ectopics
('326Z.', 'ecg'),--	ECG: ectopic beats NOS
('3271.', 'ecg'),--	ECG: no supraventric. arryth.
('3272.', 'ecg'),--	ECG: atrial fibrillation
('3273.', 'ecg'),--	ECG: atrial flutter
('3274.', 'ecg'),--	ECG: paroxysmal atrial tachy.
('327Z.', 'ecg'),--	ECG: supraventric. arryth. NOS
('3281.', 'ecg'),--	ECG: no ventricular arrhythmia
('3282.', 'ecg'),--	ECG: ventricular tachycardia
('3283.', 'ecg'),--	ECG: ventricular fibrillation
('328Z.', 'ecg'),--	ECG: ventricular arrythmia NOS,ECG: ventricular arrhythmia NOS
('3291.', 'ecg'),--	ECG: no heart block
('3292.', 'ecg'),--	ECG: partial sinu-atrial block
('3293.', 'ecg'),--	ECG:complete sinu-atrial block
('3294.', 'ecg'),--	ECG:partial A-V block-long P-R
('3295.', 'ecg'),--	ECG: partial A-V block - 2:1
('3296.', 'ecg'),--	ECG: partial A-V block - 3:1
('3297.', 'ecg'),--	ECG: Wenckebach phenomenon
('3298.', 'ecg'),--	ECG: complete A-V block
('3299.', 'ecg'),--	ECG: right bundle branch block
('329A.', 'ecg'),--	ECG: left bundle branch block
('329B.', 'ecg'),--	ECG: trifascicular block
('329C.', 'ecg'),--	ECG: bifascicular block
('329D.', 'ecg'),--	ECG: left anterir fasculr blck,ECG: left anterior fascicular block
('329E.', 'ecg'),--	ECG: left postir fasiculr blck,ECG: left posterior fascicular block
('329F.', 'ecg'),--	ECG: RBBB lft anter fsculr blk,ECG: right bundle branch and left anterior fascicular block
('329G.', 'ecg'),--	ECG: RBBB lft pstir fsclr blck,ECG: right bundle branch and left posterior fascicular block
('329H.', 'ecg'),--	ECG: Mbitz typ 2 sec deg AV bk,Electrocardiogram: Mobitz type 2 second degree AV block,Electrocardiogram: Mobitz type 2 second degree atrioventricular block
('329Z.', 'ecg'),--	ECG: heart block NOS
('32A1.', 'ecg'),--	ECG: P wave normal
('32A2.', 'ecg'),--	ECG: P wave abnormal
('32A3.', 'ecg'),--	ECG: P mitrale
('32A4.', 'ecg'),--	ECG: P pulmonale
('32AZ.', 'ecg'),--	ECG: P wave NOS
('32B1.', 'ecg'),--	ECG: Q wave normal
('32B2.', 'ecg'),--	ECG: Q wave abnormal
('32B3.', 'ecg'),--	ECG: Q wave pathological
('32BZ.', 'ecg'),--	ECG: Q wave NOS
('32C1.', 'ecg'),--	ECG: R wave normal
('32C2.', 'ecg'),--	ECG: R wave abnormal
('32C3.', 'ecg'),--	ECG: R wave tall
('32CZ.', 'ecg'),--	ECG: R wave NOS
('32D1.', 'ecg'),--	ECG: S wave normal
('32D2.', 'ecg'),--	ECG: S wave abnormal
('32D3.', 'ecg'),--	ECG: S wave deep
('32DZ.', 'ecg'),--	ECG: S wave NOS
('32E1.', 'ecg'),--	ECG: S-T interval normal
('32E2.', 'ecg'),--	ECG: S-T interval abnormal
('32E3.', 'ecg'),--	ECG: S-T elevation
('32E4.', 'ecg'),--	ECG: S-T depression
('32EZ.', 'ecg'),--	ECG: S-T interval NOS
('32F1.', 'ecg'),--	ECG: T wave normal
('32F2.', 'ecg'),--	ECG: T wave abnormal
('32F3.', 'ecg'),--	ECG: T wave flattened
('32F4.', 'ecg'),--	ECG: T wave inverted
('32FZ.', 'ecg'),--	ECG: T wave NOS
('32G1.', 'ecg'),--	ECG: U wave normal
('32G2.', 'ecg'),--	ECG: U wave abnormal
('32G3.', 'ecg'),--	ECG: U wave exaggerated
('32GZ.', 'ecg'),--	ECG: U wave NOS
('32H1.', 'ecg'),--	ECG: F wave absent
('32H2.', 'ecg'),--	ECG: F wave present
('32HZ.', 'ecg'),--	ECG: F wave NOS
('32I1.', 'ecg'),--	ECG: P-R interval normal
('32I2.', 'ecg'),--	ECG: P-R interval abnormal
('32I3.', 'ecg'),--	ECG: P-R interval prolonged
('32I4.', 'ecg'),--	ECG: P-R interval shortened
('32IZ.', 'ecg'),--	ECG: P-R interval NOS
('32J1.', 'ecg'),--	ECG: QRS complex normal
('32J2.', 'ecg'),--	ECG: QRS complex abnormal
('32J3.', 'ecg'),--	ECG: QRS complex prolonged
('32J4.', 'ecg'),--	ECG: QRS complex shortened
('32J5.', 'ecg'),--	Left axis deviation
('32J6.', 'ecg'),--	Right axis deviation
('32JZ.', 'ecg'),--	ECG: QRS complex NOS
('32K1.', 'ecg'),--	ECG: Q-T interval normal
('32K2.', 'ecg'),--	ECG: Q-T interval abnormal
('32K3.', 'ecg'),--	ECG: Q-T interval prolonged
('32K4.', 'ecg'),--	ECG: Q-T interval shortened
('32KZ.', 'ecg'),--	ECG: Q-T interval NOS
('32Z..', 'ecg'),--	Electrocardiography NOS

--hf
--from: HF ruleset_v32.0 
--http://content.digital.nhs.uk/media/17359/HF-rulesetv320/pdf/HF_ruleset_v32.0.pdf
('G58..', 'hfQof'), --	00	Heart failure
('G580.', 'hfQof'), --	00	Congestive heart failure
('G5800', 'hfQof'), --	00	Acute congestive heart failure
('G5801', 'hfQof'), --	00	Chronic congestive heart failure
('G5802', 'hfQof'), --	00	Decompensated cardiac failure
('G5803', 'hfQof'), --	00	Compensated cardiac failure
('G5804', 'hfQof'), --	00	Congestive heart failure due to valvular disease
('G581.', 'hfQof'), --	00	Left ventricular failure
('G5810', 'hfQof'), --	00	Acute left ventricular failure
('G582.', 'hfQof'), --	00	Acute heart failure
('G583.', 'hfQof'), --	00	Heart failure with normal ejection fraction
('G584.', 'hfQof'), --	00	Right ventricular failure
('G58z.', 'hfQof'), --	00	Heart failure NOS
('G1yz1', 'hfQof'), --	00	Rheumatic left ventricular failure
('662f.', 'hfQof'), --	00	New York Heart Association classification - class I
('662g.', 'hfQof'), --	00	New York Heart Association classification - class II
('662h.', 'hfQof'), --	00	New York Heart Association classification - class III
('662i.', 'hfQof'), --	00	New York Heart Association classification - class IV

--hf resolved
--from: browser search
('21264', 'hfPermEx'), --	00	Heart failure resolved

--asbp
--from: browser search
('246e.', 'asbp'), --	00	Ambulatory systolic blood pressure
('246d.', 'asbp'), --	00	Average home systolic blood pressure
('246W.', 'asbp'), --	00	Average 24 hour systolic blood pressure
('246Y.', 'asbp'), --	00	Average day interval systolic blood pressure
('246b.', 'asbp'), --	00	Average night interval systolic blood pressure

--adbp
--from: browser search
('246f.', 'adbp'), --	00	Ambulatory diastolic blood pressure
('246c.', 'adbp'), --	00	Average home diastolic blood pressure
('246V.', 'adbp'), --	00	Average 24 hour diastolic blood pressure
('246X.', 'adbp'), --	00	Average day interval diastolic blood pressure
('246a.', 'adbp'), --	00	Average night interval diastolic blood pressure

--aortic stenosis
--from codelist creator 26/10/16 Read v2 April 2016   "synonyms": "aortic stenosis", "stenosis of aorta"
('P722.', 'AS'),
('P7224', 'AS'),
('P722z', 'AS'),
('P63..', 'AS'),
('G5411', 'AS'),
('G5413', 'AS'),
('G5414', 'AS'),
('G5415', 'AS'),
('G130.', 'AS'),
('G132.', 'AS'),
('G120.', 'AS'),
('G122.', 'AS'),

--aortic stenosis
--from codelist creator 26/10/16 Read v2 April 2016   "synonyms": "aortic", "aorta"
('79110', 'ASrepair'),
('79111', 'ASrepair'),
('79112', 'ASrepair'),
('79113', 'ASrepair'),
('79114', 'ASrepair'),
('79115', 'ASrepair'),
('79116', 'ASrepair'),
('79151', 'ASrepair'),
('79161', 'ASrepair'),
('79171', 'ASrepair'),
('79191', 'ASrepair'),
('79330', 'ASrepair'),
('7911.', 'ASrepair'),
('7911y', 'ASrepair'),
('7911z', 'ASrepair'),

--asthma: diagnostic codes
--from QOF Asthma ruleset_v34.0
('H33..', 'asthmaQof'),
('H330.', 'asthmaQof'),
('H3300', 'asthmaQof'),
('H3301', 'asthmaQof'),
('H330z', 'asthmaQof'),
('H331.', 'asthmaQof'),
('H3310', 'asthmaQof'),
('H3311', 'asthmaQof'),
('H331z', 'asthmaQof'),
('H332.', 'asthmaQof'),
('H334.', 'asthmaQof'),
('H335.', 'asthmaQof'),
('H33z.', 'asthmaQof'),
('H33z0', 'asthmaQof'),
('H33z1', 'asthmaQof'),
('H33z2', 'asthmaQof'),
('H33zz', 'asthmaQof'),
('H3120', 'asthmaQof'),
('H3B..', 'asthmaQof'),
('173A.', 'asthmaQof'),
--from SMASH
('14B4.', 'asthmaOther'),	--H/O: asthma	ReadCodeV2	PINCER	Asthma
('173d.', 'asthmaOther'),	--Work aggravated asthma	ReadCodeV2	PINCER	Asthma
('1O2..', 'asthmaOther'),	--Asthma confirmed	ReadCodeV2	PINCER	Asthma
('8H2P.', 'asthmaOther'),	--Emergency admission, asthma	ReadCodeV2	PINCER	Asthma
('H312000', 'asthmaOther'),	--Chronic asthmatic bronchitis	ReadCodeV2	HeRC	Asthma
('H312011', 'asthmaOther'),	--Chronic asthmatic bronchitis	ReadCodeV2	HeRC	Asthma
('H330.', 'asthmaOther'),	--Extrinsic (atopic) asthma	ReadCodeV2	PINCER	Asthma
('H330000', 'asthmaOther'),	--Extrinsic asthma - no status	ReadCodeV2	HeRC	Asthma
('H330011', 'asthmaOther'),	--Extrinsic asthma - no status	ReadCodeV2	HeRC	Asthma
('H3301', 'asthmaOther'),	--Extrinsic asthma + status	ReadCodeV2	PINCER	Asthma
('H330100', 'asthmaOther'),	--Extrinsic asthma + status	ReadCodeV2	HeRC	Asthma
('H330111', 'asthmaOther'),	--Extrinsic asthma + status	ReadCodeV2	HeRC	Asthma
('H330z00', 'asthmaOther'),	--Extrinsic asthma NOS	ReadCodeV2	HeRC	Asthma
('H331000', 'asthmaOther'),	--Intrinsic asthma - no status	ReadCodeV2	HeRC	Asthma
('H331111', 'asthmaOther'),	--Intrinsic asthma + status	ReadCodeV2	HeRC	Asthma
('H331z00', 'asthmaOther'),	--Intrinsic asthma NOS	ReadCodeV2	HeRC	Asthma
('H333.', 'asthmaOther'),	--Acute exacerbation of asthma	ReadCodeV2	PINCER	Asthma
('H33z0', 'asthmaOther'),	--Status asthmaticus NOS	ReadCodeV2	PINCER	Asthma
('H33z000', 'asthmaOther'),	--Status asthmaticus NOS	ReadCodeV2	HeRC	Asthma
('H33z011', 'asthmaOther'),	--Status asthmaticus NOS	ReadCodeV2	HeRC	Asthma
('H33z100', 'asthmaOther'),	--Asthma attack	ReadCodeV2	HeRC	Asthma
('H33z111', 'asthmaOther'),	--Asthma attack	ReadCodeV2	HeRC	Asthma
('H33z200', 'asthmaOther'),	--Late-onset asthma	ReadCodeV2	HeRC	Asthma
('H33zz00', 'asthmaOther'),	--Asthma NOS	ReadCodeV2	HeRC	Asthma
('H33zz11', 'asthmaOther'),	--Asthma NOS	ReadCodeV2	HeRC	Asthma
('H33zz12', 'asthmaOther'),	--Asthma NOS	ReadCodeV2	HeRC	Asthma
('H33zz13', 'asthmaOther'),	--Asthma NOS	ReadCodeV2	HeRC	Asthma
('H47y0', 'asthmaOther'),	--Detergent asthma	ReadCodeV2	PINCER	Asthma

--asthma: other codes (e.g. follow up codes
--from SS
('679J.', 'asthmaOther'),	--679J.	00	Health education - asthma
('679J0', 'asthmaOther'),	--679J0	00	Health education - asthma self management
('679J1', 'asthmaOther'),	--679J1	00	Health education - structured asthma discussion
('679J2', 'asthmaOther'),	--679J2	00	Health education - structured patient focused asthma discussion
('8B3j.', 'asthmaOther'),	--00	Asthma medication review
('8I3V.', 'asthmaOther'),	--00	Medication review declined
('663U.', 'asthmaOther'),	--00	Asthma management plan given
('66Yz0', 'asthmaOther'),	--00	Asthma management plan declined
('8793.', 'asthmaOther'),	--00	Asthma control step 0
('8794.', 'asthmaOther'),	--00	Asthma control step 1
('8795.', 'asthmaOther'),	--00	Asthma control step 2
('8796.', 'asthmaOther'),	--00	Asthma control step 3
('8797.', 'asthmaOther'),	--00	Asthma control step 4
('8798.', 'asthmaOther'),	--00	Asthma control step 5
--spirometry
--from QOF Asthma ruleset_v34.0
('33G1.', 'asthmaSpiro'),	--00	Spirometry reversibility positive
('33H1.', 'asthmaSpiro'),	--00	Positive reversibility test to salbutamol
('33I1.', 'asthmaSpiro'),	--00	Positive reversibility test to ipratropium bromide
('33J1.', 'asthmaSpiro'),	--00	Positive reversibility test to a combination of salbutamol and ipratropium bromide 
('33K1.', 'asthmaSpiro'),	--00	Positive reversibility test to corticosteroids
--745D4	00	Post bronchodilator spirometry
('663J.', 'asthmaSpiro'),	--00	Airways obstruction reversible 
--8HRC.	00	Referral for spirometry
--pefr
--from QOF Asthma ruleset_v34.0
--339n.	00	Serial peak expiratory flow rate abnormal
('33950', 'asthmaSpiro'),	--00	Diurnal variation of peak expiratory flow rate
--339A.	00	Peak flow rate before bronchodilation
--339B.	00	Peak flow rate after bronchodilation
--339c.	00	Peak expiratory flow rate pre steroids
--339d.	00	Peak expiratory flow rate post steroids
--339g.	00	Serial peak expiratory flow rate
--66YX.	00	Peak expiratory flow rate monitoring
--66YY.	00	Peak expiratory flow rate monitoring using diary
--66Yc.	00	Number of consecutive days at less than 80% peak expiratory flow rate
--asthma follow up
--from QOF Asthma ruleset_v34.0
('66YJ.', 'asthmaReview'),	--00	Asthma annual review
('66YK.', 'asthmaReview'),	--00	Asthma follow-up
('66YQ.', 'asthmaReview'),	--00	Asthma monitoring by nurse
('66YR.', 'asthmaReview'),	--00	Asthma monitoring by doctor
('8B3j.', 'asthmaReview'),	--00	Asthma medication review
('9OJA.', 'asthmaReview'),	--00	Asthma monitoring check done
--asthma RCP question answers
--from QOF Asthma ruleset_v34.0
('6635.', 'asthmaRcp6'),
('663P.', 'asthmaRcp6'),
('663Q.', 'asthmaRcp6'),
('663e.', 'asthmaRcp6'),
('663e0', 'asthmaRcp6'),
('663e1', 'asthmaRcp6'),
('663f.', 'asthmaRcp6'),
('663w.', 'asthmaRcp6'),
('663x.', 'asthmaRcp6'),
('663P0', 'asthmaRcp6'),
('663P1', 'asthmaRcp6'),
('663P2', 'asthmaRcp6'),
('663N.', 'asthmaRcp6'),
('663N0', 'asthmaRcp6'),
('663N1', 'asthmaRcp6'),
('663N2', 'asthmaRcp6'),
('663O.', 'asthmaRcp6'),
('663O0', 'asthmaRcp6'),
('663r.', 'asthmaRcp6'),
('66YP.', 'asthmaRcp6'),
('66Ys.', 'asthmaRcp6'),
('66Yq.', 'asthmaRcp6'),
('66Yr.', 'asthmaRcp6'),
('663q.', 'asthmaRcp6'),
('663s.', 'asthmaRcp6'),
('663t.', 'asthmaRcp6'),
('663u.', 'asthmaRcp6'),
('663v.', 'asthmaRcp6');

			----------------------------------------------------------------------
			---------------------------RESP DRUGS--------------------------------
			----------------------------------------------------------------------

--asthma: drugs 
--from QOF Asthma ruleset_v34.0
	--c1... – c15z. SABAs (not specific to asthma)
	--c19..% LABA (not specific to asthma)
	--c1B.. – c1EE. LABAs (not specific to asthma)
	--c1c..% fluticasone
	--c2...% (Excluding c23..%, c24..%) adrenaline
	--c3...% (Excluding c32..%) 
	--c4...% (Excluding c42..%, c44..%) aminophylline - also licensed from copd; (theophylline only for asthma - below)
	--c5...% (Excluding c52..%, c51M., c51N.) compound bronchodilators
	--c6...% steroids
insert into codeGroups
select readcode, 'asthmaDrugs' from SIR_ReadCode_Rubric
where readcode like 'c43%' --theophyllines
or readcode like 'c7%' --asthma prophylaxis e.g. cromoglicate inhaler
or readcode like 'cA%' --leukotreine antagonist 
or readcode like 'ck1%' -- omalizumab
group by readcode

--inhalers: both copd and asthma
--from browser search
insert into codeGroups
select readcode, 'copdAsthmaDrugs' from SIR_ReadCode_Rubric
where readcode like 'c1%'	--	SELECTIVE BETA-ADRENOCEPTOR STIMULANT
or readcode like 'c3%'	--	ANTICHOLINERGIC BRONCHODILATORS
or readcode like 'c4%' --	XANTHINE BRONCHODILATORS
or readcode like 'c5%' --	COMPOUND BRONCHODILATORS
or readcode like 'c6%' --	CORTICOSTEROIDS [RESPIRATORY USE]
or readcode like 'c7%' --	ASTHMA PROPHYLAXIS
or readcode like 'cA%' --	LEUKOTRIENE RECEPTOR ANTAGONIST
or readcode like 'ce%' --	ORAL/PARENTERAL MUCOLYTICS
or readcode like 'ck%' --	MONOCLONAL IgE ANTIBODY
or readcode like 'cl%' --	PDE4 INHIBITORS
group by readcode

--inhalers: salbutamol inahler
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'salbutamolInahler' from SIR_ReadCode_Rubric
where readcode like 'c13%'	--	SALBUTAMOL [INHALATION PREPRATIONS]
or readcode like 'c1E%'	--	SALBUTAMOL [INHALATION PREPRATIONS 2]
group by readcode

--inhalers: saba
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'saba' from SIR_ReadCode_Rubric
where readcode like 'c13%'	--	SALBUTAMOL [INHALATION PREPRATIONS]
or readcode like 'c1E%'	--	SALBUTAMOL [INHALATION PREPRATIONS 2]
or readcode like 'c14%'	--	TERBUTALINE SULFATE [RESPIRATORY USE]
or readcode like 'c15%'	--	FENOTEROL HYDROBROMIDE
or readcode like 'c16%'	--	PIRBUTEROL
or readcode like 'c17%'	--	REPROTEROL
or readcode like 'c18%'	--	RIMITEROL
group by readcode

--inhalers: laba
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'laba' from SIR_ReadCode_Rubric
where readcode like 'c19%'	--	SALMETEROL XINAFOATE
or readcode like 'c1B%'	--	c1B..	00	BAMBUTEROL HYDROCHLORIDE
or readcode like 'c1C%'	--	c1C..	00	FORMOTEROL
or readcode like 'c1a%'	--	c1a..	00	TULOBUTEROL HYDROCHLORIDE
or readcode like 'c1b%'	--	c1b..	00	INDACATEROL
or readcode like 'c1d%'	--	c1d..	00	OLODATEROL ***just for copd***
group by readcode

--inhalers: sama
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'sama' from SIR_ReadCode_Rubric
where readcode like 'c31%'	--	c31..	00	IPRATROPIUM BROMIDE [1]
group by readcode

--lama
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'Lama' from SIR_ReadCode_Rubric
where readcode like 'c32%'	--	OXITROPIUM BROMIDE
or readcode like 'c33%'	--	TIOTROPIUM
or readcode like 'c34%'	--	ACLIDINIUM ***just copd
or readcode like 'c35%'	--	UMECLIDINIUM ***just copd
or readcode = 'o323.'--	SEEBRI BREEZHALER 44micrograms inhalation capsules
or readcode = 'o324.'--	GLYCOPYRRONIUM 44micrograms inhalation capsules
group by readcode

--ics
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'ics' from SIR_ReadCode_Rubric
where readcode like 'c61%'	--	BECLOMETASONE DIPROPIONATE [RESPIRATORY USE]
or readcode like 'c63%'	--	*BETAMETHASONE VALERATE
or readcode like 'c64%'	--	BUDESONIDE [RESPIRATORY USE]
or readcode like 'c65%'	--	FLUTICASONE PROPIONATE [RESPIRATORY USE]
or readcode like 'c66%'	--	BECLOMETASONE DIPROPIONATE [RESPIRATORY USE 2]
or readcode like 'c68%'	--	MOMETASONE [RESPIRATORY USE]
or readcode like 'c69%'	--	CICLESONIDE
group by readcode

--sabaIcs
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'sabaIcs' from SIR_ReadCode_Rubric
where readcode like 'c62%'	--	BECLOMETASONE COMPOUNDS
group by readcode

--labaIcs
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'labaIcs' from SIR_ReadCode_Rubric
where readcode like 'c1D%'	--	SALMETEROL+FLUTICASONE PROPIONATE
or readcode like 'c1c%'	--	FLUTICASONE PROPIONATE+FORMOTEROL FUMARATE
or readcode like 'c67%'	--	BUDESONIDE+FORMOTEROL
or readcode like 'c6A%'	--	BECLOMETASONE+FORMOTEROL
or readcode like 'c6B%'	--	FLUTICASONE+VILANTEROL
group by readcode

--sabaSama
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
values
('c51F.', 'sabaSama'),	--	SALBUTAMOL+IPRATROPIUM BROMIDE 2.5mg/500micrograms nebulisation units
('c51G.', 'sabaSama'),	--	SALIPRANEB nebuliser solution 2.5mL
('c51H.', 'sabaSama'),	--	IPRATROPIUM BROMIDE+SALBUTAMOL 500mcg/2.5mg nebuliser soln
('c531.', 'sabaSama'),	--	IPRAMOL STERI-NEB 2.5mg/500micrograms nebuliser solution 2.5mL

--labaLama
--from browser search and QOF Asthma ruleset_v34.0
('c51E.', 'labaLama'), --	00	COMBIVENT Unit Dose Vials
('c51I.', 'labaLama'), --	00	ANORO ELLIPTA 55micrograms/22micrograms dry powder inhaler
('c51J.', 'labaLama'), --	00	UMECLIDINIUM+VILANTEROL 55mcg/22mcg dry powder inhaler
('c51K.', 'labaLama'), --	00	DUAKLIR GENUAIR 340micrograms/12micrograms powder inhaler
('c51L.', 'labaLama'), --	00	ACLIDINIUM+FORMOTEROL FUMARATE DIHYD 340mcg/12mcg pdr inh
('c51M.', 'labaLama'), --	00	SPIOLTO RESPIMAT 2.5micrograms/2.5micrograms inhaler
('c51N.', 'labaLama'), --	00	TIOTROPIUM+OLODATEROL 2.5micrograms/2.5micrograms inhaler
('c1e..', 'labaLama'), --	00	INDACATEROL+GLYCOPYRRONIUM
('c1e1.', 'labaLama'), --	00	ULTIBRO BREEZHALER 85mcg/43mcg inh powder capsules+inhaler
('c1e2.', 'labaLama'); --	00	INDACATEROL+GLYCOPYRRONIUM 85mcg/43mcg inh powder caps+inh

--phylline
--from browser search and QOF Asthma ruleset_v34.0
insert into codeGroups
select readcode, 'phylline' from SIR_ReadCode_Rubric
where readcode like 'c41%'	--	c41..	00	AMINOPHYLLINE
or readcode like 'c43%'	--	c43..	00	THEOPHYLLINE
group by readcode

--mucolytic
--from browser search
insert into codeGroups
select readcode, 'mucolytic' from SIR_ReadCode_Rubric
where readcode like 'cd%'	--	INHALATIONAL MUCOLYTICS
or readcode like 'ce%'	--	ORAL/PARENTERAL MUCOLYTICS
group by readcode

--spacer
--from codelist creator 28/12/16 (synonyms: "spacer")
insert into codeGroups
values
('p4E1.', 'spacer'), --
('p4E..', 'spacer'), --
('p431.', 'spacer'), --
('p43..', 'spacer'), --
('p432.', 'spacer'), --
('p433.', 'spacer'), --
('p434.', 'spacer'), --
('p435.', 'spacer'), --
('p436.', 'spacer'), --
('p437.', 'spacer'), --
('p43D.', 'spacer'), --
('p43E.', 'spacer'), --
('p43F.', 'spacer'), --
('p43G.', 'spacer'), --
('p43H.', 'spacer'), --
('p43I.', 'spacer'), --
('p43J.', 'spacer'), --
('p43K.', 'spacer'), --
('p43L.', 'spacer'), --
('p43M.', 'spacer'), --
('p43N.', 'spacer'), --
('p43O.', 'spacer'), --
('p43P.', 'spacer'), --
('p43Q.', 'spacer'), --
('p43R.', 'spacer'), --
('p43S.', 'spacer'), --
('p43T.', 'spacer'), --
('p43U.', 'spacer'), --
('p43V.', 'spacer'), --
('p43W.', 'spacer'), --
('p43X.', 'spacer'), --
('p43Y.', 'spacer'), --
('p43Z.', 'spacer'), --
('p43a.', 'spacer'), --
('p43b.', 'spacer'), --
('p43c.', 'spacer'), --
('p43d.', 'spacer'), --
('p43e.', 'spacer'), --
('p43f.', 'spacer'), --
('p43g.', 'spacer'), --
('p43h.', 'spacer'), --
('p43i.', 'spacer'), --
('p43j.', 'spacer'), --
('p43k.', 'spacer'), --
('p43l.', 'spacer'), --
('p43m.', 'spacer'), --
('p43n.', 'spacer'), --
('p43o.', 'spacer'), --
('p43p.', 'spacer'), --
('p43q.', 'spacer'), --
('p43r.', 'spacer'), --
('p43s.', 'spacer'), --
('p43t.', 'spacer'), --
('p43u.', 'spacer'), --
('p43v.', 'spacer'), --
('p43w.', 'spacer'), --
('p43x.', 'spacer'), --
('p43y.', 'spacer'), --
('p43z.', 'spacer'), --
('p438.', 'spacer'), --
('p439.', 'spacer'), --
('p43A.', 'spacer'), --
('p43B.', 'spacer'), --
('p43C.', 'spacer'), --
('c745.', 'spacer'), --
('c723.', 'spacer'), --
('c72y.', 'spacer'), --
('c71d.', 'spacer'), --
('c71e.', 'spacer'), --
('c71g.', 'spacer'), --
('c646.', 'spacer'), --
('c64B.', 'spacer'), --
('c64C.', 'spacer'), --
('c64D.', 'spacer'), --
('c64o.', 'spacer'), --
('c64z.', 'spacer'), --
('c618.', 'spacer'), --
('c61C.', 'spacer'), --
('c61Q.', 'spacer'), --
('c61S.', 'spacer'), --
('c61T.', 'spacer'), --
('c146.', 'spacer'), --
('c14d.', 'spacer'), --
('c14v.', 'spacer'), --
('c13k.', 'spacer'), --
('c13P.', 'spacer'), --
('663l.', 'spacer'), --

--asthma: permanent exclusions
--from QOF Asthma ruleset_v34.0 and SMASH
('21262', 'asthmaPermEx'),	--Asthma resolved	***gets filtered out by SIR***
('2126200', 'asthmaPermEx'),	--Asthma resolved	SMASH
('212G.', 'asthmaPermEx'),	--Asthma resolved	ReadCodeV2	PINCER	Asthma resolution

--asthma: temporary exclusions
('9OJ2.', 'asthmaTempEx'),	--00	Refuses asthma monitoring
('9hA..', 'asthmaTempEx'),	--9hA..	00	Exception reporting: asthma quality indicators
('9hA1.', 'asthmaTempEx'),	--00	Excepted from asthma quality indicators: Patient unsuitable
('9hA2.', 'asthmaTempEx'),	--00	Excepted from asthma quality indicators: Informed dissent

--bedridden
--from codelist creator 20/10/16 (synonyms: "bedbound", "bed-ridden", "dependent")
('3960.', 'bedridden'),
('13C6.', 'bedridden'),--manual search

--bp - diastolic dbp
--from CKD ruleset_INLIQ_v32.0
	('246A.', 'dbp'),
	('246P.', 'dbp'),
	('246R.', 'dbp'),
	('246T.', 'dbp'),
	('246V.', 'dbp'),
	('246X.', 'dbp'),
	('246a.', 'dbp'),
	('246c.', 'dbp'),
	('246f.', 'dbp'),
	('246m.', 'dbp'),
	('246o1', 'dbp'),	

--bp - systolic sbp
--from CKD ruleset_INLIQ_v32.0
	('2469.', 'sbp'),
	('246N.', 'sbp'),
	('246Q.', 'sbp'),
	('246S.', 'sbp'),
	('246W.', 'sbp'),
	('246Y.', 'sbp'),
	('246b.', 'sbp'),
	('246d.', 'sbp'),
	('246e.', 'sbp'),
	('246l.', 'sbp'),
	('246o0', 'sbp'),

--bp - BP codes (i.e. not SBP or DBP) 
--from CKD ruleset_INLIQ_v32.0
	('246..', 'bp'),
	('2461.', 'bp'),
	('2462.', 'bp'),
	('2463.', 'bp'),
	('2464.', 'bp'),
	('2465.', 'bp'),
	('2466.', 'bp'),
	('2467.', 'bp'),
	('246B.', 'bp'),
	('246C.', 'bp'),
	('246D.', 'bp'),
	('246E.', 'bp'),
	('246F.', 'bp'),
	('246G.', 'bp'),
	('246J.', 'bp'),
	('246Z.', 'bp'),
	('246g.', 'bp'),
	('246o.', 'bp'),

--copd
--from COPD QOF V32 codes
('H3...', 'copdQof'),	--	Chronic obstructive pulmonary disease
('H31..', 'copdQof'),	--	Chronic bronchitis
('H310.', 'copdQof'),	--	Simple chronic bronchitis
('H3100', 'copdQof'),	--	Chronic catarrhal bronchitis
('H310z', 'copdQof'),	--	Simple chronic bronchitis NOS
('H311.', 'copdQof'),	--	Mucopurulent chronic bronchitis
('H3110', 'copdQof'),	--	Purulent chronic bronchitis
('H3111', 'copdQof'),	--	Fetid chronic bronchitis
('H311z', 'copdQof'),	--	Mucopurulent chronic bronchitis NOS
('H312.', 'copdQof'),	--	Obstructive chronic bronchitis
('H3120', 'copdQof'),	--	Chronic asthmatic bronchitis
('H3121', 'copdQof'),	--	Emphysematous bronchitis
('H3123', 'copdQof'),	--	Bronchiolitis obliterans
('H312z', 'copdQof'),	--	Obstructive chronic bronchitis NOS
('H313.', 'copdQof'),	--	Mixed simple and mucopurulent chronic bronchitis
('H31y.', 'copdQof'),	--	Other chronic bronchitis
('H31y1', 'copdQof'),	--	Chronic tracheobronchitis
('H31yz', 'copdQof'),	--	Other chronic bronchitis NOS
('H31z.', 'copdQof'),	--	Chronic bronchitis NOS
('H32..', 'copdQof'),	--	Emphysema
('H320.', 'copdQof'),	--	Chronic bullous emphysema
('H3200', 'copdQof'),	--	Segmental bullous emphysema
('H3201', 'copdQof'),	--	Zonal bullous emphysema
('H3202', 'copdQof'),	--	Giant bullous emphysema
('H3203', 'copdQof'),	--	Bullous emphysema with collapse
('H320z', 'copdQof'),	--	Chronic bullous emphysema NOS
('H321.', 'copdQof'),	--	Panlobular emphysema
('H322.', 'copdQof'),	--	Centrilobular emphysema
('H32y.', 'copdQof'),	--	Other emphysema
('H32y0', 'copdQof'),	--	Acute vesicular emphysema
('H32y1', 'copdQof'),	--	Atrophic (senile) emphysema
('H32y2', 'copdQof'),	--	MacLeods unilateral emphysema
('H32yz', 'copdQof'),	--	Other emphysema NOS
('H32z.', 'copdQof'),	--	Emphysema NOS
('H36..', 'copdQof'),	--	Mild chronic obstructive pulmonary disease
('H37..', 'copdQof'),	--	Moderate chronic obstructive pulmonary disease
('H38..', 'copdQof'),	--	Severe chronic obstructive pulmonary disease
('H39..', 'copdQof'),	--	Very severe chronic obstructive pulmonary disease
('H3A..', 'copdQof'),	--	End stage chronic obstructive airways disease
('H3B..', 'copdQof'),	--	Asthma-chronic obstructive pulmonary disease overlap syndrome
('H3y..', 'copdQof'),	--	Other specified chronic obstructive airways disease
('H3z..', 'copdQof'),	--	Chronic obstructive airways disease NOS
('H4640', 'copdQof'),
('H4641', 'copdQof'),
('H5832', 'copdQof'),
('Hyu30', 'copdQof'),
('Hyu31', 'copdQof'),

--copd other codes
--from codelist creator 2/12/16 (synonyms: "copd", "coad", "chronic obstructive pulmonary", "chronic obstructive airways", "bronchitis", "emphysema")
('9kf..', 'otherCopd'),
('9kf0.', 'otherCopd'),
('9kf1.', 'otherCopd'),
('9kf2.', 'otherCopd'),
('9e03.', 'otherCopd'),
('9Oi..', 'otherCopd'),
('9Oi0.', 'otherCopd'),
('9Oi1.', 'otherCopd'),
('9Oi2.', 'otherCopd'),
('9Oi3.', 'otherCopd'),
('9Oi4.', 'otherCopd'),
('9Nk70', 'otherCopd'),
('9NgP.', 'otherCopd'),
('9N4W.', 'otherCopd'),
('8IEZ.', 'otherCopd'),
('8IEy.', 'otherCopd'),
('8I610', 'otherCopd'),
('8Hkw.', 'otherCopd'),
('8H2R.', 'otherCopd'),
('8CeD.', 'otherCopd'),
('8CR1.', 'otherCopd'),
('8CMW5', 'otherCopd'),
('8CMV.', 'otherCopd'),
('8CE6.', 'otherCopd'),
('8BMa0', 'otherCopd'),
('8BMW.', 'otherCopd'),
('679V.', 'otherCopd'),
('66Yz1', 'otherCopd'),
('66Yz2', 'otherCopd'),
('66YB.', 'otherCopd'),
('66YB0', 'otherCopd'),
('66YB1', 'otherCopd'),
('66YB2', 'otherCopd'),
('66YD.', 'otherCopd'),
('66YI.', 'otherCopd'),
('66YL.', 'otherCopd'),
('66YM.', 'otherCopd'),
('66YS.', 'otherCopd'),
('66YT.', 'otherCopd'),
('66Yd.', 'otherCopd'),
('66Ye.', 'otherCopd'),
('66Yf.', 'otherCopd'),
('66Yg.', 'otherCopd'),
('66Yh.', 'otherCopd'),
('66Yi.', 'otherCopd'),
('661N3', 'otherCopd'),
('661M3', 'otherCopd'),
('38Dd.', 'otherCopd'),
('38Dg.', 'otherCopd'),
('14OX.', 'otherCopd'),
--('H31y0', 'otherCopd'), --excluded codes from copd qof: H31y0	00	Chronic tracheitis
('H3122', 'otherCopd'), --excluded codes from copd qof
('H3y0.', 'otherCopd'), --excluded codes from copd qof
('H3y1.', 'otherCopd'), --excluded codes from copd qof

--copd severity
--taken from copdqof list
('H36..', 'copdSeverity'),	--	Mild chronic obstructive pulmonary disease
('H37..', 'copdSeverity'),	--	Moderate chronic obstructive pulmonary disease
('H38..', 'copdSeverity'),	--	Severe chronic obstructive pulmonary disease
('H39..', 'copdSeverity'),	--	Very severe chronic obstructive pulmonary disease
('H3A..', 'copdSeverity'),	--	End stage chronic obstructive airways disease

--copd review
--from COPD ruleset_v34.0
('66YM.', 'copdReview'), --	00	Chronic obstructive pulmonary disease annual review
('66YB0', 'copdReview'), --	00	Chronic obstructive pulmonary disease 3 monthly review
('66YB1', 'copdReview'), --	00	Chronic obstructive pulmonary disease 6 monthly review

--fev1
--from COPD ruleset_v34.0 for FEV1
--33971	00	Forced expired volume in 1 second percentage change
--33972	00	FEV1 after change of bronchodilator
--3398.	00	FEV1/FVC ratio normal
--3399.	00	FEV1/FVC ratio abnormal
--339M.	00	FEV1/FVC ratio
('339O.', 'fev1'), --	00	Forced expired volume in 1 second
--339O0	00	Forced expired volume in 1 second reversibility
--339O1	00	Forced expired volume in one second/vital capacity ratio
--339R.	00	FEV1/FVC percent
('339S.', 'fev1pred'), --	00	Percent predicted FEV1
('339S0', 'fev1pred'), --	00	Percentage predicted forced expiratory volume in 1 second after bronchodilation
('339T.', 'fev1pred'), --	00	FEV1/FVC > 70% of predicted
('339U.', 'fev1pred'), --	00	FEV1/FVC < 70% of predicted
('339a.', 'fev1'), --	00	FEV1 before bronchodilation
('339b.', 'fev1'), --	00	FEV1 after bronchodilation
('339e.', 'fev1'), --	00	FEV1 pre steroids
('339f.', 'fev1'), --	00	FEV1 post steroids
--339j.	00	FEV1/FVC ratio pre steroids
--339k.	00	FEV1/FVC ratio post steroids
--339l.	00	FEV1/FVC ratio before bronchodilator
--339m.	00	FEV1/FVC ratio after bronchodilator

--copd risk
--codes found during searches
('14OJ.', 'copdRisk'), --At risk of chronic obstructive pulmonary disease
('1J71.', 'copdRisk'), --Suspected chronic obstructive pulmonary disease
('H3101', 'copdRisk'), --excluded codes from copd qof: Smokers' cough

--copdexac
--from SS
('H3122', 'copdExacSs'), --H3122	00	Acute exacerbation of chronic obstructive airways disease

--copdexac - non SS codes
--from codelist creator 2/12/16 (synonyms: "copd acute", "copd cough","coad acute", "coad cough","chronic obstructive pulmonary acute", "chronic obstructive pulmonary cough","chronic obstructive airways acute", "chronic obstructive airways cough", "bronchitis acute",  "bronchitis cough", "emphysema acute", "emphysema acute", "bronchitis", "acute", "resp tract infection", "chest infection", "chest cold", "bonchiolitis",  "bronchiolitis")
('Hyu10', 'copdExacNonSs'),
('Hyu1.', 'copdExacNonSs'),
('Hyu11', 'copdExacNonSs'),
('H4600', 'copdExacNonSs'),
('H4601', 'copdExacNonSs'),
('H460z', 'copdExacNonSs'),
('H3y0.', 'copdExacNonSs'),
('H3y1.', 'copdExacNonSs'),
('H32y0', 'copdExacNonSs'),
('H06..', 'copdExacNonSs'),
('H060.', 'copdExacNonSs'),
('H061.', 'copdExacNonSs'),
('H062.', 'copdExacNonSs'),
('H06z.', 'copdExacNonSs'),
('H0...', 'copdExacNonSs'),
('H0603', 'copdExacNonSs'),
('H0604', 'copdExacNonSs'),
('H0605', 'copdExacNonSs'),
('H0606', 'copdExacNonSs'),
('H0607', 'copdExacNonSs'),
('H0608', 'copdExacNonSs'),
('H0609', 'copdExacNonSs'),
('H060A', 'copdExacNonSs'),
('H060B', 'copdExacNonSs'),
('H060C', 'copdExacNonSs'),
('H060D', 'copdExacNonSs'),
('H060E', 'copdExacNonSs'),
('H060F', 'copdExacNonSs'),
('H060v', 'copdExacNonSs'),
('H060w', 'copdExacNonSs'),
('H060x', 'copdExacNonSs'),
('H060z', 'copdExacNonSs'),
('H0610', 'copdExacNonSs'),
('H0611', 'copdExacNonSs'),
('H0612', 'copdExacNonSs'),
('H0613', 'copdExacNonSs'),
('H0614', 'copdExacNonSs'),
('H0615', 'copdExacNonSs'),
('H0616', 'copdExacNonSs'),
('H0617', 'copdExacNonSs'),
('H061z', 'copdExacNonSs'),
('H06z0', 'copdExacNonSs'),
('H06z1', 'copdExacNonSs'),
('H06z2', 'copdExacNonSs'),
('H07..', 'copdExacNonSs'),
('H0y..', 'copdExacNonSs'),
('H0z..', 'copdExacNonSs'),

--copd temp ex
--from COPD ruleset_v34.0 Version Date: 31/03/2016
('9h5..', 'copdTempEx'),	--	Exception reporting: COPD quality indicators
('9h51.', 'copdTempEx'),	--	Excepted from COPD quality indicators: Patient unsuitable
('9h52.', 'copdTempEx'),	--	Excepted from COPD quality indicators: Informed dissent

--pulse rhythm
--browser and sir search
('243..', 'pulseRhythm'),--	00	O/E - pulse rhythm
('2431.', 'pulseRhythm'),--	00	O/E - pulse rhythm regular
('2432.', 'pulseRhythm'),--	00	O/E - pulse irregularly irreg.
('2433.', 'pulseRhythm'),--	00	O/E -pulse regularly irregular
('2434.', 'pulseRhythm'),--	00	O/E - no gallop rhythm
('2435.', 'pulseRhythm'),--	00	O/E - irregular pulse
('243Z.', 'pulseRhythm'),--	00	O/E - pulse rhythm NOS

--copd temp ex
--from COPD ruleset_v34.0 Version Date: 31/03/2016
('2126F', 'copdPermEx'),	-- Chronic obstructive pulmonary disease resolved

--copd hospitalisation
--from codelist creator 2/12/16 (synonyms: "COPD","COAD","chronic obstructive pulmonary ","chronic obstructive airways","bronchitis","emphysema")
('8H2R.', 'CopdHosp'), --	00	Admit COPD emergency
('66Yd.', 'CopdHosp'), --	00	Chronic obstructive pulmonary disease accident and emergency attendance since last visit
('66Ye.', 'CopdHosp'), --	00	Emergency chronic obstructive pulmonary disease admission since last appointment
('66Yi.', 'CopdHosp'), --	00	Multiple chronic obstructive pulmonary disease emergency hospital admissions

--cough
--from codelist creator 2/12/16 (synonyms:  "cough", "sputum","haemoptysis"))
('R1531', 'cough'),
('R062.', 'cough'),
('R0620', 'cough'),
('R0621', 'cough'),
('R064.', 'cough'),
('R0630', 'cough'),
('R063z', 'cough'),
('R0640', 'cough'),
('R0641', 'cough'),
('R0642', 'cough'),
('R0643', 'cough'),
('R064z', 'cough'),
('173B.', 'cough'),
('171..', 'cough'),
('1712.', 'cough'),
('1713.', 'cough'),
('1714.', 'cough'),
('1715.', 'cough'),
('1716.', 'cough'),
('1717.', 'cough'),
('1718.', 'cough'),
('1719.', 'cough'),
('171A.', 'cough'),
('171B.', 'cough'),
('171C.', 'cough'),
('171D.', 'cough'),
('171F.', 'cough'),
('171G.', 'cough'),
('171H.', 'cough'),
('171K.', 'cough'),
('171L.', 'cough'),
('171Z.', 'cough'),
('172..', 'cough'),
('H3101', 'cough'),
('173B.', 'cough'),--	Nocturnal cough / wheeze

--sputum
--from codelist creator 28/12/16 (synonyms:  "sputum", "mucus", "secretion", "phlegm", "snot", "productive cough", "chesty cough", "acid fast"
('74590', 'sputum'), --
('74591', 'sputum'), --
('74595', 'sputum'), --
('R1531', 'sputum'), --
('R064.', 'sputum'), --
('R0640', 'sputum'), --
('R0641', 'sputum'), --
('R0642', 'sputum'), --
('R0643', 'sputum'), --
('R064z', 'sputum'), --
('4KC..', 'sputum'), --
('4JF5.', 'sputum'), --
('4E...', 'sputum'), --
('4E1..', 'sputum'), --
('4E2..', 'sputum'), --
('4E3..', 'sputum'), --
('4E11.', 'sputum'), --
('4E12.', 'sputum'), --
('4E13.', 'sputum'), --
('4E14.', 'sputum'), --
('4E1Z.', 'sputum'), --
('4E21.', 'sputum'), --
('4E22.', 'sputum'), --
('4E23.', 'sputum'), --
('4E24.', 'sputum'), --
('4E25.', 'sputum'), --
('4E26.', 'sputum'), --
('4E27.', 'sputum'), --
('4E28.', 'sputum'), --
('4E29.', 'sputum'), --
('4E2A.', 'sputum'), --
('4E2C.', 'sputum'), --
('4E2D.', 'sputum'), --
('4E2E.', 'sputum'), --
('4E2F.', 'sputum'), --
('4E2G.', 'sputum'), --
('4E2Z.', 'sputum'), --
('4E31.', 'sputum'), --
('4E32.', 'sputum'), --
('4E33.', 'sputum'), --
('4E34.', 'sputum'), --
('4E35.', 'sputum'), --
('4E36.', 'sputum'), --
('4E37.', 'sputum'), --
('4E38.', 'sputum'), --
('4E39.', 'sputum'), --
('4E3A.', 'sputum'), --
('4E290', 'sputum'), --
('4E291', 'sputum'), --
('4E2E0', 'sputum'), --
('4E2E1', 'sputum'), --
('4E2E3', 'sputum'), --
('41D4.', 'sputum'), --
('172..', 'sputum'), --
('1713.', 'sputum'), --
('1714.', 'sputum'), --
('1715.', 'sputum'), --
('1716.', 'sputum'), --
('1719.', 'sputum'), --
('171H.', 'sputum'), --

--palpitations
--codelist creator
('R050.', 'palps'),--	[D]Tachycardia, unspecified
('R051.', 'palps'),--	[D]Palpitations
('R0510', 'palps'),--	[D]Awareness of heart beat
('R051z', 'palps'),--	[D]Palpitations NOS
('181..', 'palps'),--	Palpitations
('1812.', 'palps'),--	Palpitations
('1813.', 'palps'),--	"Bumping" of heart
('1814.', 'palps'),--	"Fluttering" of heart
('181Z.', 'palps'),--	Palpitations NOS

--syncope
--codelist creator
('SN21.', 'syncope'),--	Heat syncope/collapse,Heat syncope or collapse
('R0620', 'syncope'),--	[D]Cough syncope
('R002.', 'syncope'),--	[D]Syncope and collapse
('R0020', 'syncope'),--	[D]Blackout
('R0021', 'syncope'),--	[D]Fainting
('R0022', 'syncope'),--	[D]Vasovagal attack
('R0023', 'syncope'),--	[D]Collapse
('R0024', 'syncope'),--	[D]Micturition syncope
('R0025', 'syncope'),--	[D]Defaecation syncope
('R0026', 'syncope'),--	[D]Asystolic vasovagal syncope
('R0027', 'syncope'),--	[D]Drop attack
('R002z', 'syncope'),--	[D]Syncope and collapse NOS
('R004.', 'syncope'),--	[D]Dizziness and giddiness
('R0040', 'syncope'),--	[D]Dizziness
('R0041', 'syncope'),--	[D]Giddiness
('R0042', 'syncope'),--	[D]Light-headedness
--('R0043', 'syncope'),--	[D]Vertigo NOS
--('R0044', 'syncope'),--	[D]Acute vertigo
('R004z', 'syncope'),--	[D]Dizziness and giddiness NOS
('2244.', 'syncope'),--	O/E - collapse - syncope
('224Z.', 'syncope'),--	O/E - collapse NOS
('1B62.', 'syncope'),--	Syncope/vasovagal faint
('1B65.', 'syncope'),--	Had a collapse
('1B66.', 'syncope'),--	Had a blackout
('1B68.', 'syncope'),--	Felt faint
--('1B6A.', 'syncope'),--	Muzzy headed
('1B6D.', 'syncope'),--	Funny turn
('1B53.', 'syncope'),--	Dizziness present
('1B54.', 'syncope'),--	Giddiness present
('1B55.', 'syncope'),--	Dizziness on standing up
--('1B56.', 'syncope'),--	Vertigo
('1B57.', 'syncope'),--	Dizziness on lying still

--chest pain
--codelist creator
('Ryu04', 'cp'),--	[X]Other chest pain
('R065.', 'cp'),--	[D]Chest pain
('R0650', 'cp'),--	[D]Chest pain, unspecified
('R0651', 'cp'),--	[D]Precordial pain
--('R0652', 'cp'),--	[D]Anterior chest wall pain
('R0653', 'cp'),--	[D]Painful respiration NOS
('R0654', 'cp'),--	[D]Pleuritic pain
('R0655', 'cp'),--	[D]Pleurodynia
('R0656', 'cp'),--	[D]Chest discomfort
('R0657', 'cp'),--	[D]Chest pressure
('R0658', 'cp'),--	[D]Chest tightness
('R0659', 'cp'),--	[D]Parasternal chest pain
('R065C', 'cp'),--	[D]Retrosternal chest pain
('R065D', 'cp'),--	[D]Central chest pain
('R065z', 'cp'),--	[D]Chest pain NOS
('G33z4', 'cp'),--	Ischaemic chest pain
('G33z0', 'cp'),--	Status anginosus,Status anginosus,Status anginosus,Status anginosus
('G33z1', 'cp'),--	Stenocardia,Stenocardia,Stenocardia,Stenocardia
('G33z2', 'cp'),--	Syncope anginosa,Syncope anginosa,Syncope anginosa,Syncope anginosa
('G33z3', 'cp'),--	Angina on effort,Angina on effort,Angina on effort,Angina on effort
('G33z6', 'cp'),--	New onset angina,New onset angina,New onset angina,New onset angina
('182..', 'cp'),--	Chest pain
('1822.', 'cp'),--	Central chest pain
('1823.', 'cp'),--	Precordial pain
--('1824.', 'cp'),--	Anterior chest wall pain
('1825.', 'cp'),--	Pleuritic pain
('1826.', 'cp'),--	Parasternal pain
('1827.', 'cp'),--	Painful breathing -pleurodynia
('1828.', 'cp'),--	Atypical chest pain
('1829.', 'cp'),--	Retrosternal pain
('182A.', 'cp'),--	Chest pain on exertion
('182B.', 'cp'),--	Rib pain
--('182C.', 'cp'),--	Chest wall pain
('182Z.', 'cp'),--	Chest pain NOS
--('182B0', 'cp'),--	Costal margin chest pain

--sob
--codelist creator
('R0602', 'sob'),--	[D]Orthopnoea
('R0603', 'sob'),--	[D]Tachypnoea
('R0606', 'sob'),--	[D]Respiratory distress
('R0607', 'sob'),--	[D]Respiratory insufficiency
('R0608', 'sob'),--	[D]Shortness of breath
('R060A', 'sob'),--	[D]Dyspnoea
('R0601', 'sob'),--	[D]Hyperventilation
('R060D', 'sob'),--	[D]Breathlessness
('2353.', 'sob'),--	O/E - tachypnoea
('2322.', 'sob'),--	O/E - dyspnoea
('2323.', 'sob'),--	O/E - orthopnoea
('2324.', 'sob'),--	O/E - respiratory distress
('2327.', 'sob'),--	O/E - accessory resp.m's.used
('232B.', 'sob'),--	O/E - air hunger
('232D.', 'sob'),--	O/E - sternal recession
('232E.', 'sob'),--	O/E - intercostal recession
('232F.', 'sob'),--	O/E - subcostal recession
('232A.', 'sob'),--	O/E - hyperventilating
('232G.', 'sob'),--	O/E - suprasternal recession
('1732.', 'sob'),--	Breathless - moderate exertion
('1733.', 'sob'),--	Breathless - mild exertion
('1734.', 'sob'),--	Breathless - at rest
('1735.', 'sob'),--	Breathless - lying flat
('1736.', 'sob'),--	Paroxysmal nocturnal dyspnoea
('1738.', 'sob'),--	Difficulty breathing
('1739.', 'sob'),--	Shortness of breath
('173C.', 'sob'),--	Short of breath on exertion
('173D.', 'sob'),--	Nocturnal dyspnoea
('173F.', 'sob'),--	SOB dressing/undressing,Short of breath dressing/undressing
('173G.', 'sob'),--	Breathless - strenuous exertn,Breathless - strenuous exertion
('173I.', 'sob'),--	MRC Breathless Scale: grade 2,MRC Breathlessness Scale: grade 2
('173J.', 'sob'),--	MRC Breathless Scale: grade 3,MRC Breathlessness Scale: grade 3
('173K.', 'sob'),--	MRC Breathless Scale: grade 4,MRC Breathlessness Scale: grade 4
('173L.', 'sob'),--	MRC Breathless Scale: grade 5,MRC Breathlessness Scale: grade 5
('173R.', 'sob'),--	Borg Breathless: 3 moderate,Borg Breathlessness Score: 3 moderate
('173V.', 'sob'),--	Borg Breathless: 6 severe (+),Borg Breathlessness Score: 6 severe (+)
('173W.', 'sob'),--	Borg Breathless: 7 very severe,Borg Breathlessness Score: 7 very severe
('173X.', 'sob'),--	Borg Breathless: 8 v severe(+),Borg Breathlessness Score: 8 very severe (+)
('173Y.', 'sob'),--	Borg Breathless: 9 v v severe,Borg Breathlessness Score: 9 very, very sev (almost maximal),Borg Breathlessness Score: 9 very, very severe (almost maximal)
('173a.', 'sob'),--	Borg Breathless: 10 maximal,Borg Breathlessness Score: 10 maximal


--soboe
--from codelist creator 28/12/16 (synonyms:  "breathless", "Dyspnoea", "Dyspnea","soboe", "sob", "Hunger air", "air hunger", "short of breath
('1732.', 'soboe'), --	00	Breathless - moderate exertion
('1733.', 'soboe'), --	00	Breathless - mild exertion
('173C.', 'soboe'), --	00	Short of breath on exertion
('173F.', 'soboe'), --	00	Short of breath dressing/undressing
('173G.', 'soboe'), --	00	Breathless - strenuous exertion
('173I.', 'soboe'), --	00	MRC Breathlessness Scale: grade 2
('173J.', 'soboe'), --	00	MRC Breathlessness Scale: grade 3
('173K.', 'soboe'), --	00	MRC Breathlessness Scale: grade 4

--emergency admission - resp / medical
--from codelist creator 2/12/16 (synonyms: "emergency admission", "hospitalisation","accident and emergency", "emergency department", "accident emergency", "medical emergency", "hospital emergency","hospital casualty", "admission to hospital", "admit to intensive care", "discharged from inpatient care", "medical self-referral", "self-referral to hospital", "admission by", "re-admission", "admission to aau", "admission to observation ward", "admit",  "admission",  "refer",  "discharged")
('9b8D.', 'EmergencyAdmissionMedicalResp'),
('9Nz3.', 'EmergencyAdmissionMedicalResp'),
('9Nr..', 'EmergencyAdmissionMedicalResp'),
('9N6n.', 'EmergencyAdmissionMedicalResp'),
('9N5G7', 'EmergencyAdmissionMedicalResp'),
('9N19.', 'EmergencyAdmissionMedicalResp'),
('8V0..', 'EmergencyAdmissionMedicalResp'),
('8V00.', 'EmergencyAdmissionMedicalResp'),
('8V000', 'EmergencyAdmissionMedicalResp'),
('8V001', 'EmergencyAdmissionMedicalResp'),
('8V002', 'EmergencyAdmissionMedicalResp'),
('8V003', 'EmergencyAdmissionMedicalResp'),
('8V004', 'EmergencyAdmissionMedicalResp'),
('8V005', 'EmergencyAdmissionMedicalResp'),
('8V006', 'EmergencyAdmissionMedicalResp'),
('8V007', 'EmergencyAdmissionMedicalResp'),
('8HJJ.', 'EmergencyAdmissionMedicalResp'),
('8HJ..', 'EmergencyAdmissionMedicalResp'),
('8HE2.', 'EmergencyAdmissionMedicalResp'),
('8HE..', 'EmergencyAdmissionMedicalResp'),
('8HE8.', 'EmergencyAdmissionMedicalResp'),
('8H1..', 'EmergencyAdmissionMedicalResp'),
('8H12.', 'EmergencyAdmissionMedicalResp'),
('8H1Z.', 'EmergencyAdmissionMedicalResp'),
('8H2..', 'EmergencyAdmissionMedicalResp'),
('8HC..', 'EmergencyAdmissionMedicalResp'),
('8Hd..', 'EmergencyAdmissionMedicalResp'),
('8Hu..', 'EmergencyAdmissionMedicalResp'),
('8H21.', 'EmergencyAdmissionMedicalResp'),
('8H2X.', 'EmergencyAdmissionMedicalResp'),
('8H2Z.', 'EmergencyAdmissionMedicalResp'),
('8HC1.', 'EmergencyAdmissionMedicalResp'),
('8HCZ.', 'EmergencyAdmissionMedicalResp'),
('8Hd0.', 'EmergencyAdmissionMedicalResp'),
('8Hd1.', 'EmergencyAdmissionMedicalResp'),
('8Hd2.', 'EmergencyAdmissionMedicalResp'),
('8Hd3.', 'EmergencyAdmissionMedicalResp'),
('8Hd4.', 'EmergencyAdmissionMedicalResp'),
('8Hd5.', 'EmergencyAdmissionMedicalResp'),
('8Hd7.', 'EmergencyAdmissionMedicalResp'),
('8CAq.', 'EmergencyAdmissionMedicalResp'),

--mrc2
--from SS
('173I.', 'mrc2'),

--mrc
--from SS
('173H.', 'mrc'),  --	00	MRC Breathlessness Scale: grade 1
('173I.', 'mrc'),  --	00	MRC Breathlessness Scale: grade 2
('173J.', 'mrc'),  --	00	MRC Breathlessness Scale: grade 3
('173K.', 'mrc'),  --	00	MRC Breathlessness Scale: grade 4
('173L.', 'mrc'),  --	00	MRC Breathlessness Scale: grade 5

--pulmonary rehab offered
--from SS
('9NSL.', 'pulRehabOfferedSs'),	--Pulmonary rehabilitation offered

--pulmonary rehab temp ex
--from SS
('9kf0.', 'pulRehabTempExSs'),	--Chronic obstructive pulmonary disease patient unsuitable for pulmonary rehabilitation - enhanced services administration
('8IA9.', 'pulRehabTempExSs'),	--Pulmonary rehabilitation declined

--calcium
--from SIR search of 1 GP practice
('44I8.', 'calcium'),
('44IC.', 'calcium'),
('44h7.', 'calcium'),
('44h9.', 'calcium'),
('44h4.', 'calcium'),
('4Q72100', 'calcium'),
('4Q72.', 'calcium'),
('44IC000', 'calcium'),
('44IC0', 'calcium'),

--ckd invite - 3rd
--from manual search
('9Ot2.', 'ckd3rdInvite'),

--ckd invite - any
--from manual search
('9Ot0.', 'ckdInvite'),	--Chronic kidney disease monitoring first letter
('9Ot1.', 'ckdInvite'),	--Chronic kidney disease monitoring second letter
('9Ot2.', 'ckdInvite'), --Chronic kidney disease monitoring third letter
('9Ot3.', 'ckdInvite'),	--Chronic kidney disease monitoring verbal invite
('9Ot4.', 'ckdInvite'), --Chronic kidney disease monitoring telephone invite

--copd invite - 3rd
--from manual search
('9Oi2.', 'copd3rdInvite'), --	Chronic obstructive pulmonary disease monitoring 3rd letter

--copd invite - any
--from manual search
('9Oi0.', 'copdInvite'),	--	00	Chronic obstructive pulmonary disease monitoring 1st letter
('9Oi1.', 'copdInvite'),	--	00	Chronic obstructive pulmonary disease monitoring 2nd letter
('9Oi2.', 'copdInvite'), --	00	Chronic obstructive pulmonary disease monitoring 3rd letter
('9Oi3.', 'copdInvite'),	--	00	Chronic obstructive pulmonary disease monitoring verbal invite
('9Oi4.', 'copdInvite'), --	00	Chronic obstructive pulmonary disease monitoring phone invite

--ckd stages 3-5
--from v34 QOF
	('1Z12.', 'ckd35'),
	('1Z13.', 'ckd35'),
	('1Z14.', 'ckd35'),
	('1Z15.', 'ckd35'), 
	('1Z16.', 'ckd35'),
	('1Z1B.', 'ckd35'),
	('1Z1C.', 'ckd35'),
	('1Z1D.', 'ckd35'),
	('1Z1E.', 'ckd35'),
	('1Z1F.', 'ckd35'),
	('1Z1G.', 'ckd35'),
	('1Z1H.', 'ckd35'),
	('1Z1J.', 'ckd35'),
	('1Z1K.', 'ckd35'),
	('1Z1L.', 'ckd35'),
	('K053.', 'ckd35'),
	('K054.', 'ckd35'),
	('K055.', 'ckd35'),
	('1Z1f.', 'ckd35'),
	('1Z1a.', 'ckd35'),
	('1Z1b.', 'ckd35'),
	('1Z1c.', 'ckd35'),
	('1Z1c.', 'ckd35'),
	('1Z1e.', 'ckd35'),
	('1Z1T.', 'ckd35'),
	('1Z1V.', 'ckd35'),
	('1Z1W.', 'ckd35'),
	('1Z1X.', 'ckd35'),
	('1Z1Y.', 'ckd35'),
	('1Z1Z.', 'ckd35'),

--ckd permanent exclusion codes: CKD1/2 or ckd resolved
--from v34 QOF
	('1Z10.', 'ckdPermEx'),
	('1Z11.', 'ckdPermEx'),
	('1Z17.', 'ckdPermEx'),
	('1Z18.', 'ckdPermEx'),
	('1Z19.', 'ckdPermEx'),
	('1Z1A.', 'ckdPermEx'),
	('1Z1M.', 'ckdPermEx'),
	('1Z1Q.', 'ckdPermEx'),
	('K051.', 'ckdPermEx'),
	('K052.', 'ckdPermEx'),
	('1Z1N.', 'ckdPermEx'),
	('1Z1P.', 'ckdPermEx'),
	('1Z1R.', 'ckdPermEx'),
	('1Z1S.', 'ckdPermEx'),
	('2126E', 'ckdPermEx'),
	

--ckd temporary exclusion codes: BP refused, max HTN medication, CKD indicators unsuitable
--from CKD ruleset_INLIQ_v32.0
	('9hE..', 'ckdTempEx'), --9hE..	00	Exception reporting: chronic kidney disease quality indicators
	('9hE1.', 'ckdTempEx'), --9hE0.	00	Excepted from chronic kidney disease quality indicators: Patient unsuitable
	('9hE0.', 'ckdTempEx'), --9hE1.	00	Excepted from chronic kidney disease quality indicators: Informed dissent

--bp temp ex
--from CKD ruleset_INLIQ_v32.0
	('8I3Y.', 'bpTempEx'), --8I3Y.	00	Blood pressure procedure refused
	('8BL0.', 'bpTempEx'), --8BL0.	00	Patient on maximal tolerated antihypertensive therapy

--pad
--from PAD ruleset_v34.0
--http://content.digital.nhs.uk/media/21018/PAD-rulesetv340/pdf/PAD_ruleset_v34.0.pdf
('G73..', 'padQof'),--	00	Other peripheral vascular disease
('G73z.', 'padQof'),--	00	Peripheral vascular disease NOS
('G73z0', 'padQof'),--	00	Intermittent claudication
('G73zz', 'padQof'),--	00	Peripheral vascular disease NOS
('Gyu74', 'padQof'),--	00	[X]Other specified peripheral vascular diseases
('G734.', 'padQof'),--	00	Peripheral arterial disease
('G73y.', 'padQof'),--	00	Other specified peripheral vascular disease

--dead
--from codelist creator 13/7/16 (synonyms:"dead", "death", "deceased", "died", "ghost", "fp22", "coroner", "cremation", "burial", "SD17", "post mortem", "med A", "crem. form", "mortality") 
	('T0y0.', 'dead'), --T0y0.	00	Found dead on railway right-of-way unspecified
	('T0y00', 'dead'),
	('T0y01', 'dead'),
	('T0y02', 'dead'),
	('T0y03', 'dead'),
	('T0y0y', 'dead'),
	('T0y0z', 'dead'),
	('RyuC.', 'dead'),--RyuC.	00	[X]Ill-defined and unknown causes of mortality
	('RyuC0', 'dead'),
	('RyuC1', 'dead'),
	('RyuC2', 'dead'),
	('R21..', 'dead'),--R21..	00	[D]Sudden death, cause unknown
	('R210.', 'dead'),
	('R211.', 'dead'),
	('R212.', 'dead'),
	('R213.', 'dead'),
	('R21z.', 'dead'),
	('R2100', 'dead'),
	('R2101', 'dead'),
	('R2102', 'dead'),
	('R2103', 'dead'),
	('R2104', 'dead'),
	('R210z', 'dead'),
	('R2120', 'dead'),
	('R2121', 'dead'),
	('R212z', 'dead'),
	('R2130', 'dead'),
	('R2131', 'dead'),
	('R213z', 'dead'),
	('Q48y6', 'dead'),--Q48y6	00	Early neonatal death
	('Q48y7', 'dead'),
	--('Q016.', 'dead'),--Q016.	00	Fetus or neonate affected by maternal death
	--('L39A.', 'dead'),--L39A.	00	Death from any obstetric cause occurring more than 42 days but less than one year after delivery
	--('L39A0', 'dead'),
	--('L39A1', 'dead'),
	--('L39B.', 'dead'),
	('L39X.', 'dead'),
	('G5751', 'dead'),--G5751	00	Sudden cardiac death, so described
	--('9OG3.', 'dead'),--9OG3.	00	Geriatric screen - ?ghost
	--('9OG4.', 'dead'),--9OG4.	00	Geriatric screen - ghost
	('9O47.', 'dead'),
	('9O37.', 'dead'),--9O37.	00	Deleted from call-ghost
	('94...', 'dead'),--94...	00	Death administration
	('941..', 'dead'),
	('942..', 'dead'),
	('943..', 'dead'),
	('944..', 'dead'),
	('945..', 'dead'),
	('946..', 'dead'),
	('947..', 'dead'),
	('948..', 'dead'),
	('949..', 'dead'),
	('94A..', 'dead'),
	('94B..', 'dead'),
	('94C..', 'dead'),
	('94D..', 'dead'),
	('94E..', 'dead'),
	('94F..', 'dead'),
	('94G..', 'dead'),
	('94Z..', 'dead'),
	('9411.', 'dead'),
	('9412.', 'dead'),
	('9413.', 'dead'),
	('9414.', 'dead'),
	('941Z.', 'dead'),
	('9431.', 'dead'),
	('9432.', 'dead'),
	('9433.', 'dead'),
	('943Z.', 'dead'),
	('9441.', 'dead'),
	('9442.', 'dead'),
	('9443.', 'dead'),
	('944Z.', 'dead'),
	('9451.', 'dead'),
	('9452.', 'dead'),
	('9453.', 'dead'),
	('9454.', 'dead'),
	('945Z.', 'dead'),
	('9471.', 'dead'),
	('9472.', 'dead'),
	('9473.', 'dead'),
	('947Z.', 'dead'),
	('9481.', 'dead'),
	('9482.', 'dead'),
	('9483.', 'dead'),
	('9484.', 'dead'),
	('9485.', 'dead'),
	('9486.', 'dead'),
	('948Z.', 'dead'),
	('9491.', 'dead'),
	('9492.', 'dead'),
	('9493.', 'dead'),
	('9494.', 'dead'),
	('9495.', 'dead'),
	('9496.', 'dead'),
	('9497.', 'dead'),
	('9498.', 'dead'),
	('9499.', 'dead'),
	('949A.', 'dead'),
	('949B.', 'dead'),
	('949C.', 'dead'),
	('949D.', 'dead'),
	('949E.', 'dead'),
	('949F.', 'dead'),
	('949G.', 'dead'),
	('949H.', 'dead'),
	('949J.', 'dead'),
	('949Z.', 'dead'),
	('94C0.', 'dead'),
	('94C1.', 'dead'),
	('94F0.', 'dead'),
	('94F1.', 'dead'),
	--('94Z0.', 'dead'),--94Z0.	00	Preferred place of death
	--('94Z1.', 'dead'),--94Z1.	00	Preferred place of death: home
	--('94Z2.', 'dead'),
	--('94Z3.', 'dead'),
	--('94Z4.', 'dead'),
	--('94Z5.', 'dead'),
	--('94Z6.', 'dead'),
	--('94Z7.', 'dead'),
	--('94Z8.', 'dead'),
	--('94Z9.', 'dead'),
	--('94ZA.', 'dead'),
	--('94ZB.', 'dead'),
	--('94ZC.', 'dead'),
	--('94ZD.', 'dead'),
	--('94ZE.', 'dead'),
	--('94ZF.', 'dead'),
	--('94ZG.', 'dead'),
	('9234.', 'dead'),--9234.	00	FP22-death
	('9134.', 'dead'),--9134.	00	Registration ghost - deceased
--	('913..', 'dead'),
	('8HG..', 'dead'),--8HG..	00	Died in hospital
	('7L1M0', 'dead'),--7L1M0	00	Preoperative anaesthetic death
	('56C..', 'dead'),--56C..	00	Post-mortem radiology
	('56C1.', 'dead'),
	('56C2.', 'dead'),
	('56C3.', 'dead'),
	('56C4.', 'dead'),
	('56C5.', 'dead'),
	('56C6.', 'dead'),
	('56C7.', 'dead'),
	('56C8.', 'dead'),
	('56C9.', 'dead'),
	('56CZ.', 'dead'),
	('4K9..', 'dead'),--4K9..	00	Post mortem exam.
	('4K91.', 'dead'),
	('4K92.', 'dead'),
	('4K93.', 'dead'),
	('4K94.', 'dead'),
	('4K95.', 'dead'),
	('4K96.', 'dead'),
	('4K9Z.', 'dead'),
	--('38Qd.', 'dead'),--38Qd.	00	Gold Standards Framework After Death Analysis Audit Tool
	('22J..', 'dead'),--22J..	00	O/E - dead
	('22J1.', 'dead'),
	('22J2.', 'dead'),
	('22J3.', 'dead'),
	('22J4.', 'dead'),
	('22J5.', 'dead'),
	('22J6.', 'dead'),
	('22J7.', 'dead'),
	('22J8.', 'dead'),
	('22J9.', 'dead'),
	('22JA.', 'dead'),
	('22JZ.', 'dead')


--DEregistration: patient DEregistration at a practice
--from codelist creator 13/7/16 (synonyms: "de-registered", "de-registration", "deregister", "deregistration",  "moved away", "left practice",   " ghost",   "de-reg",  "patient removed",  "FP22")
insert into codeGroups
values
	('9O37.', 'deRegistered'),
	('9O47.', 'deRegistered'),
	('9OG4.', 'deRegistered'),
	('926..', 'deRegistered'),
	('92...', 'deRegistered'),
	('9232.', 'deRegistered'),
	('923..', 'deRegistered'),
	('9235.', 'deRegistered'),
	('9236.', 'deRegistered'),
	('9238.', 'deRegistered'),
	('923B.', 'deRegistered'),
	('923D.', 'deRegistered'),
	('923F.', 'deRegistered'),
	('923J.', 'deRegistered'),
	('923K.', 'deRegistered'),
	('923L.', 'deRegistered'),
	('923M.', 'deRegistered'),
	('923N.', 'deRegistered'),
	('923Z.', 'deRegistered'),
	('9131.', 'deRegistered'),
	('913..', 'deRegistered'),
	('9134.', 'deRegistered'),
	('913Z.', 'deRegistered'),

--diabetes
--from QOF Diabetes ruleset_v34.0 8
	('C10..', 'dm'),
	('C109J', 'dm'),
	('C109K', 'dm'),
	('C10C.', 'dm'),
	('C10D.', 'dm'),
	('C10E.', 'dm'),
	('C10E0', 'dm'),
	('C10E1', 'dm'),
	('C10E2', 'dm'),
	('C10E3', 'dm'),
	('C10E4', 'dm'),
	('C10E5', 'dm'),
	('C10E6', 'dm'),
	('C10E7', 'dm'),
	('C10E8', 'dm'),
	('C10E9', 'dm'),
	('C10EA', 'dm'),
	('C10EB', 'dm'),
	('C10EC', 'dm'),
	('C10ED', 'dm'),
	('C10EE', 'dm'),
	('C10EF', 'dm'),
	('C10EG', 'dm'),
	('C10EH', 'dm'),
	('C10EJ', 'dm'),
	('C10EK', 'dm'),
	('C10EL', 'dm'),
	('C10EM', 'dm'),
	('C10EN', 'dm'),
	('C10EP', 'dm'),
	('C10EQ', 'dm'),
	('C10ER', 'dm'),
	('C10F.', 'dm'),
	('C10F0', 'dm'),
	('C10F1', 'dm'),
	('C10F2', 'dm'),
	('C10F3', 'dm'),
	('C10F4', 'dm'),
	('C10F5', 'dm'),
	('C10F6', 'dm'),
	('C10F7', 'dm'),
	('C10F8', 'dm'),
	('C10F9', 'dm'),
	('C10FA', 'dm'),
	('C10FB', 'dm'),
	('C10FC', 'dm'),
	('C10FD', 'dm'),
	('C10FE', 'dm'),
	('C10FF', 'dm'),
	('C10FG', 'dm'),
	('C10FH', 'dm'),
	('C10FJ', 'dm'),
	('C10FK', 'dm'),
	('C10FL', 'dm'),
	('C10FM', 'dm'),
	('C10FN', 'dm'),
	('C10FP', 'dm'),
	('C10FQ', 'dm'),
	('C10FR', 'dm'),
	('C10FS', 'dm'),
	('C10G.', 'dm'),
	('C10G0', 'dm'),
	('C10H.', 'dm'),
	('C10H0', 'dm'),
	('C10M.', 'dm'),
	('C10M0', 'dm'),
	('C10N.', 'dm'),
	('C10N0', 'dm'),
	('C10N1', 'dm'),
	('PKyP.', 'dm'),
	('C10P.', 'dm'),
	('C10P0', 'dm'),
	('C10P1', 'dm'),
	('C10Q.', 'dm'),

--dm permanent exclusion: i.e. DM resolved
--from QOF Diabetes ruleset_v34.0
	('21263', 'dmPermEx'), --	00	Diabetes resolved
	('212H.', 'dmPermEx'), --	00	Diabetes resolved
	
--egfr
('451E.', 'egfr'),
('451F.', 'egfr'),
('451G.', 'egfr'),
('451M.', 'egfr'), 
('451N.', 'egfr'), 
('451K.', 'egfr'),

--frail
--from codelist creator on 20/10/16 (synonyms: "frail", "elderly", "old", "senile", "cachectic", "cachexic")
('R200.', 'frail'),
('R0331', 'frail'),
('C373D', 'frail'),
('C373G', 'frail'),
('2229.', 'frail'),
('2224.', 'frail'),
('133R.', 'frail'),
('2Jd1.', 'frail'), --browser search - moderate frailty
('2Jd2.', 'frail'),	--browser search - severe frailty
('69D9.', 'frail'),	--edmonton score - frailty
('HNGNQRF75', 'frail'),	--edmonton score - severe frailty

--gout
--from codelist creator 26/10/16 Read v2 April 2016: synonyms ["gout","symptomatic hyperuricaemia","hyperuricaemia","hyperuricemia", "uric acid"
('Nyu17', 'gout'),
('C34..', 'gout'),
('C340.', 'gout'),
('C341.', 'gout'),
('C342.', 'gout'),
('C343.', 'gout'),
('C344.', 'gout'),
('C345.', 'gout'),
('C346.', 'gout'),
('C34y.', 'gout'),
('C34z.', 'gout'),
('C3410', 'gout'),
('C3411', 'gout'),
('C341z', 'gout'),
('C34y0', 'gout'),
('C34y1', 'gout'),
('C34y2', 'gout'),
('C34y3', 'gout'),
('C34y4', 'gout'),
('C34y5', 'gout'),
('C34y6', 'gout'),
('C34yz', 'gout'),
('669..', 'gout'),
('6691.', 'gout'),
('6692.', 'gout'),
('6693.', 'gout'),
('6694.', 'gout'),
('6695.', 'gout'),
('6696.', 'gout'),
('6697.', 'gout'),
('6698.', 'gout'),
('6699.', 'gout'),
('669A.', 'gout'),
('669Z.', 'gout'),
('1443.', 'gout'), 

--gout drugs
--from codelist creator 26/10/16 Read v2 April 2016: synonyms "synonyms": ["gout","hyperuricaemia","hyperuricemia","colchicine","Canakinumab","allopurinol","Febuxostat", "y","ilaris","adenuric","probenecid","aloral","aluline","caplenal","cosuric","hamarin","xanthomax","rimapurinol","benemid","anturan"
('j6...', 'goutDrugs'),
('j61..', 'goutDrugs'),
('j62..', 'goutDrugs'),
('j63..', 'goutDrugs'),
('j64..', 'goutDrugs'),
('j611.', 'goutDrugs'),
('j612.', 'goutDrugs'),
('j613.', 'goutDrugs'),
('j614.', 'goutDrugs'),
('j615.', 'goutDrugs'),
('j616.', 'goutDrugs'),
('j617.', 'goutDrugs'),
('j618.', 'goutDrugs'),
('j619.', 'goutDrugs'),
('j61a.', 'goutDrugs'),
('j61b.', 'goutDrugs'),
('j61c.', 'goutDrugs'),
('j61d.', 'goutDrugs'),
('j61e.', 'goutDrugs'),
('j61f.', 'goutDrugs'),
('j61g.', 'goutDrugs'),
('j61h.', 'goutDrugs'),
('j621.', 'goutDrugs'),
('j622.', 'goutDrugs'),
('j631.', 'goutDrugs'),
('j63z.', 'goutDrugs'),
('j641.', 'goutDrugs'),
('j642.', 'goutDrugs'),
('j64y.', 'goutDrugs'),
('j64z.', 'goutDrugs'),
('h8H..', 'goutDrugs'),
('h8H1.', 'goutDrugs'),
('h8H2.', 'goutDrugs'),

--heart block: 2nd and 3rd degree
--from codelist creator on 26/10/16 Read v2 April 2016 (synonyms: "block", "mobitz", "av block", "atrioventricular block", "wenckebach"
('G560.', '2/3heartBlock'),
('G561.', '2/3heartBlock'),
('G5612', '2/3heartBlock'),
('G5613', '2/3heartBlock'),
('G5614', '2/3heartBlock'),
('G561z', '2/3heartBlock'),
('329..', '2/3heartBlock'),
('3292.', '2/3heartBlock'),
('3293.', '2/3heartBlock'),
('3295.', '2/3heartBlock'),
('3296.', '2/3heartBlock'),
('3297.', '2/3heartBlock'),
('3298.', '2/3heartBlock'),
('329H.', '2/3heartBlock'),
('329Z.', '2/3heartBlock'),

--htn qof codes
--from Hypertension ruleset_v34.0
('G2...', 'htnQof'), --	00	Hypertensive disease
('G20..', 'htnQof'), --	00	Essential hypertension
('G200.', 'htnQof'), --	00	Malignant essential hypertension
('G201.', 'htnQof'), --	00	Benign essential hypertension
('G202.', 'htnQof'), --	00	Systolic hypertension
('G203.', 'htnQof'), --	00	Diastolic hypertension
('G20z.', 'htnQof'), --	00	Essential hypertension NOS
('G24..', 'htnQof'), --	00	Secondary hypertension
('G240.', 'htnQof'), --	00	Secondary malignant hypertension
--G2400	00	Secondary malignant renovascular hypertension - EXCLUDED FROM QOF
('G240z', 'htnQof'), --	00	Secondary malignant hypertension NOS
('G241.', 'htnQof'), --	00	Secondary benign hypertension
--G2410	00	Secondary benign renovascular hypertension - EXCLUDED FROM QOF
('G241z', 'htnQof'), --	00	Secondary benign hypertension NOS
('G244.', 'htnQof'), --	00	Hypertension secondary to endocrine disorders
('G24z.', 'htnQof'), --	00	Secondary hypertension NOS
('G24z0', 'htnQof'), --	00	Secondary renovascular hypertension NOS
--G24z1	00	Hypertension secondary to drug - EXCLUDED FROM QOF
('G24zz', 'htnQof'), --	00	Secondary hypertension NOS
('G25..', 'htnQof'), --	00	Stage 1 hypertension (NICE - National Institute for Health and Clinical Excellence 2011)
('G250.', 'htnQof'), --	00	Stage 1 hypertension (NICE 2011) without evidence of end organ damage
('G251.', 'htnQof'), --	00	Stage 1 hypertension (NICE 2011) with evidence of end organ damage
('G26..', 'htnQof'), --	00	Severe hypertension (NICE - National Institute for Health and Clinical Excellence 2011)
--G27..	00	Hypertension resistant to drug therapy - EXCLUDED FROM QOF
('G28..', 'htnQof'), --	00	Stage 2 hypertension (NICE - National Institute for Health and Clinical Excellence 2011)
('G2y..', 'htnQof'), --	00	Other specified hypertensive disease
('G2z..', 'htnQof'), --	00	Hypertensive disease NOS
('Gyu2.', 'htnQof'), --	00	[X]Hypertensive diseases
('Gyu20', 'htnQof'), --	00	[X]Other secondary hypertension

--htn qof exclusions
--from Hypertension ruleset_v34.0
('21261', 'htnPermEx'), --	00	Hypertension resolved
('212K.', 'htnPermEx'), --	00	Hypertension resolved

--htn qof exceptions
--from Hypertension ruleset_v34.0
('9h3..', 'htnTempEx'), --	00	Exception reporting: hypertension quality indicators
('9h31.', 'htnTempEx'), --	00	Excepted from hypertension quality indicators: Patient unsuitable
('9h32.', 'htnTempEx'), --	00	Excepted from hypertension quality indicators: Informed dissent

--housebound
--from codelist creator on 20/10/16 (synonyms: "housebound", "house-bound", "immobil*")
('R00C.', 'housebound'),
('6AG..', 'housebound'),
('3980.', 'housebound'),
('13CA.', 'housebound'),
('13CC.', 'housebound'),
	
--housebound perm ex
--manual search
('13CW.', 'houseboundPermEx');

--hyperthyroidism
--browser search
insert into codeGroups
select readcode, 'hyperthyroid' from SIR_ReadCode_Rubric
where readcode like 'C020%'
or readcode like 'C021%'
or readcode like 'C022%'
or readcode like 'C023%'
or readcode like 'C024%'
or readcode like 'C02y%'
or readcode like 'C02z%'
or readcode in ('C02..','1431.')
group by readcode

--hyperthyroidism resolved
--browser search
insert into codeGroups
values
('212P.', 'hyperthyroidPermEx'), --	00	Hyperthyroidism resolved

--lrti
--from codelist creator on 7/12/16 (synonyms:  "lrti",  "respiratory tract infection",  "chest infection",  "respiratory infection",  "lung infection",  "pneumonia",  "pleurisy",  "pleuritic",  "pleural effusion",  "pulmonary infection",  "pulmonary abscess",  "tuberculosis",  "tuberculous",  "bronchitis",  "bronchiolitis",  "resp tract infection",  "chest cold",  "lung consolidation",  "empyema",  "pleural abscess",  "pyopneumothorax",  "pyothorax",  "pulmonary aspergillus",  "pulmonary aspergillosis",  "pulmonary histoplas*")
('SP131', 'lrti'), --
('SP132', 'lrti'), --
('Hyu10', 'lrti'), --
('Hyu1.', 'lrti'), --
('Hyu11', 'lrti'), --
('Hyu08', 'lrti'), --
('Hyu09', 'lrti'), --
('Hyu0A', 'lrti'), --
('Hyu0B', 'lrti'), --
('Hyu0C', 'lrti'), --
('Hyu0D', 'lrti'), --
('Hyu0E', 'lrti'), --
('Hyu0F', 'lrti'), --
('Hyu0G', 'lrti'), --
('Hyu0H', 'lrti'), --
('H56y1', 'lrti'), --
('H564.', 'lrti'), --
('H5400', 'lrti'), --
('H5303', 'lrti'), --
('H50..', 'lrti'), --
('H500.', 'lrti'), --
('H50z.', 'lrti'), --
('H5000', 'lrti'), --
('H5001', 'lrti'), --
('H5002', 'lrti'), --
('H5003', 'lrti'), --
('H5004', 'lrti'), --
('H5005', 'lrti'), --
('H30..', 'lrti'), --
('H300.', 'lrti'), --
('H301.', 'lrti'), --
('H302.', 'lrti'), --
('H30z.', 'lrti'), --
('H2...', 'lrti'), --
('H20..', 'lrti'), --
('H21..', 'lrti'), --
('H22..', 'lrti'), --
('H23..', 'lrti'), --
('H24..', 'lrti'), --
('H25..', 'lrti'), --
('H26..', 'lrti'), --
('H28..', 'lrti'), --
('H2B..', 'lrti'), --
('H2C..', 'lrti'), --
('H2y..', 'lrti'), --
('H2z..', 'lrti'), --
('H200.', 'lrti'), --
('H201.', 'lrti'), --
('H202.', 'lrti'), --
('H203.', 'lrti'), --
('H20y.', 'lrti'), --
('H20z.', 'lrti'), --
('H220.', 'lrti'), --
('H221.', 'lrti'), --
('H222.', 'lrti'), --
('H223.', 'lrti'), --
('H224.', 'lrti'), --
('H22y.', 'lrti'), --
('H22z.', 'lrti'), --
('H230.', 'lrti'), --
('H231.', 'lrti'), --
('H232.', 'lrti'), --
('H233.', 'lrti'), --
('H23z.', 'lrti'), --
('H240.', 'lrti'), --
('H241.', 'lrti'), --
('H242.', 'lrti'), --
('H243.', 'lrti'), --
('H244.', 'lrti'), --
('H245.', 'lrti'), --
('H246.', 'lrti'), --
('H247.', 'lrti'), --
('H24y.', 'lrti'), --
('H24z.', 'lrti'), --
('H260.', 'lrti'), --
('H261.', 'lrti'), --
('H262.', 'lrti'), --
('H2230', 'lrti'), --
('H22y0', 'lrti'), --
('H22y1', 'lrti'), --
('H22y2', 'lrti'), --
('H22y3', 'lrti'), --
('H22yX', 'lrti'), --
('H22yz', 'lrti'), --
('H2470', 'lrti'), --
('H2471', 'lrti'), --
('H2472', 'lrti'), --
('H247z', 'lrti'), --
('H24y0', 'lrti'), --
('H24y1', 'lrti'), --
('H24y2', 'lrti'), --
('H24y3', 'lrti'), --
('H24y4', 'lrti'), --
('H24y5', 'lrti'), --
('H24y6', 'lrti'), --
('H24y7', 'lrti'), --
('H24yz', 'lrti'), --
('H2600', 'lrti'), --
('H06..', 'lrti'), --
('H060.', 'lrti'), --
('H061.', 'lrti'), --
('H062.', 'lrti'), --
('H06z.', 'lrti'), --
('H0...', 'lrti'), --
('H0600', 'lrti'), --
('H0601', 'lrti'), --
('H0602', 'lrti'), --
('H0603', 'lrti'), --
('H0604', 'lrti'), --
('H0605', 'lrti'), --
('H0606', 'lrti'), --
('H0607', 'lrti'), --
('H0608', 'lrti'), --
('H0609', 'lrti'), --
('H060A', 'lrti'), --
('H060B', 'lrti'), --
('H060C', 'lrti'), --
('H060D', 'lrti'), --
('H060E', 'lrti'), --
('H060F', 'lrti'), --
('H060v', 'lrti'), --
('H060w', 'lrti'), --
('H060x', 'lrti'), --
('H060z', 'lrti'), --
('H0610', 'lrti'), --
('H0611', 'lrti'), --
('H0612', 'lrti'), --
('H0613', 'lrti'), --
('H0614', 'lrti'), --
('H0615', 'lrti'), --
('H0616', 'lrti'), --
('H0617', 'lrti'), --
('H061z', 'lrti'), --
('H06z0', 'lrti'), --
('H06z1', 'lrti'), --
('H06z2', 'lrti'), --
('H07..', 'lrti'), --
('H0z..', 'lrti'), --
('AyuET', 'lrti'), --
('AyuEU', 'lrti'), --
('AB630', 'lrti'), --
('AB634', 'lrti'), --
('AB636', 'lrti'), --
('AB4z5', 'lrti'), --
('AB42.', 'lrti'), --
('AB415', 'lrti'), --
('AB405', 'lrti'), --
('AB406', 'lrti'), --
('AB407', 'lrti'), --
('A79A.', 'lrti'), --
('A7893', 'lrti'), --
('A730.', 'lrti'), --
('A551.', 'lrti'), --
('A54x4', 'lrti'), --A54x4	00	Herpes simplex pneumonia
('A3C03', 'lrti'), --
('A310.', 'lrti'), --
('A3100', 'lrti'), --
('A0222', 'lrti'), --
('14B2.', 'lrti'), --
('14B9.', 'lrti'), --

--lrti as per cpm paper
--from shamil - cpm author
('A3BXB', 'lrtiCpm'), --00	Klebsiella pneumoniae/cause/disease classifd/oth chapters
('A54x4', 'lrtiCpm'), --00	Herpes simplex pneumonia
('H2...', 'lrtiCpm'), --00	Pneumonia and influenza
('H22z.', 'lrtiCpm'), --00	Bacterial pneumonia NOS
('H240.', 'lrtiCpm'), --00	Pneumonia with measles
('H2472', 'lrtiCpm'), --00	Pneumonia with histoplasmosis
('H270z', 'lrtiCpm'), --00	Influenza with pneumonia NOS
('A551.', 'lrtiCpm'), --00	Postmeasles pneumonia
('AB634', 'lrtiCpm'), --00	Pulmonary aspergillus disease
('H060A', 'lrtiCpm'), --00	Acute bronchitis due to mycoplasma pneumoniae
('H06z2', 'lrtiCpm'), --00	Recurrent chest infection
('H20..', 'lrtiCpm'), --00	Viral pneumonia
('H200.', 'lrtiCpm'), --00	Pneumonia due to adenovirus
('H201.', 'lrtiCpm'), --00	Pneumonia due to respiratory syncytial virus
('H20z.', 'lrtiCpm'), --00	Viral pneumonia NOS
('H21..', 'lrtiCpm'), --00	Lobar (pneumococcal) pneumonia
('H222.', 'lrtiCpm'), --11	Pneumonia due to haemophilus influenzae
('H223.', 'lrtiCpm'), --00	Pneumonia due to streptococcus
('H243.', 'lrtiCpm'), --11	Pneumonia with pertussis
('H246.', 'lrtiCpm'), --00	Pneumonia with aspergillosis
('H24y7', 'lrtiCpm'), --00	Pneumonia with varicella
('H25..', 'lrtiCpm'), --11	Chest infection - unspecified bronchopneumonia
('H5401', 'lrtiCpm'), --00	Hypostatic bronchopneumonia
('Hyu0B', 'lrtiCpm'), --00	[X]Pneumonia due to other specified infectious organisms
('A7893', 'lrtiCpm'), --00	HIV disease resulting in Pneumocystis carinii pneumonia
('AB415', 'lrtiCpm'), --00	Histoplasma duboisii with pneumonia
('H06z1', 'lrtiCpm'), --12	Acute lower respiratory tract infection
('H202.', 'lrtiCpm'), --00	Pneumonia due to parainfluenza virus
('H224.', 'lrtiCpm'), --00	Pneumonia due to staphylococcus
('H24y5', 'lrtiCpm'), --00	Pneumonia with toxoplasmosis
('H24yz', 'lrtiCpm'), --00	Pneumonia with other infectious diseases EC NOS
('Hyu08', 'lrtiCpm'), --00	[X]Other viral pneumonia
('Hyu0D', 'lrtiCpm'), --00	[X]Pneumonia in viral diseases classified elsewhere
('A0222', 'lrtiCpm'), --00	Salmonella pneumonia
('A116.', 'lrtiCpm'), --00	Tuberculous pneumonia
('A3803', 'lrtiCpm'), --00	Septicaemia due to streptococcus pneumoniae
('A3By4', 'lrtiCpm'), --00	Pleuropneumonia-like organism (PPLO) infection
('H07..', 'lrtiCpm'), --00	Chest cold
('H222.', 'lrtiCpm'), --00	Pneumonia due to haemophilus influenzae
('H230.', 'lrtiCpm'), --00	Pneumonia due to Eaton's agent
('H232.', 'lrtiCpm'), --00	Pneumonia due to pleuropneumonia like organisms
('H24..', 'lrtiCpm'), --11	Chest infection with infectious disease EC
('H243.', 'lrtiCpm'), --00	Pneumonia with whooping cough
('H270.', 'lrtiCpm'), --00	Influenza with pneumonia
('H2700', 'lrtiCpm'), --00	Influenza with bronchopneumonia
('H56y1', 'lrtiCpm'), --00	Interstitial pneumonia
('Q3106', 'lrtiCpm'), --00	Congenital pneumonia due to Chlamydia
('A7850', 'lrtiCpm'), --00	Cytomegaloviral pneumonitis
('AB4z5', 'lrtiCpm'), --00	Histoplasmosis with pneumonia
('H062.', 'lrtiCpm'), --00	Acute lower respiratory tract infection
('H21..', 'lrtiCpm'), --11	Chest infection - pneumococcal pneumonia
('H22y.', 'lrtiCpm'), --00	Pneumonia due to other specified bacteria
('H22y0', 'lrtiCpm'), --00	Pneumonia due to escherichia coli
('H24..', 'lrtiCpm'), --00	Pneumonia with infectious diseases EC
('H25..', 'lrtiCpm'), --00	Bronchopneumonia due to unspecified organism
('H2z..', 'lrtiCpm'), --00	Pneumonia or influenza NOS
('H4702', 'lrtiCpm'), --00	Pneumonitis due to inhalation of milk
('A730.', 'lrtiCpm'), --00	Ornithosis with pneumonia
('AB24.', 'lrtiCpm'), --11	Pneumonia - candidal
('AB405', 'lrtiCpm'), --00	Histoplasma capsulatum with pneumonia
('AyuKA', 'lrtiCpm'), --00	[X]Klebsiella pneumoniae/cause/disease classifd/oth chapters
('F00y4', 'lrtiCpm'), --00	Meningitis due to klebsiella pneumoniae
('H23..', 'lrtiCpm'), --11	Chest infection - pneumonia organism OS
('H2470', 'lrtiCpm'), --00	Pneumonia with candidiasis
('H2471', 'lrtiCpm'), --00	Pneumonia with coccidioidomycosis
('H24y2', 'lrtiCpm'), --00	Pneumonia with pneumocystis carinii
('H24y4', 'lrtiCpm'), --00	Pneumonia with salmonellosis
('H24z.', 'lrtiCpm'), --00	Pneumonia with infectious diseases EC NOS
('H26..', 'lrtiCpm'), --00	Pneumonia due to unspecified organism
('H261.', 'lrtiCpm'), --00	Basal pneumonia due to unspecified organism
('H2y..', 'lrtiCpm'), --00	Other specified pneumonia or influenza
('H3y0.', 'lrtiCpm'), --00	Chronic obstruct pulmonary dis with acute lower resp infectn
('H4703', 'lrtiCpm'), --12	Aspiration pneumonia due to vomit
('H5303', 'lrtiCpm'), --00	Abscess of lung with pneumonia
('Hyu09', 'lrtiCpm'), --00	[X]Pneumonia due to other aerobic gram-negative bacteria
('H06z1', 'lrtiCpm'), --00	Lower resp tract infection
('H20..', 'lrtiCpm'), --11	Chest infection - viral pneumonia
('H231.', 'lrtiCpm'), --00	Pneumonia due to mycoplasma pneumoniae
('H47..', 'lrtiCpm'), --11	Aspiration pneumonitis
('Hyu0A', 'lrtiCpm'), --00	[X]Other bacterial pneumonia
('Hyu0F', 'lrtiCpm'), --00	[X]Pneumonia in parasitic diseases classified elsewhere
('SP132', 'lrtiCpm'), --00	Post operative chest infection
('AD63.', 'lrtiCpm'), --00	Pneumocystosis
('AyuK9', 'lrtiCpm'), --00	[X]Mycoplasma pneumoniae [PPLO]cause/dis classifd/oth chaptr
('H22..', 'lrtiCpm'), --11	Chest infection - other bacterial pneumonia
('H220.', 'lrtiCpm'), --00	Pneumonia due to klebsiella pneumoniae
('H221.', 'lrtiCpm'), --00	Pneumonia due to pseudomonas
('H23..', 'lrtiCpm'), --00	Pneumonia due to other specified organisms
('H23z.', 'lrtiCpm'), --00	Pneumonia due to specified organism NOS
('H24y0', 'lrtiCpm'), --00	Pneumonia with actinomycosis
('H24y1', 'lrtiCpm'), --00	Pneumonia with nocardiasis
('Hyu0C', 'lrtiCpm'), --00	[X]Pneumonia in bacterial diseases classified elsewhere
('Q3105', 'lrtiCpm'), --00	Congenital pneumonia due to viral agent
('14B2.', 'lrtiCpm'), --00	H/O: pneumonia
('H06z0', 'lrtiCpm'), --11	Chest infection
('H20y.', 'lrtiCpm'), --00	Viral pneumonia NEC
('H2230', 'lrtiCpm'), --00	Pneumonia due to streptococcus, group B
('H22y1', 'lrtiCpm'), --00	Pneumonia due to proteus
('H247z', 'lrtiCpm'), --00	Pneumonia with systemic mycosis NOS
('H24y.', 'lrtiCpm'), --00	Pneumonia with other infectious diseases EC
('H24y3', 'lrtiCpm'), --00	Pneumonia with Q-fever
('H30..', 'lrtiCpm'), --11	Chest infection - unspecified bronchitis
('Hyu0E', 'lrtiCpm'), --00	[X]Pneumonia in mycoses classified elsewhere
('Hyu0G', 'lrtiCpm'), --00	[X]Pneumonia in other diseases classified elsewhere
('A221.', 'lrtiCpm'), --00	Pulmonary anthrax
('A521.', 'lrtiCpm'), --00	Varicella pneumonitis
('H22y2', 'lrtiCpm'), --00	Pneumonia - Legionella
('H233.', 'lrtiCpm'), --00	Chlamydial pneumonia
('H241.', 'lrtiCpm'), --00	Pneumonia with cytomegalic inclusion disease
('H242.', 'lrtiCpm'), --00	Pneumonia with ornithosis
('H26..', 'lrtiCpm'), --11	Chest infection - pnemonia due to unspecified organism
('H270.', 'lrtiCpm'), --11	Chest infection - influenza with pneumonia
('H2701', 'lrtiCpm'), --00	Influenza with pneumonia, influenza virus identified
('H5400', 'lrtiCpm'), --00	Hypostatic pneumonia
('H571.', 'lrtiCpm'), --00	Rheumatic pneumonia
('Hyu0H', 'lrtiCpm'), --00	[X]Other pneumonia, organism unspecified
('SP131', 'lrtiCpm'), --00	Other aspiration pneumonia as a complication of care
('A3BXA', 'lrtiCpm'), --00	Mycoplasma pneumoniae [PPLO] cause/dis classifd/oth chaptr
('A73x.', 'lrtiCpm'), --00	Ornithosis with other specified complications
('H06z0', 'lrtiCpm'), --00	Chest infection NOS
('H22..', 'lrtiCpm'), --00	Other bacterial pneumonia
('H22y0', 'lrtiCpm'), --11	E.coli pneumonia
('H22yX', 'lrtiCpm'), --00	Pneumonia due to other aerobic gram-negative bacteria
('H22yz', 'lrtiCpm'), --00	Pneumonia due to bacteria NOS
('H244.', 'lrtiCpm'), --00	Pneumonia with tularaemia
('H247.', 'lrtiCpm'), --00	Pneumonia with other systemic mycoses
('H24y6', 'lrtiCpm'), --00	Pneumonia with typhoid fever
('H260.', 'lrtiCpm'), --00	Lobar pneumonia due to unspecified organism
('H28..', 'lrtiCpm'), --00	Atypical pneumonia
('H470.', 'lrtiCpm'), --00	Pneumonitis due to inhalation of food or vomitus
('H5302', 'lrtiCpm'), --00	Gangrenous pneumonia
('Q310.', 'lrtiCpm'), --00	Congenital pneumonia
('H262.', 'lrtiCpm'), --00	Postoperative pneumonia
('43n1.', 'lrtiCpm'), --00	Mycoplasma pneumoniae antibody level
('43eG.', 'lrtiCpm'), --00	Chlamydia pneumoniae IgG level
('4JRC.', 'lrtiCpm'), --00	Atypical pneumonia screening test
('43n7.', 'lrtiCpm'), --00	Chlamydia pneumoniae IgA level
('43eH.', 'lrtiCpm'), --00	Chlamydia pneumoniae IgM level
('H564.', 'lrtiCpm'), --00	Bronchiolitis obliterans organising pneumonia

--wheeze
--from codelist creator on 29/112/16 Read v2 April 2016 (synonyms: "wheez*"
('17370', 'wheeze'), --
('17371', 'wheeze'), --
('R0609', 'wheeze'), --
('R060E', 'wheeze'), --
('R060F', 'wheeze'), --
('R060G', 'wheeze'), --
('R060H', 'wheeze'), --
('H302.', 'wheeze'), --
('6635.', 'wheeze'), --
('2326.', 'wheeze'), --
('232H.', 'wheeze'), --
('1737.', 'wheeze'), --
('173B.', 'wheeze'), --
('173e.', 'wheeze'), --

--lrti as per cpm paper
--from shamil - cpm author
('H3120', 'wheezeCpm'), --11	Chronic wheezy bronchitis
('1737.', 'wheezeCpm'), --11	Wheezing symptom
('2326.', 'wheezeCpm'), --	O/E - expiratory wheeze
('6635.', 'wheezeCpm'), --	00	Increasing exercise wheeze	
('173B.', 'wheezeCpm'), --00	Nocturnal cough / wheeze
('H060.', 'wheezeCpm'), --11	Acute wheezy bronchitis
('17370', 'wheezeCpm'), --	Wheezing
('R0609', 'wheezeCpm'), --00	[D]Wheezing
('H30..', 'wheezeCpm'), --12	Recurrent wheezy bronchitis 
('H302.', 'wheezeCpm'), --00	Wheezy bronchitis
('173e.', 'wheezeCpm'), --11	Viral induced wheeze
('173e.', 'wheezeCpm'); --00	Viral wheeze

--myocardial infarction - contemporary code i.e. it's happened now / happening rather than "history of.."
--from codelist creator on 26/10/16 Read v2 April 2016 (synonyms: "myocardial infarction", "heart attack", "stemi", "nstemi", "infarct"
insert into codeGroups
values
('Gyu34', 'MInow'),
('Gyu35', 'MInow'),
('Gyu36', 'MInow'),
('G30..', 'MInow'),
('G300.', 'MInow'),
('G301.', 'MInow'),
('G302.', 'MInow'),
('G303.', 'MInow'),
('G304.', 'MInow'),
('G305.', 'MInow'),
('G306.', 'MInow'),
('G307.', 'MInow'),
('G308.', 'MInow'),
('G309.', 'MInow'),
('G30B.', 'MInow'),
('G30X.', 'MInow'),
('G30y.', 'MInow'),
('G30z.', 'MInow'),
('G3010', 'MInow'),
('G3011', 'MInow'),
('G301z', 'MInow'),
('G3070', 'MInow'),
('G3071', 'MInow'),
('G30X0', 'MInow'),
('G30y0', 'MInow'),
('G30y1', 'MInow'),
('G30y2', 'MInow'),
('G30yz', 'MInow'),
('G35..', 'MInow'),
('G38..', 'MInow'),
('G350.', 'MInow'),
('G351.', 'MInow'),
('G353.', 'MInow'),
('G35X.', 'MInow'),
('G380.', 'MInow'),
('G381.', 'MInow'),
('G382.', 'MInow'),
('G383.', 'MInow'),
('G384.', 'MInow'),
('G38z.', 'MInow'),
('323..', 'MInow'),
('3233.', 'MInow'),
('3234.', 'MInow'),
('3235.', 'MInow'),
('3236.', 'MInow'),
('323Z.', 'MInow'),

--myocardial infarction - code from anytime --TBA

--unstable angina
----from codelist creator on 26/01/17 Read v2 April 2016 (synonyms: "angina"
('G331.', 'unstableAngina'), --
('G3111', 'unstableAngina'), --
('G3112', 'unstableAngina'), --
('G3113', 'unstableAngina'), --
('G3114', 'unstableAngina'), --
('662K1', 'unstableAngina'), --
('662K3', 'unstableAngina'), --

--oedemea
----from codelist creator on 29/01/17 Read v2 April 2016 (synonyms: "oedema", "edema"
('R023.', 'oedema'), --
('R0230', 'oedema'), --
('R0231', 'oedema'), --
('R0232', 'oedema'), --
('R0233', 'oedema'), --
('R0234', 'oedema'), --
('R023z', 'oedema'), --
('PH0..', 'oedema'), --
('PH00.', 'oedema'), --
('PH01.', 'oedema'), --
('PH02.', 'oedema'), --
('PH03.', 'oedema'), --
('PH0z.', 'oedema'), --
('K57y1', 'oedema'), --
('K289.', 'oedema'), --
('K27y0', 'oedema'), --
('H584.', 'oedema'), --
('H5840', 'oedema'), --
('H584z', 'oedema'), --
('H5410', 'oedema'), --
('H541z', 'oedema'), --
('C366.', 'oedema'), --
('C3661', 'oedema'), --
('C3662', 'oedema'), --
('C366z', 'oedema'), --
('8E95.', 'oedema'), --
('23E1.', 'oedema'), --
('22C..', 'oedema'), --
('22C2.', 'oedema'), --
('22C3.', 'oedema'), --
('22C4.', 'oedema'), --
('22C5.', 'oedema'), --
('22C6.', 'oedema'), --
('22C7.', 'oedema'), --
('22C8.', 'oedema'), --
('22C9.', 'oedema'), --
('22CA.', 'oedema'), --
('22CZ.', 'oedema'), --
('22C40', 'oedema'), --
('183..', 'oedema'), --
('1832.', 'oedema'), --
('1833.', 'oedema'), --
('1837.', 'oedema'), --
('1838.', 'oedema'), --
('1839.', 'oedema'), --
('183A.', 'oedema'), --
('183B.', 'oedema'), --
('183C.', 'oedema'), --
('183Z.', 'oedema'), --

--oedema resolved
----from browser search
('22C1.', 'oedemaPermEx'), --	00	O/E - oedema not present
('1831.', 'oedemaPermEx') --	00	No oedema present

insert into codeGroups
values
--palliative care
--from codelist creator on 11/8/16: "synonyms": ["palliative","palliation","terminal","end of life","gold standards","macmillan","last days","liverpool care pathway","advance care planning","anticipatory care plan","ds1500","cancer care plan","anticipated death"]
 	('ZV57C', 'pal'), --Palliative care ruleset_v34.0
 	('ZV57C00', 'pal'), --from SIR searches
	('9m0C.', 'pal'),
	('9e02.', 'pal'),
	('9e00.', 'pal'),
	('9e01.', 'pal'),
	('9c0M.', 'pal'), --Palliative care ruleset_v34.0
	('9c0N.', 'pal'), --Palliative care ruleset_v34.0
	('9c0P.', 'pal'), --Palliative care ruleset_v34.0
	('9c0L0', 'pal'), --Palliative care ruleset_v34.0
	('9b9B.', 'pal'),
	('9Nu6.', 'pal'),
	('9Nu7.', 'pal'),
	('9Nu8.', 'pal'),
	('9Nu9.', 'pal'),
	('9Nu90', 'pal'),
	('9NlJ.', 'pal'),
	('9Nh0.', 'pal'),
	('9Ng7.', 'pal'), --Palliative care ruleset_v34.0
	('9NgD.', 'pal'), --Palliative care ruleset_v34.0
	('9NgT.', 'pal'),
	('9NNf0', 'pal'), --Palliative care ruleset_v34.0
	('9NNS.', 'pal'),
	('9NNZ.', 'pal'),
	('9NNa.', 'pal'),
	('9NNb.', 'pal'),
	('9NNd.', 'pal'), --Palliative care ruleset_v34.0
	('9NNq.', 'pal'),
	('9NNr.', 'pal'),
	('9NNs.', 'pal'),
	('9K9..', 'pal'), --Palliative care ruleset_v34.0
	('9KA..', 'pal'),
	('9G8..', 'pal'), --Palliative care ruleset_v34.0
	('9EB5.', 'pal'), --Palliative care ruleset_v34.0
	('9367.', 'pal'), --Palliative care ruleset_v34.0
	('8IEE.', 'pal'), --Palliative care ruleset_v34.0
	('8HH6.', 'pal'),
	('8HH7.', 'pal'), --Palliative care ruleset_v34.0
	('8H7L.', 'pal'), --Palliative care ruleset_v34.0
	('8H7g.', 'pal'), --Palliative care ruleset_v34.0
	('8H7J0', 'pal'),
	('8H770', 'pal'),
	('8H761', 'pal'),
	('8H6A.', 'pal'), --Palliative care ruleset_v34.0
	('8Cc4.', 'pal'),
	('8CMW3', 'pal'), --Palliative care ruleset_v34.0
	('8CMW300', 'pal'), --from SIR searches
	('8CMG7', 'pal'),
	('8CMG5', 'pal'),
	('8CM1.', 'pal'), --Palliative care ruleset_v34.0
	('8CM10', 'pal'), --Palliative care ruleset_v34.0
	('8CM1000', 'pal'), --from SIR searches
	('8CM11', 'pal'), --Palliative care ruleset_v34.0
	('8CM1100', 'pal'), --from SIR searches
	('8CM12', 'pal'), --Palliative care ruleset_v34.0
	('8CM13', 'pal'), --Palliative care ruleset_v34.0
	('8CM1300', 'pal'), --from SIR searches
	('8CM14', 'pal'), --Palliative care ruleset_v34.0
	('8CM1400', 'pal'), --from SIR searches
	('8CM16', 'pal'), --Palliative care ruleset_v34.0
	('8CM17', 'pal'), --Palliative care ruleset_v34.0
	('8CM18', 'pal'), --Palliative care ruleset_v34.0
	('8CM3.', 'pal'),
	('8CME', 'pal'), --Palliative care ruleset_v34.0
	('8CML', 'pal'),
	('8CMb.', 'pal'), --Palliative care ruleset_v34.0
	('8CMg.', 'pal'), --Palliative care ruleset_v34.0
	('8CMj.', 'pal'),
	('8CMk.', 'pal'),
	('8CM4.', 'pal'), --Palliative care ruleset_v34.0
	('8CMM.', 'pal'),
	('8CMQ.', 'pal'), --Palliative care ruleset_v34.0
	('8CMe.', 'pal'),
	('8BMM.', 'pal'),
	('8BJ1.', 'pal'), --Palliative care ruleset_v34.0
	('8BA2.', 'pal'), --Palliative care ruleset_v34.0
	('8B2a.', 'pal'), --Palliative care ruleset_v34.0
	('8BAN.', 'pal'),
	('8BAP.', 'pal'), --Palliative care ruleset_v34.0
	('8BAR.', 'pal'),
	('8BAS.', 'pal'), --Palliative care ruleset_v34.0
	('8BAT.', 'pal'), --Palliative care ruleset_v34.0
	('8BAe.', 'pal'), --Palliative care ruleset_v34.0
	('67Q..', 'pal'),
	('67Q0.', 'pal'),
	('5149.', 'pal'),
	('38VY.', 'pal'),
	('38Vb.', 'pal'),
	('38Vd.', 'pal'),
	('38Ve.', 'pal'),
	('38Vf.', 'pal'),
	('38Vg.', 'pal'),
	('38Vh.', 'pal'),
	('38Vi.', 'pal'),
	('38QH.', 'pal'), --Palliative care ruleset_v34.0
	('38QK.', 'pal'), --Palliative care ruleset_v34.0
	('38Qd.', 'pal'),
	('38GN.', 'pal'),
	('2JE..', 'pal'), --Palliative care ruleset_v34.0
	('2Jf..', 'pal'), --Palliative care ruleset_v34.0
	('2Jg..', 'pal'), --Palliative care ruleset_v34.0
	('1Z0..', 'pal'),
	('1Z00.', 'pal'),
	('1Z01.', 'pal'), --Palliative care ruleset_v34.0
--hospice codes from codelist creator 22/10/16 using April 2016 Rv2 dictionary: sysnonym: "hospice"
	('M2703', 'pal'),
	('9b74.', 'pal'),
	('9b740', 'pal'),
	('9b1B.', 'pal'),
	('9b1C.', 'pal'),
	('9NkJ.', 'pal'),
	('8HX..', 'pal'),
	('8HX0.', 'pal'),
	('8HX1.', 'pal'),
	('8HX2.', 'pal'),
	('8HY..', 'pal'),
	('66S3.', 'pal'),
	('66S4.', 'pal'),

--pacemaker and defib
--from codelist creator on 27/10/16 using April 2016 Read v2 dictionary. synonyms: ["pacemaker","pace maker","defib*"]
('79360', 'pacemakerDefib'),
('79361', 'pacemakerDefib'),
('79362', 'pacemakerDefib'),
('79363', 'pacemakerDefib'),
('79364', 'pacemakerDefib'),
('79365', 'pacemakerDefib'),
('79366', 'pacemakerDefib'),
('79367', 'pacemakerDefib'),
('79368', 'pacemakerDefib'),
('79369', 'pacemakerDefib'),
('79370', 'pacemakerDefib'),
('79371', 'pacemakerDefib'),
('79372', 'pacemakerDefib'),
('79373', 'pacemakerDefib'),
('79375', 'pacemakerDefib'),
('79377', 'pacemakerDefib'),
('79378', 'pacemakerDefib'),
('79379', 'pacemakerDefib'),
('ZV533', 'pacemakerDefib'),
('ZV450', 'pacemakerDefib'),
('ZV45M', 'pacemakerDefib'),
('TB010', 'pacemakerDefib'),
('SP001', 'pacemakerDefib'),
('G56y6', 'pacemakerDefib'),
('9N2b.', 'pacemakerDefib'),
('8HRF.', 'pacemakerDefib'),
('88AA.', 'pacemakerDefib'),
('7P19.', 'pacemakerDefib'),
('7P190', 'pacemakerDefib'),
('7P19y', 'pacemakerDefib'),
('7P19z', 'pacemakerDefib'),
('7P1D.', 'pacemakerDefib'),
('2JS..', 'pacemakerDefib'),
('14V1.', 'pacemakerDefib'),
('7936.', 'pacemakerDefib'),
('7936A', 'pacemakerDefib'),
('7936B', 'pacemakerDefib'),
('7936C', 'pacemakerDefib'),
('7936D', 'pacemakerDefib'),
('7936E', 'pacemakerDefib'),
('7936F', 'pacemakerDefib'),
('7936G', 'pacemakerDefib'),
('7936H', 'pacemakerDefib'),
('7936J', 'pacemakerDefib'),
('7936K', 'pacemakerDefib'),
('7936y', 'pacemakerDefib'),
('7936z', 'pacemakerDefib'),
('7937.', 'pacemakerDefib'),
('793F.', 'pacemakerDefib'),
('793P.', 'pacemakerDefib'),
('7937y', 'pacemakerDefib'),
('7937z', 'pacemakerDefib'),
('793F0', 'pacemakerDefib'),
('793F1', 'pacemakerDefib'),
('793F2', 'pacemakerDefib'),
('793F3', 'pacemakerDefib'),
('793F4', 'pacemakerDefib'),
('793F5', 'pacemakerDefib'),
('793Fy', 'pacemakerDefib'),
('793Fz', 'pacemakerDefib'),
('793P0', 'pacemakerDefib'),
('793P1', 'pacemakerDefib'),
('793P2', 'pacemakerDefib'),
('793P3', 'pacemakerDefib'),
('793Py', 'pacemakerDefib'),
('793Pz', 'pacemakerDefib'),

--palliative care permanent exclusion codes
--from codelist creator on 11/8/16 using April 2016 Read v2 dictionary
	('9hB..', 'palPermEx'),
	('9hB0.', 'palPermEx'),
	('9hB1.', 'palPermEx'),
	('9NgzS', 'palPermEx'),
	('9Ngn.', 'palPermEx'),
	('8IBE.', 'palPermEx'),
	('8HgW.', 'palPermEx'),
	('8HgX.', 'palPermEx'),
	
--phaeo
--from codelist creator on 27/10/16 using Read v2 April 2016 dictionary "synonyms": ["Pheochromocytoma","phaeochromocytoma","pcc","pheo","phaeo"
('BBD9.', 'phaeo'),
('BBDA.', 'phaeo'),
('B7H00', 'phaeo'),
	
--porphyria
--from codelist creator on 26/10/16 using Read v2 April 2016 dictionary "synonyms": "porphyria"
('F3748', 'porphyria'),
('Cyu8H', 'porphyria'),
('C3710', 'porphyria'),
('C3712', 'porphyria'),
('C3714', 'porphyria'),
('C371z', 'porphyria'),
('C3711', 'porphyria'),
('C3713', 'porphyria'),
('C3715', 'porphyria'),

--postural hypotension
--from codelist creator on 26/10/16 using Read v2 April 2016 dictionary ["postural","orthostatic","hypotension"]
('G870.', 'posturalHypo'),
('F1303', 'posturalHypo'),
('2468.', 'posturalHypo'),


--potassium
--from manual search of one GP practice records
('44h0.', 'potassium'),
('44h8.', 'potassium'),
('44I4.', 'potassium'),
('44I4100', 'potassium'),

--pulse rate
--from manual search of one GP practice
('242..', 'pulseRate'),

--pulmonary rehab offered - uncoded
--from codelist creator 20/12/16 (synonyms: "pulmonary rehabilitation") 
('8I97.', 'pulRehabUncoded'),
('8I86.', 'pulRehabUncoded'),
('8H7u.', 'pulRehabUncoded'),
('8FA..', 'pulRehabUncoded'),
('8FA0.', 'pulRehabUncoded'),
('8FA1.', 'pulRehabUncoded'),
('8FA2.', 'pulRehabUncoded'),

--registration: patient registration at a practice
--from codelist creator 13/7/16 (synonyms: "registration", "register", "new patient", "enroll", "new reg") 
('9OW..', 'registered'), --
('9OW1.', 'registered'), --
('9OW3.', 'registered'), --
('9OWZ.', 'registered'), --
('9N79.', 'registered'), --
('988..', 'registered'), --
('9881.', 'registered'), --
('9882.', 'registered'), --
('9883.', 'registered'), --
('988Z.', 'registered'), --

--sick sinus
--from codelist creator on 26/10/16 Read v2 April 2016 (synonyms: "block", "mobitz", "av block", "atrioventricular block", "wenckebach"
('G57y3', 'sickSinus'),

--sodium
--from manual search of one GP practice records
('44I5.', 'sodium'),
('44h6.', 'sodium'),
('44h1.', 'sodium');

					----------------------------------------------
							-----------SMOKING------------
					----------------------------------------------


--smoking cessation drugs
--from browser search
insert into codeGroups
select readcode, 'smokingCessationDrugs' from SIR_ReadCode_Rubric
where readcode like 'du3%'	--	nicotine
or readcode like 'du7%'	--	nicotine
or readcode like 'duB%' --	nicotine
or readcode like 'du6%' --	bupropion
or readcode like 'du8%' --	varenicline
group by readcode


insert into codeGroups
values
--smoking cessation advice
--from 'smoker current' below
('67A3.', 'smokerAdvice'), --	00	Pregnancy smoking advice
('8CAL.', 'smokerAdvice'), --	00	Smoking cessation advice
('67H6.', 'smokerAdvice'), --	00	Brief intervention for smoking cessation
('67H1.', 'smokerAdvice'), --	00	Lifestyle advice regarding smoking
('8CAg.', 'smokerAdvice'), --	00	Smoking cessation advice provided by community pharmacist
('ZV6D8', 'smokerAdvice'), --	00	[V]Tobacco abuse counselling

--smoking cessation advice refused
--from 'smoker current' below
('8IAj.', 'smokerAdviceDecline'), -- 8IAj.	00	Smoking cessation advice declined
('9hG0.', 'smokerAdviceDecline'), -- 9hG0.	00	Excepted from smoking quality indicators: Patient unsuitable
('9hG..', 'smokerAdviceDecline'), -- 9hG..	00	Exception reporting: smoking quality indicators
('9hG1.', 'smokerAdviceDecline'), -- 9hG1.	00	Excepted from smoking quality indicators: Informed dissent
('137d.', 'smokerAdviceDecline'), -- 137d.	00	Not interested in stopping smoking

--smoking cessation referral
--from 'smoker current' below
('9NS02', 'smokCessRefer'), --	00	Referral for smoking cessation service offered
('9OO4.', 'smokCessRefer'), --	00	Stop smoking monitor 1st lettr
('9OO5.', 'smokCessRefer'), --	00	Stop smoking monitor 2nd lettr
('9OO6.', 'smokCessRefer'), --	00	Stop smoking monitor 3rd lettr
('9OO7.', 'smokCessRefer'), --	00	Stop smoking monitor verb.inv.
('9OO8.', 'smokCessRefer'), --	00	Stop smoking monitor phone inv
('9OOB.', 'smokCessRefer'), --	00	Stop smoking invitation short message service text message
('9OOB0', 'smokCessRefer'), --	00	Stop smoking invitation first short message service text message
('9OOB1', 'smokCessRefer'), --	00	Stop smoking invitation second short message service text message
('9OOB2', 'smokCessRefer'), --	00	Stop smoking invitation third short message service text message
('8T08.', 'smokCessRefer'), --	00	Referral to smoking cessation service
('8HkQ.', 'smokCessRefer'), --	00	Referral to NHS stop smoking service
('8HTK.', 'smokCessRefer'), --	00	Referral to stop-smoking clinic


--smoking cessation treatment
--from 'smoker current' below
('9NdV.', 'smokCessRx'), --	00	Consent given for follow-up evaluation after smoking cessation intervention
('9NdY.', 'smokCessRx'), --	00	Declined consent for follow-up evaluation after smoking cessation intervention
('9Ndf.', 'smokCessRx'), --	00	Consent given for follow-up by smoking cessation team
('9NdZ.', 'smokCessRx'), --	00	Declined consent for smoking cessation data sharing
('9OO..', 'smokCessRx'), --	12	Stop smoking monitoring admin.
('9OO1.', 'smokCessRx'), --	00	Attends stop smoking monitor.
('9OO3.', 'smokCessRx'), --	00	Stop smoking monitor default
('9OOA.', 'smokCessRx'), --	00	Stop smoking monitor.chck done
('9OOZ.', 'smokCessRx'), --	00	Stop smoking monitor admin.NOS
('745H.', 'smokCessRx'), --	00	Smoking cessation therapy
('745H0', 'smokCessRx'), --	00	Nicotine replacement therapy using nicotine patches
('745H1', 'smokCessRx'), --	00	Nicotine replacement therapy using nicotine gum
('745H2', 'smokCessRx'), --	00	Nicotine replacement therapy using nicotine inhalator
('745H3', 'smokCessRx'), --	00	Nicotine replacement therapy using nicotine lozenges
('745H4', 'smokCessRx'), --	00	Smoking cessation drug therapy
('745H5', 'smokCessRx'), --	00	Varenicline therapy
('745Hy', 'smokCessRx'), --	00	Other specified smoking cessation therapy
('745Hz', 'smokCessRx'), --	00	Smoking cessation therapy NOS
('9N2k.', 'smokCessRx'), --	00	Seen by smoking cessation advisor
('9kc0.', 'smokCessRx'), -- 9kc..	00	Smoking cessation - enhanced services administration
('9kc..', 'smokCessRx'), -- 9kc0.	00	Smoking cessation monitoring template completed - enhanced services administration
('9kf1.', 'smokCessRx'), --9kf1.	00	Referred for chronic obstructive pulmonary disease structured smoking assessment - enhanced services administration
('8H7i.', 'smokCessRx'), -- 8H7i.	00	Referral to smoking cessation advisor
('8CdB.', 'smokCessRx'), -- 8CdB.	00	Stop smoking service opportunity signposted
('8B31G', 'smokCessRx'), -- 8B31G	00	Varenicline smoking cessation therapy offered
('13p8.', 'smokCessRx'), -- 13p8.	00	Lost to smoking cessation follow-up
('13p0.', 'smokCessRx'), --13p0.	00	Negotiated date for cessation of smoking
('13p50', 'smokCessRx'), -- 13p50	00	Practice based smoking cessation programme start date
('13p5.', 'smokCessRx'), -- 13p5.	00	Smoking cessation programme start date

--smoking cessation Rx refused
--from 'smoker current' below
('9Ndg.', 'smokCessRxDecline'), --	00	Declined consent for follow-up by smoking cessation team
('8IEo.', 'smokCessRxDecline'), --	00	Referral to smoking cessation service declined
('9N4M.', 'smokCessRxDecline'), --	00	DNA - Did not attend smoking cessation clinic
('9OO2.', 'smokCessRxDecline'), --	00	Refuses stop smoking monitor
('8IEM.', 'smokCessRxDecline'), -- 8IEM.	00	Smoking cessation drug therapy declined
('8IEM0', 'smokCessRxDecline'), -- 8IEM0	00	Varenicline smoking cessation therapy declined
('8IEK.', 'smokCessRxDecline'), -- 8IEK.	00	Smoking cessation programme declined
('9hG0.', 'smokCessRxDecline'), -- 9hG0.	00	Excepted from smoking quality indicators: Patient unsuitable
('9hG..', 'smokCessRxDecline'), -- 9hG..	00	Exception reporting: smoking quality indicators
('9hG1.', 'smokCessRxDecline'), -- 9hG1.	00	Excepted from smoking quality indicators: Informed dissent
('137d.', 'smokCessRxDecline'), -- 137d.	00	Not interested in stopping smoking
('9kf2.', 'smokCessRxDecline'), --9kf2.	00	Chronic obstructive pulmonary disease structured smoking assessment declined - enhanced services administration

--smoker: current
--from codelist creator 7/12/16 (synonyms:     "smok",   "cigar",   "pipe",   "tobac") 
--plus manual searches
--('9NdV.', 'currentSmoker'), --	00	Consent given for follow-up evaluation after smoking cessation intervention
--('9NdY.', 'currentSmoker'), --	00	Declined consent for follow-up evaluation after smoking cessation intervention
--('9Ndg.', 'currentSmoker'), --	00	Declined consent for follow-up by smoking cessation team
--('9Ndf.', 'currentSmoker'), --	00	Consent given for follow-up by smoking cessation team
--('9NdZ.', 'currentSmoker'), --	00	Declined consent for smoking cessation data sharing
--('8IEo.', 'currentSmoker'), --	00	Referral to smoking cessation service declined
--('9NS02', 'currentSmoker'), --	00	Referral for smoking cessation service offered
--('9N4M.', 'currentSmoker'), --	00	DNA - Did not attend smoking cessation clinic
--('9OO..', 'currentSmoker'), --	12	Stop smoking monitoring admin.
--('9OO1.', 'currentSmoker'), --	00	Attends stop smoking monitor.
--('9OO2.', 'currentSmoker'), --	00	Refuses stop smoking monitor
--('9OO3.', 'currentSmoker'), --	00	Stop smoking monitor default
--('9OO4.', 'currentSmoker'), --	00	Stop smoking monitor 1st lettr
--('9OO5.', 'currentSmoker'), --	00	Stop smoking monitor 2nd lettr
--('9OO6.', 'currentSmoker'), --	00	Stop smoking monitor 3rd lettr
--('9OO7.', 'currentSmoker'), --	00	Stop smoking monitor verb.inv.
--('9OO8.', 'currentSmoker'), --	00	Stop smoking monitor phone inv
--('9OO9.', 'currentSmoker'), --	00	Stop smoking monitoring delete
--('9OOA.', 'currentSmoker'), --	00	Stop smoking monitor.chck done
--('9OOB.', 'currentSmoker'), --	00	Stop smoking invitation short message service text message
--('9OOB0', 'currentSmoker'), --	00	Stop smoking invitation first short message service text message
--('9OOB1', 'currentSmoker'), --	00	Stop smoking invitation second short message service text message
--('9OOB2', 'currentSmoker'), --	00	Stop smoking invitation third short message service text message
--('9OOZ.', 'currentSmoker'), --	00	Stop smoking monitor admin.NOS
--('745H.', 'currentSmoker'), --	00	Smoking cessation therapy
--('745H0', 'currentSmoker'), --	00	Nicotine replacement therapy using nicotine patches
--('745H1', 'currentSmoker'), --	00	Nicotine replacement therapy using nicotine gum
--('745H2', 'currentSmoker'), --	00	Nicotine replacement therapy using nicotine inhalator
--('745H3', 'currentSmoker'), --	00	Nicotine replacement therapy using nicotine lozenges
--('745H4', 'currentSmoker'), --	00	Smoking cessation drug therapy
--('745H5', 'currentSmoker'), --	00	Varenicline therapy
--('745Hy', 'currentSmoker'), --	00	Other specified smoking cessation therapy
--('745Hz', 'currentSmoker'), --	00	Smoking cessation therapy NOS
--('67A3.', 'currentSmoker'), --	00	Pregnancy smoking advice
--('8CAL.', 'currentSmoker'), --	00	Smoking cessation advice
--('67H6.', 'currentSmoker'), --	00	Brief intervention for smoking cessation
--('67H1.', 'currentSmoker'), --	00	Lifestyle advice regarding smoking
--('8T08.', 'currentSmoker'), --	00	Referral to smoking cessation service
--('8HkQ.', 'currentSmoker'), --	00	Referral to NHS stop smoking service
--('9kf1.', 'currentSmoker'), --9kf1.	00	Referred for chronic obstructive pulmonary disease structured smoking assessment - enhanced services administration
--('9kf2.', 'currentSmoker'), --9kf2.	00	Chronic obstructive pulmonary disease structured smoking assessment declined - enhanced services administration
--('9kc0.', 'currentSmoker'), -- 9kc..	00	Smoking cessation - enhanced services administration
--('9kc..', 'currentSmoker'), -- 9kc0.	00	Smoking cessation monitoring template completed - enhanced services administration
--('9hG0.', 'currentSmoker'), -- 9hG0.	00	Excepted from smoking quality indicators: Patient unsuitable
--('9hG..', 'currentSmoker'), -- 9hG..	00	Exception reporting: smoking quality indicators
--('9hG1.', 'currentSmoker'), -- 9hG1.	00	Excepted from smoking quality indicators: Informed dissent
--('9N2k.', 'currentSmoker'), --	00	Seen by smoking cessation advisor
--('8HTK.', 'currentSmoker'), --	00	Referral to stop-smoking clinic
--('8IEM0', 'currentSmoker'), --
--('8IEM.', 'currentSmoker'), -- 8IEM.	00	Smoking cessation drug therapy declined
--('8IEK.', 'currentSmoker'), -- 8IEM0	00	Varenicline smoking cessation therapy declined
--('8IAj.', 'currentSmoker'), -- 8IAj.	00	Smoking cessation advice declined
--('8H7i.', 'currentSmoker'), -- 8H7i.	00	Referral to smoking cessation advisor
--('8CdB.', 'currentSmoker'), -- 8CdB.	00	Stop smoking service opportunity signposted
--('8B31G', 'currentSmoker'), -- 8B31G	00	Varenicline smoking cessation therapy offered
--('13p8.', 'currentSmoker'), -- 13p8.	00	Lost to smoking cessation follow-up
--('13p0.', 'currentSmoker'), --13p0.	00	Negotiated date for cessation of smoking
--('13p50', 'currentSmoker'), -- 13p50	00	Practice based smoking cessation programme start date
--('13p5.', 'currentSmoker'), -- 13p5.	00	Smoking cessation programme start date
('137H.', 'currentSmoker'), --137H.	00	Pipe smoker
('137J.', 'currentSmoker'), -- 137J.	00	Cigar smoker
('137Y.', 'currentSmoker'), -- 137Y.	00	Cigar consumption - NEEDS VALUE
('137..', 'currentSmoker'), --	11	Smoker - amount smoked - NEEDS VALUE
('137a.', 'currentSmoker'), -- 137a.	00	Pipe tobacco consumption - NEEDS VALUE
('137h.', 'currentSmoker'), --
('1372.', 'currentSmoker'), --
('1373.', 'currentSmoker'), --
('1374.', 'currentSmoker'), --
('1375.', 'currentSmoker'), --
('1376.', 'currentSmoker'), --
('137C.', 'currentSmoker'), --
('137G.', 'currentSmoker'), -- 137G.	00	Trying to give up smoking
('137M.', 'currentSmoker'), --
('137P.', 'currentSmoker'), --137P.	00	Cigarette smoker
('137Q.', 'currentSmoker'), --137Q.	00	Smoking started
('137R.', 'currentSmoker'), --137R.	00	Current smoker
('137V.', 'currentSmoker'), --
('137X.', 'currentSmoker'), -- 137X.	00	Cigarette consumption - NEEDS VALUE
('137Z.', 'currentSmoker'), -- 137Z.	00	Tobacco consumption NOS - NEEDS VALUE
('137b.', 'currentSmoker'), --137b.	00	Ready to stop smoking
('137c.', 'currentSmoker'), --137c.	00	Thinking about stopping smoking
--('137d.', 'currentSmoker'), -- 137d.	00	Not interested in stopping smoking
('137e.', 'currentSmoker'), --137e.	00	Smoking restarted
('137f.', 'currentSmoker'), --137f.	00	Reason for restarting smoking
--('137g.', 'currentSmoker'), -- 137g.	00	Cigarette pack-years - NEEDS VALUE
('137m.', 'currentSmoker'), -- 137m.	00	Failed attempt to stop smoking
('137n.', 'currentSmoker'), -- 137n.	00	Total time smoked - NEEDS VALUE
('137o.', 'currentSmoker'), -- 137o.	00	Waterpipe tobacco consumption - NEEDS VALUE
('6791.', 'currentSmoker'), --	00	Health ed. - smoking
('137D.', 'currentSmoker'), --	00	Admitted tobacco cons untrue ?
--('8CAg.', 'currentSmoker'), --	00	Smoking cessation advice provided by community pharmacist
('9ko..', 'currentSmoker'), --	00	Current smoker annual review - enhanced services administration
('E251.', 'currentSmoker'), --	00	Tobacco dependence
('E2510', 'currentSmoker'), --	00	Tobacco dependence, unspecified
('E2511', 'currentSmoker'), --	00	Tobacco dependence, continuous
('E2512', 'currentSmoker'), --	00	Tobacco dependence, episodic
('E251z', 'currentSmoker'), --	00	Tobacco dependence NOS
('Eu170', 'currentSmoker'), --	00	[X]Mental and behavioural disorders due to use of tobacco: acute intoxication
('Eu171', 'currentSmoker'), --	00	[X]Mental and behavioural disorders due to use of tobacco: harmful use
('Eu172', 'currentSmoker'), --	00	[X]Mental and behavioural disorders due to use of tobacco: dependence syndrome
('ZV4K0', 'currentSmoker'), --	00	[V]Tobacco use
--('ZV6D8', 'currentSmoker'), --	00	[V]Tobacco abuse counselling
('1V08.', 'currentSmoker'), --	00	Smokes drugs in cigarette form

--smoker: Ex
--from codelist creator 7/12/16 (synonyms:  "smok*",   "ex-smok*",   "former smok*",   "ex smok*",   "cigar*",   "ex-cigar*",    "ex cigar*",   "former cigar*",   "pipe",   "ex pipe",  "ex-pipe",  "former pipe",  "tobac*",  "ex tobac*",   "former tobac*",   "ex-tobac*") 
('ZV116', 'exSmoker'), --
('Eu173', 'exSmoker'), --
('E2513', 'exSmoker'), --
('9km..', 'exSmoker'), --
('1377.', 'exSmoker'), --
('1378.', 'exSmoker'), --
('1379.', 'exSmoker'), --
('137A.', 'exSmoker'), --
('137B.', 'exSmoker'), --
('137F.', 'exSmoker'), --
('137K.', 'exSmoker'), --
('137N.', 'exSmoker'), --
('137O.', 'exSmoker'), --
('137S.', 'exSmoker'), --
('137T.', 'exSmoker'), --137T.	00	Date ceased smoking
('137j.', 'exSmoker'), --
('137l.', 'exSmoker'), --
('137K0', 'exSmoker'), --
('13p4.', 'exSmoker'), --

--smoker: Unknown
--from codelist creator 8/12/16 (synonyms:  "smok*",  "cigar*",   "tobac*") 
('137E.', 'unknownSmoker'), --	00	Tobacco consumption unknown
('137k.', 'unknownSmoker'), --	00	Refusal to give smoking status

--smoker: Unknown
--from codelist creator 9/12/16 (synonyms:  "smok*",  "cigar*",   "tobac*", "never") 
('1371.', 'neverSmoker'), --	00	Never smoked tobacco

--smoker: Unknown
--from codelist creator 9/12/16 (synonyms:  "smok*",  "cigar*",   "tobac*", "never") 
('137L.', 'currentNonSmoker'), --	00	Current non-smoker.

--whitecoat hypertension
--from manual search
('246M.', 'whiteCoat'),

-------------------------
------VACC-----------
-------------------------
--flu vacc: perm ex
--COPD ruleset_v34.0
('14LJ.', 'fluVaccPermEx'),	--00	H/O: influenza vaccine allergy
('U60K4', 'fluVaccPermEx'),	--00	[X]Influenza vaccine causing adverse effects in therapeutic use
('ZV14F', 'fluVaccPermEx'),	--00	[V]Personal history of influenza vaccine allergy

--pneumo vacc: perm ex
--***browser search only - because none in qof doc and not felt necessary to use code list creator***
('U60J8', 'pneumoVaccPermEx'), --	11	[X]Adverse reaction to pneumococcal vaccine
('ZV14G', 'pneumoVaccPermEx'), --	00	[V]Personal history of pneumococcal vaccine allergy
('U60J8', 'pneumoVaccPermEx'), --	00	[X]Pneumococcal vaccine causing adverse effects in therapeutic use

--flu vacc: temp ex
--COPD ruleset_v34.0
('9OX51', 'fluVaccTempEx'), --	00	Seasonal influenza vaccination declined
('8I2F0', 'fluVaccTempEx'), --	00	Seasonal influenza vaccination contraindicated
('8I6D0', 'fluVaccTempEx'), --	00	Seasonal influenza vaccination not indicated
('68NE0', 'fluVaccTempEx'), --	00	No consent for seasonal influenza vaccination
('9OX54', 'fluVaccTempEx'), --	00	First intranasal seasonal influenza vaccination declined
('9OX56', 'fluVaccTempEx'), --	00	Second intranasal seasonal influenza vaccination declined

--pneumo vacc: temp ex
--TECHNICAL REQUIREMENTS FOR 2016/17 GMS CONTRACT CHANGES document
('8I3Q.', 'pneumoVaccTempEx'), --	Pneumococcal vaccination declined
('8I2E.', 'pneumoVaccTempEx'), --	Pneumococcal vaccination contraindicated
('68NX.', 'pneumoVaccTempEx'), --	No consent to Pneumococcal vaccination

--flu vacc
--COPD ruleset_v34.0
('n47..', 'fluVacc'), --	00	INFLUENZA VACCINES
('n471.', 'fluVacc'), --	00	FLUVIRIN prefilled syringe 0.5mL
('n472.', 'fluVacc'), --	00	INFLUVAC SUB-UNIT prefilled syringe 0.5mL
('n473.', 'fluVacc'), --	00	INFLUVAC SUB-UNIT prefilled syringe 0.5mL
('n474.', 'fluVacc'), --	00	*INFLUVAC SUB-UNIT vials 5mL
('n475.', 'fluVacc'), --	00	*INFLUVAC SUB-UNIT vials 25mL
('n476.', 'fluVacc'), --	00	MFV-JECT prefilled syringe 0.5mL
('n477.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE injection 0.5mL
('n478.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE prefilled syringe 0.5mL
('n479.', 'fluVacc'), --	00	*INFLUENZA VACCINE vials 5mL
--n47A.	00	PANDEMRIX INFLUENZA A VACCINE (H1N1v) 2009 injection
--n47B.	00	CELVAPAN INFLUENZA A VACCINE (H1N1v) 2009 injection
('n47C.', 'fluVacc'), --	00	PREFLUCEL suspension for injection prefilled syringe 0.5mL
--n47D.	00	*FLUENZ nasal suspension 0.2mL
('n47E.', 'fluVacc'), --	00	INFLUENZA VACCINE (LIVE ATTENUATED) nasal suspension 0.2mL
('n47F.', 'fluVacc'), --	00	OPTAFLU suspension for injection prefilled syringe 0.5mL
--n47G.	00	INFLUVAC DESU suspension for injection prefill syringe 0.5mL
('n47H.', 'fluVacc'), --	00	FLUARIX TETRA suspension for injection prefill syringe 0.5mL
('n47I.', 'fluVacc'), --	00	FLUENZ TETRA nasal spray suspension 0.2mL
('n47a.', 'fluVacc'), --	00	*INFLUENZA VACCINE vials 25mL
('n47b.', 'fluVacc'), --	00	FLUZONE prefilled syringe 0.5mL
('n47c.', 'fluVacc'), --	00	*FLUZONE vials 5mL
('n47d.', 'fluVacc'), --	00	FLUARIX VACCINE prefilled syringe
('n47e.', 'fluVacc'), --	00	BEGRIVAC VACCINE prefilled syringe 0.5mL
('n47f.', 'fluVacc'), --	00	AGRIPPAL VACCINE prefilled syringe 0.5mL
('n47g.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE (SPLIT VIRION) prefilled syringe 0.5mL
('n47h.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE (SURFACE ANTIGEN SUB-UNIT) prefilled syringe 0.5mL
('n47i.', 'fluVacc'), --	00	INFLEXAL BERNA V prefilled syringe 0.5mL
('n47j.', 'fluVacc'), --	00	MASTAFLU prefilled syringe 0.5mL
('n47k.', 'fluVacc'), --	00	INFLEXAL V prefilled syringe 0.5mL
('n47l.', 'fluVacc'), --	00	INVIVAC prefilled syringe 0.5mL
('n47m.', 'fluVacc'), --	00	ENZIRA prefilled syringe 0.5mL
('n47n.', 'fluVacc'), --	00	VIROFLU prefilled syringe 0.5mL
('n47o.', 'fluVacc'), --	00	IMUVAC prefilled syringe 0.5mL
('n47p.', 'fluVacc'), --	00	INTANZA 15micrograms/strain susp for inj pfs 0.1mL
('n47q.', 'fluVacc'), --	00	INACT INFLUENZA VACC (SPLIT VIRION) 15mcg/strain pfs 0.1mL
--n47r.	00	CELVAPAN (H1N1) suspension for injection vials 5mL
--n47s.	00	CELVAPAN (H5N1) suspension for injection vials 5mL
--n47t.	00	PANDEMRIX (H5N1) injection vials
('n47u.', 'fluVacc'), --	00	INTANZA 9micrograms/strain susp for inj pfs 0.1mL
('n47v.', 'fluVacc'), --	00	INACT INFLUENZA VACC (SPLIT VIRION) 9mcg/strain pfs 0.1mL
('n47y.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE (SPLIT VIRION) prefilled syringe 0.25mL
('n47z.', 'fluVacc'), --	00	INACTIVATED INFLUENZA VACCINE (SURFACE ANTIGEN VIROSOME) prefilled syringe 0.5mL
('65ED.', 'fluVacc'), --	00	Seasonal influenza vaccination
('65E20', 'fluVacc'), --	00	Seasonal influenza vaccination given by other healthcare provider
('65ED0', 'fluVacc'), --	00	Seasonal influenza vaccination given by pharmacist
('65ED2', 'fluVacc'), --	00	Seasonal influenza vaccination given while hospital inpatient
('65ED1', 'fluVacc'), --	00	Administration of first intranasal seasonal influenza vaccination
('65ED3', 'fluVacc'), --	00	Administration of second intranasal seasonal influenza vaccination
('65E21', 'fluVacc'), --	00	First intranasal seasonal influenza vaccination given by other healthcare provider
('65E22', 'fluVacc'), --	00	Second intranasal seasonal influenza vaccination given by other healthcare provider
('65E23', 'fluVacc'), --	00	Second intramuscular seasonal influenza vaccination given by other healthcare provider
('65E24', 'fluVacc'), --	00	First intramuscular seasonal influenza vaccination given by other healthcare provider
('65ED4', 'fluVacc'), --	00	Administration of first inactivated seasonal influenza vaccination
('65ED5', 'fluVacc'), --	00	Administration of second inactivated seasonal influenza vaccination

--flu vacc: given by other
--COPD ruleset_v34.0
('65ED6', 'fluVaccOther'), --	00	First intranasal seasonal influenza vaccination given by pharmacist
('65ED7', 'fluVaccOther'), --	00	Second intranasal seasonal influenza vaccination given by pharmacist
('65ED8', 'fluVaccOther'), --	00	First inactivated seasonal influenza vaccination given by pharmacist
('65ED9', 'fluVaccOther'), --	00	Second inactivated seasonal influenza vaccination given by pharmacist
('65E2.', 'fluVaccOther'), --	00	Influenza vaccination given by other healthcare provider

--pneumovacc
----TECHNICAL REQUIREMENTS FOR 2016/17 GMS CONTRACT CHANGES document
('65720', 'pneumoVacc'), --	Pneumococcal vaccination given
('6572.', 'pneumoVacc'), --	Pneumococcal vaccination
('657P.', 'pneumoVacc'), --	Pneumococcal vaccination given by other healthcare provider
('n4b1.', 'pneumoVacc'), --	*PNEUMOVAX injection 0.5mL                                                                                                                                                                            
('n4b2.', 'pneumoVacc'), --	PNEUMOVAX II injection 0.5mL                                                                                                                                                                          
('n4b3.', 'pneumoVacc'), --	PNU-IMUNE VACCINE injection 0.5mL                                                                                                                                                                     
('n4b4.', 'pneumoVacc'), --	PNEUMOVAX II vaccine prefilled syringe 0.5mL                                                                                                                                                          
('n4b5.', 'pneumoVacc'), --	PREVENAR vaccine injection 0.5mL                                                                                                                                                                      
('n4b6.', 'pneumoVacc'), --	PREVENAR vaccine prefilled syringe 0.5mL                                                                                                                                                              
('n4b7.', 'pneumoVacc'), --	PREVENAR 13 vaccine prefilled syringe 0.5mL                                                                                                                                                           
('n4b8.', 'pneumoVacc'); --	SYNFLORIX vaccine prefilled syringe 0.5mL

-------------------------
------CONTACTS-----------
-------------------------
--From AMIA paper
	
--occupations
insert into codeGroups
select readcode, 'occupations' from SIR_ReadCode_Rubric
where readcode like '0%'
group by readcode

--lab results
insert into codeGroups
select readcode, 'lab' from SIR_ReadCode_Rubric
where readcode like '4%'
group by readcode

--scan results
insert into codeGroups
select readcode, 'scan' from SIR_ReadCode_Rubric
where readcode like '5%'
group by readcode

--operations
insert into codeGroups
select readcode, 'operation' from SIR_ReadCode_Rubric
where readcode like '7%'
group by readcode

--hospital admissions
insert into codeGroups
select readcode, 'hospitalAdmission' from SIR_ReadCode_Rubric
where readcode like '8H[1-3]%'
group by readcode

--admin
insert into codeGroups
select readcode, 'admin' from SIR_ReadCode_Rubric
where readcode like '9%'
group by readcode

--record open
insert into codeGroups
select readcode, 'recordOpen' from SIR_ReadCode_Rubric
where readcode like '$%'
group by readcode

insert into codeGroups
values
('~ENCT', 'recordOpen');

--hospital discharge / transfer / admin
insert into codeGroups
select readcode, 'hospitalAdmissionAdmin' from SIR_ReadCode_Rubric
where readcode like '8H[EFNOdfg]%'
group by readcode

--referral / admission no consultation
insert into codeGroups
select readcode, 'referralNoContact' from SIR_ReadCode_Rubric
where readcode like '8H[IJhu]%'
group by readcode

--exception codes
insert into codeGroups
select readcode, 'exception' from SIR_ReadCode_Rubric
where readcode like '9h%'
group by readcode

--medication codes
insert into codeGroups
select readcode, 'medication' from SIR_ReadCode_Rubric
where LEN(readcode) >= 8
or LEN(readcode) = 6 
or readcode like '[abcdefghijklmnopqrstuvwxyz]%'
or readcode like ''
or readcode like '8B3[168hHjklNSTUVy]%' 
or readcode like '8B4%' 
group by readcode

--f2f codes
insert into codeGroups
select readcode, 'f2f' from SIR_ReadCode_Rubric
where readcode like '1%'
or readcode like '2%'
or readcode in ('6A2..','6A9..','6AA..','6AB..','662d.','662e.','66AS.','66AS0','66AT.','66BB.','66f0.','66YJ.','66YM.','661Q.','66480','6AH..','6A9..','66p0.','6A2..','66Ay.','66Az.','69DC.')
or readcode like '6A%'
or readcode like '65%'
or readcode like '8B31[356]%'
or readcode like '8B3[3569ADEfilOqRxX]%'
or readcode in ('8BS3.')
or readcode like '8H[4-8]%' 
or readcode like '94Z%'
or readcode like '9N1C%' 
or readcode like '9N21%'
or readcode in ('9kF1.','9kR..','9HB5.')
or readcode like '9H9%'
group by readcode

--test codes
insert into codeGroups
select readcode, 'test' from SIR_ReadCode_Rubric
where readcode like '4%'
or readcode like '5%'
group by readcode

--hospital codes
insert into codeGroups
select readcode, 'hospital' from SIR_ReadCode_Rubric
where readcode like '7%'
or readcode like '8H[1-3]%'
or readcode like '9N%' 
group by readcode

--A+E codes
insert into codeGroups
select readcode, 'a+e' from SIR_ReadCode_Rubric
where readcode like '8H2%'
or readcode like '8H[1-3]%'
or readcode in ('9N19','8HJA.','8HC..','8Hu..','8HC1.')
group by readcode

--tel codes
insert into codeGroups
select readcode, 'tel' from SIR_ReadCode_Rubric
where readcode like '8H9%'
or readcode like '9N31%'
or readcode like '9N3A%'
group by readcode

insert into codeGroups
values
--letter received / seen by other clinician - do a codelist creator
--from codelist creator 21/10/16 rV2 DICTIONARY aPRIL 2016: "synonyms": ["letter","seen in","seen by","mail","received"]
	('9Nt1.', 'letterReceived'),
	('9Nt4.', 'letterReceived'),
	('9Nt5.', 'letterReceived'),
	('9Nt6.', 'letterReceived'),
	('9Nt7.', 'letterReceived'),
	('9Nt8.', 'letterReceived'),
	('9Nt10', 'letterReceived'),
	('9Nt40', 'letterReceived'),
	('9Nl6.', 'letterReceived'),
	('9Nl8.', 'letterReceived'),
	('9Nl9.', 'letterReceived'),
	('9NlG.', 'letterReceived'),
	('9NlH.', 'letterReceived'),
	('9NlK.', 'letterReceived'),
	('9NlL.', 'letterReceived'),
	('9NlM.', 'letterReceived'),
	('9NlN.', 'letterReceived'),
	('9NlR.', 'letterReceived'),
	('9NlS.', 'letterReceived'),
	('9NlT.', 'letterReceived'),
	('9NlV.', 'letterReceived'),
	('9NlX.', 'letterReceived'),
	('9Nla.', 'letterReceived'),
	('9Nlb.', 'letterReceived'),
	('9Nlc.', 'letterReceived'),
	('9Nld.', 'letterReceived'),
	('9Nle.', 'letterReceived'),
	('9Nlf.', 'letterReceived'),
	('9Nlg.', 'letterReceived'),
	('9Nlh.', 'letterReceived'),
	('9NlK0', 'letterReceived'),
	('9Nla0', 'letterReceived'),
	('9Nla1', 'letterReceived'),
	('9Nk0.', 'letterReceived'),
	('9Nk1.', 'letterReceived'),
	('9Nk2.', 'letterReceived'),
	('9Nk3.', 'letterReceived'),
	('9Nk4.', 'letterReceived'),
	('9Nk5.', 'letterReceived'),
	('9Nk6.', 'letterReceived'),
	('9Nk7.', 'letterReceived'),
	('9Nk8.', 'letterReceived'),
	('9Nk9.', 'letterReceived'),
	('9NkA.', 'letterReceived'),
	('9NkB.', 'letterReceived'),
	('9NkC.', 'letterReceived'),
	('9NkD.', 'letterReceived'),
	('9NkK.', 'letterReceived'),
	('9NkL.', 'letterReceived'),
	('9NkM.', 'letterReceived'),
	('9NkN.', 'letterReceived'),
	('9NkP.', 'letterReceived'),
	('9Nk70', 'letterReceived'),
	('9ND..', 'letterReceived'),
	('9NL..', 'letterReceived'),
	('9NW..', 'letterReceived'),
	('9No..', 'letterReceived'),
	('9ND5.', 'letterReceived'),
	('9NDJ.', 'letterReceived'),
	('9NL0.', 'letterReceived'),
	('9NL1.', 'letterReceived'),
	('9NW0.', 'letterReceived'),
	('9No0.', 'letterReceived'),
	('9No1.', 'letterReceived'),
	('9No2.', 'letterReceived'),
	('9No3.', 'letterReceived'),
	('9No4.', 'letterReceived'),
	('9No5.', 'letterReceived'),
	('9No6.', 'letterReceived'),
	('9No7.', 'letterReceived'),
	('9No8.', 'letterReceived'),
	('9No9.', 'letterReceived'),
	('9NoA.', 'letterReceived'),
	('9NoB.', 'letterReceived'),
	('9NoC.', 'letterReceived'),
	('9NoD.', 'letterReceived'),
	('9NoE.', 'letterReceived'),
	('9NoF.', 'letterReceived'),
	('9NoB0', 'letterReceived'),
	('9N36.', 'letterReceived'),
	('9N3D.', 'letterReceived'),
	('9N3E.', 'letterReceived'),
	('9N3D1', 'letterReceived'),
	('9N3D2', 'letterReceived'),
	('9N23.', 'letterReceived'),
	('9N24.', 'letterReceived'),
	('9N25.', 'letterReceived'),
	('9N26.', 'letterReceived'),
	('9N27.', 'letterReceived'),
	('9N28.', 'letterReceived'),
	('9N29.', 'letterReceived'),
	('9N2A.', 'letterReceived'),
	('9N2B.', 'letterReceived'),
	('9N2C.', 'letterReceived'),
	('9N2G.', 'letterReceived'),
	('9N2I.', 'letterReceived'),
	('9N2J.', 'letterReceived'),
	('9N2K.', 'letterReceived'),
	('9N2P.', 'letterReceived'),
	('9N2Q.', 'letterReceived'),
	('9N2T.', 'letterReceived'),
	('9N2U.', 'letterReceived'),
	('9N2V.', 'letterReceived'),
	('9N2W.', 'letterReceived'),
	('9N2X.', 'letterReceived'),
	('9N2Y.', 'letterReceived'),
	('9N2a.', 'letterReceived'),
	('9N2b.', 'letterReceived'),
	('9N2d.', 'letterReceived'),
	('9N2e.', 'letterReceived'),
	('9N2f.', 'letterReceived'),
	('9N2g.', 'letterReceived'),
	('9N2h.', 'letterReceived'),
	('9N2i.', 'letterReceived'),
	('9N2j.', 'letterReceived'),
	('9N2k.', 'letterReceived'),
	('9N2m.', 'letterReceived'),
	('9N2n.', 'letterReceived'),
	('9N2p.', 'letterReceived'),
	('9N2t.', 'letterReceived'),
	('9N2u.', 'letterReceived'),
	('9N2v.', 'letterReceived'),
	('9N2w.', 'letterReceived'),
	('9N2x.', 'letterReceived'),
	('9N2y.', 'letterReceived'),
	('9N2z.', 'letterReceived'),
	('9N230', 'letterReceived'),
	('9N2W0', 'letterReceived'),
	('9N2W1', 'letterReceived'),
	('9N2W2', 'letterReceived'),
	('9N2W3', 'letterReceived'),
	('9N11.', 'letterReceived'),
	('9N12.', 'letterReceived'),
	('9N13.', 'letterReceived'),
	('9N14.', 'letterReceived'),
	('9N15.', 'letterReceived'),
	('9N16.', 'letterReceived'),
	('9N19.', 'letterReceived'),
	('9N1A.', 'letterReceived'),
	('9N1I.', 'letterReceived'),
	('9N1J.', 'letterReceived'),
	('9N1K.', 'letterReceived'),
	('9N1L.', 'letterReceived'),
	('9N1M.', 'letterReceived'),
	('9N1N.', 'letterReceived'),
	('9N1O.', 'letterReceived'),
	('9N1P.', 'letterReceived'),
	('9N1Q.', 'letterReceived'),
	('9N1R.', 'letterReceived'),
	('9N1S.', 'letterReceived'),
	('9N1T.', 'letterReceived'),
	('9N1U.', 'letterReceived'),
	('9N1V.', 'letterReceived'),
	('9N1Y.', 'letterReceived'),
	('9N1a.', 'letterReceived'),
	('9N1b.', 'letterReceived'),
	('9N1c.', 'letterReceived'),
	('9N1d.', 'letterReceived'),
	('9N1e.', 'letterReceived'),
	('9N1f.', 'letterReceived'),
	('9N1g.', 'letterReceived'),
	('9N1h.', 'letterReceived'),
	('9N1i.', 'letterReceived'),
	('9N1j.', 'letterReceived'),
	('9N1k.', 'letterReceived'),
	('9N1l.', 'letterReceived'),
	('9N1m.', 'letterReceived'),
	('9N1n.', 'letterReceived'),
	('9N1o.', 'letterReceived'),
	('9N1p.', 'letterReceived'),
	('9N1q.', 'letterReceived'),
	('9N1r.', 'letterReceived'),
	('9N1s.', 'letterReceived'),
	('9N1u.', 'letterReceived'),
	('9N1v.', 'letterReceived'),
	('9N1y.', 'letterReceived'),
	('9N1V0', 'letterReceived'),
	('9N1V1', 'letterReceived'),
	('9N1d0', 'letterReceived'),
	('9N1y0', 'letterReceived'),
	('9N1y1', 'letterReceived'),
	('9N1y2', 'letterReceived'),
	('9N1y5', 'letterReceived'),
	('9N1y6', 'letterReceived'),
	('9N1y7', 'letterReceived'),
	('9N1y8', 'letterReceived'),
	('9N1y9', 'letterReceived'),
	('9N1yA', 'letterReceived'),
	('9N1yB', 'letterReceived'),
	('9N1yC', 'letterReceived'),
	('9N1yD', 'letterReceived'),
	('9N1yE', 'letterReceived'),
	('9N1yF', 'letterReceived'),
	('9N1yG', 'letterReceived'),
	('9N1yH', 'letterReceived'),
	('9N1yJ', 'letterReceived'),
	('9N1yK', 'letterReceived'),
	('9N1yL', 'letterReceived'),
	('9N01.', 'letterReceived'),
	('9N02.', 'letterReceived'),
	('9N03.', 'letterReceived'),
	('9N06.', 'letterReceived'),
	('9N07.', 'letterReceived'),
	('9N08.', 'letterReceived'),
	('9N09.', 'letterReceived'),
	('9N0A.', 'letterReceived'),
	('9N0B.', 'letterReceived'),
	('9N0C.', 'letterReceived'),
	('9N0D.', 'letterReceived'),
	('9N0E.', 'letterReceived'),
	('9N0F.', 'letterReceived'),
	('9N0G.', 'letterReceived'),
	('9N0H.', 'letterReceived'),
	('9N0I.', 'letterReceived'),
	('9N0J.', 'letterReceived'),
	('9N0K.', 'letterReceived'),
	('9N0L.', 'letterReceived'),
	('9N0M.', 'letterReceived'),
	('9N0N.', 'letterReceived'),
	('9N0P.', 'letterReceived'),
	('9N0Q.', 'letterReceived'),
	('9N0T.', 'letterReceived'),
	('9N0V.', 'letterReceived'),
	('9N0W.', 'letterReceived'),
	('9N0X.', 'letterReceived'),
	('9N0Y.', 'letterReceived'),
	('9N0Z.', 'letterReceived'),
	('9N0a.', 'letterReceived'),
	('9N0b.', 'letterReceived'),
	('9N0c.', 'letterReceived'),
	('9N0d.', 'letterReceived'),
	('9N0e.', 'letterReceived'),
	('9N0f.', 'letterReceived'),
	('9N0g.', 'letterReceived'),
	('9N0h.', 'letterReceived'),
	('9N0i.', 'letterReceived'),
	('9N0j.', 'letterReceived'),
	('9N0k.', 'letterReceived'),
	('9N0l.', 'letterReceived'),
	('9N0m.', 'letterReceived'),
	('9N0n.', 'letterReceived'),
	('9N0o.', 'letterReceived'),
	('9N0p.', 'letterReceived'),
	('9N0q.', 'letterReceived'),
	('9N0r.', 'letterReceived'),
	('9N0s.', 'letterReceived'),
	('9N0t.', 'letterReceived'),
	('9N0u.', 'letterReceived'),
	('9N0v.', 'letterReceived'),
	('9N0w.', 'letterReceived'),
	('9N0x.', 'letterReceived'),
	('9N0y.', 'letterReceived'),
	('9N0z.', 'letterReceived'),
	('9N33.', 'letterReceived'), --Letter encounter
--The below are about DV visits (not GP) from manual search Rv2 April 2016 dictionary
	('8HL..', 'letterReceived'),
	('8HL1.', 'letterReceived'),
	('8HL2.', 'letterReceived'),
	('8HL3.', 'letterReceived'),
	('8HL4.', 'letterReceived'),
	('8HL5.', 'letterReceived'),
	('8HL6.', 'letterReceived'),
	('8HL7.', 'letterReceived'),
	('8HL8.', 'letterReceived'),
	('8HL9.', 'letterReceived'),
	('8HLA.', 'letterReceived'),
	('8HLB.', 'letterReceived'),
	('8HLC.', 'letterReceived'),
	('8HLD.', 'letterReceived'),
	('8HLE.', 'letterReceived'),
	('8HLG.', 'letterReceived'),
	('8HLH.', 'letterReceived'),
	('8HLJ.', 'letterReceived'),
	('8HLK.', 'letterReceived'),
	('8HLL.', 'letterReceived'),
	('8HLM.', 'letterReceived'),
	('8HLN.', 'letterReceived'),
	('8HLO.', 'letterReceived'),
	('8HLP.', 'letterReceived'),
	('8HLQ.', 'letterReceived'),
	('8HLR.', 'letterReceived'),
	('8HLS.', 'letterReceived'),

--contact attempted
--from codelist creator 21/10/16: "synonyms": ["letter","invite","invitation","failed encounter","sms","email","telephone","phone","mail","unknown","queries","cancelled","failed","not contactable","monitoring","call","offer"]
	('91690', 'contactAttempt'),
	('91790', 'contactAttempt'),
	('9p0..', 'contactAttempt'),
	('9p1..', 'contactAttempt'),
	('9p2..', 'contactAttempt'),
	('9mP0.', 'contactAttempt'),
	('9mP00', 'contactAttempt'),
	('9mP01', 'contactAttempt'),
	('9mP02', 'contactAttempt'),
	('9mD0.', 'contactAttempt'),
	('9mD1.', 'contactAttempt'),
	('9mD3.', 'contactAttempt'),
	('9m90.', 'contactAttempt'),
	('9m900', 'contactAttempt'),
	('9m901', 'contactAttempt'),
	('9m902', 'contactAttempt'),
	('9m1..', 'contactAttempt'),
	('9m10.', 'contactAttempt'),
	('9m11.', 'contactAttempt'),
	('9m12.', 'contactAttempt'),
	('9m2..', 'contactAttempt'),
	('9m3..', 'contactAttempt'),
	('9m5..', 'contactAttempt'),
	('9m6..', 'contactAttempt'),
	('9m7..', 'contactAttempt'),
	('9m8..', 'contactAttempt'),
	('9mA..', 'contactAttempt'),
	('9mB..', 'contactAttempt'),
	('9mC..', 'contactAttempt'),
	('9mE..', 'contactAttempt'),
	('9mF..', 'contactAttempt'),
	('9mG..', 'contactAttempt'),
	('9mH..', 'contactAttempt'),
	('9mK..', 'contactAttempt'),
	('9mL..', 'contactAttempt'),
	('9mM..', 'contactAttempt'),
	('9mN..', 'contactAttempt'),
	('9mQ..', 'contactAttempt'),
	('9mR..', 'contactAttempt'),
	('9mS..', 'contactAttempt'),
	('9mT..', 'contactAttempt'),
	('9mV..', 'contactAttempt'),
	('9mW..', 'contactAttempt'),
	('9mX..', 'contactAttempt'),
	('9mY..', 'contactAttempt'),
	('9mZ..', 'contactAttempt'),
	('9ma..', 'contactAttempt'),
	('9m22.', 'contactAttempt'),
	('9m23.', 'contactAttempt'),
	('9m24.', 'contactAttempt'),
	('9m25.', 'contactAttempt'),
	('9m30.', 'contactAttempt'),
	('9m31.', 'contactAttempt'),
	('9m32.', 'contactAttempt'),
	('9m33.', 'contactAttempt'),
	('9mA2.', 'contactAttempt'),
	('9mB1.', 'contactAttempt'),
	('9mB2.', 'contactAttempt'),
	('9mB3.', 'contactAttempt'),
	('9mC1.', 'contactAttempt'),
	('9mC2.', 'contactAttempt'),
	('9mC3.', 'contactAttempt'),
	('9mC5.', 'contactAttempt'),
	('9mC6.', 'contactAttempt'),
	('9mE0.', 'contactAttempt'),
	('9mG0.', 'contactAttempt'),
	('9mG1.', 'contactAttempt'),
	('9mG2.', 'contactAttempt'),
	('9mH0.', 'contactAttempt'),
	('9mH1.', 'contactAttempt'),
	('9mH2.', 'contactAttempt'),
	--('9mH3.', 'contactAttempt'), verbal invite
	('9mK0.', 'contactAttempt'),
	('9mK1.', 'contactAttempt'),
	('9mK2.', 'contactAttempt'),
	('9mL0.', 'contactAttempt'),
	('9mL1.', 'contactAttempt'),
	('9mL2.', 'contactAttempt'),
	('9mM0.', 'contactAttempt'),
	('9mM1.', 'contactAttempt'),
	('9mM2.', 'contactAttempt'),
	('9mR0.', 'contactAttempt'),
	('9mR1.', 'contactAttempt'),
	('9mR2.', 'contactAttempt'),
	('9mR3.', 'contactAttempt'),
	('9mR4.', 'contactAttempt'),
	('9mS0.', 'contactAttempt'),
	('9mS1.', 'contactAttempt'),
	('9mS2.', 'contactAttempt'),
	('9mT0.', 'contactAttempt'),
	('9mT1.', 'contactAttempt'),
	('9mT2.', 'contactAttempt'),
	('9mT3.', 'contactAttempt'),
	('9mT4.', 'contactAttempt'),
	('9mT5.', 'contactAttempt'),
	('9mT6.', 'contactAttempt'),
	('9mW0.', 'contactAttempt'),
	('9mW1.', 'contactAttempt'),
	('9mW2.', 'contactAttempt'),
	('9mX0.', 'contactAttempt'),
	('9mX1.', 'contactAttempt'),
	('9mX2.', 'contactAttempt'),
	('9mZ0.', 'contactAttempt'),
	('9mZ1.', 'contactAttempt'),
	('9mZ2.', 'contactAttempt'),
	('9ma0.', 'contactAttempt'),
	('9ma1.', 'contactAttempt'),
	('9ma2.', 'contactAttempt'),
	('9m330', 'contactAttempt'),
	('9m331', 'contactAttempt'),
	('9m332', 'contactAttempt'),
	('9mA20', 'contactAttempt'),
	('9mA21', 'contactAttempt'),
	('9mA22', 'contactAttempt'),
	('9ki3.', 'contactAttempt'),
	('9b0S.', 'contactAttempt'),
	('9Q9..', 'contactAttempt'),
	('9P4..', 'contactAttempt'),
	('9Oy0.', 'contactAttempt'),
	('9Oy00', 'contactAttempt'),
	('9Oy02', 'contactAttempt'),
	('9Oy03', 'contactAttempt'),
	('9Oy04', 'contactAttempt'),
	('9Ox1.', 'contactAttempt'),
	('9Ox2.', 'contactAttempt'),
	('9Ox3.', 'contactAttempt'),
	('9Ox4.', 'contactAttempt'),
	('9Ow2.', 'contactAttempt'),
	('9Ow5.', 'contactAttempt'),
	('9Ov0.', 'contactAttempt'),
	('9Ov1.', 'contactAttempt'),
	('9Ov2.', 'contactAttempt'),
	('9Ou1.', 'contactAttempt'),
	('9Ou2.', 'contactAttempt'),
	('9Ou3.', 'contactAttempt'),
	('9Ot0.', 'contactAttempt'),
	('9Ot1.', 'contactAttempt'),
	('9Ot2.', 'contactAttempt'),
	('9Os0.', 'contactAttempt'),
	('9Os1.', 'contactAttempt'),
	('9Os2.', 'contactAttempt'),
	('9Or3.', 'contactAttempt'),
	('9Or4.', 'contactAttempt'),
	('9Or5.', 'contactAttempt'),
	('9OqF.', 'contactAttempt'),
	('9Oo0.', 'contactAttempt'),
	('9Oo2.', 'contactAttempt'),
	('9Oo3.', 'contactAttempt'),
	('9Oo4.', 'contactAttempt'),
	('9On0.', 'contactAttempt'),
	('9On1.', 'contactAttempt'),
	('9On2.', 'contactAttempt'),
	('9On3.', 'contactAttempt'),
	('9Om0.', 'contactAttempt'),
	('9Om1.', 'contactAttempt'),
	('9Om2.', 'contactAttempt'),
	('9Ol0.', 'contactAttempt'),
	('9Ol1.', 'contactAttempt'),
	('9Ol2.', 'contactAttempt'),
	('9Ol3.', 'contactAttempt'),
	('9Ol4.', 'contactAttempt'),
	('9Ol5.', 'contactAttempt'),
	('9Ol6.', 'contactAttempt'),
	('9Ol7.', 'contactAttempt'),
	('9Ol8.', 'contactAttempt'),
	('9Ol9.', 'contactAttempt'),
	('9OlA.', 'contactAttempt'),
	('9OlB.', 'contactAttempt'),
	('9OlB0', 'contactAttempt'),
	('9OlB1', 'contactAttempt'),
	('9OlB2', 'contactAttempt'),
	('9Ok0.', 'contactAttempt'),
	('9Ok1.', 'contactAttempt'),
	('9Ok2.', 'contactAttempt'),
	('9OkD.', 'contactAttempt'),
	('9OkD0', 'contactAttempt'),
	('9OkD1', 'contactAttempt'),
	('9OkD2', 'contactAttempt'),
	('9OkD3', 'contactAttempt'),
	('9OkD4', 'contactAttempt'),
	('9OkD5', 'contactAttempt'),
	('9Oj0.', 'contactAttempt'),
	('9Oj1.', 'contactAttempt'),
	('9Oj2.', 'contactAttempt'),
	('9Oi0.', 'contactAttempt'),
	('9Oi1.', 'contactAttempt'),
	('9Oi2.', 'contactAttempt'),
	('9Of0.', 'contactAttempt'),
	('9Of1.', 'contactAttempt'),
	('9Of2.', 'contactAttempt'),
	('9Of5.', 'contactAttempt'),
	('9Of6.', 'contactAttempt'),
	('9Of7.', 'contactAttempt'),
	('9Oe50', 'contactAttempt'),
	('9Oe51', 'contactAttempt'),
	('9Oe52', 'contactAttempt'),
	('9Od3.', 'contactAttempt'),
	('9Od4.', 'contactAttempt'),
	('9Od5.', 'contactAttempt'),
	('9Oc2.', 'contactAttempt'),
	('9Oc3.', 'contactAttempt'),
	('9Oc4.', 'contactAttempt'),
	('9Ob3.', 'contactAttempt'),
	('9Ob4.', 'contactAttempt'),
	('9Ob5.', 'contactAttempt'),
	('9OY4.', 'contactAttempt'),
	('9OY5.', 'contactAttempt'),
	('9OY6.', 'contactAttempt'),
	('9OX6.', 'contactAttempt'),
	('9OX9.', 'contactAttempt'),
	('9OXA.', 'contactAttempt'),
	('9OXB.', 'contactAttempt'),
	('9OXC.', 'contactAttempt'),
	('9OXE.', 'contactAttempt'),
	('9OXC0', 'contactAttempt'),
	('9OXC1', 'contactAttempt'),
	('9OXC2', 'contactAttempt'),
	('9OXC3', 'contactAttempt'),
	('9OXE0', 'contactAttempt'),
	('9OXE1', 'contactAttempt'),
	('9OXE2', 'contactAttempt'),
	('9OW4.', 'contactAttempt'),
	('9OW5.', 'contactAttempt'),
	('9OW6.', 'contactAttempt'),
	('9OV4.', 'contactAttempt'),
	('9OV5.', 'contactAttempt'),
	('9OV6.', 'contactAttempt'),
	('9OU4.', 'contactAttempt'),
	('9OU5.', 'contactAttempt'),
	('9OU6.', 'contactAttempt'),
	('9OT4.', 'contactAttempt'),
	('9OT5.', 'contactAttempt'),
	('9OT6.', 'contactAttempt'),
	('9OS4.', 'contactAttempt'),
	('9OS5.', 'contactAttempt'),
	('9OS6.', 'contactAttempt'),
	('9OS7.', 'contactAttempt'),
	('9OR4.', 'contactAttempt'),
	('9OR5.', 'contactAttempt'),
	('9OR6.', 'contactAttempt'),
	('9OQ4.', 'contactAttempt'),
	('9OQ5.', 'contactAttempt'),
	('9OQ6.', 'contactAttempt'),
	('9OP4.', 'contactAttempt'),
	('9OP5.', 'contactAttempt'),
	('9OP6.', 'contactAttempt'),
	('9OOB.', 'contactAttempt'),
	('9OOB0', 'contactAttempt'),
	('9OOB1', 'contactAttempt'),
	('9OOB2', 'contactAttempt'),
	('9ON4.', 'contactAttempt'),
	('9ON5.', 'contactAttempt'),
	('9ON6.', 'contactAttempt'),
	('9OM4.', 'contactAttempt'),
	('9OM5.', 'contactAttempt'),
	('9OM6.', 'contactAttempt'),
	('9OL4.', 'contactAttempt'),
	('9OL5.', 'contactAttempt'),
	('9OL6.', 'contactAttempt'),
	('9OLN.', 'contactAttempt'),
	('9OK4.', 'contactAttempt'),
	('9OK5.', 'contactAttempt'),
	('9OK6.', 'contactAttempt'),
	('9OJ4.', 'contactAttempt'),
	('9OJ5.', 'contactAttempt'),
	('9OJ6.', 'contactAttempt'),
	('9OJB.', 'contactAttempt'),
	('9OJC.', 'contactAttempt'),
	('9OJB0', 'contactAttempt'),
	('9OJB1', 'contactAttempt'),
	('9OJB2', 'contactAttempt'),
	('9OI4.', 'contactAttempt'),
	('9OI5.', 'contactAttempt'),
	('9OI6.', 'contactAttempt'),
	('9OIB.', 'contactAttempt'),
	('9OIC.', 'contactAttempt'),
	('9OID.', 'contactAttempt'),
	('9OI3.', 'contactAttempt'),
	('9OF9.', 'contactAttempt'),
	('9OFA.', 'contactAttempt'),
	('9OFB.', 'contactAttempt'),
	('9OF1.', 'contactAttempt'),
	('9OF2.', 'contactAttempt'),
	('9OF3.', 'contactAttempt'),
	('9OF5.', 'contactAttempt'),
	('9OF6.', 'contactAttempt'),
	('9OF7.', 'contactAttempt'),
	('9OE9.', 'contactAttempt'),
	('9O8c.', 'contactAttempt'),
	('9O8d.', 'contactAttempt'),
	('9O8e.', 'contactAttempt'),
	('9O8k.', 'contactAttempt'),
	('9O8k0', 'contactAttempt'),
	('9O8k1', 'contactAttempt'),
	('9O8k2', 'contactAttempt'),
	('9O81.', 'contactAttempt'),
	('9O82.', 'contactAttempt'),
	('9O83.', 'contactAttempt'),
	('9O85.', 'contactAttempt'),
	('9O86.', 'contactAttempt'),
	('9O87.', 'contactAttempt'),
	('9O8A.', 'contactAttempt'),
	('9O8B.', 'contactAttempt'),
	('9O8C.', 'contactAttempt'),
	('9O8E.', 'contactAttempt'),
	('9O8F.', 'contactAttempt'),
	('9O8G.', 'contactAttempt'),
	('9O8I.', 'contactAttempt'),
	('9O8J.', 'contactAttempt'),
	('9O8K.', 'contactAttempt'),
	('9O8M.', 'contactAttempt'),
	('9O8N.', 'contactAttempt'),
	('9O8O.', 'contactAttempt'),
	('9O59.', 'contactAttempt'),
	('9O5A.', 'contactAttempt'),
	('9O5B.', 'contactAttempt'),
	('9O5C.', 'contactAttempt'),
	('9O5D.', 'contactAttempt'),
	('9O5E.', 'contactAttempt'),
	('9O5F.', 'contactAttempt'),
	('9O5G.', 'contactAttempt'),
	('9O5H.', 'contactAttempt'),
	('9O5J.', 'contactAttempt'),
	('9O5K.', 'contactAttempt'),
	('9O5L.', 'contactAttempt'),
	('9O5M.', 'contactAttempt'),
	('9O5N.', 'contactAttempt'),
	('9O5P.', 'contactAttempt'),
	('9O5Q.', 'contactAttempt'),
	('9O5R.', 'contactAttempt'),
	('9O5S.', 'contactAttempt'),
	('9O5T.', 'contactAttempt'),
	('9O5V.', 'contactAttempt'),
	('9O5W.', 'contactAttempt'),
	('9O5X.', 'contactAttempt'),
	('9O5Y.', 'contactAttempt'),
	('9O5a.', 'contactAttempt'),
	('9O51.', 'contactAttempt'),
	('9O52.', 'contactAttempt'),
	('9O53.', 'contactAttempt'),
	('9O55.', 'contactAttempt'),
	('9O56.', 'contactAttempt'),
	('9O57.', 'contactAttempt'),
	('9O391', 'contactAttempt'),
	('9O39.', 'contactAttempt'),
	('9O392', 'contactAttempt'),
	('9O393', 'contactAttempt'),
	('9O21.', 'contactAttempt'),
	('9Oz..', 'contactAttempt'),
	('9Oz0.', 'contactAttempt'),
	('9Oz1.', 'contactAttempt'),
	('9Oz2.', 'contactAttempt'),
	('9N4D.', 'contactAttempt'),
	('9N4E.', 'contactAttempt'),
	('9N4F.', 'contactAttempt'),
	('9N4G.', 'contactAttempt'),
	('9Nj..', 'contactAttempt'),
	('9NC3.', 'contactAttempt'),
	('9NCB.', 'contactAttempt'),
	('9Nj0.', 'contactAttempt'),
	('9Nj1.', 'contactAttempt'),
	('9Nj3.', 'contactAttempt'),
	('9Nj4.', 'contactAttempt'),
	('9Nj5.', 'contactAttempt'),
	--('9Nj6.', 'contactAttempt'), appt cancelled by pt
	('9Nj7.', 'contactAttempt'),
	('9Nj8.', 'contactAttempt'),
	('9Nj9.', 'contactAttempt'),
	('9NC32', 'contactAttempt'),
	('9NCB0', 'contactAttempt'),
	('9N35.', 'contactAttempt'),
	('9N3C.', 'contactAttempt'),
	('9N3G.', 'contactAttempt'),
	('9N351', 'contactAttempt'),
	('9N352', 'contactAttempt'),
	('8BMJ0', 'contactAttempt'),
	('8AB4.', 'contactAttempt'),
	('68W28', 'contactAttempt'),
	('68NG.', 'contactAttempt'),
	('68NH.', 'contactAttempt'),
	('68Nu.', 'contactAttempt'),
	('68N30', 'contactAttempt'),
	('6815.', 'contactAttempt'),
	('6817.', 'contactAttempt'),
	('66HC.', 'contactAttempt'),
	('9179.', 'contactAttempt'),
	('917..', 'contactAttempt'),
	('9169.', 'contactAttempt'),
	('916..', 'contactAttempt'),

--dna
--from codelist creator 21/10/16: "synonyms": ["dna","missed","not attend","failed encounter","non-attender","attender","lost to followup","followup"]
	('9ki0.', 'dna'),
	('9kh2.', 'dna'),
	('9QG..', 'dna'),
	('9Q11.', 'dna'),
	('9Q14.', 'dna'),
	('9PB..', 'dna'),
	('9OqH0', 'dna'),
	('9OqH9', 'dna'),
	('9Oq97', 'dna'),
	('9Oe3.', 'dna'),
	('9OWA.', 'dna'),
	('9OHC.', 'dna'),
	('9NFb1', 'dna'),
	('9N4..', 'dna'),
	('9N42.', 'dna'),
	('9N4B.', 'dna'),
	('9N4H.', 'dna'),
	('9N4I.', 'dna'),
	('9N4J.', 'dna'),
	('9N4K.', 'dna'),
	('9N4L.', 'dna'),
	('9N4M.', 'dna'),
	('9N4N.', 'dna'),
	('9N4Q.', 'dna'),
	('9N4R.', 'dna'),
	('9N4S.', 'dna'),
	('9N4T.', 'dna'),
	('9N4V.', 'dna'),
	('9N4W.', 'dna'),
	('9N4X.', 'dna'),
	('9N4Y.', 'dna'),
	('9N4b.', 'dna'),
	('9N4c.', 'dna'),
	('9N4d.', 'dna'),
	('9N4e.', 'dna'),
	('9N4f.', 'dna'),
	('9N4g.', 'dna'),
	('9N4h.', 'dna'),
	('9N4i.', 'dna'),
	('9N4j.', 'dna'),
	('9N4k.', 'dna'),
	('9N4l.', 'dna'),
	('9N4m.', 'dna'),
	('9N4n.', 'dna'),
	('9N4o.', 'dna'),
	('9N4p.', 'dna'),
	('9N4q.', 'dna'),
	('9N4r.', 'dna'),
	('9N4s.', 'dna'),
	('9N4t.', 'dna'),
	('9N4u.', 'dna'),
	('9N4v.', 'dna'),
	('9N4w.', 'dna'),
	('9N4x.', 'dna'),
	('9N4y.', 'dna'),
	('9N4z.', 'dna'),
	('9N4B0', 'dna'),
	('9N4N0', 'dna'),
	('9N4N1', 'dna'),
	('9N4N2', 'dna'),
	('9N4N3', 'dna'),
	('9N4q0', 'dna'),
	('9N4q1', 'dna'),
	('9N4q2', 'dna'),
	('9N4q3', 'dna'),
	('9N4q4', 'dna'),
	('9N4z0', 'dna'),
	('9N4z1', 'dna'),
	('9N4z2', 'dna'),
	('9N4z3', 'dna'),
	('9N4z4', 'dna'),
	('9N4z5', 'dna'),
	('9N4z6', 'dna'),
	('9N4z7', 'dna'),
	('9N4z8', 'dna'),
	('9Ni..', 'dna'),
	('9Ni0.', 'dna'),
	('9Ni1.', 'dna'),
	('9Ni2.', 'dna'),
	('9Ni3.', 'dna'),
	('9Ni4.', 'dna'),
	('9Ni5.', 'dna'),
	('9Ni6.', 'dna'),
	('9Ni7.', 'dna'),
	('9Ni8.', 'dna'),
	('9Ni9.', 'dna'),
	('9NiA.', 'dna'),
	('9NiB.', 'dna'),
	('9NiC.', 'dna'),
	('9NiD.', 'dna'),
	('9NiE.', 'dna'),
	('9NiF.', 'dna'),
	('9NiG.', 'dna'),
	('9NiH.', 'dna'),
	('9NiJ.', 'dna'),
	('9NiK.', 'dna'),
	('9NiL.', 'dna'),
	('9NiM.', 'dna'),
	('9NiN.', 'dna'),
	('9NiP.', 'dna'),
	('9NiQ.', 'dna'),
	('9NiR.', 'dna'),
	('9NiS.', 'dna'),
	('9NiT.', 'dna'),
	('9NiV.', 'dna'),
	('9NiW.', 'dna'),
	('9NiX.', 'dna'),
	('9NiY.', 'dna'),
	('9NiZ.', 'dna'),
	('9Nia.', 'dna'),
	('9Nib.', 'dna'),
	('9Nic.', 'dna'),
	('9Nid.', 'dna'),
	('9Nie.', 'dna'),
	('9Nif.', 'dna'),
	('9Nig.', 'dna'),
	('9Nih.', 'dna'),
	('9Nii.', 'dna'),
	('9Nij.', 'dna'),
	('9Nik.', 'dna'),
	('9Nil.', 'dna'),
	('9Nim.', 'dna'),
	('9Nin.', 'dna'),
	('9Nio.', 'dna'),
	('9Nip.', 'dna'),
	('9NiQ0', 'dna'),
	('9NiQ1', 'dna'),
	('9Nic0', 'dna'),
	('9N352', 'dna'),
	('9HB7.', 'dna'),
	('68W29', 'dna'),
	('6252.', 'dna'),
	('14OI.', 'dna'),
	('9N81.', 'dna');	--	Patient never seen


					----------------------------------------------
							-----------eFI v3------------
					----------------------------------------------

insert into codeGroups
select readcode, 'efiMeds' from SIR_ReadCode_Rubric
where readcode like '[a-s]%'
or readcode like 'u%'
or readcode like 'y%'
group by readcode

insert into codeGroups
values
('13O5.', 'efiActivity'), --	Activity limitation
('13V8.', 'efiActivity'), --	Activity limitation
('13VC.', 'efiActivity'), --	Activity limitation
('8F6..', 'efiActivity'), --	Activity limitation
('9EB5.', 'efiActivity'), --	Activity limitation
('145..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('1451.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('1452.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('1453.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('1454.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('2C23.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('42R41', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('42T2.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('66E5.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('7Q090', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('7Q091', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('B9370', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('B9371', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('B9372', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('B9373', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('B937X', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('BBmA.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('BBmB.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('BBmL.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('ByuHC', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('C2620', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('C2621', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0...', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D000.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D001.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00y.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00y1', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00yz', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00z.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00z0', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00z1', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00z2', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D00zz', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D010.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D011.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0110', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0111', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D011X', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D011z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D012.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0121', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0122', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0123', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0124', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0125', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D012z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D013.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0130', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D013z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D014.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0140', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D014z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01y.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01yy', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01yz', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01z.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D01z0', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0y..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D0z..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1...', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D104.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1040', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1047', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D104z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D106.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1060', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1061', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1062', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D106z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D11..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D110.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1100', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1101', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1102', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1103', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1104', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D110z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D111.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1110', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1111', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1112', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1114', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1115', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D111y', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D111z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D112z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D11z.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1y..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D1z..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2...', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D20..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D200.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2000', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2002', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D200y', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D200z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D201.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2010', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2011', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2012', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2013', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2014', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2017', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D201z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D204.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D20z.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D21..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D210.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2101', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2103', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2104', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D210z', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D211.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D212.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2120', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D213.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D214.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D215.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2150', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D21y.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D21yy', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D21yz', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D21z.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2y..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('D2z..', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu0.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu00', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu01', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu02', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu03', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu04', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu05', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu06', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu1.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu15', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu16', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu17', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu2.', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu21', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu22', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu23', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('Dyu24', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('J6141', 'efiAnaemia'), --	Anaemia & haematinic deficiency
('14G..', 'efiArthritis'), --	Arthritis
('14G1.', 'efiArthritis'), --	Arthritis
('14G2.', 'efiArthritis'), --	Arthritis
('52A31', 'efiArthritis'), --	Arthritis
('52A71', 'efiArthritis'), --	Arthritis
('66H..', 'efiArthritis'), --	Arthritis
('N0504', 'efiArthritis'), --	Arthritis
('7K3..', 'efiArthritis'), --	Arthritis
('7K30.', 'efiArthritis'), --	Arthritis
('7K32.', 'efiArthritis'), --	Arthritis
('7K6Z3', 'efiArthritis'), --	Arthritis
('7K6Z7', 'efiArthritis'), --	Arthritis
('7K6ZK', 'efiArthritis'), --	Arthritis
('C340.', 'efiArthritis'), --	Arthritis
('C34z.', 'efiArthritis'), --	Arthritis
('N023.', 'efiArthritis'), --	Arthritis
('N0310', 'efiArthritis'), --	Arthritis
('N04..', 'efiArthritis'), --	Arthritis
('N040.', 'efiArthritis'), --	Arthritis
('N0400', 'efiArthritis'), --	Arthritis
('N0401', 'efiArthritis'), --	Arthritis
('N0402', 'efiArthritis'), --	Arthritis
('N0404', 'efiArthritis'), --	Arthritis
('N0405', 'efiArthritis'), --	Arthritis
('N0407', 'efiArthritis'), --	Arthritis
('N0408', 'efiArthritis'), --	Arthritis
('N0409', 'efiArthritis'), --	Arthritis
('N040A', 'efiArthritis'), --	Arthritis
('N040B', 'efiArthritis'), --	Arthritis
('N040C', 'efiArthritis'), --	Arthritis
('N040D', 'efiArthritis'), --	Arthritis
('N040F', 'efiArthritis'), --	Arthritis
('N040G', 'efiArthritis'), --	Arthritis
('N040H', 'efiArthritis'), --	Arthritis
('N040J', 'efiArthritis'), --	Arthritis
('N040K', 'efiArthritis'), --	Arthritis
('N040L', 'efiArthritis'), --	Arthritis
('N040M', 'efiArthritis'), --	Arthritis
('N040P', 'efiArthritis'), --	Arthritis
('N040S', 'efiArthritis'), --	Arthritis
('N040T', 'efiArthritis'), --	Arthritis
('N047.', 'efiArthritis'), --	Arthritis
('N04X.', 'efiArthritis'), --	Arthritis
('N05..', 'efiArthritis'), --	Arthritis
('N050.', 'efiArthritis'), --	Arthritis
('N0502', 'efiArthritis'), --	Arthritis
('N0504', 'efiArthritis'), --	Arthritis
('N0506', 'efiArthritis'), --	Arthritis
('N0535', 'efiArthritis'), --	Arthritis
('N0536', 'efiArthritis'), --	Arthritis
('N05z1', 'efiArthritis'), --	Arthritis
('N05z4', 'efiArthritis'), --	Arthritis
('N05z5', 'efiArthritis'), --	Arthritis
('N05z6', 'efiArthritis'), --	Arthritis
('N05z9', 'efiArthritis'), --	Arthritis
('N05zJ', 'efiArthritis'), --	Arthritis
('N05zL', 'efiArthritis'), --	Arthritis
('N06z.', 'efiArthritis'), --	Arthritis
('N06z5', 'efiArthritis'), --	Arthritis
('N06z6', 'efiArthritis'), --	Arthritis
('N06zz', 'efiArthritis'), --	Arthritis
('N11..', 'efiArthritis'), --	Arthritis
('N11D.', 'efiArthritis'), --	Arthritis
('Nyu10', 'efiArthritis'), --	Arthritis
('Nyu11', 'efiArthritis'), --	Arthritis
('Nyu12', 'efiArthritis'), --	Arthritis
('Nyu1G', 'efiArthritis'), --	Arthritis
('14AN.', 'efiAf'), --	Atrial fibrillation
('2432.', 'efiAf'), --	Atrial fibrillation
('3272.', 'efiAf'), --	Atrial fibrillation
('3273.', 'efiAf'), --	Atrial fibrillation
('662S.', 'efiAf'), --	Atrial fibrillation
('6A9..', 'efiAf'), --	Atrial fibrillation
('7936A', 'efiAf'), --	Atrial fibrillation
('9Os1.', 'efiAf'), --	Atrial fibrillation
('9hF0.', 'efiAf'), --	Atrial fibrillation
('9hF1.', 'efiAf'), --	Atrial fibrillation
('G573.', 'efiAf'), --	Atrial fibrillation
('G5730', 'efiAf'), --	Atrial fibrillation
('G5731', 'efiAf'), --	Atrial fibrillation
('G5732', 'efiAf'), --	Atrial fibrillation
('G5733', 'efiAf'), --	Atrial fibrillation
('G5734', 'efiAf'), --	Atrial fibrillation
('G5735', 'efiAf'), --	Atrial fibrillation
('G573z', 'efiAf'), --	Atrial fibrillation
('14A7.', 'efiCvd'), --	Cerebrovascular disease
('14AB.', 'efiCvd'), --	Cerebrovascular disease
('14AK.', 'efiCvd'), --	Cerebrovascular disease
('662M.', 'efiCvd'), --	Cerebrovascular disease
('662e.', 'efiCvd'), --	Cerebrovascular disease
('662o.', 'efiCvd'), --	Cerebrovascular disease
('7P242', 'efiCvd'), --	Cerebrovascular disease
('8HBJ.', 'efiCvd'), --	Cerebrovascular disease
('8HHM.', 'efiCvd'), --	Cerebrovascular disease
('8HTQ.', 'efiCvd'), --	Cerebrovascular disease
('9N0p.', 'efiCvd'), --	Cerebrovascular disease
('9N4X.', 'efiCvd'), --	Cerebrovascular disease
('9Om1.', 'efiCvd'), --	Cerebrovascular disease
('9Om2.', 'efiCvd'), --	Cerebrovascular disease
('9Om3.', 'efiCvd'), --	Cerebrovascular disease
('9Om4.', 'efiCvd'), --	Cerebrovascular disease
('9h21.', 'efiCvd'), --	Cerebrovascular disease
('9h22.', 'efiCvd'), --	Cerebrovascular disease
('F4236', 'efiCvd'), --	Cerebrovascular disease
('G6...', 'efiCvd'), --	Cerebrovascular disease
('G61..', 'efiCvd'), --	Cerebrovascular disease
('G621.', 'efiCvd'), --	Cerebrovascular disease
('G622.', 'efiCvd'), --	Cerebrovascular disease
('G631.', 'efiCvd'), --	Cerebrovascular disease
('G634.', 'efiCvd'), --	Cerebrovascular disease
('G64..', 'efiCvd'), --	Cerebrovascular disease
('G640.', 'efiCvd'), --	Cerebrovascular disease
('G65..', 'efiCvd'), --	Cerebrovascular disease
('G65y.', 'efiCvd'), --	Cerebrovascular disease
('G65z.', 'efiCvd'), --	Cerebrovascular disease
('G65z1', 'efiCvd'), --	Cerebrovascular disease
('G65zz', 'efiCvd'), --	Cerebrovascular disease
('G66..', 'efiCvd'), --	Cerebrovascular disease
('G663.', 'efiCvd'), --	Cerebrovascular disease
('G664.', 'efiCvd'), --	Cerebrovascular disease
('G667.', 'efiCvd'), --	Cerebrovascular disease
('G670.', 'efiCvd'), --	Cerebrovascular disease
('G6711', 'efiCvd'), --	Cerebrovascular disease
('G682.', 'efiCvd'), --	Cerebrovascular disease
('G68X.', 'efiCvd'), --	Cerebrovascular disease
('Gyu6.', 'efiCvd'), --	Cerebrovascular disease
('Gyu6B', 'efiCvd'), --	Cerebrovascular disease
('Gyu6C', 'efiCvd'), --	Cerebrovascular disease
('S62..', 'efiCvd'), --	Cerebrovascular disease
('S620.', 'efiCvd'), --	Cerebrovascular disease
('S622.', 'efiCvd'), --	Cerebrovascular disease
('S627.', 'efiCvd'), --	Cerebrovascular disease
('S628.', 'efiCvd'), --	Cerebrovascular disease
('S629.', 'efiCvd'), --	Cerebrovascular disease
('S6290', 'efiCvd'), --	Cerebrovascular disease
('1Z1..', 'efiCkd'), --	Chronic kidney disease
('1Z12.', 'efiCkd'), --	Chronic kidney disease
('1Z13.', 'efiCkd'), --	Chronic kidney disease
('1Z14.', 'efiCkd'), --	Chronic kidney disease
('1Z15.', 'efiCkd'), --	Chronic kidney disease
('1Z16.', 'efiCkd'), --	Chronic kidney disease
('1Z1B.', 'efiCkd'), --	Chronic kidney disease
('1Z1C.', 'efiCkd'), --	Chronic kidney disease
('1Z1D.', 'efiCkd'), --	Chronic kidney disease
('1Z1E.', 'efiCkd'), --	Chronic kidney disease
('1Z1F.', 'efiCkd'), --	Chronic kidney disease
('1Z1G.', 'efiCkd'), --	Chronic kidney disease
('1Z1H.', 'efiCkd'), --	Chronic kidney disease
('1Z1J.', 'efiCkd'), --	Chronic kidney disease
('1Z1K.', 'efiCkd'), --	Chronic kidney disease
('1Z1L.', 'efiCkd'), --	Chronic kidney disease
('4677.', 'efiCkd'), --	Chronic kidney disease
('6AA..', 'efiCkd'), --	Chronic kidney disease
('9hE0.', 'efiCkd'), --	Chronic kidney disease
('9hE1.', 'efiCkd'), --	Chronic kidney disease
('C104.', 'efiCkd'), --	Chronic kidney disease
('C104y', 'efiCkd'), --	Chronic kidney disease
('C104z', 'efiCkd'), --	Chronic kidney disease
('C1080', 'efiCkd'), --	Chronic kidney disease
('C108D', 'efiCkd'), --	Chronic kidney disease
('C1090', 'efiCkd'), --	Chronic kidney disease
('C1093', 'efiCkd'), --	Chronic kidney disease
('C109C', 'efiCkd'), --	Chronic kidney disease
('C10E0', 'efiCkd'), --	Chronic kidney disease
('C10ED', 'efiCkd'), --	Chronic kidney disease
('C10EK', 'efiCkd'), --	Chronic kidney disease
('C10EL', 'efiCkd'), --	Chronic kidney disease
('C10F0', 'efiCkd'), --	Chronic kidney disease
('C10F3', 'efiCkd'), --	Chronic kidney disease
('C10FC', 'efiCkd'), --	Chronic kidney disease
('C10FL', 'efiCkd'), --	Chronic kidney disease
('C10FM', 'efiCkd'), --	Chronic kidney disease
('Cyu23', 'efiCkd'), --	Chronic kidney disease
('K05..', 'efiCkd'), --	Chronic kidney disease
('K050.', 'efiCkd'), --	Chronic kidney disease
('PD13.', 'efiCkd'), --	Chronic kidney disease
('R110.', 'efiCkd'), --	Chronic kidney disease
('2BBR.', 'efiDm'), --	Diabetes
('2BBS.', 'efiDm'), --	Diabetes
('2BBT.', 'efiDm'), --	Diabetes
('2G5L.', 'efiDm'), --	Diabetes
('42W3.', 'efiDm'), --	Diabetes
('42c..', 'efiDm'), --	Diabetes
('66A..', 'efiDm'), --	Diabetes
('66A4.', 'efiDm'), --	Diabetes
('66A5.', 'efiDm'), --	Diabetes
('66AD.', 'efiDm'), --	Diabetes
('66AH0', 'efiDm'), --	Diabetes
('66AJ.', 'efiDm'), --	Diabetes
('66AR.', 'efiDm'), --	Diabetes
('66AS.', 'efiDm'), --	Diabetes
('66AU.', 'efiDm'), --	Diabetes
('66AZ.', 'efiDm'), --	Diabetes
('66Ab.', 'efiDm'), --	Diabetes
('66Ac.', 'efiDm'), --	Diabetes
('66Ai.', 'efiDm'), --	Diabetes
('66Aq.', 'efiDm'), --	Diabetes
('68A7.', 'efiDm'), --	Diabetes
('8A17.', 'efiDm'), --	Diabetes
('8BL2.', 'efiDm'), --	Diabetes
('8CR2.', 'efiDm'), --	Diabetes
('8H7f.', 'efiDm'), --	Diabetes
('8HBG.', 'efiDm'), --	Diabetes
('8HBH.', 'efiDm'), --	Diabetes
('8Hl1.', 'efiDm'), --	Diabetes
('9NND.', 'efiDm'), --	Diabetes
('9OL1.', 'efiDm'), --	Diabetes
('9OLD.', 'efiDm'), --	Diabetes
('9h4..', 'efiDm'), --	Diabetes
('9h41.', 'efiDm'), --	Diabetes
('9h42.', 'efiDm'), --	Diabetes
('C10..', 'efiDm'), --	Diabetes
('C100.', 'efiDm'), --	Diabetes
('C1000', 'efiDm'), --	Diabetes
('C1001', 'efiDm'), --	Diabetes
('C100z', 'efiDm'), --	Diabetes
('C101.', 'efiDm'), --	Diabetes
('C1010', 'efiDm'), --	Diabetes
('C1011', 'efiDm'), --	Diabetes
('C101y', 'efiDm'), --	Diabetes
('C101z', 'efiDm'), --	Diabetes
('C102.', 'efiDm'), --	Diabetes
('C102z', 'efiDm'), --	Diabetes
('C103.', 'efiDm'), --	Diabetes
('C1030', 'efiDm'), --	Diabetes
('C1031', 'efiDm'), --	Diabetes
('C103y', 'efiDm'), --	Diabetes
('C104.', 'efiDm'), --	Diabetes
('C104y', 'efiDm'), --	Diabetes
('C104z', 'efiDm'), --	Diabetes
('C105.', 'efiDm'), --	Diabetes
('C105y', 'efiDm'), --	Diabetes
('C105z', 'efiDm'), --	Diabetes
('C106.', 'efiDm'), --	Diabetes
('C1061', 'efiDm'), --	Diabetes
('C106y', 'efiDm'), --	Diabetes
('C106z', 'efiDm'), --	Diabetes
('C107.', 'efiDm'), --	Diabetes
('C107z', 'efiDm'), --	Diabetes
('C108.', 'efiDm'), --	Diabetes
('C1080', 'efiDm'), --	Diabetes
('C1081', 'efiDm'), --	Diabetes
('C1082', 'efiDm'), --	Diabetes
('C1083', 'efiDm'), --	Diabetes
('C1085', 'efiDm'), --	Diabetes
('C1086', 'efiDm'), --	Diabetes
('C1087', 'efiDm'), --	Diabetes
('C1088', 'efiDm'), --	Diabetes
('C1089', 'efiDm'), --	Diabetes
('C108A', 'efiDm'), --	Diabetes
('C108B', 'efiDm'), --	Diabetes
('C108C', 'efiDm'), --	Diabetes
('C108D', 'efiDm'), --	Diabetes
('C108E', 'efiDm'), --	Diabetes
('C108F', 'efiDm'), --	Diabetes
('C108J', 'efiDm'), --	Diabetes
('C108y', 'efiDm'), --	Diabetes
('C108z', 'efiDm'), --	Diabetes
('C109.', 'efiDm'), --	Diabetes
('C1090', 'efiDm'), --	Diabetes
('C1091', 'efiDm'), --	Diabetes
('C1092', 'efiDm'), --	Diabetes
('C1093', 'efiDm'), --	Diabetes
('C1094', 'efiDm'), --	Diabetes
('C1095', 'efiDm'), --	Diabetes
('C1096', 'efiDm'), --	Diabetes
('C1097', 'efiDm'), --	Diabetes
('C1099', 'efiDm'), --	Diabetes
('C109A', 'efiDm'), --	Diabetes
('C109B', 'efiDm'), --	Diabetes
('C109C', 'efiDm'), --	Diabetes
('C109D', 'efiDm'), --	Diabetes
('C109E', 'efiDm'), --	Diabetes
('C109F', 'efiDm'), --	Diabetes
('C109G', 'efiDm'), --	Diabetes
('C109H', 'efiDm'), --	Diabetes
('C109J', 'efiDm'), --	Diabetes
('C10A1', 'efiDm'), --	Diabetes
('C10B0', 'efiDm'), --	Diabetes
('C10C.', 'efiDm'), --	Diabetes
('C10D.', 'efiDm'), --	Diabetes
('C10E.', 'efiDm'), --	Diabetes
('C10E0', 'efiDm'), --	Diabetes
('C10E1', 'efiDm'), --	Diabetes
('C10E2', 'efiDm'), --	Diabetes
('C10E3', 'efiDm'), --	Diabetes
('C10E5', 'efiDm'), --	Diabetes
('C10E6', 'efiDm'), --	Diabetes
('C10E7', 'efiDm'), --	Diabetes
('C10E8', 'efiDm'), --	Diabetes
('C10E9', 'efiDm'), --	Diabetes
('C10EA', 'efiDm'), --	Diabetes
('C10EB', 'efiDm'), --	Diabetes
('C10EC', 'efiDm'), --	Diabetes
('C10ED', 'efiDm'), --	Diabetes
('C10EE', 'efiDm'), --	Diabetes
('C10EF', 'efiDm'), --	Diabetes
('C10EJ', 'efiDm'), --	Diabetes
('C10EK', 'efiDm'), --	Diabetes
('C10EL', 'efiDm'), --	Diabetes
('C10EM', 'efiDm'), --	Diabetes
('C10EN', 'efiDm'), --	Diabetes
('C10EP', 'efiDm'), --	Diabetes
('C10EQ', 'efiDm'), --	Diabetes
('C10ER', 'efiDm'), --	Diabetes
('C10F.', 'efiDm'), --	Diabetes
('C10F0', 'efiDm'), --	Diabetes
('C10F1', 'efiDm'), --	Diabetes
('C10F2', 'efiDm'), --	Diabetes
('C10F3', 'efiDm'), --	Diabetes
('C10F4', 'efiDm'), --	Diabetes
('C10F5', 'efiDm'), --	Diabetes
('C10F6', 'efiDm'), --	Diabetes
('C10F7', 'efiDm'), --	Diabetes
('C10F9', 'efiDm'), --	Diabetes
('C10FA', 'efiDm'), --	Diabetes
('C10FB', 'efiDm'), --	Diabetes
('C10FC', 'efiDm'), --	Diabetes
('C10FD', 'efiDm'), --	Diabetes
('C10FE', 'efiDm'), --	Diabetes
('C10FF', 'efiDm'), --	Diabetes
('C10FG', 'efiDm'), --	Diabetes
('C10FH', 'efiDm'), --	Diabetes
('C10FJ', 'efiDm'), --	Diabetes
('C10FL', 'efiDm'), --	Diabetes
('C10FM', 'efiDm'), --	Diabetes
('C10FN', 'efiDm'), --	Diabetes
('C10FP', 'efiDm'), --	Diabetes
('C10FQ', 'efiDm'), --	Diabetes
('C10FR', 'efiDm'), --	Diabetes
('C10H.', 'efiDm'), --	Diabetes
('C10y.', 'efiDm'), --	Diabetes
('C10yy', 'efiDm'), --	Diabetes
('C10z.', 'efiDm'), --	Diabetes
('C10zz', 'efiDm'), --	Diabetes
('Cyu2.', 'efiDm'), --	Diabetes
('Cyu23', 'efiDm'), --	Diabetes
('F1711', 'efiDm'), --	Diabetes
('F372.', 'efiDm'), --	Diabetes
('F3720', 'efiDm'), --	Diabetes
('F3721', 'efiDm'), --	Diabetes
('F3722', 'efiDm'), --	Diabetes
('F3813', 'efiDm'), --	Diabetes
('F3y0.', 'efiDm'), --	Diabetes
('F420.', 'efiDm'), --	Diabetes
('F4200', 'efiDm'), --	Diabetes
('F4204', 'efiDm'), --	Diabetes
('F4206', 'efiDm'), --	Diabetes
('F420z', 'efiDm'), --	Diabetes
('F42y9', 'efiDm'), --	Diabetes
('F4640', 'efiDm'), --	Diabetes
('M2710', 'efiDm'), --	Diabetes
('1491.', 'efiDizzy'), --	Dizziness
('1B5..', 'efiDizzy'), --	Dizziness
('1B53.', 'efiDizzy'), --	Dizziness
('F56..', 'efiDizzy'), --	Dizziness
('F561.', 'efiDizzy'), --	Dizziness
('F5610', 'efiDizzy'), --	Dizziness
('F5611', 'efiDizzy'), --	Dizziness
('F5614', 'efiDizzy'), --	Dizziness
('F561z', 'efiDizzy'), --	Dizziness
('F562.', 'efiDizzy'), --	Dizziness
('F562z', 'efiDizzy'), --	Dizziness
('FyuQ1', 'efiDizzy'), --	Dizziness
('R004.', 'efiDizzy'), --	Dizziness
('R0040', 'efiDizzy'), --	Dizziness
('R0043', 'efiDizzy'), --	Dizziness
('R0044', 'efiDizzy'), --	Dizziness
('173..', 'efiDyspnoea'), --	Dyspnoea
('1732.', 'efiDyspnoea'), --	Dyspnoea
('1733.', 'efiDyspnoea'), --	Dyspnoea
('1734.', 'efiDyspnoea'), --	Dyspnoea
('1738.', 'efiDyspnoea'), --	Dyspnoea
('1739.', 'efiDyspnoea'), --	Dyspnoea
('173C.', 'efiDyspnoea'), --	Dyspnoea
('173K.', 'efiDyspnoea'), --	Dyspnoea
('173Z.', 'efiDyspnoea'), --	Dyspnoea
('2322.', 'efiDyspnoea'), --	Dyspnoea
('R0608', 'efiDyspnoea'), --	Dyspnoea
('R060A', 'efiDyspnoea'), --	Dyspnoea
('16D..', 'efiFalls'), --	Falls
('16D1.', 'efiFalls'), --	Falls
('8HTl.', 'efiFalls'), --	Falls
('8Hk1.', 'efiFalls'), --	Falls
('8O9..', 'efiFalls'), --	Falls
('R200.', 'efiFalls'), --	Falls
('TC...', 'efiFalls'), --	Falls
('TC5..', 'efiFalls'), --	Falls
('TCz..', 'efiFalls'), --	Falls
('13G8.', 'efiFoot'), --	Foot problems
('9N08.', 'efiFoot'), --	Foot problems
('9N1y7', 'efiFoot'), --	Foot problems
('9N2Q.', 'efiFoot'), --	Foot problems
('M20..', 'efiFoot'), --	Foot problems
('M2000', 'efiFoot'), --	Foot problems
('14G6.', 'efiFracture'), --	Fragility fracture
('14G7.', 'efiFracture'), --	Fragility fracture
('14G8.', 'efiFracture'), --	Fragility fracture
('7K1D0', 'efiFracture'), --	Fragility fracture
('7K1D6', 'efiFracture'), --	Fragility fracture
('7K1H6', 'efiFracture'), --	Fragility fracture
('7K1H8', 'efiFracture'), --	Fragility fracture
('7K1J0', 'efiFracture'), --	Fragility fracture
('7K1J6', 'efiFracture'), --	Fragility fracture
('7K1J8', 'efiFracture'), --	Fragility fracture
('7K1JB', 'efiFracture'), --	Fragility fracture
('7K1JD', 'efiFracture'), --	Fragility fracture
('7K1Jd', 'efiFracture'), --	Fragility fracture
('7K1L4', 'efiFracture'), --	Fragility fracture
('7K1LL', 'efiFracture'), --	Fragility fracture
('7K1Y0', 'efiFracture'), --	Fragility fracture
('N1y1.', 'efiFracture'), --	Fragility fracture
('N331.', 'efiFracture'), --	Fragility fracture
('N3311', 'efiFracture'), --	Fragility fracture
('N331A', 'efiFracture'), --	Fragility fracture
('N331D', 'efiFracture'), --	Fragility fracture
('N331G', 'efiFracture'), --	Fragility fracture
('N331H', 'efiFracture'), --	Fragility fracture
('N331J', 'efiFracture'), --	Fragility fracture
('N331K', 'efiFracture'), --	Fragility fracture
('N331L', 'efiFracture'), --	Fragility fracture
('N331M', 'efiFracture'), --	Fragility fracture
('N331N', 'efiFracture'), --	Fragility fracture
('NyuB0', 'efiFracture'), --	Fragility fracture
('S10..', 'efiFracture'), --	Fragility fracture
('S1000', 'efiFracture'), --	Fragility fracture
('S1005', 'efiFracture'), --	Fragility fracture
('S1006', 'efiFracture'), --	Fragility fracture
('S1007', 'efiFracture'), --	Fragility fracture
('S100H', 'efiFracture'), --	Fragility fracture
('S100K', 'efiFracture'), --	Fragility fracture
('S102.', 'efiFracture'), --	Fragility fracture
('S1020', 'efiFracture'), --	Fragility fracture
('S1021', 'efiFracture'), --	Fragility fracture
('S102y', 'efiFracture'), --	Fragility fracture
('S102z', 'efiFracture'), --	Fragility fracture
('S1031', 'efiFracture'), --	Fragility fracture
('S104.', 'efiFracture'), --	Fragility fracture
('S1040', 'efiFracture'), --	Fragility fracture
('S1041', 'efiFracture'), --	Fragility fracture
('S1042', 'efiFracture'), --	Fragility fracture
('S10A0', 'efiFracture'), --	Fragility fracture
('S10B.', 'efiFracture'), --	Fragility fracture
('S10B0', 'efiFracture'), --	Fragility fracture
('S10B6', 'efiFracture'), --	Fragility fracture
('S112.', 'efiFracture'), --	Fragility fracture
('S114.', 'efiFracture'), --	Fragility fracture
('S1145', 'efiFracture'), --	Fragility fracture
('S15..', 'efiFracture'), --	Fragility fracture
('S150.', 'efiFracture'), --	Fragility fracture
('S1500', 'efiFracture'), --	Fragility fracture
('S23..', 'efiFracture'), --	Fragility fracture
('S234.', 'efiFracture'), --	Fragility fracture
('S2341', 'efiFracture'), --	Fragility fracture
('S2346', 'efiFracture'), --	Fragility fracture
('S2351', 'efiFracture'), --	Fragility fracture
('S23B.', 'efiFracture'), --	Fragility fracture
('S23C.', 'efiFracture'), --	Fragility fracture
('S23x1', 'efiFracture'), --	Fragility fracture
('S23y.', 'efiFracture'), --	Fragility fracture
('S3...', 'efiFracture'), --	Fragility fracture
('S30..', 'efiFracture'), --	Fragility fracture
('S300.', 'efiFracture'), --	Fragility fracture
('S3000', 'efiFracture'), --	Fragility fracture
('S3001', 'efiFracture'), --	Fragility fracture
('S3004', 'efiFracture'), --	Fragility fracture
('S3005', 'efiFracture'), --	Fragility fracture
('S3006', 'efiFracture'), --	Fragility fracture
('S3007', 'efiFracture'), --	Fragility fracture
('S3009', 'efiFracture'), --	Fragility fracture
('S300y', 'efiFracture'), --	Fragility fracture
('S300z', 'efiFracture'), --	Fragility fracture
('S3010', 'efiFracture'), --	Fragility fracture
('S3015', 'efiFracture'), --	Fragility fracture
('S302.', 'efiFracture'), --	Fragility fracture
('S3020', 'efiFracture'), --	Fragility fracture
('S3021', 'efiFracture'), --	Fragility fracture
('S3022', 'efiFracture'), --	Fragility fracture
('S3023', 'efiFracture'), --	Fragility fracture
('S3024', 'efiFracture'), --	Fragility fracture
('S302z', 'efiFracture'), --	Fragility fracture
('S303.', 'efiFracture'), --	Fragility fracture
('S3030', 'efiFracture'), --	Fragility fracture
('S3032', 'efiFracture'), --	Fragility fracture
('S3034', 'efiFracture'), --	Fragility fracture
('S304.', 'efiFracture'), --	Fragility fracture
('S305.', 'efiFracture'), --	Fragility fracture
('S30y.', 'efiFracture'), --	Fragility fracture
('S30z.', 'efiFracture'), --	Fragility fracture
('S31z.', 'efiFracture'), --	Fragility fracture
('S4500', 'efiFracture'), --	Fragility fracture
('S4E..', 'efiFracture'), --	Fragility fracture
('S4E0.', 'efiFracture'), --	Fragility fracture
('S4E1.', 'efiFracture'), --	Fragility fracture
('S4E2.', 'efiFracture'), --	Fragility fracture
('1C12.', 'efiHearing'), --	Hearing impairment
('1C13.', 'efiHearing'), --	Hearing impairment
('1C131', 'efiHearing'), --	Hearing impairment
('1C132', 'efiHearing'), --	Hearing impairment
('1C133', 'efiHearing'), --	Hearing impairment
('1C16.', 'efiHearing'), --	Hearing impairment
('2BM2.', 'efiHearing'), --	Hearing impairment
('2BM3.', 'efiHearing'), --	Hearing impairment
('2BM4.', 'efiHearing'), --	Hearing impairment
('2DG..', 'efiHearing'), --	Hearing impairment
('3134.', 'efiHearing'), --	Hearing impairment
('31340', 'efiHearing'), --	Hearing impairment
('8D2..', 'efiHearing'), --	Hearing impairment
('8E3..', 'efiHearing'), --	Hearing impairment
('8HR2.', 'efiHearing'), --	Hearing impairment
('8HT2.', 'efiHearing'), --	Hearing impairment
('8HT3.', 'efiHearing'), --	Hearing impairment
('Eu446', 'efiHearing'), --	Hearing impairment
('F5801', 'efiHearing'), --	Hearing impairment
('F59..', 'efiHearing'), --	Hearing impairment
('F590.', 'efiHearing'), --	Hearing impairment
('F591.', 'efiHearing'), --	Hearing impairment
('F5912', 'efiHearing'), --	Hearing impairment
('F5915', 'efiHearing'), --	Hearing impairment
('F5916', 'efiHearing'), --	Hearing impairment
('F592.', 'efiHearing'), --	Hearing impairment
('F594.', 'efiHearing'), --	Hearing impairment
('F595.', 'efiHearing'), --	Hearing impairment
('F59z.', 'efiHearing'), --	Hearing impairment
('F5A..', 'efiHearing'), --	Hearing impairment
('ZV532', 'efiHearing'), --	Hearing impairment
('14A6.', 'efiHf'), --	Heart failure
('14AM.', 'efiHf'), --	Heart failure
('1736.', 'efiHf'), --	Heart failure
('1O1..', 'efiHf'), --	Heart failure
('33BA.', 'efiHf'), --	Heart failure
('388D.', 'efiHf'), --	Heart failure
('585f.', 'efiHf'), --	Heart failure
('662T.', 'efiHf'), --	Heart failure
('662W.', 'efiHf'), --	Heart failure
('662g.', 'efiHf'), --	Heart failure
('662h.', 'efiHf'), --	Heart failure
('662p.', 'efiHf'), --	Heart failure
('679X.', 'efiHf'), --	Heart failure
('67D4.', 'efiHf'), --	Heart failure
('8CL3.', 'efiHf'), --	Heart failure
('8H2S.', 'efiHf'), --	Heart failure
('8HBE.', 'efiHf'), --	Heart failure
('8HHb.', 'efiHf'), --	Heart failure
('8HHz.', 'efiHf'), --	Heart failure
('9N0k.', 'efiHf'), --	Heart failure
('9N2p.', 'efiHf'), --	Heart failure
('9N4s.', 'efiHf'), --	Heart failure
('9N4w.', 'efiHf'), --	Heart failure
('9N6T.', 'efiHf'), --	Heart failure
('9Or0.', 'efiHf'), --	Heart failure
('9Or5.', 'efiHf'), --	Heart failure
('9hH0.', 'efiHf'), --	Heart failure
('9hH1.', 'efiHf'), --	Heart failure
('G58..', 'efiHf'), --	Heart failure
('G580.', 'efiHf'), --	Heart failure
('G5800', 'efiHf'), --	Heart failure
('G5801', 'efiHf'), --	Heart failure
('G5804', 'efiHf'), --	Heart failure
('G581.', 'efiHf'), --	Heart failure
('G582.', 'efiHf'), --	Heart failure
('G58z.', 'efiHf'), --	Heart failure
('G5y4z', 'efiHf'), --	Heart failure
('G5yy9', 'efiHf'), --	Heart failure
('SP111', 'efiHf'), --	Heart failure
('G540.', 'efiHeartValve'), --	Heart valve disease
('G5402', 'efiHeartValve'), --	Heart valve disease
('G5415', 'efiHeartValve'), --	Heart valve disease
('G543.', 'efiHeartValve'), --	Heart valve disease
('13CA.', 'efiHousebound'), --	Housebound
('8HL..', 'efiHousebound'), --	Housebound
('9N1C.', 'efiHousebound'), --	Housebound
('9NF..', 'efiHousebound'), --	Housebound
('9NF1.', 'efiHousebound'), --	Housebound
('9NF2.', 'efiHousebound'), --	Housebound
('9NF3.', 'efiHousebound'), --	Housebound
('9NF8.', 'efiHousebound'), --	Housebound
('9NF9.', 'efiHousebound'), --	Housebound
('9NFB.', 'efiHousebound'), --	Housebound
('9NFM.', 'efiHousebound'), --	Housebound
('14A2.', 'efiHtn'), --	Hypertension
('246M.', 'efiHtn'), --	Hypertension
('6627.', 'efiHtn'), --	Hypertension
('6628.', 'efiHtn'), --	Hypertension
('662F.', 'efiHtn'), --	Hypertension
('662O.', 'efiHtn'), --	Hypertension
('662b.', 'efiHtn'), --	Hypertension
('8CR4.', 'efiHtn'), --	Hypertension
('8HT5.', 'efiHtn'), --	Hypertension
('8I3N.', 'efiHtn'), --	Hypertension
('9N03.', 'efiHtn'), --	Hypertension
('9N1y2', 'efiHtn'), --	Hypertension
('9h3..', 'efiHtn'), --	Hypertension
('9h31.', 'efiHtn'), --	Hypertension
('9h32.', 'efiHtn'), --	Hypertension
('F4211', 'efiHtn'), --	Hypertension
('F4213', 'efiHtn'), --	Hypertension
('G2...', 'efiHtn'), --	Hypertension
('G20..', 'efiHtn'), --	Hypertension
('G200.', 'efiHtn'), --	Hypertension
('G201.', 'efiHtn'), --	Hypertension
('G202.', 'efiHtn'), --	Hypertension
('G203.', 'efiHtn'), --	Hypertension
('G20z.', 'efiHtn'), --	Hypertension
('G22z.', 'efiHtn'), --	Hypertension
('G24..', 'efiHtn'), --	Hypertension
('G240.', 'efiHtn'), --	Hypertension
('G240z', 'efiHtn'), --	Hypertension
('G241.', 'efiHtn'), --	Hypertension
('G241z', 'efiHtn'), --	Hypertension
('G244.', 'efiHtn'), --	Hypertension
('G24z.', 'efiHtn'), --	Hypertension
('G24z0', 'efiHtn'), --	Hypertension
('G24z1', 'efiHtn'), --	Hypertension
('G24zz', 'efiHtn'), --	Hypertension
('G2z..', 'efiHtn'), --	Hypertension
('Gyu20', 'efiHtn'), --	Hypertension
('Gyu21', 'efiHtn'), --	Hypertension
('1B55.', 'efiHypotension'), --	Hypotension / syncope
('1B6..', 'efiHypotension'), --	Hypotension / syncope
('1B62.', 'efiHypotension'), --	Hypotension / syncope
('1B65.', 'efiHypotension'), --	Hypotension / syncope
('1B68.', 'efiHypotension'), --	Hypotension / syncope
('79370', 'efiHypotension'), --	Hypotension / syncope
('F1303', 'efiHypotension'), --	Hypotension / syncope
('G87..', 'efiHypotension'), --	Hypotension / syncope
('G870.', 'efiHypotension'), --	Hypotension / syncope
('G871.', 'efiHypotension'), --	Hypotension / syncope
('G872.', 'efiHypotension'), --	Hypotension / syncope
('G873.', 'efiHypotension'), --	Hypotension / syncope
('G87z.', 'efiHypotension'), --	Hypotension / syncope
('R002.', 'efiHypotension'), --	Hypotension / syncope
('R0021', 'efiHypotension'), --	Hypotension / syncope
('R0022', 'efiHypotension'), --	Hypotension / syncope
('R0023', 'efiHypotension'), --	Hypotension / syncope
('R0042', 'efiHypotension'), --	Hypotension / syncope
('14A..', 'efiIhd'), --	Ischaemic heart disease
('14A4.', 'efiIhd'), --	Ischaemic heart disease
('14A5.', 'efiIhd'), --	Ischaemic heart disease
('182..', 'efiIhd'), --	Ischaemic heart disease
('322..', 'efiIhd'), --	Ischaemic heart disease
('3222.', 'efiIhd'), --	Ischaemic heart disease
('322Z.', 'efiIhd'), --	Ischaemic heart disease
('662K0', 'efiIhd'), --	Ischaemic heart disease
('662K1', 'efiIhd'), --	Ischaemic heart disease
('662K3', 'efiIhd'), --	Ischaemic heart disease
('6A2..', 'efiIhd'), --	Ischaemic heart disease
('6A4..', 'efiIhd'), --	Ischaemic heart disease
('792..', 'efiIhd'), --	Ischaemic heart disease
('7928.', 'efiIhd'), --	Ischaemic heart disease
('79294', 'efiIhd'), --	Ischaemic heart disease
('889A.', 'efiIhd'), --	Ischaemic heart disease
('8H2V.', 'efiIhd'), --	Ischaemic heart disease
('8I3z.', 'efiIhd'), --	Ischaemic heart disease
('G3...', 'efiIhd'), --	Ischaemic heart disease
('G30..', 'efiIhd'), --	Ischaemic heart disease
('G3071', 'efiIhd'), --	Ischaemic heart disease
('G308.', 'efiIhd'), --	Ischaemic heart disease
('G30y.', 'efiIhd'), --	Ischaemic heart disease
('G30yz', 'efiIhd'), --	Ischaemic heart disease
('G30z.', 'efiIhd'), --	Ischaemic heart disease
('G31..', 'efiIhd'), --	Ischaemic heart disease
('G311.', 'efiIhd'), --	Ischaemic heart disease
('G3111', 'efiIhd'), --	Ischaemic heart disease
('G31y2', 'efiIhd'), --	Ischaemic heart disease
('G31y3', 'efiIhd'), --	Ischaemic heart disease
('G31yz', 'efiIhd'), --	Ischaemic heart disease
('G32..', 'efiIhd'), --	Ischaemic heart disease
('G33..', 'efiIhd'), --	Ischaemic heart disease
('G332.', 'efiIhd'), --	Ischaemic heart disease
('G33z.', 'efiIhd'), --	Ischaemic heart disease
('G33z3', 'efiIhd'), --	Ischaemic heart disease
('G33z4', 'efiIhd'), --	Ischaemic heart disease
('G33z7', 'efiIhd'), --	Ischaemic heart disease
('G33zz', 'efiIhd'), --	Ischaemic heart disease
('G34..', 'efiIhd'), --	Ischaemic heart disease
('G340.', 'efiIhd'), --	Ischaemic heart disease
('G344.', 'efiIhd'), --	Ischaemic heart disease
('G34y0', 'efiIhd'), --	Ischaemic heart disease
('G34y1', 'efiIhd'), --	Ischaemic heart disease
('G34yz', 'efiIhd'), --	Ischaemic heart disease
('G34z.', 'efiIhd'), --	Ischaemic heart disease
('G36..', 'efiIhd'), --	Ischaemic heart disease
('G361.', 'efiIhd'), --	Ischaemic heart disease
('G362.', 'efiIhd'), --	Ischaemic heart disease
('G37..', 'efiIhd'), --	Ischaemic heart disease
('G3y..', 'efiIhd'), --	Ischaemic heart disease
('G3z..', 'efiIhd'), --	Ischaemic heart disease
('Gyu3.', 'efiIhd'), --	Ischaemic heart disease
('G3...', 'efiIhd'), --	Ischaemic heart disease
('Gyu30', 'efiIhd'), --	Ischaemic heart disease
('1461.', 'efiMemo'), --	Memory & cognitive problems
('1B1A.', 'efiMemo'), --	Memory & cognitive problems
('1S21.', 'efiMemo'), --	Memory & cognitive problems
('2841.', 'efiMemo'), --	Memory & cognitive problems
('28E..', 'efiMemo'), --	Memory & cognitive problems
('3A10.', 'efiMemo'), --	Memory & cognitive problems
('3A20.', 'efiMemo'), --	Memory & cognitive problems
('3A30.', 'efiMemo'), --	Memory & cognitive problems
('3A40.', 'efiMemo'), --	Memory & cognitive problems
('3A50.', 'efiMemo'), --	Memory & cognitive problems
('3A60.', 'efiMemo'), --	Memory & cognitive problems
('3A70.', 'efiMemo'), --	Memory & cognitive problems
('3A80.', 'efiMemo'), --	Memory & cognitive problems
('3A91.', 'efiMemo'), --	Memory & cognitive problems
('3AA1.', 'efiMemo'), --	Memory & cognitive problems
('3AE..', 'efiMemo'), --	Memory & cognitive problems
('66h..', 'efiMemo'), --	Memory & cognitive problems
('6AB..', 'efiMemo'), --	Memory & cognitive problems
('8HTY.', 'efiMemo'), --	Memory & cognitive problems
('9NdL.', 'efiMemo'), --	Memory & cognitive problems
('9Nk1.', 'efiMemo'), --	Memory & cognitive problems
('9Ou..', 'efiMemo'), --	Memory & cognitive problems
('9Ou2.', 'efiMemo'), --	Memory & cognitive problems
('9Ou3.', 'efiMemo'), --	Memory & cognitive problems
('9Ou4.', 'efiMemo'), --	Memory & cognitive problems
('9Ou5.', 'efiMemo'), --	Memory & cognitive problems
('9hD..', 'efiMemo'), --	Memory & cognitive problems
('9hD0.', 'efiMemo'), --	Memory & cognitive problems
('9hD1.', 'efiMemo'), --	Memory & cognitive problems
('E00..', 'efiMemo'), --	Memory & cognitive problems
('E000.', 'efiMemo'), --	Memory & cognitive problems
('E001.', 'efiMemo'), --	Memory & cognitive problems
('E0010', 'efiMemo'), --	Memory & cognitive problems
('E0011', 'efiMemo'), --	Memory & cognitive problems
('E0012', 'efiMemo'), --	Memory & cognitive problems
('E0013', 'efiMemo'), --	Memory & cognitive problems
('E001z', 'efiMemo'), --	Memory & cognitive problems
('E002.', 'efiMemo'), --	Memory & cognitive problems
('E0020', 'efiMemo'), --	Memory & cognitive problems
('E0021', 'efiMemo'), --	Memory & cognitive problems
('E002z', 'efiMemo'), --	Memory & cognitive problems
('E003.', 'efiMemo'), --	Memory & cognitive problems
('E004.', 'efiMemo'), --	Memory & cognitive problems
('E0040', 'efiMemo'), --	Memory & cognitive problems
('E0041', 'efiMemo'), --	Memory & cognitive problems
('E0042', 'efiMemo'), --	Memory & cognitive problems
('E0043', 'efiMemo'), --	Memory & cognitive problems
('E004z', 'efiMemo'), --	Memory & cognitive problems
('E012.', 'efiMemo'), --	Memory & cognitive problems
('E041.', 'efiMemo'), --	Memory & cognitive problems
('E2A10', 'efiMemo'), --	Memory & cognitive problems
('E2A11', 'efiMemo'), --	Memory & cognitive problems
('Eu00.', 'efiMemo'), --	Memory & cognitive problems
('Eu000', 'efiMemo'), --	Memory & cognitive problems
('Eu001', 'efiMemo'), --	Memory & cognitive problems
('Eu002', 'efiMemo'), --	Memory & cognitive problems
('Eu00z', 'efiMemo'), --	Memory & cognitive problems
('Eu01.', 'efiMemo'), --	Memory & cognitive problems
('Eu010', 'efiMemo'), --	Memory & cognitive problems
('Eu011', 'efiMemo'), --	Memory & cognitive problems
('Eu012', 'efiMemo'), --	Memory & cognitive problems
('Eu013', 'efiMemo'), --	Memory & cognitive problems
('Eu01y', 'efiMemo'), --	Memory & cognitive problems
('Eu01z', 'efiMemo'), --	Memory & cognitive problems
('Eu02.', 'efiMemo'), --	Memory & cognitive problems
('Eu020', 'efiMemo'), --	Memory & cognitive problems
('Eu021', 'efiMemo'), --	Memory & cognitive problems
('Eu022', 'efiMemo'), --	Memory & cognitive problems
('Eu023', 'efiMemo'), --	Memory & cognitive problems
('Eu024', 'efiMemo'), --	Memory & cognitive problems
('Eu025', 'efiMemo'), --	Memory & cognitive problems
('Eu02y', 'efiMemo'), --	Memory & cognitive problems
('Eu02z', 'efiMemo'), --	Memory & cognitive problems
('Eu041', 'efiMemo'), --	Memory & cognitive problems
('Eu057', 'efiMemo'), --	Memory & cognitive problems
('F110.', 'efiMemo'), --	Memory & cognitive problems
('F1100', 'efiMemo'), --	Memory & cognitive problems
('F1101', 'efiMemo'), --	Memory & cognitive problems
('F116.', 'efiMemo'), --	Memory & cognitive problems
('F21y2', 'efiMemo'), --	Memory & cognitive problems
('R00z0', 'efiMemo'); --	Memory & cognitive problems

insert into codeGroups
values
('1381.', 'efiMobility'), --	Mobility and transfer problems
('13C2.', 'efiMobility'), --	Mobility and transfer problems
('13C4.', 'efiMobility'), --	Mobility and transfer problems
('13CD.', 'efiMobility'), --	Mobility and transfer problems
('13CE.', 'efiMobility'), --	Mobility and transfer problems
('398A.', 'efiMobility'), --	Mobility and transfer problems
('39B..', 'efiMobility'), --	Mobility and transfer problems
('8D4..', 'efiMobility'), --	Mobility and transfer problems
('8O15.', 'efiMobility'), --	Mobility and transfer problems
('N097.', 'efiMobility'), --	Mobility and transfer problems
('ZV4L0', 'efiMobility'), --	Mobility and transfer problems
('14OD.', 'efiOsteoporosis'), --	Osteoporosis
('56812', 'efiOsteoporosis'), --	Osteoporosis
('58EN.', 'efiOsteoporosis'), --	Osteoporosis
('66a..', 'efiOsteoporosis'), --	Osteoporosis
('66a2.', 'efiOsteoporosis'), --	Osteoporosis
('66a3.', 'efiOsteoporosis'), --	Osteoporosis
('66a4.', 'efiOsteoporosis'), --	Osteoporosis
('66a5.', 'efiOsteoporosis'), --	Osteoporosis
('66a6.', 'efiOsteoporosis'), --	Osteoporosis
('66a7.', 'efiOsteoporosis'), --	Osteoporosis
('66a8.', 'efiOsteoporosis'), --	Osteoporosis
('66a9.', 'efiOsteoporosis'), --	Osteoporosis
('66aA.', 'efiOsteoporosis'), --	Osteoporosis
('66aE.', 'efiOsteoporosis'), --	Osteoporosis
('8HTS.', 'efiOsteoporosis'), --	Osteoporosis
('9N0h.', 'efiOsteoporosis'), --	Osteoporosis
('9Od0.', 'efiOsteoporosis'), --	Osteoporosis
('9Od2.', 'efiOsteoporosis'), --	Osteoporosis
('N330.', 'efiOsteoporosis'), --	Osteoporosis
('N3300', 'efiOsteoporosis'), --	Osteoporosis
('N3301', 'efiOsteoporosis'), --	Osteoporosis
('N3302', 'efiOsteoporosis'), --	Osteoporosis
('N3303', 'efiOsteoporosis'), --	Osteoporosis
('N3304', 'efiOsteoporosis'), --	Osteoporosis
('N3305', 'efiOsteoporosis'), --	Osteoporosis
('N3306', 'efiOsteoporosis'), --	Osteoporosis
('N3307', 'efiOsteoporosis'), --	Osteoporosis
('N3308', 'efiOsteoporosis'), --	Osteoporosis
('N330A', 'efiOsteoporosis'), --	Osteoporosis
('N330B', 'efiOsteoporosis'), --	Osteoporosis
('N330C', 'efiOsteoporosis'), --	Osteoporosis
('N330D', 'efiOsteoporosis'), --	Osteoporosis
('N330z', 'efiOsteoporosis'), --	Osteoporosis
('N3312', 'efiOsteoporosis'), --	Osteoporosis
('N3315', 'efiOsteoporosis'), --	Osteoporosis
('N3316', 'efiOsteoporosis'), --	Osteoporosis
('N3318', 'efiOsteoporosis'), --	Osteoporosis
('N3319', 'efiOsteoporosis'), --	Osteoporosis
('N331B', 'efiOsteoporosis'), --	Osteoporosis
('N331L', 'efiOsteoporosis'), --	Osteoporosis
('N3370', 'efiOsteoporosis'), --	Osteoporosis
('NyuB0', 'efiOsteoporosis'), --	Osteoporosis
('NyuB1', 'efiOsteoporosis'), --	Osteoporosis
('NyuB8', 'efiOsteoporosis'), --	Osteoporosis
('NyuBC', 'efiOsteoporosis'), --	Osteoporosis
('297A.', 'efiParkinson'), --	Parkinsonism & tremor
('2987.', 'efiParkinson'), --	Parkinsonism & tremor
('2994.', 'efiParkinson'), --	Parkinsonism & tremor
('A94y1', 'efiParkinson'), --	Parkinsonism & tremor
('F116.', 'efiParkinson'), --	Parkinsonism & tremor
('F11x9', 'efiParkinson'), --	Parkinsonism & tremor
('F12..', 'efiParkinson'), --	Parkinsonism & tremor
('F120.', 'efiParkinson'), --	Parkinsonism & tremor
('F121.', 'efiParkinson'), --	Parkinsonism & tremor
('F12W.', 'efiParkinson'), --	Parkinsonism & tremor
('F12X.', 'efiParkinson'), --	Parkinsonism & tremor
('F12z.', 'efiParkinson'), --	Parkinsonism & tremor
('F13..', 'efiParkinson'), --	Parkinsonism & tremor
('F1303', 'efiParkinson'), --	Parkinsonism & tremor
('Fyu20', 'efiParkinson'), --	Parkinsonism & tremor
('Fyu21', 'efiParkinson'), --	Parkinsonism & tremor
('Fyu22', 'efiParkinson'), --	Parkinsonism & tremor
('Fyu29', 'efiParkinson'), --	Parkinsonism & tremor
('Fyu2B', 'efiParkinson'), --	Parkinsonism & tremor
('R0103', 'efiParkinson'), --	Parkinsonism & tremor
('TJ64.', 'efiParkinson'), --	Parkinsonism & tremor
('U6067', 'efiParkinson'), --	Parkinsonism & tremor
('14C1.', 'efiPeptic'), --	Peptic ulcer
('1956.', 'efiPeptic'), --	Peptic ulcer
('76121', 'efiPeptic'), --	Peptic ulcer
('761D5', 'efiPeptic'), --	Peptic ulcer
('761D6', 'efiPeptic'), --	Peptic ulcer
('761J.', 'efiPeptic'), --	Peptic ulcer
('761J0', 'efiPeptic'), --	Peptic ulcer
('761J1', 'efiPeptic'), --	Peptic ulcer
('761Jy', 'efiPeptic'), --	Peptic ulcer
('761Jz', 'efiPeptic'), --	Peptic ulcer
('7627.', 'efiPeptic'), --	Peptic ulcer
('76270', 'efiPeptic'), --	Peptic ulcer
('76271', 'efiPeptic'), --	Peptic ulcer
('76272', 'efiPeptic'), --	Peptic ulcer
('7627y', 'efiPeptic'), --	Peptic ulcer
('7627z', 'efiPeptic'), --	Peptic ulcer
('J1016', 'efiPeptic'), --	Peptic ulcer
('J1020', 'efiPeptic'), --	Peptic ulcer
('J11..', 'efiPeptic'), --	Peptic ulcer
('J110.', 'efiPeptic'), --	Peptic ulcer
('J1100', 'efiPeptic'), --	Peptic ulcer
('J1101', 'efiPeptic'), --	Peptic ulcer
('J1102', 'efiPeptic'), --	Peptic ulcer
('J1103', 'efiPeptic'), --	Peptic ulcer
('J1104', 'efiPeptic'), --	Peptic ulcer
('J110y', 'efiPeptic'), --	Peptic ulcer
('J110z', 'efiPeptic'), --	Peptic ulcer
('J111.', 'efiPeptic'), --	Peptic ulcer
('J1110', 'efiPeptic'), --	Peptic ulcer
('J1111', 'efiPeptic'), --	Peptic ulcer
('J1112', 'efiPeptic'), --	Peptic ulcer
('J1114', 'efiPeptic'), --	Peptic ulcer
('J111y', 'efiPeptic'), --	Peptic ulcer
('J111z', 'efiPeptic'), --	Peptic ulcer
('J112.', 'efiPeptic'), --	Peptic ulcer
('J113.', 'efiPeptic'), --	Peptic ulcer
('J113z', 'efiPeptic'), --	Peptic ulcer
('J11y.', 'efiPeptic'), --	Peptic ulcer
('J11y0', 'efiPeptic'), --	Peptic ulcer
('J11y1', 'efiPeptic'), --	Peptic ulcer
('J11y2', 'efiPeptic'), --	Peptic ulcer
('J11yz', 'efiPeptic'), --	Peptic ulcer
('J11z.', 'efiPeptic'), --	Peptic ulcer
('J12..', 'efiPeptic'), --	Peptic ulcer
('J120.', 'efiPeptic'), --	Peptic ulcer
('J1200', 'efiPeptic'), --	Peptic ulcer
('J1201', 'efiPeptic'), --	Peptic ulcer
('J1202', 'efiPeptic'), --	Peptic ulcer
('J1203', 'efiPeptic'), --	Peptic ulcer
('J120y', 'efiPeptic'), --	Peptic ulcer
('J120z', 'efiPeptic'), --	Peptic ulcer
('J121.', 'efiPeptic'), --	Peptic ulcer
('J1210', 'efiPeptic'), --	Peptic ulcer
('J1211', 'efiPeptic'), --	Peptic ulcer
('J1212', 'efiPeptic'), --	Peptic ulcer
('J1213', 'efiPeptic'), --	Peptic ulcer
('J1214', 'efiPeptic'), --	Peptic ulcer
('J121y', 'efiPeptic'), --	Peptic ulcer
('J121z', 'efiPeptic'), --	Peptic ulcer
('J122.', 'efiPeptic'), --	Peptic ulcer
('J124.', 'efiPeptic'), --	Peptic ulcer
('J125.', 'efiPeptic'), --	Peptic ulcer
('J126.', 'efiPeptic'), --	Peptic ulcer
('J126z', 'efiPeptic'), --	Peptic ulcer
('J12y.', 'efiPeptic'), --	Peptic ulcer
('J12y0', 'efiPeptic'), --	Peptic ulcer
('J12y1', 'efiPeptic'), --	Peptic ulcer
('J12y2', 'efiPeptic'), --	Peptic ulcer
('J12y3', 'efiPeptic'), --	Peptic ulcer
('J12y4', 'efiPeptic'), --	Peptic ulcer
('J12yy', 'efiPeptic'), --	Peptic ulcer
('J12yz', 'efiPeptic'), --	Peptic ulcer
('J12z.', 'efiPeptic'), --	Peptic ulcer
('J13..', 'efiPeptic'), --	Peptic ulcer
('J130.', 'efiPeptic'), --	Peptic ulcer
('J1300', 'efiPeptic'), --	Peptic ulcer
('J1301', 'efiPeptic'), --	Peptic ulcer
('J1302', 'efiPeptic'), --	Peptic ulcer
('J1303', 'efiPeptic'), --	Peptic ulcer
('J130y', 'efiPeptic'), --	Peptic ulcer
('J130z', 'efiPeptic'), --	Peptic ulcer
('J131.', 'efiPeptic'), --	Peptic ulcer
('J1310', 'efiPeptic'), --	Peptic ulcer
('J1311', 'efiPeptic'), --	Peptic ulcer
('J1312', 'efiPeptic'), --	Peptic ulcer
('J131y', 'efiPeptic'), --	Peptic ulcer
('J131z', 'efiPeptic'), --	Peptic ulcer
('J13y.', 'efiPeptic'), --	Peptic ulcer
('J13y0', 'efiPeptic'), --	Peptic ulcer
('J13y1', 'efiPeptic'), --	Peptic ulcer
('J13y2', 'efiPeptic'), --	Peptic ulcer
('J13yz', 'efiPeptic'), --	Peptic ulcer
('J13z.', 'efiPeptic'), --	Peptic ulcer
('J14..', 'efiPeptic'), --	Peptic ulcer
('J1401', 'efiPeptic'), --	Peptic ulcer
('J1411', 'efiPeptic'), --	Peptic ulcer
('J14y.', 'efiPeptic'), --	Peptic ulcer
('J14z.', 'efiPeptic'), --	Peptic ulcer
('J17y8', 'efiPeptic'), --	Peptic ulcer
('J57y8', 'efiPeptic'), --	Peptic ulcer
('ZV12C', 'efiPeptic'), --	Peptic ulcer
('24E9.', 'efiPvd'), --	Peripheral vascular disease
('24EA.', 'efiPvd'), --	Peripheral vascular disease
('24EC.', 'efiPvd'), --	Peripheral vascular disease
('24F9.', 'efiPvd'), --	Peripheral vascular disease
('C107.', 'efiPvd'), --	Peripheral vascular disease
('C1086', 'efiPvd'), --	Peripheral vascular disease
('C109F', 'efiPvd'), --	Peripheral vascular disease
('C10E6', 'efiPvd'), --	Peripheral vascular disease
('C10FF', 'efiPvd'), --	Peripheral vascular disease
('G670.', 'efiPvd'), --	Peripheral vascular disease
('G700.', 'efiPvd'), --	Peripheral vascular disease
('G73..', 'efiPvd'), --	Peripheral vascular disease
('G73z.', 'efiPvd'), --	Peripheral vascular disease
('G73zz', 'efiPvd'), --	Peripheral vascular disease
('13F6.', 'efiRequire'), --	Requirement for care
('13F61', 'efiRequire'), --	Requirement for care
('13FX.', 'efiRequire'), --	Requirement for care
('13G6.', 'efiRequire'), --	Requirement for care
('13G61', 'efiRequire'), --	Requirement for care
('13WJ.', 'efiRequire'), --	Requirement for care
('8GEB.', 'efiRequire'), --	Requirement for care
('918F.', 'efiRequire'), --	Requirement for care
('9N1G.', 'efiRequire'), --	Requirement for care
('14B..', 'efiResp'), --	Respiratory disease
('14B3.', 'efiResp'), --	Respiratory disease
('14B4.', 'efiResp'), --	Respiratory disease
('14OX.', 'efiResp'), --	Respiratory disease
('1712.', 'efiResp'), --	Respiratory disease
('1713.', 'efiResp'), --	Respiratory disease
('1715.', 'efiResp'), --	Respiratory disease
('171A.', 'efiResp'), --	Respiratory disease
('173A.', 'efiResp'), --	Respiratory disease
('178..', 'efiResp'), --	Respiratory disease
('1780.', 'efiResp'), --	Respiratory disease
('1O2..', 'efiResp'), --	Respiratory disease
('3399.', 'efiResp'), --	Respiratory disease
('339U.', 'efiResp'), --	Respiratory disease
('33G0.', 'efiResp'), --	Respiratory disease
('388t.', 'efiResp'), --	Respiratory disease
('663..', 'efiResp'), --	Respiratory disease
('663J.', 'efiResp'), --	Respiratory disease
('663N.', 'efiResp'), --	Respiratory disease
('663N0', 'efiResp'), --	Respiratory disease
('663N1', 'efiResp'), --	Respiratory disease
('663N2', 'efiResp'), --	Respiratory disease
('663O.', 'efiResp'), --	Respiratory disease
('663O0', 'efiResp'), --	Respiratory disease
('663P.', 'efiResp'), --	Respiratory disease
('663Q.', 'efiResp'), --	Respiratory disease
('663U.', 'efiResp'), --	Respiratory disease
('663V.', 'efiResp'), --	Respiratory disease
('663V0', 'efiResp'), --	Respiratory disease
('663V1', 'efiResp'), --	Respiratory disease
('663V2', 'efiResp'), --	Respiratory disease
('663V3', 'efiResp'), --	Respiratory disease
('663W.', 'efiResp'), --	Respiratory disease
('663d.', 'efiResp'), --	Respiratory disease
('663e.', 'efiResp'), --	Respiratory disease
('663f.', 'efiResp'), --	Respiratory disease
('663h.', 'efiResp'), --	Respiratory disease
('663j.', 'efiResp'), --	Respiratory disease
('663l.', 'efiResp'), --	Respiratory disease
('663m.', 'efiResp'), --	Respiratory disease
('663n.', 'efiResp'), --	Respiratory disease
('663p.', 'efiResp'), --	Respiratory disease
('663q.', 'efiResp'), --	Respiratory disease
('663r.', 'efiResp'), --	Respiratory disease
('663s.', 'efiResp'), --	Respiratory disease
('663t.', 'efiResp'), --	Respiratory disease
('663u.', 'efiResp'), --	Respiratory disease
('663v.', 'efiResp'), --	Respiratory disease
('663w.', 'efiResp'), --	Respiratory disease
('663x.', 'efiResp'), --	Respiratory disease
('663y.', 'efiResp'), --	Respiratory disease
('66Y5.', 'efiResp'), --	Respiratory disease
('66Y9.', 'efiResp'), --	Respiratory disease
('66YA.', 'efiResp'), --	Respiratory disease
('66YB.', 'efiResp'), --	Respiratory disease
('66YD.', 'efiResp'), --	Respiratory disease
('66YE.', 'efiResp'), --	Respiratory disease
('66YI.', 'efiResp'), --	Respiratory disease
('66YJ.', 'efiResp'), --	Respiratory disease
('66YK.', 'efiResp'), --	Respiratory disease
('66YL.', 'efiResp'), --	Respiratory disease
('66YM.', 'efiResp'), --	Respiratory disease
('66YP.', 'efiResp'), --	Respiratory disease
('66YQ.', 'efiResp'), --	Respiratory disease
('66YR.', 'efiResp'), --	Respiratory disease
('66YS.', 'efiResp'), --	Respiratory disease
('66YT.', 'efiResp'), --	Respiratory disease
('66YZ.', 'efiResp'), --	Respiratory disease
('66Yd.', 'efiResp'), --	Respiratory disease
('66Ye.', 'efiResp'), --	Respiratory disease
('66Yf.', 'efiResp'), --	Respiratory disease
('66Yg.', 'efiResp'), --	Respiratory disease
('66Yh.', 'efiResp'), --	Respiratory disease
('66Yi.', 'efiResp'), --	Respiratory disease
('679J.', 'efiResp'), --	Respiratory disease
('679V.', 'efiResp'), --	Respiratory disease
('74592', 'efiResp'), --	Respiratory disease
('8764.', 'efiResp'), --	Respiratory disease
('8776.', 'efiResp'), --	Respiratory disease
('8778.', 'efiResp'), --	Respiratory disease
('8793.', 'efiResp'), --	Respiratory disease
('8794.', 'efiResp'), --	Respiratory disease
('8795.', 'efiResp'), --	Respiratory disease
('8796.', 'efiResp'), --	Respiratory disease
('8797.', 'efiResp'), --	Respiratory disease
('8798.', 'efiResp'), --	Respiratory disease
('8B3j.', 'efiResp'), --	Respiratory disease
('8CR0.', 'efiResp'), --	Respiratory disease
('8CR1.', 'efiResp'), --	Respiratory disease
('8FA..', 'efiResp'), --	Respiratory disease
('8FA1.', 'efiResp'), --	Respiratory disease
('8H2P.', 'efiResp'), --	Respiratory disease
('8H2R.', 'efiResp'), --	Respiratory disease
('8H7u.', 'efiResp'), --	Respiratory disease
('8HTT.', 'efiResp'), --	Respiratory disease
('9N1d.', 'efiResp'), --	Respiratory disease
('9N4Q.', 'efiResp'), --	Respiratory disease
('9N4W.', 'efiResp'), --	Respiratory disease
('9OJ1.', 'efiResp'), --	Respiratory disease
('9OJ2.', 'efiResp'), --	Respiratory disease
('9OJ3.', 'efiResp'), --	Respiratory disease
('9OJ7.', 'efiResp'), --	Respiratory disease
('9OJA.', 'efiResp'), --	Respiratory disease
('9Oi3.', 'efiResp'), --	Respiratory disease
('9h52.', 'efiResp'), --	Respiratory disease
('9hA1.', 'efiResp'), --	Respiratory disease
('9hA2.', 'efiResp'), --	Respiratory disease
('9kf..', 'efiResp'), --	Respiratory disease
('9kf0.', 'efiResp'), --	Respiratory disease
('G401.', 'efiResp'), --	Respiratory disease
('G4011', 'efiResp'), --	Respiratory disease
('G410.', 'efiResp'), --	Respiratory disease
('G41y0', 'efiResp'), --	Respiratory disease
('H....', 'efiResp'), --	Respiratory disease
('H3...', 'efiResp'), --	Respiratory disease
('H30..', 'efiResp'), --	Respiratory disease
('H302.', 'efiResp'), --	Respiratory disease
('H31..', 'efiResp'), --	Respiratory disease
('H310.', 'efiResp'), --	Respiratory disease
('H3100', 'efiResp'), --	Respiratory disease
('H310z', 'efiResp'), --	Respiratory disease
('H311.', 'efiResp'), --	Respiratory disease
('H3110', 'efiResp'), --	Respiratory disease
('H3111', 'efiResp'), --	Respiratory disease
('H312.', 'efiResp'), --	Respiratory disease
('H3120', 'efiResp'), --	Respiratory disease
('H3122', 'efiResp'), --	Respiratory disease
('H312z', 'efiResp'), --	Respiratory disease
('H31y.', 'efiResp'), --	Respiratory disease
('H31yz', 'efiResp'), --	Respiratory disease
('H31z.', 'efiResp'), --	Respiratory disease
('H32..', 'efiResp'), --	Respiratory disease
('H33..', 'efiResp'), --	Respiratory disease
('H330.', 'efiResp'), --	Respiratory disease
('H3300', 'efiResp'), --	Respiratory disease
('H3301', 'efiResp'), --	Respiratory disease
('H330z', 'efiResp'), --	Respiratory disease
('H331.', 'efiResp'), --	Respiratory disease
('H3310', 'efiResp'), --	Respiratory disease
('H3311', 'efiResp'), --	Respiratory disease
('H331z', 'efiResp'), --	Respiratory disease
('H332.', 'efiResp'), --	Respiratory disease
('H333.', 'efiResp'), --	Respiratory disease
('H334.', 'efiResp'), --	Respiratory disease
('H33z.', 'efiResp'), --	Respiratory disease
('H33z0', 'efiResp'), --	Respiratory disease
('H33z1', 'efiResp'), --	Respiratory disease
('H33z2', 'efiResp'), --	Respiratory disease
('H33zz', 'efiResp'), --	Respiratory disease
('H36..', 'efiResp'), --	Respiratory disease
('H37..', 'efiResp'), --	Respiratory disease
('H38..', 'efiResp'), --	Respiratory disease
('H39..', 'efiResp'), --	Respiratory disease
('H3y..', 'efiResp'), --	Respiratory disease
('H3y0.', 'efiResp'), --	Respiratory disease
('H3y1.', 'efiResp'), --	Respiratory disease
('H3z..', 'efiResp'), --	Respiratory disease
('H564.', 'efiResp'), --	Respiratory disease
('Hyu31', 'efiResp'), --	Respiratory disease
('N04y0', 'efiResp'), --	Respiratory disease
('R062.', 'efiResp'), --	Respiratory disease
('TJF73', 'efiResp'), --	Respiratory disease
('U60F6', 'efiResp'), --	Respiratory disease
('ZV129', 'efiResp'), --	Respiratory disease
('14F3.', 'efiSkin'), --	Skin ulcer
('14F5.', 'efiSkin'), --	Skin ulcer
('2924.', 'efiSkin'), --	Skin ulcer
('2FF..', 'efiSkin'), --	Skin ulcer
('2FF2.', 'efiSkin'), --	Skin ulcer
('2FF3.', 'efiSkin'), --	Skin ulcer
('2FFZ.', 'efiSkin'), --	Skin ulcer
('2G48.', 'efiSkin'), --	Skin ulcer
('2G54.', 'efiSkin'), --	Skin ulcer
('2G55.', 'efiSkin'), --	Skin ulcer
('2G5H.', 'efiSkin'), --	Skin ulcer
('2G5L.', 'efiSkin'), --	Skin ulcer
('2G5V.', 'efiSkin'), --	Skin ulcer
('2G5W.', 'efiSkin'), --	Skin ulcer
('39C..', 'efiSkin'), --	Skin ulcer
('39C0.', 'efiSkin'), --	Skin ulcer
('4JG3.', 'efiSkin'), --	Skin ulcer
('7G2E5', 'efiSkin'), --	Skin ulcer
('7G2EA', 'efiSkin'), --	Skin ulcer
('7G2EB', 'efiSkin'), --	Skin ulcer
('7G2EC', 'efiSkin'), --	Skin ulcer
('81H1.', 'efiSkin'), --	Skin ulcer
('8CT1.', 'efiSkin'), --	Skin ulcer
('8CV2.', 'efiSkin'), --	Skin ulcer
('8HTh.', 'efiSkin'), --	Skin ulcer
('9N0t.', 'efiSkin'), --	Skin ulcer
('9NM5.', 'efiSkin'), --	Skin ulcer
('C1094', 'efiSkin'), --	Skin ulcer
('C10F4', 'efiSkin'), --	Skin ulcer
('G830.', 'efiSkin'), --	Skin ulcer
('G832.', 'efiSkin'), --	Skin ulcer
('G835.', 'efiSkin'), --	Skin ulcer
('G837.', 'efiSkin'), --	Skin ulcer
('M07z.', 'efiSkin'), --	Skin ulcer
('M27..', 'efiSkin'), --	Skin ulcer
('M270.', 'efiSkin'), --	Skin ulcer
('M271.', 'efiSkin'), --	Skin ulcer
('M2710', 'efiSkin'), --	Skin ulcer
('M2711', 'efiSkin'), --	Skin ulcer
('M2712', 'efiSkin'), --	Skin ulcer
('M2713', 'efiSkin'), --	Skin ulcer
('M2714', 'efiSkin'), --	Skin ulcer
('M2715', 'efiSkin'), --	Skin ulcer
('M272.', 'efiSkin'), --	Skin ulcer
('M27y.', 'efiSkin'), --	Skin ulcer
('M27z.', 'efiSkin'), --	Skin ulcer
('1B1B.', 'efiSleep'), --	Sleep disturbance
('1B1Q.', 'efiSleep'), --	Sleep disturbance
('E274.', 'efiSleep'), --	Sleep disturbance
('Eu51.', 'efiSleep'), --	Sleep disturbance
('Fy02.', 'efiSleep'), --	Sleep disturbance
('R005.', 'efiSleep'), --	Sleep disturbance
('R0050', 'efiSleep'), --	Sleep disturbance
('R0052', 'efiSleep'), --	Sleep disturbance
('1335.', 'efiSocial'), --	Social vulnerability
('133P.', 'efiSocial'), --	Social vulnerability
('133V.', 'efiSocial'), --	Social vulnerability
('13EH.', 'efiSocial'), --	Social vulnerability
('13F3.', 'efiSocial'), --	Social vulnerability
('13G4.', 'efiSocial'), --	Social vulnerability
('13M1.', 'efiSocial'), --	Social vulnerability
('13MF.', 'efiSocial'), --	Social vulnerability
('13Z8.', 'efiSocial'), --	Social vulnerability
('1B1K.', 'efiSocial'), --	Social vulnerability
('8H75.', 'efiSocial'), --	Social vulnerability
('8HHB.', 'efiSocial'), --	Social vulnerability
('8I5..', 'efiSocial'), --	Social vulnerability
('918V.', 'efiSocial'), --	Social vulnerability
('9NNV.', 'efiSocial'), --	Social vulnerability
('ZV603', 'efiSocial'), --	Social vulnerability
('1431.', 'efiThyroid'), --	Thyroid disease
('1432.', 'efiThyroid'), --	Thyroid disease
('4422.', 'efiThyroid'), --	Thyroid disease
('442I.', 'efiThyroid'), --	Thyroid disease
('66BB.', 'efiThyroid'), --	Thyroid disease
('66BZ.', 'efiThyroid'), --	Thyroid disease
('8CR5.', 'efiThyroid'), --	Thyroid disease
('9N4T.', 'efiThyroid'), --	Thyroid disease
('9Oj0.', 'efiThyroid'), --	Thyroid disease
('C0...', 'efiThyroid'), --	Thyroid disease
('C02..', 'efiThyroid'), --	Thyroid disease
('C04..', 'efiThyroid'), --	Thyroid disease
('C040.', 'efiThyroid'), --	Thyroid disease
('C041.', 'efiThyroid'), --	Thyroid disease
('C0410', 'efiThyroid'), --	Thyroid disease
('C041z', 'efiThyroid'), --	Thyroid disease
('C042.', 'efiThyroid'), --	Thyroid disease
('C043.', 'efiThyroid'), --	Thyroid disease
('C043z', 'efiThyroid'), --	Thyroid disease
('C044.', 'efiThyroid'), --	Thyroid disease
('C046.', 'efiThyroid'), --	Thyroid disease
('C04y.', 'efiThyroid'), --	Thyroid disease
('C04z.', 'efiThyroid'), --	Thyroid disease
('C1343', 'efiThyroid'), --	Thyroid disease
('Cyu1.', 'efiThyroid'), --	Thyroid disease
('Cyu11', 'efiThyroid'), --	Thyroid disease
('1593.', 'efiUrinary'), --	Urinary incontinence
('16F..', 'efiUrinary'), --	Urinary incontinence
('1A23.', 'efiUrinary'), --	Urinary incontinence
('1A24.', 'efiUrinary'), --	Urinary incontinence
('1A26.', 'efiUrinary'), --	Urinary incontinence
('3940.', 'efiUrinary'), --	Urinary incontinence
('3941.', 'efiUrinary'), --	Urinary incontinence
('7B338', 'efiUrinary'), --	Urinary incontinence
('7B33C', 'efiUrinary'), --	Urinary incontinence
('7B421', 'efiUrinary'), --	Urinary incontinence
('8D7..', 'efiUrinary'), --	Urinary incontinence
('8D71.', 'efiUrinary'), --	Urinary incontinence
('8HTX.', 'efiUrinary'), --	Urinary incontinence
('K198.', 'efiUrinary'), --	Urinary incontinence
('K586.', 'efiUrinary'), --	Urinary incontinence
('Kyu5A', 'efiUrinary'), --	Urinary incontinence
('R083.', 'efiUrinary'), --	Urinary incontinence
('R0831', 'efiUrinary'), --	Urinary incontinence
('R0832', 'efiUrinary'), --	Urinary incontinence
('R083z', 'efiUrinary'), --	Urinary incontinence
('14D..', 'efiUrinarySys'), --	Urinary system disease
('14DZ.', 'efiUrinarySys'), --	Urinary system disease
('1A1..', 'efiUrinarySys'), --	Urinary system disease
('1A13.', 'efiUrinarySys'), --	Urinary system disease
('1A1Z.', 'efiUrinarySys'), --	Urinary system disease
('1A55.', 'efiUrinarySys'), --	Urinary system disease
('1AA..', 'efiUrinarySys'), --	Urinary system disease
('1AC2.', 'efiUrinarySys'), --	Urinary system disease
('7B39.', 'efiUrinarySys'), --	Urinary system disease
('7B390', 'efiUrinarySys'), --	Urinary system disease
('8156.', 'efiUrinarySys'), --	Urinary system disease
('8H5B.', 'efiUrinarySys'), --	Urinary system disease
('K....', 'efiUrinarySys'), --	Urinary system disease
('K155.', 'efiUrinarySys'), --	Urinary system disease
('K1653', 'efiUrinarySys'), --	Urinary system disease
('K1654', 'efiUrinarySys'), --	Urinary system disease
('K16y4', 'efiUrinarySys'), --	Urinary system disease
('K190.', 'efiUrinarySys'), --	Urinary system disease
('K1903', 'efiUrinarySys'), --	Urinary system disease
('K1905', 'efiUrinarySys'), --	Urinary system disease
('K190z', 'efiUrinarySys'), --	Urinary system disease
('K1971', 'efiUrinarySys'), --	Urinary system disease
('K1973', 'efiUrinarySys'), --	Urinary system disease
('K20..', 'efiUrinarySys'), --	Urinary system disease
('Ky...', 'efiUrinarySys'), --	Urinary system disease
('Kz...', 'efiUrinarySys'), --	Urinary system disease
('R08..', 'efiUrinarySys'), --	Urinary system disease
('R082.', 'efiUrinarySys'), --	Urinary system disease
('R0822', 'efiUrinarySys'), --	Urinary system disease
('SP031', 'efiUrinarySys'), --	Urinary system disease
('1483.', 'efiVisual'), --	Visual impairment
('1B75.', 'efiVisual'), --	Visual impairment
('22E5.', 'efiVisual'), --	Visual impairment
('22EG.', 'efiVisual'), --	Visual impairment
('2BBm.', 'efiVisual'), --	Visual impairment
('2BBn.', 'efiVisual'), --	Visual impairment
('2BBo.', 'efiVisual'), --	Visual impairment
('2BBr.', 'efiVisual'), --	Visual impairment
('2BT..', 'efiVisual'), --	Visual impairment
('2BT0.', 'efiVisual'), --	Visual impairment
('2BT1.', 'efiVisual'), --	Visual impairment
('6688.', 'efiVisual'), --	Visual impairment
('6689.', 'efiVisual'), --	Visual impairment
('72630', 'efiVisual'), --	Visual impairment
('72661', 'efiVisual'), --	Visual impairment
('8F61.', 'efiVisual'), --	Visual impairment
('8H52.', 'efiVisual'), --	Visual impairment
('9m08.', 'efiVisual'), --	Visual impairment
('C108F', 'efiVisual'), --	Visual impairment
('C109E', 'efiVisual'), --	Visual impairment
('C10EF', 'efiVisual'), --	Visual impairment
('C10EP', 'efiVisual'), --	Visual impairment
('C10FE', 'efiVisual'), --	Visual impairment
('C10FQ', 'efiVisual'), --	Visual impairment
('F4042', 'efiVisual'), --	Visual impairment
('F421A', 'efiVisual'), --	Visual impairment
('F422.', 'efiVisual'), --	Visual impairment
('F422y', 'efiVisual'), --	Visual impairment
('F422z', 'efiVisual'), --	Visual impairment
('F4239', 'efiVisual'), --	Visual impairment
('F425.', 'efiVisual'), --	Visual impairment
('F4250', 'efiVisual'), --	Visual impairment
('F4251', 'efiVisual'), --	Visual impairment
('F4252', 'efiVisual'), --	Visual impairment
('F4253', 'efiVisual'), --	Visual impairment
('F4254', 'efiVisual'), --	Visual impairment
('F4257', 'efiVisual'), --	Visual impairment
('F427C', 'efiVisual'), --	Visual impairment
('F42y4', 'efiVisual'), --	Visual impairment
('F42y9', 'efiVisual'), --	Visual impairment
('F4305', 'efiVisual'), --	Visual impairment
('F4332', 'efiVisual'), --	Visual impairment
('F46..', 'efiVisual'), --	Visual impairment
('F4602', 'efiVisual'), --	Visual impairment
('F4603', 'efiVisual'), --	Visual impairment
('F4604', 'efiVisual'), --	Visual impairment
('F4605', 'efiVisual'), --	Visual impairment
('F4606', 'efiVisual'), --	Visual impairment
('F4607', 'efiVisual'), --	Visual impairment
('F460z', 'efiVisual'), --	Visual impairment
('F461.', 'efiVisual'), --	Visual impairment
('F4610', 'efiVisual'), --	Visual impairment
('F4614', 'efiVisual'), --	Visual impairment
('F4615', 'efiVisual'), --	Visual impairment
('F4617', 'efiVisual'), --	Visual impairment
('F4618', 'efiVisual'), --	Visual impairment
('F4619', 'efiVisual'), --	Visual impairment
('F461A', 'efiVisual'), --	Visual impairment
('F461B', 'efiVisual'), --	Visual impairment
('F461y', 'efiVisual'), --	Visual impairment
('F461z', 'efiVisual'), --	Visual impairment
('F462.', 'efiVisual'), --	Visual impairment
('F462z', 'efiVisual'), --	Visual impairment
('F463.', 'efiVisual'), --	Visual impairment
('F4633', 'efiVisual'), --	Visual impairment
('F4634', 'efiVisual'), --	Visual impairment
('F463z', 'efiVisual'), --	Visual impairment
('F464.', 'efiVisual'), --	Visual impairment
('F4640', 'efiVisual'), --	Visual impairment
('F4642', 'efiVisual'), --	Visual impairment
('F4644', 'efiVisual'), --	Visual impairment
('F4646', 'efiVisual'), --	Visual impairment
('F4647', 'efiVisual'), --	Visual impairment
('F464z', 'efiVisual'), --	Visual impairment
('F465.', 'efiVisual'), --	Visual impairment
('F4650', 'efiVisual'), --	Visual impairment
('F465z', 'efiVisual'), --	Visual impairment
('F466.', 'efiVisual'), --	Visual impairment
('F46y.', 'efiVisual'), --	Visual impairment
('F46yz', 'efiVisual'), --	Visual impairment
('F46z.', 'efiVisual'), --	Visual impairment
('F46z0', 'efiVisual'), --	Visual impairment
('F4840', 'efiVisual'), --	Visual impairment
('F49..', 'efiVisual'), --	Visual impairment
('F490.', 'efiVisual'), --	Visual impairment
('F4900', 'efiVisual'), --	Visual impairment
('F4909', 'efiVisual'), --	Visual impairment
('F490z', 'efiVisual'), --	Visual impairment
('F494.', 'efiVisual'), --	Visual impairment
('F4950', 'efiVisual'), --	Visual impairment
('F495A', 'efiVisual'), --	Visual impairment
('F49z.', 'efiVisual'), --	Visual impairment
('F4A24', 'efiVisual'), --	Visual impairment
('F4H34', 'efiVisual'), --	Visual impairment
('F4H40', 'efiVisual'), --	Visual impairment
('F4H73', 'efiVisual'), --	Visual impairment
('F4K2D', 'efiVisual'), --	Visual impairment
('FyuE1', 'efiVisual'), --	Visual impairment
('FyuF7', 'efiVisual'), --	Visual impairment
('FyuL.', 'efiVisual'), --	Visual impairment
('P33..', 'efiVisual'), --	Visual impairment
('P330.', 'efiVisual'), --	Visual impairment
('P331.', 'efiVisual'), --	Visual impairment
('P3310', 'efiVisual'), --	Visual impairment
('P3311', 'efiVisual'), --	Visual impairment
('P331z', 'efiVisual'), --	Visual impairment
('S813.', 'efiVisual'), --	Visual impairment
('SJ0z.', 'efiVisual'), --	Visual impairment
('1612.', 'efiWeight'), --	Weight loss & anorexia
('1615.', 'efiWeight'), --	Weight loss & anorexia
('1623.', 'efiWeight'), --	Weight loss & anorexia
('1625.', 'efiWeight'), --	Weight loss & anorexia
('1D1A.', 'efiWeight'), --	Weight loss & anorexia
('22A8.', 'efiWeight'), --	Weight loss & anorexia
('R0300', 'efiWeight'), --	Weight loss & anorexia
--group by readcodgroup by readcodeR032.	Weight loss & anorexia￿￿￿￿ﾶ￿:ｦ�ﾐ￿￿￿￿￿￿￿￿￿￿￿￿￿￿ﾶ￿:ｦ�ﾐ￿￿￿￿M2710	Peripheral vascular diseaseĀĀऀ਄㬄ᰐ圍虖큂鹯쎻ﱟ쯉､틐ｴ쳉ﵱꂟ誉㌯阗”脎Є䴁

('aa1..', 'azt'), -- azathioprine
('h71..', 'azt'), -- azathioprine
('h711.', 'azt'), -- azathioprine
('h712.', 'azt'), -- azathioprine
('h713.', 'azt'), -- azathioprine
('h714.', 'azt'), -- azathioprine
('h714.', 'azt'), -- azathioprine
('h715.', 'azt'), -- azathioprine
('h716.', 'azt'), -- azathioprine
('h717.', 'azt'), -- azathioprine
('h718.', 'azt'), -- azathioprine
('h719.', 'azt'), -- azathioprine
('h71A.', 'azt'), -- azathioprine
('h71x.', 'azt'), -- azathioprine
('h71y.', 'azt'), -- azathioprine
('h71z.', 'azt'), -- azathioprine
('h71z.', 'azt'), -- azathioprine
('AZTA262', 'azt'), -- azathioprine
('AZTA10446BRIDL', 'azt'), -- azathioprine
('AZSU18407NEMIS', 'azt'), -- azathioprine
('AZCA18881NEMIS', 'azt'), -- azathioprine

('66c0.', 'dmardMonitor'),	-- Disease modifying antirheumatic drug monitoring

('9NkF.', 'dmardSeenCommunity'),	-- Seen in general practitioner disease modifying antirheumatic drug monitoring clinic
('9NkG.', 'dmardSeenCommunity'),	-- Seen in community disease modifying antirheumatic drug monitoring clinic

('9NkH.', 'dmardSeenSecondary'),	-- Seen in hospital disease modifying antirheumatic drug monitoring clinic

('9kN7.', 'dmardMonitorSecondary'),	-- Disease modifying antirheumatic drug monitored in secondary care - enhanced services administration

('9Oe3.', 'dnaDmardCommunity'),	-- Did not attend for community DMARD monitoring
('9NiL.', 'dnaDmardCommunity'),	-- Did not attend general practitioner disease modifying antirheumatic drug monitoring clinic

('9NiK.', 'dnaDmardSecondary'),	-- Did not attend hospital disease monitoring antirheumatic drug monitoring clinic

('423..', 'fbc'), --Haemoglobin estimation FBC_COD
('4234.', 'fbc'), --Haemoglobin very low FBC_COD
('4235.', 'fbc'), --Haemoglobin low FBC_COD
('4236.', 'fbc'), --Haemoglobin borderline low FBC_COD
('4237.', 'fbc'), --Haemoglobin normal FBC_COD
('4238.', 'fbc'), --Haemoglobin borderline high FBC_COD
('4239.', 'fbc'), --Haemoglobin high FBC_COD
('423A.', 'fbc'), --Haemoglobin very high FBC_COD
('423B.', 'fbc'), --Haemoglobin abnormal FBC_COD
('423Z.', 'fbc'), --Haemoglobin estimation NOS FBC_COD
('424..', 'fbc'), --Full blood count - FBC FBC_COD
('4241.', 'fbc'), --Full blood count normal FBC_COD
('4242.', 'fbc'), --Full blood count borderline FBC_COD
('4243.', 'fbc'), --Full blood count abnormal FBC_COD
('424Z.', 'fbc'), --Full blood count NOS FBC_COD
('426..', 'fbc'), --Red blood cell (RBC) count FBC_COD
('4261.', 'fbc'), --RBC count normal FBC_COD
('4262.', 'fbc'), --RBC count borderline low FBC_COD
('4263.', 'fbc'), --RBC count low FBC_COD
('4264.', 'fbc'), --RBC count raised FBC_COD
('4265.', 'fbc'), --RBC count borderline raised FBC_COD
('4266.', 'fbc'), --Nucleated red blood cell count FBC_COD
('4267.', 'fbc'), --RBC count abnormal FBC_COD
('426Z.', 'fbc'), --RBC count NOS FBC_COD
('42b..', 'fbc'), --Percentage cell count FBC_COD
('42b0.', 'fbc'), --Percentage neutrophils FBC_COD
('42b1.', 'fbc'), --Percentage lymphocytes FBC_COD
('42b2.', 'fbc'), --Percentage monocytes FBC_COD
('42b3.', 'fbc'), --Percentage basophils FBC_COD
('42b4.', 'fbc'), --Percentage metamyelocytes FBC_COD
('42b5.', 'fbc'), --Percentage blast cells FBC_COD
('42b6.', 'fbc'), --Percentage smear cells FBC_COD
('42b7.', 'fbc'), --Percentage granulocytes FBC_COD
('42b8.', 'fbc'), --Percentage nucleated RBCs FBC_COD
('42b9.', 'fbc'), --Percentage eosinophils FBC_COD
('42bA.', 'fbc'), --Percentage myelocyte count FBC_COD
('42bB.', 'fbc'), --Percentage promyelocyte count FBC_COD
('42bC.', 'fbc'), --Percentage reticulocyte count FBC_COD
('42bD.', 'fbc'), --T cell total % FBC_COD
('42bE.', 'fbc'), --Percentage hypochromic cells FBC_COD
('42H..', 'fbc'), --Total white cell count FBC_COD
('42H1.', 'fbc'), --White cell count normal FBC_COD
('42H2.', 'fbc'), --Leucopenia - low white count FBC_COD
('42H3.', 'fbc'), --Leucocytosis -high white count FBC_COD
('42H4.', 'fbc'), --Agranulocytosis FBC_COD
('42H5.', 'fbc'), --White cell count abnormal FBC_COD
('42H6.', 'fbc'), --Polymorph count FBC_COD
('42H7.', 'fbc'), --Total white blood count FBC_COD
('42H8.', 'fbc'), --Total WBC (IMM) FBC_COD
('42HZ.', 'fbc'), --Total white cell count NOS FBC_COD
('42I..', 'fbc'), --Differential white cell count FBC_COD
('42I1.', 'fbc'), --Diff. white cell count normal FBC_COD
('42I2.', 'fbc'), --Diff. white count abnormal FBC_COD
('42IZ.', 'fbc'), --Diff. white cell count NOS FBC_COD
('42MG.', 'fbc'), --Leucocyte count FBC_COD
('42P..', 'fbc'), --Platelet count FBC_COD
('42P1.', 'fbc'), --Platelet count normal FBC_COD
('42P2.', 'fbc'), --Thrombocytopenia FBC_COD
('42P3.', 'fbc'), --Thrombocythaemia FBC_COD
('42P4.', 'fbc'), --Platelet count abnormal FBC_COD
('42P7.', 'fbc'), --Percent retic platelet count FBC_COD
('42PZ.', 'fbc'), --Platelet count NOS FBC_COD
('44D..', 'lft'), --Liver function tests - general LFT_COD
('44D1.', 'lft'), --Liver function tests normal LFT_COD
('44D2.', 'lft'), --Liver function tests abnormal LFT_COD
('44F..', 'lft'), --Serum alkaline phosphatase LFT_COD
('44F1.', 'lft'), --Serum alk. phos. normal LFT_COD
('44F2.', 'lft'), --Serum alk. phos. raised LFT_COD
('44F3.', 'lft'), --Total alkaline phosphatase LFT_COD
('44F4.', 'lft'), --Alk. phos. - liver isoenzyme LFT_COD
('44FA.', 'lft'), --Plas alk phos liver enzyme lev LFT_COD
('44FD.', 'lft'), --Ser alk phos liver enzyme lev LFT_COD
('44FH.', 'lft'), --Alk phos-liver isoenzyme level LFT_COD
('44FZ.', 'lft'), --Serum alkaline phosphatase NOS LFT_COD
('44G..', 'lft'), --Liver enzymes LFT_COD
('44G1.', 'lft'), --Liver enzymes normal LFT_COD
('44G2.', 'lft'), --Liver enzymes abnormal LFT_COD
('44G3.', 'lft'), --ALT/SGPT serum level LFT_COD
('44G30', 'lft'), --SGPT level normal LFT_COD
('44G3000', 'lft'), --SGPT level normal LFT_COD
('44G31', 'lft'), --SGPT level abnormal LFT_COD
('44G3100', 'lft'), --SGPT level abnormal LFT_COD
('44G4.', 'lft'), --Gamma - G.T. level LFT_COD
('44G40', 'lft'), --GT level normal LFT_COD
('44G4000', 'lft'), --GT level normal LFT_COD
('44G41', 'lft'), --GT level abnormal LFT_COD
('44G4100', 'lft'), --GT level abnormal LFT_COD
('44G7.', 'lft'), --Plasma gamma GT level LFT_COD
('44G9.', 'lft'), --Serum gamma GT level LFT_COD
('44GA.', 'lft'), --Plasma ALT level LFT_COD
('44GB.', 'lft'), --Serum ALT level LFT_COD
('44GZ.', 'lft'), --Liver enzymes NOS LFT_COD
('44H5.', 'lft'), --AST - aspartate transam.(SGOT) LFT_COD
('44H50', 'lft'), --SGOT level normal LFT_COD
('44H5000', 'lft'), --SGOT level normal LFT_COD
('44H51', 'lft'), --SGOT level abnormal LFT_COD
('44H5100', 'lft'), --SGOT level abnormal LFT_COD
('44H52', 'lft'), --SGOT level raised LFT_COD
('44H5200', 'lft'), --SGOT level raised LFT_COD
('4412000', 'U+E'), --Urea and electrolytes normal U+E
('4412100', 'U+E'), --Urea and electrolytes abnormal U+E
('44J', 'U+E'), --.12	Urea and electrolytes U+E
('44JB', 'U+E'), --00	Urea and electrolytes U+E
('44120', 'U+E'), --Urea and electrolytes normal U+E
('44121', 'U+E'), --Urea and electrolytes abnormal U+E
('44J', 'U+E'), --.	Urea and electrolytes U+E
('44JB', 'U+E'), --	Urea and electrolytes U+E

('44I5.', 'NA_LEVEL'), --Serum sodium
('44I5.00', 'NA_LEVEL'), --Serum sodium
('44I51	Serum', 'NA_LEVEL'), --sodium level abnormal
('44I5100	Serum', 'NA_LEVEL'), --sodium level abnormal
('44I50	Serum', 'NA_LEVEL'), --sodium level normal
('44I5000	Serum', 'NA_LEVEL'), --sodium level normal
('44h6.', 'NA_LEVEL'), --Plasma sodium level
('44h6.00', 'NA_LEVEL'), --Plasma sodium level
('44h1.', 'NA_LEVEL'), --Blood sodium level
('44h1.00', 'NA_LEVEL'), --Blood sodium level
('4Q43.', 'NA_LEVEL'), --Sodium level
('4Q43.00', 'NA_LEVEL'), --Sodium level
('44I4.', 'K_LEVEL'), --Serum potassium
('44I4.00', 'K_LEVEL'), --Serum potassium
('44I42	Low', 'K_LEVEL'), --serum potassium level
('44I4200	Low', 'K_LEVEL'), --serum potassium level
('44I41	Raised', 'K_LEVEL'), --serum potassium level
('44I4100	Raised', 'K_LEVEL'), --serum potassium level
('44I40	Normal', 'K_LEVEL'), --serum potassium level
('44I4000	Normal', 'K_LEVEL'), --serum potassium level
('44h8.', 'K_LEVEL'), --Plasma potassium level
('44h8.00', 'K_LEVEL'), --Plasma potassium level
('44h0.', 'K_LEVEL'), --Blood potassium level
('44h0.00', 'K_LEVEL'), --Blood potassium level
('4Q42.', 'K_LEVEL'), --Potassium level
('4Q42.00', 'K_LEVEL'), --Potassium level
('44J..', 'UREA_LEVEL'), --Blood urea/renal function
('44J..', 'UREA_LEVEL'), --3	Serum urea level
('44J..', 'UREA_LEVEL'), --0	Blood urea/renal function
('44J..', 'UREA_LEVEL'), --1	Urea - blood
('44J..', 'UREA_LEVEL'), --2	Urea and electrolytes
('44J9.', 'UREA_LEVEL'), --Serum urea level
('44J9.00', 'UREA_LEVEL'), --Serum urea level
('44JZ.', 'UREA_LEVEL'), --Blood urea/renal function NOS
('44JZ.00', 'UREA_LEVEL'), --Blood urea/renal function NOS
('44JH.', 'UREA_LEVEL'), --Plasma osmolality
('44JH.00', 'UREA_LEVEL'), --Plasma osmolality
('44JB.', 'UREA_LEVEL'), --Urea and electrolytes
('44JB.00', 'UREA_LEVEL'), --Urea and electrolytes
('44JA.', 'UREA_LEVEL'), --Plasma urea level
('44JA.00', 'UREA_LEVEL'), --Plasma urea level
('44J8.', 'UREA_LEVEL'), --Blood urea
('44J8.00', 'UREA_LEVEL'), --Blood urea
('44J8.', 'UREA_LEVEL'), --Urea - blood
('44J8.11', 'UREA_LEVEL'), --Urea - blood
('44J4.', 'UREA_LEVEL'), --Serum osmolality
('44J4.00', 'UREA_LEVEL'), --Serum osmolality
('44J2.', 'UREA_LEVEL'), --Blood urea abnormal
('44J2.00', 'UREA_LEVEL'), --Blood urea abnormal
('44J1.', 'UREA_LEVEL'), --Blood urea normal
('44J1.00', 'UREA_LEVEL'), --Blood urea normal
('44120	Urea', 'UREA_LEVEL'), --and electrolytes normal
('4412000	Urea', 'UREA_LEVEL'), --and electrolytes normal
('44121	Urea', 'UREA_LEVEL'), --and electrolytes abnormal
('4412100	Urea', 'UREA_LEVEL'), --and electrolytes abnormal
('46MB.', 'UREA_LEVEL'), --Urine osmolality
('46MB.00', 'UREA_LEVEL'), --Urine osmolality
('46MA.', 'UREA_LEVEL'), --Urine random osmolality
('46MA.00', 'UREA_LEVEL'), --Urine random osmolality
('44lW.', 'UREA_LEVEL'), --Osmolality urine/serum ratio
('44lW.00', 'UREA_LEVEL'), --Osmolality urine/serum ratio
('4Q41.', 'UREA_LEVEL'), --Osmolality
('4Q41.00', 'UREA_LEVEL'), --Osmolality
('451G.', 'EGFR_LEVEL'), --GFR calculated abbreviated MDRD adj for African Americ orign
('451G.00', 'EGFR_LEVEL'), --GFR calculated abbreviated MDRD adj for African Americ orign
('451E.', 'EGFR_LEVEL'), --GFR calculated abbreviated MDRD
('451E.00', 'EGFR_LEVEL'), --GFR calculated abbreviated MDRD
('451N.', 'EGFR_LEVEL'), --Estimated glomerular filtration rate using creatinine Chronic Kidney Disease...
('451N.00', 'EGFR_LEVEL'), --Estimated glomerular filtration rate using creatinine Chronic Kidney Disease...
('451M.', 'EGFR_LEVEL'), --Estimated glomerular filtration rate using cystatin C Chronic Kidney Disease...
('451M.00', 'EGFR_LEVEL'), --Estimated glomerular filtration rate using cystatin C Chronic Kidney Disease...
('451K.', 'EGFR_LEVEL'), --Estimated glomerular filtration rate using Chronic Kidney Disease Epidemiolo...
('451K.00', 'EGFR_LEVEL'); --Estimated glomerular filtration rate using Chronic Kidney Disease Epidemiolo...