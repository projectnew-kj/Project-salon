# Salon User App

React Native Expo customer application for browsing salon services and booking appointments.

## Main Features
- Customer registration/login
- Guest browsing
- Home carousel
- Haircut/service catalogue
- Offers/packages
- Appointment booking
- Availability-aware slot picker
- Booking history and details
- Reviews and ratings
- Profile and theme settings
- Runtime multilingual support
- Real-time notifications

## Tech Stack
- Expo SDK 51
- React Native 0.74
- Expo Router
- Zustand
- Axios
- Socket.IO client
- AsyncStorage
- SecureStore
- Lucide React Native

## Structure
```text
app/
├── (auth)/
├── (tabs)/
│   ├── bookings/
│   ├── explore/
│   └── profile/
└── booking/
src/
├── api/
├── components/
├── constants/
├── hooks/
├── store/
└── types/
```

## Multilingual Architecture
The app does **not** contain `src/i18n/*.json` translation files.

Translations are loaded from the backend:
```text
MongoDB Language Collection
        ↓
GET /api/v1/languages/:code/translations
        ↓
Zustand language store
        ↓
AsyncStorage cache
        ↓
UI via useTranslation()
```

Supported seeded locales:
- English (`en`)
- Tamil (`ta`)
- Hindi (`hi`)
- Malayalam (`ml`)
- Kannada (`kn`)

## Translation Usage
```tsx
const { t } = useTranslation();

<Text>{t('home.book_now')}</Text>
```

Always use a translation key for user-facing static text, including:
- navigation labels
- headings
- buttons
- placeholders
- validation messages
- alerts
- empty states
- booking statuses

## Language Selection
The language screen reads active languages from the backend, so adding a new active language in the Admin app makes it available to users without creating a local JSON file.

## Offline Behavior
The last successfully fetched translation bundle is cached in AsyncStorage. When the API is unavailable, the app continues with cached translations when available.

## Environment
Set:
```env
EXPO_PUBLIC_API_URL=https://your-api.example.com/api/v1
EXPO_PUBLIC_SOCKET_URL=https://your-api.example.com
```

## Development
```bash
npm ci
npm run start
```

Checks:
```bash
npm run typecheck
npm run doctor
```

## Production Builds
```bash
npm run build:android
npm run build:ios
npm run build:all
```

## Common Issues
### Translation shows the key
Check that the key exists in the selected language document and that the backend response contains it.

### New language is not visible
Ensure the language is active in Admin → Language Manager, then reopen the language screen.

### API works on desktop but not device
Use a reachable LAN/HTTPS API URL rather than `localhost` when testing on a physical device.
