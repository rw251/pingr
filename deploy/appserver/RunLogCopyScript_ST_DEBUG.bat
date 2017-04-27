echo off
REM move to batch directory
cd /d %~dp0

REM This is the wrapper that the scheduled task will call
echo Running the script to execute the log copy... > log\logcopy.txt
echo Date and user: %date% %time% %username% >> log\logcopy.txt
echo Directory: %cd% >> log\logcopy.txt

RunLogCopyScript.bat >> log\logcopy.txt

exit
