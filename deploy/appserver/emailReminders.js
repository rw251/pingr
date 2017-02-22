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
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

User.find({
  "$and": [
    { "$or": [{ "last_login": { "$exists": false } }, { "last_login": { "$lte": twoWeeksAgo } }] },
    { "$or": [{ "last_email_reminder": { "$exists": false } }, { "last_email_reminder": { "$lte": twoWeeksAgo } }] },
    { "practiceId" : {$exists: true}}
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
    /*if (v.email.toLowerCase().indexOf('green') > -1) {
      console.log("Not doing: " + v.email);
      usersUpdated++;
      emailsSent++;
      if (emailsSent === users.length && usersUpdated === users.length) process.exit(0);
      return;
    }*/
    console.log("Doing: " + v.email);
    indicators.list(v.practiceId, function(err, list) {

      crypto.randomBytes(6, function(err, buf) {
        var token = buf.toString('hex');

        var urlBaseWithToken = config.server.url + "/t/" + token + "/";
        //construct email
        var performanceText = v.practiceName + "'s current performance is:\n\n" + list.filter(function(vv) {
          return vv.values && vv.values[0].length > 1;
        }).sort(function(a, b) {
          var lastidA = a.values[0].length - 1;
          var lastidB = b.values[0].length - 1;
          return (a.values[1][lastidA] * 100 / a.values[2][lastidA]) - (b.values[1][lastidB] * 100 / b.values[2][lastidB]);
        }).map(function(vv) {
          var lastid = vv.values[0].length - 1;
          return vv.name + ": " + (vv.values[1][lastid] * 100 / vv.values[2][lastid]).toFixed(0) + "% (target: " + (100 * vv.values[3][lastid]) + "%, benchmark: " + (100 * +vv.benchmark) + "%)";
        }).join("\n\n");

        var performanceHTML = "<p>" + v.practiceName + "'s current performance is:</p><table><thead style='font-weight:bold'><th><tr style='font-weight:bold'><td>Indicator</td><td>Current Performance</td><td>Number of Patients</td><td>Target</td><td>Salford Benchmark</td></tr></th></thead><tbody>" + list.filter(function(vv) {
          return vv.values && vv.values[0].length > 1;
        }).sort(function(a, b) {
          var lastidA = a.values[0].length - 1;
          var lastidB = b.values[0].length - 1;

          if(+a.values[2][lastidA] === 0 && +b.values[2][lastidB] === 0) return 0;
          if(+a.values[2][lastidA] === 0) return 1;
          if(+b.values[2][lastidB] === 0) return -1;

          return (a.values[1][lastidA] * 100 / a.values[2][lastidA]) - (b.values[1][lastidB] * 100 / b.values[2][lastidB]);
        }).map(function(vv) {
          var lastid = vv.values[0].length - 1;
          return "<tr><td><strong><a href=" + urlBaseWithToken + "indicators/" + vv.id.replace(/\./g, "/") + ">" + vv.name + "</a></strong>:</td><td><strong>" +
            (vv.values[2][lastid] > 0 ? (vv.values[1][lastid] * 100 / vv.values[2][lastid]).toFixed(0) + "%" : "N/A") + "</strong></td><td>" +
            vv.values[1][lastid] + "/" + vv.values[2][lastid] + "</td><td>" + (100 * vv.values[3][lastid]) + "%</td><td>" + (100 * +vv.benchmark) + "%</td></tr>";
        }).join("") + "</tbody></table>";

        var numWeeks = 0;
        var lkup = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
        var preambleText = "You haven't yet logged into PINGR (" + urlBaseWithToken + ")";
        var preambleHTML = "<p>You haven't yet logged into <a href='" + urlBaseWithToken + "'>PINGR</a>";
        if (v.last_login) {
          numWeeks = Math.round((now - v.last_login) / (7 * 24 * 60 * 60 * 1000));
          preambleText = "You last visited PINGR (" + urlBaseWithToken + ") " + (lkup.length > numWeeks ? lkup[numWeeks] : numWeeks) + " weeks ago";
          preambleHTML = "<p>You last visited <a href='" + urlBaseWithToken + "'>PINGR</a> " + (lkup.length > numWeeks ? lkup[numWeeks] : numWeeks) + " weeks ago";
        }

        var body = "Hello " + v.fullname + "!\n\n" +
          preambleText + ", so we thought we'd let you know how " +
          v.practiceName + " is doing. Remember, you can log directly into PINGR (" + urlBaseWithToken + ") for more detail, including:\n\n" +
          "  - Lists of patients not achieving each quality indicator\n\n" +
          "  - Suggested improvement actions for these patients, and for " + v.practiceName + " in general\n\n" +
          "  - Comparison of your performance with other practices in Salford\n\n" +
          performanceText +
          "\n\nWe only send you emails if you haven't visited PINGR for two weeks. If you wish to stop receiving them" +
          " please visit PINGR (" + urlBaseWithToken + ") and update your email preferences.\n\nThe PINGR team.";
        var htmlBody = "<html><body><p>Hello " + v.fullname + "!</p>" +
          preambleHTML + ", so we thought we'd let you know how " +
          v.practiceName + " is doing. Remember, you can log directly into <a href='" + urlBaseWithToken + "'>PINGR</a> for more detail, including:" +
          "<ul><li>Lists of patients not achieving each quality indicator</li>" +
          "<li>Suggested improvement actions for these patients, and for " + v.practiceName + " in general</li>" +
          "<li>Comparison of your performance with other practices in Salford</li></ul></p>" +
          performanceHTML +
          "<p>We only send you emails if you haven't visited PINGR for two weeks. If you wish to stop receiving them" +
          " please visit <a href='" + urlBaseWithToken + "'>PINGR</a> and update your email preferences.</p><p>The PINGR team.</p>" +
          "<p><strong>Tip: </strong>If you’re having trouble accessing PINGR: open Google Chrome, copy PINGR's address ( "+ urlBaseWithToken +
          " ) and paste it into the address bar at the top. If you're still having problems accessing PINGR, please email benjamin.brown@manchester.ac.uk for help.</p><a href='" + config.server.url + "/img/" + v.email + "'>" + config.server.url + "/img/" + v.email + "</a><img src='" + config.server.url + "/img/" + v.email + "/" + token + "'></img></body></html>";
          //

        //send email
        var localMailConfig = {
          sendEmailOnError: mailConfig.sendEmailOnError,
          smtp: mailConfig.smtp,
          options: {}
        };
        var subject = "PINGR: " + v.practiceName + "'s Report";
        //console.log(JSON.stringify(config));
        //console.log(JSON.stringify(mailConfig));
        var helper = require('sendgrid').mail;
        var fromEmail = new helper.Email("benjamin.brown@manchester.ac.uk", "Benjamin Brown");
        var toEmails = [new helper.Email(v.email, v.fullname)];
        //console.log(JSON.stringify(localMailConfig));
        //to is now in config file
        emailSender.sendEmailViaHttp(fromEmail, toEmails, subject, body, htmlBody, null, function(error, info) {
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
