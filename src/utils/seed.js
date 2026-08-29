const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');
const env = require('../config/env');

const Admin = require('../models/Admin');
const User = require('../models/User');
const Haircut = require('../models/Haircut');
const Offer = require('../models/Offer');
const Carousel = require('../models/Carousel');
const Language = require('../models/Language');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const RefreshToken = require('../models/RefreshToken');
const bookingStatus = require('../constants/bookingStatus');
const roles = require('../constants/roles');

const IMAGE = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  haircut: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
  haircut2: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=80',
  haircut3: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80',
  haircut4: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1000&q=80',
  haircut5: 'https://images.unsplash.com/photo-1593702295094-aea8e6d8fba7?auto=format&fit=crop&w=1000&q=80',
  haircut6: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1000&q=80',
  bridal: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function dateOnly(offsetDays = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function dateTime(offsetDays, hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

async function upsertAdmin(data) {
  let doc = await Admin.findOne({ email: data.email });
  if (!doc) {
    doc = new Admin(data);
    await doc.save();
  } else {
    Object.assign(doc, {
      name: data.name,
      phone: data.phone,
      profileImage: data.profileImage,
      role: roles.ADMIN,
      isActive: true
    });
    await doc.save();
  }
  return doc;
}

async function upsertUser(data) {
  let doc = await User.findOne({ email: data.email }).select('+password');
  if (!doc) {
    doc = new User(data);
    await doc.save();
  } else {
    Object.assign(doc, {
      name: data.name,
      phone: data.phone,
      profileImage: data.profileImage,
      preferredLanguage: data.preferredLanguage,
      themePreference: data.themePreference,
      isActive: true,
      isBlocked: false
    });
    await doc.save();
  }
  return doc;
}

async function upsertHaircuts() {
  const rows = [
    {
      key: 'classic-cut',
      name: 'Classic Haircut',
      description: 'Clean, timeless haircut with wash and finish.',
      image: IMAGE.haircut,
      price: 499,
      durationMinutes: 30,
      displayOrder: 1
    },
    {
      key: 'fade-cut',
      name: 'Premium Fade',
      description: 'Modern skin fade with detailed blending and styling.',
      image: IMAGE.haircut2,
      price: 699,
      durationMinutes: 45,
      displayOrder: 2
    },
    {
      key: 'beard-style',
      name: 'Beard Trim & Shape',
      description: 'Professional beard trim, shape and hot towel finish.',
      image: IMAGE.haircut3,
      price: 399,
      durationMinutes: 25,
      displayOrder: 3
    },
    {
      key: 'kids-cut',
      name: 'Kids Haircut',
      description: 'Comfortable haircut designed for children.',
      image: IMAGE.haircut4,
      price: 349,
      durationMinutes: 30,
      displayOrder: 4
    },
    {
      key: 'hair-spa',
      name: 'Hair Spa Treatment',
      description: 'Deep conditioning treatment for healthier, smoother hair.',
      image: IMAGE.spa,
      price: 999,
      durationMinutes: 60,
      displayOrder: 5
    },
    {
      key: 'bridal-styling',
      name: 'Bridal Hair Styling',
      description: 'Elegant hair styling consultation and event-ready finish.',
      image: IMAGE.bridal,
      price: 2499,
      durationMinutes: 120,
      displayOrder: 6
    }
  ];

  const result = {};
  for (const row of rows) {
    let doc = await Haircut.findOne({ name: row.name });
    if (!doc) doc = new Haircut({ ...row });
    else Object.assign(doc, row);
    await doc.save();
    result[row.key] = doc;
  }
  return result;
}

async function upsertOffers(haircuts) {
  const offers = [
    {
      title: 'Weekend Grooming Combo',
      description: 'Classic haircut + beard trim at a special weekend price.',
      image: IMAGE.haircut,
      originalPrice: 898,
      offerPrice: 749,
      services: [haircuts['classic-cut']._id, haircuts['beard-style']._id],
      validFrom: dateTime(-7, 0, 0),
      validTo: dateTime(30, 23, 59),
      displayOrder: 1
    },
    {
      title: 'Premium Style Package',
      description: 'Premium fade + hair spa for a complete grooming session.',
      image: IMAGE.haircut2,
      originalPrice: 1698,
      offerPrice: 1399,
      services: [haircuts['fade-cut']._id, haircuts['hair-spa']._id],
      validFrom: dateTime(-2, 0, 0),
      validTo: dateTime(45, 23, 59),
      displayOrder: 2
    },
    {
      title: 'Bridal Ready Package',
      description: 'Bridal hair styling with a pre-event hair spa treatment.',
      image: IMAGE.bridal,
      originalPrice: 3498,
      offerPrice: 2999,
      services: [haircuts['bridal-styling']._id, haircuts['hair-spa']._id],
      validFrom: dateTime(-1, 0, 0),
      validTo: dateTime(60, 23, 59),
      displayOrder: 3
    }
  ];

  const result = {};
  for (const data of offers) {
    let doc = await Offer.findOne({ title: data.title });
    if (!doc) doc = new Offer(data);
    else Object.assign(doc, data);
    doc.isActive = true;
    doc.isDeleted = false;
    await doc.save();
    result[data.title] = doc;
  }
  return result;
}

async function upsertCarousels(offers, haircuts) {
  const banners = [
    {
      title: 'Premium Grooming, Expert Hands',
      description: 'Book your next salon experience in just a few taps.',
      images: [IMAGE.salon, IMAGE.haircut2],
      ctaAction: 'BOOK_NOW',
      ctaTargetId: '',
      displayOrder: 1,
      startDate: dateTime(-7, 0, 0),
      endDate: dateTime(90, 23, 59)
    },
    {
      title: 'Weekend Grooming Combo',
      description: 'Save on haircut and beard grooming this weekend.',
      images: [IMAGE.haircut, IMAGE.haircut3],
      ctaAction: 'OFFER_VIEW',
      ctaTargetId: String(offers['Weekend Grooming Combo']._id),
      displayOrder: 2,
      startDate: dateTime(-1, 0, 0),
      endDate: dateTime(30, 23, 59)
    },
    {
      title: 'Bridal Ready',
      description: 'Get event-ready with our premium bridal styling package.',
      images: [IMAGE.bridal, IMAGE.spa],
      ctaAction: 'OFFER_VIEW',
      ctaTargetId: String(offers['Bridal Ready Package']._id),
      displayOrder: 3,
      startDate: dateTime(-1, 0, 0),
      endDate: dateTime(60, 23, 59)
    },
    {
      title: 'Discover Our Services',
      description: 'Explore haircut and grooming services for every style.',
      images: [IMAGE.haircut4, IMAGE.haircut5, IMAGE.haircut6],
      ctaAction: 'HAIRCUT_VIEW',
      ctaTargetId: String(haircuts['fade-cut']?._id || ''),
      displayOrder: 4,
      startDate: dateTime(-7, 0, 0),
      endDate: dateTime(90, 23, 59)
    }
  ];

  const result = {};
  for (const data of banners) {
    let doc = await Carousel.findOne({ title: data.title });
    if (!doc) doc = new Carousel(data);
    else Object.assign(doc, data);
    doc.isActive = true;
    await doc.save();
    result[data.title] = doc;
  }
  return result;
}

async function seedLanguages() {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true, translations: { home: 'Home', bookings: 'Bookings', offers: 'Offers', profile: 'Profile' } },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isDefault: false, isActive: true, translations: { home: 'முகப்பு', bookings: 'முன்பதிவுகள்', offers: 'சலுகைகள்', profile: 'சுயவிவரம்' } },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isDefault: false, isActive: true, translations: { home: 'ഹോം', bookings: 'ബുക്കിംഗുകൾ', offers: 'ഓഫറുകൾ', profile: 'പ്രൊഫൈൽ' } },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isDefault: false, isActive: true, translations: { home: 'होम', bookings: 'बुकिंग', offers: 'ऑफर', profile: 'प्रोफ़ाइल' } },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isDefault: false, isActive: true, translations: { home: 'ಮುಖಪುಟ', bookings: 'ಬುಕಿಂಗ್‌ಗಳು', offers: 'ಆಫರ್‌ಗಳು', profile: 'ಪ್ರೊಫೈಲ್' } }
  ];

  for (const data of languages) {
    await Language.updateOne({ code: data.code }, { $set: data }, { upsert: true });
  }
}

