var nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  sendgrid = require('sendgrid');

/**
 * Send an email via the sendgrid service. Requires a env setting called
 * $PINGR_SENDGRID_API_KEY set to your api key
 * @param  {Object.<string, string>}   from object with keys of email and name
 * @param  {Object.<string, string>[]}   toEmails Array of objects with keys of
 *                                       email and name
 * @param  {string}   subject    The subject of the email
 * @param  {string}   text       The fallback text of the email
 * @param  {string}   html       The HTML of the email body
 * @param  {Object.<string, string>}   attachment Object with a name and a
 *                                     content property each being a string
 * @param  {Function} callback   Executed on completion
 */
var sendEmailViaSendgridHttp = function(from, toEmails, subject, text, html, attachment, callback) {
  var helper = sendgrid.mail;
  fromEmail = new helper.Email(from.email, from.name);
  toEmails = toEmails.map(function(v) {
    return new helper.Email(v.email, v.name);
  });
  var content = new helper.Content('text/html', html);
  var mail = new helper.Mail(from, subject, toEmails.shift(), content);

  // Add extra emails if they exist
  toEmails.forEach(function(v, i) {
    mail.personalizations[0].addTo(v);
  });

  // Add text content if it exists
  if (text) {
    content = new helper.Content("text/plain", text);
    mail.addContent(content);
  }

  var sg = sendgrid(process.env.PINGR_SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    if (error) return callback(error);
    return callback(null);
  });
};

const EMAILTYPE = {
  SENDGRIDHTTP: "SENDGRIDHTTP",
  SENDGRIDSMTP: "SENDGRIDSMTP",
  SMTP: "SMTP"
};

/**
 * Send an email. NB the type property of the config should be left blank and
 * is retrieved from the environment setting of $PINGR_EMAIL_METHOD
 * @param  {Object} config Properties:
 *                         type: ["SENDGRIDHTTP", "SENDGRIDSMTP", "SMTP"]
 *                         from: {
 *                          name: "Ben Brown",
 *                          email: "benjamin.brown@manchester.ac.uk"
 *                         },
 *                         to: [
 *                          {
 *                            name: "Ben Brown",
 *                            email: "benjamin.brown@manchester.ac.uk"
 *                           }
 *                         ],
 *                         subject: "The subject of the email",
 *                         text: "Plain text version of the email",
 *                         html: "HTML version of the email",
 *                         attachment: "An optional attachment"
 * @param  {function} callback Called when email is sent, first param is error
 *                             if the email sending failed
 * @return Boolean          Whether message sending started
 */
exports.send = function(config, callback) {
  //Validate config.type
  if (!config.type) config.type = process.env.PINGR_EMAIL_METHOD;
  if (Object.keys(EMAILTYPE).indexOf(config.type) < 0) config.type = EMAILTYPE.SENDGRIDHTTP;

  switch (config.type) {
    case EMAILTYPE.SENDGRIDHTTP:
      return sendEmailViaSendgridHttp(config, callback);
    case EMAILTYPE.SENDGRIDSMTP:
      //return sendEmailViaSendgridSmtp(config, callback);
      return false;
    case EMAILTYPE.SMTP:
      //return sendEmailViaSmtp(config, callback);
      return false;
  }

  return false;
};

exports.sendEmailViaHttp = function(from, toEmails, subject, text, html, attachment, callback) {
  var helper = require('sendgrid').mail;
  var to_email = toEmails[0];
  var content = new helper.Content('text/html', html);
  var mail = new helper.Mail(from, subject, to_email, content);

  toEmails.forEach(function(v, i) {
    if (i === 0) return;
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
