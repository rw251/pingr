REM ================================
REM == Create the scheduled tasks ==
REM ================================

SET BATCH.DIRECTORY=D:\pingr\deploy\dbserver\

SchTasks /RU system /Create /SC DAILY /TN "PINGR SIR Data Processor" /TR "\"%BATCH.DIRECTORY%RunPINGRScript_ST_DEBUG.bat\"" /ST 03:30