async function seedAvailability() {
  const existing = await Availability.findOne();
  if (existing) return existing;

  const schedule = days.map((day) => ({
    day,
    isOpen: day !== 'Sunday',
    scheduleType: day === 'Saturday' ? 'HALF_DAY' : 'FULL_DAY',
    slots: day === 'Sunday'
      ? []
      : day === 'Saturday'
        ? [{ startTime: '09:00', endTime: '15:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }]
        : [{ startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }]
  }));

  return Availability.create({
    weeklySchedule: schedule,
    specialDates: [
      { date: dateOnly(7), isHoliday: true, reason: 'Annual Salon Maintenance', customSlots: [] },
      { date: dateOnly(14), isHoliday: false, reason: 'Special Saturday Timings', customSlots: [{ startTime: '10:00', endTime: '16:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }] }
    ],
    isBusinessOpen: true,
    requireExactTimeSlot: true
  });
}

async function seedBookings(admin, users, haircuts, offers) {
  await Review.deleteMany({ booking: { $in: await Booking.find({ bookingCode: /^SEED-/ }).distinct('_id') } });
  await Booking.deleteMany({ bookingCode: /^SEED-/ });

  const bookingRows = [
    {
      bookingCode: 'SEED-COMPLETED-001', user: users.primary._id, itemType: 'HAIRCUT', haircut: haircuts['classic-cut']._id, offer: null,
      bookingDate: dateOnly(-5), bookingTime: '10:00', durationMinutes: 30, totalAmount: 499, status: bookingStatus.COMPLETED,
      notes: 'Please keep the sides slightly shorter.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.primary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: dateTime(-5, 8) }, { status: bookingStatus.CONFIRMED, changedBy: admin._id, changedByModel: 'Admin', note: 'Appointment confirmed', timestamp: dateTime(-5, 9) }, { status: bookingStatus.COMPLETED, changedBy: admin._id, changedByModel: 'Admin', note: 'Service completed', timestamp: dateTime(-5, 11) }],
      isReviewed: true
    },
    {
      bookingCode: 'SEED-COMPLETED-002', user: users.secondary._id, itemType: 'OFFER_PACKAGE', haircut: null, offer: offers['Weekend Grooming Combo']._id,
      bookingDate: dateOnly(-3), bookingTime: '14:00', durationMinutes: 55, totalAmount: 749, status: bookingStatus.COMPLETED,
      notes: 'First-time customer.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.secondary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: dateTime(-3, 12) }, { status: bookingStatus.CONFIRMED, changedBy: admin._id, changedByModel: 'Admin', note: 'Appointment confirmed', timestamp: dateTime(-3, 13) }, { status: bookingStatus.COMPLETED, changedBy: admin._id, changedByModel: 'Admin', note: 'Package completed', timestamp: dateTime(-3, 15) }],
      isReviewed: true
    },
    {
      bookingCode: 'SEED-CONFIRMED-001', user: users.primary._id, itemType: 'HAIRCUT', haircut: haircuts['fade-cut']._id, offer: null,
      bookingDate: dateOnly(1), bookingTime: '11:00', durationMinutes: 45, totalAmount: 699, status: bookingStatus.CONFIRMED,
      notes: 'Please use a low fade.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.primary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: dateTime(0, 10) }, { status: bookingStatus.CONFIRMED, changedBy: admin._id, changedByModel: 'Admin', note: 'Appointment confirmed', timestamp: dateTime(0, 11) }],
      isReviewed: false
    },
    {
      bookingCode: 'SEED-PENDING-001', user: users.tertiary._id, itemType: 'HAIRCUT', haircut: haircuts['kids-cut']._id, offer: null,
      bookingDate: dateOnly(2), bookingTime: '15:00', durationMinutes: 30, totalAmount: 349, status: bookingStatus.PENDING,
      notes: 'Child appointment.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.tertiary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: new Date() }],
      isReviewed: false
    },
    {
      bookingCode: 'SEED-CANCELLED-001', user: users.secondary._id, itemType: 'HAIRCUT', haircut: haircuts['hair-spa']._id, offer: null,
      bookingDate: dateOnly(3), bookingTime: '16:00', durationMinutes: 60, totalAmount: 999, status: bookingStatus.CANCELLED,
      notes: 'Customer had a schedule conflict.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.secondary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: dateTime(0, 10) }, { status: bookingStatus.CONFIRMED, changedBy: admin._id, changedByModel: 'Admin', note: 'Appointment confirmed', timestamp: dateTime(0, 12) }, { status: bookingStatus.CANCELLED, changedBy: users.secondary._id, changedByModel: 'User', note: 'Customer cancelled', timestamp: dateTime(1, 18) }],
      isReviewed: false
    },
    {
      bookingCode: 'SEED-REJECTED-001', user: users.tertiary._id, itemType: 'OFFER_PACKAGE', haircut: null, offer: offers['Bridal Ready Package']._id,
      bookingDate: dateOnly(4), bookingTime: '10:00', durationMinutes: 180, totalAmount: 2999, status: bookingStatus.REJECTED,
      notes: 'Requested slot was unavailable.',
      statusHistory: [{ status: bookingStatus.PENDING, changedBy: users.tertiary._id, changedByModel: 'User', note: 'Booking requested by customer', timestamp: new Date() }, { status: bookingStatus.REJECTED, changedBy: admin._id, changedByModel: 'Admin', note: 'Requested slot could not be accommodated', timestamp: new Date() }],
      isReviewed: false
    }
  ];

  return Booking.insertMany(bookingRows);
}

async function seedReviews(bookings, users, haircuts) {
  const completedHaircut = bookings.find((b) => b.bookingCode === 'SEED-COMPLETED-001');
  const completedOffer = bookings.find((b) => b.bookingCode === 'SEED-COMPLETED-002');

  await Review.create([
    {
      booking: completedHaircut._id,
      user: users.primary._id,
      haircut: haircuts['classic-cut']._id,
      offer: null,
      rating: 5,
      comment: 'Excellent service. The haircut was exactly what I wanted.',
      isVisible: true
    },
    {
      booking: completedOffer._id,
      user: users.secondary._id,
      haircut: null,
      offer: completedOffer.offer,
      rating: 4,
      comment: 'Great combo and friendly staff. Booking was easy.',
      isVisible: true
    }
  ]);
}

async function seedNotifications(admin, users, bookings) {
  await Notification.deleteMany({ 'data.seedKey': /^seed-/ });

  const completed = bookings.find((b) => b.bookingCode === 'SEED-COMPLETED-001');
  const confirmed = bookings.find((b) => b.bookingCode === 'SEED-CONFIRMED-001');

  await Notification.insertMany([
    {
      recipient: users.primary._id,
      recipientModel: 'User',
      title: 'Booking Confirmed',
      body: `Your booking ${confirmed.bookingCode} is confirmed for ${confirmed.bookingDate} at ${confirmed.bookingTime}.`,
      type: 'BOOKING',
      data: { seedKey: 'seed-user-booking-confirmed', bookingId: confirmed._id, status: confirmed.status },
      isRead: false
    },
    {
      recipient: users.primary._id,
      recipientModel: 'User',
      title: 'Salon Hours Updated',
      body: 'Weekly operating hours were updated. Please check the latest available booking times.',
      type: 'SYSTEM',
      data: { seedKey: 'seed-user-hours-updated', source: 'availability' },
      isRead: false
    },
    {
      recipient: users.secondary._id,
      recipientModel: 'User',
      title: 'Offer Available',
      body: 'The Weekend Grooming Combo is available for booking.',
      type: 'OFFER',
      data: { seedKey: 'seed-user-offer', offerId: String(completed.offer || '') },
      isRead: true
    },
    {
      recipient: admin._id,
      recipientModel: 'Admin',
      title: 'New Booking Received',
      body: `Booking ${completed.bookingCode} has been added as sample data.`,
      type: 'BOOKING',
      data: { seedKey: 'seed-admin-booking', bookingId: completed._id, status: completed.status },
      isRead: false
    },
    {
      recipient: admin._id,
      recipientModel: 'Admin',
      title: 'Seed Data Ready',
      body: 'Sample salon data has been inserted successfully.',
      type: 'SYSTEM',
      data: { seedKey: 'seed-admin-ready' },
      isRead: true
    }
  ]);
}

async function seedRefreshTokens(admin, users) {
  await RefreshToken.deleteMany({ token: /^SEED_REFRESH_/ });
  const expiresAt = dateTime(7, 23, 59);
  await RefreshToken.create([
    {
      token: `SEED_REFRESH_ADMIN_${crypto.randomBytes(12).toString('hex')}`,
      userId: admin._id,
      userModel: 'Admin',
      role: roles.ADMIN,
      expiresAt,
      isRevoked: false,
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script'
    },
    {
      token: `SEED_REFRESH_USER_${crypto.randomBytes(12).toString('hex')}`,
      userId: users.primary._id,
      userModel: 'User',
      role: roles.USER,
      expiresAt,
      isRevoked: false,
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script'
    }
  ]);
}

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log(`Connected to MongoDB: ${env.MONGO_URI}`);

  const admin = await upsertAdmin({
    name: env.DEFAULT_ADMIN_NAME || 'Super Administrator',
    email: env.DEFAULT_ADMIN_EMAIL || 'admin@salon.com',
    password: env.DEFAULT_ADMIN_PASSWORD || 'Admin@Secure2026!',
    phone: env.DEFAULT_ADMIN_PHONE || '+1234567890',
    profileImage: IMAGE.salon,
    isActive: true
  });

  // NOTE: We intentionally use fixed sample credentials below. Change them in production.
  const users = {
    primary: await upsertUser({
      name: 'Arun Kumar', email: 'user1@salon.com', password: 'User@12345', phone: '+919876543210',
      profileImage: IMAGE.haircut, preferredLanguage: 'en', themePreference: 'system', isActive: true, isBlocked: false
    }),
    secondary: await upsertUser({
      name: 'Priya Sharma', email: 'user2@salon.com', password: 'User@12345', phone: '+919876543211',
      profileImage: IMAGE.bridal, preferredLanguage: 'ta', themePreference: 'light', isActive: true, isBlocked: false
    }),
    tertiary: await upsertUser({
      name: 'Vikram Singh', email: 'user3@salon.com', password: 'User@12345', phone: '+919876543212',
      profileImage: IMAGE.haircut3, preferredLanguage: 'hi', themePreference: 'dark', isActive: true, isBlocked: false
    })
  };

  const haircuts = await upsertHaircuts();
  const offers = await upsertOffers(haircuts);
  await upsertCarousels(offers, haircuts);
  await seedLanguages();
  await seedAvailability();
  const bookings = await seedBookings(admin, users, haircuts, offers);
  await seedReviews(bookings, users, haircuts);
  await seedNotifications(admin, users, bookings);
  await seedRefreshTokens(admin, users);

  console.log('\nSeed completed successfully.');
  console.log('Admin login:', admin.email, '/', env.DEFAULT_ADMIN_PASSWORD || 'Admin@Secure2026!');
  console.log('User logins: user1@salon.com / User@12345, user2@salon.com / User@12345, user3@salon.com / User@12345');
  console.log('Collections seeded: Admin, User, Haircut, Offer, Carousel, Language, Availability, Booking, Review, Notification, RefreshToken');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
