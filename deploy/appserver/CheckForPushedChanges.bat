echo off

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse HEAD`) DO (
SET LOCAL=%%F
)

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse @{u}`) DO (
SET REMOTE=%%F
)

IF "%LOCAL%"=="%REMOTE%" (
	ECHO SAME
)

ECHO DIFF