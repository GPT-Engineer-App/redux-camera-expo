import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Camera, Play, Square } from 'lucide-react';

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const stopVideo = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setIsDetecting(false);
  };

  const detect = async () => {
    if (!model || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detectFrame = async () => {
      if (isDetecting) {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const predictions = await model.detect(video);

        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = '#00FFFF';
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 5 : 10
          );
        });

        requestAnimationFrame(detectFrame);
      }
    };

    setIsDetecting(true);
    detectFrame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Object Detection</h1>
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Camera className="mr-2" />
          Start Camera
        </button>
        <button
          onClick={stopVideo}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Square className="mr-2" />
          Stop Camera
        </button>
        <button
          onClick={detect}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Play className="mr-2" />
          Detect Objects
        </button>
      </div>
    </div>
  );
};

export default ObjectDetection;