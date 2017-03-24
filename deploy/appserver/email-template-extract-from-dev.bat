echo off

cd /d %~dp0

mongo --quiet %PINGR_MONGO_URL% --eval "printjson(db.emails.find({},{_id:0, __v:0}).toArray())" > in\emails.json
pause
