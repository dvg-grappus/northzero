
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, X, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StylescapePanel as PanelType } from '@/contexts/StylescapesContext';
import { TalkToAIButton } from '@/components/moodboards/FloatingAIPanel';

interface StylescapePanelProps {
  panel: PanelType;
  rowId: string;
  rowTheme: string;
  onReplace: (rowId: string, panelId: string) => void;
  onDelete: (rowId: string, panelId: string) => void;
  onTalkToAI: (context: string) => void;
}

const StylescapePanel: React.FC<StylescapePanelProps> = ({
  panel,
  rowId,
  rowTheme,
  onReplace,
  onDelete,
  onTalkToAI
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 h-[540px] w-[960px] overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0">
        <img 
          src={panel.img} 
          alt={panel.role} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${panel.img}`);
            e.currentTarget.src = "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop";
          }}
        />
        {/* Feather blend overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to right, #1B1B1B 0, transparent 40px, transparent calc(100% - 40px), #1B1B1B 100%)'
        }}></div>
      </div>
      
      {/* Role label chip */}
      <Badge 
        className="absolute top-4 left-12 uppercase text-xs bg-[#303030] hover:bg-[#383838] text-white py-2 px-4 rounded-full"
      >
        {panel.role}
      </Badge>
      
      {/* Toolbar (visible on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute right-4 top-4 flex items-center space-x-2 bg-[#262626]/80 backdrop-blur-sm rounded-full p-2"
      >
        <button
          className="p-1.5 rounded-full hover:bg-[#383838] text-white"
          title="Replace"
          onClick={() => onReplace(rowId, panel.id)}
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
        
        <button
          className="p-1.5 rounded-full hover:bg-[#383838] text-white"
          title="Talk to AI"
          onClick={() => onTalkToAI(`Panel ${panel.id} in ${rowTheme}`)}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        
        <button
          className="p-1.5 rounded-full hover:bg-[#383838] text-white"
          title="Delete"
          onClick={() => onDelete(rowId, panel.id)}
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default StylescapePanel;
