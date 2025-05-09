
import React from "react";
import { Step } from "@/types/timeline";
import { CardStyle } from "@/types/carousel";
import TimelineCard from "./TimelineCard";
import { getCardStyle } from "@/utils/carouselStyleUtils";

interface TimelineCardListProps {
  steps: Step[];
  activeIndex: number;
  onCardClick: (index: number) => void;
  onBeginClick: (id: number) => void;
}

const TimelineCardList: React.FC<TimelineCardListProps> = ({
  steps,
  activeIndex,
  onCardClick,
  onBeginClick
}) => {
  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      {steps.map((step, index) => {
        const style = getCardStyle(index, activeIndex);
        const isActive = activeIndex === index;
        const visible = Math.abs(index - activeIndex) <= 3;
        
        if (!visible) return null;
        
        return (
          <TimelineCard
            key={step.id}
            step={step}
            isActive={isActive}
            style={style}
            onClick={() => onCardClick(index)}
            onBeginClick={() => onBeginClick(step.id)}
          />
        );
      })}
    </div>
  );
};

export default TimelineCardList;
