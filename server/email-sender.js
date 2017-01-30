var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

//attachment if not null should be of the form:
//{"name":"<filename>","content","<content as string>"}
exports.sendEmail = function(mailConfig, subject, text, html, attachment, callback) {

    var smtpProperties = {};
    smtpProperties.host = mailConfig.smtp.host;
    smtpProperties.port = mailConfig.smtp.port;
    if(mailConfig.smtp.useAuth) {
        smtpProperties.auth = {
            user: mailConfig.smtp.username,
            pass: mailConfig.smtp.password
        };
        smtpProperties.service='SendGrid';
    }
    else {
        smtpProperties.tls = { rejectUnauthorized:false };
    }

    var transport = nodemailer.createTransport(smtpTransport(smtpProperties));

    var mailOptions = {
        from: mailConfig.options.from, // sender address
        to: mailConfig.options.to, // list of receivers (comma separated)
        subject: subject, // Subject line
        text: text // plaintext body
    };
    if(html) mailOptions.html = html;

    if(attachment && attachment.name && attachment.content){
      mailOptions.attachments = [{'filename': attachment.name, 'content': attachment.content}];
    }


// send mail with defined transport object
   transport.sendMail(mailOptions, function (error, info) {
        if (callback) {
            callback(error, info);
        }
    });
};
