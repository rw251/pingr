/* jshint esversion: 6 */

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const sendgrid = require('sendgrid');
const mailConfig = require('./config').mail;

const sendEmailViaSendgridHttp = (config, callback) => {
  let content;
  const helper = sendgrid.mail;

  const mail = new helper.Mail(); // , , , content);

  const from = new helper.Email(config.from.email, config.from.name);
  mail.setFrom(from);

  mail.setSubject(config.subject);

  const personalization = new helper.Personalization();

  // Add extra emails if they exist
  config.to.forEach((v) => {
    const email = new helper.Email(v.email, v.name);
    personalization.addTo(email);
  });

  mail.addPersonalization(personalization);

  // plain text MUST come first for some reason
  if (config.text) {
    content = new helper.Content('text/plain', config.text);
    mail.addContent(content);
  }
  if (config.html) {
    content = new helper.Content('text/html', config.html);
    mail.addContent(content);
  }

  // attachment
  if (config.attachment) {
    // attachment = new helper.Attachment();
    // attachment.setContent("
    // TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gQ3JhcyBwdW12");
    // attachment.setType("application/pdf");
    // attachment.setFilename("balance_001.pdf");
    // attachment.setDisposition("attachment");
    // mail.addAttachment(attachment);
  }

  const sg = sendgrid(mailConfig.sendGridAPIKey);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, (error, response) => {
    console.log(response.statusCode);
    if (error) return callback(error);
    return callback(null);
  });
};

const formatEmail = emailObject => `${emailObject.name}<${emailObject.email}>`;

const parseEmail = (email) => {
  if (email.name && email.email) return email;
  const bits = email.split('<');
  if (bits.length !== 2) {
    console.log(`ERROR with email: ${email}`);
    return email;
    // return callback(new Error("Email should be of form:
    // Name <name@email.com>. Instead it is: " + email));
  }
  const fromName = bits[0].trim();
  const fromEmail = bits[1].replace('>', '').trim();
  return { name: fromName, email: fromEmail };
};

const sendEmailViaSmtp = (config, callback) => {
  const smtpProperties = {};
  smtpProperties.host = mailConfig.smtp.host;
  smtpProperties.port = mailConfig.smtp.port;
  if (mailConfig.smtp.useAuth) {
    smtpProperties.auth = {
      user: mailConfig.smtp.username,
      pass: mailConfig.smtp.password,
    };
  } else {
    smtpProperties.tls = { rejectUnauthorized: false };
  }

  const transport = nodemailer.createTransport(smtpTransport(smtpProperties));

  const mailOptions = {
    from: formatEmail(config.from), // sender address
    to: config.to
      .map(v => formatEmail(v))
      .join(','), // list of receivers (comma separated)
    subject: config.subject,
  };

  if (config.text) {
    mailOptions.text = config.text;
  }

  if (config.html) {
    mailOptions.html = config.html;
  }

  if (
    config.attachment &&
    config.attachment.name &&
    config.attachment.content
  ) {
    mailOptions.attachments = [
      { filename: config.attachment.name, content: config.attachment.content },
    ];
  }

  // send mail with defined transport object
  transport.sendMail(mailOptions, (error, info) => callback(error, info));
};

// attachment if not null should be of the form:
// {"name":"<filename>","content","<content as string>"}
const sendEmailViaSendgridSmtp = (config, callback) => {
  const smtpProperties = {};
  smtpProperties.host = mailConfig.smtp.host;
  smtpProperties.port = mailConfig.smtp.port;
  if (mailConfig.smtp.useAuth) {
    smtpProperties.auth = {
      user: mailConfig.smtp.username,
      pass: mailConfig.smtp.password,
    };
    smtpProperties.service = 'SendGrid';
  } else {
    smtpProperties.tls = { rejectUnauthorized: false };
  }

  const transport = nodemailer.createTransport(smtpTransport(smtpProperties));

  const mailOptions = {
    from: formatEmail(config.from), // sender address
    to: config.to
      .map(v => formatEmail(v))
      .join(','), // list of receivers (comma separated)
    subject: config.subject,
  };

  if (config.text) {
    mailOptions.text = config.text;
  }

  if (config.html) {
    mailOptions.html = config.html;
  }

  if (
    config.attachment &&
    config.attachment.name &&
    config.attachment.content
  ) {
    mailOptions.attachments = [
      { filename: config.attachment.name, content: config.attachment.content },
    ];
  }

  // send mail with defined transport object
  transport.sendMail(mailOptions, (error, info) => callback(error, info));
};

const EMAILTYPE = {
  SENDGRIDHTTP: 'SENDGRIDHTTP',
  SENDGRIDSMTP: 'SENDGRIDSMTP',
  SMTP: 'SMTP',
};

exports.EMAILTYPES = Object.keys(EMAILTYPE);

/**
 * Send an email. NB the type property of the config should be left blank and
 * is determined as either sendgrid if the sendgrid api key is set or SMTP
 * if not
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
exports.send = (config, callback) => {
  console.log(config);
  // Validate config.type
  if (!config.type) {
    config.type = mailConfig.sendGridAPIKey
      ? EMAILTYPE.SENDGRIDHTTP
      : EMAILTYPE.SMTP;
  }

  switch (config.type) {
    case EMAILTYPE.SENDGRIDHTTP:
      return sendEmailViaSendgridHttp(config, callback);
    case EMAILTYPE.SENDGRIDSMTP:
      return sendEmailViaSendgridSmtp(config, callback);
    case EMAILTYPE.SMTP:
      return sendEmailViaSmtp(config, callback);
    default:
      return sendEmailViaSmtp(config, callback);
  }
};

exports.config = (
  type = mailConfig.sendGridAPIKey ? EMAILTYPE.SENDGRIDHTTP : EMAILTYPE.SMTP,
  emailFrom,
  emailTo,
  subject,
  text,
  html,
  attachment
) => {
  const from = emailFrom ? parseEmail(emailFrom) : {};
  let to = [];

  if (emailTo) {
    // it exists
    if (emailTo.map) {
      // an array
      to = emailTo.map(v => parseEmail(v));
    } else {
      to = [parseEmail(emailTo)];
    }
  }

  return { type, from, to, subject, text, html, attachment };
};
