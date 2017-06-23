echo off
REM move to batch directory
cd /d %~dp0

REM This is the wrapper that the scheduled task will call
echo Running the script to execute the pingr queries... > log\update.txt
echo Date and user: %date% %time% %username% >> log\update.txt
echo Directory: %cd% >> log\update.txt

RunPINGRLoaderScript.bat >> log\update.txt

exit
