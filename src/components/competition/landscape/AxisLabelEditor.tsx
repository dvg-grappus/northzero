
import React, { useState } from "react";
import { Edit2, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface AxisLabelEditorProps {
  axis: "x" | "y";
  labels: string[];
  onUpdate: (axis: "x" | "y", newLabels: string[]) => void;
}

export const AxisLabelEditor: React.FC<AxisLabelEditorProps> = ({ 
  axis, 
  labels, 
  onUpdate 
}) => {
  const [editing, setEditing] = useState<"start" | "end" | null>(null);
  const [startLabel, setStartLabel] = useState(labels[0]);
  const [endLabel, setEndLabel] = useState(labels[1]);
  
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
    <div className="flex items-center gap-2">
      {/* Start label */}
      <div>
        {editing === "start" ? (
          <input
            type="text"
            className="w-28 bg-muted/50 border border-border/50 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
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
            className="text-sm flex items-center gap-1 hover:text-cyan transition-colors"
            onClick={() => setEditing("start")}
          >
            {startLabel}
            <Edit2 className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>
      
      <span className="text-muted-foreground">←→</span>
      
      {/* End label */}
      <div>
        {editing === "end" ? (
          <input
            type="text"
            className="w-28 bg-muted/50 border border-border/50 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
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
            className="text-sm flex items-center gap-1 hover:text-cyan transition-colors"
            onClick={() => setEditing("end")}
          >
            {endLabel}
            <Edit2 className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>
      
      {/* Suggestions popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
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
    </div>
  );
};
