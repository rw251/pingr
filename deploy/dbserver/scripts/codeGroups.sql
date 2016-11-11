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
--ACR
--from SS
('46TC.', 'acr'),
('46TD.', 'acr'),
	
--Addisons
--from codelist creator 26/10/16 Read v2 April 2016   "synonyms": ["addison"]
('F3950', 'addisons'),
('C1541', 'addisons'),
('A176.', 'addisons'),

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
('663v.', 'asthmaRcp6')

--asthma: drugs 
--from QOF Asthma ruleset_v34.0
	--c1... � c15z. SABAs (not specific to asthma)
	--c19..% LABA (not specific to asthma)
	--c1B.. � c1EE. SABAs (not specific to asthma)
	--c1c..% fluticasone
	--c2...% (Excluding c23..%, c24..%) c3...% (Excluding c32..%) adrenaline
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

--asthma: permanent exclusions
--from QOF Asthma ruleset_v34.0 and SMASH
insert into codeGroups
values
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

--bp - diastolic sbp
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
	('8I3Y.', 'ckdTempEx'), --8I3Y.	00	Blood pressure procedure refused
	('8BL0.', 'ckdTempEx'), --8BL0.	00	Patient on maximal tolerated antihypertensive therapy

--dead
--from codelist creator 13/7/16 (synonyms:"dead", "death", "deceased", "died", "ghost", "fp22", "coroner", "cremation", "burial", "SD17", "post mortem", "med A", "crem. form", "mortality") 
	('T0y0.', 'dead'),
	('T0y00', 'dead'),
	('T0y01', 'dead'),
	('T0y02', 'dead'),
	('T0y03', 'dead'),
	('T0y0y', 'dead'),
	('T0y0z', 'dead'),
	('RyuC.', 'dead'),
	('RyuC0', 'dead'),
	('RyuC1', 'dead'),
	('RyuC2', 'dead'),
	('R21..', 'dead'),
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
	('Q48y6', 'dead'),
	('Q48y7', 'dead'),
	('Q016.', 'dead'),
	('L39A.', 'dead'),
	('L39A0', 'dead'),
	('L39A1', 'dead'),
	('L39B.', 'dead'),
	('L39X.', 'dead'),
	('G5751', 'dead'),
	('9OG3.', 'dead'),
	('9OG4.', 'dead'),
	('9O47.', 'dead'),
	('9O37.', 'dead'),
	('94...', 'dead'),
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
	('94Z0.', 'dead'),
	('94Z1.', 'dead'),
	('94Z2.', 'dead'),
	('94Z3.', 'dead'),
	('94Z4.', 'dead'),
	('94Z5.', 'dead'),
	('94Z6.', 'dead'),
	('94Z7.', 'dead'),
	('94Z8.', 'dead'),
	('94Z9.', 'dead'),
	('94ZA.', 'dead'),
	('94ZB.', 'dead'),
	('94ZC.', 'dead'),
	('94ZD.', 'dead'),
	('94ZE.', 'dead'),
	('94ZF.', 'dead'),
	('94ZG.', 'dead'),
	('9234.', 'dead'),
	('9134.', 'dead'),
	('913..', 'dead'),
	('8HG..', 'dead'),
	('7L1M0', 'dead'),
	('56C..', 'dead'),
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
	('4K9..', 'dead'),
	('4K91.', 'dead'),
	('4K92.', 'dead'),
	('4K93.', 'dead'),
	('4K94.', 'dead'),
	('4K95.', 'dead'),
	('4K96.', 'dead'),
	('4K9Z.', 'dead'),
	('38Qd.', 'dead'),
	('22J..', 'dead'),
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
	('22JZ.', 'dead'),


--DEregistration: patient DEregistration at a practice
--from codelist creator 13/7/16 (synonyms: "de-registered", "de-registration", "deregister", "deregistration",  "moved away", "left practice",   " ghost",   "de-reg",  "patient removed",  "FP22")
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
	('21263', 'dmPermEx'),
	('212H.', 'dmPermEx'),
	
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

--housebound
--from codelist creator on 20/10/16 (synonyms: "housebound", "house-bound", "immobil*")
	('R00C.', 'housebound'),
	('6AG..', 'housebound'),
	('3980.', 'housebound'),
	('13CA.', 'housebound'),
	('13CC.', 'housebound'),

--housebound perm ex
--manual search
	('13CW.', 'houseboundPermEx'),

--myocardial infarction - contemporary code
--from codelist creator on 26/10/16 Read v2 April 2016 (synonyms: "myocardial infarction", "heart attack", "stemi", "nstemi", "infarct"
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

--myocardial infarction - code from anytime

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

--registration: patient registration at a practice
--from codelist creator 13/7/16 (synonyms: "registration", "register", "new patient", "enroll", "new reg") 
('9hE..', 'registered'),
('9hE1.', 'registered'),
('9hE0.', 'registered'),
('8I3Y.', 'registered'),
('8BL0.', 'registered'),

--sick sinus
--from codelist creator on 26/10/16 Read v2 April 2016 (synonyms: "block", "mobitz", "av block", "atrioventricular block", "wenckebach"
('G57y3', 'sickSinus'),

--sodium
--from manual search of one GP practice records
('44I5.', 'sodium'),
('44h6.', 'sodium'),
('44h1.', 'sodium'),

--whitecoat hypertension
--from manual search
	('246M.', 'whiteCoat');

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
--DV visit (not GP) from manual search Rv2 April 2016 dictionary
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
	('14OI.', 'dna')


