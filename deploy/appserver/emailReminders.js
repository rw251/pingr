var mongoose = require('mongoose');
var config = require('../../server/config');
mongoose.set('debug', true);
mongoose.connect(config.db.url);
var User = require('../../server/models/user'),
  emailSender = require('../../server/email-sender'),
  indicators = require('../../server/controllers/indicators');
var mailConfig = config.mail;

var now = new Date();
var twoWeeksAgo = new Date();
twoWeeksAgo.setMinutes(twoWeeksAgo.getMinutes() - 1);

User.find({
  "$and":[
    {"$or": [{ "last_login": { "$exists": false } }, { "last_login": { "$lte": twoWeeksAgo } }]},
    {"$or": [{ "last_email_reminder": { "$exists": false } }, { "last_email_reminder": { "$lte": twoWeeksAgo } }]}
  ],
  "practiceId": { $not: /ALL/ },
  "email_opt_out": {$ne:true}
}, function(err, users) {
  // In case of any error, return using the done method
  if (err) {
    console.log('Error in finding users to pester: ' + err);
    process.exit(1);
  }
  var emailsSent = 0, usersUpdated=0;
  if(users.length===0){
    console.log("No users to remind");
    process.exit(0);
  }
  users.forEach(function(v) {
    indicators.list(v.practiceId, function(err, list) {
      //construct email
      var body = list.filter(function(vv){
        return vv.values && vv.values[0].length>1;
      }).map(function(vv){
        var lastid = vv.values[0].length-1;
        return vv.name + ": " + (vv.values[1][lastid]*100/vv.values[2][lastid]).toFixed(0)+"% (target: " + (100*vv.values[3][lastid]) + "%, benchmark: " + (100* +vv.benchmark)+"%)";
      }).join("\n\n");

      if(!v.last_login) {
        //email how they haven't logged in
        console.log(v.email);
        return;
      } else {
        //email about it being two weeks since login or email
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
        } else  {
          v.last_email_reminder = now;
          v.save(function(err){
            usersUpdated++;
            if(err) {
              console.log("User failed to update: " + error);
            }
            if(emailsSent===users.length && usersUpdated===users.length) process.exit(0);
          });
        }
        if(emailsSent===users.length && usersUpdated===users.length) process.exit(0);
      });
    });
  });
});
