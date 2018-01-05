const mongoose = require('mongoose');

const { Schema } = mongoose;

const bcrypt = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  practices: [
    {
      id: String,
      name: String,
      authorised: Boolean,
    },
  ],
  practiceId: {
    type: String,
  },
  practiceName: {
    type: String,
  },
  practiceIdNotAuthorised: {
    type: String,
  },
  practiceNameNotAuthorised: {
    type: String,
  },
  password_recovery_code: {
    type: String,
  },
  password_recovery_expiry: {
    type: Date,
  },
  roles: [String],
  last_login: Date,
  last_email_reminder: Date,
  email_opt_out: Boolean,
  email_url_tracking_code: String,
  emailFrequency: Number,
  emailDay: Number,
  emailHour: Number,
  emailIndicatorIdsToExclude: [String],
  patientTypesToExclude: {
    type: [String],
    default: ['NO_REVIEW', 'AFTER_APRIL', 'REVIEW_YET_TO_HAPPEN'],
  },
  registrationCode: String,
});

// Don't change to '=>' syntax as we need 'this' to be the user
UserSchema.pre('save', function save(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  return bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password along with our new salt
    return bcrypt.hash(user.password, salt, null, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      // override the cleartext password with the hashed one
      user.password = hash;
      return next();
    });
  });
});

// Don't change to '=>' syntax as we need 'this' to be the user
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

// Don't change to '=>' syntax as we need 'this' to be the user
UserSchema.methods.changePassword = function changePassword(newPassword) {
  this.password = newPassword;
  this.save();
};

module.exports = mongoose.model('User', UserSchema);
