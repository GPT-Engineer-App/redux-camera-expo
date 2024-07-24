import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Camera as CameraIcon, CameraOff, RefreshCw, Play, Square, BarChart2, Settings, RotateCcw, Download } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setDetectedObjects, setVideoStatus, setDetectionStatus, resetCounts } from '../redux/actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Index = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [objectCounts, setObjectCounts] = useState({});

  const isVideoStarted = useSelector((state) => state.objectDetection.isVideoStarted);
  const isDetectionRunning = useSelector((state) => state.objectDetection.isDetectionRunning);
  const detectedObjects = useSelector((state) => state.objectDetection.detectedObjects);
  const tensorFlowSettings = useSelector((state) => state.objectDetection.tensorFlowSettings);

  useEffect(() => {
    loadModel();
  }, [tensorFlowSettings.model]);

  const loadModel = async () => {
    setIsLoading(true);
    try {
      let loadedModel;
      switch (tensorFlowSettings.model) {
        case 'cocossd':
          loadedModel = await cocossd.load();
          break;
        default:
          loadedModel = await cocossd.load();
      }
      setModel(loadedModel);
      setIsLoading(false);
      toast({
        title: "Model Loaded",
        description: `${tensorFlowSettings.model.toUpperCase()} model loaded successfully.`,
      });
    } catch (error) {
      console.error('Failed to load the model:', error);
      toast({
        title: "Error",
        description: "Failed to load the model. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        dispatch(setVideoStatus(true));
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access the camera. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      dispatch(setVideoStatus(false));
      dispatch(setDetectionStatus(false));
    }
  };

  const detectObjects = async () => {
    if (!model || !videoRef.current) return;

    dispatch(setDetectionStatus(true));
    const detectFrame = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const predictions = await model.detect(video);
        const filteredPredictions = predictions.filter(pred => pred.score >= tensorFlowSettings.confidenceThreshold)
                                               .slice(0, tensorFlowSettings.maxDetections);

        context.font = '16px sans-serif';
        context.textBaseline = 'top';

        const newCounts = { ...objectCounts };

        filteredPredictions.forEach((prediction, index) => {
          const [x, y, width, height] = prediction.bbox;
          const label = `${prediction.class} #${index + 1}`;
          
          context.strokeStyle = '#00FFFF';
          context.lineWidth = 2;
          context.strokeRect(x, y, width, height);
          context.fillStyle = '#00FFFF';
          context.fillText(
            label,
            x,
            y > 10 ? y - 10 : 10
          );

          newCounts[prediction.class] = (newCounts[prediction.class] || 0) + 1;
        });

        setObjectCounts(newCounts);
        dispatch(setDetectedObjects(newCounts));

        if (isDetectionRunning) {
          requestAnimationFrame(detectFrame);
        }
      }
    };

    detectFrame();
  };

  const stopDetection = () => {
    dispatch(setDetectionStatus(false));
  };

  const handleReset = () => {
    dispatch(resetCounts());
    setObjectCounts({});
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(objectCounts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'object_detection_counts.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Object Detection App</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
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
        </div>
        <div className="w-full md:w-1/3">
          <Card className="mb-4">
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
              <div className="flex justify-between mt-4">
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Counts
                </Button>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>TensorFlow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Configure detection parameters and model settings.</p>
              <Link to="/tensorflow-settings">
                <Button className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detection History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">View detailed charts and analytics of your detection data.</p>
              <Link to="/history">
                <Button className="w-full">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
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