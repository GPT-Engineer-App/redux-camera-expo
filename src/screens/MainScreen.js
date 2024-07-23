import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectedObjects } from '../slices/objectDetectionSlice';

export default function MainScreen() {
  const dispatch = useDispatch();
  const detectedObjects = useSelector((state) => state.objectDetection.detectedObjects);

  useEffect(() => {
    // Simulating object detection with a timer
    const timer = setInterval(() => {
      const simulatedObjects = [
        { id: 1, class: 'Person', score: 0.95 },
        { id: 2, class: 'Car', score: 0.88 },
      ];
      dispatch(setDetectedObjects(simulatedObjects));
    }, 2000);

    return () => clearInterval(timer);
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Object Detection App</Text>
      <Text style={styles.subtitle}>Detected Objects: {detectedObjects.length}</Text>
      {detectedObjects.map((obj) => (
        <Text key={obj.id} style={styles.objectItem}>
          {obj.class} - Confidence: {(obj.score * 100).toFixed(2)}%
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  objectItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});