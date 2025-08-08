import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogsOverTimeChart } from '@/components/charts/LogsOverTimeChart';
import { LogLevelPieChart } from '@/components/charts/LogLevelPieChart';
import { ErrorsPerMinuteChart } from '@/components/charts/ErrorsPerMinuteChart';
import { ArrowLeft, Calendar } from 'lucide-react';

export const Metrics: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="border-b border-border bg-dashboard-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Analytics & Metrics</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Date Range Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Date Range</span>
            </CardTitle>
            <CardDescription>
              Select a date range to view analytics data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickRange(1)}
                >
                  Last 24h
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickRange(7)}
                >
                  Last 7d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickRange(30)}
                >
                  Last 30d
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <LogsOverTimeChart startDate={startDate} endDate={endDate} />
          </div>
          
          <LogLevelPieChart startDate={startDate} endDate={endDate} />
          
          <ErrorsPerMinuteChart />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,655</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-warn">320</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-error">85</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};