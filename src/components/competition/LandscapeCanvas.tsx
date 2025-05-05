
import React, { useRef, useEffect, useState } from "react";
import { Camera, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompetition } from "@/providers/CompetitionProvider";

// Import refactored components
import { CompetitorToken } from "./landscape/CompetitorToken";
import { BrandPin } from "./landscape/BrandPin";
import { AxisLabelEditor } from "./landscape/AxisLabelEditor";
import { CompetitorSelector } from "./landscape/CompetitorSelector";
import { CustomPinForm } from "./landscape/CustomPinForm";

export const LandscapeCanvas: React.FC = () => {
  const { 
    selectedCompetitors,
    competitors,
    updateCompetitorPosition,
    axes,
    updateAxisLabels,
    brandPosition,
    setBrandPosition,
    createSnapshot,
    toggleSelectCompetitor
  } = useCompetition();
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  // Get the selected competitors with a special check for Google Primer to mark as "you"
  const selectedCompetitorData = competitors.filter(
    comp => selectedCompetitors.includes(comp.id)
  ).map(comp => ({
    ...comp,
    type: comp.name === "Google Primer" ? "you" as const : comp.type
  }));
  
  // Preselect competitors and set initial positions if not already set
  useEffect(() => {
    const defaultCompetitorIds = ["1", "2", "3", "6", "8"];
    
    // Add default competitors if none selected
    if (selectedCompetitors.length === 0) {
      defaultCompetitorIds.forEach(id => {
        toggleSelectCompetitor(id);
      });
    }
    
    // Initialize all competitors with positions if not set
    competitors.forEach(comp => {
      if (!comp.position) {
        const randomX = 0.3 + Math.random() * 0.4; // 0.3 - 0.7 range
        const randomY = 0.3 + Math.random() * 0.4; // 0.3 - 0.7 range
        updateCompetitorPosition(comp.id, { x: randomX, y: randomY });
      }
    });
  }, [competitors, selectedCompetitors, toggleSelectCompetitor, updateCompetitorPosition]);
  
  // Update canvas size on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-medium">Competitive Landscape</h2>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs max-w-[240px]">
                  Drag competitors to position them on the map. The closer they are, the more similar their offerings.
                  Circle size represents market importance.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={createSnapshot}
          >
            <Camera className="h-4 w-4" />
            Snapshot
          </Button>
        </div>
      </div>
      
      {/* Competitor selection & custom pin toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <CompetitorSelector />
          <CustomPinForm />
        </div>
        
        <div className="text-xs text-muted-foreground">
          {selectedCompetitorData.length} competitors shown
        </div>
      </div>
      
      {/* Canvas container */}
      <div className="relative">
        {/* The actual canvas */}
        <div 
          id="landscape-canvas"
          ref={canvasRef}
          className="w-full h-[500px] bg-muted/20 rounded-lg border border-border relative overflow-hidden"
        >
          {/* Axes lines */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/50"></div>
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-border/50"></div>
          
          {/* Concentric rings */}
          <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2">
            <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] border border-border/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] border border-border/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[40%] h-[40%] border border-border/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[20%] h-[20%] border border-border/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/80 p-1 rounded">
              Selected: {selectedCompetitorData.length} | Canvas: {Math.round(canvasSize.width)}×{Math.round(canvasSize.height)}
            </div>
          )}
          
          {/* Competitor tokens */}
          {selectedCompetitorData.map(competitor => (
            <CompetitorToken
              key={competitor.id}
              id={competitor.id}
              name={competitor.name}
              type={competitor.type}
              position={competitor.position || { x: 0.5, y: 0.5 }}
              priority={competitor.priority}
              alexaRank={competitor.alexaRank}
              fundingStage={competitor.fundingStage}
              website={competitor.website}
              onDragEnd={updateCompetitorPosition}
            />
          ))}
          
          {/* Our brand pin */}
          <BrandPin 
            position={brandPosition} 
            onDragEnd={setBrandPosition} 
          />
        </div>
        
        {/* X-axis label editor */}
        <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 flex items-center">
          <AxisLabelEditor 
            axis="x"
            labels={axes.x}
            onUpdate={updateAxisLabels}
          />
        </div>
        
        {/* Y-axis label editor - repositioned to be visible */}
        <div className="absolute top-1/2 left-[-70px] transform -translate-y-1/2 -rotate-90">
          <AxisLabelEditor 
            axis="y"
            labels={axes.y}
            onUpdate={updateAxisLabels}
          />
        </div>
      </div>
      
      {/* Empty state for no competitors */}
      {selectedCompetitorData.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-muted-foreground mb-2">No competitors selected</p>
          <p className="text-sm text-muted-foreground">Use the "Add Competitors" button to select competitors</p>
        </div>
      )}
    </div>
  );
};
