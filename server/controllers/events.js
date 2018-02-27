const Event = require('../models/event');
const json2csv = require('json2csv');
const User = require('../models/user');
const emailSender = require('../email-sender');
const config = require('../config');

const headings = {};

const processEvent = (event) => {
  const procEvent = event.toObject();
  if (procEvent.data) {
    procEvent.data.forEach((v) => {
      procEvent[`data.${v.key}`] = v.value;
    });
  }
  delete procEvent.data;
  return procEvent;
};

const removeTabsAndNewLines = (event) => {
  Object.keys(event).forEach((v) => {
    if (!headings[v]) headings[v] = true;
    if (v === 'date') {
      event[v] = `${new Date(event[v]).toISOString().substr(0, 10)} ${new Date(event[v]).toISOString().substr(11, 12)}`;
    } else if (event[v] !== null && event[v] !== undefined) {
      event[v] = event[v].toString().replace(/[\r\n\t]/g, ' ');
    } else {
      event[v] = '';
    }
  });
  return event;
};

const toTabbedFile = (events) => {
  const head = Object.keys(headings);

  // var content = [head.join("\t")];

  return {
    headings: head,
    body: events.map(v => head.map(vv => v[vv] || '').join('\t')).join('\n'),
  };
};

const e = {

  // Get list of events for a given type - or all
  list(filter, skip, limit, done) {
    Event.find(
      filter,
      null,
      { skip: +skip || 0, limit: +limit || 100, sort: { date: -1 } },
      (err, events) => {
        if (err) {
          console.log(err);
          return done(new Error('Error finding event list'));
        }
        if (!events) {
          console.log('Error finding event list');
          return done(null, false);
        }
        return done(null, events);
      }
    );
  },

  // Get list of events for a given type - or all
  csv(filter, skip, limit, done) {
    Event.find(
      filter,
      null,
      { skip: +skip || 0, limit: +limit || 100, sort: { date: -1 } },
      (err, events) => {
        if (err) {
          console.log(err);
          return done(new Error('Error finding event list'));
        }
        if (!events) {
          console.log('Error finding event list');
          return done(null, false);
        }
        return done(null, json2csv({ data: events.map(processEvent) }));
      }
    );
  },

  // tab separated
  tab(filter, done) {
    Event.find(filter, (err, events) => {
      if (err) {
        console.log(err);
        return done(new Error('Error finding event list'));
      }
      if (!events) {
        console.log('Error finding event list');
        return done(null, false);
      }
      return done(null, toTabbedFile(events.map(processEvent).map(removeTabsAndNewLines)));
    });
  },

  download(options, done) {
    const filter = {};
    if (options.from && options.to) {
      filter.date = { $gte: new Date(options.from), $lte: new Date(options.to) };
    } else if (options.from) {
      filter.date = { $gte: new Date(options.from) };
    } else if (options.to) {
      filter.date = { $lte: new Date(options.to) };
    }

    if (options.user) filter.user = options.user;

    Event.find(filter, (err, events) => {
      if (err) return done(err);
      if (options.csv && options.csv !== 'json') return done(null, 'csv', json2csv({ data: events.map(processEvent) }));
      return done(null, 'json', events);
    });
  },

  add(event, done) {
    if (event) {
      // record to mongo
      try {
        const newEvent = new Event(event);

        // save the event
        return newEvent.save((err) => {
          if (err) {
            return done(err);
          }
          // if suggestion then email ben
          if (event.type === 'suggestion') {
            const emailConfig = emailSender.config(
              config.mail.type, config.mail.adminEmailsFrom, { name: 'Ben Brown', email: config.mail.suggestionEmailsTo }, 'PINGR: Someone has made a suggestion',
              `Someone has made a suggestion. Details are:\n\n ${JSON.stringify(event, null, 2)}\n\n Regards,\n\nPINGR`, null, null
            );
              // Send email
            return emailSender.send(emailConfig, (error) => {
              if (error) {
                console.log(`email not sent: ${error}`);
              }
              return done(null);
            });
          }
          return done(null);
        });
      } catch (error) {
        return done(error);
      }
    } else {
      return done('oops');
    }
  },

  excludePatient(session, patientId, indicatorId, reason, text, email, done) {
    const newEvent = new Event({
      sessionId: session,
      user: email,
      type: 'excludePatient',
      data: [
        { key: 'patientId', value: patientId },
        { key: 'indicatorId', value: indicatorId },
        { key: 'text', value: text },
        { key: 'reasonText', value: reason },
      ],
    });

    // save the event
    newEvent.save((err) => {
      if (err) {
        console.log(`Error writing login event: ${err}`);
        return done(err);
      }
      return done(null);
    });
  },

  includePatient(session, patientId, indicatorId, email, done) {
    const newEvent = new Event({
      sessionId: session,
      user: email,
      type: 'includePatient',
      data: [
        { key: 'patientId', value: patientId },
        { key: 'indicatorId', value: indicatorId },
      ],
    });

    // save the event
    newEvent.save((err) => {
      if (err) {
        console.log(`Error writing login event: ${err}`);
        return done(err);
      }
      return done(null);
    });
  },

  emailReminder(email, token, body, date, patientIdLookup, done) {
    const newEvent = new Event({ date, user: email, type: 'emailReminderSent', data: [{ key: 'token', value: token }] });

    // find nhs numbers if any
    const matches = body.match(/[0-9]{9,10}/g);
    if (matches && matches.length > 0) {
      const patientIds = matches.map(nhs => patientIdLookup[nhs] || '?').join(',');
      newEvent.data.push({ key: 'patientIds', value: patientIds });
    }

    // remove nhs numbers
    newEvent.data.push({ key: 'body', value: body.replace(/[0-9]{9}/g, '?????????') });

    // save the event
    newEvent.save((err) => {
      if (err) {
        console.log(`Error writing login event: ${err}`);
        return done(err);
      }
      return done(null);
    });
  },

  emailReminderOpenedTokenCheck(email, token) {
    User.findOne({ email }, (err, user) => {
      if (user) {
        const newEvent = new Event({ user: user.email, type: 'emailReminderOpened', data: [{ key: 'token', value: token }] });

        // save the event
        newEvent.save((saveErr) => {
          if (saveErr) {
            console.log(`Error writing login event: ${saveErr}`);
          }
        });
      }
    });
  },

  emailReminderTokenCheck(token, url) {
    User.findOne({ email_url_tracking_code: token }, (err, user) => {
      if (user) {
        const newEvent = new Event({ user: user.email, type: 'emailReminderLinkClicked', url, data: [{ key: 'token', value: token }] });

        // save the event
        newEvent.save((saveErr) => {
          if (saveErr) {
            console.log(`Error writing login event: ${saveErr}`);
          }
        });
      }
    });
  },

  login(email, session) {
    const newEvent = new Event({ sessionId: session, user: email, type: 'login' });

    // save the event
    newEvent.save((err) => {
      if (err) {
        console.log(`Error writing login event: ${err}`);
      }
    });
  },

  logout(email, session) {
    const newEvent = new Event({ sessionId: session, user: email, type: 'logout' });

    // save the event
    newEvent.save((err) => {
      if (err) {
        console.log(`Error writing login event: ${err}`);
      }
    });
  },

};

module.exports = e;
