import React from "react";
import { motion } from "framer-motion";
import { Check, ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PositioningStepProps {
  id: string;
  title: string;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  isOpen: boolean;
  canOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const PositioningStep: React.FC<PositioningStepProps> = ({
  id,
  title,
  index,
  isCompleted,
  isActive,
  isOpen,
  canOpen,
  onToggle,
  children
}) => {
  return (
    <div className="col-span-12 mb-6">
      <Collapsible
        open={isOpen}
        onOpenChange={onToggle}
        className="w-full"
      >
        <div className="flex items-center gap-4 bg-secondary p-4 rounded-lg">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${isCompleted ? "bg-cyan text-background" : 
                isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-lg">{title}</h3>
          </div>
          <CollapsibleTrigger className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isCompleted ? "Completed" : isOpen ? "Close" : "Pending"}
            </span>
            {isOpen ? 
              <ChevronUp className={`w-5 h-5 text-foreground`} /> : 
              <ChevronDown className={`w-5 h-5 text-foreground`} />
            }
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="pt-6 pb-4 px-4">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PositioningStep;
