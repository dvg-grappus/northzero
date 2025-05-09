
import React from 'react';

interface PrioritySliderProps {
  selectedCompetitor: string | null;
  onPriorityChange: (priority: number) => void;
  currentPriority: number;
}

export const PriorityWeightingSlider: React.FC<PrioritySliderProps> = ({ 
  selectedCompetitor, 
  onPriorityChange,
  currentPriority
}) => {
  // If no competitor is selected, show disabled state
  if (!selectedCompetitor) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm text-muted-foreground mb-2">Market Impact</div>
        <div className="h-[200px] w-2 rounded-full bg-muted/50 relative">
          <div className="absolute bottom-0 left-0 right-0 h-[0%] rounded-full bg-muted/30"></div>
        </div>
        <div className="text-sm text-muted-foreground mt-2">Select a competitor</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-foreground mb-2">Market Impact</div>
      <div className="h-[200px] w-2 rounded-full bg-muted/50 relative">
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-full bg-cyan transition-all"
          style={{ 
            height: `${currentPriority * 10}%`,
          }}
        ></div>
        
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={currentPriority}
          onChange={(e) => onPriorityChange(parseInt(e.target.value))}
          className="absolute left-0 bottom-0 appearance-none w-[30px] h-[200px] rounded-full bg-transparent cursor-pointer -rotate-90 origin-bottom-left translate-y-[15px] translate-x-[-100px]"
          style={{
            WebkitAppearance: 'none',
            background: 'transparent',
          }}
        />
      </div>
      <div className="text-sm text-foreground mt-2">{currentPriority}</div>
    </div>
  );
};
