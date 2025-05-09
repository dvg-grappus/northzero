
import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

// Assistant context data based on step
const ASSISTANT_CONTEXT: Record<string, {
  messages: string[];
  quickActions: { id: string; label: string }[];
}> = {
  "discovery": {
    messages: [
      "Skim the preview sheet—funding stage often signals who's worth tracking.",
      "Look for startups in your exact space, but also those adjacent to it.",
      "Consider including a mix of both large established players and innovative newcomers."
    ],
    quickActions: [
      { id: "yc-alumni", label: "Surface YC alumni" },
      { id: "b2b-filter", label: "Filter B2B only" },
      { id: "remove-large", label: "Remove large-cos" }
    ]
  },
  "takeaways": {
    messages: [
      "Save only what fits your future roadmap.",
      "Look for patterns across multiple competitors to spot real trends.",
      "The most valuable takeaways often come from unexpected sources."
    ],
    quickActions: [
      { id: "auto-save", label: "Auto-save top 3 UX ideas" },
      { id: "growth-tactics", label: "Show only growth tactics" },
      { id: "explain", label: "Explain this idea" }
    ]
  },
  "trends": {
    messages: [
      "Try clustering trends by potential impact.",
      "Consider which trends align with your brand values and target audience.",
      "Some trends may be worth adopting quickly, while others are worth monitoring."
    ],
    quickActions: [
      { id: "sort-novelty", label: "Sort by novelty" },
      { id: "hide-low", label: "Hide low relevance" },
      { id: "merge-trends", label: "Merge two trends" }
    ]
  },
  "landscape": {
    messages: [
      "Drag tokens until clusters tell a story. Try swapping an axis for freshness.",
      "Position your brand carefully relative to competitors to identify white space.",
      "The most interesting insights often come from examining outliers."
    ],
    quickActions: [
      { id: "auto-space", label: "Auto-space to grid" },
      { id: "label-clusters", label: "Label clusters" },
      { id: "export-png", label: "Export PNG" }
    ]
  },
  "review": {
    messages: [
      "Star the most actionable insights to prioritize follow-up.",
      "Consider merging similar insights to create stronger takeaways.",
      "These insights will form the foundation of your competitive strategy."
    ],
    quickActions: [
      { id: "star-all", label: "Star all takeaways" },
      { id: "merge-similar", label: "Merge similar insights" },
      { id: "categorize", label: "Auto-categorize" }
    ]
  }
};

type MessageRole = "assistant" | "user" | "system";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  currentStep: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ currentStep }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Show step-specific message when the step changes
  useEffect(() => {
    if (currentStep && ASSISTANT_CONTEXT[currentStep]) {
      setIsTyping(true);
      
      // Select a random message from the step's message array
      const contextMessages = ASSISTANT_CONTEXT[currentStep].messages;
      const randomMessage = contextMessages[Math.floor(Math.random() * contextMessages.length)];
      
      // Simulate typing delay
      setTimeout(() => {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: randomMessage,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
        
        // Add system tip after a delay
        setTimeout(() => {
          const tipMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: "Try using the quick actions below or ask me questions about your competition.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, tipMessage]);
        }, 2000);
      }, 1000);
    }
  }, [currentStep]);
  
  // Initial welcome message
  useEffect(() => {
    // Add welcome message when the component first loads
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "Welcome to the Competition module! I'll help you analyze your competitors, identify trends, and position your brand effectively.",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Generate response after delay
    setTimeout(() => {
      // Generic responses
      const responses = [
        "That's a good point about your competitors. Have you considered how this affects your positioning?",
        "I see what you mean. Looking at the landscape, I'd recommend focusing on your unique differentiators.",
        "Interesting observation! This could be a key insight for your strategy going forward.",
        "That's a smart approach. You might also want to consider how this trend will evolve in the next 6-12 months."
      ];
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleQuickAction = (actionId: string) => {
    // Add user message for the quick action
    const actionText = ASSISTANT_CONTEXT[currentStep]?.quickActions.find(a => a.id === actionId)?.label || "Use quick action";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Can you ${actionText.toLowerCase()}?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate typing
    setIsTyping(true);
    
    // Generate response for the action
    setTimeout(() => {
      let responseText = "Processing your request...";
      
      // Different responses based on action
      switch (actionId) {
        case "yc-alumni":
          responseText = "I've filtered the list to show YC alumni startups. There are 2 in your current view: Scaler Academy and Ask AI Mentor.";
          break;
        case "b2b-filter":
          responseText = "I've applied the B2B filter. 7 of your competitors primarily serve business customers, while 5 are more consumer-focused.";
          break;
        case "remove-large":
          responseText = "I've hidden the large companies from view. You're now only seeing startups and smaller competitors.";
          break;
        case "auto-save":
          responseText = "I've saved the top 3 UX ideas based on impact potential: 'Discover Page onboarding', 'Mobile learning snacks', and 'Personalized dashboards'.";
          break;
        case "auto-space":
          responseText = "I've realigned the competitors on a grid for better visual clarity. You can still drag them to make manual adjustments.";
          break;
        case "export-png":
          responseText = "I've captured a snapshot of your current landscape map and saved it to your snapshots panel.";
          break;
        default:
          responseText = "I've processed that action for you. You should see the results updated on screen.";
      }
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-cyan flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-background" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Competition AI</h3>
          <p className="text-xs text-muted-foreground">Analysis assistant</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === "system" ? (
              <div className="max-w-[90%] p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-400/90">{message.content}</p>
                </div>
              </div>
            ) : (
              <div 
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-muted text-foreground' 
                    : 'bg-cyan text-background'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick actions */}
      {currentStep && ASSISTANT_CONTEXT[currentStep] && (
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_CONTEXT[currentStep].quickActions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="bg-muted/50 text-foreground hover:bg-muted transition-colors text-xs"
                onClick={() => handleQuickAction(action.id)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
            placeholder="Ask about competitors or strategies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="h-10 w-10 rounded-full bg-cyan text-background flex items-center justify-center hover:bg-cyan/90 transition-colors"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
