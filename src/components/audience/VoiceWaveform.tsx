
import React from "react";
import { motion } from "framer-motion";

const VoiceWaveform: React.FC = () => {
  return (
    <motion.div 
      className="mt-3 flex justify-center items-center h-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-end space-x-1 h-full">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-cyan rounded-full"
            animate={{
              height: [4, Math.random() * 16 + 8, 4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default VoiceWaveform;
