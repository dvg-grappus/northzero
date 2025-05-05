import React, { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";
import StickyNote from "./StickyNote";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { generateMoreOptions } from '@/services/openaiService';

const timelinePoints = ["Now", "1 yr", "3 yr", "5 yr", "10 yr"];

interface RoadmapProps {
  onComplete?: () => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ onComplete }) => {
  const { roadmapMilestones, setRoadmapMilestones, completeStep } = useContext(PositioningContext);
  const { milestones, isLoading, updateMilestoneSlot, updateItemState, refreshData, projectId } = usePositioningData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customMilestone, setCustomMilestone] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverTimepoint, setDragOverTimepoint] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [localMilestones, setLocalMilestones] = useState<any[]>([]);
  const [availableMilestones, setAvailableMilestones] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Generate 5 More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [extraNote, setExtraNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Initialize with data from database only once
  useEffect(() => {
    if (!isLoading && !initialized && milestones.length > 0) {
      console.log("Initializing roadmap with milestones:", milestones);
      
      // Create a local copy of milestones to work with
      setLocalMilestones(milestones);
      
      // Initialize UI state from database
      const initialMilestones: Record<string, string[]> = {
        "Now": [],
        "1 yr": [],
        "3 yr": [],
        "5 yr": [],
        "10 yr": []
      };
      
      // Map database slots to UI timepoints
      const slotToTimepoint: Record<string, string> = {
        'now': 'Now',
        '1yr': '1 yr',
        '3yr': '3 yr',
        '5yr': '5 yr',
        '10yr': '10 yr'
      };
      
      // Populate the UI state
      milestones.forEach(milestone => {
        if (milestone.slot && milestone.slot !== 'unassigned' && slotToTimepoint[milestone.slot]) {
          const timepoint = slotToTimepoint[milestone.slot];
          initialMilestones[timepoint] = [...initialMilestones[timepoint], milestone.content];
        }
      });
      
      setRoadmapMilestones(initialMilestones);
      
      // Set available milestones
      const available = milestones.filter(m => m.state !== 'archived' && m.slot === 'unassigned');
      setAvailableMilestones(available);
      
      setInitialized(true);
    }
  }, [isLoading, milestones, setRoadmapMilestones, initialized]);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setDragOverTimepoint(null);
    
    const { active, over } = event;
    if (!over) return;
    
    const milestoneId = active.id as string;
    const timepoint = over.id as string;
    
    if (timelinePoints.includes(timepoint)) {
      handleAssignMilestone(milestoneId, timepoint);
    }
  };
  
  const handleDragOver = (timepoint: string) => {
    setDragOverTimepoint(timepoint);
  };
  
  const handleAssignMilestone = async (milestoneId: string, timePoint: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const milestone = localMilestones.find(m => m.id === milestoneId);
      if (!milestone) {
        setIsUpdating(false);
        return;
      }
      const slotMapping: Record<string, 'now' | '1yr' | '3yr' | '5yr' | '10yr'> = {
        'Now': 'now', '1 yr': '1yr', '3 yr': '3yr', '5 yr': '5yr', '10 yr': '10yr'
      };
      const dbSlot = slotMapping[timePoint];
      if (!dbSlot) {
        setIsUpdating(false);
        return;
      }
      setLocalMilestones(prev => prev.map(m =>
        m.id === milestoneId ? { ...m, slot: dbSlot, state: 'selected' } : m
      ));
      const updatedMilestones = { ...roadmapMilestones };
      Object.keys(updatedMilestones).forEach(point => {
        updatedMilestones[point] = updatedMilestones[point].filter(m => m !== milestone.content);
      });
      updatedMilestones[timePoint] = [...updatedMilestones[timePoint], milestone.content];
      setRoadmapMilestones(updatedMilestones);
      setAvailableMilestones(prev => prev.filter(m => m.id !== milestoneId));
      await updateMilestoneSlot(milestoneId, dbSlot);
      await updateItemState(milestoneId, 'selected');
    } catch (error) {
      console.error("Error assigning milestone:", error);
      toast.error("Failed to assign milestone");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDiscardMilestone = async (milestone: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const milestoneItem = localMilestones.find(m => m.content === milestone);
      if (!milestoneItem) {
        setIsUpdating(false);
        return;
      }
      // Mark as archived in localMilestones
      setLocalMilestones(prev => prev.map(m =>
        m.id === milestoneItem.id ? { ...m, state: 'archived' } : m
      ));
      // Remove from all roadmapMilestones slots
      setRoadmapMilestones(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(point => {
          updated[point] = updated[point].filter(m => m !== milestone);
        });
        return updated;
      });
      // Remove from availableMilestones
      setAvailableMilestones(prev => prev.filter(m => m.id !== milestoneItem.id));
      await updateItemState(milestoneItem.id, 'archived');
      await refreshData();
    } catch (error) {
      console.error("Error discarding milestone:", error);
      toast.error("Failed to discard milestone");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const addCustomMilestone = async () => {
    if (!customMilestone.trim()) {
      toast.error("Please enter a milestone");
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
      
      // Get the current milestones to determine the next index
      const nextIdx = milestones.length;
      
      // Insert the new milestone
      const { data: newItem, error } = await supabase
        .from('positioning_items')
        .insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: 'MILESTONE',
          content: customMilestone,
          slot: 'unassigned',
          idx: nextIdx,
          state: 'draft',
          source: 'user'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding custom milestone:", error);
        toast.error("Failed to add custom milestone");
        return;
      }
      
      // Refresh data to update the UI
      await refreshData();
      
      // Update local state
      setLocalMilestones(prev => [...prev, newItem]);
      setAvailableMilestones(prev => [...prev, newItem]);
      
      toast.success("Custom milestone added");
      
      // Close dialog and reset input
      setDialogOpen(false);
      setCustomMilestone("");
    } catch (error) {
      console.error("Error adding custom milestone:", error);
      toast.error("Failed to add custom milestone");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle clicking on a milestone card
  const handleMilestoneClick = async (milestoneId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      // Find the milestone in the local milestones
      const milestone = localMilestones.find(m => m.id === milestoneId);
      if (!milestone) {
        setIsUpdating(false);
        return;
      }
      
      // If the milestone is assigned to a slot, move it back to unassigned
      if (milestone.slot !== 'unassigned') {
        // Update local state immediately
        const updatedLocalMilestones = localMilestones.map(m => 
          m.id === milestoneId 
            ? { ...m, slot: 'unassigned', state: 'draft' } 
            : m
        );
        setLocalMilestones(updatedLocalMilestones);
        
        // Update the UI state
        const updatedMilestones = { ...roadmapMilestones };
        
        // Find which timepoint the milestone is in
        const timepoint = Object.keys(updatedMilestones).find(point => 
          updatedMilestones[point].includes(milestone.content)
        );
        
        // Remove from the timepoint
        if (timepoint) {
          updatedMilestones[timepoint] = updatedMilestones[timepoint].filter(m => m !== milestone.content);
          setRoadmapMilestones(updatedMilestones);
        }
        
        // Add to available milestones immediately
        setAvailableMilestones(prev => [...prev, {...milestone, slot: 'unassigned', state: 'draft'}]);
        
        // Update the database
        await updateMilestoneSlot(milestoneId, 'unassigned');
        await updateItemState(milestoneId, 'draft');
      }
    } catch (error) {
      console.error("Error handling milestone click:", error);
      toast.error("Failed to update milestone");
    } finally {
      setIsUpdating(false);
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
      const newOptions = await generateMoreOptions('MILESTONE', contextJson, extraNote);
      // Insert each new option as a positioning_item
      const nextIdx = milestones.length;
      for (let i = 0; i < newOptions.length; i++) {
        const content = newOptions[i];
        await supabase.from('positioning_items').insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: 'MILESTONE',
          content,
          slot: 'unassigned',
          idx: nextIdx + i,
          state: 'draft',
          source: 'ai'
        });
      }
      await new Promise(res => setTimeout(res, 300)); // Add delay before refresh
      await refreshData();
      setInitialized(false);
      toast.success('Generated 5 new milestones!');
      setGenerateDialogOpen(false);
      setExtraNote("");
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate more options');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else if (completeStep) {
      completeStep("roadmap");
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Roadmap</h2>
      {milestones.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No milestones yet. Add milestones to build your roadmap.
        </div>
      ) : (
        <>
          <div className="col-span-12">
            <motion.p
              className="text-gray-500 text-sm mb-1 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Plot the headlines you'll write.
            </motion.p>
            
            <motion.h1
              className="text-[32px] font-bold mb-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Roadmap
            </motion.h1>
            
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                >
                  <Plus size={16} />
                  MILESTONE
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
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <motion.div
                className="bg-secondary/30 p-6 rounded-lg shadow-sm mb-8 border border-border/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Timeline</h3>
                    <div className="relative">
                      <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-600/30"></div>
                      {timelinePoints.map((point, index) => (
                        <div
                          key={point}
                          id={point}
                          className={`relative mb-12 ${
                            dragOverTimepoint === point 
                              ? "bg-muted/30 rounded-lg" 
                              : ""
                          }`}
                          onMouseEnter={() => activeDragId && handleDragOver(point)}
                          onMouseLeave={() => setDragOverTimepoint(null)}
                        >
                          <div className="flex items-start">
                            <div 
                              className="w-8 h-8 rounded-full bg-muted-foreground/20 border-2 border-muted-foreground flex items-center justify-center z-10 mr-4"
                            >
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                            
                            <div>
                              <h4 className="text-base font-semibold mb-2">{point}</h4>
                              <div className="pl-2 space-y-3 min-h-[100px]">
                                {roadmapMilestones[point]?.map((milestone, idx) => {
                                  // Find the milestone item to get its ID
                                  const milestoneItem = localMilestones.find(m => m.content === milestone);
                                  return milestoneItem ? (
                                    <motion.div
                                      key={`${point}-${idx}`}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.1 * idx }}
                                    >
                                      <StickyNote
                                        id={milestoneItem.id}
                                        content={milestone}
                                        isSelected={true}
                                        isDiscarded={false}
                                        onClick={() => handleMilestoneClick(milestoneItem.id)}
                                        onDiscard={() => handleDiscardMilestone(milestone)}
                                        color="#7DF9FF"
                                        className="border border-border/40"
                                      />
                                    </motion.div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Available Milestones</h3>
                    
                    {isLoading && !initialized ? (
                      <div className="flex flex-col items-center mt-8">
                        <div className="w-full h-[220px] bg-muted/20 animate-pulse rounded-lg mb-4"></div>
                        <p className="text-muted-foreground">Still shaping ideas... one second.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        {availableMilestones.length > 0 ? (
                          availableMilestones.map((milestone, index) => (
                            <div 
                              key={`milestone-${milestone.id}`}
                              className="relative"
                            >
                              <div
                                className="cursor-grab active:cursor-grabbing"
                                id={milestone.id}
                              >
                                <StickyNote
                                  id={milestone.id}
                                  content={milestone.content}
                                  isSelected={false}
                                  isDiscarded={false}
                                  onClick={() => handleMilestoneClick(milestone.id)}
                                  onDiscard={() => handleDiscardMilestone(milestone.content)}
                                  color="#FFEB3B"
                                  className="border border-border/40"
                                />
                              </div>
                              
                              <div className="mt-2 flex justify-start gap-2">
                                {timelinePoints.map(point => (
                                  <button
                                    key={point}
                                    onClick={() => handleAssignMilestone(milestone.id, point)}
                                    className="px-2 py-1 text-xs bg-muted/30 hover:bg-muted/50 rounded text-muted-foreground"
                                  >
                                    {point}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No available milestones</p>
                            <p className="text-sm mt-2">All milestones have been assigned or archived</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </DndContext>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Milestone</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={customMilestone}
                  onChange={(e) => setCustomMilestone(e.target.value)}
                  placeholder="Enter your milestone..."
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={addCustomMilestone}
                  disabled={isSubmitting || !customMilestone.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Milestone"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="mt-6 text-right">
            <Button
              onClick={handleComplete}
              className="bg-white text-black hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
            >
              Save timeline
            </Button>
          </div>
          
          {/* Generate 5 More dialog */}
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate 5 More Milestones</DialogTitle>
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
        </>
      )}
    </div>
  );
};

export default Roadmap;