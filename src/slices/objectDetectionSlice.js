import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  detectedObjects: [],
  objectCount: 0,
};

export const objectDetectionSlice = createSlice({
  name: 'objectDetection',
  initialState,
  reducers: {
    updateDetectedObjects: (state, action) => {
      state.detectedObjects = action.payload;
      state.objectCount = action.payload.length;
    },
  },
});

export const { updateDetectedObjects } = objectDetectionSlice.actions;

export default objectDetectionSlice.reducer;