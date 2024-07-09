import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  photos: [],
};

export const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    addPhoto: (state, action) => {
      state.photos.push(action.payload);
    },
  },
});

export const { addPhoto } = cameraSlice.actions;

export default cameraSlice.reducer;