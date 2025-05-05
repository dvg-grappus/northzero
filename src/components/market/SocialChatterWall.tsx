
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarket } from "@/providers/MarketProvider";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SocialChatterWallProps {
  onComplete: () => void;
}

export const SocialChatterWall: React.FC<SocialChatterWallProps> = ({ onComplete }) => {
  const { 
    chatterCards,
    savedChatterCount,
  } = useMarket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Call onComplete immediately without conditions
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  
  const handleSearch = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Deactivated search functionality 
  }, []);
  
  const handleOpenCard = React.useCallback((id: string) => {
    setOpenCardId(id);
  }, []);
  
  const handleCloseCard = React.useCallback(() => {
    setOpenCardId(null);
  }, []);
  
  // ChatterCard component - no click handlers
  const ChatterCard = React.memo<{ card: any; index: number }>(({ card, index }) => {
    const handleOpenDetails = React.useCallback(() => {
      handleOpenCard(card.id);
    }, [card.id]);
    
    return (
      <motion.div
        className={`bg-[#262626] rounded-lg p-4 w-full h-[260px] flex flex-col justify-between ${
          card.saved ? 'border border-cyan' : 'border border-transparent'
        }`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        layout
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              card.source === 'twitter' ? 'bg-blue-500' :
              card.source === 'linkedin' ? 'bg-[#0A66C2]' : 'bg-black'
            }`}>
              {card.source === 'twitter' && 'X'}
              {card.source === 'linkedin' && 'in'}
              {card.source === 'medium' && 'M'}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 w-6"
              onClick={handleOpenDetails}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm line-clamp-3 mt-3 mb-4">{card.content}</p>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div>{card.likes.toLocaleString()} likes</div>
            <div>{card.reposts.toLocaleString()} reposts</div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full p-1 ${card.saved ? 'bg-cyan text-black' : 'hover:bg-cyan/20'}`}
              // onClick removed to ignore clicks
            >
              <Check className="h-4 w-4" />
              <span className="ml-1">Save</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full p-1 hover:bg-red-500/20"
              // onClick removed to ignore clicks
            >
              <X className="h-4 w-4" />
              <span className="ml-1">Mute</span>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  });
  
  ChatterCard.displayName = "ChatterCard";
  
  return (
    <div className="p-4">
      <div className="sticky top-[82px] z-10 bg-background py-2">
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="relative flex-1 mr-4">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 'AI HR tech hiring'..."
              className="w-full bg-[#262626] border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
            <button 
              className="w-10 h-6 rounded-full relative bg-gray-700"
            >
              <div 
                className="absolute w-4 h-4 rounded-full bg-white top-1 left-1"
              />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          <span className="text-cyan">{savedChatterCount}</span> / 6 saved snippets
        </div>
      </div>
      
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence>
          {chatterCards.map((card, index) => (
            <div key={card.id} className="break-inside-avoid-column mb-6">
              <ChatterCard card={card} index={index} />
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Original Content Viewer */}
      <Sheet open={!!openCardId} onOpenChange={handleCloseCard}>
        <SheetContent side="bottom" className="h-[400px]">
          <SheetHeader>
            <SheetTitle>Original Content</SheetTitle>
          </SheetHeader>
          <div className="mt-4 p-4 bg-[#262626] rounded-md h-[300px] flex items-center justify-center">
            <p>Original content would be embedded here in an iframe</p>
            {/* In a real app, this would be an iframe showing the original content */}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
