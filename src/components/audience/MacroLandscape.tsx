import React, { useState, useRef, useEffect } from "react";
import { Camera, Plus, Zap, X as XIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonAdd from "@/components/ui/ButtonAdd";
import ButtonMore from "@/components/ui/ButtonMore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  generateAudienceData, 
  getAudienceData, 
  getWinningCohorts, 
  saveWinningCohorts, 
  addAudienceCohortItem, // Corrected: was addCustomCohort before service rename
  deleteAudienceCohort, 
  generateMoreCohorts 
} from "@/services/audienceService";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ResetAudienceStateButton from "./ResetAudienceStateButton";
import { AxisLabelEditor } from "./AxisLabelEditor";
import { SelectWinnersModal } from './SelectWinnersModal';
import type { CustomCohortData } from "@/services/audienceService"; // Import the new type

// Types
export interface Cohort {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  state: string;
}

interface CohortPosition {
  x: number;
  y: number;
}

export interface Plot {
  label: "Plot α" | "Plot β" | "Plot γ";
  x1: string;
  x2: string;
  y1: string;
  y2: string;
  placements: Array<{
    cohortId: string;
    x: number;
    y: number;
  }>;
  selected_cohort_ids?: string[];
}

export interface WinningCohortSelection {
  primary: string | null;
  secondary: string | null;
  tertiary: string | null;
}

interface MacroLandscapeProps {
  onComplete: () => void;
}

const STEPS = [
  { key: "cohort-canvas", label: "Landscape" },
  { key: "cohort-board", label: "Demographics" },
  { key: "persona-gallery", label: "Personas" },
  { key: "simulations", label: "Simulation Lab" },
  { key: "insight-review", label: "Insight Pool" }
];

const SEGMENTS = ["Plot α", "Plot β", "Plot γ"];

