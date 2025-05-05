
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAudience, Cohort } from "@/providers/AudienceProvider";
import { CircleCheck, User, DollarSign, TrendingUp } from "lucide-react";

interface CohortCardProps {
  cohort: Cohort;
  onSelect: (id: string) => void;
  onDiscard: (id: string) => void;
  index: number;
}

const CohortCard: React.FC<CohortCardProps> = ({ cohort, onSelect, onDiscard, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="w-[300px] h-[260px] bg-[#2B2B2B] rounded-lg p-5 relative shadow-md"
      initial={{ 
        opacity: 0, 
        y: 50, 
        rotate: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1) 
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotate: 0,
        transition: { delay: index * 0.1 }
      }}
      whileHover={{ 
        y: -4,
        backgroundColor: "rgb(51, 51, 51)",
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3 className="text-lg font-semibold mb-2">{cohort.title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{cohort.description}</p>
      
      <div className="flex justify-between mt-auto">
        <div className="flex items-center gap-1 bg-background/20 px-2 py-1 rounded">
          <User size={14} />
          <span className="text-xs">{cohort.size}/10</span>
        </div>
        
        <div className="flex items-center gap-1 bg-background/20 px-2 py-1 rounded">
          <DollarSign size={14} />
          <span className="text-xs">{cohort.buyingPower}/10</span>
        </div>
        
        <div className="flex items-center gap-1 bg-background/20 px-2 py-1 rounded">
          <TrendingUp size={14} />
          <span className="text-xs">{cohort.growthRate}/10</span>
        </div>
      </div>
      
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <p className="font-medium mb-2">Top Pain Points</p>
            <ul className="text-sm space-y-2 text-left mx-6">
              <li>• Lack of integrated tools</li>
              <li>• Limited customization</li>
              <li>• Steep learning curve</li>
            </ul>
          </div>
        </motion.div>
      )}
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button 
          size="sm" 
          className={`rounded-full py-1 px-3 text-xs ${
            cohort.isDiscarded 
              ? "bg-border/30 text-muted-foreground" 
              : "bg-transparent border border-border hover:bg-border/30"
          }`}
          onClick={() => onDiscard(cohort.id)}
          disabled={cohort.isSelected}
        >
          Discard
        </Button>
        
        <Button 
          size="sm" 
          className={`rounded-full py-1 px-3 text-xs ${
            cohort.isSelected 
              ? "bg-cyan text-background"
              : "bg-transparent border border-border hover:bg-cyan/20"
          }`}
          onClick={() => onSelect(cohort.id)}
          disabled={cohort.isDiscarded}
        >
          Select
        </Button>
      </div>
    </motion.div>
  );
};

interface CohortBoardProps {
  onComplete: () => void;
}

const SAMPLE_COHORTS: Cohort[] = [
  {
    id: "c1",
    title: "Urban Gen-Z side-hustlers",
    description: "Young digital natives with entrepreneurial spirit and multiple income streams",
    size: 7,
    buyingPower: 5,
    growthRate: 9
  },
  {
    id: "c2",
    title: "Corporate innovators",
    description: "Mid-level managers tasked with driving innovation in large organizations",
    size: 6,
    buyingPower: 8,
    growthRate: 6
  },
  {
    id: "c3",
    title: "Creative freelancers",
    description: "Independent designers, writers and artists seeking efficient project management",
    size: 8,
    buyingPower: 6,
    growthRate: 7
  },
  {
    id: "c4",
    title: "Tech startup founders",
    description: "Early-stage entrepreneurs building scalable tech products",
    size: 5,
    buyingPower: 7,
    growthRate: 8
  },
  {
    id: "c5",
    title: "Remote team managers",
    description: "Leaders coordinating distributed teams across time zones",
    size: 6,
    buyingPower: 9,
    growthRate: 9
  },
  {
    id: "c6",
    title: "Digital marketers",
    description: "Campaign specialists seeking better analytics and workflow tools",
    size: 7,
    buyingPower: 7,
    growthRate: 6
  },
  {
    id: "c7",
    title: "Product managers",
    description: "Professionals orchestrating product development across departments",
    size: 8,
    buyingPower: 8,
    growthRate: 7
  },
  {
    id: "c8",
    title: "Small agency owners",
    description: "Boutique agency leaders balancing client work and business operations",
    size: 6,
    buyingPower: 7,
    growthRate: 5
  },
  {
    id: "c9",
    title: "Tech-savvy educators",
    description: "Teaching professionals integrating digital tools into learning environments",
    size: 9,
    buyingPower: 4,
    growthRate: 8
  }
];

const CohortBoard: React.FC<CohortBoardProps> = ({ onComplete }) => {
  const { cohorts, setCohorts, selectCohort, discardCohort } = useAudience();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load sample cohorts on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setCohorts(SAMPLE_COHORTS);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [setCohorts]);
  
  // Count the number of selected cohorts
  const selectedCount = cohorts.filter(c => c.isSelected).length;
  const actedCount = cohorts.filter(c => c.isSelected || c.isDiscarded).length;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Narrow your focus</h1>
        <p className="text-muted-foreground">Select at least 2 cohorts for detailed persona creation.</p>
      </motion.div>
      
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-2 border-t-cyan rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Generating cohort profiles based on your selections...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {cohorts.map((cohort, index) => (
            <CohortCard 
              key={cohort.id} 
              cohort={cohort} 
              onSelect={selectCohort} 
              onDiscard={discardCohort}
              index={index}
            />
          ))}
        </div>
      )}
      
      <div className="fixed bottom-8 inset-x-0 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-t border-border/40 mx-8">
        <div className="text-sm">
          {actedCount < cohorts.length && (
            <span className="text-muted-foreground">
              {`Select or discard cohorts (${actedCount}/${cohorts.length})`}
            </span>
          )}
          {selectedCount > 0 && (
            <span className="flex items-center text-cyan gap-1">
              <CircleCheck size={16} /> {`Selected cohorts: ${selectedCount}`}
            </span>
          )}
        </div>
        <Button 
          onClick={onComplete}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Lock top audiences →
        </Button>
      </div>
    </motion.div>
  );
};

export default CohortBoard;
