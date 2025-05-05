
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface StepNavBarProps {
  title?: string;
  nextStep?: string;
  nextButtonLabel?: string;
  isButtonDisabled?: boolean;
  onNext?: () => void;
}

const StepNavBar: React.FC<StepNavBarProps> = ({
  title,
  nextStep,
  nextButtonLabel = "Next",
  isButtonDisabled = false,
  onNext
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onNext) {
      onNext();
    }
    
    if (nextStep) {
      if (nextStep === "/timeline") {
        // Pass state to indicate we're coming from positioning
        navigate(nextStep, { state: { fromPositioning: true } });
      } else {
        navigate(nextStep);
      }
    }
  };
  
  return (
    <div className="mt-8 flex justify-end">
      <Button
        onClick={handleClick}
        className="bg-white text-black hover:bg-gray-100 transition-colors"
        disabled={isButtonDisabled}
      >
        {nextButtonLabel}
      </Button>
    </div>
  );
};

export default StepNavBar;
