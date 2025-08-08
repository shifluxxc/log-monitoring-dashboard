import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Log } from '@/types';
import { ExternalLink } from 'lucide-react';

interface LogRowProps {
  log: Log;
  style?: React.CSSProperties;
}

const LogRowComponent: React.FC<LogRowProps> = ({ log, style }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/logs/${log.id}`);
  }, [navigate, log.id]);

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
        month: 'short',
        day: '2-digit',
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
    <div style={style} className="px-4 py-1">
      <Card className="bg-dashboard-log-row hover:bg-dashboard-log-hover transition-colors border-border/50 cursor-pointer">
        <div
          className="flex items-center space-x-3 p-3"
          onClick={handleClick}
        >
          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />

          <div className="text-xs text-muted-foreground font-mono min-w-0 flex-shrink-0">
            {formatTimestamp(log.timestamp)}
          </div>

          <Badge
            variant="outline"
            className={`text-xs font-medium ${getLevelVariant(log.level)}`}
          >
            {log.level}
          </Badge>

          <div className="flex-1 text-sm text-foreground truncate">
            {log.message}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const LogRow = memo(LogRowComponent);