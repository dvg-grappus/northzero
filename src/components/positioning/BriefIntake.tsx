
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";

interface BriefIntakeProps {
  onComplete?: () => void;
  isValid?: boolean;
}

const BriefIntake: React.FC<BriefIntakeProps> = ({ onComplete, isValid = false }) => {
  const { briefContext, setBriefContext, completeStep } = useContext(PositioningContext);
  const [wordCount, setWordCount] = useState(() => {
    return briefContext.trim().split(/\s+/).filter(Boolean).length;
  });
  
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBriefContext(text);
    setWordCount(countWords(text));
  };
  
  // Removed word count restrictions and button disabled state
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else if (completeStep) {
      completeStep("brief");
    }
  };
  
  return (
    <div className="max-w-[800px] mx-auto">
      <motion.h2
        className="text-[24px] font-bold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        One paragraph to rule them all
      </motion.h2>
      
      <motion.p
        className="text-[16px] text-gray-600 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Tell us what you're building in 80 words or fewer.
      </motion.p>
      
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Textarea 
          value={briefContext}
          onChange={handleInputChange}
          placeholder="E.g. An AI-powered platform that…"
          className="w-full min-h-[180px] p-4 text-[16px]"
        />
        
        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
          {wordCount}/80 words
        </div>
      </motion.div>
      
      <div className="mt-6 text-right">
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

export default BriefIntake;
