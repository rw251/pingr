cd /d %~dp0
node_modules\.bin\forever --append -o E:\logs\pingr_node_output.txt -e E:\logs\pingr_node_error.txt -l E:\logs\pingr_node_forever.txt start server.js 1> E:\logs\pingr_node_startup.txt 2>&1
