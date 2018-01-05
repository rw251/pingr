const Email = require('../models/email');
const utils = require('./utils');
const config = require('../config');
const jade = require('jade');

const jade2html = (input, data) => jade.compile(input, {
  pretty: true,
  doctype: '5',
})(data);

const getDefault = (done) => {
  Email.findOne({ isDefault: true }, (err, email) => {
    if (err) {
      console.log(err);
      return done(new Error('Error finding default email'));
    }
    if (!email) {
      console.log('No default email');
      return done(null, false);
    }
    return done(null, email);
  });
};

module.exports = {

  // Get list of actions for a single practice
  list(done) {
    Email.find({}, (err, emails) => {
      if (err) {
        console.log(err);
        return done(new Error('Error finding email list'));
      }
      if (!emails) {
        console.log('No email list');
        return done(null, false);
      }
      return done(null, emails);
    });
  },

  get(label, done) {
    Email.findOne({ label }, (err, email) => {
      if (err) {
        console.log(err);
        return done(new Error(`Error finding email with label ${label}`));
      }
      if (!email) {
        console.log(`No email with label ${label}`);
        return done(null, false);
      }
      return done(null, email);
    });
  },

  getDefault,

  setDefault(label, done) {
    Email.findOne({
      label,
    }, (err, email) => {
      // In case of any error, return using the done method
      if (err) {
        console.log(`Error in email setDefault: ${err}`);
        return done(err);
      }
      // doesn't exist
      if (!email) {
        console.log(`Email doesnt exist with label: ${label}`);
        return done(null, false, 'Trying to edit an email with a label not found in the system');
      }
      // unset current default
      return Email.update({}, { $set: { isDefault: false } }, { multi: true }, () => {
        email.isDefault = true;
        email.save((saveErr) => {
          if (saveErr) return done(saveErr);
          return done();
        });
      });
    });
  },

  delete(label, done) {
    Email.find({ label }).remove(done);
  },

  edit(label, req, done) {
    Email.findOne({ label }, (err, emailTemplate) => {
      // In case of any error, return using the done method
      if (err) {
        console.log(`Error in email edit: ${err}`);
        return done(err);
      }
      // doesn't exist
      if (!emailTemplate) {
        console.log(`Email doesnt exist with label: ${label}`);
        return done(null, false, 'Trying to edit an email with a label not found in the system');
      }
      if (label === req.body.label) {
        // email not changing so update is fine
        emailTemplate.subject = req.body.subject;
        emailTemplate.body = req.body.body;
        // save the user
        return emailTemplate.save((saveErr) => {
          if (saveErr) {
            console.log(`Error in Saving email: ${saveErr}`);
            throw saveErr;
          }
          console.log('Email edit succesful');
          return done(null, emailTemplate);
        });
      }
      // check no existing email with that email
      return Email.findOne({
        label: req.body.label,
      }, (findErr, anExistingEmailTemplate) => {
        // if there is already an email with the modified label
        if (anExistingEmailTemplate) {
          console.log(`Trying to change the label to one that already appears in the system: ${label}`);
          return done(null, false, 'Trying to change the label to one that already appears in the system.');
        }
        emailTemplate.label = req.body.label;
        emailTemplate.subject = req.body.subject;
        emailTemplate.body = req.body.body;

        // save the email
        return emailTemplate.save((saveErr) => {
          if (saveErr) {
            console.log(`Error in Saving email: ${saveErr}`);
            throw saveErr;
          }
          console.log('Email edit succesful');
          return done(null, emailTemplate);
        });
      });
    });
  },

  create(req, done) {
    Email.findOne({ label: req.body.label }, (err, anExistingEmailTemplate) => {
      if (err) {
        console.log(`Error in email creation: ${err}`);
        return done(err);
      }
      // already exists
      if (anExistingEmailTemplate) {
        console.log(`Email already exists with label: ${req.body.label}`);
        return done(null, false, 'An email with that label already exists');
      }
      const emailTemplate = new Email({
        label: req.body.label,
        subject: req.body.subject,
        body: req.body.body,
      });

      return emailTemplate.save((saveErr) => {
        if (saveErr) {
          console.log(`Error in Saving email: ${saveErr}`);
          throw saveErr;
        }
        console.log('Email creation succesful');
        return done(null, emailTemplate);
      });
    });
  },

  sample: (user, done) => {
    utils.getDataForEmails(user.practices[0].id, user, (err, data) => {
      if (err) return done(err);
      const templateData = data.data; // !!
      templateData.pingrUrl = `${config.server.url}/`;
      templateData.pingrUrlWithoutTracking = `${config.server.url}/`;

      const patientIdLookup = {};
      if (templateData.patients) {
        templateData.patients.forEach((p) => {
          patientIdLookup[p.nhsNumber] = p._id;
        });
      }
      return getDefault((getErr, emailTemplate) => {
        if (getErr) return done(getErr);
        const emailHTMLBody = jade2html(emailTemplate.body, templateData);
        return done(null, emailHTMLBody);
      });
    });
  },
};
