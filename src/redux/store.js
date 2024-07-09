import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from './cameraSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
  },
});