
import React from "react";
import { motion } from "framer-motion";

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="fixed right-6 bottom-6 w-12 h-12 bg-black/80 text-white rounded-full shadow-lg flex items-center justify-center text-xl font-semibold z-50 border border-white/10 backdrop-blur-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-cyan/40"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      ?
    </motion.button>
  );
};

export default HelpButton;
