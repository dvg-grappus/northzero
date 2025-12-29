import React, { useState, useEffect, useContext, useRef } from "react";
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
import { generateMoreOptions, generateOpportunitiesAndChallenges, generateGoldenCircle } from '@/services/openaiService';
import { updatePositioningDocumentForProject, getLatestPositioningDocument } from '@/services/positioningService';

interface GoldenCircleProps {
  onComplete?: () => void;
}

const GoldenCircle: React.FC<GoldenCircleProps> = ({ onComplete }) => {
  const { selectedGoldenCircle, setSelectedGoldenCircle, completeStep } = useContext(PositioningContext);
  const {
    whatStatements,
    howStatements,
    whyStatements,
    opportunities,
    challenges,
    isLoading,
    updateItemState,
    refreshData,
    projectId,
    brief,
  } = usePositioningData();
  
  // Start with WHAT selected by default
  const [activeSegment, setActiveSegment] = useState<'why' | 'how' | 'what'>('what');
  const [discardedIdeas, setDiscardedIdeas] = useState<string[]>([]);
  
  // Add custom item dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customItemText, setCustomItemText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Generate 5 More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [extraNote, setExtraNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Initialize selected items from database
  useEffect(() => {
    if (!isLoading) {
      setSelectedGoldenCircle({
        why: whyStatements.filter(item => item.state === 'selected').map(item => item.content),
        how: howStatements.filter(item => item.state === 'selected').map(item => item.content),
        what: whatStatements.filter(item => item.state === 'selected').map(item => item.content)
      });
    }
  }, [isLoading, whatStatements, howStatements, whyStatements, setSelectedGoldenCircle]);

  const handleSegmentClick = (segment: 'why' | 'how' | 'what') => {
    setActiveSegment(segment);
  };

  const handleSelect = async (type: 'why' | 'how' | 'what', idea: string) => {
    let items: any[] = [];
    switch (type) {
      case 'why': items = whyStatements; break;
      case 'how': items = howStatements; break;
      case 'what': items = whatStatements; break;
    }
    
    const item = items.find(i => i.content === idea);
    if (!item) {
      return;
    }
    
    const newState = item.state === 'selected' ? 'draft' : 'selected';
    
    // Update UI state first for immediate feedback
    setSelectedGoldenCircle(prev => {
      const newState = { ...prev };
      if (prev[type].includes(idea)) {
        newState[type] = prev[type].filter(i => i !== idea);
      } else {
        newState[type] = [...prev[type], idea];
      }
      return newState;
    });
    
    // Update database state
    try {
      await updateItemState(item.id, newState);
    } catch (error) {
      // Revert UI state if DB update fails
      setSelectedGoldenCircle(prev => {
        const newState = { ...prev };
        if (newState[type].includes(idea)) {
          newState[type] = newState[type].filter(i => i !== idea);
        } else {
          newState[type] = [...newState[type], idea];
      }
        return newState;
    });
      toast.error('Failed to update selection');
    }
  };

  const handleDiscard = async (idea: string) => {
    let items: any[] = [];
    switch (activeSegment) {
      case 'why': items = whyStatements; break;
      case 'how': items = howStatements; break;
      case 'what': items = whatStatements; break;
    }
    const item = items.find(i => i.content === idea);
    if (!item) return;
    
    await updateItemState(item.id, 'archived');
    setDiscardedIdeas(prev => [...prev, idea]);
    setSelectedGoldenCircle(prev => {
      if (prev[activeSegment].includes(idea)) {
        return { ...prev, [activeSegment]: prev[activeSegment].filter(i => i !== idea) };
      }
      return prev;
    });
    await refreshData();
  };

  const hasAtLeastOnePerBucket =
    selectedGoldenCircle.what.length > 0 &&
    selectedGoldenCircle.how.length > 0 &&
    selectedGoldenCircle.why.length > 0;
  const hasExistingOppChal =
    (opportunities?.length || 0) > 0 || (challenges?.length || 0) > 0;

  const handleComplete = async () => {
    if (!hasAtLeastOnePerBucket || isAdvancing) return;
    // If already generated, just advance with no API call
    if (hasExistingOppChal) {
      if (onComplete) onComplete();
      else if (completeStep) completeStep("golden-circle");
      return;
    }

    setIsAdvancing(true);
    try {
      const latestDoc = await getLatestPositioningDocument(projectId);
      const goldenCirclePayload = {
        brief,
        whatStatements: whatStatements.map(i => ({ content: i.content, state: i.state })),
        howStatements: howStatements.map(i => ({ content: i.content, state: i.state })),
        whyStatements: whyStatements.map(i => ({ content: i.content, state: i.state })),
      };

      const mergedPayload = {
        ...(latestDoc?.raw_payload || {}),
        ...goldenCirclePayload,
        opportunities: latestDoc?.raw_payload?.opportunities || [],
        challenges: latestDoc?.raw_payload?.challenges || [],
        milestones: latestDoc?.raw_payload?.milestones || [],
        values: latestDoc?.raw_payload?.values || [],
        differentiators: latestDoc?.raw_payload?.differentiators || {
          whileOthers: [],
          weAreTheOnly: [],
        },
      };

      const oppChal = await generateOpportunitiesAndChallenges(
        brief,
        {
          whatStatements: selectedGoldenCircle.what,
          howStatements: selectedGoldenCircle.how,
          whyStatements: selectedGoldenCircle.why,
        },
      );
      mergedPayload.opportunities = oppChal.opportunities || [];
      mergedPayload.challenges = oppChal.challenges || [];

      await updatePositioningDocumentForProject(projectId, mergedPayload);
      if (refreshData) await refreshData();

      if (onComplete) {
        onComplete();
      } else if (completeStep) {
        completeStep("golden-circle");
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate opportunities and challenges');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const latestDoc = await getLatestPositioningDocument(projectId);
      // Regenerate fresh Golden Circle options with current selections as context
      const selectionBundle = {
        what: selectedGoldenCircle.what,
        how: selectedGoldenCircle.how,
        why: selectedGoldenCircle.why,
      };
      const gc = await generateGoldenCircle(brief, selectionBundle);

      // Clear existing GC (and downstream opp/challenge) items to avoid duplicates
      if (latestDoc?.id) {
        await supabase
          .from('positioning_items')
          .delete()
          .eq('document_id', latestDoc.id)
          .in('item_type', ['WHAT', 'HOW', 'WHY', 'OPPORTUNITY', 'CHALLENGE']);
      }

      const mergedPayload = {
        ...(latestDoc?.raw_payload || {}),
        brief,
        whatStatements: (gc.whatStatements || []).map((c: string) => ({ content: c, state: 'draft' })),
        howStatements: (gc.howStatements || []).map((c: string) => ({ content: c, state: 'draft' })),
        whyStatements: (gc.whyStatements || []).map((c: string) => ({ content: c, state: 'draft' })),
        // Reset downstream so user regenerates fresh paths from new GC
        opportunities: [],
        challenges: [],
      };

      await updatePositioningDocumentForProject(projectId, mergedPayload);
      setSelectedGoldenCircle({ what: [], how: [], why: [] });
      if (refreshData) await refreshData();
      toast.success('Golden Circle regenerated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to regenerate Golden Circle');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Get the current items based on active segment
  const getCurrentItems = () => {
    switch (activeSegment) {
      case 'why':
        return whyStatements.filter(item => item.state !== 'archived');
      case 'how':
        return howStatements.filter(item => item.state !== 'archived');
      case 'what':
        return whatStatements.filter(item => item.state !== 'archived');
      default:
        return [];
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
      let currentItems: any[] = [];
      let itemType: string;
      
      switch (activeSegment) {
        case 'why':
          currentItems = whyStatements;
          itemType = 'WHY';
          break;
        case 'how':
          currentItems = howStatements;
          itemType = 'HOW';
          break;
        case 'what':
          currentItems = whatStatements;
          itemType = 'WHAT';
          break;
      }
      
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
        toast.error("Failed to add custom item");
        return;
      }
      
      // Refresh data to update the UI
      await refreshData();
      
      toast.success(`Added new ${activeSegment.toUpperCase()} statement`);
      
      // Close dialog and reset input
      setDialogOpen(false);
      setCustomItemText("");
    } catch (error) {
      toast.error("Failed to add custom item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Generate 5 More CTA
  const handleGenerateMore = () => {
    setExtraNote("");
    setGenerateDialogOpen(true);
  };

  // Handler for submitting Generate 5 More
  const handleSubmitGenerateMore = async () => {
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
      const type = activeSegment.toUpperCase();
      const newOptions = await generateMoreOptions(type, contextJson, extraNote);
      // Insert each new option as a positioning_item
      let currentItems: any[] = [];
      switch (activeSegment) {
        case 'why': currentItems = whyStatements; break;
        case 'how': currentItems = howStatements; break;
        case 'what': currentItems = whatStatements; break;
      }
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
      toast.success(`Generated 5 new ${type} statements!`);
      setGenerateDialogOpen(false);
      setExtraNote("");
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate more options');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="text-center">
      <div className="flex justify-between items-start gap-3">
        <motion.h2
          className="text-[24px] font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Golden Circle
        </motion.h2>
        <Button
          variant="outline"
          className="border-cyan text-cyan hover:bg-cyan/10"
          onClick={handleRegenerate}
          disabled={isRegenerating || isAdvancing}
        >
          {isRegenerating ? 'Generating...' : 'Regenerate'}
        </Button>
      </div>
      
      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Start with purpose, not outputs.
      </motion.p>
      
      {/* Center the circle and make it bigger */}
      <div className="flex flex-col items-center justify-center mb-8">
        <motion.div
          className="relative w-[350px] h-[350px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg width="350" height="350" viewBox="0 0 350 350">
            {/* Wheel background */}
            <circle cx="175" cy="175" r="175" fill="#262626" stroke="#fff" strokeWidth="1" />
            <circle cx="175" cy="175" r="115" fill="transparent" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
            <circle cx="175" cy="175" r="55" fill="transparent" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
            
            {/* WHY circle */}
            <g onClick={() => handleSegmentClick('why')}>
              <circle
                cx="175"
                cy="175"
                r="175"
                fill={activeSegment === 'why' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="175"
                cy="175"
                r="175"
                fill="transparent"
                stroke={activeSegment === 'why' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="175"
                y="50" /* Moved up from 60 to avoid intersection with ring */
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'why' ? "#888888" : "#999999"}
                className="font-semibold text-2xl transition-colors duration-300 pointer-events-none"
              >
                WHY
              </text>
            </g>
            
            {/* HOW circle */}
            <g onClick={() => handleSegmentClick('how')}>
              <circle
                cx="175"
                cy="175"
                r="115"
                fill={activeSegment === 'how' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="175"
                cy="175"
                r="115"
                fill="transparent"
                stroke={activeSegment === 'how' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="175"
                y="110"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'how' ? "#888888" : "#999999"}
                className="font-semibold text-2xl transition-colors duration-300 pointer-events-none"
              >
                HOW
              </text>
            </g>
            
            {/* WHAT circle */}
            <g onClick={() => handleSegmentClick('what')}>
              <circle
                cx="175"
                cy="175"
                r="55"
                fill={activeSegment === 'what' ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                className="transition-colors duration-300 cursor-pointer"
              />
              <circle
                cx="175"
                cy="175"
                r="55"
                fill="transparent"
                stroke={activeSegment === 'what' ? "#888888" : "#E0E0E0"}
                strokeWidth="2"
                className="transition-colors duration-300"
              />
              <text
                x="175"
                y="175"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={activeSegment === 'what' ? "#888888" : "#999999"}
                className="font-semibold text-2xl transition-colors duration-300 pointer-events-none"
              >
                WHAT
              </text>
            </g>
          </svg>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">Tap on a circle to switch</p>
        </motion.div>
      </div>
      
      {/* Statements section - now below the circle */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-center">
            {activeSegment.toUpperCase()} Statements
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
              size="sm"
            >
              <Plus size={16} />
              {activeSegment.toUpperCase()}
            </Button>
            <Button
              onClick={handleGenerateMore}
              className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
              size="sm"
            >
              ⚡️ 5 More
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="h-[150px] bg-muted/20 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {getCurrentItems().length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No Golden Circle statements yet. Add your WHAT, HOW, and WHY to get started.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                {getCurrentItems().map((item, index) => (
                  <motion.div
                    key={`${activeSegment}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <StickyNote
                      id={item.id}
                      content={item.content}
                      isSelected={item.state === 'selected'}
                      isDiscarded={discardedIdeas.includes(item.content)}
                      onClick={() => handleSelect(activeSegment, item.content)}
                      onDiscard={() => handleDiscard(item.content)}
                      className="h-[150px] w-full"
                      color={item.state === 'selected' ? "#7DF9FF" : "#FFEB3B"} /* Change color to cyan when selected */
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add custom item dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {activeSegment.toUpperCase()} Statement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={customItemText}
              onChange={(e) => setCustomItemText(e.target.value)}
              placeholder={`Enter your ${activeSegment.toLowerCase()} statement...`}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCustomItem} 
              disabled={isSubmitting || !customItemText.trim()}
            >
              {isSubmitting ? "Adding..." : "Add Statement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate 5 More dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate 5 More {activeSegment.toUpperCase()} Statements</DialogTitle>
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
      
      <div className="mt-8 text-right">
        {isAdvancing && (
          <div className="text-sm text-muted-foreground mb-2">Generating...</div>
        )}
        <Button
          onClick={handleComplete}
          className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
          disabled={!hasAtLeastOnePerBucket || isAdvancing}
          >
          {hasExistingOppChal ? 'Next' : 'Complete & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default GoldenCircle;