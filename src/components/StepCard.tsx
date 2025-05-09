
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StepCardProps {
  id: number;
  title: string;
  description: string;
  duration: string;
  index: number;
  onView: (id: number) => void;
  onBegin: (id: number) => void;
}

const StepCard: React.FC<StepCardProps> = ({ 
  id, 
  title, 
  description, 
  duration, 
  index,
  onView,
  onBegin
}) => {
  const navigate = useNavigate();
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          if (!inView && entries[0].intersectionRatio >= 0.6) {
            onView(id);
          }
        }
      },
      { threshold: 0.6 }
    );

    const currentElement = document.getElementById(`step-card-${id}`);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [id, onView, inView]);

  const handleButtonClick = () => {
    onBegin(id);
    
    // All steps now navigate directly without preview state
    document.querySelectorAll('.step-card:not(.step-card-' + id + ')').forEach(card => {
      (card as HTMLElement).style.opacity = '0.3';
      (card as HTMLElement).style.filter = 'blur(10px)';
    });
    
    setTimeout(() => {
      // Add debug logs to help track navigation
      console.log(`Navigating from step ${id} button click`);
      
      // Navigation logic for each step
      if (id === 1) {
        // Direct navigation for positioning
        console.log('Navigating to positioning: /step/1');
        navigate('/step/1');
      } else if (id === 6) {
        console.log('Navigating to moodboards: /step/5/attributes');
        navigate('/step/5/attributes');
      } else if (id === 5) {
        navigate(`/step/4/archetype`);
      } else if (id === 7) {
        console.log('Navigating to stylescapes: /step/6/craft');
        navigate(`/step/6/craft`);
      } else {
        navigate(`/step/${id}`);
      }
    }, 300);
  };
  
  const keyboardShortcut = `⌘ + ${id}`;

  return (
    <TooltipProvider>
      <motion.div
        id={`step-card-${id}`}
        className={cn(
          "step-card relative mb-6 transition-all duration-300", 
          `step-card-${id}`
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.03, 
          duration: 0.6,
          ease: "easeOut" 
        }}
        whileHover={{ y: -6 }}
      >
        {/* Card Spine/Line */}
        <div className="absolute left-[32px] top-0 bottom-0 w-0.5 bg-muted/70"></div>
        
        {/* Card Container */}
        <div className="ml-16 w-[560px] bg-card rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border/50">
          <div className="flex justify-between items-start mb-3">
            {/* Title Section */}
            <div className="flex items-start gap-4">
              {/* Marker Circle - Always showing cyan checkmark */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute left-[32px] -translate-x-1/2 top-6 w-6 h-6 rounded-full flex items-center justify-center border border-muted/50 bg-background z-10">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-cyan">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="text-xs font-medium">{keyboardShortcut}</span>
                </TooltipContent>
              </Tooltip>
              
              {/* Title and Description */}
              <div className="flex-1">
                <h3 className="inter-font font-semibold text-[22px] mb-2 text-foreground">{title}</h3>
                <p className="inter-font text-[16px] text-muted-foreground line-clamp-2">{description}</p>
              </div>
            </div>
            
            {/* Duration Pill */}
            <div className="bg-secondary text-secondary-foreground text-[13px] px-3 py-1 rounded-full font-medium">
              {duration}
            </div>
          </div>
          
          {/* Card Footer with Button - Always "Begin" */}
          <div className="mt-4 flex justify-end">
            <button 
              className="bg-card text-foreground hover:bg-cyan hover:text-background border border-border/70 rounded-full py-2 px-8 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan/40"
              style={{ minWidth: 104, height: 40 }}
              onClick={handleButtonClick}
            >
              Begin
            </button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default StepCard;
