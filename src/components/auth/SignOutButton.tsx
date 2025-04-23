"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function SignOutButton({ 
  variant = 'outline', 
  size = 'default',
  className = ''
}: SignOutButtonProps) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Error signing out:', error);
    } else {
        router.push('/login');
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleSignOut}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
} 
