import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  detectedObjects: [],
};

export const objectDetectionSlice = createSlice({
  name: 'objectDetection',
  initialState,
  reducers: {
    setDetectedObjects: (state, action) => {
      state.detectedObjects = action.payload;
    },
  },
});

export const { setDetectedObjects } = objectDetectionSlice.actions;

export default objectDetectionSlice.reducer;