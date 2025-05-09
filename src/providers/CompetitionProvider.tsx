import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAudience } from "./AudienceProvider";
import { toast } from "sonner";

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

export interface Takeaway {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  source: string;
  sourceIcon: string;
  category: "UX idea" | "Product wedge" | "Growth tactic" | "Brand move";
  saved: boolean;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  icon: string;
  accepted: boolean;
}

export interface LandscapeSnapshot {
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
  
  // State for competitors with expanded mock data
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "1",
      name: "Scaler Academy",
      logo: "/placeholder.svg",
      tags: ["Startup", "SaaS", "Recently funded"],
      type: "startup",
      alexaRank: "28,750",
      fundingStage: "Series B",
      priority: 8,
      position: { x: 0.3, y: 0.7 }
    },
    {
      id: "2",
      name: "MasterClass",
      logo: "/placeholder.svg",
      tags: ["Large company", "Provider", "Mobile-first"],
      type: "large-company",
      alexaRank: "2,340",
      fundingStage: "Series F",
      website: "https://www.masterclass.com",
      priority: 6,
      position: { x: 0.6, y: 0.2 }
    },
    {
      id: "3",
      name: "Brilliant",
      logo: "/placeholder.svg",
      tags: ["Startup", "SaaS", "Mobile-first"],
      type: "startup",
      alexaRank: "12,120",
      fundingStage: "Series C",
      website: "https://brilliant.org",
      priority: 7,
      position: { x: 0.4, y: 0.5 }
    },
    {
      id: "4",
      name: "Ask AI Mentor",
      logo: "/placeholder.svg",
      tags: ["Startup", "Mobile-first", "Recently funded"],
      type: "startup",
      alexaRank: "78,500",
      fundingStage: "Seed",
      website: "https://www.askaimentor.com",
      priority: 9,
      position: { x: 0.8, y: 0.3 }
    },
    {
      id: "5",
      name: "EduPop",
      logo: "/placeholder.svg",
      tags: ["Startup", "Community-led", "Bootstrapped"],
      type: "startup",
      alexaRank: "102,300",
      fundingStage: "Bootstrapped",
      website: "https://www.edupop.io",
      priority: 5,
      position: { x: 0.5, y: 0.7 }
    },
    {
      id: "6",
      name: "Google Primer",
      logo: "/placeholder.svg",
      tags: ["Large company", "Mobile-first", "Provider"],
      type: "large-company",
      alexaRank: "1",
      fundingStage: "N/A",
      website: "https://www.yourprimer.com",
      priority: 7,
      position: { x: 0.2, y: 0.2 }
    },
    {
      id: "7",
      name: "Roadtrip Nation",
      logo: "/placeholder.svg",
      tags: ["Marketplace", "Community-led", "SaaS"],
      type: "startup",
      alexaRank: "87,600",
      fundingStage: "Series A",
      website: "https://roadtripnation.com",
      priority: 4,
      position: { x: 0.7, y: 0.6 }
    },
    {
      id: "8",
      name: "Skillshare",
      logo: "/placeholder.svg",
      tags: ["Large company", "Marketplace", "Provider"],
      type: "large-company",
      alexaRank: "3,450",
      fundingStage: "Series E",
      website: "https://www.skillshare.com",
      priority: 8,
      position: { x: 0.6, y: 0.4 }
    },
    {
      id: "9",
      name: "Study Together",
      logo: "/placeholder.svg",
      tags: ["Startup", "Community-led", "Recently funded"],
      type: "startup",
      alexaRank: "156,780",
      fundingStage: "Seed",
      website: "https://studytogether.com",
      priority: 6,
      position: { x: 0.3, y: 0.5 }
    },
    {
      id: "10",
      name: "Nawwel",
      logo: "/placeholder.svg",
      tags: ["Startup", "SaaS", "Bootstrapped"],
      type: "startup",
      alexaRank: "203,400",
      fundingStage: "Bootstrapped",
      website: "https://nawwel.edu",
      priority: 3,
      position: { x: 0.4, y: 0.8 }
    },
    {
      id: "11",
      name: "Wiseshot",
      logo: "/placeholder.svg",
      tags: ["Startup", "Mobile-first", "Recently funded"],
      type: "startup",
      alexaRank: "189,560",
      fundingStage: "Pre-seed",
      website: "https://wiseshot.app",
      priority: 4,
      position: { x: 0.7, y: 0.2 }
    },
    {
      id: "12",
      name: "Landit",
      logo: "/placeholder.svg",
      tags: ["Startup", "SaaS", "Recently funded"],
      type: "startup",
      alexaRank: "112,800",
      fundingStage: "Series A",
      website: "https://www.landit.com",
      priority: 5,
      position: { x: 0.6, y: 0.7 }
    },
    {
      id: "13",
      name: "LearnPath",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "Career platform", "Enterprise"],
      type: "startup",
      alexaRank: "156,780",
      fundingStage: "Series A",
      priority: 6,
      position: { x: 0.4, y: 0.3 }
    },
    {
      id: "14",
      name: "SkillBridge",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "B2B", "Enterprise"],
      type: "large-company",
      alexaRank: "89,450",
      fundingStage: "Series C",
      priority: 7,
      position: { x: 0.6, y: 0.4 }
    },
    {
      id: "15",
      name: "TechMentor",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "1:1 Coaching", "Premium"],
      type: "startup",
      alexaRank: "234,567",
      fundingStage: "Seed",
      priority: 5,
      position: { x: 0.7, y: 0.6 }
    },
    {
      id: "16",
      name: "CareerBoost",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "Job platform", "Enterprise"],
      type: "large-company",
      alexaRank: "45,678",
      fundingStage: "Series D",
      priority: 8,
      position: { x: 0.3, y: 0.4 }
    },
    {
      id: "17",
      name: "SkillForge",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "Community", "B2B"],
      type: "startup",
      alexaRank: "167,890",
      fundingStage: "Series A",
      priority: 6,
      position: { x: 0.5, y: 0.7 }
    },
    {
      id: "18",
      name: "LearnHub Pro",
      logo: "/placeholder.svg",
      tags: ["Adjacent", "Enterprise", "LMS"],
      type: "large-company",
      alexaRank: "78,901",
      fundingStage: "Series B",
      priority: 7,
      position: { x: 0.6, y: 0.3 }
    },
    {
      id: "19",
      name: "AITeach",
      logo: "/placeholder.svg",
      tags: ["Emerging", "AI-powered", "EdTech"],
      type: "startup",
      alexaRank: "345,678",
      fundingStage: "Seed",
      priority: 4,
      position: { x: 0.7, y: 0.5 }
    },
    {
      id: "20",
      name: "SkillAI",
      logo: "/placeholder.svg",
      tags: ["Emerging", "AI", "Personalized"],
      type: "startup",
      alexaRank: "456,789",
      fundingStage: "Pre-seed",
      priority: 3,
      position: { x: 0.4, y: 0.6 }
    },
    {
      id: "21",
      name: "LearnGPT",
      logo: "/placeholder.svg",
      tags: ["Emerging", "AI", "Practice"],
      type: "startup",
      alexaRank: "567,890",
      fundingStage: "Seed",
      priority: 4,
      position: { x: 0.5, y: 0.4 }
    },
    {
      id: "22",
      name: "CodeMaster AI",
      logo: "/placeholder.svg",
      tags: ["Emerging", "AI", "Coding"],
      type: "startup",
      alexaRank: "678,901",
      fundingStage: "Seed",
      priority: 4,
      position: { x: 0.3, y: 0.6 }
    },
    {
      id: "23",
      name: "TechPrep",
      logo: "/placeholder.svg",
      tags: ["Emerging", "Practice", "Community"],
      type: "startup",
      alexaRank: "789,012",
      fundingStage: "Pre-seed",
      priority: 3,
      position: { x: 0.6, y: 0.5 }
    },
    {
      id: "24",
      name: "InterviewPro",
      logo: "/placeholder.svg",
      tags: ["Emerging", "Interview prep", "AI"],
      type: "startup",
      alexaRank: "890,123",
      fundingStage: "Seed",
      priority: 4,
      position: { x: 0.4, y: 0.7 }
    }
  ]);
  
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  
  // State for takeaways
  const [takeaways, setTakeaways] = useState<Takeaway[]>([
    {
      id: "1",
      title: "Discover Page onboarding",
      description: "Daily inspiration feed increases sticky visits from day one.",
      screenshot: "/placeholder.svg",
      source: "MasterClass",
      sourceIcon: "/placeholder.svg",
      category: "UX idea",
      saved: false
    },
    {
      id: "2",
      title: "Social referrals loop",
      description: "Referral codes embedded in user stories drive 28% sign-ups.",
      screenshot: "/placeholder.svg",
      source: "Skillshare",
      sourceIcon: "/placeholder.svg",
      category: "Growth tactic",
      saved: false
    },
    {
      id: "3",
      title: "Weekly video digest",
      description: "Curated editorial keeps dormant users engaged.",
      screenshot: "/placeholder.svg",
      source: "Brilliant",
      sourceIcon: "/placeholder.svg",
      category: "Growth tactic",
      saved: false
    },
    {
      id: "4",
      title: "Microcredentials gallery",
      description: "Visible skill badges motivate course completions by 34%.",
      screenshot: "/placeholder.svg",
      source: "Scaler Academy",
      sourceIcon: "/placeholder.svg",
      category: "Product wedge",
      saved: false
    },
    {
      id: "5",
      title: "Personalized learning path",
      description: "AI-driven skill assessments create custom roadmaps for users.",
      screenshot: "/placeholder.svg",
      source: "Ask AI Mentor",
      sourceIcon: "/placeholder.svg",
      category: "Product wedge",
      saved: false
    },
    {
      id: "6",
      title: "Community showcase",
      description: "User content highlighted on homepage builds loyalty.",
      screenshot: "/placeholder.svg",
      source: "Study Together",
      sourceIcon: "/placeholder.svg",
      category: "Brand move",
      saved: false
    },
    {
      id: "7",
      title: "Mobile learning snacks",
      description: "5-minute micro-lessons drive 3x daily app opens.",
      screenshot: "/placeholder.svg",
      source: "Google Primer",
      sourceIcon: "/placeholder.svg",
      category: "UX idea",
      saved: false
    },
    {
      id: "8",
      title: "Expert AMA sessions",
      description: "Live Q&A events create appointment viewing and FOMO.",
      screenshot: "/placeholder.svg",
      source: "Roadtrip Nation",
      sourceIcon: "/placeholder.svg",
      category: "Brand move",
      saved: false
    }
  ]);
  
  // State for trends
  const [trends, setTrends] = useState<Trend[]>([
    {
      id: "1",
      title: "Microsubscriptions",
      description: "Platforms slice offerings into ₹99 micro-tiers.",
      icon: "sparkles",
      accepted: false
    },
    {
      id: "2",
      title: "AI copilots in onboarding",
      description: "Chat-style guides replace static tours.",
      icon: "bot",
      accepted: false
    },
    {
      id: "3",
      title: "Gamified dashboards",
      description: "Progress tracking with game mechanics increases retention.",
      icon: "gamepad",
      accepted: false
    },
    {
      id: "4",
      title: "Community-led help",
      description: "User forums replacing traditional support channels.",
      icon: "users",
      accepted: false
    },
    {
      id: "5",
      title: "Well-being upsells",
      description: "Mental wellness features becoming premium add-ons.",
      icon: "heart",
      accepted: false
    },
    {
      id: "6",
      title: "Creator brand partnerships",
      description: "Influencer collaborations driving acquisition strategies.",
      icon: "star",
      accepted: false
    },
    {
      id: "7",
      title: "Voice search SEO",
      description: "Optimizing content for conversational queries.",
      icon: "mic",
      accepted: false
    },
    {
      id: "8",
      title: "Hyper-local pricing",
      description: "Geo-specific pricing tiers based on market capacity.",
      icon: "map-pin",
      accepted: false
    },
    {
      id: "9",
      title: "Credential badges",
      description: "Portable achievement tokens for professional profiles.",
      icon: "award",
      accepted: false
    }
  ]);
  
  // State for landscape
  const [axes, setAxes] = useState({
    x: ["Transactional", "Experiential"],
    y: ["Traditional", "Modern"]
  });
  
  const [brandPosition, setBrandPosition] = useState<{ x: number; y: number } | null>(null);
  const [landscapeSnapshots, setLandscapeSnapshots] = useState<LandscapeSnapshot[]>([]);
  
  // State for insights
  const [secondaryInsights, setSecondaryInsights] = useState<SecondaryInsight[]>([
    {
      id: "1",
      text: "Competitors with daily active content have 3x higher retention",
      source: "Discovered from Scaler Academy",
      category: "competitor",
      timestamp: new Date(),
      starred: true
    },
    {
      id: "2",
      text: "Freemium model with low entry barriers is dominant in our space",
      source: "Market trend analysis",
      category: "trend",
      timestamp: new Date(),
      starred: false
    }
  ]);
  
  // Competitor functions
  const addCompetitor = (competitor: Competitor) => {
    setCompetitors(prev => [...prev, competitor]);
    toggleSelectCompetitor(competitor.id);
    // Analytics
    console.log("Analytics: onCompetitorAdd", { source: "manual", id: competitor.id });
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
    
    // Analytics
    console.log("Analytics: onTakeawaySave", { card_id: id });
    
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
    
    // Analytics
    console.log("Analytics: onTrendAccept", { trend_id: id });
    
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
    
    // Analytics
    console.log("Analytics: onAxisChange", { axis, new_labels: labels });
  };
  
  const updateCompetitorPosition = (id: string, position: { x: number; y: number }) => {
    setCompetitors(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, position } : comp
      )
    );
    
    // Analytics
    console.log("Analytics: onLandscapeDrag", { token_id: id, x: position.x, y: position.y });
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
    
    // Analytics
    console.log("Analytics: onInsightPoolUpdate", { pool: "secondary", action: "add", insight_id: newInsight.id });
  };
  
  const starInsight = (id: string, starred: boolean) => {
    setSecondaryInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, starred } : insight
      )
    );
    
    // Analytics
    console.log("Analytics: onInsightPoolUpdate", { 
      pool: "secondary", 
      action: starred ? "star" : "unstar", 
      insight_id: id 
    });
  };
  
  const deleteInsight = (id: string) => {
    setSecondaryInsights(prev => prev.filter(insight => insight.id !== id));
    
    // Analytics
    console.log("Analytics: onInsightPoolUpdate", { pool: "secondary", action: "delete", insight_id: id });
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
    
    // Analytics
    console.log("Analytics: onInsightPoolUpdate", { pool: "secondary", action: "merge", insight_id: newInsight.id });
    
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
