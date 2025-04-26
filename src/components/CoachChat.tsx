'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const CoachChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentAiMessageId = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }
  }, []);

  // Effect to connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource('/api/coach');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setError(null);
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        if (event.data.startsWith(': connected')) {
            console.log("SSE connection confirmed by server.");
            return;
        }

        const messageData = JSON.parse(event.data);
        
        if (messageData.error) {
            console.error("Received error via SSE:", messageData.error);
            setError(messageData.error);
            setIsLoading(false);
            currentAiMessageId.current = null;
            return;
        }

        if (messageData.text) {
            setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                
                if (lastMessage?.id === currentAiMessageId.current && lastMessage.sender === 'ai') {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[prevMessages.length - 1] = {
                        ...lastMessage,
                        text: lastMessage.text + messageData.text,
                    };
                    return updatedMessages;
                } else {
                    console.warn("Streaming chunk received, but no matching AI message found. Creating new bubble.");
                    const newAiMessage: Message = {
                        id: currentAiMessageId.current || Date.now().toString(),
                        text: messageData.text,
                        sender: 'ai',
                    };
                    return [...prevMessages, newAiMessage];
                }
            });
            setIsLoading(false);
            scrollToBottom();
        }

      } catch (e) {
        console.error('Failed to parse SSE message:', e, "Raw data:", event.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setError('Connection error with the coach. Please try refreshing.');
      setIsLoading(false);
      eventSource.close();
    };

    // Cleanup
    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
      currentAiMessageId.current = null;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();
    currentAiMessageId.current = aiMessageId;

    const userMessage: Message = { id: userMessageId, text: input, sender: 'user' };
    const aiPlaceholder: Message = { id: aiMessageId, text: '', sender: 'ai' }; 
    
    setMessages((prev) => [...prev, userMessage, aiPlaceholder]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setTimeout(scrollToBottom, 0); 

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

    } catch (err: unknown) {
      let errorMessage = 'Failed to communicate with coach.';
      if (err instanceof Error) {
          errorMessage = err.message;
      }
      console.error("Error sending message:", err);
      setError(errorMessage);
      setIsLoading(false);
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
      currentAiMessageId.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-md">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`rounded-lg px-3 py-2 max-w-[75%] text-sm whitespace-pre-wrap ${
                    msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                }`}
              >
                {msg.sender === 'ai' && msg.text === '' ? '...' : msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {error && <p className="text-red-500 text-xs px-4 py-1 border-t">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="p-2 border-t flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach..."
          disabled={isLoading}
          className="flex-grow"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CoachChat; 
