
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";

const mockPairs = [
  {
    competitor: "Use conventional design tools with generic templates",
    differentiator: "The only design automation platform that provides brand-specific customization for solopreneurs."
  },
  {
    competitor: "Offer one-size-fits-all branding solutions",
    differentiator: "The only AI branding tool that preserves human creative direction while automating technical execution."
  },
  {
    competitor: "Focus only on visual deliverables",
    differentiator: "The only identity generator that builds complete systems from strategy through assets, not just logos."
  },
  {
    competitor: "Rely on fully automated processes",
    differentiator: "The only design platform that provides real-time collaboration between AI and human decision makers."
  },
  {
    competitor: "Work in isolation from business strategy",
    differentiator: "The only brand toolkit that guides users through strategic positioning before visualizing solutions."
  },
  {
    competitor: "Provide basic design tools for professionals only",
    differentiator: "The only design solution that adapts to user skill level from beginner to professional."
  },
  {
    competitor: "Separate brand voice from visual identity",
    differentiator: "The only brand system creator that emphasizes voice and messaging equal to visual elements."
  },
  {
    competitor: "Charge per revision or iteration",
    differentiator: "The only identity platform that allows unlimited revisions without cost penalties."
  }
];

interface StickyNoteProps {
  content: string;
  isPinned: boolean;
  onTogglePin: () => void;
  index: number;
  isCompetitor?: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({ 
  content, 
  isPinned, 
  onTogglePin,
  index,
  isCompetitor = false
}) => {
  return (
    <motion.div
      className={`p-6 rounded-lg cursor-pointer relative h-full ${
        isPinned ? "bg-[#FFEB3B] shadow-lg ring-2 ring-[#FFEB3B]/50" : "bg-[#FFEB3B]"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <p className="text-black text-sm mb-10">{content}</p>
      
      <button
        className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full ${
          isPinned 
            ? "bg-black text-white" 
            : "bg-white text-black hover:bg-gray-100"
        }`}
        onClick={onTogglePin}
      >
        {isPinned ? "📌 Pinned" : "Pin"}
      </button>
    </motion.div>
  );
};

const Differentiators: React.FC = () => {
  const { pinnedDifferentiators, setPinnedDifferentiators, completeStep } = useContext(PositioningContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [pairs, setPairs] = useState<typeof mockPairs>([]);
  const [pinnedCompetitors, setPinnedCompetitors] = useState<string[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPairs(mockPairs);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleToggleCompetitor = (competitor: string) => {
    setPinnedCompetitors(prev => {
      if (prev.includes(competitor)) {
        return prev.filter(c => c !== competitor);
      }
      return [...prev, competitor];
    });
  };

  const handleToggleDifferentiator = (differentiator: string) => {
    setPinnedDifferentiators(prev => {
      if (prev.includes(differentiator)) {
        return prev.filter(d => d !== differentiator);
      }
      return [...prev, differentiator];
    });
  };
  
  const handleComplete = () => {
    completeStep("differentiators");
  };
  
  return (
    <>
      <div className="col-span-12">
        <motion.p
          className="text-gray-500 text-sm mb-1 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Why you, not the rest.
        </motion.p>
        
        <motion.h1
          className="text-[32px] font-bold mb-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Key Differentiators
        </motion.h1>
        
        <motion.p 
          className="text-center text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Pin your top differentiators.
        </motion.p>
        
        {isLoading ? (
          <div className="flex flex-col items-center mt-8">
            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
            <p className="text-gray-500 mt-4">Still shaping ideas... one second.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">While others...</h2>
              <div className="grid grid-rows-8 gap-4">
                {pairs.map((pair, index) => (
                  <div key={index} className="h-[180px]">
                    <StickyNote
                      content={pair.competitor}
                      isPinned={pinnedCompetitors.includes(pair.competitor)}
                      onTogglePin={() => handleToggleCompetitor(pair.competitor)}
                      index={index}
                      isCompetitor={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">We are the only...</h2>
              <div className="grid grid-rows-8 gap-4">
                {pairs.map((pair, index) => (
                  <div key={index} className="h-[180px]">
                    <StickyNote
                      content={pair.differentiator}
                      isPinned={pinnedDifferentiators.includes(pair.differentiator)}
                      onTogglePin={() => handleToggleDifferentiator(pair.differentiator)}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-right">
        <Button
          onClick={handleComplete}
          className="bg-white text-black hover:bg-gray-100 transition-colors"
        >
          Craft statements
        </Button>
      </div>
    </>
  );
};

export default Differentiators;
