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
  jade = require('jade'),
  createTextVersion = require("textversionjs");

var jade2html = function (input, data) {
  return jade.compile(input, {
    pretty: true,
    doctype: "5"
  })(data);
};

console.log("version = v3.5.5"); // check if picked up
console.log("Mail type: " + config.mail.type);
console.log("Mail from: " + config.mail.reminderEmailsFrom);

var now = new Date();
var day = now.getDay();
var hour = now.getHours();
var yesterday = new Date();
var oneWeekAgo = new Date();
var twoWeeksAgo = new Date();
var fourWeeksAgo = new Date();
yesterday.setDate(yesterday.getDate() - 1);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 47);

// Mode:
// PROD: production
// DEV: do same as production but only email RW and BB
// TEST: Ensures that only RW receives an email regardless of whether it is the right day or not
var MODES = { PROD: "production", DEV: "development", TEST: "test" };
var MODE = MODES.PROD;
if (process.argv.length > 2) {
  if (process.argv[2].toLowerCase() === "dev") {
    MODE = MODES.DEV;
  } else if (process.argv[2].toLowerCase() === "test") {
    MODE = MODES.TEST;
  }
}

console.log("Email reminder.js mode: " + MODE);
console.log("Day: " + day);
console.log("Hour: " + hour);

var andComponent = [];
if (MODE !== MODES.TEST) {
  //only check last_email_reminder stuff if not test mode
  andComponent.push({
    $or: [
      { last_email_reminder: { $exists: false } }, //never had one
      { last_email_reminder: { $lte: yesterday } } //wasn't today
    ]
  });
}
if (MODE === MODES.PROD) {
  andComponent.push({ email: { $regex: "nhs.net$" } }); //don't send nhs numbers to none nhs.net accounts
}
andComponent.push({ practiceId: { $exists: true } }); // to ensure it's only authorised people
andComponent.push({ practiceId: { $not: /ALL/ } }); // to ensure CCG users don't get one
andComponent.push({ emailFrequency: { $ne: 0 } }); // never receives emails
var searchObject = { $and: andComponent };
var fieldsToReturn = { password: 0 };

const devUsersToReceiveEmails = ["benjamin.brown@manchester.ac.uk", "richard.williams2@manchester.ac.uk"];
const testUsersToReceiveEmails = ["richard.williams2@manchester.ac.uk"];

User.find(searchObject, fieldsToReturn, function (err, users) {
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
  console.log(users.map(function (v) { return v.fullname; }).join("\n"));
  users.forEach(function (v) {
    if (MODE === MODES.DEV && devUsersToReceiveEmails.indexOf(v.email) < 0) {
      console.log("Not doing: " + v);
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (MODE === MODES.TEST && testUsersToReceiveEmails.indexOf(v.email) < 0) {
      console.log("Not doing: " + v);
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }
    if (v.emailDay === undefined && day !== 1) {
      console.log(v.email + " no emailDay and not Monday");
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    } else if (v.emailDay !== undefined && v.emailDay !== day) {
      console.log(v.email + " emailDay is " + v.emailDay + " and today is " + day);
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    }
    if (v.emailHour === undefined && hour !== 10) {
      console.log(v.email + " no emailHour and not 10am");
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    } else if (v.emailHour !== undefined && v.emailHour !== hour) {
      console.log(v.email + " emailHour is " + v.emailHour + " and now is " + hour);
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    }
    if (!v.emailFrequency) {
      v.emailFrequency = 1;
    }
    if (v.emailFrequency === 2 && twoWeeksAgo < v.last_email_reminder) {
      console.log("freq 2 but email since");
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    }
    if (v.emailFrequency === 4 && fourWeeksAgo < v.last_email_reminder) {
      console.log("freq 4 but email since");
      if (MODE !== MODES.TEST) {
        usersUpdated++;
        emailsSent++;
        if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
        return;
      } //let's fall through if in test mode to see what happens
    }
    console.log("Doing: " + v.email);

    utils.getDataForEmails(v, function (err, data) {
      data = data.data; //!!
      crypto.randomBytes(6, function (err, buf) {
        var token = buf.toString('hex');

        var urlBaseWithToken = config.server.url + "/t/" + token + "/";
        console.log(urlBaseWithToken);
        data.pingrUrl = urlBaseWithToken;
        data.pingrUrlWithoutTracking = config.server.url + "/";

        var patientIdLookup = {};
        if(data.patients) {
          data.patients.forEach((p) => {
            patientIdLookup[p.nhsNumber] = p._id;
          });
        }

        emailTemplates.getDefault(function (err, emailTemplate) {
          //send email
          var emailHTMLBody = jade2html(emailTemplate.body, data);
          //Replace urls with an unstyled hyperlink to allow people to select the text, rather than clicking the link
          emailHTMLBody = emailHTMLBody.replace(/http(s?):\/\/([^\/]+\/[^i])/g,"http$1<a href='#' style='text-decoration:none; color:#000;'>://$2</a>");
          
          var emailTextBody = createTextVersion(emailHTMLBody);

          emailHTMLBody += "<img src='" + config.server.url + "/img/" + data.email + "/" + token + "'></img>";
          var emailConfig = emailSender.config(config.mail.type, config.mail.reminderEmailsFrom, { name: v.fullname, email: v.email }, emailTemplate.subject, emailTextBody, emailHTMLBody, null);

          emailSender.send(emailConfig, function (error, info) {
            emailsSent++;
            if (error) {
              console.log("email not sent: " + error);
              usersUpdated++;
            } else {
              console.log("Info: " + info);
              events.emailReminder(v.email, token, emailHTMLBody, now, patientIdLookup, function (err) {
                if (err) {
                  console.log("email event not recorded: " + err);
                }
                v.last_email_reminder = now;
                v.email_url_tracking_code = token;
                v.save(function (err) {
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
