Set MyEmail=CreateObject("CDO.Message")

MyEmail.Subject="Subject"
MyEmail.From="PINGR Alert <alert@smash.srft.nhs.uk>"
MyEmail.To="benjamin.brown@manchester.ac.uk;richard.williams2@manchester.ac.uk"
MyEmail.TextBody=WScript.Arguments(0)

if WScript.Arguments.count > 1 then
	MyEmail.AddAttachment WScript.Arguments(1)
end if

MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusing")=2

'SMTP Server
MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserver")="mail.srft.nhs.uk"

'SMTP Port
MyEmail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserverport")=25 

MyEmail.Configuration.Fields.Update
MyEmail.Send

set MyEmail=nothing