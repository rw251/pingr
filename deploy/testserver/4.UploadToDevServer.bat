echo off
REM move to batch directory
cd /d %~dp0

mongoimport -h ds011482.mlab.com:11482 -d pingr -c text -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop out/text.json --jsonArray
mongoimport -h ds011482.mlab.com:11482 -d pingr -c indicators -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop out/indicators.json --jsonArray
mongoimport -h ds011482.mlab.com:11482 -d pingr -c patients -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop out/patients.json
mongoimport -h ds011482.mlab.com:11482 -d pingr -c practices -u %PINGR_MONGO_DEV_USER% -p %PINGR_MONGO_DEV_PASSWORD% --drop out/practices.json --jsonArray
