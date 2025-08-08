import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLog } from '@/context/LogContext';

export const LogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLog();

  const log = state.logs.find(l => l.id === id);

  if (!log) {
    return (
      <div className="min-h-screen bg-dashboard-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Log Not Found</h2>
              <p className="text-muted-foreground">The requested log entry could not be found.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-info/20 text-info border-info/30';
      case 'WARN':
        return 'bg-warn/20 text-warn border-warn/30';
      case 'ERROR':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Log Details</h1>
              <Badge
                variant="outline"
                className={`text-sm font-medium ${getLevelVariant(log.level)}`}
              >
                {log.level}
              </Badge>
            </div>

            {/* Timestamp */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Timestamp</h3>
              <p className="font-mono text-sm">{formatTimestamp(log.timestamp)}</p>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Message</h3>
              <div className="bg-muted/50 p-4 rounded border">
                <p className="text-sm leading-relaxed">{log.message}</p>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
              <div className="bg-muted/50 p-4 rounded border overflow-x-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>

            {/* Log ID */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Log ID</h3>
              <p className="font-mono text-xs text-muted-foreground">{log.id}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};