echo off

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse HEAD`) DO (
SET LOCAL=%%F
)
ECHO %LOCAL%

FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse @{u}`) DO (
SET REMOTE=%%F
)
ECHO %REMOTE%