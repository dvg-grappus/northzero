import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import StickyNote from "./StickyNote";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { generateMoreOptions } from '@/services/openaiService';

interface DraggableNoteProps {
  id: string;
  content: string;
  isSelected: boolean;
  isDiscarded: boolean;
  onSelect: () => void;
  onDiscard: () => void;
  onMove?: () => void;
  showMoveButton?: boolean;
  section?: 'opportunities' | 'challenges';
}

const DraggableNote: React.FC<DraggableNoteProps> = ({
  id,
  content,
  isSelected,
  isDiscarded,
  onSelect,
  onDiscard,
  onMove,
  showMoveButton = false,
  section
}) => {
  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-[180px]">
        <StickyNote
          id={id}
          content={content}
          isSelected={isSelected}
          isDiscarded={isDiscarded}
          onClick={onSelect}
          onDiscard={onDiscard}
          color={isSelected ? "#7DF9FF" : "#FFEB3B"} // Cyan when selected, yellow when not
          className="h-full w-full"
        />
      </div>
      
      {showMoveButton && onMove && (
        <button 
          onClick={onMove}
          className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700 flex items-center justify-center"
        >
          Move to {section === 'opportunities' ? 'Challenges' : 'Opportunities'} ↔
        </button>
      )}
    </motion.div>
  );
};

interface OpportunitiesChallengesProps {
  onComplete?: () => void;
}

