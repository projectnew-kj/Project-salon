# Salon Admin App

React Native Expo Router application used to manage the salon platform.

## Main Modules
- Dashboard
- Bookings
- Services / Haircuts
- Offers / Packages
- Carousel Banners
- Weekly Schedule
- Customer Accounts
- Language Manager
- Theme settings

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
│   ├── banners/
│   ├── schedule/
│   ├── services/
│   └── settings/
src/
├── api/
├── components/
├── constants/
├── hooks/
└── store/
```

## Language Manager
Go to **Settings → Language Manager**.

The manager supports:
- Create language
- Edit language metadata
- Delete non-default languages
- Add translation keys
- Edit translation values
- Delete translation keys

No JSON file needs to be created or edited.

## Translation Usage
Use the shared hook:
```tsx
const { t } = useTranslation();
<Text>{t('home.book_now')}</Text>
```

Shared `Button`, `Input`, and `StatusBadge` components also resolve translation keys/labels through the language store.

## Runtime Flow
1. Admin app authenticates.
2. Current language is loaded from AsyncStorage.
3. Translations are fetched from the backend.
4. Translations are cached locally.
5. Language Manager changes are reflected after refresh/reload.

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

EAS credentials and the Expo/EAS project configuration are required for real store binaries.
