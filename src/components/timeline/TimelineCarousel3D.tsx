
import React from "react";
import { Step } from "@/types/timeline";
import { CarouselProps } from "@/types/carousel";
import CarouselControls from "./CarouselControls";
import TimelineCardList from "./TimelineCardList";
import { useCarouselNavigation } from "@/hooks/useCarouselNavigation";

const TimelineCarousel3D: React.FC<CarouselProps> = ({ steps, onBegin }) => {
  // Log component rendering
  console.log("TimelineCarousel3D rendering with", steps.length, "steps");
  
  // Use the hook at the top level
  const {
    activeIndex,
    isAnimating,
    containerRef,
    goToCard,
    handleKeyDown,
    handleTouchStart,
    handleTouchEnd
  } = useCarouselNavigation({
    totalItems: steps.length,
    animationDuration: 300
  });
  
  const handleBeginClick = (id: number) => {
    console.log("Begin clicked for step ID:", id);
    onBegin(id);
  };
  
  return (
    <div 
      className="w-full h-[700px] relative" 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ 
        perspective: '1500px',
        touchAction: 'none',
        overflow: 'visible',
        outline: 'none',
      }}
    >
      <TimelineCardList 
        steps={steps}
        activeIndex={activeIndex}
        onCardClick={goToCard}
        onBeginClick={handleBeginClick}
      />
      
      <CarouselControls 
        activeIndex={activeIndex}
        totalSteps={steps.length}
        onPrevious={() => !isAnimating && goToCard(Math.max(0, activeIndex - 1))}
        onNext={() => !isAnimating && goToCard(Math.min(steps.length - 1, activeIndex + 1))}
      />
    </div>
  );
};

export default TimelineCarousel3D;
