import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { setTensorFlowSettings } from '../redux/actions';

const TensorFlowSettings = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const currentSettings = useSelector((state) => state.objectDetection.tensorFlowSettings);

  const [model, setModel] = useState(currentSettings.model || 'cocossd');
  const [confidenceThreshold, setConfidenceThreshold] = useState(currentSettings.confidenceThreshold || 0.5);
  const [maxDetections, setMaxDetections] = useState(currentSettings.maxDetections || 20);
  const [enableWebcam, setEnableWebcam] = useState(currentSettings.enableWebcam || false);

  const handleSaveSettings = () => {
    const newSettings = {
      model,
      confidenceThreshold,
      maxDetections,
      enableWebcam,
    };
    dispatch(setTensorFlowSettings(newSettings));
    localStorage.setItem('tensorFlowSettings', JSON.stringify(newSettings));
    toast({
      title: "Settings Saved",
      description: "Your TensorFlow settings have been updated.",
    });
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('tensorFlowSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setModel(parsedSettings.model);
      setConfidenceThreshold(parsedSettings.confidenceThreshold);
      setMaxDetections(parsedSettings.maxDetections);
      setEnableWebcam(parsedSettings.enableWebcam);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">TensorFlow Settings</h1>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cocossd">COCO-SSD</SelectItem>
              <SelectItem value="mobilenet">MobileNet</SelectItem>
              <SelectItem value="yolo">YOLO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="confidenceThreshold">Confidence Threshold: {confidenceThreshold.toFixed(2)}</Label>
          <Slider
            id="confidenceThreshold"
            min={0}
            max={1}
            step={0.01}
            value={[confidenceThreshold]}
            onValueChange={([value]) => setConfidenceThreshold(value)}
          />
        </div>

        <div>
          <Label htmlFor="maxDetections">Max Detections</Label>
          <Input
            id="maxDetections"
            type="number"
            value={maxDetections}
            onChange={(e) => setMaxDetections(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enableWebcam"
            checked={enableWebcam}
            onCheckedChange={setEnableWebcam}
          />
          <Label htmlFor="enableWebcam">Enable Webcam</Label>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default TensorFlowSettings;