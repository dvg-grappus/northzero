import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAudience } from "./AudienceProvider";
import { toast } from "sonner";
import { 
  MOCK_COMPETITORS, 
  MOCK_TAKEAWAYS, 
  MOCK_TRENDS, 
  MOCK_SECONDARY_INSIGHTS 
} from '@/data/mockCompetition';

// Types
export interface Competitor {
  id: string;
  name: string;
  logo: string;
  tags: string[];
  type: "startup" | "large-company";
  website?: string;
  alexaRank?: string;
  fundingStage?: string;
  priority: number;
  position?: { x: number; y: number };
}

interface Takeaway {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  source: string;
  sourceIcon: string;
  category: "UX idea" | "Product wedge" | "Growth tactic" | "Brand move";
  saved: boolean;
}

interface Trend {
  id: string;
  title: string;
  description: string;
  icon: string;
  accepted: boolean;
}

interface LandscapeSnapshot {
  id: string;
  image: string;
  timestamp: Date;
}

export interface SecondaryInsight {
  id: string;
  text: string;
  source: string;
  category: "competitor" | "takeaway" | "trend" | "landscape";
  timestamp: Date;
  starred: boolean;
}

interface CompetitionContextType {
  // Competitors
  competitors: Competitor[];
  selectedCompetitors: string[];
  addCompetitor: (competitor: Competitor) => void;
  removeCompetitor: (id: string) => void;
  toggleSelectCompetitor: (id: string) => void;
  updateCompetitorPriority: (id: string, priority: number) => void;
  
  // Takeaways
  takeaways: Takeaway[];
  saveTakeaway: (id: string) => void;
  discardTakeaway: (id: string) => void;
  regenerateTakeaway: (id: string) => void;
  filterTakeaways: (category?: string) => Takeaway[];
  fetchMoreTakeaways: () => void;
  
  // Trends
  trends: Trend[];
  acceptTrend: (id: string) => void;
  rejectTrend: (id: string) => void;
  addCustomTrend: (title: string, description: string, icon: string) => void;
  
  // Landscape
  axes: { x: string[], y: string[] };
  updateAxisLabels: (axis: "x" | "y", labels: string[]) => void;
  brandPosition: { x: number; y: number } | null;
  setBrandPosition: (position: { x: number; y: number } | null) => void;
  updateCompetitorPosition: (id: string, position: { x: number; y: number }) => void;
  landscapeSnapshots: LandscapeSnapshot[];
  createSnapshot: () => void;
  
  // Insights
  secondaryInsights: SecondaryInsight[];
  addSecondaryInsight: (text: string, source: string, category: SecondaryInsight["category"]) => void;
  starInsight: (id: string, starred: boolean) => void;
  deleteInsight: (id: string) => void;
  mergeInsights: (ids: string[], newText: string) => void;
  
  // Navigation
  completeModule: () => void;
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

export const CompetitionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const { addInsight: addAudienceInsight } = useAudience();
  
  // State for competitors
  const [competitors, setCompetitors] = useState<Competitor[]>(MOCK_COMPETITORS);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  
  // State for takeaways
  const [takeaways, setTakeaways] = useState<Takeaway[]>(MOCK_TAKEAWAYS);
  
  // State for trends
  const [trends, setTrends] = useState<Trend[]>(MOCK_TRENDS);
  
  // State for landscape
  const [axes, setAxes] = useState({
    x: ["Transactional", "Experiential"],
    y: ["Traditional", "Modern"]
  });
  
  const [brandPosition, setBrandPosition] = useState<{ x: number; y: number } | null>(null);
  const [landscapeSnapshots, setLandscapeSnapshots] = useState<LandscapeSnapshot[]>([]);
  
  // State for insights
  const [secondaryInsights, setSecondaryInsights] = useState<SecondaryInsight[]>(MOCK_SECONDARY_INSIGHTS);
  
  // Competitor functions
  const addCompetitor = (competitor: Competitor) => {
    setCompetitors(prev => [...prev, competitor]);
    toggleSelectCompetitor(competitor.id);
  };
  
