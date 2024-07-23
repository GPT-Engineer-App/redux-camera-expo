import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import { Camera, CameraOff, RefreshCw, Play, Square, Mic } from 'lucide-react';

const Index = () => {
  const [model, setModel] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState({});
  const [facingMode, setFacingMode] = useState('environment');
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isDetectionRunning, setIsDetectionRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { toast } = useToast()
  const navigate = useNavigate();

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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsVideoStarted(true);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Error",
          description: "Failed to access camera. Please check your camera permissions.",
          variant: "destructive",
        });
      }
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

  const toggleCamera = async () => {
    stopVideo();
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    await startVideo();
  };

  const detectObjects = async () => {
    if (model && videoRef.current && canvasRef.current && isDetectionRunning) {
      try {
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          const predictions = await model.detect(videoRef.current);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.font = '16px sans-serif';
          ctx.textBaseline = 'top';

          const objectCounts = {};

          predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const label = prediction.class;

            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = '#00FFFF';
            const textWidth = ctx.measureText(label).width;
            const textHeight = parseInt('16px sans-serif', 10);
            ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

            ctx.fillStyle = '#000000';
            ctx.fillText(label, x, y);

            objectCounts[label] = (objectCounts[label] || 0) + 1;
          });

          setDetectedObjects(objectCounts);
        }
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
    if (videoRef.current && canvasRef.current && model && isVideoStarted && isDetectionRunning) {
      interval = setInterval(() => {
        detectObjects();
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [model, isVideoStarted, isDetectionRunning]);

  const { data: detections, isLoading, isError, error } = useQuery({
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
        navigate('/login');
        throw new Error('Unauthorized: Please log in again');
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error fetching detections",
        description: error.message,
        variant: "destructive",
      });
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
        navigate('/login');
        throw new Error('Unauthorized: Please log in again');
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
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save detection: ${error.message}`,
        variant: "destructive",
      })
    },
  });

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
      setIsDetectionRunning(true);
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
    setIsDetectionRunning(false);
    toast({
      title: "Detection Stopped",
      description: "Object detection process has been stopped.",
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
              stopDetection();
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
                  width="640"
                  height="480"
                  className="border border-gray-300"
                />
                <canvas
                  ref={canvasRef}
                  width="640"
                  height="480"
                  className="absolute top-0 left-0"
                />
              </div>
              <div className="flex mt-4 space-x-2">
                <Button onClick={isVideoStarted ? stopVideo : startVideo}>
                  {isVideoStarted ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
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
                <Button onClick={saveDetection} disabled={!isVideoStarted || !isDetectionRunning}>
                  Save Detection
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