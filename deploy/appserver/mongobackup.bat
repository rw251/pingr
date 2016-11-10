echo off

cd /d %~dp0
SET ZIP.EXE="c:\Program Files\7-Zip\7z.exe"

REM tidy up if not already done
del pingr.tar

mongoexport -d pingr -c indicators -o dump/indicators.json
mongoexport -d pingr -c practices -o dump/practices.json
mongoexport -d pingr -c text -o dump/text.json
mongoexport -d pingr -c users -o dump/users.json
mongoexport -d pingr -c patients -f "patientId,characteristics.practiceId,standards,actions" -o dump/patients.csv

REM Get the time in a locale independent way
FOR /F %%A IN ('WMIC OS GET LocalDateTime ^| FINDSTR \.') DO @SET B=%%A

cd dump
%ZIP.EXE% a pingr.tar *
%ZIP.EXE% a -tzip ..\backups\pingr.%B:~0,14%.tgz pingr.tar

REM tidy up
del pingr.tar
