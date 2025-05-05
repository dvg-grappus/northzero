
import React from "react";

interface CarouselControlsProps {
  activeIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  activeIndex,
  totalSteps,
  onPrevious,
  onNext
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-muted-foreground flex items-center space-x-2">
      <span>Use</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="m7 15 5 5 5-5"/>
        <path d="m7 9 5-5 5 5"/>
      </svg>
      <span>keys or mousewheel to navigate</span>
    </div>
  );
};

export default CarouselControls;
