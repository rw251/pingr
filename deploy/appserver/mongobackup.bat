echo off

cd /d %~dp0
SET ZIP.EXE="c:\Program Files\7-Zip\7z.exe"

REM tidy up if not already done
del pingr.tar

mongodump --db pingr -c indicators
mongodump --db pingr -c practices
mongodump --db pingr -c text
mongodump --db pingr -c users

REM Get the time in a locale independent way
FOR /F %%A IN ('WMIC OS GET LocalDateTime ^| FINDSTR \.') DO @SET B=%%A

cd dump
%ZIP.EXE% a pingr.tar pingr
%ZIP.EXE% a -tzip ..\backups\pingr.%B:~0,14%.tgz pingr.tar

REM tidy up
del pingr.tar
