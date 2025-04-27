'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CoachPreviewCard() {
  const router = useRouter();
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.trim()) {
      router.push(`/coach?draft=${encodeURIComponent(draft.trim())}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          How can I support your journey today?
        </p>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type to continue chatting..."
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <Button type="submit" disabled={!draft.trim()}>
            Go
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 
