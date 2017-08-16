REM ================================
REM == Create the scheduled tasks ==
REM ================================

SET BATCH.DIRECTORY=D:\pingr\deploy\dbserver\

SchTasks /RU system /Create /SC DAILY /TN "PINGR SIR Data Processor" /TR "\"%BATCH.DIRECTORY%RunPINGRScript_ST_DEBUG.bat\"" /ST 03:30

REM Might need to restart TaskEng.exe to pick up new env variables
REM Also if you setup a task with a /RI and a /DU then it doesn't pick of env vars - but if you do it without then it's fine:
REM e.g. the following fails:
REM SchTasks /RU system /Create /SC DAILY /TN "PINGR Email Reminder" /TR "\"%BATCH.DIRECTORY%RunEmailReminderScript_ST_DEBUG.bat\"" /RI 60 /ST 04:03 /DU 23:00
REM but if you modify it to:
REM SchTasks /RU system /Create /SC HOURLY /TN "PINGR Email Reminder" /TR "\"%BATCH.DIRECTORY%RunEmailReminderScript_ST_DEBUG.bat\"" /ST 04:03
REM then it works!.