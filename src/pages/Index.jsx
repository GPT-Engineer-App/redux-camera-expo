import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraIcon, CameraOff, Play, Square, RefreshCw } from 'lucide-react';

const Index = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isDetectionRunning, setIsDetectionRunning] = useState(false);
  const [objectCounts, setObjectCounts] = useState({});

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load the model:', error);
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoStarted(true);
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsVideoStarted(false);
      setIsDetectionRunning(false);
    }
  };

  const detectObjects = async () => {
    if (!model || !videoRef.current) return;

    setIsDetectionRunning(true);
    const detectFrame = async () => {
      if (videoRef.current && canvasRef.current && isDetectionRunning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const predictions = await model.detect(video);
        const newCounts = {};

        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          
          context.strokeStyle = '#00FFFF';
          context.lineWidth = 2;
          context.strokeRect(x, y, width, height);
          
          context.fillStyle = '#00FFFF';
          context.font = '16px sans-serif';
          context.fillText(prediction.class, x, y > 10 ? y - 5 : 10);

          newCounts[prediction.class] = (newCounts[prediction.class] || 0) + 1;
        });

        setObjectCounts(newCounts);
        requestAnimationFrame(detectFrame);
      }
    };

    detectFrame();
  };

  const stopDetection = () => {
    setIsDetectionRunning(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Object Detection App</h1>
      <Card>
        <CardHeader>
          <CardTitle>Camera Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-auto"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            <Button onClick={startVideo} disabled={isVideoStarted || isLoading}>
              <CameraIcon className="mr-2 h-4 w-4" /> Start Camera
            </Button>
            <Button onClick={stopVideo} disabled={!isVideoStarted || isLoading}>
              <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
            </Button>
            <Button onClick={detectObjects} disabled={!isVideoStarted || isDetectionRunning || isLoading}>
              <Play className="mr-2 h-4 w-4" /> Start Detection
            </Button>
            <Button onClick={stopDetection} disabled={!isDetectionRunning || isLoading}>
              <Square className="mr-2 h-4 w-4" /> Stop Detection
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Detected Objects</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {Object.entries(objectCounts).map(([object, count]) => (
              <li key={object} className="mb-2">
                {object}: {count}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center">
            <RefreshCw className="animate-spin mr-2" />
            Loading model...
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;