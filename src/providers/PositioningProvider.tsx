import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PositioningContext } from "@/contexts/PositioningContext";
import { STEP_CONFIG } from "@/config/stepConfig";

export const PositioningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [briefContext, setBriefContext] = useState<string>("");
  const [selectedGoldenCircle, setSelectedGoldenCircle] = useState<{
    why: string[];
    how: string[];
    what: string[];
  }>({
    why: [],
    how: [],
    what: [],
  });
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  
  // Initialize roadmap milestones with empty arrays for each timeline point
  const [roadmapMilestones, setRoadmapMilestones] = useState<Record<string, string[]>>(() => {
    const timelinePoints = ["Now", "1 yr", "3 yr", "5 yr", "10 yr"];
    const initialMilestones: Record<string, string[]> = {};
    
    // Initialize empty arrays for each timeline point
    timelinePoints.forEach(point => {
      initialMilestones[point] = [];
    });
    
    return initialMilestones;
  });
  
  // Initialize values with the mock data
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  // Initialize differentiators with the mock data
  const [pinnedDifferentiators, setPinnedDifferentiators] = useState<string[]>([]);
  
  const [internalStatement, setInternalStatement] = useState<Record<string, string>>({
    "WHAT": "",
    "HOW": "",
    "WHY": "",
    "WHO": "innovators and creative thinkers",
    "WHERE": "professional environments",
    "WHEN": "the digital transformation era"
  });
  
  const [selectedExternalStatement, setSelectedExternalStatement] = useState<string>("");
  const [positioningComplete, setPositioningComplete] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<string>("brief");
  const [completedSteps, setCompletedSteps] = useState<string[]>(["brief"]);
  const [openSteps, setOpenSteps] = useState<string[]>(["brief"]);
  
  const navigate = useNavigate();

  const completeStep = (step: string) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
      
      const currentIndex = STEP_CONFIG.findIndex(s => s.id === step);
      if (currentIndex < STEP_CONFIG.length - 1) {
        const nextStep = STEP_CONFIG[currentIndex + 1].id;
        setActiveStep(nextStep);
        
        const nextOpenSteps = [nextStep];
        setOpenSteps(nextOpenSteps);
      } else {
        setPositioningComplete(true);
        toast.success("Positioning module completed!");
        navigate("/timeline");
      }
    }
  };

  return (
    <PositioningContext.Provider value={{
      briefContext,
      setBriefContext,
      selectedGoldenCircle,
      setSelectedGoldenCircle,
      selectedOpportunities,
      setSelectedOpportunities,
      selectedChallenges,
      setSelectedChallenges,
      roadmapMilestones,
      setRoadmapMilestones,
      selectedValues,
      setSelectedValues,
      pinnedDifferentiators,
      setPinnedDifferentiators,
      internalStatement,
      setInternalStatement,
      selectedExternalStatement,
      setSelectedExternalStatement,
      positioningComplete,
      setPositioningComplete,
      activeStep,
      setActiveStep,
      completeStep,
      completedSteps,
      openSteps,
      setOpenSteps
    }}>
      {children}
    </PositioningContext.Provider>
  );
};