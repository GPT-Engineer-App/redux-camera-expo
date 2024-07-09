# React Native Redux Camera App

This is a simple React Native application that demonstrates the use of Redux for state management and integrates the Expo Camera module.

## Setup and Running the Application

1. Make sure you have Node.js and npm installed on your machine.
2. Install Expo CLI globally by running: `npm install -g expo-cli`
3. Clone this repository to your local machine.
4. Navigate to the project directory in your terminal.
5. Run `npm install` to install all the dependencies.
6. To start the application, run: `npm start`
7. Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal, or run on an iOS/Android simulator.

## Features

- Home screen displaying the number of photos taken
- Camera screen for taking photos
- Redux integration for state management
- Navigation between Home and Camera screens

## Extending the Application

To add more features or extend the Redux store:

1. Create new reducers in the `src/redux` directory.
2. Add the new reducers to the `store.js` file.
3. Create new action creators as needed.
4. Use `useSelector` and `useDispatch` hooks in your components to interact with the Redux store.

## Testing

To test the application:

1. Run the app on both iOS and Android simulators/emulators.
2. Navigate between the Home and Camera screens.
3. Take photos using the Camera screen and verify that the photo count updates on the Home screen.

For any issues or questions, please open an issue in the GitHub repository.