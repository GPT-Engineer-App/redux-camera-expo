# React Native Redux Camera App

This project is a React Native application that integrates Redux for state management and uses the Expo Camera module.

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Start the Expo development server:
   ```
   npm start
   ```

3. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator/simulator.

## Features

- Redux state management
- Camera functionality using Expo Camera
- Navigation between Home and Camera screens

## Extending the Project

### Adding New Redux Slices

1. Create a new file in `src/store` for your slice (e.g., `userSlice.ts`).
2. Define your slice using `createSlice` from `@reduxjs/toolkit`.
3. Export the reducer and actions.
4. Import and add the reducer to the `store/index.ts` file.

### Adding New Screens

1. Create a new screen component in `src/screens`.
2. Add the screen to the navigation stack in `App.tsx`.

## Testing

- To test on iOS: `npm run ios`
- To test on Android: `npm run android`

Ensure you have the appropriate development environment set up for iOS and Android testing.