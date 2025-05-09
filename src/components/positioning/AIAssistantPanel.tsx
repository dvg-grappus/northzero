
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Lightbulb, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePositioning } from "@/contexts/PositioningContext";

// Define types for AI messages
type MessageRole = "assistant" | "user" | "insight";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  description?: string;
}

// Predefined responses and quick actions based on positioning step
const ASSISTANT_CONTEXT: Record<string, {
  welcomeMessage: string;
  insightMessages: string[];
  quickActions: QuickAction[];
  responses: string[];
}> = {
  "brief": {
    welcomeMessage: "I see you're starting with your brand brief. What's the core idea you're building?",
    insightMessages: [
      "The best briefs focus on the problem you're solving rather than the features you're building.",
      "Consider including your target audience in the brief - who specifically will benefit most?",
      "Great briefs are specific yet concise - aim for clarity in under 80 words."
    ],
    quickActions: [
      { id: "shorten", label: "Shorten it" },
      { id: "elaborate", label: "Elaborate more" },
      { id: "inspiring", label: "More inspiring" },
      { id: "tactical", label: "More tactical" },
      { id: "audience", label: "Focus on audience" }
    ],
    responses: [
      "I've refined your brief to be more concise while keeping the core message.",
      "I've expanded on your key points to add more context and depth.",
      "I've added more visionary language to inspire stakeholders.",
      "I've made your brief more action-oriented with specific next steps.",
      "I've highlighted who would benefit most from your solution."
    ]
  },
  "golden-circle": {
    welcomeMessage: "Let's work on your Golden Circle. Would you like help refining your WHY, HOW, or WHAT statements?",
    insightMessages: [
      "Your WHY should inspire emotion, while your WHAT remains practical.",
      "The most compelling WHY statements connect to universal human needs.",
      "Consider how your HOW statements differentiate you from competitors."
    ],
    quickActions: [
      { id: "why-inspiring", label: "More inspiring WHY" },
      { id: "how-unique", label: "More unique HOW" },
      { id: "what-clear", label: "Clearer WHAT" },
      { id: "more-options", label: "Generate more options" },
      { id: "contrast", label: "More contrasting" }
    ],
    responses: [
      "I've created new WHY statements that connect more deeply with human values.",
      "Your HOW options now focus more on your unique methodology and approach.",
      "I've clarified your WHAT statements to be more tangible and specific.",
      "Here are some additional options that provide more variety in your positioning.",
      "These new options create a stronger contrast between the different positioning angles."
    ]
  },
  "opportunities-challenges": {
    welcomeMessage: "Time to identify opportunities and challenges. What market trends or obstacles are you facing?",
    insightMessages: [
      "The best opportunities often emerge from the intersection of trends and unmet needs.",
      "Consider ranking your challenges by impact vs difficulty to address.",
      "Sometimes reframing a challenge as an opportunity leads to breakthrough thinking."
    ],
    quickActions: [
      { id: "more-trends", label: "More industry trends" },
      { id: "customer-pain", label: "Customer pain points" },
      { id: "competitive-gaps", label: "Competitive gaps" },
      { id: "rank-impact", label: "Rank by impact" },
      { id: "reframe", label: "Reframe challenges" }
    ],
    responses: [
      "I've identified some emerging trends in your industry that create new opportunities.",
      "Here are the key pain points I've identified based on your target audience.",
      "I've analyzed gaps in competitor offerings that you could potentially fill.",
      "I've ranked these by potential market impact from highest to lowest.",
      "I've reframed these challenges as potential differentiators for your brand."
    ]
  },
  "roadmap": {
    welcomeMessage: "Let's plan your roadmap. What are your short and long-term goals?",
    insightMessages: [
      "Effective roadmaps balance aspiration with achievability.",
      "Consider breaking larger goals into smaller, measurable milestones.",
      "The best roadmaps align tactical execution with strategic vision."
    ],
    quickActions: [
      { id: "shorter-milestones", label: "Shorter milestones" },
      { id: "measurable-goals", label: "More measurable" },
      { id: "prioritize", label: "Help prioritize" },
      { id: "resource-align", label: "Align with resources" },
      { id: "vision-align", label: "Align with vision" }
    ],
    responses: [
      "I've broken down your longer-term goals into smaller 2-3 month milestones.",
      "I've added specific metrics to help you track progress on each goal.",
      "I've reordered these milestones based on impact, urgency, and dependencies.",
      "These adjusted milestones better align with typical resource constraints for your stage.",
      "I've connected each milestone more explicitly to your overall vision."
    ]
  },
  "values": {
    welcomeMessage: "Let's define your brand values. What principles guide your organization?",
    insightMessages: [
      "The most effective values are both aspirational and authentic to your organization.",
      "Consider how each value translates into specific behaviors and decisions.",
      "Strong values help both attract the right customers and make internal decisions."
    ],
    quickActions: [
      { id: "more-distinctive", label: "More distinctive" },
      { id: "actionable", label: "More actionable" },
      { id: "memorable", label: "More memorable" },
      { id: "consistent", label: "More consistent" },
      { id: "culture-fit", label: "Better culture fit" }
    ],
    responses: [
      "I've refined your values to be more distinctive and less generic.",
      "I've reframed these values to focus more on how they guide actions and decisions.",
      "These revised values use more vivid and memorable language.",
      "I've adjusted these values to create a more cohesive and consistent set.",
      "I've aligned these values more closely with your organization's culture."
    ]
  },
  "differentiators": {
    welcomeMessage: "Let's identify what truly sets you apart from competitors. What makes your approach unique?",
    insightMessages: [
      "The strongest differentiators are both meaningful to customers and difficult for competitors to copy.",
      "Consider ranking your differentiators by how defensible they are long-term.",
      "Effective differentiation often combines multiple factors rather than a single feature."
    ],
    quickActions: [
      { id: "more-tangible", label: "More tangible" },
      { id: "customer-value", label: "Customer value" },
      { id: "defensible", label: "More defensible" },
      { id: "contrast", label: "Sharper contrast" },
      { id: "evidence", label: "Add evidence" }
    ],
    responses: [
      "I've made your differentiators more concrete and tangible.",
      "I've reframed these to focus more on specific customer benefits.",
      "These differentiators now emphasize aspects that are harder for competitors to replicate.",
      "I've strengthened the contrast between you and competitors in these statements.",
      "I've suggested specific examples or proof points to support each differentiator."
    ]
  },
  "statements": {
    welcomeMessage: "Now for your positioning statements. These will guide all your communications. Ready to refine them?",
    insightMessages: [
      "The best positioning statements are clear, credible, and compelling.",
      "Consider testing your statement against competitors - would it work for them too? If yes, it's not specific enough.",
      "Effective positioning creates both rational and emotional connections with your audience."
    ],
    quickActions: [
      { id: "more-specific", label: "More specific" },
      { id: "more-compelling", label: "More compelling" },
      { id: "simplify", label: "Simplify" },
      { id: "audience-focus", label: "More audience focus" },
      { id: "competitive-angle", label: "Competitive angle" }
    ],
    responses: [
      "I've added more specific details that make your positioning more distinctive.",
      "I've strengthened the emotional appeal while maintaining clarity.",
      "I've simplified the language while preserving the core message.",
      "I've reframed this to focus more explicitly on your target audience's needs.",
      "I've emphasized how you differ from alternative solutions in the market."
    ]
  }
};

