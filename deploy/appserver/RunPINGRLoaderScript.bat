echo off
REM move to batch directory
cd /d %~dp0

SET IMPORT_DIR=E:\ImporterPINGR\

IF EXIST %IMPORT_DIR%COPYING.txt (
	echo Currently copying so let's leave it for now
	goto :end
)

for /f %%A in ('dir /b /a-d %IMPORT_DIR%^| find /v /c ""') do set cnt=%%A

SET EXPECTED.FILE.NUMBER=13


IF NOT "%cnt%"=="%EXPECTED.FILE.NUMBER%" (
	echo Only %cnt% files - should be %EXPECTED.FILE.NUMBER% - so i'm stopping
	goto :end
)
SET ERRRR=""
IF NOT EXIST %IMPORT_DIR%contacts.dat (
	SET ERRRR=contacts file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%demographics.dat (
	SET ERRRR=demographics file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%denominators.dat (
	SET ERRRR=denominators file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%diagnoses.dat (
	SET ERRRR=diagnoses file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%impCodes.dat (
	SET ERRRR=impCodes file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%patActions.dat (
	SET ERRRR=patActions file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%orgActions.dat (
	SET ERRRR=orgActions file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%indicator.dat (
	SET ERRRR=indicator file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%indicatorOutcome.dat (
	SET ERRRR=indicatorOutcome file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%indicatorMapping.dat (
	SET ERRRR=indicatorMapping file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%measures.dat (
	SET ERRRR=measures file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%medications.dat (
	SET ERRRR=medications file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%text.dat (
	SET ERRRR=text file is missing
	goto :failed
)

REM extract existing indicator data
mongoexport --db pingr --collection indicators --out %IMPORT_DIR%existingIndicators.json --jsonArray

REM run the loader
REM Based on this to stop the HEAP errors: http://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory
node --max_old_space_size=4096 process.js
IF ERRORLEVEL 1 (
	GOTO :nodefailed
)

GOTO :nodesuccess

:nodefailed
cscript sendmail.vbs "The mongo importer failed to load the most recent data. The site is still running but the data is not bang up to date."
goto :end

:nodesuccess

move %IMPORT_DIR%\* %IMPORT_DIR%\archive\

REM temp until text is auto generated
rem move %IMPORT_DIR%\archive\text.dat %IMPORT_DIR%\text.dat

REM move the files
mongoimport --db pingr --collection text --drop data/text.json --jsonArray
mongoimport --db pingr --collection indicators --drop data/indicators.json --jsonArray
mongoimport --db pingr --collection patients --drop data/patients.json
mongoimport --db pingr --collection practices --drop in/practices.json --jsonArray

cscript sendmail.vbs "All files successfully loaded into mongo"

goto :dev

:failed
echo %ERRRR%
cscript sendmail.vbs "Loading the data into the app mongo db failed because: %ERRRR%"
goto :end

:dev
echo mongoimport -h ds011482.mlab.com:11482 -d pingr -c text -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop dev_text.json --jsonArray > data/dev_loader.bat
echo mongoimport -h ds011482.mlab.com:11482 -d pingr -c indicators -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop dev_indicators.json --jsonArray >> data/dev_loader.bat
echo mongoimport -h ds011482.mlab.com:11482 -d pingr -c patients -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop dev_patients.json >> data/dev_loader.bat
echo mongoimport -h ds011482.mlab.com:11482 -d pingr -c practices -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop dev_practices.json --jsonArray >> data/dev_loader.bat

:end
