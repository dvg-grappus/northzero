
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudience } from "@/providers/AudienceProvider";

interface CohortCanvasProps {
  onComplete: () => void;
}

const DEMO_TAGS = [
  { id: "t1", label: "Gen-Z parents" },
  { id: "t2", label: "Mid-career creators" },
  { id: "t3", label: "Urban professionals" },
  { id: "t4", label: "Tech enthusiasts" },
  { id: "t5", label: "Digital nomads" },
  { id: "t6", label: "Startup founders" },
  { id: "t7", label: "Remote workers" },
  { id: "t8", label: "Design professionals" },
  { id: "t9", label: "Content creators" },
  { id: "t10", label: "Early adopters" },
  { id: "t11", label: "Productivity seekers" },
  { id: "t12", label: "Career transitioners" },
  { id: "t13", label: "Wellness-focused" },
  { id: "t14", label: "Sustainability-minded" },
  { id: "t15", label: "Community builders" },
  { id: "t16", label: "Small business owners" },
  { id: "t17", label: "Learning enthusiasts" },
  { id: "t18", label: "Side-hustlers" },
  { id: "t19", label: "Creative professionals" },
  { id: "t20", label: "Project managers" },
  { id: "t21", label: "Digital minimalists" },
  { id: "t22", label: "Team leaders" },
  { id: "t23", label: "Knowledge workers" },
  { id: "t24", label: "Budget-conscious" },
];

const CohortCanvas: React.FC<CohortCanvasProps> = ({ onComplete }) => {
  const { filters, updateFilters, selectedTags, toggleTag } = useAudience();
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulating cohort generation when sliders change
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [filters]);
  
  const handleSliderChange = (filter: keyof typeof filters, values: number[]) => {
    updateFilters(filter, [values[0], values[1]]);
  };
  
  const validationPassed = selectedTags.length >= 3;
  
  const formatSliderValue = (min: number, max: number) => {
    return `${min} - ${max}`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Who matters most?</h1>
        <p className="text-muted-foreground">Sketch the contours of your market in broad strokes.</p>
      </motion.div>
      
      <div className="flex gap-8">
        {/* Demographic sliders panel */}
        <div className="w-[40%]">
          <h3 className="text-xl font-semibold mb-6">Demographics</h3>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Age span</span>
                <span className="text-sm font-medium">
                  {formatSliderValue(filters.age[0], filters.age[1])}
                </span>
              </div>
              <Slider
                defaultValue={[filters.age[0], filters.age[1]]}
                min={18}
                max={65}
                step={1}
                onValueChange={(values) => handleSliderChange("age", values)}
                className="my-6"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Income tier ($k)</span>
                <span className="text-sm font-medium">
                  {formatSliderValue(filters.income[0], filters.income[1])}
                </span>
              </div>
              <Slider
                defaultValue={[filters.income[0], filters.income[1]]}
                min={20}
                max={200}
                step={5}
                onValueChange={(values) => handleSliderChange("income", values)}
                className="my-6"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Geography spread</span>
                <span className="text-sm font-medium">
                  {filters.geography[0] === filters.geography[1] 
                    ? (filters.geography[0] < 5 ? "Local" : (filters.geography[0] < 8 ? "National" : "Global")) 
                    : `${filters.geography[0]}-${filters.geography[1]}`}
                </span>
              </div>
              <Slider
                defaultValue={[filters.geography[0], filters.geography[1]]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => handleSliderChange("geography", values)}
                className="my-6"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tech affinity</span>
                <span className="text-sm font-medium">
                  {filters.techAffinity[0] === filters.techAffinity[1]
                    ? (filters.techAffinity[0] < 4 ? "Low" : (filters.techAffinity[0] < 7 ? "Medium" : "High"))
                    : `${filters.techAffinity[0]}-${filters.techAffinity[1]}`}
                </span>
              </div>
              <Slider
                defaultValue={[filters.techAffinity[0], filters.techAffinity[1]]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => handleSliderChange("techAffinity", values)}
                className="my-6"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Purchase frequency</span>
                <span className="text-sm font-medium">
                  {filters.purchaseFrequency[0] === filters.purchaseFrequency[1]
                    ? (filters.purchaseFrequency[0] < 4 ? "Rare" : (filters.purchaseFrequency[0] < 7 ? "Occasional" : "Frequent"))
                    : `${filters.purchaseFrequency[0]}-${filters.purchaseFrequency[1]}`}
                </span>
              </div>
              <Slider
                defaultValue={[filters.purchaseFrequency[0], filters.purchaseFrequency[1]]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => handleSliderChange("purchaseFrequency", values)}
                className="my-6"
              />
            </div>
          </div>
        </div>
        
        {/* Tag cloud panel */}
        <div className="w-[56%]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Demographic & Psychographic Tags</h3>
            <span className="text-sm text-muted-foreground">Selected: {selectedTags.length}/24</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {DEMO_TAGS.map((tag) => (
              <motion.button
                key={tag.id}
                className={`py-2 px-4 rounded-full border text-sm transition-all ${
                  selectedTags.includes(tag.id)
                    ? "bg-cyan text-background border-cyan"
                    : "bg-transparent border-border/50 hover:border-border"
                }`}
                onClick={() => toggleTag(tag.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {tag.label}
              </motion.button>
            ))}
          </div>
          
          {isLoading && (
            <div className="mt-8 p-4 text-center">
              <div className="inline-block h-6 w-6 border-2 border-t-cyan rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-muted-foreground">Generating tags based on your selections...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-16">
        <div className="text-sm text-muted-foreground">
          {!validationPassed && "Select at least 3 tags to continue"}
          {validationPassed && "Ready to continue"}
        </div>
        <Button 
          onClick={onComplete}
          disabled={!validationPassed}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Narrow cohorts →
        </Button>
      </div>
    </motion.div>
  );
};

export default CohortCanvas;
