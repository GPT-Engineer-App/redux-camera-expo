import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

function App() {
  const videoRef = useRef(null);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);

  useEffect(() => {
    tf.ready().then(() => {
      console.log('TensorFlow.js is ready');
    });
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsVideoStarted(true);
    }
  };

  const stopVideo = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    setIsVideoStarted(false);
  };

  const detectObjects = async () => {
    const model = await cocossd.load();
    const predictions = await model.detect(videoRef.current);
    setDetectedObjects(predictions);
  };

  return (
    <div>
      <h1>Object Detection</h1>
      <div>
        <video
          ref={videoRef}
          style={{ width: '100%', maxWidth: '600px' }}
          autoPlay
          playsInline
          muted
        />
      </div>
      <div>
        <button onClick={startVideo} disabled={isVideoStarted}>
          Start Camera
        </button>
        <button onClick={stopVideo} disabled={!isVideoStarted}>
          Stop Camera
        </button>
        <button onClick={detectObjects} disabled={!isVideoStarted}>
          Detect Objects
        </button>
      </div>
      <div>
        <h2>Detected Objects:</h2>
        <ul>
          {detectedObjects.map((obj, index) => (
            <li key={index}>
              {obj.class} - Confidence: {(obj.score * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;