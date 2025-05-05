
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Competitor } from '@/providers/CompetitionProvider';

interface CompetitorCardProps {
  competitor: Competitor;
  isSelected: boolean;
  onClick: () => void;
  priorityLevel: number;
  onPriorityChange?: (priority: number) => void;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ 
  competitor, 
  isSelected, 
  onClick,
  priorityLevel,
  onPriorityChange
}) => {
  const handlePriorityClick = (e: React.MouseEvent, priority: number) => {
    e.stopPropagation();
    if (onPriorityChange) {
      onPriorityChange(priority);
    }
  };
  
  return (
    <motion.div
      className={`group w-full h-[120px] rounded-lg bg-muted/50 border cursor-pointer transition-all overflow-hidden relative ${
        isSelected ? 'border-cyan' : 'border-border hover:border-border/80'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: isSelected ? `0 0 ${priorityLevel}px ${priorityLevel / 2}px rgba(0, 200, 255, ${priorityLevel / 20})` : 'none'
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-secondary rounded flex-shrink-0"></div>
          <h3 className="font-medium text-foreground truncate">{competitor.name}</h3>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {competitor.tags.slice(0, 3).map((tag, i) => (
            <span 
              key={i} 
              className="px-1.5 py-0.5 text-xs bg-secondary/60 rounded text-secondary-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        {/* Priority selector */}
        {isSelected && (
          <div className="flex items-center gap-1">
            <button 
              className={`w-2 h-2 rounded-full ${priorityLevel <= 3 ? 'bg-cyan' : 'bg-muted'}`}
              onClick={(e) => handlePriorityClick(e, 3)}
            />
            <button 
              className={`w-2 h-2 rounded-full ${priorityLevel > 3 && priorityLevel <= 6 ? 'bg-cyan' : 'bg-muted'}`}
              onClick={(e) => handlePriorityClick(e, 6)}
            />
            <button 
              className={`w-2 h-2 rounded-full ${priorityLevel > 6 ? 'bg-cyan' : 'bg-muted'}`}
              onClick={(e) => handlePriorityClick(e, 9)}
            />
            <span className="text-xs ml-1 text-muted-foreground">
              {priorityLevel <= 3 ? 'Low' : priorityLevel <= 6 ? 'Med' : 'High'}
            </span>
          </div>
        )}
        
        {/* External link button */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
