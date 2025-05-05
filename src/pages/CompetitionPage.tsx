
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CompetitionHeader } from "@/components/competition/CompetitionHeader";
import { CompetitionFooter } from "@/components/competition/CompetitionFooter";
import { CompetitorDiscovery } from "@/components/competition/CompetitorDiscovery";
import { KeyTakeaways } from "@/components/competition/KeyTakeaways";
import { TrendsPatterns } from "@/components/competition/TrendsPatterns";
import { LandscapeCanvas } from "@/components/competition/LandscapeCanvas";
import { InsightDigest } from "@/components/competition/InsightDigest";
import { SecondaryInsightPool } from "@/components/competition/SecondaryInsightPool";
import { CompetitionProvider } from "@/providers/CompetitionProvider";
import { AudienceProvider } from "@/providers/AudienceProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingAIPanel from "@/components/FloatingAIPanel";
import OfflineToast from "@/components/OfflineToast";

const CompetitionPage: React.FC = () => {
  const { substep } = useParams<{ substep: string }>();
  const [showSecondaryInsights, setShowSecondaryInsights] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Default to discovery if no substep provided
  const currentSubstep = substep || "discovery";
  
  // Define substeps at the component level
  const subSteps = [
    { id: "discovery", label: "Discovery" },
    { id: "takeaways", label: "Takeaways" },
    { id: "trends", label: "Trends" },
    { id: "landscape", label: "Landscape" },
    { id: "review", label: "Review" },
  ];
  
  // Calculate the current step index based on the currentSubstep
  const currentStepIndex = subSteps.findIndex(step => step.id === currentSubstep);
  
  // Ensure we're on a valid route if accessed directly
  useEffect(() => {
    if (!substep) {
      navigate("/step/3/discovery", { replace: true });
    }
  }, [substep, navigate]);

  // Reset scroll position on page/substep change
  useEffect(() => {
    // Use setTimeout to ensure the DOM has updated before scrolling
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = 0;
        }
      }
    }, 50);
  }, [currentSubstep]);

  const renderCurrentStep = () => {
    switch (currentSubstep) {
      case "discovery":
        return <CompetitorDiscovery />;
      case "takeaways":
        return <KeyTakeaways />;
      case "trends":
        return <TrendsPatterns />;
      case "landscape":
        return <LandscapeCanvas />;
      case "review":
        return <InsightDigest />;
      default:
        return <CompetitorDiscovery />;
    }
  };

  const navigateToStep = (stepId: string) => {
    navigate(`/step/3/${stepId}`);
  };
  
  const toggleSecondaryInsights = () => {
    setShowSecondaryInsights(!showSecondaryInsights);
  };

  const toggleAIPanel = () => {
    setShowAIPanel(!showAIPanel);
  };

  // Get AI context based on current substep
  const getAIContext = () => {
    switch (currentSubstep) {
      case "discovery":
        return "Competition Discovery";
      case "takeaways":
        return "Competitor Takeaways";
      case "trends":
        return "Industry Trends";
      case "landscape":
        return "Market Landscape";
      case "review":
        return "Competition Insights";
      default:
        return "Competition Analysis";
    }
  };

  // Get suggested prompts based on current substep
  const getSuggestedPrompts = () => {
    switch (currentSubstep) {
      case "discovery":
        return [
          "How do I prioritize competitors?",
          "What types of competitors should I include?",
          "How many direct competitors do I need?"
        ];
      case "takeaways":
        return [
          "How do I assess competitor strengths?",
          "What makes a takeaway worth saving?",
          "How can I use these insights in my strategy?"
        ];
      case "trends":
        return [
          "Which trends are most relevant for my industry?",
          "How do I spot emerging patterns?",
          "What makes a trend worth following?"
        ];
      case "landscape":
        return [
          "How should I position my brand on the map?",
          "What are good axes to use?",
          "How do I identify white space opportunities?"
        ];
      case "review":
        return [
          "How do I synthesize these insights?",
          "What should I prioritize in my strategy?",
          "What's the next step after competition analysis?"
        ];
      default:
        return [
          "Help me analyze my competition",
          "What should I look for in competitors?",
          "How can I use these insights?"
        ];
    }
  };

  // Determine if the current step is landscape to apply different styling
  const isLandscapeStep = currentSubstep === "landscape";

  return (
    <AudienceProvider>
      <CompetitionProvider>
        {/* Add toast handler component */}
        <OfflineToast />
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <CompetitionHeader 
            currentStep={currentStepIndex} 
            steps={subSteps} 
            onToggleSecondaryInsights={toggleSecondaryInsights} 
          />
          
          <ScrollArea 
            className={`flex-1 ${isLandscapeStep ? 'px-[120px]' : 'container max-w-5xl mx-auto px-6'} pt-8 pb-24`}
            ref={scrollAreaRef}
          >
            <motion.div 
              className="min-h-[calc(100vh-20rem)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              key={currentSubstep}
              ref={contentRef}
            >
              {renderCurrentStep()}
            </motion.div>
          </ScrollArea>
          
          <CompetitionFooter 
            currentStep={currentStepIndex} 
            steps={subSteps} 
            onNavigate={navigateToStep} 
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
          
          <SecondaryInsightPool 
            isOpen={showSecondaryInsights} 
            onClose={() => setShowSecondaryInsights(false)} 
          />
        </div>
      </CompetitionProvider>
    </AudienceProvider>
  );
};

export default CompetitionPage;
