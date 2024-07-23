// Action Types
export const SET_DETECTED_OBJECTS = 'SET_DETECTED_OBJECTS';
export const SET_VIDEO_STATUS = 'SET_VIDEO_STATUS';
export const SET_DETECTION_STATUS = 'SET_DETECTION_STATUS';

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