const ExcludedPatient = require('../models/excludedPatient');
const events = require('./events');

module.exports = {

  // Get all excluded patients for a practice
  get: (req, res) => {
    ExcludedPatient.find({ practiceId: req.params.practiceId }, (err, patients) => {
      if (err) {
        console.log(err);
        return res.send(new Error('Error finding excluded patients'));
      }
      if (!patients) {
        console.log(`Invalid request for practiceId: ${req.params.practiceId}`);
        return res.send(false);
      }
      return res.send(patients);
    });
  },

  // TODO check that practice id and patient id match
  exclude: (req, res) => {
    const patient = new ExcludedPatient({
      practiceId: req.params.practiceId,
      patientId: req.params.patientId,
      indicatorId: req.params.indicatorId,
      reason: req.body.reason,
      freetext: req.body.freetext,
      who: req.user.fullname,
      when: Date.now(),
    });
    patient.save((err) => {
      if (err) {
        console.log(`Error in excluding patient: ${err}`);
        return res.send(false);
      }
      return events.excludePatient(
        req.sessionID,
        req.params.patientId,
        req.params.indicatorId,
        req.body.reason,
        req.body.freetext,
        req.user.email,
        () => res.send(patient)
      );
    });
  },

  // TODO check that practice id and patient id match
  include: (req, res) => {
    ExcludedPatient.remove({
      practiceId: req.params.practiceId,
      patientId: req.params.patientId,
      indicatorId: req.params.indicatorId,
    }, (err) => {
      if (err) {
        console.log(`Error in including patient: ${err}`);
        return res.send(false);
      }
      return events.includePatient(
        req.sessionID,
        req.params.patientId,
        req.params.indicatorId,
        req.user.email,
        () => res.send(true)
      );
    });
  },
};
