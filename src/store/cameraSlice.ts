import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CameraState {
  lastPhoto: string | null;
}

const initialState: CameraState = {
  lastPhoto: null,
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setLastPhoto: (state, action: PayloadAction<string>) => {
      state.lastPhoto = action.payload;
    },
  },
});

export const { setLastPhoto } = cameraSlice.actions;
export default cameraSlice.reducer;