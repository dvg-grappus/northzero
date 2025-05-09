
import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface StickyNoteProps {
  id: string;
  content: string;
  isSelected: boolean;
  isDiscarded: boolean;
  onClick: () => void;
  onDiscard: () => void;
  color?: string;
  className?: string;
}

const StickyNote = forwardRef<HTMLDivElement, StickyNoteProps>(({
  id,
  content,
  isSelected,
  isDiscarded,
  onClick,
  onDiscard,
  color = "#FFEB3B", // Bright yellow color typical of sticky notes
  className = ""
}, ref) => {
  return (
    <motion.div
      ref={ref}
      id={`sticky-note-${id}`}
      className={`relative rounded-lg p-3 font-medium text-[13px] ${className}`}
      style={{ 
        backgroundColor: color,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-full overflow-hidden mb-6 text-black">
        {content}
      </div>
      
      {/* Control Chips */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          className={`flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
            isSelected 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={onClick}
        >
          <Check className="w-2.5 h-2.5 mr-0.5" />
          Select
        </button>
        
        <button
          className="flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          onClick={onDiscard}
        >
          <X className="w-2.5 h-2.5 mr-0.5" />
          Discard
        </button>
      </div>
    </motion.div>
  );
});

StickyNote.displayName = "StickyNote";

export default StickyNote;
