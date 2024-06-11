const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  address: {
    type: String
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  refreshToken: {
    type: String
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});


// for hashing password before it is saved in database
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// method to check password validity
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// method to create password reset token
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('SHA256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
}


module.exports = mongoose.model('User', userSchema);