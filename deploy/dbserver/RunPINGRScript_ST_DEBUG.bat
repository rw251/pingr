echo off
REM move to batch directory
cd /d %~dp0

REM get date for logging purposes
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"

REM This is the wrapper that the scheduled task will call
REM If midnight then overwrite file - else append to todays log
if "%HH%"=="00" (
	echo "New log file started" > log\update%DD%.txt
) 
echo Running the script to execute the pingr queries... >> log\update%DD%.txt
echo Date and user: %date% %time% %username% >> log\update%DD%.txt
echo Directory: %cd% >> log\update%DD%.txt

RunPINGRScript.bat >> log\update%DD%.txt

exit