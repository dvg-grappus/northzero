
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Define the assistant messages for each route
const routeMessages: Record<string, {
  message: string;
  actions: { label: string; description: string }[];
}> = {
  '/step/4/archetype': {
    message: "Blend two archetypes if you seek nuance—most beloved brands aren't pure.",
    actions: [
      { label: "Show tech-brand examples", description: "View how tech companies blend archetypes" },
      { label: "Auto-blend top two", description: "Automatically blend your highest match archetypes" },
      { label: "Why low Outlaw %?", description: "Learn why your brand has low Outlaw compatibility" }
    ]
  },
  '/step/4/keywords': {
    message: "Two or three well-chosen traits beat a laundry list.",
    actions: [
      { label: "Suggest minimal trio", description: "Get three recommended keywords for your brand" },
      { label: "Scan conflicts", description: "Check your selections for conflicting traits" },
      { label: "Shuffle playful set", description: "See alternative playful keyword combinations" }
    ]
  },
  '/step/4/sliders': {
    message: "Aim for coherence with your earlier archetype blend.",
    actions: [
      { label: "Auto-mirror archetype", description: "Set sliders to match your archetype profile" },
      { label: "Reset sliders", description: "Return all sliders to default positions" },
      { label: "Explain extremes", description: "See what very high or low positions mean" }
    ]
  },
  '/step/4/x-meets-y': {
    message: "Great combos play tension: dependable × daring.",
    actions: [
      { label: "Suggest luxury × tech", description: "See examples of luxury and tech brand combinations" },
      { label: "Swap second brand", description: "Keep first brand but change the second" },
      { label: "Generate 3 alt summaries", description: "See different interpretations of your combo" }
    ]
  },
  '/step/4/dichotomy': {
    message: "This line sets hard guard-rails—keep them contrasty yet true.",
    actions: [
      { label: "More playful pairs", description: "See examples of more playful word combinations" },
      { label: "Explain conflict", description: "Get insight on potential conflicts in your choices" },
      { label: "Lock & finish", description: "Finalize your selections and save them" }
    ]
  }
};

interface AIAssistantPanelProps {
  onActionClick?: (action: string) => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onActionClick }) => {
  const location = useLocation();
  const [messages, setMessages] = useState<{text: string; isUser: boolean}[]>([]);
  const [currentRoute, setCurrentRoute] = useState(location.pathname);
  
  useEffect(() => {
    // Reset messages when route changes
    if (location.pathname !== currentRoute) {
      setCurrentRoute(location.pathname);
      setMessages([{ 
        text: routeMessages[location.pathname]?.message || "How can I help with your brand personality?", 
        isUser: false 
      }]);
    }
  }, [location.pathname, currentRoute]);
  
  useEffect(() => {
    // Initialize with the first message
    if (messages.length === 0) {
      setMessages([{ 
        text: routeMessages[location.pathname]?.message || "How can I help with your brand personality?", 
        isUser: false 
      }]);
    }
  }, [location.pathname, messages.length]);

  const handleActionClick = (action: string) => {
    // Add user message
    setMessages(prev => [...prev, { text: action, isUser: true }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `Here's information about "${action}"...`, 
        isUser: false 
      }]);
    }, 500);
    
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#262626] border-l border-border/40">
      <div className="p-4 border-b border-border/40">
        <h3 className="text-lg font-medium text-foreground">AI Assistant</h3>
        <p className="text-xs text-muted-foreground">Helping with your brand personality</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`${
              msg.isUser 
                ? 'bg-accent/60 ml-8' 
                : 'bg-secondary/60 mr-8'
            } p-3 rounded-lg`}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border/40 space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">QUICK ACTIONS</p>
        {routeMessages[location.pathname]?.actions.map((action, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm"
            className="w-full justify-start text-left border-border/50 hover:bg-accent mb-2"
            onClick={() => handleActionClick(action.label)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIAssistantPanel;
