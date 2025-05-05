
import React from "react";
import { motion } from "framer-motion";

interface TimelineTopBarProps {
  currentStep?: number;
  completedSteps?: number[];
}

const TimelineTopBar: React.FC<TimelineTopBarProps> = ({ currentStep, completedSteps }) => {
  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-[50px] bg-background/80 backdrop-blur-sm z-30 px-[40px] flex items-center"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan rounded-full"></div>
        <h1 className="inter-font text-[18px] font-medium tracking-wide text-foreground/90">
          North of Zero
        </h1>
      </div>
    </motion.div>
  );
};

export default TimelineTopBar;