// Generic responses when no specific context is available
const GENERIC_RESPONSES = [
  "That's an interesting perspective. Have you considered how this aligns with your target audience?",
  "Great point. This could help differentiate your brand in a meaningful way.",
  "I see what you're thinking. This approach could work well if executed consistently across touchpoints.",
  "That's a strong direction. Consider how this might evolve as your brand grows."
];

// Welcome messages when the assistant first loads
const WELCOME_MESSAGES = [
  "Hi there! I'm your AI positioning assistant. I'll help you craft a powerful brand position. Select options below or chat with me directly.",
  "Welcome to the positioning module! I'm here to help refine your brand strategy. Use the quick actions below or ask me anything.",
  "Let's build your brand positioning together. I can suggest improvements, generate ideas, or answer questions. What would you like help with?"
];

const AIAssistantPanel: React.FC = () => {
  const { activeStep } = usePositioning();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date()
      }
    ]);
    
    // Add an insight message after a short delay
    setTimeout(() => {
      const insight = "Pro tip: I can help you refine your ideas at each step. Try the quick actions below or ask me specific questions.";
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "insight",
        content: insight,
        timestamp: new Date()
      }]);
    }, 3000);
  }, []);
  
  // Send a contextual hint when the active step changes
  useEffect(() => {
    if (activeStep && ASSISTANT_CONTEXT[activeStep]) {
      setIsTyping(true);
      
      // Simulate typing delay
      const timer = setTimeout(() => {
        const context = ASSISTANT_CONTEXT[activeStep];
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: context.welcomeMessage,
          timestamp: new Date()
        }]);
        
        setIsTyping(false);
        
        // Add an insight message after a short delay
        setTimeout(() => {
          const randomInsight = context.insightMessages[Math.floor(Math.random() * context.insightMessages.length)];
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "insight",
            content: randomInsight,
            timestamp: new Date()
          }]);
        }, 2500);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [activeStep]);
  
  // Auto scroll to bottom when new messages arrive
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
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Generate a response after a short delay
    setTimeout(() => {
      let response = "I'm analyzing your input...";
      
      // If we have canned responses for the current step, use one
      if (activeStep && ASSISTANT_CONTEXT[activeStep]) {
        const responses = ASSISTANT_CONTEXT[activeStep].responses;
        response = responses[Math.floor(Math.random() * responses.length)];
      } else {
        // Generic responses
        response = GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)];
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Sometimes follow up with an insight
      if (Math.random() > 0.7) {
        setTimeout(() => {
          let insight = "Consider how this aligns with your overall brand vision.";
          
          if (activeStep && ASSISTANT_CONTEXT[activeStep]) {
            const insights = ASSISTANT_CONTEXT[activeStep].insightMessages;
            insight = insights[Math.floor(Math.random() * insights.length)];
          }
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "insight",
            content: insight,
            timestamp: new Date()
          }]);
        }, 2000);
      }
    }, 1500);
  };
  
  const handleQuickAction = (actionId: string) => {
    if (!activeStep || !ASSISTANT_CONTEXT[activeStep]) return;
    
    const action = ASSISTANT_CONTEXT[activeStep].quickActions.find(a => a.id === actionId);
    if (!action) return;
    
    // Add user message for the quick action
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Can you help me make this ${action.label.toLowerCase()}?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Generate a response after a short delay
    setTimeout(() => {
      const context = ASSISTANT_CONTEXT[activeStep];
      const response = context.responses[Math.floor(Math.random() * context.responses.length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <motion.div
      className="bg-card rounded-lg border border-border/50 h-full flex flex-col shadow-lg"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-cyan flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-background" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Brand AI</h3>
          <p className="text-xs text-muted-foreground">Positioning assistant</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === "insight" ? (
              <div className="max-w-[90%] p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">{message.content}</p>
                  <p className="text-xs mt-1 text-amber-600">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
      
      {/* Quick action buttons - only show if we have context for the active step */}
      {activeStep && ASSISTANT_CONTEXT[activeStep] && (
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_CONTEXT[activeStep].quickActions.map(action => (
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
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan"
            placeholder="Ask for ideas or feedback..."
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
    </motion.div>
  );
};

export default AIAssistantPanel;
