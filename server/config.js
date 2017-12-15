/* jshint esversion:6 */

var mustExist = function(name) {
  if (!process.env[name]) {
    console.log(name + " is not defined but is mandatory.");
    console.log("Exiting...");
    process.exit(1);
  } else {
    return process.env[name];
  }
};

const ENV = {
  //mongo url
  MONGO_URL: mustExist("PINGR_MONGO_URL"),

  //passport secret for expressjs authentication
  PASSPORT_SECRET: mustExist("PINGR_PASSPORT_SECRET"),

  //server details
  SERVER_PORT: process.env.PINGR_SERVER_PORT,
  SERVER_URL: mustExist("PINGR_SERVER_URL"),
  SERVER_SUBFOLDER: process.env.PINGR_SERVER_SUBFOLDER || '', //Try '/beta'

  //email sending
  SMTP_HOST: process.env.PINGR_SMTP_HOST || 'mail.srft.nhs.uk',
  SMTP_PORT: process.env.PINGR_SMTP_PORT || 25,
  SMTP_USER: process.env.PINGR_SMTP_USER,
  SMTP_PASS: process.env.PINGR_SMTP_PASS,

  REMINDER_EMAILS_FROM: mustExist("PINGR_REMINDER_EMAILS_FROM"),
  ADMIN_EMAILS_FROM: mustExist("PINGR_ADMIN_EMAILS_FROM"),
  SENDGRID_API_KEY: process.env.PINGR_SENDGRID_API_KEY,
  NEW_USERS_NOTIFICATION_EMAIL: mustExist("PINGR_NEW_USERS_NOTIFICATION_EMAIL"),
  SUGGESTION_EMAILS_TO: process.env.PINGR_SUGGESTION_EMAILS_TO,

  EMAIL_TRANSPORT: process.env.PINGR_SMTP_OR_SENDGRIDHTTP
};

module.exports = {
  db: {
    url: ENV.MONGO_URL
  },
  //user auth
  passport: {
    secret: ENV.PASSPORT_SECRET
  },
  server: {
    port: ENV.SERVER_PORT,
    url: ENV.SERVER_URL,
    sub: ENV.SERVER_SUBFOLDER,
  },
  mail: {
    sendEmailOnError: true,
    smtp: {
      host: ENV.SMTP_HOST || 'mail.srft.nhs.uk',
      port: ENV.SMTP_PORT || 25,
      useAuth: ENV.SMTP_USER && true,
      username: ENV.SMTP_USER || '',
      password: ENV.SMTP_PASS || ''
    },
    options: {
      from: 'PINGR <noreply@smash.srft.nhs.uk>'
    },
    reminderEmailsFrom: ENV.REMINDER_EMAILS_FROM,
    adminEmailsFrom: ENV.ADMIN_EMAILS_FROM,
    sendGridAPIKey: ENV.SENDGRID_API_KEY,
    newUsersNotificationEmail: ENV.NEW_USERS_NOTIFICATION_EMAIL,
    suggestionEmailsTo: ENV.SUGGESTION_EMAILS_TO || 'benjamin.brown@nhs.net',

    type: ENV.EMAIL_TRANSPORT || "SENDGRIDHTTP"
  }
};
