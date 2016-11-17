echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records

REM get todays date in correct format
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%-%MM%-%DD%" 
echo Today's date: %datestamp%

REM Execute the query stored procedure
sqlcmd -E -d %DB% -Q "EXEC [pingr.run-all] @ReportDate = $(ReportDate)" -v ReportDate = '%datestamp%' -h -1 -o log\pingr_query_result.txt

pause