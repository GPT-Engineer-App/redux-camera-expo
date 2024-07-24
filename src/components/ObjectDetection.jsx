import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { setDetectedObjects, setVideoStatus, setDetectionStatus } from '../slices/objectDetectionSlice';
import { Camera, CameraOff, Play, Square } from 'lucide-react';

const ObjectDetection = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { isVideoStarted, isDetectionRunning, detectedObjects } = useSelector(state => state.objectDetection);

  useEffect(() => {
    tf.ready().then(() => {
      console.log('TensorFlow.js is ready');
    });
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      dispatch(setVideoStatus(true));
    }
  };

  const stopVideo = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    dispatch(setVideoStatus(false));
    dispatch(setDetectionStatus(false));
  };

  const detectObjects = async () => {
    const model = await cocossd.load();
    dispatch(setDetectionStatus(true));

    const detectFrame = async () => {
      if (videoRef.current && canvasRef.current && isDetectionRunning) {
        const predictions = await model.detect(videoRef.current);
        dispatch(setDetectedObjects(predictions));

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px sans-serif';
        ctx.textBaseline = 'top';

        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = '#00FFFF';
          ctx.fillText(prediction.class, x, y);
        });

        requestAnimationFrame(detectFrame);
      }
    };

    detectFrame();
  };

  const stopDetection = () => {
    dispatch(setDetectionStatus(false));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Object Detection</h1>
      <div className="flex flex-col items-center">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-2xl"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
        <div className="mt-4 space-x-2">
          <button
            onClick={startVideo}
            disabled={isVideoStarted}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            <Camera className="inline-block mr-2" />
            Start Camera
          </button>
          <button
            onClick={stopVideo}
            disabled={!isVideoStarted}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            <CameraOff className="inline-block mr-2" />
            Stop Camera
          </button>
          <button
            onClick={detectObjects}
            disabled={!isVideoStarted || isDetectionRunning}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            <Play className="inline-block mr-2" />
            Start Detection
          </button>
          <button
            onClick={stopDetection}
            disabled={!isDetectionRunning}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            <Square className="inline-block mr-2" />
            Stop Detection
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Detected Objects:</h2>
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
};

export default ObjectDetection;