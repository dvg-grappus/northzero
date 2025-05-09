import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shuffle } from "lucide-react";

interface StatementPart {
  category: string;
  options: string[];
}

const statementParts: StatementPart[] = [
  {
    category: "Value Proposition",
    options: [
      "Empowering creativity",
      "Simplifying complexity",
      "Transforming ideas",
      "Accelerating innovation"
    ]
  },
  {
    category: "Core Benefit",
    options: [
      "without the learning curve",
      "at lightning speed",
      "with unmatched precision",
      "through AI-powered insights"
    ]
  },
  {
    category: "Target Outcome",
    options: [
      "to stand out in crowded markets",
      "to scale with confidence",
      "to capture market share",
      "to build lasting brands"
    ]
  }
];

interface TokenSelectProps {
  category: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ category, options, selected, onSelect }) => (
  <div className="mb-6">
    <h3 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? "default" : "outline"}
          className={`text-sm ${selected === option ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  </div>
);

interface ExternalPositioningBuilderProps {
  onStatementChange: (statement: string) => void;
}

const ExternalPositioningBuilder: React.FC<ExternalPositioningBuilderProps> = ({ onStatementChange }) => {
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});

  const handleShuffle = () => {
    const newParts: Record<string, string> = {};
    statementParts.forEach(part => {
      const randomIndex = Math.floor(Math.random() * part.options.length);
      newParts[part.category] = part.options[randomIndex];
    });
    setSelectedParts(newParts);
    
    if (Object.keys(newParts).length === statementParts.length) {
      const fullStatement = statementParts
        .map(part => newParts[part.category])
        .filter(Boolean)
        .join(" ");
      onStatementChange(fullStatement);
    }
  };

  const handleSelect = (category: string, value: string) => {
    const newParts = { ...selectedParts, [category]: value };
    setSelectedParts(newParts);

    if (Object.keys(newParts).length === statementParts.length) {
      const fullStatement = statementParts
        .map(part => newParts[part.category])
        .filter(Boolean)
        .join(" ");
      onStatementChange(fullStatement);
    }
  };

  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Build Your Statement</h2>
          <Button 
            onClick={handleShuffle}
            variant="outline"
            className="flex items-center gap-2 bg-background text-foreground hover:bg-accent"
          >
            <span>Shuffle</span>
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        
        {statementParts.map((part) => (
          <TokenSelect
            key={part.category}
            category={part.category}
            options={part.options}
            selected={selectedParts[part.category] || ""}
            onSelect={(value) => handleSelect(part.category, value)}
          />
        ))}
        
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium text-muted-foreground mb-2">Preview:</p>
          <p className="text-lg font-medium text-foreground">
            {Object.keys(selectedParts).length === statementParts.length 
              ? statementParts.map(part => selectedParts[part.category]).join(" ")
              : "Complete your statement by selecting one option from each category..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalPositioningBuilder;
