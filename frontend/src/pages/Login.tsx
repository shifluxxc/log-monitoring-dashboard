import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Activity, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login(email, password);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });

      toast({
        title: 'Login Successful',
        description: 'Welcome back to Log Monitor!',
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, dispatch, navigate, from, toast]);

  // Demo login for development
  const handleDemoLogin = useCallback(() => {
    setEmail('demo@example.com');
    setPassword('demo123');
    
          // Simulate API response for demo
      setTimeout(() => {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: {
              id: 'demo-user-id',
              email: 'demo@example.com',
              api_key: 'key_demo_12345678901234567890',
              created_at: new Date().toISOString(),
            },
            token: 'demo_jwt_token_12345',
          },
        });

      toast({
        title: 'Demo Login Successful',
        description: 'Welcome to the Log Monitor demo!',
      });

      navigate(from, { replace: true });
    }, 500);
  }, [dispatch, navigate, from, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-bg p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Log Monitor</CardTitle>
          <CardDescription>
            Sign in to your account to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Try Demo
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};