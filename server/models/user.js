var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs'),
  SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  practiceId: {
    type: String
  },
  practiceName: {
    type: String
  },
  practiceIdNotAuthorised: {
    type: String
  },
  practiceNameNotAuthorised: {
    type: String
  },
  password_recovery_code: {
      type: String
  },
  password_recovery_expiry: {
      type: Date
  },
  roles:[String],
  last_login: Date,
  email_opt_out: Boolean
});

UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.changePassword = function(newPassword, cb) {
    this.password = newPassword;
    this.save();
};

module.exports = mongoose.model('User', UserSchema);
