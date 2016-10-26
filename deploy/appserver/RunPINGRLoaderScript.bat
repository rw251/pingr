echo off
REM move to batch directory
cd /d %~dp0

SET IMPORT_DIR=E:\ImporterPINGR\

REM extract existing indicator data
mongoexport --db pingr --collection indicators --out %IMPORT_DIR%output.json

REM run the loader
node process.js

REM move the files
