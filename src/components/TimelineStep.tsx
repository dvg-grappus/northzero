import React from 'react';
import { Step, TimelineStepState } from '@/types/timeline';
import { useTimeline } from '@/contexts/TimelineProvider';

interface TimelineStepProps {
  step: Step;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({ step }) => {
  const { setCurrentStep } = useTimeline();

  // Debug log for state
  console.log(`[TimelineStep] Rendering step: ${step.title}, state: ${step.state}`);

  const getButtonText = (state: TimelineStepState): string => {
    switch (state) {
      case 'locked':
        return '🔒 Locked';
      case 'ready':
        return 'Begin';
      case 'in-progress':
        return 'Continue';
      case 'completed':
        return 'Review';
      default:
        return 'Begin';
    }
  };

  const isButtonDisabled = (state: TimelineStepState): boolean => {
    return state === 'locked';
  };

  const handleStepClick = () => {
    if (!isButtonDisabled(step.state)) {
      setCurrentStep(step);
    } else {
      console.log(`[TimelineStep] Attempted to click locked step: ${step.title}`);
    }
  };

  return (
    <div className={`flex items-center space-x-4 p-4 bg-white rounded-lg shadow ${
      step.state === 'locked' ? 'opacity-75' : ''
    }`}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{step.title}</h3>
        <p className="text-gray-600">{step.description}</p>
      </div>
      <button
        onClick={handleStepClick}
        disabled={isButtonDisabled(step.state)}
        className={`px-4 py-2 rounded-md transition-colors ${
          isButtonDisabled(step.state)
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {getButtonText(step.state)}
      </button>
    </div>
  );
}; 