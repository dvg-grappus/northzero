
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStylescapes } from '@/contexts/StylescapesContext';
import TimelineTopBar from '@/components/TimelineTopBar';
import StylescapeRow from '@/components/stylescapes/StylescapeRow';
import EditBoardModal from '@/components/stylescapes/EditBoardModal';
import FloatingAIPanel from '@/components/moodboards/FloatingAIPanel';
import { Button } from '@/components/ui/button';

const StylescapesCraftPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    rows, 
    onPanelReplace, 
    onBoardRegenerate,
    onAIApply,
    onStylescapeSave
  } = useStylescapes();
  
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeRowForEdit, setActiveRowForEdit] = useState(rows[0]);
  
  const handlePanelReplace = (rowId: string, panelId: string) => {
    onPanelReplace(rowId, panelId);
    // Here we would normally show an Unsplash picker UI
    alert(`Replace panel ${panelId} in row ${rowId} with a new image`);
  };
  
  const handlePanelDelete = (rowId: string, panelId: string) => {
    // Here we would normally grey out the panel and mark it for replacement
    alert(`Delete panel ${panelId} in row ${rowId}`);
  };
  
  const handleTalkToAI = (context: string) => {
    setAiContext(context);
    setShowAIPanel(true);
  };
  
  const handleEditBoard = (rowId: string) => {
    const rowToEdit = rows.find(r => r.id === rowId);
    if (rowToEdit) {
      setActiveRowForEdit(rowToEdit);
      setEditModalOpen(true);
    }
  };
  
  const handleSaveBoard = (rowId: string, queries: string[]) => {
    console.log(`Saving updated queries for row ${rowId}:`, queries);
    onBoardRegenerate(rowId);
    // Here we would update the images based on new queries
  };
  
  const handleStitchAndPreview = () => {
    // Save each row's state before navigating
    rows.forEach(row => {
      onStylescapeSave(row.id);
    });
    
    // Navigate to preview page
    navigate("/step/6/preview");
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      <TimelineTopBar currentStep={7} completedSteps={[1, 2, 3, 4, 5, 6]} />
      
      <div className="pt-[88px] px-[120px] pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2">Shape the story.</h1>
          <p className="text-lg text-[#9A9A9A] mb-6">
            Drag sideways to explore; click panels or boards to refine.
          </p>
        </motion.div>
        
        <div className="space-y-[180px]">
          {rows.map(row => (
            <StylescapeRow
              key={row.id}
              row={row}
              onPanelReplace={handlePanelReplace}
              onPanelDelete={handlePanelDelete}
              onTalkToAI={handleTalkToAI}
              onEditBoard={handleEditBoard}
            />
          ))}
        </div>
        
        {/* Footer navigation */}
        <div className="flex justify-end mt-12">
          <Button
            onClick={handleStitchAndPreview}
            className="bg-[#7DF9FF] text-black hover:bg-[#7DF9FF]/90 px-6"
          >
            Stitch & preview →
          </Button>
        </div>
      </div>
      
      {/* Modals and panels */}
      <FloatingAIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        context={aiContext || "Stylescape Assistant"}
        suggestedPrompts={
          aiContext.includes("Board") ? 
            ["Balance warm/cool", "Introduce human faces", "Mute saturation"] : 
            ["Make it monochrome", "More depth of field", "Try lighter variant"]
        }
        onSuggestionSelect={(suggestion) => {
          console.log(`AI suggestion selected: ${suggestion}`);
          onAIApply(aiContext);
        }}
      />
      
      <EditBoardModal
        row={activeRowForEdit}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveBoard}
      />
    </div>
  );
};

export default StylescapesCraftPage;
