
import React from "react";
import { LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Steps } from "./Steps";

interface Step {
  id: string;
  label: string;
}

interface CompetitionHeaderProps {
  steps: Step[];
  currentStep: number;
  onToggleSecondaryInsights: () => void;
}

export const CompetitionHeader: React.FC<CompetitionHeaderProps> = ({ 
  steps, 
  currentStep,
  onToggleSecondaryInsights 
}) => {
  return (
    <div className="sticky top-0 z-10 h-20 bg-background/80 backdrop-blur-sm border-b border-border/40 px-[120px] flex items-center justify-between">
      <h1 className="text-xl font-semibold">Competition</h1>
      
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onToggleSecondaryInsights}
        >
          <LightbulbIcon className="h-4 w-4" />
          <span>Insight Pool</span>
        </Button>
        
        <Steps steps={steps} currentStep={currentStep} />
      </div>
    </div>
  );
};
