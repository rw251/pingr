const Email = require('../models/email');
const utils = require('./utils');
const config = require('../config');
const jade = require('jade');

const jade2html = function (input, data) {
  return jade.compile(input, {
    pretty: true,
    doctype: "5"
  })(data);
};

const getDefault = (done) => {
  Email.findOne({ isDefault: true }, function(err, email) {
    if (err) {
      console.log(err);
      return done(new Error("Error finding default email"));
    }
    if (!email) {
      console.log('No default email');
      return done(null, false);
    } else {
      done(null, email);
    }
  });
};

module.exports = {

  //Get list of actions for a single practice
  list: function(done) {
    Email.find({}, function(err, emails) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding email list"));
      }
      if (!emails) {
        console.log('No email list');
        return done(null, false);
      } else {
        done(null, emails);
      }
    });
  },

  get: function(label, done) {
    Email.findOne({ label: label }, function(err, email) {
      if (err) {
        console.log(err);
        return done(new Error("Error finding email with label " + label));
      }
      if (!email) {
        console.log('No email with label ' + label);
        return done(null, false);
      } else {
        done(null, email);
      }
    });
  },

  getDefault,

  setDefault: function(label, done) {
    Email.findOne({
      'label': label
    }, function(err, email) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in email setDefault: ' + err);
        return done(err);
      }
      // doesn't exist
      if (!email) {
        console.log('Email doesnt exist with label: ' + label);
        return done(null, false, 'Trying to edit an email with a label not found in the system');
      } else {
        //unset current default
        Email.update({}, { $set: { isDefault: false } }, {multi: true}, function(err) {
          email.isDefault = true;
          email.save(function(err) {
            if (err) return done(err);
            else return done();
          });
        });
      }
    });
  },

  delete: function(label, done) {
    Email.find({ label: label }).remove(done);
  },

  edit: function(label, req, done) {
    Email.findOne({
      'label': label
    }, function(err, email) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in email edit: ' + err);
        return done(err);
      }
      // doesn't exist
      if (!email) {
        console.log('Email doesnt exist with label: ' + label);
        return done(null, false, 'Trying to edit an email with a label not found in the system');
      } else {
        var originalEmail = email;
        if (label === req.body.label) {
          //email not changing so update is fine
          email.subject = req.body.subject;
          email.body = req.body.body;
          // save the user
          email.save(function(err) {
            if (err) {
              console.log('Error in Saving email: ' + err);
              throw err;
            }
            console.log('Email edit succesful');
            return done(null, email);
          });
        } else {
          //check no existing email with that email
          Email.findOne({
            'label': req.body.label
          }, function(err, email) {
            // if there is already an email with the modified label
            if (email) {
              console.log('Trying to change the label to one that already appears in the system: ' + label);
              return done(null, false, 'Trying to change the label to one that already appears in the system.');
            } else {
              originalEmail.label = req.body.label;
              originalEmail.subject = req.body.subject;
              originalEmail.body = req.body.body;

              // save the email
              originalEmail.save(function(err) {
                if (err) {
                  console.log('Error in Saving email: ' + err);
                  throw err;
                }
                console.log('Email edit succesful');
                return done(null, originalEmail);
              });
            }
          });
        }
      }
    });
  },

  create: function(req, done) {
    Email.findOne({ label: req.body.label }, function(err, email) {
      if (err) {
        console.log('Error in email creation: ' + err);
        return done(err);
      }
      // already exists
      if (email) {
        console.log('Email already exists with label: ' + req.body.label);
        return done(null, false, 'An email with that label already exists');
      } else {
        email = new Email({
          label: req.body.label,
          subject: req.body.subject,
          body: req.body.body
        });

        email.save(function(err) {
          if (err) {
            console.log('Error in Saving email: ' + err);
            throw err;
          }
          console.log('Email creation succesful');
          return done(null, email);
        });
      }
    });
  },

  sample: (user, done) => {
    utils.getDataForEmails(user, (err, data) => {
      if (err) return done(err);
      data = data.data; // !!
      data.pingrUrl = config.server.url + "/";
      data.pingrUrlWithoutTracking = config.server.url + "/";

      var patientIdLookup = {};
      if(data.patients) {
        data.patients.forEach((p) => {
          patientIdLookup[p.nhsNumber] = p._id;
        });
      }
      return getDefault((err, emailTemplate) => {
        if (err) return done(err);
        var emailHTMLBody = jade2html(emailTemplate.body, data);
        return done(null, emailHTMLBody);
      });
    });
  }
};
