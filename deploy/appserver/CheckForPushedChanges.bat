echo off
REM move to batch directory
cd /d %~dp0

REM Then move to root of application
cd ../..

git fetch

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse HEAD`) DO (
SET LOCAL=%%F
)

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse @{u}`) DO (
SET REMOTE=%%F
)

IF NOT "%LOCAL%"=="%REMOTE%" (
	ECHO SAME
	git pull origin dev
	
	npm install
	
	npm run build
	
)