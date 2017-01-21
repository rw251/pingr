--use P8701617062016
IF OBJECT_ID('dbo.regularText', 'U') IS NOT NULL DROP TABLE dbo.regularText;
CREATE TABLE regularText (textId varchar(32), [text] varchar(max));
insert into regularText
values
--medication links
('linkNiceAceiArbCkd', '<a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!prescribinginfosub:2" target="_blank">NICE advice on prescribing ACE Inhibitors and ARBs in CKD</a>'),
('linkNiceCcbHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:22" target="_blank">NICE advice on prescribing Calcium Channel Blockers</a>'),
('linkNiceThiazideHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:15" target="_blank">NICE advice on prescribing Thiazide-type Diuretics</a>'),
('linkNiceSpiroHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:29" target="_blank">NICE advice on prescribing Spironolactone</a>'),
('linkNiceAlphaHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:41" target="_blank">NICE advice on prescribing Alpha Blockers</a>'),
('linkNiceBbHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:35" target="_blank">NICE advice on prescribing Beta Blockers</a>'),

--NICE guidance links
('linkNiceBpTargetsCkd', '<a href="https://pathways.nice.org.uk/pathways/chronic-kidney-disease#path=view%3A/pathways/chronic-kidney-disease/management-of-chronic-kidney-disease.xml&content=view-node%3Anodes-blood-pressure-control-and-antihypertensive-treatment" target="_blank" title="NICE BP targets in CKD">NICE guidance on BP targets in CKD</a>'),
('linkNiceBpMxCkd', '<a href="https://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:5" target="_blank">NICE guidance on hypertension management in CKD (NOT diabetic)</a>'),
('linkNiceBpMxCkdDm', '<a href="http://cks.nice.org.uk/diabetes-type-2#!scenarioclarification:13" target="_blank">NICE guidance on hypertension management in CKD (diabetic)</a>'),
('linkNiceHtn', '<a href="https://www.nice.org.uk/guidance/cg127/chapter/1-Guidance" target="_blank" title="NICE Hypertension Guidelines">NICE Hypertension guidelines</a>'),
('linkNiceCopd', '<a href="https://www.nice.org.uk/guidance/cg101/chapter/1-Guidance" target="_blank" title="NICE COPD Guidelines">NICE COPD guidelines</a>'),
('linkNiceCksCopdPulRehab', '<a href="https://cks.nice.org.uk/chronic-obstructive-pulmonary-disease#!scenariorecommendation:2" target="_blank" title="NICE Clinical Knowledge Summary">NICE Clinical Knowledge Summary on Pulmonary Rehabilitation</a>'),

--SS guidance links
('linkSsCkdAki', '<a href="http://www.salfordccg.nhs.uk/download.cfm?doc=docm93jijm4n4921.pdf&ver=5226" target="_blank" title="Salford Standards">Salford Standards: Chronic Kidney Disease and Acute Kidney Injury</a>'),
('linkSsResp', '<a href="http://www.salfordccg.nhs.uk/respiratory-disease#key" target="_blank" title="Salford Standards">Salford Standards: Respiratory Disease</a>'),

--PINGR local links
('pingrCopdExacIndicator', '<a href="/#indicators/copd/exacerbation/rehab" target="_blank" title="COPD exacerbation and pulmonary rehab">COPD exacerbation and pulmonary rehab</a>'),

--Other guidance links
('linkBhsAbpm', '<a href="http://bhsoc.org/resources/abpm/" target="_blank" title="British Hypertension Society">Ambulatory Blood Pressure guidance - includes educational video, protocols, checklist, patient information leaflets, and patient diary handouts</a>'),
('linkBhsHbpmProtocol', '<a href="http://bhsoc.org/index.php/download_file/view/616/297/" target="_blank" title="British Hypertension Society">Home blood pressure monitoring protocol</a>'),
('linkBhsHbpmHowToPatients', '<a href="http://bhsoc.org/index.php/download_file/view/613/297/" target="_blank" title="British Hypertension Society">Home blood pressure monitoring step-by-step ''how to'' guide for patients</a>'),
('linkBhsHbpmPil', '<a href="http://bhsoc.org/index.php/download_file/view/612/297/" target="_blank" title="British Hypertension Society">Home blood pressure monitoring patient information leaflet</a>'),
('linkBhsHbpmDiary', '<a href="http://bhsoc.org/index.php/download_file/view/611/297/" target="_blank" title="British Hypertension Society">Home blood pressure monitoring diary</a>'),
('linkBhsHbpmGuide', '<a href="http://bhsoc.org/index.php/download_file/view/614/297/" target="_blank" title="British Hypertension Society">GP guide to implementing home monitoring</a>'),
('linkBhsHbpmCaseStudies', '<a href="http://bhsoc.org/index.php/download_file/view/615/297/" target="_blank" title="British Hypertension Society">Case studies</a>'),
('linkPatientUkAbpm', '<a href="http://patient.info/doctor/ambulatory-blood-pressure-monitoring" target="_blank" title="Patient UK">Patient UK guidance on Ambulatory Blood Pressure Monitoring</a>'),

