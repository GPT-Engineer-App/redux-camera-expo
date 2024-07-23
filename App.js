import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  return (
    <Provider store={store}>
      <MainScreen />
    </Provider>
  );
}