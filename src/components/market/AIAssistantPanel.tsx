
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/providers/MarketProvider";
import { CircleCheck, Filter, MessageSquare, Pause, LineChart, RefreshCw, Save, Star } from "lucide-react";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  currentSection: number;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ currentSection }) => {
  const { 
    setFilters, 
    toggleAutoRefresh,
    marketInsights
  } = useMarket();
  
  // Assistant messages for each section
  const messages = [
    {
      section: 1,
      message: "Check sample size before accepting.",
      actions: [
        { 
          label: "Filter 2023+", 
          icon: <Filter className="h-4 w-4" />,
          onClick: () => {
            setFilters(prev => ({ ...prev, year: '2023' }));
            toast.info("Filtered for 2023 and newer");
          }
        },
        { 
          label: "Show CAGR only", 
          icon: <LineChart className="h-4 w-4" />,
          onClick: () => {
            setFilters(prev => ({ ...prev, metric: 'CAGR' }));
            toast.info("Filtered for CAGR metrics");
          }
        },
        { 
          label: "Refresh sources", 
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: () => {
            toast.success("Sources refreshed");
          }
        }
      ]
    },
    {
      section: 2,
      message: "Tip — mute noise, store signal.",
      actions: [
        { 
          label: "Pause feed", 
          icon: <Pause className="h-4 w-4" />,
          onClick: () => {
            toggleAutoRefresh();
            toast.info("Feed paused");
          }
        },
        { 
          label: "Only Medium", 
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => {
            toast.info("Filtered for Medium posts");
          }
        },
        { 
          label: "Sentiment filter", 
          icon: <Filter className="h-4 w-4" />,
          onClick: () => {
            toast.info("Showing positive sentiment");
          }
        }
      ]
    },
    {
      section: 3,
      message: "Graphs reveal velocity, reports reveal horizon.",
      actions: [
        { 
          label: "Newest first", 
          icon: <Filter className="h-4 w-4" />,
          onClick: () => {
            toast.info("Sorted by newest first");
          }
        },
        { 
          label: "Only case studies", 
          icon: <Filter className="h-4 w-4" />,
          onClick: () => {
            toast.info("Showing only case studies");
          }
        },
        { 
          label: "Generate exec summary", 
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => {
            toast.success("Summary generated", {
              description: (
                <div className="mt-2">
                  <ul className="list-disc pl-4 text-sm">
                    <li>HR Tech adoption increasing 37% YoY</li>
                    <li>Remote hiring causing friction in onboarding</li>
                    <li>AI tools show 3.2× ROI but bias concerns remain</li>
                  </ul>
                </div>
              )
            });
          }
        }
      ]
    }
  ];
  
  // Find current section message
  const currentMessage = messages.find(m => m.section === currentSection) || messages[0];

  // Function to handle starring insights
  const handleStarInsights = () => {
    // Since we removed starInsight from our context, we'll just show a toast instead
    toast.success("Starred 3 insights");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border/40">
        <h3 className="font-semibold">AI Assistant</h3>
        <div className="flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
      
      <div className="p-6 flex-grow overflow-y-auto">
        <motion.div
          className="bg-secondary/30 rounded-lg p-4 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={`message-${currentSection}`}
        >
          {currentMessage.message}
        </motion.div>
        
        <div className="mt-6 space-y-3">
          <h4 className="text-xs text-muted-foreground mb-2">Quick actions</h4>
          
          {currentMessage.actions.map((action, i) => (
            <motion.div
              key={`action-${currentSection}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 + (i * 0.1) }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2" 
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            </motion.div>
          ))}

          {/* Add a fourth action for the removed fourth section */}
          {currentSection === 3 && (
            <motion.div
              key={`action-${currentSection}-3`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2" 
                onClick={handleStarInsights}
              >
                <Star className="h-4 w-4" />
                Auto-star highest novelty
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="p-6 border-t border-border/40">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask a question..."
            className="w-full bg-background border border-border rounded-md py-2 px-3 text-sm"
            disabled
          />
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan text-black rounded-md px-2 py-1 text-xs"
            disabled
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};
