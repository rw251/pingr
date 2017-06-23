echo off
REM move to batch directory
cd /d %~dp0

SET IMPORT.DIR=in
SET OUTPUT.DIR=out

if not exist "%OUTPUT.DIR%" mkdir %OUTPUT.DIR%

echo Exporting the indicators from the dev database so that we can update them...
echo mongoexport -h ds011482.mlab.com:11482 -d pingr -c indicators -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --out %IMPORT.DIR%\existingIndicators.json --jsonArray
mongoexport -h ds011482.mlab.com:11482 -d pingr -c indicators -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --out %IMPORT.DIR%\existingIndicators.json --jsonArray


echo Processing the files in the import directory: %IMPORT.DIR%
echo Output written to the out directory: %OUTPUT.DIR%
node ..\appserver\process.js %IMPORT.DIR%\ %OUTPUT.DIR%\
IF ERRORLEVEL 1 (
	echo Something went wrong with
	goto :end
)

echo I think everything is ok. Check the %OUTPUT.DIR% directory to see if the processed files have updated.

:end
pause
