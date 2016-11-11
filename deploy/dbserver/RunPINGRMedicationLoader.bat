echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records

REM Execute the query stored procedure
sqlcmd -E -d %DB% -i scripts/GenerateMedicationTables.sql

bcp [%DB%].[dbo].[drugsOfInterest] in 'research-events-medication-htn/codes/code-list-drugs.csv' -c -T

REM extract medication data
bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE PatID < 50000 AND EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test-0-49999.dat -c -T -b 10000
bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE PatID < 100000 AND PatID >49999 AND EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test-50000-99999.dat -c -T -b 10000
bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE PatID < 150000 AND PatID >99999 AND EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test-100000-149999.dat -c -T -b 10000
bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE PatID < 200000 AND PatID >149999 AND EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test-150000-199999.dat -c -T -b 10000
bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE PatID > 199999 AND EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test-200000-.dat -c -T -b 10000

cd research-events-medication-htn

REM Process the files
npm start -- -x resources\test-0-49999.dat
npm start -- -x resources\test-50000-99999.dat
npm start -- -x resources\test-100000-149999.dat
npm start -- -x resources\test-150000-199999.dat
npm start -- -x resources\test-200000-.dat

REM Sort the files
sort < resources\test-0-49999.dat.done > resources\test-0-49999.dat.done.sorted
sort < resources\test-50000-99999.dat.done > resources\test-50000-99999.dat.done.sorted
sort < resources\test-100000-149999.dat.done > resources\test-100000-149999.dat.done.sorted
sort < resources\test-150000-199999.dat.done > resources\test-150000-199999.dat.done.sorted
sort < resources\test-200000-.dat.done > resources\test-200000-.dat.done.sorted

REM Use perl script to generate event data
perl parse_drug_file.pl resources\test-0-49999.dat.done.sorted
perl parse_drug_file.pl resources\test-50000-99999.dat.done.sorted
perl parse_drug_file.pl resources\test-100000-149999.dat.done.sorted
perl parse_drug_file.pl resources\test-150000-199999.dat.done.sorted
perl parse_drug_file.pl resources\test-200000-.dat.done.sorted

REM Load into DB
bcp [%DB%].dbo.[drugEvents.temp] in resources\test-0-49999.dat.done.sorted.processed -T -c -e error.txt -b 10000
bcp [%DB%].dbo.[drugEvents.temp] in resources\test-50000-99999.dat.done.sorted.processed -T -c -e error.txt -b 10000
bcp [%DB%].dbo.[drugEvents.temp] in resources\test-100000-149999.dat.done.sorted.processed -T -c -e error.txt -b 10000
bcp [%DB%].dbo.[drugEvents.temp] in resources\test-150000-199999.dat.done.sorted.processed -T -c -e error.txt -b 10000
bcp [%DB%].dbo.[drugEvents.temp] in resources\test-200000-.dat.done.sorted.processed -T -c -e error.txt -b 10000

cd ..

REM Populate the medication tables
sqlcmd -E -d %DB% -i scripts/PopulateMedicationTables.sql

:end