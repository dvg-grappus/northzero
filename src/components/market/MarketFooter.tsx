
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/providers/MarketProvider";
import { Progress } from "@/components/ui/progress";

interface MarketFooterProps {
  completedSections: number[];
  onShowInsightDigest: () => void;
  onModuleComplete: () => void;
}

export const MarketFooter: React.FC<MarketFooterProps> = ({ 
  completedSections,
  onShowInsightDigest,
  onModuleComplete
}) => {
  // Calculate progress percentage
  const progressPercentage = (completedSections.length / 3) * 100;
  
  return (
    <motion.div
      className="fixed bottom-0 inset-x-0 h-16 bg-background/90 backdrop-blur-md border-t border-border/40 px-6 md:px-8 lg:px-[120px] flex items-center justify-between z-10"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="text-sm text-muted-foreground">
          {completedSections.length}/3 sections completed
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 w-[200px] bg-background"
        />
      </div>
      
      <Button
        onClick={onShowInsightDigest}
        className="bg-cyan hover:bg-cyan/90 text-black"
      >
        Publish market insights →
      </Button>
    </motion.div>
  );
};
