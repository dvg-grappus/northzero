import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";
import StickyNote from "./StickyNote";
import { PositioningContext } from "@/contexts/PositioningContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const mockMilestones = [
  "Launch MVP with core features",
  "Reach 1000 active users",
  "Release premium tier with advanced features",
  "Expand to enterprise market",
  "Introduce collaborative team features",
  "Launch mobile app with full feature parity"
];

const timelinePoints = ["Now", "1 yr", "3 yr", "5 yr", "10 yr"];

const Roadmap: React.FC = () => {
  const { roadmapMilestones, setRoadmapMilestones, completeStep } = useContext(PositioningContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [discardedMilestones, setDiscardedMilestones] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customMilestone, setCustomMilestone] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverTimepoint, setDragOverTimepoint] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMilestones(mockMilestones);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  const handleAssignMilestone = (milestone: string, timePoint: string) => {
    const updatedMilestones = { ...roadmapMilestones };
    
    Object.keys(updatedMilestones).forEach(point => {
      updatedMilestones[point] = updatedMilestones[point].filter(m => m !== milestone);
    });
    
    updatedMilestones[timePoint] = [...updatedMilestones[timePoint], milestone];
    
    setRoadmapMilestones(updatedMilestones);
  };
  
  const handleDiscardMilestone = (milestone: string) => {
    setDiscardedMilestones(prev => 
      prev.includes(milestone)
        ? prev.filter(m => m !== milestone)
        : [...prev, milestone]
    );
    
    const updatedMilestones = { ...roadmapMilestones };
    
    Object.keys(updatedMilestones).forEach(point => {
      updatedMilestones[point] = updatedMilestones[point].filter(m => m !== milestone);
    });
    
    setRoadmapMilestones(updatedMilestones);
  };
  
  const addCustomMilestone = () => {
    if (customMilestone.trim()) {
      setMilestones(prev => [...prev, customMilestone]);
      setCustomMilestone("");
      setDialogOpen(false);
    }
  };
  
  const isMilestoneAssigned = (milestone: string) => {
    return Object.values(roadmapMilestones).some(pointMilestones => 
      pointMilestones.includes(milestone)
    );
  };
  
  const getMilestoneTimepoint = (milestone: string) => {
    for (const point of timelinePoints) {
      if (roadmapMilestones[point].includes(milestone)) {
        return point;
      }
    }
    return null;
  };
  
  const validateRoadmap = () => {
    return true;
  };
  
  const handleComplete = () => {
    completeStep("roadmap");
  };
  
  const getAvailableMilestones = () => {
    return milestones.filter(milestone => {
      return !discardedMilestones.includes(milestone) && 
             !Object.values(roadmapMilestones).some(pointMilestones => 
               pointMilestones.includes(milestone)
             );
    });
  };
  
  return (
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
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
          >
            <Plus size={16} />
            Add Custom Milestone
          </Button>
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
                            {roadmapMilestones[point].map((milestone, idx) => (
                              <motion.div
                                key={`${point}-${idx}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <StickyNote
                                  id={milestone}
                                  content={milestone}
                                  isSelected={true}
                                  isDiscarded={false}
                                  onClick={() => {/* Already assigned */}}
                                  onDiscard={() => handleDiscardMilestone(milestone)}
                                  color="#FFEB3B"
                                  className="border border-border/40"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Available Milestones</h3>
                
                {isLoading ? (
                  <div className="flex flex-col items-center mt-8">
                    <div className="w-full h-[220px] bg-muted/20 animate-pulse rounded-lg mb-4"></div>
                    <p className="text-muted-foreground">Still shaping ideas... one second.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    {getAvailableMilestones().map((milestone, index) => (
                      <div 
                        key={`milestone-${index}`}
                        className="relative"
                      >
                        <div
                          className="cursor-grab active:cursor-grabbing"
                          id={milestone}
                        >
                          <StickyNote
                            id={milestone}
                            content={milestone}
                            isSelected={false}
                            isDiscarded={discardedMilestones.includes(milestone)}
                            onClick={() => {/* No action on click */}}
                            onDiscard={() => handleDiscardMilestone(milestone)}
                            color="#FFEB3B"
                            className="border border-border/40"
                          />
                        </div>
                        
                        <div className="mt-2 flex justify-start gap-2">
                          {timelinePoints.map(point => (
                            <button
                              key={point}
                              onClick={() => handleAssignMilestone(milestone, point)}
                              className="px-2 py-1 text-xs bg-muted/30 hover:bg-muted/50 rounded text-muted-foreground"
                            >
                              {point}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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
            <Button onClick={addCustomMilestone}>Add Milestone</Button>
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
    </>
  );
};

export default Roadmap;
