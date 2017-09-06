var User = require('../models/user');
var patients = require('./patients');

module.exports = {

  get: function(email, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      if (!user) {
        console.log('User doesnt exists with email: ' + email);
        return done(null, false);
      } else {
        done(null, user.toObject());
      }
    });
  },

  list: function(done) {
    User.find({}, null, { sort: { email: 1 } }, function(err, users) {
      if (err) {
        return done(err);
      }
      users = users.map(function(v) {
        return v.toObject();
      });
      return done(null, users);
    });
  },

  delete: function(email, done) {
    User.find({ email: email }).remove(done);
  },

  updateEmailPreference: function(email, body, indicatorList, done){
    User.findOne({
      'email': email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in email preference update: ' + err);
        return done(err);
      }
      // doesn't exist
      if (!user) {
        console.log('User doesnt exist with email: ' + email);
        return done(null, false, 'Trying to edit a user with an email not found in the system');
      } else {
        if(body.indicatorIdsToInclude) {
          const indicatorsToExclude = {};
          indicatorList.forEach((i)=>{
            indicatorsToExclude[i._id]=true;
          });
          // either string or array depending on whether 1 or more things selected
          if(typeof body.indicatorIdsToInclude === 'string') body.indicatorIdsToInclude = [body.indicatorIdsToInclude];
          body.indicatorIdsToInclude.forEach((i)=>{
            delete indicatorsToExclude[i];
          });
          user.emailIndicatorIdsToExclude = Object.keys(indicatorsToExclude);
        } else {
          user.emailIndicatorIdsToExclude = indicatorList.map(i => i._id);
        }
        if(body.patientsToInclude) {
          const patientTypesToExclude = {};
          patients.possibleExcludeType.forEach((i)=>{
            patientTypesToExclude[i.id]=true;
          });
          if(typeof body.patientsToInclude === 'string') body.patientsToInclude = [body.patientsToInclude];
          body.patientsToInclude.forEach((i)=>{
            delete patientTypesToExclude[i];
          });
          user.patientTypesToExclude = Object.keys(patientTypesToExclude);
        } else {
          user.patientTypesToExclude = patients.possibleExcludeType.map(i => i.id);
        }
        user.emailFrequency = body.freq;
        user.emailDay = body.day;
        user.emailHour = body.hour;
        user.save(function(err) {
          if (err) {
            console.log('Error in Saving user: ' + err);
            throw err;
          }
          return done(null, user);
        });
      }
    });
  },

  edit: function(email, req, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // doesn't exist
      if (!user) {
        console.log('User doesnt exist with email: ' + email);
        return done(null, false, 'Trying to edit a user with an email not found in the system');
      } else {

        var roles = [];
        if (req.body.isAdmin) roles.push("admin");
        var originalUser = user;

        if(email === req.body.email){
          //email not changing so update is fine
          user.fullname = req.body.fullname;
          user.emailFrequency = req.body.freq;
          user.emailDay = req.body.day;
          user.emailHour = req.body.hour;
          var els = req.body.practice.split("|");
          user.practiceId = els[0] !== "" ? els[0] : "";
          user.practiceName = els[0] !== "" ? els[1] : "None";
          user.roles = roles;
          // save the user
          user.save(function(err) {
            if (err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }
            return done(null, user);
          });
        } else {
          //check no existing user with that email
          User.findOne({
            'email': req.body.email
          }, function(err, user) {
            // if there is already a user with the modified email address
            if(user) {
              console.log('Trying to change the email to one that already appears in the system: ' + email);
              return done(null, false, 'Trying to change the email to one that already appears in the system.');
            } else {
              originalUser.email = req.body.email;
              originalUser.fullname = req.body.fullname;
              originalUser.emailFrequency = req.body.freq;
              originalUser.emailDay = req.body.day;
              originalUser.emailHour = req.body.hour;
              var els = req.body.practice.split("|");
              originalUser.practiceId = els[0] !== "" ? els[0] : "";
              originalUser.practiceName = els[0] !== "" ? els[1] : "None";
              originalUser.roles = roles;
              // save the user
              originalUser.save(function(err) {
                if (err) {
                  console.log('Error in Saving user: ' + err);
                  throw err;
                }
                return done(null, originalUser);
              });
            }
          });
        }
      }
    });
  },

  add: function(req, done) {
    User.findOne({
      'email': req.body.email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // already exists
      if (user) {
        console.log('User already exists with email: ' + req.body.email);
        return done(null, false, req.flash('error', 'An account with that email address already exists'));
      } else {
        // if there is no user with that email
        // create the user
        var roles = [];
        if (req.body.isAdmin) roles.push("admin");

        var els = req.body.practice.split("|");
        var newUser = new User({
          email: req.body.email,
          emailFrequency: req.body.freq,
          emailDay: req.body.day,
          emailHour: req.body.hour,
          password: req.body.password,
          fullname: req.body.fullname,
          practiceId: els[0] !== "" ? els[0] : "",
          practiceName: els[0] !== "" ? els[1] : "None",
          roles: roles
        });

        // save the user
        newUser.save(function(err) {
          if (err) {
            console.log('Error in Saving user: ' + err);
            throw err;
          }
          console.log('User Registration succesful');
          return done(null, newUser);
        });
      }
    });
  }

};
