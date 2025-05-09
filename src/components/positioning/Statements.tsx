
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StepNavBar from "./StepNavBar";
import { PositioningContext } from "@/contexts/PositioningContext";
import ExternalPositioningBuilder from "./ExternalPositioningBuilder";

const mockStatements = [
  {
    title: "Design democratized",
    description: "Professional branding without the professional price tag."
  },
  {
    title: "Beyond templates, beyond generic",
    description: "Your brand story deserves more than a cookie-cutter solution."
  },
  {
    title: "Empowering the non-designer",
    description: "Achieve pro-level branding without the design degree."
  },
  {
    title: "From strategy to system",
    description: "The only platform that builds your brand from the inside out."
  },
  {
    title: "Brand beautifully, brand simply",
    description: "Complex branding made refreshingly straightforward."
  }
];

interface TokenChipProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TokenChip: React.FC<TokenChipProps> = ({ 
  text, 
  isSelected, 
  onClick,
  disabled = false
}) => {
  return (
    <motion.button
      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : disabled 
            ? "bg-muted text-muted-foreground cursor-not-allowed" 
            : "bg-accent hover:bg-accent/80 text-accent-foreground"
      }`}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
    >
      {text}
    </motion.button>
  );
};

interface StatementCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const StatementCard: React.FC<StatementCardProps> = ({
  title,
  description,
  isSelected,
  onClick
}) => {
  return (
    <Card 
      className={`w-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-cyan shadow-lg" : "hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="text-[28px] font-bold mb-2 leading-tight">{title}</h3>
        <p className="text-[14px] text-gray-600">{description}</p>
        
        {isSelected && (
          <div className="absolute top-3 right-3 bg-cyan text-black text-xs px-2 py-1 rounded-full">
            Selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Statements: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { 
    selectedGoldenCircle,
    selectedValues,
    pinnedDifferentiators,
    internalStatement,
    setInternalStatement,
    selectedExternalStatement,
    setSelectedExternalStatement,
    setPositioningComplete
  } = useContext(PositioningContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [externalStatements, setExternalStatements] = useState<typeof mockStatements>([]);
  
  const [tokenOptions, setTokenOptions] = useState<Record<string, string[]>>({
    WHAT: [
      "A brand identity system generator",
      "An AI branding platform"
    ],
    HOW: [
      "Through AI-powered creative assistance",
      "With step-by-step guided pathways"
    ],
    WHO: ["startups", "solopreneurs"],
    WHERE: ["digital platforms", "emerging markets"],
    WHY: [
      "To democratize professional design",
      "To transform brand creation"
    ],
    WHEN: ["rapid digital transformation", "growing design awareness"]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setExternalStatements(mockStatements);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTokenSelect = (type: string, token: string) => {
    if (internalStatement[type] === token) {
      setInternalStatement(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
      return;
    }
    
    setInternalStatement(prev => ({
      ...prev,
      [type]: token
    }));
  };
  
  const handleExternalStatementSelect = (statement: { title: string, description: string }) => {
    setSelectedExternalStatement(
      selectedExternalStatement === JSON.stringify(statement) 
        ? "" 
        : JSON.stringify(statement)
    );
  };
  
  const shuffleInternalStatement = () => {
    const newStatement: Record<string, string> = {};
    
    Object.entries(tokenOptions).forEach(([type, tokens]) => {
      if (tokens.length > 0) {
        const randomIndex = Math.floor(Math.random() * tokens.length);
        newStatement[type] = tokens[randomIndex];
      }
    });
    
    setInternalStatement(newStatement);
  };
  
  const getFormattedInternalStatement = () => {
    const template = "The only WHAT that HOW for WHO, mostly in WHERE, because WHY, in an era of WHEN.";
    
    return template.replace(/WHAT|HOW|WHO|WHERE|WHY|WHEN/g, match => {
      return internalStatement[match] || `[${match}]`;
    });
  };
  
  const handleComplete = () => {
    setPositioningComplete(true);
    navigate("/timeline", { state: { fromPositioning: true } });
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
          Lock words that rally your team and convince the world.
        </motion.p>
        
        <motion.h1
          className="text-[32px] font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Positioning Statements
        </motion.h1>
        
        <motion.section
          className="bg-card p-6 rounded-lg shadow-sm mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Internal Positioning</h2>
            <Button 
              onClick={shuffleInternalStatement} 
              variant="outline"
              className="flex items-center gap-2 bg-background text-foreground hover:bg-accent"
            >
              <span>Shuffle</span>
              <span className="text-lg">🔄</span>
            </Button>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md mb-6">
            <p className="text-sm text-muted-foreground mb-1">Onliness Formula</p>
            <p className="font-medium text-foreground">
              The only <span className="font-bold">WHAT</span> that <span className="font-bold">HOW</span> for <span className="font-bold">WHO</span>, 
              mostly in <span className="font-bold">WHERE</span>, because <span className="font-bold">WHY</span>, 
              in an era of <span className="font-bold">WHEN</span>.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            {Object.entries(tokenOptions).map(([type, tokens]) => (
              <div key={type} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm text-muted-foreground">{type}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {internalStatement[type] ? '✓' : '…'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tokens.map((token, idx) => (
                    <TokenChip 
                      key={idx} 
                      text={token} 
                      isSelected={internalStatement[type] === token}
                      onClick={() => handleTokenSelect(type, token)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground mb-1">Preview:</p>
            <p className="text-lg text-foreground">{getFormattedInternalStatement()}</p>
          </div>
        </motion.section>
        
        <motion.section
          className="bg-card p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-6 text-foreground">External Positioning</h2>
          <ExternalPositioningBuilder 
            onStatementChange={statement => setSelectedExternalStatement(statement)}
          />
        </motion.section>
      </div>
      
      <StepNavBar 
        title="Positioning Statements"
        nextButtonLabel="Publish Positioning →"
        onNext={handleComplete}
      />
    </>
  );
};

export default Statements;
