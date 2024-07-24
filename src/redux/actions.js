// Action Types
export const SET_DETECTED_OBJECTS = 'SET_DETECTED_OBJECTS';
export const SET_VIDEO_STATUS = 'SET_VIDEO_STATUS';
export const SET_DETECTION_STATUS = 'SET_DETECTION_STATUS';
export const SET_TENSORFLOW_SETTINGS = 'SET_TENSORFLOW_SETTINGS';
export const RESET_COUNTS = 'RESET_COUNTS';
export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';

// Action Creators
export const setDetectedObjects = (objects) => ({
  type: SET_DETECTED_OBJECTS,
  payload: objects,
});

export const setVideoStatus = (isStarted) => ({
  type: SET_VIDEO_STATUS,
  payload: isStarted,
});

export const setDetectionStatus = (isRunning) => ({
  type: SET_DETECTION_STATUS,
  payload: isRunning,
});

export const setTensorFlowSettings = (settings) => ({
  type: SET_TENSORFLOW_SETTINGS,
  payload: settings,
});

export const resetCounts = () => ({
  type: RESET_COUNTS,
});

export const addToHistory = (counts) => ({
  type: ADD_TO_HISTORY,
  payload: counts,
});