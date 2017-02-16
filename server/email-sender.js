var nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');

exports.sendEmailViaHttp = function(from, toEmails, subject, text, html, attachment, callback) {
  var helper = require('sendgrid').mail;
  var to_email = toEmails[0];
  var content = new helper.Content('text/html', html);
  var mail = new helper.Mail(from, subject, to_email, content);

  toEmails.forEach(function(v,i){
    if(i===0) return;
    mail.personalizations[0].addTo(v);
  });

  var sg = require('sendgrid')(process.env.PINGR_SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    //console.log(response.body);
    //console.log(response.headers);
    if (error) return callback(error);
    return callback(null);
  });
};
//attachment if not null should be of the form:
//{"name":"<filename>","content","<content as string>"}
exports.sendEmail = function(mailConfig, subject, text, html, attachment, callback) {

  var smtpProperties = {};
  smtpProperties.host = mailConfig.smtp.host;
  smtpProperties.port = mailConfig.smtp.port;
  if (mailConfig.smtp.useAuth) {
    smtpProperties.auth = {
      user: mailConfig.smtp.username,
      pass: mailConfig.smtp.password
    };
    smtpProperties.service = 'SendGrid';
  } else {
    smtpProperties.tls = { rejectUnauthorized: false };
  }

  var transport = nodemailer.createTransport(smtpTransport(smtpProperties));

  var mailOptions = {
    from: mailConfig.options.from, // sender address
    to: mailConfig.options.to, // list of receivers (comma separated)
    subject: subject, // Subject line
    text: text // plaintext body
  };
  if (html) mailOptions.html = html;

  if (attachment && attachment.name && attachment.content) {
    mailOptions.attachments = [{ 'filename': attachment.name, 'content': attachment.content }];
  }


  // send mail with defined transport object
  transport.sendMail(mailOptions, function(error, info) {
    if (callback) {
      callback(error, info);
    }
  });
};
