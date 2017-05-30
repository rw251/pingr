echo off
REM move to batch directory
cd /d %~dp0

rem copy logs to dropbox

node copyLogsToDropbox.js

:end
