import React, { useState } from "react";
import { Step } from "@/types/timeline";
import { CarouselProps } from "@/types/carousel";
import TimelineCard from "./TimelineCard";

const TimelineList: React.FC<CarouselProps> = ({ steps, onBegin }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col w-full items-center justify-start py-0">
        {steps.map((step, idx) => (
          <TimelineCard
            key={step.id}
            step={step}
            onBeginClick={() => onBegin(typeof step.id === 'number' ? step.id : parseInt(step.id, 10))}
            className={
              (idx === steps.length - 1 ? 'mb-0 after:hidden' : '') +
              (idx === 0 ? ' mt-0' : '')
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineList;
