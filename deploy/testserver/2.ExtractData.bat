echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records_Test
SET REPORT.DIRECTORY=in

if not exist "%REPORT.DIRECTORY%" mkdir %REPORT.DIRECTORY%

REM DO EXTRACT
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.contacts] where [date] > '2012-01-01'" queryout %REPORT.DIRECTORY%/contacts.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.demographics]" queryout %REPORT.DIRECTORY%/demographics.dat -c -T -b 10000000
bcp "SELECT PatID,indicatorId,replace (replace (why, char(10), ''), char(13), '')  FROM [%DB%].[dbo].[output.pingr.denominators]" queryout %REPORT.DIRECTORY%/denominators.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.diagnoses] order by PatID" queryout %REPORT.DIRECTORY%/diagnoses.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.impCodes]" queryout %REPORT.DIRECTORY%/impCodes.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.patActions]" queryout %REPORT.DIRECTORY%/patActions.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.orgActions]" queryout %REPORT.DIRECTORY%/orgActions.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.indicator]" queryout %REPORT.DIRECTORY%/indicator.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.indicatorOutcome]" queryout %REPORT.DIRECTORY%/indicatorOutcome.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.indicatorMapping]" queryout %REPORT.DIRECTORY%/indicatorMapping.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.measures] where [date] > '2012-01-01' order by PatID" queryout %REPORT.DIRECTORY%/measures.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[MEDICATION_EVENTS] WHERE PatID in (select distinct PatID from [%DB%].[dbo].[output.pingr.patActions]) order by PatID" queryout %REPORT.DIRECTORY%/medications.dat -c -T -b 10000000
bcp "SELECT left(indicatorId,CHARINDEX('.', indicatorId)-1),SUBSTRING(indicatorId,CHARINDEX('.', indicatorId)+1,CHARINDEX('.', indicatorId,CHARINDEX('.', indicatorId)+1)-1-CHARINDEX('.', indicatorId)),right(indicatorId,len(indicatorId)-CHARINDEX('.', indicatorId,CHARINDEX('.', indicatorId)+1)),textId, text FROM [%DB%].[dbo].[pingr.text]" queryout %REPORT.DIRECTORY%/text.dat -c -T -b 10000000

echo .
echo .
echo Unless you saw any errors then looks like we're done. Check the %REPORT.DIRECTORY% directory to see if the data files have been updated.

pause
