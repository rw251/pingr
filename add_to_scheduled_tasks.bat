SET START.BAT=D:\pingr\start.bat

SchTasks /RU system /Create /SC ONSTART /TN "PINGR web app" /TR "\"%START.BAT%\""
