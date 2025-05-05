
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface TimelineNodeProps {
  label: string;
  text: string;
  onCapture: () => void;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ label, text, onCapture }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      className="flex flex-col items-center w-full lg:w-[18%] mb-6 lg:mb-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative z-10">
        <div className="w-8 h-8 bg-cyan rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-background rounded-full"></div>
        </div>
        
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-cyan hover:text-cyan/80"
            onClick={onCapture}
          >
            <Lightbulb size={20} />
          </motion.button>
        )}
      </div>
      
      <h5 className="font-medium text-sm mt-3 mb-1">{label}</h5>
      <p className="text-xs text-muted-foreground text-center">{text}</p>
    </div>
  );
};

export default TimelineNode;
