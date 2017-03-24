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
  indicators = require('../../server/controllers/indicators'),
  jade = require('jade');

var jade2html = function(input, data) {
  return jade.compile(input, {
    pretty: true,
    doctype: "5"
  })(data);
};

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

var andComponent = [];
if (!DEV) {
  //only check last_email_reminder stuff if not dev
  andComponent.push({
    $or: [
      { last_email_reminder: { $exists: false } }, //never had one
      { last_email_reminder: { $lte: yesterday } } //wasn't today
    ]
  });
}
andComponent.push({ practiceId: { $exists: true } }); // to ensure it's only authorised people
andComponent.push({ practiceId: { $not: /ALL/ } }); // to ensure CCG users don't get one
andComponent.push({ emailFrequency: { $ne: 0 } }); // never receives emails
var searchObject = { $and: andComponent };

User.find(searchObject, function(err, users) {
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
  console.log(users.map(function(v) { return v.fullname; }).join("\n"));
  users.forEach(function(v) {
    if (DEV && [ "benjamin.brown@manchester.ac.uk", "richard.williams2@manchester.ac.uk"].indexOf(v.email) < 0) {
      console.log("Not doing: " + v);
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (v.emailDay === undefined && day !== 1) {
      console.log(v.email + " no emailDay and not Monday");
      if (!DEV) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if not dev to see what happens
    }
    if (!v.emailFrequency) {
      v.emailFrequency = 1;
    }
    if (v.emailFrequency === 2 && twoWeeksAgo < v.last_email_reminder) {
      console.log("freq 2 but email since");
      if (!DEV) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if not dev to see what happens
    }
    if (v.emailFrequency === 4 && fourWeeksAgo < v.last_email_reminder) {
      console.log("freq 4 but email since");
      if (!DEV) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if not dev to see what happens
    }
    console.log("Doing: " + v.email);

    utils.getDataForEmails(v, function(err, data) {
      data = data.data;//!!
      crypto.randomBytes(6, function(err, buf) {
        var token = buf.toString('hex');

        var urlBaseWithToken = config.server.url + "/t/" + token + "/";
        console.log(urlBaseWithToken);
        data.pingrUrl = urlBaseWithToken;

        emailTemplates.getDefault(function(err, emailTemplate) {
          //send email
          var emailHTMLBody = jade2html(emailTemplate.body, data);
          emailHTMLBody += "<img src='" + config.server.url + "/img/" + data.email + "/" + token + "'></img>";
          var emailConfig = emailSender.config(null, config.mail.reminderEmailsFrom, { name: v.fullname, email: v.email }, emailTemplate.subject, null, emailHTMLBody, null);

          emailSender.send(emailConfig, function(error, info) {
            emailsSent++;
            if (error) {
              console.log("email not sent: " + error);
              usersUpdated++;
            } else {
              events.emailReminder(v.email, token, emailHTMLBody, now, function(err) {
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
