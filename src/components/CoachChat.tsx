'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, RefreshCw, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  } = useChat({ 
      api: '/api/coach',
      initialMessages: [
          {
              id: 'initial-greeting',
              role: 'assistant',
              content: 'How can I support your journey today?'
          }
      ]
    });

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
    <div className="flex flex-col h-[400px]">
      <ScrollArea 
        className="flex-grow p-4 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent"
        ref={scrollAreaRef}
      >
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`prose dark:prose-invert prose-sm max-w-none rounded-lg px-6 py-4 leading-relaxed transition-transform duration-200 ease-in-out hover:scale-[1.02] ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600 text-primary-foreground'
                        : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    <div className="flex justify-end space-x-2 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                       <button className="p-1 rounded hover:bg-background/50"><ThumbsUp size={14} /></button>
                       <button className="p-1 rounded hover:bg-background/50"><ThumbsDown size={14} /></button>
                    </div>
                  </>
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
      <form onSubmit={handleSubmit} className="p-2 border-t flex items-start gap-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-grow resize-none text-sm"
          rows={2}
        />
        {isLoading ? (
           <Button type="button" onClick={stop} variant="outline" size="icon" aria-label="Stop generation">
             <Loader2 className="h-4 w-4" />
           </Button>
         ) : (
           <Button 
             type="submit" 
             size="icon" 
             disabled={!input.trim()} 
             aria-label="Send message"
             className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
           >
             <SendHorizonal className="h-4 w-4" />
           </Button>
         )}
      </form>
    </div>
  );
};

export default CoachChat; 
