import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      id={`sticky-note-${id}`}
      className={`relative rounded-lg p-3 font-medium text-[13px] ${className} cursor-pointer`}
      style={{ 
        backgroundColor: isSelected ? "#7DF9FF" : color,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full overflow-hidden text-black line-clamp-4">
        {content}
      </div>
      
      {/* Delete button that appears on hover */}
      {isHovered && (
        <motion.button
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDiscard();
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <X className="w-3 h-3 text-black/70" />
        </motion.button>
      )}
    </motion.div>
  );
});

StickyNote.displayName = "StickyNote";

export default StickyNote;