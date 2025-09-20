const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'email';
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      if (this.authProvider === 'email') {
        return `email_${crypto.randomBytes(16).toString('hex')}`;
      }
      return undefined; 
    }
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
   tokenVersion: {              
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  otp: {
    code: { type: String },   
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
