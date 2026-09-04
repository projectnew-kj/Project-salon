# Salon Booking Backend

Production-oriented REST and Socket.IO backend for the Salon Booking mobile applications.

## Stack
- Node.js 18+
- Express 4
- MongoDB / Mongoose 8
- JWT access + refresh tokens
- Socket.IO real-time notifications
- Joi validation
- Helmet, CORS, rate limiting, Winston/Morgan, Swagger

## Project Structure
```text
src/
├── config/              # DB, environment, logger, Swagger
├── constants/           # roles, booking statuses, socket events, HTTP codes
├── controllers/         # user and admin business logic
├── middlewares/         # auth, role, validation, errors, rate limits
├── models/              # MongoDB schemas
├── routes/v1/           # API v1 route modules
├── services/            # auth, booking engine, notifications, tokens
├── sockets/             # Socket.IO authentication and events
├── utils/               # response/error helpers and seed data
└── validations/         # Joi request schemas
```

## Features
- Admin and customer authentication
- Haircut/service CRUD
- Offer/package CRUD
- Carousel banner CRUD
- Weekly availability and breaks
- Booking and slot generation
- Reviews
- Real-time notifications
- Backend-driven multilingual translations

## Multilingual System
There are **no translation JSON files in the mobile applications**. Translations live in MongoDB in the `Language` collection.

Each language is a document containing a translation map:
```json
{
  "code": "en",
  "name": "English",
  "nativeName": "English",
  "isDefault": true,
  "isActive": true,
  "translations": {
    "home.book_now": "Book Appointment",
    "booking.my_bookings": "My Bookings"
  }
}
```

Supported seeded locales: `en`, `ta`, `hi`, `ml`, `kn`.

### Public language APIs
- `GET /api/v1/languages`
- `GET /api/v1/languages/:code/translations`

### Admin language APIs
Authenticated admin access is required:
- `GET /api/v1/admin/languages`
- `POST /api/v1/admin/languages`
- `PATCH /api/v1/admin/languages/:id`
- `DELETE /api/v1/admin/languages/:id`
- `PUT /api/v1/admin/languages/:id/translations/:key`
- `DELETE /api/v1/admin/languages/:id/translations/:key`

The Admin app uses these endpoints instead of editing JSON files.

## Database Collections
`Admin`, `User`, `Haircut`, `Offer`, `Carousel`, `Language`, `Availability`, `Booking`, `Review`, `Notification`, `RefreshToken`.

## Environment
Copy `.env.example` to `.env` and configure MongoDB, JWT, CORS and other production secrets.

## Install and Run
```bash
npm ci
npm run dev
```

Production:
```bash
npm ci --omit=dev
npm start
```

## Seed
The seed creates the sample application data and the complete initial translation dictionaries.
```bash
npm run seed
```

Seeded admin/user credentials are printed by the seed script. Never use seed credentials in production.

## API Base URL
Mobile apps are configured with:
```env
EXPO_PUBLIC_API_URL=https://your-api.example.com/api/v1
EXPO_PUBLIC_SOCKET_URL=https://your-api.example.com
```

## Booking Availability
`Availability` stores weekly schedules and special dates. Breaks are excluded from generated booking slots, and the booking engine validates the complete service duration against open periods.

## Security
- Never commit `.env` files.
- Use long random JWT secrets in production.
- Restrict `CORS_ORIGIN`.
- Keep rate limiting enabled.
- Use HTTPS for production REST and Socket.IO traffic.

## Health Check
`GET /health`

## Troubleshooting
### MongoDB connection error
Check `MONGO_URI`, network access and database credentials.

### Mobile app gets 401
Verify access/refresh token configuration and device time.

### Socket notifications do not arrive
Verify `EXPO_PUBLIC_SOCKET_URL`, WebSocket connectivity, and that the access token is valid.

## Sample Seeder

Run the idempotent sample dataset with:

```bash
npm run seed:sample
```

Sample credentials:
- Admin: `admin@salon.com` / value of `DEFAULT_ADMIN_PASSWORD` (default: `Admin@Secure2026!`)
- User 1: `user1@salon.com` / `User@12345`
- User 2: `user2@salon.com` / `User@12345`
- User 3: `user3@salon.com` / `User@12345`

The seed creates sample languages/translations, users, admin, services, offers, banners, availability, bookings, reviews, notifications, and refresh-token test records. Change the sample passwords before production use.
