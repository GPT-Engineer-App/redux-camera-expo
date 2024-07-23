import { configureStore } from '@reduxjs/toolkit';
import objectDetectionReducer from './slices/objectDetectionSlice';

export const store = configureStore({
  reducer: {
    objectDetection: objectDetectionReducer,
  },
});