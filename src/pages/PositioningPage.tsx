
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TimelineTopBar from "@/components/TimelineTopBar";
import BriefIntake from "@/components/positioning/BriefIntake";
import PositioningStep from "@/components/positioning/PositioningStep";
import GoldenCircle from "@/components/positioning/GoldenCircle";
import OpportunitiesChallenges from "@/components/positioning/OpportunitiesChallenges";
import Values from "@/components/positioning/Values";
import Roadmap from "@/components/positioning/Roadmap";
import Differentiators from "@/components/positioning/Differentiators";
import Statements from "@/components/positioning/Statements";
import FloatingAIPanel, { TalkToAIButton } from "@/components/FloatingAIPanel";
import { PositioningProvider } from "@/providers/PositioningProvider";
import { usePositioning } from "@/contexts/PositioningContext";
import { STEP_CONFIG } from "@/config/stepConfig";

// Helper component to add AI buttons to each step
interface AIHelpButtonProps {
  stepId: string;
  onOpenAI: (context: string) => void;
}

const AIHelpButton: React.FC<AIHelpButtonProps> = ({ stepId, onOpenAI }) => {
  // Map step IDs to readable names for the AI context
  const stepContextMap = {
    'brief': 'Brand Brief',
    'golden-circle': 'Golden Circle',
    'opportunities-challenges': 'Opportunities & Challenges',
    'values': 'Brand Values',
    'roadmap': 'Brand Roadmap',
    'differentiators': 'Differentiators',
    'statements': 'Positioning Statements'
  };

  const context = stepContextMap[stepId as keyof typeof stepContextMap] || 'Positioning';

  return (
    <div className="mt-4 mb-2">
      <TalkToAIButton 
        context={context} 
        onClick={() => onOpenAI(context)}
      />
    </div>
  );
};

// Wrapper component that provides the positioning context
const PositioningPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeStep, 
    openSteps, 
    setOpenSteps,
    completedSteps,
    completeStep,
    positioningComplete
  } = usePositioning();

  // AI Assistant state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPanelContext, setAIPanelContext] = useState('');
  const [aiSuggestedPrompts, setAISuggestedPrompts] = useState<string[]>([]);

  const handleToggleStep = (stepId: string) => {
    setOpenSteps(prev => 
      prev.includes(stepId)
        ? prev.filter(step => step !== stepId)
        : [...prev, stepId]
    );
  };

  useEffect(() => {
    if (positioningComplete) {
      navigate('/timeline', { state: { fromPositioning: true } });
    }
  }, [positioningComplete, navigate]);

  const handleCompleteStep = () => {
    navigate('/timeline', { state: { fromPositioning: true } });
  };

  // Handle opening the AI panel with context-specific prompts
  const handleOpenAIPanel = (context: string) => {
    setAIPanelContext(context);
    
    // Set suggested prompts based on the current step
    let prompts: string[] = [];
    
    switch (activeStep) {
      case 'brief':
        prompts = [
          "Make my brief more concise",
          "Elaborate more on my target audience",
          "Make it more inspiring"
        ];
        break;
      case 'golden-circle':
        prompts = [
          "Help with my WHY statement",
          "Generate more HOW options",
          "Refine my WHAT descriptions"
        ];
        break;
      case 'opportunities-challenges':
        prompts = [
          "Identify more market opportunities",
          "Help prioritize challenges",
          "Reframe challenges as opportunities"
        ];
        break;
      case 'values':
        prompts = [
          "Make values more distinctive",
          "Suggest actionable values",
          "Make values more memorable"
        ];
        break;
      case 'roadmap':
        prompts = [
          "Create shorter milestones",
          "Make goals more measurable",
          "Help prioritize roadmap items"
        ];
        break;
      case 'differentiators':
        prompts = [
          "Make differentiators more tangible",
          "Focus more on customer value",
          "Sharpen contrast with competitors"
        ];
        break;
      case 'statements':
        prompts = [
          "Make statement more specific",
          "Simplify my positioning",
          "Add more audience focus"
        ];
        break;
      default:
        prompts = [
          "Suggest improvements",
          "Refine my strategy",
          "Get feedback on my approach"
        ];
    }
    
    setAISuggestedPrompts(prompts);
    setIsAIPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-foreground">
      <TimelineTopBar currentStep={1} completedSteps={[]} />
      
      <div className="pt-[88px] px-6 md:px-[60px] lg:px-[120px] pb-20">
        <h1 className="text-[32px] font-bold mb-6">Positioning Module</h1>
        
        <div className="max-w-3xl mx-auto">
          {STEP_CONFIG.map((step, index) => (
            <PositioningStep
              key={step.id}
              id={step.id}
              title={step.name}
              index={index}
              isCompleted={completedSteps.includes(step.id)}
              isActive={activeStep === step.id}
              isOpen={openSteps.includes(step.id)}
              canOpen={
                completedSteps.includes(step.id) ||
                activeStep === step.id ||
                index === 0
              }
              onToggle={() => handleToggleStep(step.id)}
            >
              <AIHelpButton stepId={step.id} onOpenAI={handleOpenAIPanel} />
              
              {step.id === 'brief' && <BriefIntake onComplete={() => completeStep('brief')} />}
              {step.id === 'golden-circle' && <GoldenCircle />}
              {step.id === 'opportunities-challenges' && <OpportunitiesChallenges />}
              {step.id === 'values' && <Values />}
              {step.id === 'roadmap' && <Roadmap />}
              {step.id === 'differentiators' && <Differentiators />}
              {step.id === 'statements' && <Statements />}
            </PositioningStep>
          ))}
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleCompleteStep}
              className="bg-cyan text-black hover:bg-cyan/90"
            >
              Complete and continue →
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating AI Assistant Panel */}
      <FloatingAIPanel 
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        context={aiPanelContext}
        suggestedPrompts={aiSuggestedPrompts}
      />
    </div>
  );
};

// Wrapper component that provides the positioning context
const PositioningPage: React.FC = () => {
  return (
    <PositioningProvider>
      <PositioningPageContent />
    </PositioningProvider>
  );
};

export default PositioningPage;
