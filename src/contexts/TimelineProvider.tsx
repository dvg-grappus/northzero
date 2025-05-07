import React, { createContext, useContext, useState, useEffect } from 'react';
import { Step, TimelineStepState } from '@/types/timeline';

interface TimelineContextType {
  steps: Step[];
  currentStep: Step | null;
  setCurrentStep: (step: Step) => void;
  updateStepState: (stepId: string, state: TimelineStepState) => void;
  getStepState: (stepId: string) => TimelineStepState;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

const initialSteps: Step[] = [
  {
    id: 'positioning',
    title: 'Positioning',
    description: 'Define your brand\'s unique position in the market',
    state: 'ready'
  },
  {
    id: 'audience',
    title: 'Audience',
    description: 'Understand and segment your target audience',
    state: 'locked'
  },
  {
    id: 'messaging',
    title: 'Messaging',
    description: 'Craft compelling messages for your audience',
    state: 'locked'
  }
];

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);

  useEffect(() => {
    console.log('[TimelineProvider] Steps state updated:', steps);
  }, [steps]);

  const updateStepState = (stepId: string, state: TimelineStepState) => {
    console.log(`[TimelineProvider] updateStepState called for stepId=${stepId}, state=${state}`);
    setSteps(prevSteps => {
      // If Positioning is completed, unlock Audience
      if (stepId === 'positioning' && state === 'completed') {
        return prevSteps.map(step => {
          if (step.id === 'audience' && step.state === 'locked') {
            return { ...step, state: 'ready' };
          }
          if (step.id === stepId) {
            return { ...step, state };
          }
          return step;
        });
      }
      // Otherwise, just update the step state
      return prevSteps.map(step =>
        step.id === stepId ? { ...step, state } : step
      );
    });
  };

  const getStepState = (stepId: string): TimelineStepState => {
    const step = steps.find(s => s.id === stepId);
    console.log(`[TimelineProvider] getStepState for stepId=${stepId}:`, step?.state);
    return step?.state || 'locked';
  };

  const handleSetCurrentStep = (step: Step) => {
    console.log(`[TimelineProvider] handleSetCurrentStep called for step:`, step);
    if (step.state !== 'locked') {
      setCurrentStep(step);
    } else {
      console.log('[TimelineProvider] Attempted to set a locked step as current. Ignored.');
    }
  };

  return (
    <TimelineContext.Provider value={{
      steps,
      currentStep,
      setCurrentStep: handleSetCurrentStep,
      updateStepState,
      getStepState
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}; 