
import React from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketHeaderProps {
  completedSections: number[];
  onToggleInsightPool: () => void;
}

export const MarketHeader: React.FC<MarketHeaderProps> = ({ 
  completedSections,
  onToggleInsightPool
}) => {
  return (
    <motion.div 
      className="sticky top-0 z-10 h-16 bg-background/90 backdrop-blur-md border-b border-border/40 px-[120px] flex items-center justify-between"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-xl font-semibold">Market Research</h1>
      
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onToggleInsightPool}
        >
          <Globe className="h-4 w-4" />
          <span>Market Insight Pool</span>
        </Button>
        
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                completedSections.includes(step) 
                  ? "bg-cyan" 
                  : "bg-transparent border border-gray-400"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
