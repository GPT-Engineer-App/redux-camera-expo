import { configureStore } from '@reduxjs/toolkit';
import objectDetectionReducer from './slices/objectDetectionSlice';

const store = configureStore({
  reducer: {
    objectDetection: objectDetectionReducer,
  },
});

export default store;