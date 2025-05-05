
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      className="fixed top-[88px] right-0 bottom-0 w-[320px] bg-gray-900/90 backdrop-blur-md border-l border-white/10 shadow-lg z-40 p-6 overflow-y-auto"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-xl text-white">Brand Builder Help</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-6">
        <section>
          <h4 className="font-semibold text-lg mb-2 text-white">What you'll do</h4>
          <p className="text-gray-300">
            Create a comprehensive brand system by moving through 14 focused modules. Each step builds on the previous ones to create a cohesive brand identity.
          </p>
        </section>
        
        <section>
          <h4 className="font-semibold text-lg mb-2 text-white">Example deliverables</h4>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>Brand positioning statement</li>
            <li>Audience personas</li>
            <li>Competitive analysis</li>
            <li>Visual identity system</li>
            <li>Brand voice guidelines</li>
            <li>Complete asset library</li>
            <li>Brand book PDF</li>
          </ul>
        </section>
        
        <section>
          <h4 className="font-semibold text-lg mb-2 text-white">Estimated effort</h4>
          <p className="text-gray-300">
            Total time: Approximately 50 minutes for all modules.
          </p>
          <p className="text-gray-300 mt-2">
            You can complete them in one session or spread them out. Your progress is saved automatically.
          </p>
        </section>
        
        <section>
          <h4 className="font-semibold text-lg mb-2 text-white">Keyboard shortcuts</h4>
          <ul className="text-gray-300 space-y-1">
            <li><kbd className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">⌘ + 1-14</kbd> Jump to step</li>
            <li><kbd className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">?</kbd> Toggle help</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
};

export default HelpDrawer;
