import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { ChartData } from '@/types';
import { Loader2 } from 'lucide-react';

interface LogsOverTimeChartProps {
  startDate: string;
  endDate: string;
}

export const LogsOverTimeChart: React.FC<LogsOverTimeChartProps> = ({ startDate, endDate }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getLogsOverTime(startDate, endDate);
        setData(response as ChartData[]);
      } catch (err) {
        setError('Failed to load logs over time data');
        
        // Generate mock data for demo
        const mockData: ChartData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const hoursToGenerate = Math.min(24, diffHours);
        
        for (let i = 0; i < hoursToGenerate; i++) {
          const timestamp = new Date(start.getTime() + i * 60 * 60 * 1000);
          mockData.push({
            timestamp: timestamp.toISOString(),
            count: Math.floor(Math.random() * 100) + 20,
          });
        }
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const formatTooltipLabel = (value: string) => {
    return new Date(value).toLocaleString();
  };

  const formatXAxisLabel = (value: string) => {
    return new Date(value).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs Over Time</CardTitle>
          <CardDescription>Log volume trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs Over Time</CardTitle>
        <CardDescription>
          {error ? 'Demo data (API unavailable)' : 'Log volume trends'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxisLabel}
                stroke="hsl(var(--muted-foreground))"
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
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};