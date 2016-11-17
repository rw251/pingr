echo off
REM move to batch directory
cd /d %~dp0

SET IMPORT_DIR=in\
SET OUTPUT_DIR=out\

echo Exporting the indicators from the dev database so that we can update them...
mongoexport -h ds011482.mlab.com:11482 -d pingr -c indicators -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --out %IMPORT_DIR%existingIndicators.json --jsonArray


echo Processing the files in the import directory: %IMPORT_DIR%
echo Output written to the out directory: %OUTPUT_DIR%
node ..\appserver\process.js %IMPORT_DIR% %OUTPUT_DIR%
IF ERRORLEVEL 1 (
	echo Something went wrong with
)

pause
