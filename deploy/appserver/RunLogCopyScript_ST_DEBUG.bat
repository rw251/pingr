echo off
REM move to batch directory
cd /d %~dp0

REM get date for logging purposes
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"

REM This is the wrapper that the scheduled task will call
REM Only runs once a day so can always overwrite log

echo "New log file started" > log\logcopy%DD%.txt
echo Running the script to execute the log copy... >> log\logcopy%DD%.txt
echo Date and user: %date% %time% %username% >> log\logcopy%DD%.txt
echo Directory: %cd% >> log\logcopy%DD%.txt

RunLogCopyScript.bat >> log\logcopy%DD%.txt

exit
