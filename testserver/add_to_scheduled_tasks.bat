SET START.BAT=D:\pingr\testserver\start.bat

SchTasks /RU system /Create /SC ONSTART /TN "Maintenance mode for PINGR" /TR "\"%START.BAT%\""
