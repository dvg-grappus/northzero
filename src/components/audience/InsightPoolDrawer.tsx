
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudience, Insight } from "@/providers/AudienceProvider";
import { X } from "lucide-react";

interface InsightPoolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const { rateInsight } = useAudience();
  
  return (
    <div className="bg-[#222] rounded-lg p-4 mb-4 w-[280px]">
      <div className="flex items-start mb-2">
        <div 
          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
            insight.isSystemGenerated ? "bg-green-500" : "bg-purple-500"
          }`}
        />
        <p className="text-sm text-foreground ml-2">{insight.text}</p>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>{insight.source}</span>
        
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => rateInsight(insight.id, star)}
              className={`${
                (insight.rating || 0) >= star ? "text-yellow-500" : "text-gray-500"
              } hover:text-yellow-500 transition-colors`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const InsightPoolDrawer: React.FC<InsightPoolDrawerProps> = ({ isOpen, onClose }) => {
  const { insights } = useAudience();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 bottom-0 w-[340px] bg-[#1B1B1B] shadow-lg z-50 overflow-y-auto border-r border-border/40"
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center">
                  <span className="w-3 h-3 bg-cyan rounded-full mr-2"></span>
                  Insight Pool ({insights.length})
                </h2>
                <button 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InsightPoolDrawer;
