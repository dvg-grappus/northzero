
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TimelineTopBar from "@/components/TimelineTopBar";
import HelpDrawer from "@/components/HelpDrawer";
import OfflineToast from "@/components/OfflineToast";
import { Step } from "@/types/timeline";
import { useProjects } from "@/contexts/ProjectsContext";
import { ArrowLeft } from "lucide-react";

// Import refactored components
import TimelineCarousel3D from "@/components/timeline/TimelineCarousel3D";
import TimelineHeader from "@/components/timeline/TimelineHeader";
import HelpButton from "@/components/timeline/HelpButton";
import { navigateToStep } from "@/utils/stepNavigation";

const Timeline: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  
  // Get the active project
  const activeProject = projectId ? getProject(projectId) : undefined;

  // If no project ID is provided, redirect to Brand Hub
  useEffect(() => {
    if (!projectId) {
      navigate('/brand-hub');
    } else if (projectId && !activeProject) {
      // If project ID is invalid, redirect to Brand Hub
      navigate('/brand-hub');
    }
  }, [projectId, activeProject, navigate]);
  
  const steps: Step[] = [
    { id: 1, title: "Positioning", description: "Define purpose, edge and long-range roadmap.", duration: "4 min" },
    { id: 2, title: "Audience", description: "Segment target cohorts and mine core insights.", duration: "5 min" },
    { id: 3, title: "Competition", description: "Benchmark rivals to reveal gaps and openings.", duration: "4 min" },
    { id: 4, title: "Market", description: "Surface key stats, trends and cultural currents.", duration: "3 min" },
    { id: 5, title: "Personality", description: "Lock tone, archetype and non-negotiables.", duration: "3 min" },
    { id: 6, title: "Moodboards", description: "Curate visual clusters that capture the vibe.", duration: "6 min" },
    { id: 7, title: "Stylescapes", description: "Assemble a wide board to test cohesion.", duration: "2 min" },
    { id: 8, title: "Logo", description: "Shape marks, wordmarks and usage basics.", duration: "7 min" },
    { id: 9, title: "Voice", description: "Document message pillars and sample copy.", duration: "3 min" },
    { id: 10, title: "Color", description: "Select palette and set contrast rules.", duration: "2 min" },
    { id: 11, title: "Typography", description: "Choose type systems and pairings.", duration: "2 min" },
    { id: 12, title: "Elements", description: "Specify textures, grids, illustration and icon style.", duration: "3 min" },
    { id: 13, title: "Collaterals", description: "Apply the system to merch, print and digital.", duration: "5 min" },
    { id: 14, title: "Brand Book", description: "Bind everything into a polished PDF kit.", duration: "1 min" },
  ];

  // This effect processes location state to set completed steps
  useEffect(() => {
    console.log("Timeline: Processing location state:", location.state);
    
    const fromPositioning = location.state && location.state.fromPositioning;
    const fromAudience = location.state && location.state.fromAudience;
    const fromCompetition = location.state && location.state.fromCompetition;
    const fromMarket = location.state && location.state.fromMarket;
    const fromPersonality = location.state && location.state.fromPersonality;
    const fromMoodboards = location.state && location.state.fromMoodboards;
    const fromStylescapes = location.state && location.state.fromStylescapes;
    
    if (fromPositioning) {
      setCompletedSteps(prev => {
        if (!prev.includes(1)) {
          return [...prev, 1]; 
        }
        return prev;
      });
      setCurrentStep(2);
    }
    
    if (fromAudience) {
      setCompletedSteps(prev => {
        if (!prev.includes(2)) {
          return [...prev, 2];
        }
        return prev;
      });
      setCurrentStep(3);
    }
    
    if (fromCompetition) {
      setCompletedSteps(prev => {
        if (!prev.includes(3)) {
          return [...prev, 3];
        }
        return prev;
      });
      setCurrentStep(4);
    }
    
    if (fromMarket) {
      setCompletedSteps(prev => {
        if (!prev.includes(4)) {
          return [...prev, 4];
        }
        return prev;
      });
      setCurrentStep(5);
    }
    
    if (fromPersonality) {
      setCompletedSteps(prev => {
        if (!prev.includes(5)) {
          return [...prev, 5];
        }
        return prev;
      });
      setCurrentStep(6);
    }
    
    if (fromMoodboards) {
      setCompletedSteps(prev => {
        if (!prev.includes(6)) {
          return [...prev, 6];
        }
        return prev;
      });
      setCurrentStep(7);
    }
    
    if (fromStylescapes) {
      setCompletedSteps(prev => {
        if (!prev.includes(7)) {
          return [...prev, 7];
        }
        return prev;
      });
      setCurrentStep(8);
    }
    
    if (completedSteps.length === 0 && !fromPositioning && !fromAudience && !fromCompetition && !fromMarket && !fromPersonality && !fromMoodboards && !fromStylescapes) {
      setCurrentStep(1);
    }
  }, [location, completedSteps.length]);

  // Help drawer shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?") {
        setShowHelpDrawer(prev => !prev);
        return;
      }
      
      if (e.metaKey && !isNaN(Number(e.key)) && Number(e.key) >= 1 && Number(e.key) <= 14) {
        const stepNumber = Number(e.key);
        document.getElementById(`step-card-${stepNumber}`)?.scrollIntoView({ 
          behavior: "smooth",
          block: "center"
        });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent scrolling on body to avoid conflicts with carousel
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, []);
  
  const handleStepBegin = (stepId: number) => {
    console.log(`Timeline: handleStepBegin fired for step ${stepId}`);
    // Use the extracted navigation utility and preserve the project ID
    navigateToStep(stepId, (path: string) => {
      navigate(`${path}?projectId=${projectId}`);
    });
  };

  // Function to handle going back to Brand Hub with debug logs
  const handleBackToBrandHub = (e: React.MouseEvent) => {
    // Stop propagation to prevent event bubbling to parent elements
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Back to Brand Hub clicked!");
    console.log("Navigating to /brand-hub");
    navigate('/brand-hub');
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background z-0"></div>
      
      <TimelineTopBar />
      <OfflineToast />
      
      {/* Project header - Redesigned with higher z-index */}
      {activeProject && (
        <div className="absolute top-[80px] left-0 right-0 bg-background/50 backdrop-blur-sm z-40">
          <div className="container max-w-[1200px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={handleBackToBrandHub}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-foreground bg-background/60 hover:bg-background/80 rounded-md transition-all"
                  style={{ 
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 50 // Ensure this is above all carousel elements
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Brand Hub</span>
                </button>
                <h2 className="text-2xl font-bold">{activeProject.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {activeProject.progress}% complete
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-[130px] pb-[48px] px-4 max-w-[1200px] mx-auto relative z-10">
        <TimelineHeader 
          title="Your route beyond zero."
          description="Fourteen concise modules. Move in order or jump to what matters."
        />
        
        <TimelineCarousel3D 
          steps={steps}
          onBegin={handleStepBegin}
        />
      </div>
      
      <HelpButton onClick={() => setShowHelpDrawer(prev => !prev)} />
      
      <AnimatePresence>
        {showHelpDrawer && (
          <HelpDrawer isOpen={showHelpDrawer} onClose={() => setShowHelpDrawer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline;
