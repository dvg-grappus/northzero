import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";

const mockValues = [
  {
    value: "Integrity",
    description: "Do the right thing boldly."
  },
  {
    value: "Innovation",
    description: "Seek better ways forward always."
  },
  {
    value: "Inclusivity",
    description: "Design with everyone in mind."
  },
  {
    value: "Clarity",
    description: "Make the complex simple."
  },
  {
    value: "Craft",
    description: "Details make the difference."
  },
  {
    value: "Empathy",
    description: "Start with understanding."
  },
  {
    value: "Boldness",
    description: "Take calculated risks."
  },
  {
    value: "Sustainability",
    description: "Build for the long term."
  },
  {
    value: "Adaptability",
    description: "Evolve with purpose."
  },
  {
    value: "Collaboration",
    description: "Better together than apart."
  },
  {
    value: "Excellence",
    description: "Never settle for good enough."
  },
  {
    value: "Accessibility",
    description: "Usable by all, always."
  }
];

interface ValueCardProps {
  value: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const ValueCard: React.FC<ValueCardProps> = ({ value, description, isSelected, onClick }) => {
  return (
    <motion.div
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? "bg-cyan text-black shadow-lg ring-2 ring-cyan" 
          : "bg-[#FFE87A] text-black hover:bg-[#ffeb96] hover:-translate-y-1"
      }`}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="text-lg font-bold mb-1">{value}</h3>
      <p className="text-sm">{description}</p>
    </motion.div>
  );
};

const Values: React.FC = () => {
  const { selectedValues, setSelectedValues, completeStep } = useContext(PositioningContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState<typeof mockValues>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setValues(mockValues);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleValueSelect = (value: string) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      }
      
      if (prev.length >= 7) {
        toast.error("You can select a maximum of 7 values");
        return prev;
      }
      
      return [...prev, value];
    });
  };
  
  const validateSelection = () => {
    if (selectedValues.length < 3) {
      toast.error("Select at least 3 values");
      return false;
    }
    
    if (selectedValues.length > 7) {
      toast.error("Select at most 7 values");
      return false;
    }
    
    return true;
  };
  
  const handleComplete = () => {
    if (validateSelection()) {
      if (completeStep) {
        completeStep("values");
      }
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
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
          Choose the principles you'll never trade.
        </motion.p>
        
        <motion.h1
          className="text-[32px] font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Top Values
        </motion.h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center mt-8">
            <div className="grid grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-[120px] bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
            <p className="text-gray-500 mt-4">Still shaping ideas... one second.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <span className={`font-medium ${
                selectedValues.length < 3 ? "text-red-500" : 
                selectedValues.length > 7 ? "text-red-500" : 
                "text-green-500"
              }`}>
                {selectedValues.length} selected ({3} min, {7} max)
              </span>
            </div>
            
            <motion.div 
              className="grid grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {values.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <ValueCard 
                    value={item.value} 
                    description={item.description} 
                    isSelected={selectedValues.includes(item.value)}
                    onClick={() => handleValueSelect(item.value)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
      
      <div className="mt-6 text-right">
        <Button
          onClick={handleComplete}
          className="bg-white text-black hover:bg-gray-100 transition-colors"
        >
          Commit to values
        </Button>
      </div>
    </>
  );
};

export default Values;
