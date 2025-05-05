
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, SparklesIcon, BotIcon, GamepadIcon, UsersIcon, HeartIcon, StarIcon, MicIcon, MapPinIcon, AwardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCompetition } from "@/providers/CompetitionProvider";

// Map string icon names to actual icons
const iconMap: Record<string, React.ReactNode> = {
  "sparkles": <SparklesIcon className="h-5 w-5" />,
  "bot": <BotIcon className="h-5 w-5" />,
  "gamepad": <GamepadIcon className="h-5 w-5" />,
  "users": <UsersIcon className="h-5 w-5" />,
  "heart": <HeartIcon className="h-5 w-5" />,
  "star": <StarIcon className="h-5 w-5" />,
  "mic": <MicIcon className="h-5 w-5" />,
  "map-pin": <MapPinIcon className="h-5 w-5" />,
  "award": <AwardIcon className="h-5 w-5" />
};

interface TrendCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  accepted: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const TrendCard: React.FC<TrendCardProps> = ({ 
  id, 
  title, 
  description, 
  icon,
  accepted,
  onAccept,
  onReject
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <motion.div 
      className={`bg-card rounded-lg p-5 h-[180px] border transition-colors ${
        accepted ? "border-cyan/50 bg-cyan/5" : "border-border"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center">
            {iconMap[icon] || <SparklesIcon className="h-5 w-5" />}
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground flex-1">
          {description}
        </p>
        
        <AnimatePresence>
          {(isHovering || accepted) && (
            <motion.div 
              className="flex justify-end gap-2 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {!accepted ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={onReject}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 gap-1"
                    onClick={onAccept}
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                </>
              ) : (
                <div className="text-xs text-cyan flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Added to insights
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface CustomTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrend: (title: string, description: string, icon: string) => void;
}

const CustomTrendModal: React.FC<CustomTrendModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddTrend 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sparkles");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) return;
    
    onAddTrend(title, description, selectedIcon);
    
    // Reset form
    setTitle("");
    setDescription("");
    setSelectedIcon("sparkles");
    
    onClose();
  };
  
  const availableIcons = [
    "sparkles", "bot", "gamepad", "users", "heart", 
    "star", "mic", "map-pin", "award"
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Trend</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Trend title
            </label>
            <Input
              placeholder="e.g. Micro-learning modules"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Input
              placeholder="e.g. Short, focused learning segments of 5-10 minutes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {availableIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`h-8 w-8 rounded-md flex items-center justify-center ${
                    selectedIcon === icon 
                      ? "bg-cyan text-background" 
                      : "bg-secondary/50 text-foreground"
                  }`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {iconMap[icon]}
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !description.trim()}>
              Add Trend
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const TrendsPatterns: React.FC = () => {
  const { trends, acceptTrend, rejectTrend, addCustomTrend } = useCompetition();
  const [isAddingCustomTrend, setIsAddingCustomTrend] = useState(false);
  
  const acceptedCount = trends.filter(trend => trend.accepted).length;

  return (
    <div>
      {/* Section tabs */}
      <div className="flex items-center border-b border-border/60 mb-10">
        <button 
          className="px-4 py-3 text-muted-foreground"
        >
          Takeaways
        </button>
        <button 
          className="px-4 py-3 border-b-2 border-cyan text-foreground"
        >
          Trends & Patterns
        </button>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Industry Trends</h2>
        <div className="text-sm text-muted-foreground">
          {acceptedCount} of {trends.length} trends accepted
        </div>
      </div>
      
      {/* Trends grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {trends.map(trend => (
          <TrendCard
            key={trend.id}
            id={trend.id}
            title={trend.title}
            description={trend.description}
            icon={trend.icon}
            accepted={trend.accepted}
            onAccept={() => acceptTrend(trend.id)}
            onReject={() => rejectTrend(trend.id)}
          />
        ))}
      </div>
      
      {/* Add custom trend button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => setIsAddingCustomTrend(true)} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add custom trend
        </Button>
      </div>
      
      {/* Custom trend modal */}
      <CustomTrendModal 
        isOpen={isAddingCustomTrend}
        onClose={() => setIsAddingCustomTrend(false)}
        onAddTrend={addCustomTrend}
      />
    </div>
  );
};
