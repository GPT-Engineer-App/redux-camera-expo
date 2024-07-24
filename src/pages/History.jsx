import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";

const History = () => {
  const { toast } = useToast();

  const fetchDetectionHistory = async () => {
    const response = await fetch('https://backengine-of3g.fly.dev/api/collections/detectionData/records', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch detection history');
    }
    return response.json();
  };

  const { data: detectionHistory, isLoading, isError } = useQuery({
    queryKey: ['detectionHistory'],
    queryFn: fetchDetectionHistory,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    toast({
      title: "Error",
      description: "Failed to fetch detection history",
      variant: "destructive",
    });
    return <div>Error fetching detection history</div>;
  }

  const processedData = detectionHistory.items.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    ...item.counts,
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
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(processedData[0] || {}).filter(key => key !== 'date').map((key, index) => (
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