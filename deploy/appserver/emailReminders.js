var mongoose = require('mongoose'),
  crypto = require('crypto');
var config = require('../../server/config');
mongoose.set('debug', true);
mongoose.connect(config.db.url);
var User = require('../../server/models/user'),
  emailSender = require('../../server/email-sender'),
  utils = require('../../server/controllers/utils'),
  events = require('../../server/controllers/events'),
  emailTemplates = require('../../server/controllers/emails'),
  indicators = require('../../server/controllers/indicators');

var now = new Date();
var day = now.getDay();
var yesterday = new Date();
var oneWeekAgo = new Date();
var twoWeeksAgo = new Date();
var fourWeeksAgo = new Date();
yesterday.setDate(yesterday.getDate() - 1);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 47);

var DEV = false;
if (process.argv.length > 2 && process.argv[2] === "dev") {
  DEV = true;
}

User.find({
  $and: [
    {
      $or: [
        { last_email_reminder: { $exists: false } }, //never had one
        { last_email_reminder: { $lte: yesterday } } //wasn't today
      ]
    },
    { practiceId: { $exists: true } }, // to ensure it's only authorised people
    { practiceId: { $not: /ALL/ } }, // to ensure CCG users don't get one
    { emailFrequency: { $ne: 0 } } // never receives emails
  ]
}, function(err, users) {
  // In case of any error, return using the done method
  if (err) {
    console.log('Error in finding users to pester: ' + err);
    process.exit(1);
  }
  var emailsSent = 0,
    usersUpdated = 0;
  if (users.length === 0) {
    console.log("No users to remind");
    process.exit(0);
  }
  users.forEach(function(v) {
    if (DEV && [ /*"benjamin.brown@manchester.ac.uk", */ "richard.williams2@manchester.ac.uk"].indexOf(v.email) < 0) {
      console.log("Not doing: " + v);
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (v.emailDay === undefined && day !== 2) {
      console.log(v.email + " no emailDay and not tuesday");
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (!v.emailFrequency) {
      v.emailFrequency = 1;
    }
    if (v.emailFrequency === 2 && twoWeeksAgo < v.last_email_reminder) {
      console.log("freq 2 but email since");
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (v.emailFrequency === 4 && fourWeeksAgo < v.last_email_reminder) {
      console.log("freq 4 but email since");
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    console.log("Doing: " + v.email);

    utils.getDataForEmails(v, function(err, data) {

      data.pingrUrl =

      crypto.randomBytes(6, function(err, buf) {
        var token = buf.toString('hex');

        var urlBaseWithToken = config.server.url + "/t/" + token + "/";

        emailTemplates.getDefault(function(err, emailTemplate) {
          var x = require(emailTemplate);
          console.log(emailTemplate);
          console.log(x);
          console.log(x(data));
          //send email
          if (!process.env.PINGR_REMINDER_EMAILS_FROM) return callback(new Error("No PINGR_REMINDER_EMAILS_FROM env var set."));
          var emailConfig = emailSender.config(null, process.env.PINGR_REMINDER_EMAILS_FROM, { name: v.fullname, email: v.email }, "PINGR: " + v.practiceName + "'s Report", body, htmlBody, null);

          emailSender.send(emailConfig, function(error, info) {
            emailsSent++;
            if (error) {
              console.log("email not sent: " + error);
              usersUpdated++;
            } else {
              events.emailReminder(v.email, token, now, function(err) {
                if (err) {
                  console.log("email event not recorded: " + err);
                }
                v.last_email_reminder = now;
                v.email_url_tracking_code = token;
                v.save(function(err) {
                  usersUpdated++;
                  if (err) {
                    console.log("User failed to update: " + error);
                  }
                  if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
                });
              });
            }
            if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
          });
        });
      });
    });
  });
});
