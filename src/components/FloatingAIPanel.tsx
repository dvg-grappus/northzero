
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type MessageType = 'user' | 'ai' | 'system';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface FloatingAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  suggestedPrompts?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export const TalkToAIButton: React.FC<{ context?: string; onClick: () => void }> = ({
  context,
  onClick
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4" />
      <span>Talk to AI</span>
    </Button>
  );
};

const FloatingAIPanel: React.FC<FloatingAIPanelProps> = ({ 
  isOpen,
  onClose,
  context = "AI Assistant",
  suggestedPrompts = [
    "Help me refine this",
    "Suggest improvements",
    "Explain this concept"
  ],
  onSuggestionSelect
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          id: '0', 
          type: 'ai', 
          content: `Hi! I'm your AI assistant. How can I help with ${context}?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, context, messages.length]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as MessageType,
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Mock response after delay
    setTimeout(() => {
      // Generic response
      const aiResponse = "I'll help you with that. Let me provide some suggestions...";
      
      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          type: 'ai', 
          content: aiResponse,
          timestamp: new Date()
        }
      ]);
      
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    // Add suggestion as user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as MessageType,
      content: suggestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Mock response based on suggestion
    setTimeout(() => {
      let aiResponse = "I'll help you with that. Here are some thoughts...";
      
      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          type: 'ai', 
          content: aiResponse,
          timestamp: new Date()
        }
      ]);
      
      // Call the suggestion select handler if provided
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion);
      }
      
      setIsTyping(false);
    }, 1000);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 w-[360px] h-[540px] rounded-lg bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg flex flex-col overflow-hidden z-[100]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="font-medium text-sm">{context}</div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div key={message.id} className={cn(
                "max-w-[85%] p-3 rounded-lg",
                message.type === 'user' 
                  ? "bg-cyan text-black ml-auto"
                  : message.type === 'system'
                  ? "bg-amber-950/20 border border-amber-900/30"
                  : "bg-card text-foreground"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-card p-3 rounded-lg max-w-[85%]">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested prompts */}
          <div className="p-3 border-t border-border/20 bg-card/20">
            <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="text-xs rounded-full bg-[#303030] px-3 py-1.5 hover:bg-[#404040] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleSuggestionClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          
          {/* Input field */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border/20">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask a question..."
                className="min-h-[40px] resize-none bg-muted/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim()} 
                className="bg-cyan text-black hover:bg-cyan/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingAIPanel;
