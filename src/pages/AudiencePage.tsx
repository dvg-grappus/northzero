
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import TimelineTopBar from "@/components/TimelineTopBar";
import StepProgress from "@/components/StepProgress";
import OfflineToast from "@/components/OfflineToast";
import InsightPoolDrawer from "@/components/audience/InsightPoolDrawer";
import { AudienceProvider } from "@/providers/AudienceProvider";
import { Lightbulb } from "lucide-react";
import FloatingAIPanel, { TalkToAIButton } from "@/components/FloatingAIPanel";

// Import all sub-step components
import CohortCanvas from "@/components/audience/CohortCanvas";
import CohortBoard from "@/components/audience/CohortBoard";
import PersonaGallery from "@/components/audience/PersonaGallery";
import PersonaDetail from "@/components/audience/PersonaDetail";
import SimulationHub from "@/components/audience/SimulationHub";
import InsightReview from "@/components/audience/InsightReview";

// Define audience AI context suggestions based on current step
const ASSISTANT_CONTEXT: Record<string, {
  context: string;
  suggestedPrompts: string[];
}> = {
  "cohort-canvas": {
    context: "Cohort Targeting",
    suggestedPrompts: [
      "Widen age range",
      "Suggest psychographics",
      "Help narrow my focus"
    ]
  },
  "cohort-board": {
    context: "Cohort Selection",
    suggestedPrompts: [
      "Pick fastest-growing cohort",
      "Help identify high LTV segments",
      "Show cohort sources"
    ]
  },
  "persona-gallery": {
    context: "Persona Creation",
    suggestedPrompts: [
      "Generate alternative persona",
      "Compare two personas",
      "Highlight key differences"
    ]
  },
  "simulations": {
    context: "Persona Simulations",
    suggestedPrompts: [
      "Suggest conversation topic",
      "Add third persona",
      "Summarize insights"
    ]
  },
  "insight-review": {
    context: "Insight Analysis",
    suggestedPrompts: [
      "Merge similar insights",
      "Rank by business impact",
      "Extract key themes"
    ]
  }
};

const AudienceContent = () => {
  const { substep, personaId } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("cohort-canvas");
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiContext, setAiContext] = useState("Audience Targeting");
  const [aiSuggestedPrompts, setAiSuggestedPrompts] = useState<string[]>([]);

  // Update current step when route changes
  useEffect(() => {
    if (substep) {
      setCurrentStep(substep);
      
      // Update AI context based on step
      if (ASSISTANT_CONTEXT[substep]) {
        setAiContext(ASSISTANT_CONTEXT[substep].context);
        setAiSuggestedPrompts(ASSISTANT_CONTEXT[substep].suggestedPrompts);
      }
    }
  }, [substep]);

  // Mark a step as completed
  const completeStep = (stepName: string) => {
    if (!completedSteps.includes(stepName)) {
      setCompletedSteps(prev => [...prev, stepName]);
    }
  };

  // Navigate to the next step
  const goToNextStep = () => {
    const steps = [
      "cohort-canvas",
      "cohort-board",
      "persona-gallery",
      "simulations",
      "insight-review"
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      navigate(`/step/2/${nextStep}`);
    } else {
      // Complete the audience module and go back to timeline
      navigate("/timeline", { state: { fromAudience: true } });
    }
  };

  // Toggle the insight drawer
  const toggleInsightDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  // Open AI panel with context
  const handleOpenAIPanel = () => {
    setIsAIPanelOpen(true);
  };

  // Determine which component to render based on the substep
  const renderSubStep = () => {
    if (personaId) {
      // Always render PersonaDetail if personaId is present in URL
      return (
        <div>
          <div className="flex justify-end mb-4">
            <TalkToAIButton context="Persona Details" onClick={handleOpenAIPanel} />
          </div>
          <PersonaDetail 
            personaId={personaId} 
            onBack={() => navigate("/step/2/persona-gallery")} 
          />
        </div>
      );
    }
    
    switch (substep) {
      case "cohort-canvas":
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <CohortCanvas onComplete={() => { completeStep("cohort-canvas"); goToNextStep(); }} />
          </div>
        );
      case "cohort-board":
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <CohortBoard onComplete={() => { completeStep("cohort-board"); goToNextStep(); }} />
          </div>
        );
      case "persona-gallery":
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <PersonaGallery onComplete={() => { completeStep("persona-gallery"); goToNextStep(); }} />
          </div>
        );
      case "simulations":
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <SimulationHub onComplete={() => { completeStep("simulations"); goToNextStep(); }} />
          </div>
        );
      case "insight-review":
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <InsightReview onComplete={() => { completeStep("insight-review"); goToNextStep(); }} />
          </div>
        );
      default:
        return (
          <div>
            <div className="flex justify-end mb-4">
              <TalkToAIButton context={aiContext} onClick={handleOpenAIPanel} />
            </div>
            <CohortCanvas onComplete={() => { completeStep("cohort-canvas"); goToNextStep(); }} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-12">
      <TimelineTopBar currentStep={2} completedSteps={[1]} />
      <OfflineToast />
      
      <StepProgress currentStep="audience" />
      
      <motion.button
        className="fixed top-28 right-6 z-50 w-12 h-12 bg-secondary/80 text-secondary-foreground rounded-full shadow-md flex items-center justify-center text-xl font-semibold border border-border/40 backdrop-blur-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={toggleInsightDrawer}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Lightbulb size={20} />
      </motion.button>
      
      <div className="flex px-8 pt-[96px]">
        {/* Center the content */}
        <div className="w-full max-w-4xl mx-auto">
          {renderSubStep()}
        </div>
      </div>
      
      {/* Insight Pool Drawer */}
      <InsightPoolDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Floating AI Assistant Panel */}
      <FloatingAIPanel 
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        context={aiContext}
        suggestedPrompts={aiSuggestedPrompts}
      />
    </div>
  );
};

const AudiencePage = () => (
  <AudienceProvider>
    <AudienceContent />
  </AudienceProvider>
);

export default AudiencePage;
