import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation } from '@tanstack/react-query'

const Index = () => {
  const [model, setModel] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { toast } = useToast()

  useEffect(() => {
    tf.ready().then(() => {
      cocossd.load().then(loadedModel => {
        setModel(loadedModel);
      });
    });
  }, []);

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const detectObjects = async () => {
    if (model && videoRef.current && canvasRef.current) {
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
  };

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const interval = setInterval(() => {
        detectObjects();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [model]);

  const { data: detections, isLoading, isError } = useQuery({
    queryKey: ['detections'],
    queryFn: async () => {
      const response = await fetch('https://backengine-of3g.fly.dev/api/detections');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (newDetection) => {
      const response = await fetch('https://backengine-of3g.fly.dev/api/detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDetection),
      });
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
              <Button onClick={startVideo} className="mt-4">Start Video</Button>
              <Button onClick={saveDetection} className="mt-4 ml-2">Save Detection</Button>
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
              {isError && <p>Error fetching detections</p>}
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