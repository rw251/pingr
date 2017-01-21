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
--339O.	00	Forced expired volume in 1 second
--339O0	00	Forced expired volume in 1 second reversibility
--339O1	00	Forced expired volume in one second/vital capacity ratio
--339R.	00	FEV1/FVC percent
('339S.', 'fev1pred'), --	00	Percent predicted FEV1
('339S0', 'fev1pred'), --	00	Percentage predicted forced expiratory volume in 1 second after bronchodilation
('339T.', 'fev1pred'), --	00	FEV1/FVC > 70% of predicted
('339U.', 'fev1pred'), --	00	FEV1/FVC < 70% of predicted
--339a.	00	FEV1 before bronchodilation
--339b.	00	FEV1 after bronchodilation
--339e.	00	FEV1 pre steroids
--339f.	00	FEV1 post steroids
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
('H3122', 'copdExacSs'),

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

--lrti
--from codelist creator on 7/12/16 (synonyms:  "lrti",  "respiratory tract infection",  "chest infection",  "respiratory infection",  "lung infection",  "pneumonia",  "pleurisy",  "pleuritic",  "pleural effusion",  "pulmonary infection",  "pulmonary abscess",  "tuberculosis",  "tuberculous",  "bronchitis",  "bronchiolitis",  "resp tract infection",  "chest cold",  "lung consolidation",  "empyema",  "pleural abscess",  "pyopneumothorax",  "pyothorax",  "pulmonary aspergillus",  "pulmonary aspergillosis",  "pulmonary histoplas*")
insert into codeGroups
values
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
('323Z.', 'MInow')

--myocardial infarction - code from anytime

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
	('9N81.', 'dna')	--	Patient never seen


