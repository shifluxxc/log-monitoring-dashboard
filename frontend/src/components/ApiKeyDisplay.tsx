import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';

export const ApiKeyDisplay: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const [showFullKey, setShowFullKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshApiKey = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:7000/auth/refresh-api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user's API key in the context
        // This would require updating the AuthContext to handle API key refresh
        toast({
          title: 'API Key Refreshed',
          description: 'Your API key has been updated successfully.',
        });
      } else {
        throw new Error('Failed to refresh API key');
      }
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh API key.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [state.token, toast]);

  if (!state.user?.api_key) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">API Key</CardTitle>
          <CardDescription>
            No API key available. Please log in to view your API key.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">API Key</CardTitle>
            <CardDescription>
              Use this key to authenticate your API requests
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-success border-success/30">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Your API Key:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullKey(!showFullKey)}
                className="h-8 w-8 p-0"
              >
                {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyApiKey}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <code className="block w-full p-3 bg-muted rounded text-sm font-mono break-all">
              {showFullKey 
                ? state.user.api_key 
                : `${state.user.api_key.slice(0, 16)}...${state.user.api_key.slice(-8)}`
              }
            </code>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Usage Example:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshApiKey}
              disabled={isRefreshing}
              className="h-8"
            >
              {isRefreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Refresh Key
            </Button>
          </div>
          <div className="p-3 bg-muted rounded text-sm font-mono">
            <div className="text-muted-foreground"># Using curl:</div>
            <div className="mt-1">
              curl -H "x-api-key: {state.user.api_key.slice(0, 8)}..." \
            </div>
            <div className="ml-4">
              http://localhost:7000/api/endpoint
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Security Note:</strong> Keep your API key secure and never share it publicly. 
            You can refresh your key anytime if you suspect it has been compromised.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 