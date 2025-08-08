import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Activity, Zap } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex space-x-2">
      <Link to="/">
        <Button 
          variant={location.pathname === '/' ? 'default' : 'ghost'}
          size="sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link to="/metrics">
        <Button 
          variant={location.pathname === '/metrics' ? 'default' : 'ghost'}
          size="sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Metrics
        </Button>
      </Link>
      <Link to="/traces">
        <Button 
          variant={location.pathname.startsWith('/traces') ? 'default' : 'ghost'}
          size="sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          Traces
        </Button>
      </Link>
    </div>
  );
};