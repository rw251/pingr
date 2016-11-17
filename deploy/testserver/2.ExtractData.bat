echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records

REM DO EXTRACT
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.contacts]" queryout %REPORT.DIRECTORY%/contacts.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.demographics]" queryout %REPORT.DIRECTORY%/demographics.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.diagnoses]" queryout %REPORT.DIRECTORY%/diagnoses.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.impCodes]" queryout %REPORT.DIRECTORY%/impCodes.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.patActions]" queryout %REPORT.DIRECTORY%/patActions.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.indicator]" queryout %REPORT.DIRECTORY%/indicator.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.measures]" queryout %REPORT.DIRECTORY%/measures.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[MEDICATION_EVENTS]" queryout %REPORT.DIRECTORY%/medications.dat -c -T -b 10000000
bcp "SELECT left(indicatorId,CHARINDEX('.', indicatorId)-1),SUBSTRING(indicatorId,CHARINDEX('.', indicatorId)+1,CHARINDEX('.', indicatorId,CHARINDEX('.', indicatorId)+1)-1-CHARINDEX('.', indicatorId)),right(indicatorId,len(indicatorId)-CHARINDEX('.', indicatorId,CHARINDEX('.', indicatorId)+1)),textId, text FROM [%DB%].[dbo].[pingr.text]" queryout %REPORT.DIRECTORY%/text.dat -c -T -b 10000000

pause