import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import FloatingAIPanel from "@/components/FloatingAIPanel";
import InsightWidget from "@/components/positioning/InsightWidget";
import { PositioningProvider } from "@/providers/PositioningProvider";
import { PositioningDataProvider, usePositioningData } from "@/components/positioning/PositioningDataProvider";
import { usePositioning } from "@/contexts/PositioningContext";
import { STEP_CONFIG } from "@/config/stepConfig";
import { useProjects } from '@/contexts/ProjectsContext';
import { getLatestPositioningDocument } from '@/services/positioningService';
import ResetPositioningStateButton from '@/components/positioning/ResetPositioningStateButton';

// Wrapper component that provides the positioning context
const PositioningPageContent: React.FC = () => {
  const navigate = useNavigate();
  const positioning = usePositioning();
  const data = usePositioningData();
  const { 
    activeStep, 
    openSteps, 
    setOpenSteps,
    completedSteps,
    completeStep,
    positioningComplete
  } = positioning;
  const { getProject } = useProjects();
  const [searchParams] = useSearchParams();
  const projectId = data.projectId;
  const brief = data.brief;
  const project = projectId ? getProject(projectId) : undefined;

  // AI Assistant state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPanelContext, setAIPanelContext] = useState('');
  const [aiSuggestedPrompts, setAISuggestedPrompts] = useState<string[]>([]);

  const handleToggleStep = (stepId: string) => {
    // If the step is already open, close it
    if (openSteps.includes(stepId)) {
      setOpenSteps([]);
    } else {
      // Otherwise, close all steps and open only this one
      setOpenSteps([stepId]);
    }
  };

  useEffect(() => {
    if (positioningComplete) {
      navigate('/timeline', { state: { fromPositioning: true } });
    }
  }, [positioningComplete, navigate]);

  const handleCompleteStep = () => {
    navigate('/timeline', { state: { fromPositioning: true } });
  };

  // Function to handle step completion and advance to next step
  const handleStepComplete = (completedStepId: string) => {
    completeStep(completedStepId);
    
    // Find the index of the completed step
    const stepIndex = STEP_CONFIG.findIndex(step => step.id === completedStepId);
    
    // If there's a next step, open it
    if (stepIndex < STEP_CONFIG.length - 1) {
      const nextStepId = STEP_CONFIG[stepIndex + 1].id;
      setOpenSteps([nextStepId]);
    }
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

  // Completion logic for each step
  const isBriefComplete = positioning.briefContext.trim().length > 0;
  const isGoldenCircleComplete = positioning.selectedGoldenCircle.what.length > 0 && positioning.selectedGoldenCircle.how.length > 0 && positioning.selectedGoldenCircle.why.length > 0;
  const isOpportunitiesChallengesComplete = positioning.selectedOpportunities.length > 0 && positioning.selectedChallenges.length > 0;
  const isValuesComplete = positioning.selectedValues.length >= 3;
  const isDifferentiatorsComplete = positioning.pinnedDifferentiators.length >= 1;
  // Statements: Internal (WHAT, HOW, WHY, WHO, WHERE, WHEN), External (all statementParts)
  const internalKeys = ["WHAT", "HOW", "WHY", "WHO", "WHERE", "WHEN"];
  const isInternalStatementsComplete = internalKeys.every(key => positioning.internalStatement[key] && positioning.internalStatement[key].length > 0);
  // For external, fallback: check if selectedExternalStatement is non-empty
  // (Ideally, this should check all sub-categories, but selectedParts is not available outside Statements component)
  const isExternalStatementsComplete = positioning.selectedExternalStatement && positioning.selectedExternalStatement.length > 0;
  const isStatementsComplete = isInternalStatementsComplete && isExternalStatementsComplete;

  // Roadmap: completed if all 5 timeline slots have at least one assigned milestone
  const timelinePoints = ["Now", "1 yr", "3 yr", "5 yr", "10 yr"];
  const isRoadmapComplete = timelinePoints.every(point =>
    Array.isArray(positioning.roadmapMilestones[point]) && positioning.roadmapMilestones[point].length > 0
  );

  // Helper for status
  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'brief':
        return isBriefComplete;
      case 'golden-circle':
        return isGoldenCircleComplete;
      case 'opportunities-challenges':
        return isOpportunitiesChallengesComplete;
      case 'values':
        return isValuesComplete;
      case 'differentiators':
        return isDifferentiatorsComplete;
      case 'statements':
        return isStatementsComplete;
      case 'roadmap':
        return isRoadmapComplete;
      default:
        return false;
    }
  };

  // DEBUG: Log pinnedDifferentiators after every render
  useEffect(() => {
    console.log('[PositioningPage] pinnedDifferentiators:', positioning.pinnedDifferentiators);
  }, [positioning.pinnedDifferentiators]);

  // Determine the currently open section for the insight widget
  const currentStep = openSteps.length > 0 ? openSteps[openSteps.length - 1] : activeStep;

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-foreground">
      <div className="w-full flex justify-end items-center gap-4 px-6 md:px-[60px] lg:px-[120px] pt-4 z-20 relative" style={{ marginTop: '100px' }}>
        <InsightWidget 
          currentStep={currentStep}
          completedSteps={completedSteps}
          projectId={projectId}
          brief={brief}
        />
        {projectId && <ResetPositioningStateButton projectId={projectId} />}
      </div>
      <TimelineTopBar currentStep={1} completedSteps={[]} />
      <div className="relative pt-[88px] px-6 md:px-[60px] lg:px-[120px] pb-20">
        <h1 className="text-[32px] font-bold mb-6">Positioning Module</h1>
        
        <div className="max-w-3xl mx-auto">
          {STEP_CONFIG.map((step, index) => {
            const isCompleted = getStepStatus(step.id);
            return (
              <PositioningStep
                key={step.id}
                id={step.id}
                title={step.name}
                index={index}
                isCompleted={isCompleted}
                isActive={activeStep === step.id}
                isOpen={openSteps.includes(step.id)}
                canOpen={
                  isCompleted ||
                  activeStep === step.id ||
                  index === 0
                }
                onToggle={() => handleToggleStep(step.id)}
              >
                {step.id === 'brief' && <BriefIntake onComplete={() => handleStepComplete('brief')} />}
                {step.id === 'golden-circle' && <GoldenCircle onComplete={() => handleStepComplete('golden-circle')} />}
                {step.id === 'opportunities-challenges' && <OpportunitiesChallenges onComplete={() => handleStepComplete('opportunities-challenges')} />}
                {step.id === 'values' && <Values onComplete={() => handleStepComplete('values')} />}
                {step.id === 'roadmap' && <Roadmap onComplete={() => handleStepComplete('roadmap')} />}
                {step.id === 'differentiators' && <Differentiators onComplete={() => handleStepComplete('differentiators')} />}
                {step.id === 'statements' && <Statements onComplete={() => handleStepComplete('statements')} />}
              </PositioningStep>
            );
          })}
          
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
      <PositioningDataProvider>
        <PositioningPageContent />
      </PositioningDataProvider>
    </PositioningProvider>
  );
};

export default PositioningPage;