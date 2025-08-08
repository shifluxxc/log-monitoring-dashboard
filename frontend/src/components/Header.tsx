import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from './Navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, LogOut, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, dispatch } = useAuth();
  const { toast } = useToast();

  const handleCopyApiKey = useCallback(async () => {
    if (state.user?.api_key) {
      try {
        await navigator.clipboard.writeText(state.user.api_key);
        toast({
          title: 'API Key Copied',
          description: 'Your API key has been copied to clipboard.',
        });
      } catch (error) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy API key to clipboard.',
          variant: 'destructive',
        });
      }
    }
  }, [state.user?.api_key, toast]);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  }, [dispatch, toast]);

  return (
    <Card className="bg-dashboard-header border-border rounded-none border-l-0 border-r-0 border-t-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Log Monitor
            </h1>
          </div>
          <Badge variant="outline" className="text-success border-success/30">
            Live
          </Badge>
          <Navigation />
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">API Key:</span>
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {state.user?.api_key ? `${state.user.api_key.slice(0, 8)}...` : 'N/A'}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyApiKey}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {state.user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};