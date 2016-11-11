IF OBJECT_ID('dbo.actionText', 'U') IS NOT NULL DROP TABLE dbo.actionText;
CREATE TABLE actionText (textId varchar(32), [text] varchar(max));
insert into actionText
values
--medication links
('linkNiceAceiArbCkd', '<a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!prescribinginfosub:2" target="_blank">NICE advice on prescribing ACE Inhibitors and ARBs in CKD</a>'),
('linkNiceCcbHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:22" target="_blank">NICE advice on prescribing Calcium Channel Blockers</a>'),
('linkNiceThiazideHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:15" target="_blank">NICE advice on prescribing Thiazide-type Diuretics</a>'),
('linkNiceSpiroHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:29" target="_blank">NICE advice on prescribing Spironolactone</a>'),
('linkNiceAlphaHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:41" target="_blank">NICE advice on prescribing Alpha Blockers</a>'),
('linkNiceBbHtn', '<a href="http://cks.nice.org.uk/hypertension-not-diabetic#!prescribinginfosub:35" target="_blank">NICE advice on prescribing Beta Blockers</a>'),

--NICE guidance links
('linkNiceBpTargetsCkd', '<a href="http://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:5" target="_blank">NICE guidance on BP targets in CKD</a>'),
('linkNiceBpMxCkd', '<a href="https://cks.nice.org.uk/chronic-kidney-disease-not-diabetic#!scenariorecommendation:5" target="_blank">NICE guidance on hypertension management in CKD (NOT diabetic)</a>'),
('linkNiceBpMxCkdDm', '<a href="http://cks.nice.org.uk/diabetes-type-2#!scenarioclarification:13" target="_blank">NICE guidance on hypertension management in CKD (diabetic)</a>'),
('linkNiceHtn', '<a href="https://www.nice.org.uk/guidance/cg127/chapter/1-Guidance" target="_blank" title="NICE Hypertension Guidelines">NICE Hypertension guidelines</a>'),

--Other guidance links
('linkBhsAbpm', '<a href="http://bhsoc.org/resources/abpm/" target="_blank" title="British Hypertension Society">British Hypertension Society guidance on Ambulatory Blood Pressure Monitoring - includes educational video, protocols, checklist, patient information leaflets, and patient diary handouts</a>'),
('linkPatientUkAbpm', '<a href="http://patient.info/doctor/ambulatory-blood-pressure-monitoring" target="_blank" title="Patient UK">Patient UK guidance on Ambulatory Blood Pressure Monitoring</a>'),

--evidence
('linkBmjCkdBp', '<a href="http://www.bmj.com/content/347/bmj.f5680" target="_blank" target="_blank">Why it is important to control BP in CKD (BMJ article)</a>'),

--PILs
('linkPilCkdBp', '<a href="https://www.kidney.org/sites/default/files/docs/hbpandckd.pdf" target="_blank" target="_blank">Patient leaflet: "High BP and Chronic Kidney Disease"</a>')

