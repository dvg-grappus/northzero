import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketFooter } from "@/components/market/MarketFooter";
import { StatisticsHarvest } from "@/components/market/StatisticsHarvest";
import { SocialChatterWall } from "@/components/market/SocialChatterWall";
import { SimpleLibrary } from "@/components/market/SimpleLibrary";
import { InsightDigest } from "@/components/market/InsightDigest";
import { SecondaryInsightPool } from "@/components/market/SecondaryInsightPool";
import { MarketProvider } from "@/providers/MarketProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingAIPanel from "@/components/FloatingAIPanel";
import OfflineToast from "@/components/OfflineToast";

const MarketPage: React.FC = () => {
  // Only keep section 1 (Statistics Harvest) open by default
  const [openSections, setOpenSections] = useState<number[]>([1]);
  const [showInsightPool, setShowInsightPool] = useState(false);
  const [showInsightDigest, setShowInsightDigest] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([1, 2, 3]); // Start with all sections completed
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset scroll position on page change
  useEffect(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = 0;
        }
      }
    }, 50);
  }, []);

  const toggleSection = (sectionNumber: number) => {
    setOpenSections(prev => 
      prev.includes(sectionNumber)
        ? prev.filter(s => s !== sectionNumber)
        : [...prev, sectionNumber]
    );
  };

  // Always mark section as complete
  const completeSection = (sectionNumber: number) => {
    if (!completedSections.includes(sectionNumber)) {
      setCompletedSections(prev => [...prev, sectionNumber]);
    }
  };

  const toggleInsightPool = () => {
    setShowInsightPool(prev => !prev);
  };

  const toggleAIPanel = () => {
    setShowAIPanel(!showAIPanel);
  };

  // Remove completion requirements - always allow completion
  const handleModuleComplete = () => {
    navigate("/timeline", { state: { fromMarket: true } });
  };

  // Get AI context based on current section
  const getAIContext = () => {
    const currentSection = openSections[openSections.length - 1] || 1;
    
    switch (currentSection) {
      case 1:
        return "Market Statistics";
      case 2:
        return "Social Insights";
      case 3:
        return "Market Library";
      default:
        return "Market Research";
    }
  };

  // Get suggested prompts based on current section
  const getSuggestedPrompts = () => {
    const currentSection = openSections[openSections.length - 1] || 1;
    
    switch (currentSection) {
      case 1:
        return [
          "Which statistics should I focus on?",
          "Help me interpret this market data",
          "How to identify reliable statistics"
        ];
      case 2:
        return [
          "What social trends should I pay attention to?",
          "How to extract insights from social chatter",
          "Which platforms matter most for my market?"
        ];
      case 3:
        return [
          "Recommend resources for deeper research",
          "How to analyze market reports efficiently",
          "What does this graph data suggest?"
        ];
      default:
        return [
          "Help me with market research",
          "How to synthesize these findings",
          "What should I focus on next?"
        ];
    }
  };

  return (
    <MarketProvider>
      {/* Add toast handler component */}
      <OfflineToast />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <MarketHeader 
          completedSections={completedSections} 
          onToggleInsightPool={toggleInsightPool}
        />
        
        <ScrollArea 
          className="flex-1 container max-w-5xl mx-auto px-6 pt-8 pb-24"
          ref={scrollAreaRef}
        >
          <div className="min-h-[calc(100vh-20rem)]">
            {/* Statistics Harvest Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 }}
              className="mb-6"
            >
              <Card 
                className="border p-4 border-cyan"
              >
                <Collapsible open={openSections.includes(1)} onOpenChange={() => toggleSection(1)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center mr-3 font-semibold">
                        1
                      </div>
                      <h2 className="text-lg font-semibold">Statistics Harvest</h2>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-cyan mr-2" />
                      <span className="text-xs text-muted-foreground">
                        Complete
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <StatisticsHarvest onComplete={() => completeSection(1)} />
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>

            {/* Social Chatter Wall Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="mb-6"
            >
              <Card 
                className="border p-4 border-cyan"
              >
                <Collapsible open={openSections.includes(2)} onOpenChange={() => toggleSection(2)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center mr-3 font-semibold">
                        2
                      </div>
                      <h2 className="text-lg font-semibold">Social Chatter Wall</h2>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-cyan mr-2" />
                      <span className="text-xs text-muted-foreground">
                        Complete
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <SocialChatterWall onComplete={() => completeSection(2)} />
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>

            {/* Simple Library Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="mb-6"
            >
              <Card 
                className="border p-4 border-cyan"
              >
                <Collapsible open={openSections.includes(3)} onOpenChange={() => toggleSection(3)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center mr-3 font-semibold">
                        3
                      </div>
                      <h2 className="text-lg font-semibold">Market Library</h2>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-cyan mr-2" />
                      <span className="text-xs text-muted-foreground">
                        Complete
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <SimpleLibrary onComplete={() => completeSection(3)} />
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>
        
        <MarketFooter 
          completedSections={completedSections} 
          onShowInsightDigest={() => setShowInsightDigest(true)} 
          onModuleComplete={handleModuleComplete}
        />
        
        {/* AI Assistant Button */}
        <div className="fixed bottom-24 right-8">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full bg-cyan text-background shadow-lg hover:bg-cyan/90" 
            onClick={toggleAIPanel}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Floating AI Assistant */}
        <FloatingAIPanel
          isOpen={showAIPanel}
          onClose={toggleAIPanel}
          context={getAIContext()}
          suggestedPrompts={getSuggestedPrompts()}
        />
        
        {/* Insight Pool Drawer */}
        <SecondaryInsightPool 
          isOpen={showInsightPool} 
          onClose={() => setShowInsightPool(false)} 
        />
        
        {/* Insight Digest Modal */}
        <InsightDigest 
          isOpen={showInsightDigest} 
          onClose={() => setShowInsightDigest(false)}
          onComplete={handleModuleComplete}
        />
      </div>
    </MarketProvider>
  );
};

export default MarketPage;
