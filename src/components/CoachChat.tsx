'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SendHorizontal,
  RefreshCw,
  PauseCircle,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper to format timestamps and dates
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};

// Wrap the main component logic in a new component to use Suspense
const CoachChatContent: React.FC = () => {
  const searchParams = useSearchParams();
  // Read 'message' instead of 'draft'
  const initialMessageFromUrl = searchParams.get("message") || "";

  const [firstRender, setFirstRender] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Define scrollToBottom before useChat
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setInput, // Get setInput from useChat to manually clear input after programmatic submit
  } = useChat({
    api: "/api/coach",
    initialMessages: [
      {
        id: "initial-greeting",
        role: "assistant",
        content: "How can I support your personal growth journey today?",
        createdAt: new Date(),
      },
    ],
    initialInput: initialMessageFromUrl, // Use derived initialMessage
    onFinish: () => {
      scrollToBottom(); // Now defined
    },
  });

  // Programmatically submit the initial message from URL on mount
  useEffect(() => {
    // Only run if there is an initial message from the URL
    // and we are in the initial state (only greeting message exists)
    // and not currently loading.
    if (
      initialMessageFromUrl &&
      messages.length === 1 &&
      !isLoading &&
      textareaRef.current
    ) {
      console.log(
        "Submitting initial message from URL:",
        initialMessageFromUrl
      );

      // Simulate form submission
      const fakeForm = document.createElement("form");
      const fakeEvent = new Event("submit", {
        cancelable: true,
        bubbles: true,
      });
      // React expects these properties for synthetic events
      Object.defineProperty(fakeEvent, "target", {
        writable: false,
        value: fakeForm,
      });
      Object.defineProperty(fakeEvent, "currentTarget", {
        writable: false,
        value: fakeForm,
      });

      handleSubmit(fakeEvent as unknown as React.FormEvent<HTMLFormElement>);

      // Clear the input state in useChat after programmatic submission
      // This prevents the user seeing their message duplicated in the input
      // Needs a slight delay to ensure submit has processed
      setTimeout(() => {
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.value = "";
          textareaRef.current.style.height = "auto"; // Reset height
        }
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessageFromUrl]); // Run only when the initial message from URL changes (effectively once on load)

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Auto-focus textarea when initialMessage is provided or on first render
  useEffect(() => {
    // Focus logic might need adjustment depending on programmatic submit timing
    if (
      (initialMessageFromUrl || firstRender) &&
      textareaRef.current &&
      !isLoading
    ) {
      // Don't focus immediately if we are programmatically submitting
      if (!initialMessageFromUrl || messages.length > 1) {
        textareaRef.current.focus();
      }
      setFirstRender(false);
    }
  }, [initialMessageFromUrl, firstRender, isLoading, messages.length]); // Added dependencies

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    // Reset height to auto to correctly calculate scrollHeight
    e.target.style.height = "auto";
    // Set the height to scrollHeight (+2px for border)
    e.target.style.height = `${Math.min(e.target.scrollHeight + 2, 200)}px`;
  };

  // Group messages by date
  const messageGroups = messages.reduce(
    (groups: Record<string, typeof messages>, message) => {
      const date = message.createdAt ? new Date(message.createdAt) : new Date();
      const dateStr = date.toDateString();

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push({ ...message, createdAt: date });

      return groups;
    },
    {}
  );

  // Handle feedback
  const handleFeedback = (messageId: string, type: "up" | "down") => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type,
    }));
    // Here you could also send the feedback to your backend
  };

  // Quick prompts for empty state
  const quickPrompts = [
    "Help me develop a morning routine",
    "How can I improve my focus?",
    "Suggest ways to reduce stress",
    "I need help setting achievable goals",
  ];

  const handlePromptClick = (prompt: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = prompt;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight + 2,
        200
      )}px`;
      handleInputChange({
        target: { value: prompt },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Welcome gradient (shown when no messages) */}
      {messages.length <= 1 && (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
      )}

      {/* Message container with max width for readability */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pb-32 pt-8 px-4 space-y-8"
      >
        <div className="max-w-[700px] mx-auto w-full">
          {/* Empty state with quick prompts */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col items-center text-center mb-8 mt-4 px-4"
            >
              <h2 className="text-2xl font-bold mb-2">
                Welcome to Spiral Coach
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your AI companion for personal growth and self-improvement. What
                would you like to work on today?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {quickPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-sm font-normal"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {Object.entries(messageGroups).map(
            ([dateStr, dateMessages], groupIndex) => (
              <div key={dateStr} className="space-y-6">
                {/* Date separator (shown for all except today unless clicked) */}
                {groupIndex > 0 && (
                  <div className="flex justify-center my-6">
                    <div className="text-xs font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full border">
                      {formatDate(new Date(dateStr))}
                    </div>
                  </div>
                )}

                {dateMessages.map((msg) => (
                  <AnimatePresence key={msg.id} mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-start gap-3 group relative", // Added relative positioning for feedback
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {/* Avatar for assistant */}
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border/50 shadow-sm"
                        )}
                      >
                        {/* Feedback buttons for assistant messages - MOVED INSIDE the message bubble div */}
                        {msg.role === "assistant" &&
                          msg.id !== "initial-greeting" && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 items-center absolute -right-2 -top-3 bg-background border rounded-full shadow-sm px-1.5 py-0.5 z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  feedbackGiven[msg.id] === "up" &&
                                    "text-green-500"
                                )}
                                onClick={() => handleFeedback(msg.id, "up")}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  feedbackGiven[msg.id] === "down" &&
                                    "text-red-500"
                                )}
                                onClick={() => handleFeedback(msg.id, "down")}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}

                        {/* Message content */}
                        <div
                          className={cn(
                            "prose max-w-none",
                            msg.role === "user"
                              ? "dark:prose-invert prose-p:my-1 prose-pre:my-2 text-sm"
                              : "prose-p:my-2.5 prose-pre:my-3 prose-headings:mt-7 prose-headings:mb-3 prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h3:font-medium prose-h3:text-primary/90 prose-strong:text-primary/90 prose-strong:font-semibold text-sm leading-relaxed"
                          )}
                        >
                          {msg.role === "assistant" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Custom rendering for headings and strong tags to improve hierarchy
                                h1: (props) => (
                                  <h1
                                    className="text-lg font-bold mt-6 mb-2"
                                    {...props}
                                  />
                                ),
                                h2: (props) => (
                                  <h2
                                    className="text-base font-bold mt-5 mb-2"
                                    {...props}
                                  />
                                ),
                                h3: (props) => (
                                  <h3
                                    className="text-base font-semibold text-primary/90 mt-4 mb-1.5"
                                    {...props}
                                  />
                                ),
                                // Apply styles to improve paragraph spacing
                                p: (props) => {
                                  const text = String(props.children);
                                  // Apply special styling to known section headings
                                  if (
                                    text.startsWith("Connection:") ||
                                    text.startsWith("Insight:") ||
                                    text.startsWith("Activation:") ||
                                    text.startsWith("Action:") ||
                                    text.startsWith("Time:") ||
                                    text.startsWith("Goal:") ||
                                    text.startsWith("Integration:")
                                  ) {
                                    const [heading, ...rest] = text.split(":");
                                    return (
                                      <p className="mt-4 mb-1.5" {...props}>
                                        <span className="font-bold text-primary/90">
                                          {heading}:
                                        </span>
                                        {rest.join(":")}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p className="mt-2.5 mb-2.5" {...props} />
                                  );
                                },
                                // Improve bullet point spacing
                                ul: (props) => (
                                  <ul
                                    className="my-2 pl-6 space-y-1.5"
                                    {...props}
                                  />
                                ),
                                li: (props) => (
                                  <li className="pl-1" {...props} />
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div
                          suppressHydrationWarning
                          className={cn(
                            "text-xs mt-1.5",
                            msg.role === "user"
                              ? "text-primary-foreground/60 text-right"
                              : "text-muted-foreground"
                          )}
                        >
                          {msg.createdAt && formatTime(msg.createdAt)}
                        </div>
                      </div>

                      {/* Avatar for user */}
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
            )
          )}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div
              className="flex items-start gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-card px-5 py-3.5 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <div
                      className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    Thinking
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-[120px] left-4 right-4 max-w-[700px] mx-auto bg-destructive/10 text-destructive text-sm px-4 py-3 border border-destructive/20 rounded-lg shadow-md z-20 flex justify-between items-center">
          <span>Error: {error.message}</span>
          <Button
            onClick={() => reload()}
            variant="destructive"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Input form at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md py-4 px-4 z-10">
        <form
          onSubmit={handleSubmit}
          className="flex gap-3 items-end max-w-[700px] mx-auto relative"
        >
          <div className="relative flex-grow">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              placeholder="Message Spiral Coach..."
              disabled={isLoading}
              className="flex-grow resize-none min-h-[56px] max-h-[200px] text-base rounded-xl border-input shadow-sm pr-14 py-3.5 px-4"
              onKeyDown={(e) => {
                // Check if Enter is pressed without Shift
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevent newline
                  // Trigger submit if input is not empty
                  if (input.trim()) {
                    handleSubmit(
                      // Cast event type as FormEvent for handleSubmit
                      e as unknown as React.FormEvent<HTMLFormElement>
                    );
                  }
                }
              }}
            />
          </div>

          <div className="flex-shrink-0">
            {isLoading ? (
              <Button
                type="button"
                onClick={stop}
                variant="secondary"
                size="icon"
                className="rounded-full h-[56px] w-[56px]"
                aria-label="Stop generating"
              >
                <PauseCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                aria-label="Send message"
                className={cn(
                  "rounded-full h-[56px] w-[56px]",
                  input.trim()
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>
        </form>

        {/* Disclaimer text */}
        <div className="text-center mt-3 text-xs text-muted-foreground max-w-[700px] mx-auto">
          Spiral Coach is an AI assistant designed to support your personal
          growth journey. Always verify important information.
        </div>
      </div>
    </div>
  );
};

// Export a wrapper component that uses Suspense
const CoachChat: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      {" "}
      {/* Optional: Add a loading state */}
      <CoachChatContent />
    </Suspense>
  );
};

export default CoachChat; 
