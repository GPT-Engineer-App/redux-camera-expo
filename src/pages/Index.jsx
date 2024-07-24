import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, CameraOff, RefreshCw, Play, Square, Mic } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setDetectedObjects, setVideoStatus, setDetectionStatus } from '../redux/actions';

const Index = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('environment');
  const [model, setModel] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef(null);
  const { toast } = useToast()
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const detectedObjects = useSelector(state => state.objectDetection.detectedObjects);
  const isVideoStarted = useSelector(state => state.objectDetection.isVideoStarted);
  const isDetectionRunning = useSelector(state => state.objectDetection.isDetectionRunning);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
        toast({
          title: "Error",
          description: "Failed to load object detection model. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };
    loadModel();
  }, [toast]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraType } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      dispatch(setVideoStatus(true));
      setHasPermission(true);
      toast({
        title: "Success",
        description: "Video started successfully.",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Permission Denied",
          description: "Camera access was denied. Please grant permission in your browser settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while accessing the camera. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    dispatch(setVideoStatus(false));
    dispatch(setDetectionStatus(false));
    toast({
      title: "Video Stopped",
      description: "Video stream has been stopped.",
    });
  };

  const toggleCamera = () => {
    setCameraType(prevType => prevType === 'environment' ? 'user' : 'environment');
    if (isVideoStarted) {
      stopVideo();
      startVideo();
    }
  };

  const detectObjects = async () => {
    if (model && videoRef.current && isDetectionRunning) {
      try {
        const predictions = await model.detect(videoRef.current);
        const objectCounts = {};
        predictions.forEach(prediction => {
          const label = prediction.class;
          objectCounts[label] = (objectCounts[label] || 0) + 1;
        });
        dispatch(setDetectedObjects(objectCounts));
      } catch (error) {
        console.error('Error detecting objects:', error);
        toast({
          title: "Error",
          description: "An error occurred while detecting objects. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    let interval;
    if (videoRef.current && model && isVideoStarted && isDetectionRunning) {
      interval = setInterval(() => {
        detectObjects();
      }, 1000); // Detect objects every second
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [model, isVideoStarted, isDetectionRunning]);

  const { data: detections, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['detections'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch('https://backengine-of3g.fly.dev/api/detections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return refetch();
        } else {
          throw new Error('Failed to refresh token');
        }
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    retry: false,
    onError: (error) => {
      toast({
        title: "Error fetching detections",
        description: error.message,
        variant: "destructive",
      });
      if (error.message === 'Failed to refresh token') {
        logout();
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (newDetection) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch('https://backengine-of3g.fly.dev/api/detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDetection),
      });
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return mutation.mutate(newDetection);
        } else {
          throw new Error('Failed to refresh token');
        }
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Detection saved",
        description: "The detection has been successfully saved to the server.",
      });
      refetch(); // Refetch the detections after successful mutation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save detection: ${error.message}`,
        variant: "destructive",
      });
      if (error.message === 'Failed to refresh token') {
        logout();
      }
    },
  });

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      const response = await fetch('https://backengine-of3g.fly.dev/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const saveDetection = () => {
    Object.entries(detectedObjects).forEach(([objectType, count]) => {
      mutation.mutate({
        object_type: objectType,
        count: count,
        timestamp: new Date().toISOString(),
      });
    });
  };

  const startDetection = () => {
    if (isVideoStarted) {
      dispatch(setDetectionStatus(true));
      toast({
        title: "Detection Started",
        description: "Object detection process has been started.",
      });
    } else {
      toast({
        title: "Error",
        description: "Please start the video first.",
        variant: "destructive",
      });
    }
  };

  const stopDetection = () => {
    dispatch(setDetectionStatus(false));
    saveDetection(); // Automatically save detection when stopping
    toast({
      title: "Detection Stopped",
      description: "Object detection process has been stopped and results saved.",
    });
  };

  const startListening = () => {
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim().toLowerCase();
            if (transcript.includes('start video')) {
              startVideo();
            } else if (transcript.includes('stop video')) {
              stopVideo();
            } else if (transcript.includes('start detection')) {
              startDetection();
            } else if (transcript.includes('stop detection')) {
              stopDetection(); // This will now automatically save the detection
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognition.start();
    } else {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.stop();
    }
  };

  if (hasPermission === null) {
    return <div>Requesting camera permission...</div>;
  }
  if (hasPermission === false) {
    return <div>No access to camera. Please check your browser settings and grant permission.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Object Detection App</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Live Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: 480, display: isVideoStarted ? 'block' : 'none' }}
                  playsInline
                />
              </div>
              <div className="flex mt-4 space-x-2">
                <Button onClick={isVideoStarted ? stopVideo : startVideo}>
                  {isVideoStarted ? <CameraOff className="mr-2 h-4 w-4" /> : <CameraIcon className="mr-2 h-4 w-4" />}
                  {isVideoStarted ? "Stop Video" : "Start Video"}
                </Button>
                <Button onClick={toggleCamera} disabled={!isVideoStarted}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Toggle Camera
                </Button>
                <Button onClick={isDetectionRunning ? stopDetection : startDetection} disabled={!isVideoStarted}>
                  {isDetectionRunning ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isDetectionRunning ? "Stop Detection" : "Start Detection"}
                </Button>
                <Button onClick={isListening ? stopListening : startListening}>
                  <Mic className="mr-2 h-4 w-4" />
                  {isListening ? "Stop Listening" : "Start Listening"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Detected Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(detectedObjects).map(([object, count]) => (
                  <li key={object} className="mb-2">
                    {object}: {count}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Detections</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading...</p>}
              {isError && <p>Error fetching detections: {error.message}</p>}
              {detections && (
                <ul>
                  {detections.slice(0, 5).map((detection) => (
                    <li key={detection.id} className="mb-2">
                      {detection.object_type}: {detection.count} ({new Date(detection.timestamp).toLocaleString()})
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;