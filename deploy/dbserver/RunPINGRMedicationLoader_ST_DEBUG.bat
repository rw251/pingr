echo off
REM move to batch directory
cd /d %~dp0

REM This is the wrapper that the scheduled task will call
echo Running the script to execute the pingr queries... > log\medupdate.txt
echo Date and user: %date% %time% %username% >> log\medupdate.txt
echo Directory: %cd% >> log\medupdate.txt

RunPINGRMedicationLoader.bat >> log\medupdate.txt

exit