export const MacroLandscape: React.FC<MacroLandscapeProps> = ({ onComplete }) => {
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[MacroLandscape] Mounted. projectId from location.state:', projectId);
  }, [projectId]);

  // Segment state
  const [activeSegment, setActiveSegment] = useState(0);

  // Current step in the overall process - defaulting to 0 (Landscape step)
  const [currentStep, setCurrentStep] = useState(0);

  // Helper to create a default segment state
  const createDefaultSegmentState = () => ({
    selectedCohorts: [] as string[],
    cohortPositions: {} as Record<string, CohortPosition>,
    xLabels: ["", ""],
    yLabels: ["", ""],
  });

  const [segmentStates, setSegmentStates] = useState([
    createDefaultSegmentState(),
    createDefaultSegmentState(),
    createDefaultSegmentState(),
  ]);

  // Proxy state for current segment, with guard
  const currentSegmentState = segmentStates[activeSegment] || createDefaultSegmentState();
  const selectedCohorts = currentSegmentState.selectedCohorts;
  const cohortPositions = currentSegmentState.cohortPositions;
  const xLabels = currentSegmentState.xLabels;
  const yLabels = currentSegmentState.yLabels;

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    cohortId: string | null;
    startX: number;
    startY: number;
    startPinX: number;
    startPinY: number;
  }>({
    isDragging: false,
    cohortId: null,
    startX: 0,
    startY: 0,
    startPinX: 0,
    startPinY: 0
  });

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);

  // State for winning cohorts
  const [winningCohorts, setWinningCohorts] = useState<WinningCohortSelection>({ primary: null, secondary: null, tertiary: null });
  const [isSelectWinnersModalOpen, setIsSelectWinnersModalOpen] = useState(false);

  // State for "+ COHORT" Dialog
  const [isAddCustomCohortDialogOpen, setIsAddCustomCohortDialogOpen] = useState(false);
  const [customCohortName, setCustomCohortName] = useState("");
  const [customCohortDescription, setCustomCohortDescription] = useState("");
  const [customCohortWhy, setCustomCohortWhy] = useState("");
  const [isSubmittingCustomCohort, setIsSubmittingCustomCohort] = useState(false);

  // State for "⚡️ 5 NEW" Dialog
  const [isGenerateCohortsDialogOpen, setIsGenerateCohortsDialogOpen] = useState(false);
  const [generateCohortsExtraNote, setGenerateCohortsExtraNote] = useState("");
  const [isGeneratingCohorts, setIsGeneratingCohorts] = useState(false);

  // State for discard confirmation dialog
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [cohortToDiscard, setCohortToDiscard] = useState<string | null>(null);

  // Log when segment changes to track axis labels and plotted cohorts
  useEffect(() => {
    if (plots.length > 0) {
      const currentPlot = plots.find(p => p.label === SEGMENTS[activeSegment]);
      
      if (currentPlot) {
        console.log(`[DEBUG] Switched to ${SEGMENTS[activeSegment]}`);
        console.log(`[DEBUG] Axis Labels should be: X: "${currentPlot.x1}" → "${currentPlot.x2}", Y: "${currentPlot.y1}" → "${currentPlot.y2}"`);
        console.log(`[DEBUG] Plot data from API:`, currentPlot);
        
        // Update the segment state with the current plot's data
        updateSegmentState({
          xLabels: [currentPlot.x1, currentPlot.x2],
          yLabels: [currentPlot.y1, currentPlot.y2],
        });
        
        // We need to refresh cohort selections from the database when switching tabs
        refreshCohortSelections();
      } else {
        console.log(`[DEBUG] No plot found for ${SEGMENTS[activeSegment]}`);
      }
    }
  }, [activeSegment, plots]);

  // Function to convert from API coordinates (-1 to 1) to UI coordinates (0 to 1)
  // NOTE: Y-axis is inverted, with y1 at top (y=0) and y2 at bottom (y=1)
  const apiToUICoordinates = (x: number, y: number): CohortPosition => {
    // Ensure inputs are numbers and in valid range
    const numX = typeof x === 'number' ? x : 0;
    const numY = typeof y === 'number' ? y : 0;
    
    // Clamp input values to [-1, 1] range
    const clampedX = Math.max(-1, Math.min(1, numX));
    const clampedY = Math.max(-1, Math.min(1, numY));
    
    // Convert from [-1, 1] to [0, 1] for X and invert Y
    // Y axis is inverted, so -1 maps to 0 (top) and 1 maps to 1 (bottom)
    return {
      x: (clampedX + 1) / 2,
      y: (clampedY + 1) / 2
    };
  };

  // Function to convert from UI coordinates (0 to 1) to API coordinates (-1 to 1)
  // NOTE: Y-axis is inverted, with y1 at top (y=0) and y2 at bottom (y=1)
  const uiToAPICoordinates = (x: number, y: number) => {
    // Ensure inputs are numbers and in valid range
    const numX = typeof x === 'number' ? x : 0.5;
    const numY = typeof y === 'number' ? y : 0.5;
    
    // Clamp input values to [0, 1] range
    const clampedX = Math.max(0, Math.min(1, numX));
    const clampedY = Math.max(0, Math.min(1, numY));
    
    // Convert from [0, 1] to [-1, 1] for X and invert Y
    // Y axis is inverted, so 0 maps to -1 (top) and 1 maps to 1 (bottom)
    return {
      x: clampedX * 2 - 1,
      y: clampedY * 2 - 1
    };
  };

  // Function to refresh cohort selections from database
  const refreshCohortSelections = async () => {
    try {
      console.log('[DEBUG] Refreshing cohort selections from database');
      
      if (!projectId) {
        console.error('[ERROR] No project ID available for refresh');
        return;
      }
      
      // Get the current plot
      const currentPlotLabel = SEGMENTS[activeSegment];
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        return;
      }
      
      // Find the specific plot by label in the extra_json field
      let plotData = null;
      let plotItem = null;
      
      // First try exact matching
      plotItem = plotItems?.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      if (!plotItem && plotItems && plotItems.length > 0) {
        // If no match found and we have plotItems, use the first one as fallback
        console.warn(`[ERROR] No plot found for label ${currentPlotLabel}, using first available plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] Plot not found');
        return;
      }
      
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : plotItem.extra_json;
      } catch (e) {
        console.error('[ERROR] Failed to parse extra_json for plot:', e);
        return;
      }
      
      // Get the selected cohort IDs directly from the plot's selected_cohort_ids field
      // If it doesn't exist yet, fall back to deriving it from placements
      let selectedCohortIds: string[] = [];
      
      if (Array.isArray(plotData.selected_cohort_ids)) {
        // Use the plot-specific selection state if available
        selectedCohortIds = plotData.selected_cohort_ids;
        console.log(`[DEBUG] Using plot-specific selected_cohort_ids:`, selectedCohortIds);
      } else {
        // Legacy fallback: derive from placements
        const placements = Array.isArray(plotData?.placements) ? plotData.placements : [];
        selectedCohortIds = placements.map((p: any) => p.cohortId).filter(Boolean);
        console.log(`[DEBUG] No selected_cohort_ids found, deriving from placements:`, selectedCohortIds);
        
        // Migration: Update the plot with the derived selected_cohort_ids
        const updatedExtraJson = {
          ...plotData,
          selected_cohort_ids: selectedCohortIds
        };
        
        const { error: updateError } = await supabase
          .from('audience_items')
          .update({ extra_json: updatedExtraJson })
          .eq('id', plotItem.id);
          
        if (updateError) {
          console.error('[ERROR] Failed to migrate plot with selected_cohort_ids:', updateError);
        } else {
          console.log(`[DEBUG] Migrated plot with selected_cohort_ids:`, selectedCohortIds);
          plotData = updatedExtraJson;
        }
      }
      
      const placements = Array.isArray(plotData?.placements) ? plotData.placements : [];
      
      // Build positions map from placements
      const positionsMap: Record<string, CohortPosition> = {};
      
      placements.forEach((p: any) => {
        if (p && p.cohortId && (typeof p.x === 'number' || typeof p.y === 'number')) {
          // Convert from API coordinates (-1 to 1) to UI coordinates (0 to 1)
          positionsMap[p.cohortId] = apiToUICoordinates(p.x, p.y);
        }
      });
      
      console.log('[DEBUG] Refreshed positions map:', positionsMap);
      console.log('[DEBUG] Selected cohorts from plot:', selectedCohortIds);
      
      // Apply new state at once, being careful to maintain existing positions for cohorts
      // that might not have placements in the current plot
      setSegmentStates(prev => {
        const newStates = [...prev];
        const currentPositions = newStates[activeSegment].cohortPositions;
        
        const updatedPositions = { ...currentPositions };
        
        // Make sure every selected cohort has a position
        selectedCohortIds.forEach(id => {
          if (id && !positionsMap[id] && !updatedPositions[id]) {
            // If a selected cohort doesn't have a position, put it at a random position
            updatedPositions[id] = getRandomPosition();
          } else if (id && positionsMap[id]) {
            // Update with the position from the database
            updatedPositions[id] = positionsMap[id];
          }
        });
        
        newStates[activeSegment] = {
          ...newStates[activeSegment],
          selectedCohorts: selectedCohortIds,
          cohortPositions: updatedPositions
        };
        
        return newStates;
      });
    } catch (error) {
      console.error('[ERROR] Error refreshing cohort selections:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setError('No project ID found in navigation state.');
        setIsLoading(false);
        console.error('[MacroLandscape] No projectId found in navigation state.');
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        console.log('[MacroLandscape] Fetching audience data for projectId:', projectId);

        // Try to get existing data
        const data = await getAudienceData(projectId);
        
        if (data && Array.isArray(data.plots) && data.plots.length > 0) {
          console.log('[DEBUG] Audience data loaded successfully:');
          console.log('[DEBUG] Cohorts:', data.cohorts);
          console.log('[DEBUG] Plots:', data.plots);
          
          setCohorts(data.cohorts);
          
          // Ensure each plot has a selected_cohort_ids array before setting state
          const plotsWithSelection = data.plots.map(plot => {
            // If selected_cohort_ids is already present, use it
            if (Array.isArray(plot.selected_cohort_ids)) {
              return plot;
            }
            
            // Otherwise, derive it from placements
            const derivedSelectionIds = 
              (Array.isArray(plot.placements) ? plot.placements : [])
              .map(p => p.cohortId)
              .filter(Boolean);
            
            return {
              ...plot,
              selected_cohort_ids: derivedSelectionIds
            };
          });
          
          // Update plots in database to ensure selected_cohort_ids exists for all plots
          for (const plot of plotsWithSelection) {
            if (!plot.label) continue;
            
            // Find the plot item in the database
            const { data: plotItems } = await supabase
              .from('audience_items')
              .select('id, extra_json')
              .eq('project_id', projectId)
              .eq('item_type', 'plot');
              
            if (!plotItems || plotItems.length === 0) continue;
            
            // Find the matching plot
            const matchingPlot = plotItems.find(item => {
              try {
                const extraJson = typeof item.extra_json === 'string' 
                  ? JSON.parse(item.extra_json) 
                  : item.extra_json;
                
                return extraJson?.label === plot.label;
              } catch (e) {
                return false;
              }
            });
            
            if (!matchingPlot) continue;
            
            // Update the plot in the database with selected_cohort_ids
            let plotData;
            try {
              plotData = typeof matchingPlot.extra_json === 'string' 
                ? JSON.parse(matchingPlot.extra_json) 
                : matchingPlot.extra_json || {};
            } catch (e) {
              console.error('[ERROR] Failed to parse plot data during initialization:', e);
              continue;
            }
            
            // Only update if selected_cohort_ids doesn't exist or needs updating
            if (!Array.isArray(plotData.selected_cohort_ids)) {
              const updatedExtraJson = {
                ...plotData,
                selected_cohort_ids: plot.selected_cohort_ids
              };
              
              await supabase
                .from('audience_items')
                .update({ extra_json: updatedExtraJson })
                .eq('id', matchingPlot.id);
                
              console.log(`[DEBUG] Updated plot ${plot.label} with selected_cohort_ids:`, plot.selected_cohort_ids);
            }
          }
          
          // Set the updated plots with selection info
          setPlots(plotsWithSelection);
          
          // Initialize segment states with plot data, matching by label instead of array index
          const newSegmentStates = SEGMENTS.map((segmentLabel, idx) => {
            // Log available plots to debug matching issues
            console.log(`[DEBUG] Looking for plot with label "${segmentLabel}" among these plots:`, 
              plotsWithSelection.map(p => ({ label: p.label, x1: p.x1, x2: p.x2 })));
            
            // Find the plot that matches this segment label - be precise about matching
            const plot = plotsWithSelection.find(p => p.label === segmentLabel);
            
            if (plot) {
              console.log(`[DEBUG] Initializing segment state for ${segmentLabel}:`, plot);
              console.log(`[DEBUG] ${segmentLabel} X axis: "${plot.x1}" → "${plot.x2}"`);
              console.log(`[DEBUG] ${segmentLabel} Y axis: "${plot.y1}" → "${plot.y2}"`);
              console.log(`[DEBUG] ${segmentLabel} Placements:`, plot.placements);
              console.log(`[DEBUG] ${segmentLabel} Selected cohort IDs:`, plot.selected_cohort_ids);
              
              const segState = {
                // Use the plot's selected_cohort_ids field directly
                selectedCohorts: Array.isArray(plot.selected_cohort_ids) 
                  ? plot.selected_cohort_ids 
                  : plot.placements.map(p => p.cohortId),
                cohortPositions: plot.placements.reduce((acc, p) => ({
                  ...acc,
                  [p.cohortId]: { 
                    // Convert from -1...1 range to 0...1 range for display
                    x: (p.x + 1) / 2, 
                    y: (p.y + 1) / 2 
                  }
                }), {}),
                xLabels: [plot.x1, plot.x2],
                // Swap Y labels to match canvas orientation (y1 at top, y2 at bottom)
                yLabels: [plot.y1, plot.y2],
              };
              console.log(`[DEBUG] Resulting segment state for ${segmentLabel}:`, segState);
              return segState;
            } else {
              // Fallback - try to find the plot by index if label matching failed
              console.warn(`[DEBUG] No exact match for plot labeled ${segmentLabel}`);
              // Find alternative match using content or index fallback
              let indexedPlot = null;
              if (idx < plotsWithSelection.length) {
                indexedPlot = plotsWithSelection[idx];
                console.log(`[DEBUG] Using plot at index ${idx} as fallback:`, indexedPlot);
              }
              
              if (indexedPlot) {
                const segState = {
                  // Use the indexed plot's selected_cohort_ids
                  selectedCohorts: Array.isArray(indexedPlot.selected_cohort_ids)
                    ? indexedPlot.selected_cohort_ids
                    : indexedPlot.placements.map(p => p.cohortId),
                  cohortPositions: indexedPlot.placements.reduce((acc, p) => ({
                    ...acc,
                    [p.cohortId]: { 
                      // Convert from -1...1 range to 0...1 range for display
                      x: (p.x + 1) / 2, 
                      y: (p.y + 1) / 2 
                    }
                  }), {}),
                  xLabels: [indexedPlot.x1, indexedPlot.x2],
                  // Swap Y labels to match canvas orientation (y1 at top, y2 at bottom)
                  yLabels: [indexedPlot.y1, indexedPlot.y2],
                };
                return segState;
              }
              
              // If all else fails, use the default state
              console.warn(`[DEBUG] No matching plot found for ${segmentLabel} - using empty state`);
              return createDefaultSegmentState();
            }
          });
          setSegmentStates(newSegmentStates);
          
          // Fetch and set winning cohorts
          try {
            const winningData = await getWinningCohorts(projectId);
            if (winningData) {
              console.log('[DEBUG] Loaded winning cohorts:', winningData);
              setWinningCohorts(winningData);
            } else {
              console.log('[DEBUG] No winning cohorts found for this project.');
              // Ensure state is default if nothing is loaded
              setWinningCohorts({ primary: null, secondary: null, tertiary: null }); 
            }
          } catch (err) {
            console.error('[ERROR] Failed to load winning cohorts:', err);
            // Optionally set to default or handle error state for winning cohorts
            setWinningCohorts({ primary: null, secondary: null, tertiary: null });
          }
          
          // Log the final state setup
          console.log('[DEBUG] Final segment states initialized:', newSegmentStates);
          
          // Refresh cohort selections from the database to ensure we have the latest state
          setTimeout(() => {
            setIsLoading(false);
            refreshCohortSelections();
          }, 500);
        } else {
          // Generate new data if none exists
          await generateAudienceData(projectId);
          const newData = await getAudienceData(projectId);
          
          if (newData && Array.isArray(newData.plots) && newData.plots.length > 0) {
            console.log('[DEBUG] New audience data generated successfully:');
            console.log('[DEBUG] Cohorts:', newData.cohorts);
            console.log('[DEBUG] Plots:', newData.plots);
            
            setCohorts(newData.cohorts);
            
            // Ensure each plot has a selected_cohort_ids array
            const plotsWithSelection = newData.plots.map(plot => {
              if (Array.isArray(plot.selected_cohort_ids)) {
                return plot;
              }
              
              // Derive from placements
              const derivedSelectionIds = 
                (Array.isArray(plot.placements) ? plot.placements : [])
                .map(p => p.cohortId)
                .filter(Boolean);
              
              return {
                ...plot,
                selected_cohort_ids: derivedSelectionIds
              };
            });
            
            setPlots(plotsWithSelection);

            // Update database plots with selected_cohort_ids
            for (const plot of plotsWithSelection) {
              if (!plot.label) continue;
              
              // Find the plot item in the database
              const { data: plotItems } = await supabase
                .from('audience_items')
                .select('id, extra_json')
                .eq('project_id', projectId)
                .eq('item_type', 'plot');
                
              if (!plotItems || plotItems.length === 0) continue;
              
              // Find the matching plot
              const matchingPlot = plotItems.find(item => {
                try {
                  const extraJson = typeof item.extra_json === 'string' 
                    ? JSON.parse(item.extra_json) 
                    : item.extra_json;
                  
                  return extraJson?.label === plot.label;
                } catch (e) {
                  return false;
                }
              });
              
              if (!matchingPlot) continue;
              
              // Update the plot in the database
              let plotData;
              try {
                plotData = typeof matchingPlot.extra_json === 'string' 
                  ? JSON.parse(matchingPlot.extra_json) 
                  : matchingPlot.extra_json || {};
              } catch (e) {
                console.error('[ERROR] Failed to parse plot data during initialization:', e);
                continue;
              }
              
              if (!Array.isArray(plotData.selected_cohort_ids)) {
                const updatedExtraJson = {
                  ...plotData,
                  selected_cohort_ids: plot.selected_cohort_ids
                };
                
                await supabase
                  .from('audience_items')
                  .update({ extra_json: updatedExtraJson })
                  .eq('id', matchingPlot.id);
                  
                console.log(`[DEBUG] Updated new plot ${plot.label} with selected_cohort_ids:`, plot.selected_cohort_ids);
              }
            }

            // After new data generation, winning cohorts would be null initially
            setWinningCohorts({ primary: null, secondary: null, tertiary: null });
            console.log('[DEBUG] Initialized winning cohorts to null after new data generation.');

            // Initialize segment states with plot data, matching by label
            const newSegmentStates = SEGMENTS.map((segmentLabel, idx) => {
              // Find the plot that matches this segment label
              const plot = plotsWithSelection.find(p => p.label === segmentLabel);
              
              if (plot) {
                console.log(`[DEBUG] Initializing segment state for ${segmentLabel}:`, plot);
                return {
                  // Use selected_cohort_ids instead of deriving from placements
                  selectedCohorts: Array.isArray(plot.selected_cohort_ids)
                    ? plot.selected_cohort_ids
                    : plot.placements.map(p => p.cohortId),
                  cohortPositions: plot.placements.reduce((acc, p) => ({
                    ...acc,
                    [p.cohortId]: { 
                      // Convert from -1...1 range to 0...1 range for display
                      x: (p.x + 1) / 2, 
                      y: (p.y + 1) / 2 
                    }
                  }), {}),
                  xLabels: [plot.x1, plot.x2],
                  // Swap Y labels to match canvas orientation (y1 at top, y2 at bottom)
                  yLabels: [plot.y1, plot.y2],
                };
              } else {
                console.warn(`[DEBUG] No plot found with label ${segmentLabel}`);
                
                // If we have at least one plot, use some of its cohorts to create a default state for missing plots
                if (plotsWithSelection.length > 0 && newData.cohorts.length > 0) {
                  // Use the first plot as a reference
                  const referencePlot = plotsWithSelection[0];
                  const referenceSelectedCohorts = Array.isArray(referencePlot.selected_cohort_ids)
                    ? referencePlot.selected_cohort_ids
                    : referencePlot.placements.map(p => p.cohortId);
                  
                  // Create different axis labels for each missing plot
                  let defaultXLabels = ["", ""];
                  let defaultYLabels = ["", ""];
                  
                  if (segmentLabel === "Plot β") {
                    defaultXLabels = ["Low tech adoption", "High tech adoption"];
                    defaultYLabels = ["Budget-focused", "Premium-seeking"];
                    
                    // For Plot β, select cohorts 2, 3, 5, 6, 8 (if available)
                    const indices = [1, 2, 4, 5, 7]; // 0-based indices
                    const betaSelectedCohorts: string[] = [];
                    indices.forEach(index => {
                      if (index < referenceSelectedCohorts.length) {
                        betaSelectedCohorts.push(referenceSelectedCohorts[index]);
                      }
                    });
                    
                    // Arrange in a pattern suggesting technology vs budget relationships
                    const betaPositions: Record<string, CohortPosition> = {};
                    betaSelectedCohorts.forEach((cohortId, i) => {
                      // Create a more scattered, meaningful pattern
                      switch (i) {
                        case 0: betaPositions[cohortId] = { x: 0.2, y: 0.7 }; break; // low tech, budget
                        case 1: betaPositions[cohortId] = { x: 0.8, y: 0.2 }; break; // high tech, premium
                        case 2: betaPositions[cohortId] = { x: 0.3, y: 0.3 }; break; // mid-low tech, mid-premium
                        case 3: betaPositions[cohortId] = { x: 0.7, y: 0.8 }; break; // high tech, budget
                        case 4: betaPositions[cohortId] = { x: 0.5, y: 0.5 }; break; // mid tech, mid budget
                        default: betaPositions[cohortId] = { x: 0.5, y: 0.5 };
                      }
                    });
                    
                    return {
                      selectedCohorts: betaSelectedCohorts,
                      cohortPositions: betaPositions,
                      xLabels: defaultXLabels,
                      yLabels: defaultYLabels
                    };
                  } else if (segmentLabel === "Plot γ") {
                    defaultXLabels = ["Occasional users", "Daily users"];
                    defaultYLabels = ["Emotion-driven", "Data-driven"];
                    
                    // For Plot γ, select different cohorts - 1, 4, 5, 7 (if available)
                    const indices = [0, 3, 4, 6]; // 0-based indices
                    const gammaSelectedCohorts: string[] = [];
                    indices.forEach(index => {
                      if (index < referenceSelectedCohorts.length) {
                        gammaSelectedCohorts.push(referenceSelectedCohorts[index]);
                      }
                    });
                    
                    // Arrange in a pattern suggesting usage frequency vs decision-making style
                    const gammaPositions: Record<string, CohortPosition> = {};
                    gammaSelectedCohorts.forEach((cohortId, i) => {
                      // Create a different pattern for Gamma plot
                      switch (i) {
                        case 0: gammaPositions[cohortId] = { x: 0.3, y: 0.2 }; break; // occasional, emotion
                        case 1: gammaPositions[cohortId] = { x: 0.8, y: 0.8 }; break; // daily, data
                        case 2: gammaPositions[cohortId] = { x: 0.2, y: 0.8 }; break; // occasional, data 
                        case 3: gammaPositions[cohortId] = { x: 0.9, y: 0.3 }; break; // daily, emotion
                        default: gammaPositions[cohortId] = { x: 0.5, y: 0.5 };
                      }
                    });
                    
                    return {
                      selectedCohorts: gammaSelectedCohorts,
                      cohortPositions: gammaPositions,
                      xLabels: defaultXLabels,
                      yLabels: defaultYLabels
                    };
                  }
                  
                  // If not a known plot type, use the default grid positioning
                  console.log(`[DEBUG] Creating default state for ${segmentLabel} with axis labels: X: "${defaultXLabels[0]}" → "${defaultXLabels[1]}", Y: "${defaultYLabels[0]}" → "${defaultYLabels[1]}"`);
                  
                  // Select a subset of the cohorts from the reference plot (up to 6)
                  const defaultSelectedCohorts = referenceSelectedCohorts.slice(0, Math.min(6, referenceSelectedCohorts.length));
                  
                  // Create default positions for the selected cohorts
                  const defaultPositions: Record<string, CohortPosition> = {};
                  defaultSelectedCohorts.forEach((cohortId, i) => {
                    // Position them in a grid-like pattern
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    defaultPositions[cohortId] = {
                      x: 0.25 + (col * 0.25),
                      y: 0.25 + (row * 0.5)
                    };
                  });
                  
                  return {
                    selectedCohorts: defaultSelectedCohorts,
                    cohortPositions: defaultPositions,
                    xLabels: defaultXLabels,
                    yLabels: defaultYLabels
                  };
                }
                
                return createDefaultSegmentState();
              }
            });
            setSegmentStates(newSegmentStates);
            
            // Refresh cohort selections for newly generated data
            setTimeout(() => {
              setIsLoading(false);
              refreshCohortSelections();
            }, 500);
          } else {
            // If still no data, set to all defaults
            setSegmentStates([
              createDefaultSegmentState(),
              createDefaultSegmentState(),
              createDefaultSegmentState(),
            ]);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading audience data:', err);
        setError('Failed to load audience data. Please try again.');
        toast.error('Failed to load audience data');
        setSegmentStates([
          createDefaultSegmentState(),
          createDefaultSegmentState(),
          createDefaultSegmentState(),
        ]);
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

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

  // Update segment state helpers
  const updateSegmentState = (patch: Partial<typeof segmentStates[0]>) => {
    console.log(`[DEBUG] updateSegmentState called with patch:`, patch);
    console.log(`[DEBUG] Current activeSegment:`, activeSegment);
    console.log(`[DEBUG] Before update - segmentStates[${activeSegment}]:`, segmentStates[activeSegment]);
    
    setSegmentStates(prev => {
      const newStates = prev.map((seg, i) =>
        i === activeSegment ? { ...seg, ...patch } : seg
      );
      console.log(`[DEBUG] After update - segmentStates[${activeSegment}]:`, newStates[activeSegment]);
      return newStates;
    });
  };

  // Update handlers for each stateful prop
  const handleXLabelsUpdate = (_axis: "x" | "y", newLabels: string[]) => {
    if (!newLabels || newLabels.length !== 2) {
      console.error('[ERROR] Invalid X-axis labels:', newLabels);
      return;
    }
    
    console.log('[DEBUG] Updating X-axis labels:', newLabels);
    
    // Store the labels in the orientation expected by the UI:
    // newLabels[0] = x1 (left)
    // newLabels[1] = x2 (right)
    updateSegmentState({ xLabels: [newLabels[0], newLabels[1]] });
    
    // Update the active plot in the database
    updatePlotLabels('x', [newLabels[0], newLabels[1]]);
  };

  const handleYLabelsUpdate = (_axis: "x" | "y", newLabels: string[]) => {
    if (!newLabels || newLabels.length !== 2) {
      console.error('[ERROR] Invalid Y-axis labels:', newLabels);
      return;
    }
    
    console.log('[DEBUG] Updating Y-axis labels from editor:', newLabels);
    
    // IMPORTANT: newLabels are in REVERSED order from the editor
    // newLabels[0] is bottom label (y2)
    // newLabels[1] is top label (y1)
    // We need to flip them back to the correct orientation for storage
    const flippedLabels = [newLabels[1], newLabels[0]];
    
    console.log('[DEBUG] Flipped Y-axis labels for storage:', flippedLabels);
    
    // Store labels in the expected orientation:
    // yLabels[0] = y1 (top)
    // yLabels[1] = y2 (bottom)
    updateSegmentState({ yLabels: flippedLabels });
    
    // Update the active plot in the database
    updatePlotLabels('y', flippedLabels);
  };

  // Function to update plot labels in the database
  const updatePlotLabels = async (axis: 'x' | 'y', labels: string[]) => {
    try {
      if (!projectId) return;
      
      console.log(`[DEBUG] Updating ${axis}-axis labels in DB:`, labels);
      
      const currentPlotLabel = SEGMENTS[activeSegment];
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError || !plotItems || plotItems.length === 0) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        return;
      }
      
      // Find the specific plot
      let plotItem = plotItems.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      // If not found, try fallback
      if (!plotItem && plotItems.length > 0) {
        console.warn(`[WARN] Plot not found for label ${currentPlotLabel}, using first available plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] Plot not found for label:', currentPlotLabel);
        return;
      }
      
      // Get and parse the plot data
      let plotData;
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : { ...plotItem.extra_json };
        
        if (!plotData) plotData = {};
      } catch (e) {
        console.error('[ERROR] Failed to parse plot data:', e);
        plotData = {};
      }
      
      // Make a copy of the plot data to modify
      const updatedPlotData = { ...plotData };
      
      // Update the appropriate labels (X or Y)
      if (axis === 'x') {
        updatedPlotData.x1 = labels[0];
        updatedPlotData.x2 = labels[1];
        console.log(`[DEBUG] Setting X labels: x1=${labels[0]}, x2=${labels[1]}`);
      } else {
        updatedPlotData.y1 = labels[0];
        updatedPlotData.y2 = labels[1];
        console.log(`[DEBUG] Setting Y labels: y1=${labels[0]}, y2=${labels[1]}`);
      }
      
      console.log(`[DEBUG] Updating plot ${plotItem.id}:`, updatedPlotData);
      
      // Save to database
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ extra_json: updatedPlotData })
        .eq('id', plotItem.id);
        
      if (updateError) {
        console.error(`[ERROR] Failed to update ${axis}-axis labels:`, updateError);
        toast.error(`Failed to save ${axis}-axis labels`);
      } else {
        console.log(`[DEBUG] Successfully updated ${axis}-axis labels in DB`);
        toast.success(`${axis.toUpperCase()}-axis labels saved`);
      }
    } catch (error) {
      console.error(`[ERROR] Error updating ${axis}-axis labels:`, error);
      toast.error(`Error saving ${axis}-axis labels`);
    }
  };

  // Helper function to generate a random position on the canvas
  const getRandomPosition = (): CohortPosition => {
    // Generate a random position with padding from the edges (0.1 to 0.9 range)
    return {
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8
    };
  };

  const toggleCohortSelection = async (cohortId: string) => {
    try {
      console.log(`[DEBUG] Toggling selection for cohort: ${cohortId}`);
      
      // Get the current plot
      const currentPlotLabel = SEGMENTS[activeSegment];
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        toast.error('Failed to update cohort selection');
        return;
      }
      
      // Find the specific plot by label
      let plotItem = plotItems?.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      if (!plotItem && plotItems && plotItems.length > 0) {
        // If no match found, use the first plot as a fallback
        console.warn(`[WARN] No plot found for ${currentPlotLabel}, using first plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] Plot not found to update selection');
        toast.error('Failed to update cohort selection - plot not found');
        return;
      }
      
      // Parse the plot data
      let plotData;
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : plotItem.extra_json || {};
      } catch (e) {
        console.error('[ERROR] Failed to parse plot data:', e);
        toast.error('Failed to update cohort selection');
        return;
      }
      
      // Get or initialize the selected_cohort_ids array
      let selectedCohortIds = Array.isArray(plotData.selected_cohort_ids) 
        ? [...plotData.selected_cohort_ids] 
        : [];
      
      // Determine if we need to add or remove
      const isCurrentlySelected = selectedCohortIds.includes(cohortId);
      
      if (isCurrentlySelected) {
        // Remove from selection
        selectedCohortIds = selectedCohortIds.filter(id => id !== cohortId);
        console.log(`[DEBUG] Removing cohort ${cohortId} from plot ${plotItem.id} selection`);
      } else {
        // Add to selection (if not already there)
        if (!selectedCohortIds.includes(cohortId)) {
          selectedCohortIds.push(cohortId);
          console.log(`[DEBUG] Adding cohort ${cohortId} to plot ${plotItem.id} selection`);
        }
      }
      
      // Update the plot data with the new selection
      const updatedExtraJson = {
        ...plotData,
        selected_cohort_ids: selectedCohortIds
      };
      
      // Update the database
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ extra_json: updatedExtraJson })
        .eq('id', plotItem.id);
        
      if (updateError) {
        console.error('[ERROR] Failed to update plot selection:', updateError);
        toast.error('Failed to save selection state');
        return;
      }
      
      console.log(`[DEBUG] Updated plot ${plotItem.id} selected_cohort_ids:`, selectedCohortIds);
      
      // Now update local state for immediate UI feedback
      setSegmentStates(prev => {
        const newStates = [...prev];
        
        if (isCurrentlySelected) {
          // Remove from selection
          const newSelectedCohorts = newStates[activeSegment].selectedCohorts.filter(id => id !== cohortId);
          const newPositions = { ...newStates[activeSegment].cohortPositions };
          delete newPositions[cohortId];
          
          newStates[activeSegment] = {
            ...newStates[activeSegment],
            selectedCohorts: newSelectedCohorts,
            cohortPositions: newPositions
          };
        } else {
          // Add to selection - place at a random position on the canvas
          const newPositions = { ...newStates[activeSegment].cohortPositions };
          if (!newPositions[cohortId]) {
            newPositions[cohortId] = getRandomPosition();
          }
          
          newStates[activeSegment] = {
            ...newStates[activeSegment],
            selectedCohorts: [...newStates[activeSegment].selectedCohorts, cohortId],
            cohortPositions: newPositions
          };
          
          // Also make sure placement exists for this cohort
          addCohortToPlot(cohortId);
        }
        
        return newStates;
      });
    } catch (error) {
      console.error('[ERROR] Error in toggleCohortSelection:', error);
      toast.error('An error occurred while updating selection');
    }
  };
  
  // Helper to add a cohort to the current plot's placements
  const addCohortToPlot = async (cohortId: string) => {
    try {
      const currentPlotLabel = SEGMENTS[activeSegment];
      console.log(`[DEBUG] Adding cohort ${cohortId} to plot ${currentPlotLabel}`);
      
      // Get the current plot
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        return;
      }
      
      // Find the specific plot
      let plotItem = plotItems?.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      if (!plotItem && plotItems && plotItems.length > 0) {
        // If no match found, use the first plot as a fallback
        console.warn(`[WARN] No plot found for ${currentPlotLabel}, using first plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] No plot found to add cohort to');
        return;
      }
      
      const plotId = plotItem.id;
      let plotData;
      
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : plotItem.extra_json || {};
      } catch (e) {
        console.error('[ERROR] Failed to parse plot data:', e);
        plotData = {};
      }
      
      // Get current placements
      const placements = Array.isArray(plotData.placements) ? plotData.placements : [];
      
      // Check if cohort already exists in placements
      const existingIndex = placements.findIndex((p: any) => p.cohortId === cohortId);
      
      if (existingIndex >= 0) {
        console.log(`[DEBUG] Cohort ${cohortId} already exists in plot placements`);
        return;
      }
      
      // Get position from UI or use random position
      const positionInUI = cohortPositions[cohortId] || getRandomPosition();
      
      // Convert UI coordinates to API coordinates
      const { x, y } = uiToAPICoordinates(positionInUI.x, positionInUI.y);
      
      console.log(`[DEBUG] Adding cohort ${cohortId} at position UI: [${positionInUI.x}, ${positionInUI.y}], API: [${x}, ${y}]`);
      
      // Add new placement
      placements.push({ cohortId, x, y });
      
      // Update plot data
      const updatedExtraJson = {
        ...plotData,
        placements
      };
      
      // Save to database
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ extra_json: updatedExtraJson })
        .eq('id', plotId);
        
      if (updateError) {
        console.error('[ERROR] Failed to add cohort to plot placements:', updateError);
      } else {
        console.log(`[DEBUG] Added cohort ${cohortId} to plot ${plotId}`);
      }
    } catch (error) {
      console.error('[ERROR] Error adding cohort to plot:', error);
    }
  };
  
  // Helper to remove a cohort from the current plot's placements
  const removeCohortFromPlot = async (cohortId: string) => {
    try {
      const currentPlotLabel = SEGMENTS[activeSegment];
      console.log(`[DEBUG] Removing cohort ${cohortId} from plot ${currentPlotLabel}`);
      
      // Get the current plot
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        return;
      }
      
      // Find the specific plot
      let plotItem = plotItems?.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      if (!plotItem && plotItems && plotItems.length > 0) {
        // If no match found, use the first plot as a fallback
        console.warn(`[WARN] No plot found for ${currentPlotLabel}, using first plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] No plot found to remove cohort from');
        return;
      }
      
      const plotId = plotItem.id;
      let plotData;
      
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : plotItem.extra_json || {};
      } catch (e) {
        console.error('[ERROR] Failed to parse plot data:', e);
        plotData = {};
      }
      
      // Get current placements
      const placements = Array.isArray(plotData.placements) ? plotData.placements : [];
      
      // Filter out the cohort
      const newPlacements = placements.filter((p: any) => p.cohortId !== cohortId);
      
      if (placements.length === newPlacements.length) {
        console.log(`[DEBUG] Cohort ${cohortId} not found in plot placements, nothing to remove`);
        return;
      }
      
      console.log(`[DEBUG] Removing cohort ${cohortId} from plot placements (${placements.length} -> ${newPlacements.length})`);
      
      // Update plot data
      const updatedExtraJson = {
        ...plotData,
        placements: newPlacements
      };
      
      // Save to database
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ extra_json: updatedExtraJson })
        .eq('id', plotId);
        
      if (updateError) {
        console.error('[ERROR] Failed to remove cohort from plot placements:', updateError);
      } else {
        console.log(`[DEBUG] Removed cohort ${cohortId} from plot ${plotId}`);
      }
    } catch (error) {
      console.error('[ERROR] Error removing cohort from plot:', error);
    }
  };

  const handlePinPointerDown = (e: React.PointerEvent, cohortId: string) => {
    if (!canvasRef.current) return;
    const position = cohortPositions[cohortId];
    if (!position) return;
    
    setDragState({
      isDragging: true,
      cohortId,
      startX: e.clientX,
      startY: e.clientY,
      startPinX: position.x,
      startPinY: position.y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePinPointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging || !canvasRef.current || !dragState.cohortId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragState.startX) / rect.width;
    const dy = (e.clientY - dragState.startY) / rect.height;
    
    // Clamp to 0-1 range for UI coordinates
    const newX = Math.max(0, Math.min(1, dragState.startPinX + dx));
    const newY = Math.max(0, Math.min(1, dragState.startPinY + dy));
    
    // Update only the necessary state using functional update
    setSegmentStates(prev => {
      const newStates = [...prev];
      newStates[activeSegment] = {
        ...newStates[activeSegment],
        cohortPositions: {
          ...newStates[activeSegment].cohortPositions,
          [dragState.cohortId!]: { x: newX, y: newY }
        }
      };
      return newStates;
    });
  };

  const handlePinPointerUp = async () => {
    if (!dragState.isDragging || !dragState.cohortId) {
      setDragState({
        isDragging: false,
        cohortId: null,
        startX: 0,
        startY: 0,
        startPinX: 0,
        startPinY: 0
      });
      return;
    }
    
    try {
      // Save the new position to the database
      const cohortId = dragState.cohortId;
      const position = cohortPositions[cohortId];
      
      console.log(`[DEBUG] Pin dropped for cohort ${cohortId}:`, position);
      
      if (!position) {
        console.error('[ERROR] No position found for cohort:', cohortId);
        toast.error('Failed to save pin position');
        return;
      }
      
      // Double-check position is in the expected range (defensive programming)
      const validPosition = {
        x: Math.max(0, Math.min(1, position.x)),
        y: Math.max(0, Math.min(1, position.y))
      };
      
      // Update local state immediately in case we needed to clamp values
      if (validPosition.x !== position.x || validPosition.y !== position.y) {
        setSegmentStates(prev => {
          const newStates = [...prev];
          newStates[activeSegment].cohortPositions[cohortId] = validPosition;
          return newStates;
        });
      }
      
      // Convert from UI coordinates (0-1) to API coordinates (-1 to 1)
      const { x: apiX, y: apiY } = uiToAPICoordinates(validPosition.x, validPosition.y);
      
      const currentPlotLabel = SEGMENTS[activeSegment];
      console.log(`[DEBUG] Saving position for cohort ${cohortId} in plot ${currentPlotLabel}:`);
      console.log(`[DEBUG] UI coordinates: [${validPosition.x}, ${validPosition.y}]`);
      console.log(`[DEBUG] API coordinates: [${apiX}, ${apiY}]`);
      
      // Find the audience_items record for the plot
      const { data: plotItems, error: plotQueryError } = await supabase
        .from('audience_items')
        .select('id, extra_json')
        .eq('project_id', projectId)
        .eq('item_type', 'plot');
        
      if (plotQueryError || !plotItems || plotItems.length === 0) {
        console.error('[ERROR] Failed to query plot items:', plotQueryError);
        toast.error('Failed to save pin position');
        return;
      }
      
      // Find the specific plot by label in the extra_json field
      let plotItem = plotItems.find(item => {
        try {
          const extraJson = typeof item.extra_json === 'string' 
            ? JSON.parse(item.extra_json) 
            : item.extra_json;
          
          return extraJson?.label === currentPlotLabel;
        } catch (e) {
          return false;
        }
      });
      
      if (!plotItem && plotItems.length > 0) {
        // If no match found, use the first plot as a fallback
        console.warn(`[WARN] No plot found for ${currentPlotLabel}, using first plot as fallback`);
        plotItem = plotItems[0];
      }
      
      if (!plotItem) {
        console.error('[ERROR] Plot not found in database for label:', currentPlotLabel);
        toast.error('Failed to save pin position - plot not found');
        return;
      }
      
      const plotId = plotItem.id;
      let plotData;
      
      try {
        plotData = typeof plotItem.extra_json === 'string' 
          ? JSON.parse(plotItem.extra_json) 
          : { ...plotItem.extra_json };
          
        if (!plotData) plotData = {};
      } catch (e) {
        console.error('[ERROR] Failed to parse plot data:', e);
        plotData = {};
      }
      
      // Create a deep copy of the plot data to modify
      const updatedPlotData = JSON.parse(JSON.stringify(plotData));
      
      // Check if placements array exists
      if (!Array.isArray(updatedPlotData.placements)) {
        updatedPlotData.placements = [];
      }
      
      // Update the placement for this cohort
      const placements = updatedPlotData.placements;
      
      // Find and update existing placement or add new one
      const existingIndex = placements.findIndex((p: any) => p.cohortId === cohortId);
      if (existingIndex >= 0) {
        // Keep the original object but update x,y
        placements[existingIndex] = { 
          ...placements[existingIndex], 
          x: apiX, 
          y: apiY 
        };
        console.log(`[DEBUG] Updating existing placement at index ${existingIndex}`);
      } else {
        placements.push({ cohortId, x: apiX, y: apiY });
        console.log(`[DEBUG] Adding new placement for cohort ${cohortId}`);
        
        // Also ensure cohort is in selected_cohort_ids array if not already
        if (!Array.isArray(updatedPlotData.selected_cohort_ids)) {
          updatedPlotData.selected_cohort_ids = [];
        }
        
        if (!updatedPlotData.selected_cohort_ids.includes(cohortId)) {
          updatedPlotData.selected_cohort_ids.push(cohortId);
          console.log(`[DEBUG] Added cohort ${cohortId} to selected_cohort_ids array`);
        }
      }
      
      console.log(`[DEBUG] Saving updated plot data:`, updatedPlotData);
      
      // Update the plot data in the database
      const { error: updateError } = await supabase
        .from('audience_items')
        .update({ extra_json: updatedPlotData })
        .eq('id', plotId);
        
      if (updateError) {
        console.error('[ERROR] Failed to update plot placements:', updateError);
        toast.error('Failed to save pin position');
      } else {
        console.log(`[DEBUG] Successfully saved position for cohort ${cohortId}`);
      }
    } catch (error) {
      console.error('[ERROR] Error in handlePinPointerUp:', error);
      toast.error('An error occurred while saving pin position');
    } finally {
      // Reset drag state
      setDragState({
        isDragging: false,
        cohortId: null,
        startX: 0,
        startY: 0,
        startPinX: 0,
        startPinY: 0
      });
    }
  };

  // Function to perform a full refresh after reset
  const refreshAfterReset = async () => {
    try {
      setIsLoading(true);
      // Get fresh data
      const data = await getAudienceData(projectId);
      if (data) {
        setCohorts(data.cohorts);
        setPlots(data.plots);
        
        // Reset to default segment states
        setSegmentStates([
          createDefaultSegmentState(),
          createDefaultSegmentState(),
          createDefaultSegmentState(),
        ]);
        
        // Reset active segment to first one
        setActiveSegment(0);
        
        // Refresh cohort selections
        await refreshCohortSelections();
      }
    } catch (error) {
      console.error('[ERROR] Failed to refresh after reset:', error);
      toast.error('Failed to refresh data after reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWinningCohorts = async (newSelection: WinningCohortSelection) => {
    if (!projectId) {
      toast.error("Project ID is missing. Cannot save winning cohorts.");
      throw new Error("Project ID is missing"); // Throw to be caught by modal
    }
    console.log("[MacroLandscape] Calling service to save winning cohorts:", newSelection, "for project:", projectId);
    try {
      await saveWinningCohorts(projectId, newSelection); // Calls the service
      setWinningCohorts(newSelection); // Update local state in MacroLandscape on success
      toast.success("Top cohorts saved!");
    } catch (error) {
      console.error("Failed to save winning cohorts from MacroLandscape wrapper:", error);
      // toast.error("Failed to save top cohorts. Please try again."); // Modal will show its own toast
      throw error; // Re-throw the error to be caught by SelectWinnersModal
    }
  };

  const handleOpenDiscardDialog = (cohortId: string) => {
    setCohortToDiscard(cohortId);
    setIsDiscardConfirmOpen(true);
  };

  const handleConfirmDiscardCohort = async () => {
    if (!cohortToDiscard || !projectId) {
      toast.error("Error: Cohort ID or Project ID missing for delete.");
      setIsDiscardConfirmOpen(false);
      setCohortToDiscard(null);
      return;
    }
    console.log(`[MacroLandscape] Confirming delete for cohort: ${cohortToDiscard}`);
    try {
      await deleteAudienceCohort(projectId, cohortToDiscard); // Changed to deleteAudienceCohort
      toast.success("Cohort permanently deleted.");
      await refreshAfterReset(); // Re-fetch all data to update the UI
    } catch (error: any) {
      console.error("Error deleting cohort:", error);
      toast.error(error.message || "Failed to delete cohort.");
    } finally {
      setIsDiscardConfirmOpen(false);
      setCohortToDiscard(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audience data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pt-4 pb-8">
      {/* Combined Row for Step Indicator and Reset Button */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8 gap-4">
        {/* Step indicator - flex-grow to allow it to take space, and justify-center for its content */}
        <div className="flex-grow flex justify-center">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-all duration-150 ${
                    idx < currentStep ? 'bg-primary text-white border-primary' : 
                    idx === currentStep ? 'bg-white text-black border-primary ring-2 ring-primary/20' : 
                    'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {idx < currentStep ? <Check className="h-5 w-5" /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${
                  idx === currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}>{step.label}</span>
                {idx < STEPS.length - 1 && <div className="w-8 h-0.5 bg-border mx-2" />}
              </div>
            ))}
          </div>
        </div>
        
        {/* Reset Button - aligned to the right */}
        {projectId && 
          <div className="flex-shrink-0">
            <ResetAudienceStateButton projectId={projectId} onReset={refreshAfterReset} />
          </div>
        }
      </div>
      
      {/* Canvas heading and subtext - reduced top margin */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center mb-4 mt-4"> {/* Added mt-4, could be less if mb-8 on row above is enough */}
        <h2 className="text-lg font-semibold">The Macro Landscape</h2>
        <p className="text-sm text-muted-foreground">Which two tensions define our market</p>
        {/* Segment toggle */}
        <div className="flex gap-2 mt-4">
          {SEGMENTS.map((label, idx) => (
            <button
              key={label}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${
                activeSegment === idx ? 'bg-primary text-primary-foreground border-primary' : 
                'bg-muted text-muted-foreground border-border hover:bg-accent'
              }`}
              onClick={() => {
                console.log(`[DEBUG] Switching from segment ${activeSegment} to ${idx}`);
                setActiveSegment(idx);
                console.log(`[DEBUG] User clicked ${label} button`);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas centered and wider */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="w-full max-w-7xl mx-auto relative">
          <div
            id="landscape-canvas"
            ref={canvasRef}
            className="w-full h-[500px] bg-muted/20 rounded-xl border border-border relative overflow-hidden shadow-sm"
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
            {/* Label indicators for Y-axis orientation */}
            <div className="absolute top-4 left-1/2 text-xs font-medium bg-black/40 px-2 py-1 rounded -translate-x-1/2">
              {yLabels[0]} ↑
            </div>
            <div className="absolute bottom-4 left-1/2 text-xs font-medium bg-black/40 px-2 py-1 rounded -translate-x-1/2">
              {yLabels[1]} ↓
            </div>
            {/* Label indicators for X-axis orientation */}
            <div className="absolute top-1/2 left-4 text-xs font-medium bg-black/40 px-2 py-1 rounded -translate-y-1/2">
              ← {xLabels[0]}
            </div>
            <div className="absolute top-1/2 right-4 text-xs font-medium bg-black/40 px-2 py-1 rounded -translate-y-1/2">
              {xLabels[1]} →
            </div>
            {/* Pins for selected cohorts */}
            {selectedCohorts.map(cohortId => {
              const cohort = cohorts.find(c => c.id === cohortId);
              const position = cohortPositions[cohortId];
              if (!cohort || !position) return null;
              
              // Debug output to check coordinate transformations
              console.log(`[DEBUG] Rendering pin for ${cohort.title}:`, {
                rawPosition: position,
                cssLeft: `${position.x * 100}%`,
                cssTop: `${position.y * 100}%`,
                note: "y=0 at top, y=1 at bottom (Y1 is top, Y2 is bottom)"
              });
              
              // Check if position is outside the expected range
              if (position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) {
                console.warn(`[DEBUG] Pin for ${cohort.title} is outside 0-1 range: x=${position.x}, y=${position.y}`);
              }

              return (
                <div
                  key={cohortId}
                  className="absolute w-6 h-6 bg-primary/90 hover:bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-md z-10 cursor-move transition-colors duration-200"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`
                  }}
                  title={cohort.title}
                  onPointerDown={(e) => handlePinPointerDown(e, cohortId)}
                  onPointerMove={handlePinPointerMove}
                  onPointerUp={handlePinPointerUp}
                  onPointerCancel={handlePinPointerUp}
                >
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap font-medium">
                    {cohort.title}
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis label editor */}
          <div className="absolute bottom-[-36px] left-0 right-0 mx-auto flex items-center justify-center min-w-[600px]">
            <AxisLabelEditor axis="x" labels={xLabels} onUpdate={handleXLabelsUpdate} showSuggestions={false} />
          </div>
          {/* Y-axis label editor */}
          <div className="absolute top-1/2 -translate-y-1/2 -rotate-90 w-[500px] text-center" style={{ left: "-270px" }}>
            <AxisLabelEditor axis="y" labels={[yLabels[1], yLabels[0]]} onUpdate={handleYLabelsUpdate} showSuggestions={false} />
          </div>
        </div>
      </div>

      {/* Cohort grid title and CTAs */}
      <div className="w-full max-w-7xl mx-auto flex items-end justify-between mt-12 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Select your people</h2>
          <p className="text-sm text-muted-foreground">Choose the most important audience cohorts to plot</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddCustomCohortDialogOpen(true)}
            disabled={isLoading} // Consider if other loading states should disable this
          >
            <Plus size={16} className="mr-2" />
            COHORT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGenerateCohortsDialogOpen(true)}
            disabled={isLoading} // Consider if other loading states should disable this
          >
            ⚡️ 5 NEW
          </Button>
        </div>
      </div>

      {/* Cohort card grid centered and wider */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {cohorts.map(cohort => {
            const isSelected = selectedCohorts.includes(cohort.id);
            return (
              <div
                key={cohort.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-150 flex flex-col shadow-sm hover:shadow-md group ${isSelected ? 'bg-white text-black border-primary ring-2 ring-primary/20 hover:border-primary' : 'bg-muted/10 text-foreground border-border hover:border-primary/60'}`}
                onClick={() => toggleCohortSelection(cohort.id)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isSelected ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleOpenDiscardDialog(cohort.id); // Corrected: Call handleOpenDiscardDialog
                  }}
                  aria-label="Discard cohort"
                >
                  <XIcon className="h-4 w-4" />
                </Button>

                <h3 className="font-medium text-base mb-1 truncate pr-6">{cohort.title}</h3> {/* Added pr-6 for spacing from X button */}
                <p className="text-xs text-muted-foreground mb-3">{cohort.description}</p>
                <div className="mt-auto pt-3">
                  <div className="border-t border-border mb-2"></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base ${isSelected ? 'text-black' : 'text-primary'}`}>⚡️</span>
                    <span className={`text-xs leading-snug ${isSelected ? 'text-black' : 'text-muted-foreground'} line-clamp-2`}>{cohort.whyItMatters}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Cohort Dialog (Dummy) */}
      <Dialog open={isAddCustomCohortDialogOpen} onOpenChange={setIsAddCustomCohortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Audience Cohort</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              Manually define a new audience cohort that is specific to your insights.
            </p>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Input 
              placeholder="Cohort Name (e.g., Early Tech Adopters)"
              value={customCohortName} 
              onChange={(e) => setCustomCohortName(e.target.value)}
              disabled={isSubmittingCustomCohort}
            />
            <Input 
              placeholder="Short Description"
              value={customCohortDescription} 
              onChange={(e) => setCustomCohortDescription(e.target.value)}
              disabled={isSubmittingCustomCohort}
            />
            <Input 
              placeholder="Why this cohort matters to your brand"
              value={customCohortWhy} 
              onChange={(e) => setCustomCohortWhy(e.target.value)}
              disabled={isSubmittingCustomCohort}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomCohortDialogOpen(false)} disabled={isSubmittingCustomCohort}>Cancel</Button>
            <Button 
              onClick={async () => { 
                setIsSubmittingCustomCohort(true);
                console.log("Attempting to add custom cohort:", { title: customCohortName, description: customCohortDescription, whyItMatters: customCohortWhy });
                try {
                  if (!projectId) {
                    toast.error("Project ID not found. Cannot add cohort.");
                    setIsSubmittingCustomCohort(false);
                    return;
                  }
                  if (!customCohortName.trim()) { // Only name is truly mandatory now
                    toast.error("Cohort Name is required.");
                    setIsSubmittingCustomCohort(false);
                    return;
                  }

                  const newCohortData: CustomCohortData = {
                    title: customCohortName.trim(),
                    description: customCohortDescription.trim() || undefined,
                    whyItMatters: customCohortWhy.trim() || undefined,
                  };

                  const newCohortId = await addAudienceCohortItem(projectId, newCohortData, 'ai_suggested');

                  if (newCohortId) {
                    // Optimistically add to local state or refetch all cohorts
                    // For simplicity, let's refetch all cohorts to ensure UI consistency
                    toast.success("Custom cohort added successfully!");
                    setIsAddCustomCohortDialogOpen(false);
                    setCustomCohortName("");
                    setCustomCohortDescription("");
                    setCustomCohortWhy("");
                    await refreshAfterReset(); // This function re-fetches all data including cohorts
                  } else {
                    toast.error("Failed to add custom cohort. ID not returned.");
                  }
                } catch (error: any) {
                  console.error("Error adding custom cohort:", error);
                  toast.error(error.message || "Failed to add custom cohort. Please try again.");
                } finally {
                  setIsSubmittingCustomCohort(false);
                }
              }}
              disabled={isSubmittingCustomCohort || !customCohortName.trim()} // Only disable if name is empty
            >
              {isSubmittingCustomCohort ? "Adding..." : "Add Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate 5 New Cohorts Dialog (Dummy) */}
      <Dialog open={isGenerateCohortsDialogOpen} onOpenChange={setIsGenerateCohortsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate 5 New Audience Cohorts</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
             Let AI suggest new audience cohorts based on your project context and optional guidance.
            </p>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Optional: Add a line of guidance for the AI... (e.g., focus on younger demographics)"
              value={generateCohortsExtraNote} 
              onChange={(e) => setGenerateCohortsExtraNote(e.target.value)}
              disabled={isGeneratingCohorts}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateCohortsDialogOpen(false)} disabled={isGeneratingCohorts}>Cancel</Button>
            <Button 
              onClick={async () => { 
                setIsGeneratingCohorts(true);
                console.log("Generating new cohorts with extra note:", generateCohortsExtraNote);
                try {
                  if (!projectId) {
                    toast.error("Project ID not found. Cannot generate cohorts.");
                    setIsGeneratingCohorts(false);
                    return;
                  }

                  // Pass the current UI cohorts list (which should be up-to-date)
                  const newCohortSuggestions = await generateMoreCohorts(projectId, cohorts, generateCohortsExtraNote.trim());

                  if (newCohortSuggestions && newCohortSuggestions.length > 0) {
                    // Add each new suggestion to the DB
                    for (const suggestedCohort of newCohortSuggestions) {
                      // The ID should be pre-generated by the AI according to the prompt spec
                      // or by our validation logic in generateMoreCohorts
                      await addAudienceCohortItem(projectId, suggestedCohort, 'ai_suggested'); 
                    }
                    toast.success(`${newCohortSuggestions.length} new cohort suggestions added!`);
                    await refreshAfterReset(); // Refresh all data to show new cohorts
                  } else {
                    toast.info("AI didn't return new cohort suggestions at this time.");
                  }
                } catch (error: any) {
                  console.error("Error generating new cohorts:", error);
                  toast.error(error.message || "Failed to generate new cohort suggestions.");
                } finally {
                  setIsGenerateCohortsDialogOpen(false);
                  setIsGeneratingCohorts(false);
                  setGenerateCohortsExtraNote("");
                }
              }}
              disabled={isGeneratingCohorts}
            >
              {isGeneratingCohorts ? "Generating..." : "Generate Cohorts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Cohort Confirmation Dialog */}
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Audience Cohort?</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              Are you sure you want to permanently delete this cohort? 
              This action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDiscardConfirmOpen(false); setCohortToDiscard(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDiscardCohort}>
              Yes, Delete Cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Render the SelectWinnersModal */}
      {projectId && (
        <SelectWinnersModal 
          isOpen={isSelectWinnersModalOpen}
          onClose={() => setIsSelectWinnersModalOpen(false)}
          allCohorts={cohorts} 
          currentWinningCohorts={winningCohorts}
          onSave={handleSaveWinningCohorts}
          projectId={projectId}
        />
      )}

      {/* Footer CTAs */}
      <div className="w-full max-w-7xl mx-auto mt-12 flex justify-end items-center gap-4">
        {/* Select Top Cohorts Button - New Position */}
        {projectId && 
          <Button 
            variant="outline" 
            size="lg" // Match size of finalize button for visual balance
            onClick={() => setIsSelectWinnersModalOpen(true)}
          >
            Select Top 3 Cohorts
          </Button>
        }
        {/* Finalize and Continue Button - Updated Text */}
        <Button 
          onClick={() => {
            if (winningCohorts.primary && winningCohorts.secondary && winningCohorts.tertiary) {
              onComplete();
            } else {
              toast.info("Please select your top 3 cohorts to proceed.");
              setIsSelectWinnersModalOpen(true); 
            }
          }}
          disabled={!(winningCohorts.primary && winningCohorts.secondary && winningCohorts.tertiary)}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Finalize & Continue →
        </Button>
      </div>
    </div>
  );
};

export default MacroLandscape; 