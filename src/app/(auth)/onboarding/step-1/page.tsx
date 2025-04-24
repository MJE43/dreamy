// Step 1: Account Basics
'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step1Page() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [existingName, setExistingName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name;
      if (name) {
        setExistingName(name);
      } else {
        // Pre-fill with email part if no name exists
        setDisplayName(user.email?.split('@')[0] || '');
      }
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;

    setError(null);
    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });
    setIsLoading(false);

    if (updateError) {
      console.error('Error updating user name:', updateError);
      setError('Failed to save name. Please try again.');
    } else {
      router.push('./step-2'); // Use relative path
    }
  };

  const handleNext = () => {
    router.push('./step-2'); // Use relative path
  };

  if (isLoading && !user) {
    // Still waiting for user data
    return <div>Loading user information...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 1: Welcome!</h2>
      {existingName ? (
        <div className="space-y-4">
          <p>Welcome back, <span className="font-medium">{existingName}</span>!</p>
          <p>Let&apos;s get started with your Spiral Coach setup.</p>
          <Button onClick={handleNext}>Next: Worldview Quiz</Button>
        </div>
      ) : (
        <form onSubmit={handleSaveName} className="space-y-4">
          <p>Let&apos;s get your profile set up. What should we call you?</p>
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="e.g., Alex Smith"
              className="mt-1"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={isLoading || !displayName.trim()}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </form>
      )}
    </div>
  );
} 
 