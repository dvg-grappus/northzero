
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Edit, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StylescapePanel from './StylescapePanel';
import { StylescapeRow as RowType } from '@/contexts/StylescapesContext';
import { cn } from '@/lib/utils';

interface StylescapeRowProps {
  row: RowType;
  onPanelReplace: (rowId: string, panelId: string) => void;
  onPanelDelete: (rowId: string, panelId: string) => void;
  onTalkToAI: (context: string) => void;
  onEditBoard: (rowId: string) => void;
}

const StylescapeRow: React.FC<StylescapeRowProps> = ({
  row,
  onPanelReplace,
  onPanelDelete,
  onTalkToAI,
  onEditBoard
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative mb-[160px]"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Board header with theme tag and relevance */}
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-white">
            {row.theme} <span className="text-xl">{row.themeEmoji}</span>
          </h3>
          <span className="text-[#9A9A9A] text-sm">Relevance {row.relevance.toFixed(2)}</span>
        </div>
        
        {/* Board-level toolbar */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center space-x-1 text-[#9A9A9A] hover:text-white"
            onClick={() => onEditBoard(row.id)}
          >
            <Edit className="w-4 h-4" />
            <span>Edit board</span>
          </Button>
          
          <button
            className="p-1.5 rounded-full hover:bg-[#303030] text-[#9A9A9A] hover:text-[#7DF9FF]"
            onClick={() => onTalkToAI(`Board ${row.id}: ${row.theme}`)}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Chips row */}
      <div className="flex flex-wrap gap-2 mb-4 px-4">
        {row.chips.map((chip, index) => (
          <Badge 
            key={`${row.id}-chip-${index}`}
            className="bg-[#303030] hover:bg-[#383838] text-white text-xs rounded-full py-1.5"
          >
            {chip}
          </Badge>
        ))}
      </div>
      
      {/* Stylescape panels (horizontal scroll) */}
      <div className="relative">
        {/* Scroll arrows */}
        {showArrows && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-[#262626]/80 backdrop-blur-sm rounded-full p-2"
              onClick={scrollLeft}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-[#262626]/80 backdrop-blur-sm rounded-full p-2"
              onClick={scrollRight}
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </motion.button>
          </>
        )}
        
        {/* Panels container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex overflow-x-auto scrollbar-none",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ width: '100%', overflowX: 'scroll' }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {row.panels.map(panel => (
            <StylescapePanel
              key={panel.id}
              panel={panel}
              rowId={row.id}
              rowTheme={row.theme}
              onReplace={onPanelReplace}
              onDelete={onPanelDelete}
              onTalkToAI={onTalkToAI}
            />
          ))}
        </div>
      </div>
      
      {/* Board-level AI quick suggestions */}
      <div className="flex gap-2 mt-4 px-4">
        <Button
          variant="outline" 
          size="sm"
          className="bg-[#303030] hover:bg-[#383838] border-none text-[#9A9A9A] hover:text-white text-xs rounded-full"
          onClick={() => onTalkToAI(`Tighten colour harmony for ${row.theme}`)}
        >
          Tighten colour harmony
        </Button>
        <Button
          variant="outline" 
          size="sm"
          className="bg-[#303030] hover:bg-[#383838] border-none text-[#9A9A9A] hover:text-white text-xs rounded-full"
          onClick={() => onTalkToAI(`Swap hero shot to female lead for ${row.theme}`)}
        >
          Swap hero shot to female lead
        </Button>
        <Button
          variant="outline" 
          size="sm"
          className="bg-[#303030] hover:bg-[#383838] border-none text-[#9A9A9A] hover:text-white text-xs rounded-full"
          onClick={() => onTalkToAI(`Soften seam transition for ${row.theme}`)}
        >
          Soften seam transition
        </Button>
      </div>
    </div>
  );
};

export default StylescapeRow;
