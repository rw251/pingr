DEPLOY (app server - SRHTNWEHPSTRC1)
=========

npm run package

produces pingr.zip

Copy to SRHTNWEHPSTRC1 E:\Installation\PINGR\pingr.zip

ExtractZipAndFindDifferences.bat does what the name suggests

shows the files that have changes so you can copy them from: E:\Installation\PINGR\pingr-stage to D:\pingr

FindDifferences.bat does the same but without unzipping

Scheduled task called "PINGR Data Loader" runs every 20 minutes checking for data files in E:\ImporterPINGR

If there are precisely 8 files then it proceeds to process the data and load it into the mongo db called "pingr"

On success or failure an email is sent (no email if there are no files)

The app itself is started by a scheduled task that runs on server start up called "PINGR web app" - port 4002

Traffic to https://pingr.srft.nhs.uk is redirected via a reverse proxy (scheduled task on startup called "Reverse proxy for SMASH and PINGR" and located in D:\safety-dash\proxy) to 127.0.0.4002 where pingr is running.

Traffic to https://smash.srft.nhs.uk is redirected via the same reverse proxy to 127.0.0.1:3002


DEPLOY (app server - SRHTNWEHPSTRC2)
=========

navigate to D:\pingr on SRHTNWEHPSTRC2

pull latest code

if the stored procedures have changed (D:\pingr\deploy\dbserver\scripts) then execute Load_Stored_Procedures.bat

a scheduled task called "PINGR SIR Data Processor" runs at 03:30 each day. This executes the indicator stored procedures from the [pingr.run-all] wrapper stored procedure and copies output data into various sql tables. This data is then extracted and copied to the app server at \\SRHTNWEHPSTRC1\ImporterPINGR (E:\ImporterPINGR on SRHTNWEHPSTRC1).