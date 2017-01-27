var mongoose = require('mongoose'),
  crypto = require('crypto');
var config = require('../../server/config');
mongoose.set('debug', true);
mongoose.connect(config.db.url);
var User = require('../../server/models/user'),
  emailSender = require('../../server/email-sender'),
  events = require('../../server/controllers/events'),
  indicators = require('../../server/controllers/indicators');
var mailConfig = config.mail;

var now = new Date();
var twoWeeksAgo = new Date();
twoWeeksAgo.setMinutes(twoWeeksAgo.getMinutes() - 1);

User.find({
  "$and": [
    { "$or": [{ "last_login": { "$exists": false } }, { "last_login": { "$lte": twoWeeksAgo } }] },
    { "$or": [{ "last_email_reminder": { "$exists": false } }, { "last_email_reminder": { "$lte": twoWeeksAgo } }] }
  ],
  "practiceId": { $not: /ALL/ },
  "email_opt_out": { $ne: true }
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
    indicators.list(v.practiceId, function(err, list) {
      //construct email
      var performance = list.filter(function(vv) {
        return vv.values && vv.values[0].length > 1;
      }).map(function(vv) {
        var lastid = vv.values[0].length - 1;
        return vv.name + ": " + (vv.values[1][lastid] * 100 / vv.values[2][lastid]).toFixed(0) + "% (target: " + (100 * vv.values[3][lastid]) + "%, benchmark: " + (100 * +vv.benchmark) + "%)";
      }).join("\n\n");

      var body = "Your practice's current performance is: \n\n" +
        performance + "\n\n\nYou will receive an email reminder every two weeks " +
        "but if you wish to opt out please log in to PINGR and update your email preferences.\n\nThe PINGR team.";

      crypto.randomBytes(6, function(err, buf) {
        var token = buf.toString('hex');
        if (!v.last_login) {
          //email how they haven't logged in
          body = "Hi\n\n You don't appear to have logged into PINGR (" + config.server.url + "/t/"+token+") yet. \n\n" + body;
          console.log(v.email);
          usersUpdated++;
          emailsSent++;
          if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
          return;
        } else {
          //email about it being two weeks since login or email
          body = 'Hi\n\nYou last logged into PINGR (' + config.server.url + '/t/'+token+') on ' + v.last_login + '.\n\n' + body;
        }

        //send email
        var localMailConfig = {
          sendEmailOnError: mailConfig.sendEmailOnError,
          smtp: mailConfig.smtp,
          options: {}
        };
        console.log(JSON.stringify(config));
        console.log(JSON.stringify(mailConfig));
        localMailConfig.options.to = v.email;
        localMailConfig.options.from = mailConfig.options.from;
        console.log(JSON.stringify(localMailConfig));
        //to is now in config file
        emailSender.sendEmail(localMailConfig, 'PINGR: Reminder', body, null, function(error, info) {
          emailsSent++;
          if (error) {
            console.log("email not sent: " + error);
            usersUpdated++;
          } else {
            events.emailReminder(v.email, now, function(err) {
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
