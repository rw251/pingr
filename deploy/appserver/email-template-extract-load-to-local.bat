echo off

cd /d %~dp0

mongoimport -d pingr -c emails --drop --jsonArray in\emails.json
pause
