import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { ChartData } from '@/types';
import { Loader2 } from 'lucide-react';

export const ErrorsPerMinuteChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getErrorsPerMinute();
        setData(response as ChartData[]);
      } catch (err) {
        setError('Failed to load errors per minute data');
        
        // Generate mock data for demo (last 60 minutes)
        const mockData: ChartData[] = [];
        const now = new Date();
        
        for (let i = 60; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60 * 1000);
          mockData.push({
            timestamp: timestamp.toISOString(),
            count: Math.floor(Math.random() * 10), // Random errors 0-9 per minute
          });
        }
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTooltipLabel = (value: string) => {
    return new Date(value).toLocaleTimeString();
  };

  const formatXAxisLabel = (value: string) => {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Errors Per Minute</CardTitle>
          <CardDescription>Last 60 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalErrors = data.reduce((sum, item) => sum + item.count, 0);
  const avgErrorsPerMinute = data.length > 0 ? (totalErrors / data.length).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Errors Per Minute</CardTitle>
        <CardDescription>
          {error ? 'Demo data (API unavailable)' : 'Last 60 minutes'} • 
          Avg: {avgErrorsPerMinute} errors/min
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxisLabel}
                stroke="hsl(var(--muted-foreground))"
                interval="preserveStartEnd"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--error))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};