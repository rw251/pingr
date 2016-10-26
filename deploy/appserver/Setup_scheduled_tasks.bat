REM ================================
REM == Create the scheduled tasks ==
REM ================================

SET BATCH.DIRECTORY=D:\pingr\deploy\appserver\

SchTasks /RU system /Create /SC DAILY /TN "PINGR Data Loader" /TR "\"%BATCH.DIRECTORY%RunPINGRLoaderScript_ST_DEBUG.bat\"" /RI 20 /ST 00:12 /DU 23:00
