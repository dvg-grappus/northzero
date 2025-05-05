
import React from "react";
import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export const Steps: React.FC<StepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          className={`w-3 h-3 rounded-full transition-colors ${
            index === currentStep 
              ? "bg-black" 
              : index < currentStep 
              ? "bg-cyan" 
              : "bg-transparent border border-gray-400"
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: index === currentStep ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
};
