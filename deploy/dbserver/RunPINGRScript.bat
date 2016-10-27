echo off
REM move to batch directory
cd /d %~dp0

SET DB=PatientSafety_Records
SET REPORT.DIRECTORY=D:\pingr\deploy\dbserver\out
SET RECEIVING.DIRECTORY=\\SRHTNWEHPSTRC1\ImporterPINGR

REM get todays date in correct format
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%-%MM%-%DD%" 

REM Execute the query stored procedure
sqlcmd -E -d %DB% -Q "EXEC [pingr.run-all] @ReportDate = $(ReportDate)" -v ReportDate = '%datestamp%' -h -1 -o log\pingr_query_result.txt

REM Get the output of the sp into errorl
REM 1000 : No need to run
REM 0 : Success
REM else an error
set /p errorl=< log\pingr_query_result.txt
for /f "tokens=* delims= " %%a in ("%errorl%") do set errorl=%%a

IF "%errorl%"=="1000" (
	echo "No need to run the job - either already done, or data not yet ready"
	goto :end
)

IF "%errorl%"=="0" (
	goto :nextstep
)

echo "Something's gone wrong"
cscript sendmail.vbs "The update sir stored procedure returned an error of %errorl%"
goto :end

:nextstep

REM Get log file
REM sqlcmd -E -d %INPUT.DB% -Q "select * from [log] where [date] > DATEADD(hour,-20, GETDATE())" -h -1 > temp\logdump.txt

REM send log file
REM cscript sendmail.vbs "Latest sql log dump" "E:\xfer\safety-data-importer\Batches\temp\logdump.txt"

REM DO EXTRACT
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.contacts]" queryout %REPORT.DIRECTORY%/contacts.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.demographics]" queryout %REPORT.DIRECTORY%/demographics.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.diagnoses]" queryout %REPORT.DIRECTORY%/diagnoses.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.impCodes]" queryout %REPORT.DIRECTORY%/impCodes.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.impOppCatsAndActions]" queryout %REPORT.DIRECTORY%/impOppCatsAndActions.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.indicator]" queryout %REPORT.DIRECTORY%/indicator.dat -c -T -b 10000000
bcp "SELECT * FROM [%DB%].[dbo].[output.pingr.measures]" queryout %REPORT.DIRECTORY%/measures.dat -c -T -b 10000000


REM get number of files in directory
for /f %%A in ('dir /b %REPORT.DIRECTORY%\^| find /v /c ""') do set cnt=%%A
echo File count = %cnt%

IF NOT "%cnt%"=="7" (
	GOTO :extractfailed
)

GOTO :finalstep

:extractfailed
echo "There aren't 7 files after export.  Instead there are: %cnt% files"
cscript sendmail.vbs "The pingr run all stored procedure succeeded but the report extractor failed.  There should be 7 files after export.  Instead there are: %cnt% files"
goto :end

:copyfailed
echo "The transfer of the data files from the sql server to the application server has failed."
cscript sendmail.vbs "The transfer of the data files from the sql server to the application server has failed."
goto :end

:finalstep
REM Move the files to the other server
REM Set a file called COPYING so that the inporter knows to wait
echo . > %RECEIVING.DIRECTORY%\COPYING.txt

move %REPORT.DIRECTORY%\* %RECEIVING.DIRECTORY%\
IF ERRORLEVEL 1 (
	GOTO :copyfailed
)

del %RECEIVING.DIRECTORY%\COPYING.txt

echo Report extractor finished.
goto :end

:end