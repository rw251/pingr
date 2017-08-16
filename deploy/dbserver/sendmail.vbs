Set MyEmail=CreateObject("CDO.Message")

MyEmail.Subject="PINGR update"
MyEmail.From="PINGR Alert <info@pingr.srft.nhs.uk>"
MyEmail.To="benjamin.brown@manchester.ac.uk;richard.williams2@manchester.ac.uk"
MyEmail.Bcc="1234richardwilliams@gmail.com"
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
