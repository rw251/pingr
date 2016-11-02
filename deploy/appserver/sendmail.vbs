Set MyEmail=CreateObject("CDO.Message")
Set wshShell = CreateObject( "WScript.Shell" )

MyEmail.Subject="PINGR update"
MyEmail.From="PINGR Alert <info@pingr.srft.nhs.uk>"
MyEmail.To="benjamin.brown@manchester.ac.uk;richard.williams2@manchester.ac.uk"
MyEmail.TextBody=WScript.Arguments(0)

if WScript.Arguments.count > 1 then
	MyEmail.AddAttachment WScript.Arguments(1)
end if

MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusing")=2

'SMTP Server
MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserver")="smtp.sendgrid.net"

'SMTP Port
MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserverport")=587

MyEmail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate")=1
MyEmail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusername")="apikey"
MyEmail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendpassword")=wshShell.ExpandEnvironmentStrings( "%PINGR_SMTP_PASS%" )


MyEmail.Configuration.Fields.Update
MyEmail.Send

set MyEmail=nothing
