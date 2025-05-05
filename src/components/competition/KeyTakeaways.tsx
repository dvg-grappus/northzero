
import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trash, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetition } from "@/providers/CompetitionProvider";

interface TakeawayCardProps {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  source: string;
  sourceIcon: string;
  category: string;
  saved: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onRegenerate: () => void;
}

const TakeawayCard: React.FC<TakeawayCardProps> = ({
  id,
  title,
  description,
  screenshot,
  source,
  sourceIcon,
  category,
  saved,
  onSave,
  onDiscard,
  onRegenerate
}) => {
  return (
    <motion.div
      className={`w-[300px] bg-card rounded-lg border overflow-hidden ${
        saved ? 'border-cyan/60' : 'border-border'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
      layoutId={`takeaway-${id}`}
    >
      {/* Screenshot thumbnail */}
      <div className="h-[120px] bg-muted/40 relative overflow-hidden">
        <img 
          src={screenshot} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-card/80 backdrop-blur-sm">
          {category}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-secondary"></div>
          <span className="text-xs text-muted-foreground">{source}</span>
        </div>
      </div>
      
      {/* Actions */}
      {!saved ? (
        <div className="p-3 pt-0 flex items-center gap-2">
          <Button 
            className="flex-1 gap-1" 
            size="sm"
            onClick={onSave}
          >
            <Check className="h-3 w-3" />
            Save
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={onDiscard}
          >
            <Trash className="h-3 w-3" />
            Discard
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onRegenerate}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="p-3 pt-0">
          <div className="text-xs text-center text-emerald-500">
            ✓ Saved to insight pool
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const KeyTakeaways: React.FC = () => {
  const { 
    takeaways, 
    saveTakeaway, 
    discardTakeaway, 
    regenerateTakeaway,
    fetchMoreTakeaways
  } = useCompetition();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const filteredTakeaways = takeaways.filter(takeaway => {
    if (!activeFilter) return true;
    return takeaway.category === activeFilter;
  });
  
  const filterOptions = [
    "UX idea",
    "Product wedge", 
    "Growth tactic", 
    "Brand move"
  ];

  return (
    <div>
      {/* Section tabs */}
      <div className="flex items-center border-b border-border/60 mb-10">
        <button 
          className="px-4 py-3 border-b-2 border-cyan text-foreground"
        >
          Takeaways
        </button>
        <button 
          className="px-4 py-3 text-muted-foreground"
        >
          Trends & Patterns
        </button>
      </div>
      
      {/* Header + filters */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={fetchMoreTakeaways}
        >
          <Plus className="h-4 w-4" />
          Fetch 5 more
        </Button>
        
        <div className="flex items-center gap-2">
          {filterOptions.map(option => (
            <Button
              key={option}
              variant={activeFilter === option ? "default" : "secondary"}
              size="sm"
              className={`text-xs ${
                activeFilter === option ? "" : "bg-secondary/50 hover:bg-secondary/80"
              }`}
              onClick={() => setActiveFilter(prev => prev === option ? null : option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Masonry grid of takeaway cards */}
      <div className="grid grid-cols-3 gap-4">
        {filteredTakeaways.map(takeaway => (
          <TakeawayCard
            key={takeaway.id}
            id={takeaway.id}
            title={takeaway.title}
            description={takeaway.description}
            screenshot={takeaway.screenshot}
            source={takeaway.source}
            sourceIcon={takeaway.sourceIcon}
            category={takeaway.category}
            saved={takeaway.saved}
            onSave={() => saveTakeaway(takeaway.id)}
            onDiscard={() => discardTakeaway(takeaway.id)}
            onRegenerate={() => regenerateTakeaway(takeaway.id)}
          />
        ))}
        
        {filteredTakeaways.length === 0 && (
          <div className="col-span-3 py-12 text-center">
            <p className="text-muted-foreground">No takeaways found with the current filter.</p>
            <Button 
              variant="link" 
              onClick={() => setActiveFilter(null)}
              className="mt-2"
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
