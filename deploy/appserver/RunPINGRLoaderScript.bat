echo off
REM move to batch directory
cd /d %~dp0

SET IMPORT_DIR=E:\ImporterPINGR\

IF EXIST %IMPORT_DIR%COPYING.txt (
	echo Currently copying so let's leave it for now
	goto :end
)

for /f %%A in ('dir /b /a-d %IMPORT_DIR%^| find /v /c ""') do set cnt=%%A

IF NOT "%cnt%"=="8" (
	echo Only %cnt% files - should be 8 - so i'm stopping
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
IF NOT EXIST %IMPORT_DIR%diagnoses.dat (
	SET ERRRR=diagnoses file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%impCodes.dat (
	SET ERRRR=impCodes file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%impOppCatsAndActions.dat (
	SET ERRRR=impOppCatsAndActions file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%indicator.dat (
	SET ERRRR=indicator file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%measures.dat (
	SET ERRRR=measures file is missing
	goto :failed
)
IF NOT EXIST %IMPORT_DIR%text.dat (
	SET ERRRR=text file is missing
	goto :failed
)

REM extract existing indicator data
mongoexport --db pingr --collection indicators --out %IMPORT_DIR%existingIndicators.json --jsonArray

REM run the loader
node process.js

move %IMPORT_DIR%\* %IMPORT_DIR%\archive\

REM temp until text is auto generated
move %IMPORT_DIR%\archive\text.dat %IMPORT_DIR%\text.dat

REM move the files
mongoimport --db pingr --collection text --drop data/text.json --jsonArray
mongoimport --db pingr --collection indicators --drop data/indicators.json --jsonArray
mongoimport --db pingr --collection patients --drop data/patients.json --jsonArray
mongoimport --db pingr --collection practices --drop in/practices.json --jsonArray

cscript sendmail.vbs "All files successfully loaded into mongo"

goto :end

:failed
echo %ERRRR%
cscript sendmail.vbs "Loading the data into the app mongo db failed because: %ERRRR%"

:end
