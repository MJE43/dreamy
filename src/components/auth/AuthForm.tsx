"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Github } from 'lucide-react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setAuthError(error.message);
    } else {
      router.refresh();
    }
    
    setIsLoading(false);
  };
  
  // Email/password sign up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setAuthError(error.message);
    } else {
      // Show success message for email confirmation
      setAuthError("Check your email for the confirmation link");
    }
    
    setIsLoading(false);
  };
  
  // OAuth sign in (GitHub)
  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    }
  };
  
  // OAuth sign in (Google)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Sign in or create an account</CardDescription>
      </CardHeader>
      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <form onSubmit={handleEmailSignIn}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Sign In with Email'}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleGitHubSignIn}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 488 512">
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
        
        <TabsContent value="signup">
          <form onSubmit={handleEmailSignUp}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Sign Up with Email'}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleGitHubSignIn}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 488 512">
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 
