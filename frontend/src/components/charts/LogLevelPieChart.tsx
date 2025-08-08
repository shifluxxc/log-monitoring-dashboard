import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { PieChartData } from '@/types';
import { Loader2 } from 'lucide-react';

interface LogLevelPieChartProps {
  startDate: string;
  endDate: string;
}

const LEVEL_COLORS = {
  INFO: 'hsl(var(--info))',
  WARN: 'hsl(var(--warn))',
  ERROR: 'hsl(var(--error))',
};

export const LogLevelPieChart: React.FC<LogLevelPieChartProps> = ({ startDate, endDate }) => {
  const [data, setData] = useState<PieChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getLogLevelDistribution(startDate, endDate);
        setData(response as PieChartData[]);
      } catch (err) {
        setError('Failed to load log level distribution');
        
        // Generate mock data for demo
        const mockData: PieChartData[] = [
          { name: 'INFO', value: 1250, color: LEVEL_COLORS.INFO },
          { name: 'WARN', value: 320, color: LEVEL_COLORS.WARN },
          { name: 'ERROR', value: 85, color: LEVEL_COLORS.ERROR },
        ];
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-md p-2 shadow-md">
          <p className="text-sm">
            <span className="font-medium">{data.name}:</span> {data.value} logs
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Level Distribution</CardTitle>
          <CardDescription>Breakdown by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Level Distribution</CardTitle>
        <CardDescription>
          {error ? 'Demo data (API unavailable)' : 'Breakdown by severity'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center space-x-4 text-sm">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.name}: {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};