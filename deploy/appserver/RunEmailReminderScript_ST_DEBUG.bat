echo off
REM move to batch directory
cd /d %~dp0

REM This is the wrapper that the scheduled task will call
echo Running the script to execute the email reminders... > log\reminders.txt
echo Date and user: %date% %time% %username% >> log\reminders.txt
echo Directory: %cd% >> log\reminders.txt

RunEmailReminderScript.bat >> log\reminders.txt

exit