  const removeCompetitor = (id: string) => {
    setCompetitors(prev => prev.filter(comp => comp.id !== id));
    setSelectedCompetitors(prev => prev.filter(compId => compId !== id));
  };
  
  const toggleSelectCompetitor = (id: string) => {
    setSelectedCompetitors(prev => {
      if (prev.includes(id)) {
        return prev.filter(compId => compId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const updateCompetitorPriority = (id: string, priority: number) => {
    setCompetitors(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, priority } : comp
      )
    );
  };
  
  // Takeaway functions
  const saveTakeaway = (id: string) => {
    setTakeaways(prev => 
      prev.map(takeaway => 
        takeaway.id === id ? { ...takeaway, saved: true } : takeaway
      )
    );
    
    // Find the takeaway to add to insights
    const takeaway = takeaways.find(t => t.id === id);
    if (takeaway) {
      addSecondaryInsight(
        takeaway.description,
        `Takeaway from ${takeaway.source}: ${takeaway.title}`,
        "takeaway"
      );
    }
    
    toast.success("Takeaway saved to insight pool");
  };
  
  const discardTakeaway = (id: string) => {
    setTakeaways(prev => prev.filter(takeaway => takeaway.id !== id));
  };
  
  const regenerateTakeaway = (id: string) => {
    // In a real app, this would call an API to get a new takeaway
    toast.info("Generating alternative takeaway...");
    
    // For now, just toggle a property to simulate regeneration
    setTakeaways(prev => 
      prev.map(takeaway => 
        takeaway.id === id 
          ? { 
              ...takeaway, 
              description: "Regenerated: " + takeaway.description 
            } 
          : takeaway
      )
    );
  };
  
  const filterTakeaways = (category?: string) => {
    if (!category) return takeaways;
    return takeaways.filter(takeaway => takeaway.category === category);
  };
  
  const fetchMoreTakeaways = () => {
    // In a real app, this would call an API
    toast.info("Fetching more takeaways...");
    
    // For now, add 5 mock takeaways
    const newTakeaways: Takeaway[] = [
      {
        id: `new-1-${Date.now()}`,
        title: "Interactive tutorials",
        description: "Step-by-step guides increase feature adoption by 42%.",
        screenshot: "/placeholder.svg",
        source: "Brilliant",
        sourceIcon: "/placeholder.svg",
        category: "UX idea",
        saved: false
      },
      {
        id: `new-2-${Date.now()}`,
        title: "Cohort-based courses",
        description: "Learning with peers shows 78% higher completion rates.",
        screenshot: "/placeholder.svg",
        source: "Study Together",
        sourceIcon: "/placeholder.svg",
        category: "Product wedge",
        saved: false
      },
      {
        id: `new-3-${Date.now()}`,
        title: "Early access program",
        description: "Beta feature testing builds community and reduces churn.",
        screenshot: "/placeholder.svg",
        source: "EduPop",
        sourceIcon: "/placeholder.svg",
        category: "Growth tactic",
        saved: false
      },
      {
        id: `new-4-${Date.now()}`,
        title: "PDF certificates",
        description: "Shareable completions drive organic social promotion.",
        screenshot: "/placeholder.svg",
        source: "Scaler Academy",
        sourceIcon: "/placeholder.svg",
        category: "Brand move",
        saved: false
      },
      {
        id: `new-5-${Date.now()}`,
        title: "Progress celebrations",
        description: "Milestone animations create dopamine hits for learners.",
        screenshot: "/placeholder.svg",
        source: "Google Primer",
        sourceIcon: "/placeholder.svg",
        category: "UX idea",
        saved: false
      }
    ];
    
    setTakeaways(prev => [...prev, ...newTakeaways]);
  };
  
  // Trend functions
  const acceptTrend = (id: string) => {
    setTrends(prev => 
      prev.map(trend => 
        trend.id === id ? { ...trend, accepted: true } : trend
      )
    );
    
    // Find the trend to add to insights
    const trend = trends.find(t => t.id === id);
    if (trend) {
      addSecondaryInsight(
        trend.description,
        `Trend: ${trend.title}`,
        "trend"
      );
    }
    
    toast.success("Trend saved to insight pool");
  };
  
  const rejectTrend = (id: string) => {
    setTrends(prev => 
      prev.map(trend => 
        trend.id === id ? { ...trend, accepted: false } : trend
      )
    );
  };
  
  const addCustomTrend = (title: string, description: string, icon: string) => {
    const newTrend: Trend = {
      id: `custom-${Date.now()}`,
      title,
      description,
      icon,
      accepted: true
    };
    
    setTrends(prev => [...prev, newTrend]);
    
    addSecondaryInsight(
      description,
      `Custom trend: ${title}`,
      "trend"
    );
    
    toast.success("Custom trend added");
  };
  
  // Landscape functions
  const updateAxisLabels = (axis: "x" | "y", labels: string[]) => {
    setAxes(prev => ({
      ...prev,
      [axis]: labels
    }));
  };
  
  const updateCompetitorPosition = (id: string, position: { x: number; y: number }) => {
    setCompetitors(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, position } : comp
      )
    );
  };
  
  const createSnapshot = () => {
    // In a real app, this would generate an actual image
    const newSnapshot: LandscapeSnapshot = {
      id: `snapshot-${Date.now()}`,
      image: "/placeholder.svg",
      timestamp: new Date()
    };
    
    setLandscapeSnapshots(prev => [...prev, newSnapshot]);
    toast.success("Landscape snapshot saved");
  };
  
  // Insight functions
  const addSecondaryInsight = (text: string, source: string, category: SecondaryInsight["category"]) => {
    const newInsight: SecondaryInsight = {
      id: `insight-${Date.now()}`,
      text,
      source,
      category,
      timestamp: new Date(),
      starred: false
    };
    
    setSecondaryInsights(prev => [newInsight, ...prev]);
  };
  
  const starInsight = (id: string, starred: boolean) => {
    setSecondaryInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, starred } : insight
      )
    );
  };
  
  const deleteInsight = (id: string) => {
    setSecondaryInsights(prev => prev.filter(insight => insight.id !== id));
  };
  
  const mergeInsights = (ids: string[], newText: string) => {
    // Create a new merged insight
    const newInsight: SecondaryInsight = {
      id: `merged-${Date.now()}`,
      text: newText,
      source: "Merged insights",
      category: "takeaway",
      timestamp: new Date(),
      starred: false
    };
    
    // Add the new insight and remove the merged ones
    setSecondaryInsights(prev => [
      newInsight,
      ...prev.filter(insight => !ids.includes(insight.id))
    ]);
    
    toast.success("Insights merged successfully");
  };
  
  // Module completion
  const completeModule = () => {
    // Add a summary insight to the primary pool
    addAudienceInsight(
      "Competition analysis complete with " + 
      selectedCompetitors.length + " competitors and " + 
      secondaryInsights.length + " insights.",
      "Competition Module",
      true
    );
    
    toast.success("Competition module completed!");
    
    // Navigate back to timeline
    setTimeout(() => {
      navigate("/timeline", { 
        state: { 
          fromCompetition: true 
        } 
      });
    }, 1500);
  };
  
  const value = {
    competitors,
    selectedCompetitors,
    addCompetitor,
    removeCompetitor,
    toggleSelectCompetitor,
    updateCompetitorPriority,
    
    takeaways,
    saveTakeaway,
    discardTakeaway,
    regenerateTakeaway,
    filterTakeaways,
    fetchMoreTakeaways,
    
    trends,
    acceptTrend,
    rejectTrend,
    addCustomTrend,
    
    axes,
    updateAxisLabels,
    brandPosition,
    setBrandPosition,
    updateCompetitorPosition,
    landscapeSnapshots,
    createSnapshot,
    
    secondaryInsights,
    addSecondaryInsight,
    starInsight,
    deleteInsight,
    mergeInsights,
    
    completeModule
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error("useCompetition must be used within a CompetitionProvider");
  }
  return context;
};