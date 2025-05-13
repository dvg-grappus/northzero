import React, { useState, useEffect } from "react";
import { Edit2, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface AxisLabelEditorProps {
  axis: "x" | "y";
  labels: string[];
  onUpdate: (axis: "x" | "y", newLabels: string[]) => void;
  showSuggestions?: boolean; // New prop to control suggestions button visibility
}

export const AxisLabelEditor: React.FC<AxisLabelEditorProps> = ({ 
  axis, 
  labels, 
  onUpdate,
  showSuggestions = false  // Default to false - hide suggestions 
}) => {
  const [editing, setEditing] = useState<"start" | "end" | null>(null);
  const [startLabel, setStartLabel] = useState(labels[0]);
  const [endLabel, setEndLabel] = useState(labels[1]);
  
  // Update internal state when labels prop changes
  useEffect(() => {
    console.log(`[DEBUG] AxisLabelEditor received new labels:`, labels);
    setStartLabel(labels[0] || '');
    setEndLabel(labels[1] || '');
  }, [labels]);
  
  const handleSave = () => {
    onUpdate(axis, [startLabel, endLabel]);
    setEditing(null);
  };
  
  // Suggested alternative labels
  const suggestions = {
    x: [
      ["Basic", "Advanced"],
      ["Generic", "Specialized"],
      ["Mass Market", "Premium"],
      ["Functional", "Emotional"],
      ["Product-led", "Community-led"]
    ],
    y: [
      ["Established", "Innovative"],
      ["Conventional", "Disruptive"],
      ["Complex", "Simple"],
      ["Enterprise", "Consumer"],
      ["Global", "Local"]
    ]
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full">
      {/* Start label */}
      <div className="w-[180px] text-right">
        {editing === "start" ? (
          <input
            type="text"
            className="w-full bg-muted/50 border border-border/50 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
            value={startLabel}
            onChange={(e) => setStartLabel(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            autoFocus
          />
        ) : (
          <button 
            className="w-full text-sm flex items-center gap-1 hover:text-cyan transition-colors justify-end"
            onClick={() => setEditing("start")}
          >
            <span className="truncate">{startLabel || 'Start'}</span>
            <Edit2 className="h-3 w-3 opacity-50 flex-shrink-0" />
          </button>
        )}
      </div>
      
      <span className="text-muted-foreground flex-shrink-0">←→</span>
      
      {/* End label */}
      <div className="w-[180px] text-left">
        {editing === "end" ? (
          <input
            type="text"
            className="w-full bg-muted/50 border border-border/50 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
            value={endLabel}
            onChange={(e) => setEndLabel(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            autoFocus
          />
        ) : (
          <button 
            className="w-full text-sm flex items-center gap-1 hover:text-cyan transition-colors justify-start"
            onClick={() => setEditing("end")}
          >
            <span className="truncate">{endLabel || 'End'}</span>
            <Edit2 className="h-3 w-3 opacity-50 flex-shrink-0" />
          </button>
        )}
      </div>
      
      {/* Suggestions popover - only shown if showSuggestions is true */}
      {showSuggestions && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
              <HelpCircle className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <h4 className="text-sm font-medium mb-2">Try these alternatives:</h4>
            <div className="space-y-1">
              {suggestions[axis].map((pair, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex justify-between"
                  onClick={() => {
                    setStartLabel(pair[0]);
                    setEndLabel(pair[1]);
                    handleSave();
                  }}
                >
                  <span>{pair[0]}</span>
                  <span>↔</span>
                  <span>{pair[1]}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}; 