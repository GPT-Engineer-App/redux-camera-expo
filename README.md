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

- To test on iOS: `npm run ios`
- To test on Android: `npm run android`

Ensure you have the appropriate development environment set up for iOS and Android testing.

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are correctly installed.
2. Check that your Expo CLI is up to date.
3. Clear the Metro bundler cache: `expo start -c`
4. Ensure you have the necessary permissions for camera usage on your device or emulator.

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or find any bugs.