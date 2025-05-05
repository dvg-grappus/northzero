
import React, { useState, useEffect } from "react";

interface PositioningContextType {
  briefContext: string;
  setBriefContext: React.Dispatch<React.SetStateAction<string>>;
  selectedGoldenCircle: {
    why: string[];
    how: string[];
    what: string[];
  };
  setSelectedGoldenCircle: React.Dispatch<React.SetStateAction<{
    why: string[];
    how: string[];
    what: string[];
  }>>;
  selectedOpportunities: string[];
  setSelectedOpportunities: React.Dispatch<React.SetStateAction<string[]>>;
  selectedChallenges: string[];
  setSelectedChallenges: React.Dispatch<React.SetStateAction<string[]>>;
  roadmapMilestones: Record<string, string[]>;
  setRoadmapMilestones: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  pinnedDifferentiators: string[];
  setPinnedDifferentiators: React.Dispatch<React.SetStateAction<string[]>>;
  internalStatement: Record<string, string>;
  setInternalStatement: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedExternalStatement: string;
  setSelectedExternalStatement: React.Dispatch<React.SetStateAction<string>>;
  positioningComplete: boolean;
  setPositioningComplete: React.Dispatch<React.SetStateAction<boolean>>;
  activeStep: string;
  setActiveStep: React.Dispatch<React.SetStateAction<string>>;
  completeStep: (step: string) => void;
  completedSteps: string[];
  openSteps: string[];
  setOpenSteps: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PositioningContext = React.createContext<PositioningContextType>({
  briefContext: "",
  setBriefContext: () => {},
  selectedGoldenCircle: { why: [], how: [], what: [] },
  setSelectedGoldenCircle: () => {},
  selectedOpportunities: [],
  setSelectedOpportunities: () => {},
  selectedChallenges: [],
  setSelectedChallenges: () => {},
  roadmapMilestones: {},
  setRoadmapMilestones: () => {},
  selectedValues: [],
  setSelectedValues: () => {},
  pinnedDifferentiators: [],
  setPinnedDifferentiators: () => {},
  internalStatement: {},
  setInternalStatement: () => {},
  selectedExternalStatement: "",
  setSelectedExternalStatement: () => {},
  positioningComplete: false,
  setPositioningComplete: () => {},
  activeStep: "brief",
  setActiveStep: () => {},
  completeStep: () => {},
  completedSteps: [],
  openSteps: [],
  setOpenSteps: () => {}
});

export const usePositioning = () => {
  const context = React.useContext(PositioningContext);
  if (!context) {
    throw new Error("usePositioning must be used within a PositioningProvider");
  }
  return context;
};
