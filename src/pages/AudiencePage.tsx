import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import TimelineTopBar from "@/components/TimelineTopBar";
import StepProgress from "@/components/StepProgress";
import OfflineToast from "@/components/OfflineToast";
import InsightPoolDrawer from "@/components/audience/InsightPoolDrawer";
import { AudienceProvider } from "@/providers/AudienceProvider";
import { Lightbulb } from "lucide-react";

// Import all sub-step components
import MacroLandscape from "@/components/audience/MacroLandscape";
import CohortBoard from "@/components/audience/CohortBoard";
import PersonaGallery from "@/components/audience/PersonaGallery";
import PersonaDetail from "@/components/audience/PersonaDetail";
import SimulationHub from "@/components/audience/SimulationHub";
import InsightReview from "@/components/audience/InsightReview";

const AudienceContent = () => {
  const { substep, personaId } = useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("cohort-canvas");
  const [currentSubStep, setCurrentSubStep] = useState<string>("cohort-canvas");

  // Update current step when route changes
  useEffect(() => {
    if (substep) {
      setCurrentStep(substep);
      setCurrentSubStep(substep);
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

  // Determine which component to render based on the substep
  const renderSubStep = () => {
    if (personaId) {
      // Always render PersonaDetail if personaId is present in URL
      return (
        <div>
          <PersonaDetail 
            personaId={personaId} 
            onBack={() => navigate("/step/2/persona-gallery")} 
          />
        </div>
      );
    }
    
    switch (currentSubStep) {
      case "cohort-canvas":
        return (
          <div>
            <MacroLandscape onComplete={() => { completeStep("cohort-canvas"); goToNextStep(); }} />
          </div>
        );
      case "cohort-board":
        return (
          <div>
            <CohortBoard onComplete={() => { completeStep("cohort-board"); goToNextStep(); }} />
          </div>
        );
      case "persona-gallery":
        return (
          <div>
            <PersonaGallery onComplete={() => { completeStep("persona-gallery"); goToNextStep(); }} />
          </div>
        );
      case "simulations":
        return (
          <div>
            <SimulationHub onComplete={() => { completeStep("simulations"); goToNextStep(); }} />
          </div>
        );
      case "insight-review":
        return (
          <div>
            <InsightReview onComplete={() => { completeStep("insight-review"); goToNextStep(); }} />
          </div>
        );
      default:
        return (
          <div>
            <MacroLandscape onComplete={() => { completeStep("cohort-canvas"); goToNextStep(); }} />
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center py-8">
      <h1 className="text-2xl font-semibold mb-8">Audience</h1>
      <div className="w-full flex flex-col items-center">
          {renderSubStep()}
      </div>
    </div>
  );
};

const AudiencePage = () => (
  <AudienceProvider>
    <AudienceContent />
  </AudienceProvider>
);

export default AudiencePage;
