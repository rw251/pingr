echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records_Test
SET LOG.DIRECTORY=log

if not exist "%LOG.DIRECTORY%" mkdir %LOG.DIRECTORY%

REM get todays date in correct format
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%-%MM%-%DD%" 
echo Today's date: %datestamp%

REM Execute the query stored procedure
sqlcmd -E -d %DB% -Q "EXEC [pingr.run-all] @ReportDate = $(ReportDate)" -v ReportDate = '%datestamp%' -h -1 -o %LOG.DIRECTORY%\pingr_query_result.txt

REM Get the output of the sp into errorl
REM 1000 : No need to run
REM 0 : Success
REM else an error
set /p errorl=< %LOG.DIRECTORY%\pingr_query_result.txt
for /f "tokens=* delims= " %%a in ("%errorl%") do set errorl=%%a


IF "%errorl%"=="0" (
	echo Looks like it worked ok.. I think!
	goto :end
)

echo I don't thing tath worked. Can you execute the sp pingr.run-all from sql server management studio without error?

:end
pause