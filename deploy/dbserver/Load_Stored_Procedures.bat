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
sqlcmd -E -d %SMASH.DB% -i scripts/practiceList.practiceListSizes.eFI.sql

REM ===========================
REM == Add stored procedures ==
REM ===========================
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-CorrectCoding.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-Monitoring.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-CKD-Undiagnosed.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-ckdAndDm-bp-control.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-ckdAndProt-bp-control.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-htn-bp-control.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-ckd-bp-control.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-copd.exacerbation.rehab.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-htn-measures-undiagnosed.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-htn-med-undiagnosed.sql
sqlcmd -E -d %SMASH.DB% -i scripts/StoredProcedure-cvd.stroke.outcome.sql
sqlcmd -E -d %SMASH.DB% -i scripts/_Run_all.sql
sqlcmd -E -d %SMASH.DB% -i scripts/_generate_trend_data.sql
