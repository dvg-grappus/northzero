
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCompetition } from "@/providers/CompetitionProvider";

interface Step {
  id: string;
  label: string;
}

interface CompetitionFooterProps {
  steps: Step[];
  currentStep: number;
  onNavigate: (stepId: string) => void;
}

export const CompetitionFooter: React.FC<CompetitionFooterProps> = ({ 
  steps, 
  currentStep, 
  onNavigate 
}) => {
  const { 
    selectedCompetitors, 
    takeaways, 
    trends, 
    brandPosition,
    completeModule
  } = useCompetition();
  
  const getNextButtonState = () => {
    // Guard against invalid currentStep index
    if (currentStep < 0 || currentStep >= steps.length) {
      return {
        label: "Next →",
        disabled: true,
        action: () => {}
      };
    }

    const isLastStep = currentStep === steps.length - 1;
    const currentStepId = steps[currentStep].id;
    
    // Validation logic for each step
    switch (currentStepId) {
      case "discovery":
        // Need at least 6 competitors selected
        return {
          label: "Confirm list →",
          disabled: selectedCompetitors.length < 6,
          action: () => onNavigate("takeaways")
        };
      case "takeaways":
        // Need at least 4 saved takeaways
        const savedTakeaways = takeaways.filter(t => t.saved).length;
        return {
          label: "Switch to trends →",
          disabled: savedTakeaways < 4,
          action: () => onNavigate("trends")
        };
      case "trends":
        // Need at least 5 accepted trends
        const acceptedTrends = trends.filter(t => t.accepted).length;
        return {
          label: "Map the landscape →",
          disabled: acceptedTrends < 5,
          action: () => onNavigate("landscape")
        };
      case "landscape":
        // No validation for landscape step
        return {
          label: "Finalise map →",
          disabled: false, // Always enabled
          action: () => onNavigate("review")
        };
      case "review":
        // Complete the module
        return {
          label: "Publish competition insights →",
          disabled: false,
          action: completeModule
        };
      default:
        return {
          label: "Next →",
          disabled: true,
          action: () => {}
        };
    }
  };
  
  const nextButton = getNextButtonState();
  
  return (
    <motion.div
      className="fixed bottom-0 inset-x-0 h-20 bg-background/80 backdrop-blur-sm border-t border-border/40 px-[120px] flex items-center justify-between"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Button
        variant="ghost"
        onClick={() => {
          if (currentStep > 0 && currentStep < steps.length) {
            onNavigate(steps[currentStep - 1].id);
          }
        }}
        disabled={currentStep <= 0}
      >
        ← Back
      </Button>
      
      <Button
        onClick={nextButton.action}
        disabled={nextButton.disabled}
      >
        {nextButton.label}
      </Button>
    </motion.div>
  );
};