--Resource links
('niceBpPresentation', '<a href="https://www.nice.org.uk/guidance/cg127/resources/slide-set-247332493" title="NICE presentation" target="_blank">NICE powerpoint presentation on hypertension guidelines</a>'),
('niceBpPathway', '<a href="http://www.gplocumcover.co.uk/docstore/hypertension.pdf" title="NICE pathway" target="_blank">NICE hypertension pathway</a>'),
('RpsGuidanceBp', '<a href="http://www.rpharms.com/support-pdfs/monitoring-blood-pressure.pdf" title="Royal Pharmaceutical Society" target="_blank">Royal Pharmaceutical Society handout on BP monitoring for pharmacists</a>'),
('DashDietSheet', '<a href="https://www.nhlbi.nih.gov/files/docs/public/heart/dash_brief.pdf" title="DASH diet" target="_blank">DASH diet (patient information sheet)</a>'),
('HtnDietExSheet', '<a href="https://www.nhlbi.nih.gov/files/docs/public/heart/hbp_low.pdf" title="National Heart, Lung, and Blood Institute" target="_blank">Exercise and diet guide to reduce blood pressure (patient information sheet)</a>'),
('BpUkDietSheet', '<a href="http://www.bloodpressureuk.org/BloodPressureandyou/Yourlifestyle/Eatingwell/main_content/EvQ2/downloadPublication" title="Blood Pressure UK" target="_blank">Eating a healthy blood pressure diet (patient information sheet)</a>'),
('BpExSheet', '<a href="http://www.acsm.org/docs/brochures/exercising-your-way-to-lower-blood-pressure.pdf" title="American College of Sports Medicine" target="_blank">Exercising Your Way to Lower Blood Pressure (patient information sheet)</a>'),
('ExceptionReportingReasons', '<a href="http://qualitysafety.bmj.com/content/25/9/653.full#boxed-text-1" title="BMJ Quality and Safety" target="_blank">Eligible reasons for exception reporting</a>'),
('BtsPulRehabStandards', '<a href="https://www.brit-thoracic.org.uk/document-library/clinical-information/pulmonary-rehabilitation/bts-quality-standards-for-pulmonary-rehabilitation-in-adults/" title="British Thoracic Society" target="_blank">British Thoracic Society: Quality Standards for Pulmonary Rehabilitation</a>'),
('BlfPulRehabPil', '<a href="https://www.blf.org.uk/support-for-you/exercise/pulmonary-rehabilitation" title="British Lung Foundation" target="_blank">British Lung Foundation: Patient Information Leaflet on Pulmonary Rehabilitation</a>'),

--evidence
('linkBmjCkdBp', '<a href="http://www.bmj.com/content/347/bmj.f5680" target="_blank" title="BMJ">Why it is important to control BP in CKD (BMJ article)</a>'),
('linkBjgpBpDoctorsHigher', '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3964448/pdf/bjgpapr2014-64-621-e223.pdf" target="_blank" title="British Journal of General Practice">Doctors record higher blood pressures than nurses: systematic review and meta-analysis (BJGP article)</a>'),
('linkPulRehabAfterExacReview', '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1164434/" target="_blank" title="Respiratory Research Journal">Systematic Review on the effectiveness of Pulmonary Rehabilitation after COPD exacerbations</a>'),

--PILs
('linkPilCkdBp', '<a href="https://www.kidney.org/sites/default/files/docs/hbpandckd.pdf" target="_blank" target="_blank">Patient leaflet: "High BP and Chronic Kidney Disease"</a>')

