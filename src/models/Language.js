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
    // Use a plain object instead of Mongoose Map.
    // Translation keys can legitimately contain periods, e.g.
    // "Add at least one image URL." and "home.book_now".
    translations: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;