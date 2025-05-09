
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import StickyNote from "./StickyNote";
import StepNavBar from "./StepNavBar";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";

const mockIdeas = {
  why: [
    "To democratize professional design tools",
    "To empower non-designers with agency",
    "To make branding accessible to all",
    "To revolutionize creative workflows",
    "To bridge the design equality gap",
    "To enable brand innovation for everyone"
  ],
  how: [
    "Through AI-powered creative assistance",
    "With step-by-step guided pathways",
    "Using pre-validated design patterns",
    "By automating complex design tasks",
    "Through intuitive brand building tools",
    "With collaborative design workflows"
  ],
  what: [
    "A brand identity system generator",
    "An AI branding platform",
    "A visual identity automation suite",
    "A design democratization tool",
    "A brand strategy assistant",
    "An automated brand builder"
  ]
};

const GoldenCircle: React.FC = () => {
  const { selectedGoldenCircle, setSelectedGoldenCircle, completeStep } = useContext(PositioningContext);
  const [activeSegment, setActiveSegment] = useState<'why' | 'how' | 'what'>('why');
  const [discardedIdeas, setDiscardedIdeas] = useState<string[]>([]);

  const handleSegmentClick = (segment: 'why' | 'how' | 'what') => {
    setActiveSegment(segment);
  };

  const handleSelect = (type: 'why' | 'how' | 'what', idea: string) => {
    setSelectedGoldenCircle(prev => ({
      ...prev,
      [type]: prev[type].includes(idea) 
        ? prev[type].filter(i => i !== idea)
        : [...prev[type], idea]
    }));
  };

  const handleDiscard = (idea: string) => {
    setDiscardedIdeas(prev => [...prev, idea]);
  };

  const handleComplete = () => {
    if (completeStep) {
      completeStep("golden-circle");
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        className="text-[24px] font-bold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Golden Circle
      </motion.h2>
      
      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Start with purpose, not outputs.
      </motion.p>
      
      <div className="flex flex-col md:flex-row justify-center items-start gap-6">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <g onClick={() => handleSegmentClick('why')}>
              <circle
                cx="140"
                cy="140"
                r="100"
                fill={activeSegment === 'why' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="140"
                cy="140"
                r="100"
                fill="transparent"
                stroke={activeSegment === 'why' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="140"
                y="60"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'why' ? "#888888" : "#999999"}
                className="font-semibold text-xl transition-colors duration-300 pointer-events-none"
              >
                WHY
              </text>
            </g>
            
            <g onClick={() => handleSegmentClick('how')}>
              <circle
                cx="140"
                cy="140"
                r="65"
                fill={activeSegment === 'how' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="140"
                cy="140"
                r="65"
                fill="transparent"
                stroke={activeSegment === 'how' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="140"
                y="95"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'how' ? "#888888" : "#999999"}
                className="font-semibold text-xl transition-colors duration-300 pointer-events-none"
              >
                HOW
              </text>
            </g>
            
            <g onClick={() => handleSegmentClick('what')}>
              <circle
                cx="140"
                cy="140"
                r="30"
                fill={activeSegment === 'what' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="140"
                cy="140"
                r="30"
                fill="transparent"
                stroke={activeSegment === 'what' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="140"
                y="140"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'what' ? "#888888" : "#999999"}
                className="font-semibold text-xl transition-colors duration-300 pointer-events-none"
              >
                WHAT
              </text>
            </g>
          </svg>
          <p className="text-sm text-muted-foreground mt-4">Tap on a circle to switch</p>
        </div>
        
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-medium mb-4 text-left">
            {activeSegment.toUpperCase()} Statements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockIdeas[activeSegment]
              .filter(idea => !discardedIdeas.includes(idea))
              .map((idea, index) => (
                <motion.div
                  key={`${activeSegment}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <StickyNote
                    id={`${activeSegment}-${index}`}
                    content={idea}
                    isSelected={selectedGoldenCircle[activeSegment].includes(idea)}
                    isDiscarded={false}
                    onClick={() => handleSelect(activeSegment, idea)}
                    onDiscard={() => handleDiscard(idea)}
                    className="h-[150px] w-[120px]"
                  />
                </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleComplete}
          className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
        >
          Complete & Continue
        </Button>
      </div>
    </div>
  );
};

export default GoldenCircle;
