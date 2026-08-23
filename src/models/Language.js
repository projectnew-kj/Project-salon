const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // 'en', 'ta', 'ml', 'hi', 'kn'
    },
    name: {
      type: String,
      required: true,
      trim: true // 'English', 'Tamil', 'Malayalam', etc.
    },
    nativeName: {
      type: String,
      required: true,
      trim: true // 'தமிழ்', 'മലയാളം', 'हिन्दी', 'ಕನ್ನಡ'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    translations: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;