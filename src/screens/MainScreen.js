import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectedObjects } from '../slices/objectDetectionSlice';
import * as tf from '@tensorflow/tfjs';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const TensorCamera = cameraWithTensors(Camera);

export default function MainScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [model, setModel] = useState(null);
  const dispatch = useDispatch();
  const detectedObjects = useSelector((state) => state.objectDetection.detectedObjects);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      await tf.ready();
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    })();
  }, []);

  const handleCameraStream = (images) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (!nextImageTensor || !model) return;
      
      const predictions = await model.detect(nextImageTensor);
      dispatch(setDetectedObjects(predictions));

      tf.dispose(nextImageTensor);
      requestAnimationFrame(loop);
    };
    loop();
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        cameraTextureHeight={1920}
        cameraTextureWidth={1080}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Object Detection App</Text>
        <Text style={styles.subtitle}>Detected Objects: {detectedObjects.length}</Text>
        {detectedObjects.map((obj, index) => (
          <Text key={index} style={styles.objectItem}>
            {obj.class} - Confidence: {(obj.score * 100).toFixed(2)}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  objectItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
});