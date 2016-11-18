echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records_Test

sqlcmd -E -d %DB% -i ../dbserver/scripts/GenerateMedicationTables.sql

bcp [%DB%].[dbo].[drugsOfInterest] in research-events-medication-htn\codes\code-list-drugs.csv -c -T -t ,

bcp "select distinct PatID, EntryDate, CodeValue, ReadCode, CodeUnits from [%DB%].[dbo].SIR_ALL_Records_No_Rubric s INNER JOIN [%DB%].[dbo].[drugsOfInterest] d on d.Code = s.ReadCode WHERE EntryDate > '2005-01-01' order by PatID, EntryDate" queryout research-events-medication-htn/resources/test.dat -c -T -b 10000

cd research-events-medication-htn

call npm start -- -x resources\test.dat

sort < resources\test.dat.done > resources\test.dat.done.sorted

perl parse_drug_file.pl resources\test.dat.done.sorted

bcp [%DB%].dbo.[drugEvents.temp] in resources\test.dat.done.sorted.processed -T -c -e error.txt -b 10000

cd ..

sqlcmd -E -d %DB% -i ../dbserver/scripts/PopulateMedicationTables.sql