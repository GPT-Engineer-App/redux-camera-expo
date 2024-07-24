import { combineReducers } from 'redux';
import {
  SET_DETECTED_OBJECTS,
  SET_VIDEO_STATUS,
  SET_DETECTION_STATUS,
  SET_TENSORFLOW_SETTINGS,
  RESET_COUNTS,
  ADD_TO_HISTORY,
} from './actions';

const initialState = {
  detectedObjects: {},
  isVideoStarted: false,
  isDetectionRunning: false,
  tensorFlowSettings: {
    model: 'cocossd',
    confidenceThreshold: 0.5,
    maxDetections: 20,
    enableWebcam: false,
  },
  detectionHistory: {},
};

const objectDetectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DETECTED_OBJECTS:
      return { ...state, detectedObjects: action.payload };
    case SET_VIDEO_STATUS:
      return { ...state, isVideoStarted: action.payload };
    case SET_DETECTION_STATUS:
      return { ...state, isDetectionRunning: action.payload };
    case SET_TENSORFLOW_SETTINGS:
      return { ...state, tensorFlowSettings: action.payload };
    case RESET_COUNTS:
      return { ...state, detectedObjects: {} };
    case ADD_TO_HISTORY:
      const date = new Date().toISOString().split('T')[0];
      return {
        ...state,
        detectionHistory: {
          ...state.detectionHistory,
          [date]: action.payload,
        },
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  objectDetection: objectDetectionReducer,
});

export default rootReducer;