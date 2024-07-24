import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  detectedObjects: [],
  isVideoStarted: false,
  isDetectionRunning: false,
};

const objectDetectionSlice = createSlice({
  name: 'objectDetection',
  initialState,
  reducers: {
    setDetectedObjects: (state, action) => {
      state.detectedObjects = action.payload;
    },
    setVideoStatus: (state, action) => {
      state.isVideoStarted = action.payload;
    },
    setDetectionStatus: (state, action) => {
      state.isDetectionRunning = action.payload;
    },
  },
});

export const { setDetectedObjects, setVideoStatus, setDetectionStatus } = objectDetectionSlice.actions;

export default objectDetectionSlice.reducer;