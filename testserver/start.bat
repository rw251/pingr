cd /d %~dp0
node ..\node_modules\forever-win\bin\forever --append -o node_output.txt -e node_error.txt -l node_forever.txt start server.js 1> node_startup.txt 2>&1
