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

## Available Scripts

- `npm start`: Start the Expo development server
- `npm run android`: Start the app on Android
- `npm run ios`: Start the app on iOS
- `npm run web`: Start the app in a web browser
- `npm run eject`: Eject from Expo
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run build:dev`: Start the development build
- `npm run build`: Build the app for production
- `npm run build:android`: Build the Android app
- `npm run build:ios`: Build the iOS app

## Features

- Redux state management
- Camera functionality using Expo Camera
- Navigation between Home and Camera screens

## Project Structure

- `src/screens/`: Contains the main screen components (HomeScreen and CameraScreen)
- `src/store/`: Contains Redux store configuration and slices
- `App.tsx`: Main application component with navigation setup

## Extending the Project

### Adding New Redux Slices

1. Create a new file in `src/store` for your slice (e.g., `userSlice.ts`).
2. Define your slice using `createSlice` from `@reduxjs/toolkit`.
3. Export the reducer and actions.
4. Import and add the reducer to the `store/index.ts` file.

### Adding New Screens

1. Create a new screen component in `src/screens`.
2. Add the screen to the navigation stack in `App.tsx`.
3. Update the `RootStackParamList` type in `App.tsx` if necessary.

## Testing

Run tests using:
```
npm test
```

## Linting

Run ESLint using:
```
npm run lint
```

## Building for Production

To build the app for production:
```
npm run build
```

For platform-specific builds:
```
npm run build:android
npm run build:ios
```

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are correctly installed.
2. Check that your Expo CLI is up to date.
3. Clear the Metro bundler cache: `expo start -c`
4. Ensure you have the necessary permissions for camera usage on your device or emulator.

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or find any bugs.