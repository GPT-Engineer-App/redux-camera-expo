import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const History = () => {
  const detectionHistory = useSelector((state) => state.objectDetection.detectionHistory);

  const chartData = Object.entries(detectionHistory).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Detection History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Object Detection Counts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chartData[0] || {}).filter(key => key !== 'date').map((key, index) => (
                <Bar key={key} dataKey={key} fill={`hsl(${index * 30}, 70%, 50%)`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;