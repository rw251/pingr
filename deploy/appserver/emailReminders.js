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
    /*if (v.email.toLowerCase().indexOf('ben') > -1) {
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
        var urlBase = config.server.url + "/t/" + token + "/";
        //construct email
        var performanceText = v.practiceName + "'s current performance is:\n\n" +list.filter(function(vv) {
          return vv.values && vv.values[0].length > 1;
        }).sort(function(a,b){
          var lastidA = a.values[0].length - 1;
          var lastidB = b.values[0].length - 1;
          return (b.values[1][lastidB] * 100 / b.values[2][lastidB]) - (a.values[1][lastidA] * 100 / a.values[2][lastidA]);
        }).map(function(vv) {
          var lastid = vv.values[0].length - 1;
          return vv.name + ": " + (vv.values[1][lastid] * 100 / vv.values[2][lastid]).toFixed(0) + "% (target: " + (100 * vv.values[3][lastid]) + "%, benchmark: " + (100 * +vv.benchmark) + "%)";
        }).join("\n\n");

        var performanceHTML = "<p>"+ v.practiceName + "'s current performance is:<ul>" + list.filter(function(vv) {
          return vv.values && vv.values[0].length > 1;
        }).sort(function(a,b){
          var lastidA = a.values[0].length - 1;
          var lastidB = b.values[0].length - 1;
          return (b.values[1][lastidB] * 100 / b.values[2][lastidB]) - (a.values[1][lastidA] * 100 / a.values[2][lastidA]);
        }).map(function(vv) {
          var lastid = vv.values[0].length - 1;
          return "<li><strong><a href=" + urlBase + "indicators/" + vv.id.replace(/\./g,"/") + ">" + vv.name + "</a></strong>: " +
            (vv.values[1][lastid] * 100 / vv.values[2][lastid]).toFixed(0) + "% (" +
            vv.values[1][lastid] +"/"+ vv.values[2][lastid]+ ", Target: " + (100 * vv.values[3][lastid]) + "%, Salford Benchmark: " + (100 * +vv.benchmark) + "%)</li>";
        }).join("") + "</ul></p>";

        var numWeeks = 0;
        var preambleText = "You haven't yet logged into PINGR (" + urlBase + ")";
        var preambleHTML = "<p>You haven't yet logged into <a href='" + urlBase + "'>PINGR</a>";
        if(v.last_login) {
          numWeeks = Math.round((now - v.last_login) / (7 * 24 * 60 * 60 * 1000));
          preambleText = "You last visited PINGR (" + urlBase + ") "+numWeeks+" weeks ago";
          preambleHTML = "<p>You last visited <a href='" + urlBase + "'>PINGR</a> "+numWeeks+" weeks ago";
        }

        var body = "Hello " + v.fullname + "!\n\n" +
          preambleText + ", so we thought we'd let you know how " +
          v.practiceName + " is doing. Remember, you can log directly into PINGR (" + urlBase + ") for more detail, including:\n\n" +
          "  - lists of patients not achieving each quality indicator\n\n" +
          "  - suggested improvement actions for these patients, and for [name of practice] in general\n\n" +
          "  - comparison of your performance with other practices in Salford\n\n" +
          performanceText +
          "\n\nWe only send you emails if you haven't visited PINGR for two weeks. If you wish to stop receiving them" +
          " please visit PINGR and update your email preferences.\n\nThe PINGR team.";
        var htmlBody = "<html><body><p>Hello " + v.fullname + "!</p>" +
          preambleHTML + ", so we thought we'd let you know how " +
          v.practiceName + " is doing. Remember, you can log directly into <a href='" + urlBase + "'>PINGR</a> for more detail, including:" +
          "<ul><li>lists of patients not achieving each quality indicator</li>" +
          "<li>suggested improvement actions for these patients, and for [name of practice] in general</li>" +
          "<li>comparison of your performance with other practices in Salford</li></ul></p>"+
          performanceHTML +
          "<p>We only send you emails if you haven't visited PINGR for two weeks. If you wish to stop receiving them" +
          " please visit PINGR and update your email preferences.</p><p>The PINGR team.</p></body></html>";

        //send email
        var localMailConfig = {
          sendEmailOnError: mailConfig.sendEmailOnError,
          smtp: mailConfig.smtp,
          options: {}
        };
        var subject = "PINGR: " + v.practiceName + "'s Report";
        console.log(JSON.stringify(config));
        console.log(JSON.stringify(mailConfig));
        localMailConfig.options.to = v.email;
        localMailConfig.options.from = mailConfig.options.from;
        console.log(JSON.stringify(localMailConfig));
        //to is now in config file
        emailSender.sendEmail(localMailConfig, subject, body, htmlBody, null, function(error, info) {
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
