
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MessageCircle } from 'lucide-react';
import { useStylescapes } from '@/contexts/StylescapesContext';
import TimelineTopBar from '@/components/TimelineTopBar';
import FloatingAIPanel from '@/components/moodboards/FloatingAIPanel';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const StylescapesPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    rows, 
    winner, 
    setWinner,
    onAIApply,
    onWinnerChoose,
    onModuleComplete
  } = useStylescapes();
  
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeLightboxRow, setActiveLightboxRow] = useState<string | null>(null);
  
  // Set default winner to first row on component mount
  useEffect(() => {
    if (rows.length > 0 && !winner) {
      setWinner(rows[0].id);
    }
  }, [rows, winner, setWinner]);
  
  const handleTalkToAI = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      setAiContext(`Final board: ${row.theme}`);
      setShowAIPanel(true);
    }
  };
  
  const openLightbox = (rowId: string) => {
    setActiveLightboxRow(rowId);
    setLightboxOpen(true);
  };
  
  const handleSelectWinner = () => {
    // If we have a winner selected, use it
    if (winner) {
      onWinnerChoose(winner);
      onModuleComplete('stylescapes', winner);
    } else if (rows.length > 0) {
      // Fallback to using the first row if no winner is explicitly selected
      onWinnerChoose(rows[0].id);
      onModuleComplete('stylescapes', rows[0].id);
    }
    
    // Always navigate back to timeline regardless of selection state
    navigate("/timeline", { state: { fromStylescapes: true } });
  };

  // Creates a stitched preview of all panels in a row
  const renderStitchedPreview = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return null;
    
    return (
      <div className="flex w-full h-full">
        {row.panels.map((panel) => (
          <div key={panel.id} className="h-full flex-1">
            <img 
              src={panel.img} 
              alt={panel.role}
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${panel.img}`);
                e.currentTarget.src = "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop";
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  console.log("StylescapesPreviewPage rendering with rows:", rows);
  
  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      <TimelineTopBar currentStep={7} completedSteps={[1, 2, 3, 4, 5, 6]} />
      
      <div className="pt-[88px] px-[120px] pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2">Pick the vision.</h1>
          <p className="text-lg text-[#9A9A9A] mb-10">
            Review final stitched boards; choose one to lead visual design.
          </p>
        </motion.div>
        
        <RadioGroup 
          value={winner || ""} 
          onValueChange={(value) => {
            console.log("Radio selection changed to:", value);
            setWinner(value);
          }} 
          className="space-y-12"
        >
          {rows.map(row => {
            return (
              <div key={row.id} className="flex items-start gap-4">
                <div className="mt-16">
                  <RadioGroupItem 
                    value={row.id} 
                    id={row.id}
                    className="scale-150"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="mb-2 flex justify-between">
                    <h3 className="text-lg font-medium">
                      {row.theme} <span>{row.themeEmoji}</span>
                    </h3>
                    
                    <button
                      className="text-[#9A9A9A] hover:text-[#7DF9FF]"
                      onClick={() => handleTalkToAI(row.id)}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div 
                    className={cn(
                      "relative w-full h-[140px] overflow-hidden rounded-md cursor-pointer",
                      "group border border-[#444] hover:border-[#7DF9FF]",
                      winner === row.id ? "border-[#7DF9FF] ring-1 ring-[#7DF9FF]" : ""
                    )}
                    onClick={() => openLightbox(row.id)}
                  >
                    {/* Render the stitched preview of all images */}
                    {renderStitchedPreview(row.id)}
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
        
        {/* Footer navigation - button is always enabled */}
        <div className="flex justify-end mt-12">
          <Button
            onClick={handleSelectWinner}
            className="bg-[#7DF9FF] text-black hover:bg-[#7DF9FF]/90 px-6"
          >
            Select winner →
          </Button>
        </div>
      </div>
      
      {/* Floating AI Panel */}
      <FloatingAIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        context={aiContext || "Stylescape Assistant"}
        suggestedPrompts={["Balance warm/cool", "Introduce human faces", "Mute saturation"]}
        onSuggestionSelect={(suggestion) => {
          console.log(`AI suggestion selected: ${suggestion}`);
          onAIApply(aiContext);
        }}
      />
      
      {/* Full-screen lightbox */}
      <AnimatePresence>
        {lightboxOpen && activeLightboxRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-[#262626]/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div 
              className="w-full max-w-[90vw] overflow-x-auto scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Display all panels in a row for the lightbox view */}
              <div className="flex">
                {rows.find(r => r.id === activeLightboxRow)?.panels.map((panel) => (
                  <div key={panel.id} className="relative flex-shrink-0">
                    <img 
                      src={panel.img}
                      alt={panel.role}
                      className="h-[80vh] max-h-[720px] object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="uppercase text-xs bg-[#303030] text-white py-1.5 px-4 rounded-full">
                        {panel.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-sm text-[#9A9A9A] mt-4">
                Shift + Mouse wheel to pan horizontally
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylescapesPreviewPage;
