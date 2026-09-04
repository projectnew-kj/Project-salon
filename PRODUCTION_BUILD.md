# Production Build

This app uses Expo SDK 51 and EAS Build.

## 1. Install dependencies

```bash
npm ci
```

## 2. Configure production environment

Set these variables in your EAS production environment (or provide them through the build environment):

```text
EXPO_PUBLIC_API_URL=<production REST API URL>
EXPO_PUBLIC_SOCKET_URL=<production Socket.IO URL>
```

The app does not depend on Socket.IO for startup. If the live socket cannot connect, the admin UI remains usable and English is used as the safe language fallback.

Do not commit `.env` files containing credentials or private values.

## 3. Authenticate EAS

```bash
npx eas-cli login
```

## 4. Production Android AAB

```bash
npm run build:android
```

## 5. Production iOS

```bash
npm run build:ios
```

## 6. Both platforms

```bash
npm run build:all
```

## 7. Internal Android APK for QA

```bash
npm run build:android:preview
```

The production profile uses an App Bundle for Android and App Store distribution for iOS. EAS manages version incrementing for subsequent production builds.

Before submission, complete the required Android/iOS store credentials and app-store metadata in the EAS project.
