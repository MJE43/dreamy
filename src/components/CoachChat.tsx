'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, RefreshCw, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CoachChat: React.FC = () => {
  const {
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    error, 
    stop,
    reload
  } = useChat({ api: '/api/coach' });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-[400px] border rounded-md">
      <ScrollArea className="flex-grow p-4 min-h-0" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`prose dark:prose-invert prose-sm max-w-none rounded-lg px-3 py-2 ${
                    msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                ) : (
                   msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length-1]?.role === 'user' && (
             <div className="flex justify-start">
                 <div className="rounded-lg px-3 py-2 max-w-[75%] text-sm bg-muted flex items-center space-x-1">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   <span>Thinking...</span>
                 </div>
             </div>
          )}
        </div>
      </ScrollArea>
      {error && (
         <div className="text-red-500 text-xs px-4 py-1 border-t flex justify-between items-center">
           <span>Error: {error.message}</span>
           <Button onClick={() => reload()} variant="ghost" size="sm">
             <RefreshCw className="h-3 w-3 mr-1"/> Retry
           </Button>
         </div>
       )}
      <form onSubmit={handleSubmit} className="p-2 border-t flex items-center gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask your coach..."
          disabled={isLoading}
          className="flex-grow"
        />
        {isLoading ? (
           <Button type="button" onClick={stop} variant="outline" size="icon" aria-label="Stop generation">
             <Loader2 className="h-4 w-4 animate-spin" />
           </Button>
         ) : (
           <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message">
             <SendHorizonal className="h-4 w-4" />
           </Button>
         )}
      </form>
    </div>
  );
};

export default CoachChat; 