const OpportunitiesChallenges: React.FC<OpportunitiesChallengesProps> = ({ onComplete }) => {
  const { selectedOpportunities, setSelectedOpportunities, selectedChallenges, setSelectedChallenges, completeStep } = useContext(PositioningContext);
  const { opportunities, challenges, isLoading, updateItemState, refreshData, projectId } = usePositioningData();
  
  const [discardedOpportunities, setDiscardedOpportunities] = useState<string[]>([]);
  const [discardedChallenges, setDiscardedChallenges] = useState<string[]>([]);
  
  // Add custom item dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customItemText, setCustomItemText] = useState("");
  const [customItemType, setCustomItemType] = useState<'opportunity' | 'challenge'>('opportunity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Generate 5 More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateType, setGenerateType] = useState<'opportunity' | 'challenge' | null>(null);
  const [extraNote, setExtraNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize selected items from database
  useEffect(() => {
    if (!isLoading) {
      setSelectedOpportunities(
        opportunities
          .filter(item => item.state === 'selected')
          .map(item => item.content)
      );
      
      setSelectedChallenges(
        challenges
          .filter(item => item.state === 'selected')
          .map(item => item.content)
      );
    }
  }, [isLoading, opportunities, challenges, setSelectedOpportunities, setSelectedChallenges]);
  
  const handleSelect = async (type: 'opportunities' | 'challenges', item: string) => {
    const items = type === 'opportunities' ? opportunities : challenges;
    const selectedItem = items.find(i => i.content === item);
    if (!selectedItem) return;

    const newState = selectedItem.state === 'selected' ? 'draft' : 'selected';
    
    // Update UI state first
    if (type === 'opportunities') {
      setSelectedOpportunities(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    } else {
      setSelectedChallenges(prev => 
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    }

    // Update database state
    try {
      await updateItemState(selectedItem.id, newState);
    } catch (error) {
      console.error('Failed to update item state:', error);
      // Revert UI state if DB update fails
      if (type === 'opportunities') {
    setSelectedOpportunities(prev =>
          prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
      } else {
      setSelectedChallenges(prev =>
          prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
      }
      toast.error('Failed to update selection');
    }
  };
  
  const handleDiscard = async (type: 'opportunities' | 'challenges', item: string) => {
    const items = type === 'opportunities' ? opportunities : challenges;
    const selectedItem = items.find(i => i.content === item);
    if (!selectedItem) return;

    await updateItemState(selectedItem.id, 'archived');
    await refreshData();
  };
  
  const moveToOpportunity = async (challenge: string) => {
    try {
      // Find the challenge item in the database
      const challengeItem = challenges.find(item => item.content === challenge);
      if (!challengeItem) {
        toast.error("Challenge not found");
        return;
      }
      
      // Update the item type in the database from CHALLENGE to OPPORTUNITY
      const { error } = await supabase
        .from('positioning_items')
        .update({ 
          item_type: 'OPPORTUNITY',
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeItem.id);
      
      if (error) {
        console.error("Error updating item type:", error);
        toast.error("Failed to move challenge to opportunities");
        return;
      }
      
      // Remove from challenges in UI
      setSelectedChallenges(prev => prev.filter(item => item !== challenge));
      setDiscardedChallenges(prev => [...prev, challenge]);
      
      // Add to opportunities in UI
      setSelectedOpportunities(prev => [...prev, challenge]);
      
      // Refresh data to get updated items from database
      await refreshData();
      
      toast.success("Moved to Opportunities");
    } catch (err) {
      console.error("Error moving challenge to opportunity:", err);
      toast.error("Failed to move challenge");
    }
  };
  
  const moveToChallenge = async (opportunity: string) => {
    try {
      // Find the opportunity item in the database
      const opportunityItem = opportunities.find(item => item.content === opportunity);
      if (!opportunityItem) {
        toast.error("Opportunity not found");
        return;
      }
      
      // Update the item type in the database from OPPORTUNITY to CHALLENGE
      const { error } = await supabase
        .from('positioning_items')
        .update({ 
          item_type: 'CHALLENGE',
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityItem.id);
      
      if (error) {
        console.error("Error updating item type:", error);
        toast.error("Failed to move opportunity to challenges");
        return;
      }
      
      // Remove from opportunities in UI
      setSelectedOpportunities(prev => prev.filter(item => item !== opportunity));
      setDiscardedOpportunities(prev => [...prev, opportunity]);
      
      // Add to challenges in UI
      setSelectedChallenges(prev => [...prev, opportunity]);
      
      // Refresh data to get updated items from database
      await refreshData();
      
      toast.success("Moved to Challenges");
    } catch (err) {
      console.error("Error moving opportunity to challenge:", err);
      toast.error("Failed to move opportunity");
    }
  };
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else if (completeStep) {
      completeStep("opportunities-challenges");
    }
  };
  
  // Add custom item
  const handleAddCustomItem = async () => {
    if (!customItemText.trim()) {
      toast.error("Please enter some text");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the latest document for the current project
      const { data: documents } = await supabase
        .from('positioning_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1);
      
      if (!documents || documents.length === 0) {
        toast.error("No positioning document found");
        return;
      }
      
      const document = documents[0];
      
      // Get the current items of this type to determine the next index
      const currentItems = customItemType === 'opportunity' ? opportunities : challenges;
      const itemType = customItemType === 'opportunity' ? 'OPPORTUNITY' : 'CHALLENGE';
      
      const nextIdx = currentItems.length;
      
      // Insert the new item
      const { data: newItem, error } = await supabase
        .from('positioning_items')
        .insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: itemType,
          content: customItemText,
          idx: nextIdx,
          state: 'draft',
          source: 'user'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding custom item:", error);
        toast.error("Failed to add custom item");
        return;
      }
      
      // Refresh data to update the UI
      await refreshData();
      
      toast.success(`Added new ${customItemType}`);
      
      // Close dialog and reset input
      setDialogOpen(false);
      setCustomItemText("");
    } catch (error) {
      console.error("Error adding custom item:", error);
      toast.error("Failed to add custom item");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openAddDialog = (type: 'opportunity' | 'challenge') => {
    setCustomItemType(type);
    setDialogOpen(true);
  };
  
  // Handler for Generate 5 More CTA
  const handleGenerateMore = (type: 'opportunity' | 'challenge') => {
    setGenerateType(type);
    setExtraNote("");
    setGenerateDialogOpen(true);
  };

  // Handler for submitting Generate 5 More
  const handleSubmitGenerateMore = async () => {
    if (!generateType) return;
    setIsGenerating(true);
    try {
      // Get the latest document for the current project
      const { data: documents } = await supabase
        .from('positioning_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1);
      if (!documents || documents.length === 0) {
        toast.error("No positioning document found");
        setIsGenerating(false);
        return;
      }
      const document = documents[0];
      // Build context JSON (raw_payload is the full dataset)
      const contextJson = document.raw_payload || {};
      // Call OpenAI
      const type = generateType === 'opportunity' ? 'OPPORTUNITY' : 'CHALLENGE';
      const newOptions = await generateMoreOptions(type, contextJson, extraNote);
      // Insert each new option as a positioning_item
      const currentItems = generateType === 'opportunity' ? opportunities : challenges;
      const nextIdx = currentItems.length;
      for (let i = 0; i < newOptions.length; i++) {
        const content = newOptions[i];
        await supabase.from('positioning_items').insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: type,
          content,
          idx: nextIdx + i,
          state: 'draft',
          source: 'ai'
        });
      }
      await new Promise(res => setTimeout(res, 300)); // Add delay before refresh
      await refreshData();
      toast.success(`Generated 5 new ${type === 'OPPORTUNITY' ? 'opportunities' : 'challenges'}!`);
      setGenerateDialogOpen(false);
      setExtraNote("");
      setGenerateType(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate more options');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Opportunities & Challenges</h2>
      {(opportunities.length === 0 && challenges.length === 0) ? (
        <div className="text-center text-muted-foreground py-12">
          No opportunities or challenges found. Add some to map your landscape.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <motion.h3
                className="text-[18px] font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Opportunities
              </motion.h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => openAddDialog('opportunity')}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                  size="sm"
                >
                  <Plus size={16} />
                  OPPORTUNITY
                </Button>
                <Button
                  onClick={() => handleGenerateMore('opportunity')}
                  className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
                  size="sm"
                >
                  ⚡️ 5 More
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-secondary rounded-lg shadow-sm min-h-[400px]" id="opportunities">
              {isLoading ? (
                <div className="flex flex-col items-center mt-8">
                  <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg mb-4"></div>
                  <p className="text-gray-500">Still shaping ideas... one second.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities
                    .filter(opportunity => !discardedOpportunities.includes(opportunity.content) && opportunity.state !== 'archived')
                    .map((opportunity) => (
                      <DraggableNote
                        key={opportunity.id}
                        id={opportunity.id}
                        content={opportunity.content}
                        isSelected={selectedOpportunities.includes(opportunity.content)}
                        isDiscarded={discardedOpportunities.includes(opportunity.content)}
                        onSelect={() => handleSelect('opportunities', opportunity.content)}
                        onDiscard={() => handleDiscard('opportunities', opportunity.content)}
                        section="opportunities"
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <motion.h3
                className="text-[18px] font-bold"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Challenges
              </motion.h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => openAddDialog('challenge')}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                  size="sm"
                >
                  <Plus size={16} />
                  CHALLENGE
                </Button>
                <Button
                  onClick={() => handleGenerateMore('challenge')}
                  className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
                  size="sm"
                >
                  ⚡️ 5 More
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-secondary rounded-lg shadow-sm min-h-[400px]" id="challenges">
              {isLoading ? (
                <div className="flex flex-col items-center mt-8">
                  <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg mb-4"></div>
                  <p className="text-gray-500">Still shaping ideas... one second.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges
                    .filter(challenge => !discardedChallenges.includes(challenge.content) && challenge.state !== 'archived')
                    .map((challenge) => (
                      <DraggableNote
                        key={challenge.id}
                        id={challenge.id}
                        content={challenge.content}
                        isSelected={selectedChallenges.includes(challenge.content)}
                        isDiscarded={discardedChallenges.includes(challenge.content)}
                        onSelect={() => handleSelect('challenges', challenge.content)}
                        onDiscard={() => handleDiscard('challenges', challenge.content)}
                        onMove={() => moveToOpportunity(challenge.content)}
                        showMoveButton={true}
                        section="challenges"
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Add custom item dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {customItemType === 'opportunity' ? 'Opportunity' : 'Challenge'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={customItemText}
              onChange={(e) => setCustomItemText(e.target.value)}
              placeholder={customItemType === 'opportunity' 
                ? "How might we..." 
                : "Enter your challenge..."}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCustomItem}
              disabled={isSubmitting || !customItemText.trim()}
            >
              {isSubmitting ? "Adding..." : `Add ${customItemType === 'opportunity' ? 'Opportunity' : 'Challenge'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate 5 More dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate 5 More {generateType === 'opportunity' ? 'Opportunities' : 'Challenges'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={extraNote}
              onChange={e => setExtraNote(e.target.value)}
              placeholder="Optional: Add a line of guidance for the AI..."
              className="w-full"
              disabled={isGenerating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleSubmitGenerateMore} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-6 text-right">
        <Button
          onClick={handleComplete}
          className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
        >
          Complete & Continue
        </Button>
      </div>
    </div>
  );
};

export default OpportunitiesChallenges;