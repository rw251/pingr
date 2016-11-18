REM move to batch dir 
cd /d %~dp0

REM Ensure the following are on the command line
sqlcmd -?
IF %ERRORLEVEL% neq 0 (
	ECHO sqlcmd is not found on the command line
	pause
	GOTO :endoffile
)

SET SMASH.DB=PatientSafety_Records

REM ====================================
REM == Add code groupings and text    ==
REM ====================================
sqlcmd -E -d %SMASH.DB% -i scripts/codeGroups.sql
sqlcmd -E -d %SMASH.DB% -i scripts/regularText.sql

REM ===========================
REM == Add stored procedures ==
REM ===========================
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-CorrectCoding.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-Monitoring.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-Undiagnosed.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-BP.sql
sqlcmd -E -d %SMASH.DB% -i scripts/_Run_all.sql
sqlcmd -E -d %SMASH.DB% -i scripts/_generate_trend_data.sql

REM ==================================
REM == Extract NHS lookup for mongo ==
REM ==================================
REM bcp "SELECT '{\"_id\":' + CONVERT(nvarchar, patid) + ', \"nhs\": ' + CONVERT(nvarchar, nhsNumber) + '.0 }' from [%SMASH.DB%].[dbo].[patientsNHSNumbers]" queryout temp/patients.dat -c -T -b 10000000


