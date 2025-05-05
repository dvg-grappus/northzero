import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateMoreOptions } from '@/services/openaiService';

interface DifferentiatorCardProps {
  id: string;
  content: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
  index: number;
  isCompetitor?: boolean;
}

const DifferentiatorCard: React.FC<DifferentiatorCardProps> = ({ 
  id,
  content, 
  isPinned, 
  onTogglePin,
  onDelete,
  index,
  isCompetitor = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`p-6 rounded-lg cursor-pointer relative h-[180px] ${
        isPinned ? "bg-[#7DF9FF] shadow-lg" : "bg-[#FFEB3B]"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={onTogglePin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="text-black text-sm line-clamp-5">{content}</p>
      
      {/* Delete button that appears on hover */}
      {isHovered && (
        <motion.button
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          onClick={e => {
            e.stopPropagation();
            onDelete();
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
};

interface DifferentiatorsProps {
  onComplete?: () => void;
}

const Differentiators: React.FC<DifferentiatorsProps> = ({ onComplete }) => {
  const { pinnedDifferentiators, setPinnedDifferentiators, completeStep } = useContext(PositioningContext);
  const { whileOthers, weAreTheOnly, isLoading, updateItemState, refreshData, projectId } = usePositioningData();
  
  const [pinnedCompetitors, setPinnedCompetitors] = useState<string[]>([]);
  
  // Add custom item dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customItemText, setCustomItemText] = useState("");
  const [customItemType, setCustomItemType] = useState<'gap' | 'differentiator'>('gap');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Generate 5 More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateType, setGenerateType] = useState<'gap' | 'differentiator' | null>(null);
  const [extraNote, setExtraNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize with data from database
  useEffect(() => {
    if (!isLoading) {
      // Only set from DB if local state is empty (initial load)
      setPinnedDifferentiators(prev =>
        prev.length === 0
          ? weAreTheOnly.filter(item => item.state === 'selected').map(item => item.content)
          : prev
      );
      setPinnedCompetitors(prev =>
        prev.length === 0
          ? whileOthers.filter(item => item.state === 'selected').map(item => item.content)
          : prev
      );
    }
  }, [isLoading, whileOthers, weAreTheOnly]);
  
  // Sync pinnedDifferentiators with actual selected differentiators after any data change
  useEffect(() => {
    if (!isLoading) {
      const selected = weAreTheOnly.filter(item => item.state === 'selected').map(item => item.content);
      setPinnedDifferentiators(selected);
    }
  }, [isLoading, weAreTheOnly, setPinnedDifferentiators]);
  
  const handleToggleCompetitor = async (competitor: string) => {
    const competitorItem = whileOthers.find(item => item.content === competitor);
    if (!competitorItem) return;
    if (competitorItem.state === 'selected') {
      await updateItemState(competitorItem.id, 'draft');
      setPinnedCompetitors(prev => prev.filter(c => c !== competitor));
      return;
    }
    await updateItemState(competitorItem.id, 'selected');
    setPinnedCompetitors(prev => [...prev, competitor]);
  };

  const handleDeleteCompetitor = async (competitor: string) => {
    const competitorItem = whileOthers.find(item => item.content === competitor);
    if (!competitorItem) return;
    setPinnedCompetitors(prev => prev.filter(c => c !== competitor));
    await updateItemState(competitorItem.id, 'archived');
    await refreshData();
  };

  const handleToggleDifferentiator = async (differentiator: string) => {
    const differentiatorItem = weAreTheOnly.find(item => item.content === differentiator);
    if (!differentiatorItem) return;
    if (differentiatorItem.state === 'selected') {
      await updateItemState(differentiatorItem.id, 'draft');
      setPinnedDifferentiators(prev => prev.filter(d => d !== differentiator));
      return;
    }
    await updateItemState(differentiatorItem.id, 'selected');
    setPinnedDifferentiators(prev => [...prev, differentiator]);
  };

  const handleDeleteDifferentiator = async (differentiator: string) => {
    const differentiatorItem = weAreTheOnly.find(item => item.content === differentiator);
    if (!differentiatorItem) return;
    setPinnedDifferentiators(prev => prev.filter(d => d !== differentiator));
    await updateItemState(differentiatorItem.id, 'archived');
    await refreshData();
  };
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else if (completeStep) {
      completeStep("differentiators");
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
      const currentItems = customItemType === 'gap' ? whileOthers : weAreTheOnly;
      const itemType = customItemType === 'gap' ? 'WHILE_OTHERS' : 'WE_ARE_THE_ONLY';
      
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
      
      toast.success(`Added new ${customItemType === 'gap' ? 'gap' : 'differentiator'}`);
      
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
  
  const openAddDialog = (type: 'gap' | 'differentiator') => {
    setCustomItemType(type);
    setDialogOpen(true);
  };
  
  // Handler for Generate 5 More CTA
  const handleGenerateMore = (type: 'gap' | 'differentiator') => {
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
      const type = generateType === 'gap' ? 'WHILE_OTHERS' : 'WE_ARE_THE_ONLY';
      const newOptions = await generateMoreOptions(type, contextJson, extraNote);
      // Insert each new option as a positioning_item
      const currentItems = generateType === 'gap' ? whileOthers : weAreTheOnly;
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
      toast.success(`Generated 5 new ${type === 'WHILE_OTHERS' ? 'gaps' : 'differentiators'}!`);
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
      <h2 className="text-2xl font-bold mb-6">Differentiators</h2>
      {(whileOthers.length === 0 && weAreTheOnly.length === 0) ? (
        <div className="text-center text-muted-foreground py-12">
          No differentiators yet. Highlight what sets you apart.
        </div>
      ) : (
        <>
          <motion.p
            className="text-gray-500 text-sm mb-1 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Why you, not the rest.
          </motion.p>
          
          <motion.h1
            className="text-[32px] font-bold mb-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Key Differentiators
          </motion.h1>
          
          <motion.p 
            className="text-center text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Select your top differentiators.
          </motion.p>
          
          {isLoading ? (
            <div className="flex flex-col items-center mt-8">
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              </div>
              <p className="text-gray-500 mt-4">Still shaping ideas... one second.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">While others...</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openAddDialog('gap')}
                      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                      size="sm"
                    >
                      <Plus size={16} />
                      GAP
                    </Button>
                    <Button
                      onClick={() => handleGenerateMore('gap')}
                      className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
                      size="sm"
                    >
                      ⚡️ 5 More
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {whileOthers
                    .filter(item => item.state !== 'archived')
                    .map((competitor, index) => (
                      <DifferentiatorCard
                        key={competitor.id}
                        id={competitor.id}
                        content={competitor.content}
                        isPinned={competitor.state === 'selected'}
                        onTogglePin={() => handleToggleCompetitor(competitor.content)}
                        onDelete={() => handleDeleteCompetitor(competitor.content)}
                        index={index}
                        isCompetitor={true}
                      />
                    ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">We are the only...</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openAddDialog('differentiator')}
                      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                      size="sm"
                    >
                      <Plus size={16} />
                      DIFF
                    </Button>
                    <Button
                      onClick={() => handleGenerateMore('differentiator')}
                      className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
                      size="sm"
                    >
                      ⚡️ 5 More
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {weAreTheOnly
                    .filter(item => item.state !== 'archived')
                    .map((differentiator, index) => (
                      <DifferentiatorCard
                        key={differentiator.id}
                        id={differentiator.id}
                        content={differentiator.content}
                        isPinned={differentiator.state === 'selected'}
                        onTogglePin={() => handleToggleDifferentiator(differentiator.content)}
                        onDelete={() => handleDeleteDifferentiator(differentiator.content)}
                        index={index}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Add custom item dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {customItemType === 'gap' ? 'Competitor Gap' : 'Differentiator'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={customItemText}
              onChange={(e) => setCustomItemText(e.target.value)}
              placeholder={customItemType === 'gap' 
                ? "While others..." 
                : "We are the only..."}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCustomItem}
              disabled={isSubmitting || !customItemText.trim()}
            >
              {isSubmitting ? "Adding..." : `Add ${customItemType === 'gap' ? 'Gap' : 'Differentiator'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate 5 More dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate 5 More {generateType === 'gap' ? 'Gaps' : 'Differentiators'}</DialogTitle>
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
          Craft statements
        </Button>
      </div>
    </div>
  );
};

export default Differentiators;