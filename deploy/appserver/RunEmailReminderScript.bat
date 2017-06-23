echo off
REM move to batch directory
cd /d %~dp0

rem find patients with last login > 2wks && last_email > 2wks && !optout

node emailReminders.js

:end
