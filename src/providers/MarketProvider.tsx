import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

// Define the types for our data
export interface Stat {
  id: string;
  value: string;
  description: string;
  source: string;
  url: string;
  accepted: boolean;
  region?: string;
  year?: string;
  metric?: string;
}

export interface ChatterCard {
  id: string;
  source: 'twitter' | 'linkedin' | 'medium';
  content: string;
  likes: number;
  reposts: number;
  saved: boolean;
  muted: boolean;
  originalUrl: string;
}

export interface LibraryItem {
  id: string;
  type: 'report' | 'case-study' | 'graph';
  title: string;
  saved: boolean;
  viewed: boolean;
  content: string;
  url?: string;
  previewUrl?: string;
  data?: any; // For graph data
}

export interface MarketInsight {
  id: string;
  text: string;
  source: string;
  type: 'stat' | 'social' | 'library' | 'merged';
  starred: boolean;
  column?: 'primary' | 'secondary' | 'market';
  originalId?: string; // Reference to original item
}

interface MarketContextProps {
  // Statistics section
  stats: Stat[];
  acceptStat: (id: string) => void;
  discardStat: (id: string) => void;
  loadMoreStats: () => void;
  filteredStats: Stat[];
  setFilteredStats: React.Dispatch<React.SetStateAction<Stat[]>>;
  filters: { region: string; year: string; metric: string };
  setFilters: React.Dispatch<React.SetStateAction<{ region: string; year: string; metric: string }>>;
  
  // Social chatter section
  chatterCards: ChatterCard[];
  saveChatterCard: (id: string) => void;
  muteChatterCard: (id: string) => void;
  searchChatter: (query: string) => void;
  isAutoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  
  // Library section
  libraryItems: LibraryItem[];
  saveLibraryItem: (id: string) => void;
  viewLibraryItem: (id: string) => void;
  selectedLibraryItem: LibraryItem | null;
  setSelectedLibraryItem: React.Dispatch<React.SetStateAction<LibraryItem | null>>;
  
  // Market insights
  marketInsights: MarketInsight[];
  starInsight: (id: string) => void;
  mergeInsights: (ids: string[], mergedText: string) => void;
  moveInsight: (id: string, column: 'primary' | 'secondary' | 'market') => void;
  generateHeadline: () => void;
  headline: string;
  
  // Validation
  isSection1Complete: boolean;
  isSection2Complete: boolean;
  isSection3Complete: boolean;
  isSection4Complete: boolean;
  isModuleComplete: boolean;
  
  // Counters
  acceptedStatsCount: number;
  savedChatterCount: number;
  savedLibraryCount: number;
  viewedGraphCount: number;
  starredMarketInsightsCount: number;
}

const MarketContext = createContext<MarketContextProps | undefined>(undefined);

// Mock data for stats, chatter cards, and library items
const mockStats: Stat[] = [
  {
    id: "stat1",
    value: "$26 B",
    description: "Global spend on AI recruiting tools (2023)",
    source: "Deloitte",
    url: "deloitte.com/ai-ats-2023",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Spend"
  },
  {
    id: "stat2",
    value: "37%",
    description: "Projected growth of HR tech in APAC (2024-27)",
    source: "Gartner",
    url: "gartner.com/hr-tech-forecast",
    accepted: false,
    region: "APAC",
    year: "2024",
    metric: "CAGR"
  },
  {
    id: "stat3",
    value: "68%",
    description: "Enterprise HR departments using AI screening (2023)",
    source: "McKinsey",
    url: "mckinsey.com/future-of-work",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Adoption"
  },
  {
    id: "stat4",
    value: "$4.2 K",
    description: "Average cost-per-hire reduction with AI tools",
    source: "LinkedIn",
    url: "linkedin.com/business/talent/reports",
    accepted: false,
    region: "North America",
    year: "2022",
    metric: "Cost Savings"
  },
  {
    id: "stat5",
    value: "42%",
    description: "Decrease in time-to-fill positions using AI matching",
    source: "Indeed",
    url: "indeed.com/lead/hiring-stats",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Efficiency"
  },
  {
    id: "stat6",
    value: "92%",
    description: "HR leaders plan to increase tech investment",
    source: "SHRM",
    url: "shrm.org/tech-survey",
    accepted: false,
    region: "North America",
    year: "2023",
    metric: "Investment"
  },
  {
    id: "stat7",
    value: "$122 M",
    description: "VC funding for HR tech startups (Q1 2023)",
    source: "CBInsights",
    url: "cbinsights.com/hr-tech",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Investment"
  },
  {
    id: "stat8",
    value: "3.2×",
    description: "ROI for companies using AI recruitment",
    source: "Bersin",
    url: "bersin.com/research/ai-talent",
    accepted: false,
    region: "Global",
    year: "2022",
    metric: "ROI"
  },
  {
    id: "stat9",
    value: "18%",
    description: "Annual growth in employee experience platforms",
    source: "Forrester",
    url: "forrester.com/hr-tech-wave",
    accepted: false,
    region: "Global",
    year: "2024",
    metric: "Growth"
  },
  {
    id: "stat10",
    value: "76%",
    description: "Companies citing skills gap as hiring challenge",
    source: "PwC",
    url: "pwc.com/workforce-trends",
    accepted: false,
    region: "Europe",
    year: "2023",
    metric: "Challenge"
  },
  {
    id: "stat11",
    value: "$1.8 B",
    description: "Market size for employee wellness technology",
    source: "Grand View Research",
    url: "grandviewresearch.com/wellness-tech",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Market Size"
  },
  {
    id: "stat12",
    value: "52%",
    description: "Job seekers using mobile exclusively for search",
    source: "Glassdoor",
    url: "glassdoor.com/trends/mobile",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Behavior"
  }
];

const mockChatterCards: ChatterCard[] = [
  {
    id: "chat1",
    source: "twitter",
    content: "Just got my role via an AI chat-based interview. Future is here.",
    likes: 1400,
    reposts: 284,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat2",
    source: "linkedin",
    content: "Hiring teams hate toggling 5 dashboards; single pane needed.",
    likes: 312,
    reposts: 78,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat3",
    source: "medium",
    content: "AI hiring isn't just about efficiency; it's about removing unconscious bias from the equation entirely.",
    likes: 933,
    reposts: 155,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat4",
    source: "twitter",
    content: "Spent $20K on recruiting software last year. Got 2 decent hires. This system is broken.",
    likes: 2100,
    reposts: 450,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat5",
    source: "linkedin",
    content: "Remote work requires better talent screening tools. Period.",
    likes: 876,
    reposts: 122,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat6",
    source: "medium",
    content: "The gap between hiring tech and actual human connection is widening. We need both.",
    likes: 504,
    reposts: 87,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat7",
    source: "twitter",
    content: "Diverse candidates still getting filtered by \"AI\" that's trained on biased data. Not progress.",
    likes: 3200,
    reposts: 788,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat8",
    source: "linkedin",
    content: "Just tested 5 AI resume scanners with identical content but different names. Results were... enlightening.",
    likes: 5400,
    reposts: 1200,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat9",
    source: "medium",
    content: "The future of HR isn't about replacing humans—it's about augmenting capabilities where we're naturally weakest.",
    likes: 722,
    reposts: 134,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat10",
    source: "twitter",
    content: "Anyone else notice how talent marketplaces are replacing traditional recruiting agencies? Massive shift happening.",
    likes: 987,
    reposts: 213,
    saved: false,
    muted: false,
    originalUrl: "#"
  }
];

const mockLibraryItems: LibraryItem[] = [
  {
    id: "lib1",
    type: "report",
    title: "PwC Future of Talent 2024 (72 pp)",
    saved: false,
    viewed: false,
    content: "This report explores the changing dynamics of talent acquisition...",
    url: "#",
    previewUrl: "/placeholder.svg" 
  },
  {
    id: "lib2",
    type: "case-study",
    title: "Spotify's squad culture framework",
    saved: false,
    viewed: false,
    content: "How Spotify restructured their talent organization to promote agility...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib3",
    type: "graph",
    title: "VC investment in HR Tech by quarter",
    saved: false,
    viewed: false,
    content: "Quarterly investment trends in HR Technology startups...",
    data: {
      labels: ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
      datasets: [
        {
          label: 'Investment in $M',
          data: [120, 145, 132, 165, 178, 156, 201, 235],
          borderColor: '#7DF9FF',
          tension: 0.4
        }
      ]
    }
  },
  {
    id: "lib4",
    type: "report",
    title: "Accenture: Future of Work 2025",
    saved: false,
    viewed: false,
    content: "This report details how AI and automation will reshape work environments...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib5",
    type: "case-study",
    title: "Netflix's hyper-personalised UI",
    saved: false,
    viewed: false,
    content: "How Netflix applies personalization techniques to their user interface...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib6",
    type: "graph",
    title: "ARPU growth vs churn (2018-24)",
    saved: false,
    viewed: false,
    content: "Analysis of average revenue per user growth compared to customer churn rates...",
    data: {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'ARPU ($)',
          data: [42, 45, 50, 58, 63, 69, 75],
          borderColor: '#7DF9FF',
          tension: 0.4
        },
        {
          label: 'Churn Rate (%)',
          data: [12, 11, 8, 7.5, 6.8, 6.2, 5.8],
          borderColor: '#FF6363',
          tension: 0.4
        }
      ]
    }
  },
  {
    id: "lib7",
    type: "report",
    title: "Deloitte: HR Tech Stack Survey 2023",
    saved: false,
    viewed: false,
    content: "Key findings from Deloitte's annual survey of HR technology adoption...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib8",
    type: "case-study",
    title: "Airbnb's Remote-First Transition",
    saved: false,
    viewed: false,
    content: "How Airbnb rebuilt their talent processes for a distributed workforce...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib9",
    type: "graph",
    title: "Remote vs In-Office Productivity Metrics",
    saved: false,
    viewed: false,
    content: "Comparative analysis of productivity metrics across remote and in-office workers...",
    data: {
      labels: ['Focus Time', 'Meeting Hours', 'Project Completion', 'Collaboration', 'Satisfaction'],
      datasets: [
        {
          label: 'Remote',
          data: [78, 65, 82, 72, 88],
          backgroundColor: 'rgba(125, 249, 255, 0.6)',
        },
        {
          label: 'In-Office',
          data: [62, 85, 75, 88, 76],
          backgroundColor: 'rgba(255, 99, 99, 0.6)',
        }
      ]
    }
  },
  {
    id: "lib10",
    type: "report",
    title: "McKinsey: Global Workforce Trends 2024",
    saved: false,
    viewed: false,
    content: "Analysis of major workforce shifts and strategic responses...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib11",
    type: "case-study",
    title: "Google's Project Oxygen Findings",
    saved: false,
    viewed: false,
    content: "How Google identified key management behaviors that drive team success...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib12",
    type: "graph",
    title: "Skills Gap Trend by Industry Sector",
    saved: false,
    viewed: false,
    content: "Analysis of skills gap severity across different industry sectors...",
    data: {
      labels: ['Tech', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'],
      datasets: [
        {
          label: '2020',
          data: [76, 52, 48, 65, 41],
          backgroundColor: 'rgba(125, 249, 255, 0.6)',
        },
        {
          label: '2023',
          data: [82, 68, 59, 72, 55],
          backgroundColor: 'rgba(253, 213, 111, 0.6)',
        }
      ]
    }
  },
  {
    id: "lib13",
    type: "report",
    title: "Gartner: HR Technology Magic Quadrant 2023",
    saved: false,
    viewed: false,
    content: "Evaluation of leading HR technology vendors and platforms...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib14",
    type: "case-study",
    title: "Microsoft's Talent Data Lake Implementation",
    saved: false,
    viewed: false,
    content: "How Microsoft unified disparate talent data sources to improve decision making...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib15",
    type: "graph",
    title: "Time-to-Hire Benchmark by Company Size",
    saved: false,
    viewed: false,
    content: "Analysis of average time-to-hire across different company size segments...",
    data: {
      labels: ['<50', '50-200', '201-1000', '1001-5000', '>5000'],
      datasets: [
        {
          label: 'Days to Hire',
          data: [18, 25, 32, 48, 62],
          backgroundColor: 'rgba(125, 249, 255, 0.8)',
        }
      ]
    }
  }
];

const mockMarketInsights: MarketInsight[] = [
  {
    id: "mi1",
    text: "68% of enterprise HR departments now use AI screening tools",
    source: "McKinsey Research",
    type: "stat",
    starred: true,
    column: "market"
  },
  {
    id: "mi2",
    text: "AI-driven recruitment shows 3.2× ROI compared to traditional methods",
    source: "Industry Report",
    type: "stat",
    starred: true,
    column: "market"
  },
  {
    id: "mi3",
    text: "Remote hiring practices have increased talent pool diversity by 47%",
    source: "LinkedIn Insights",
    type: "social",
    starred: true,
    column: "market"
  },
  {
    id: "mi4",
    text: "Talent marketplace adoption grew 58% YoY in tech sector",
    source: "Market Analysis",
    type: "library",
    starred: true,
    column: "market"
  },
  {
    id: "mi5",
    text: "AI screening reduces time-to-hire by average of 42%",
    source: "Research Report",
    type: "stat",
    starred: true,
    column: "market"
  }
];

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stats state
  const [stats, setStats] = useState<Stat[]>(mockStats.slice(0, 6)); // Initial 6 stats
  const [filteredStats, setFilteredStats] = useState<Stat[]>(mockStats.slice(0, 6));
  const [filters, setFilters] = useState({ region: '', year: '', metric: '' });
  const [displayedStatsCount, setDisplayedStatsCount] = useState(6);

  // Chatter state
  const [chatterCards, setChatterCards] = useState<ChatterCard[]>(mockChatterCards);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false); // Changed to false by default to stop periodic reloads

  // Library state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(mockLibraryItems);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<LibraryItem | null>(null);

  // Market insights state
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>(mockMarketInsights);
  const [headline, setHeadline] = useState("Market Research Insights");

  // Setup auto-refresh for chatter - modified to use reference for stability
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;

    if (isAutoRefreshEnabled) {
      refreshInterval = setInterval(() => {
        // Instead of rotating cards (which causes a full rerender), just update a single card
        setChatterCards(prev => {
          const newCards = [...prev];
          // Only update if there are cards
          if (newCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * newCards.length);
            // Just update the likes count instead of moving cards around
            newCards[randomIndex] = {
              ...newCards[randomIndex],
              likes: newCards[randomIndex].likes + Math.floor(Math.random() * 10)
            };
          }
          return newCards;
        });
      }, 30000); // Reduced frequency to 30 seconds
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isAutoRefreshEnabled]);

  // Stats section functions - using useCallback to prevent unnecessary rerenders
  const acceptStat = useCallback((id: string) => {
    setStats(prev => {
      // Check if the stat is already accepted to prevent unnecessary updates
      const stat = prev.find(s => s.id === id);
      if (stat && stat.accepted) return prev;
      
      return prev.map(stat => 
        stat.id === id ? { ...stat, accepted: true } : stat
      );
    });
    
    // Add to market insights when accepted
    const acceptedStat = stats.find(stat => stat.id === id);
    if (acceptedStat && !acceptedStat.accepted) {
      const newInsight: MarketInsight = {
        id: `insight-stat-${acceptedStat.id}`,
        text: `${acceptedStat.value} – ${acceptedStat.description}`,
        source: acceptedStat.source,
        type: 'stat',
        starred: false,
        column: 'market',
        originalId: acceptedStat.id
      };
      
      setMarketInsights(prev => [...prev, newInsight]);
      
      // Event tracking
      console.log("onStatAccept", id);
      toast.success("Stat accepted");
    }
  }, [stats]);

  const discardStat = useCallback((id: string) => {
    // Don't remove, just mark as not accepted - use memoized function
    setStats(prev => {
      // Check if the stat is already not accepted to prevent unnecessary updates
      const stat = prev.find(s => s.id === id);
      if (stat && !stat.accepted) return prev;
      
      return prev.map(stat => 
        stat.id === id ? { ...stat, accepted: false } : stat
      );
    });
  }, []);

  const loadMoreStats = useCallback(() => {
    const newCount = Math.min(displayedStatsCount + 6, mockStats.length);
    setDisplayedStatsCount(newCount);
    setStats(mockStats.slice(0, newCount));
    setFilteredStats(mockStats.slice(0, newCount));
  }, [displayedStatsCount]);

  // Chatter section functions - using useCallback for performance
  const saveChatterCard = useCallback((id: string) => {
    setChatterCards(prev => {
      // Check if the card is already saved to prevent unnecessary updates
      const card = prev.find(c => c.id === id);
      if (card && card.saved) return prev;
      
      return prev.map(card => 
        card.id === id ? { ...card, saved: true } : card
      );
    });
    
    // Add to market insights when saved
    const savedCard = chatterCards.find(card => card.id === id);
    if (savedCard && !savedCard.saved) {
      const newInsight: MarketInsight = {
        id: `insight-chatter-${savedCard.id}`,
        text: savedCard.content,
        source: savedCard.source === 'twitter' ? 'Twitter' : savedCard.source === 'linkedin' ? 'LinkedIn' : 'Medium',
        type: 'social',
        starred: false,
        column: 'market',
        originalId: savedCard.id
      };
      
      setMarketInsights(prev => [...prev, newInsight]);
      
      // Event tracking
      console.log("onChatterSave", id);
      toast.success("Social snippet saved");
    }
  }, [chatterCards]);

  const muteChatterCard = useCallback((id: string) => {
    setChatterCards(prev => {
      // Check if the card is already muted to prevent unnecessary updates
      const card = prev.find(c => c.id === id);
      if (card && card.muted) return prev;
      
      return prev.map(card => 
        card.id === id ? { ...card, muted: true } : card
      );
    });
    
    // Simulate removing muted cards after delay - using setTimeout outside of render
    setTimeout(() => {
      setChatterCards(prev => prev.filter(card => card.id !== id));
    }, 500);
  }, []);

  // Other functions
  const searchChatter = useCallback((query: string) => {
    // Simulate search function - in reality would fetch from API
    toast.info(`Searching for "${query}"`);
    // Shuffle the chatter cards to simulate new results
    setChatterCards([...mockChatterCards].sort(() => Math.random() - 0.5));
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
  }, []);

  // Library section functions
  const saveLibraryItem = useCallback((id: string) => {
    setLibraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, saved: true } : item
    ));
    
    // Add to market insights when saved
    const savedItem = libraryItems.find(item => item.id === id);
    if (savedItem) {
      const newInsight: MarketInsight = {
        id: `insight-library-${savedItem.id}`,
        text: `${savedItem.title}: ${savedItem.content.substring(0, 100)}...`,
        source: savedItem.type === 'report' ? 'Research Report' : 
                savedItem.type === 'case-study' ? 'Case Study' : 'Data Graph',
        type: 'library',
        starred: false,
        column: 'market'
      };
      
      setMarketInsights(prev => [...prev, newInsight]);
    }
    
    // Event tracking
    console.log("onLibrarySave", id);
    toast.success("Library item saved");
  }, [libraryItems]);

  const viewLibraryItem = useCallback((id: string) => {
    // Mark as viewed
    setLibraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, viewed: true } : item
    ));
    
    // Set as selected for preview
    const item = libraryItems.find(item => item.id === id);
    if (item) {
      setSelectedLibraryItem(item);
    }
    
    // Event tracking
    console.log("onLibraryView", id);
    if (item?.type === 'graph') {
      console.log("onGraphView", id);
    }
  }, [libraryItems]);
  
  // Synthesis canvas functions
  const starInsight = useCallback((id: string) => {
    setMarketInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, starred: !insight.starred } : insight
    ));
    
    // Event tracking
    console.log("onInsightStar", id);
  }, []);

  const mergeInsights = useCallback((ids: string[], mergedText: string) => {
    // Create a new merged insight
    const insightsToMerge = marketInsights.filter(i => ids.includes(i.id));
    const sourcesList = [...new Set(insightsToMerge.map(i => i.source))];
    
    const newInsight: MarketInsight = {
      id: `insight-merged-${Date.now()}`,
      text: mergedText,
      source: sourcesList.join(', '),
      type: 'merged',
      starred: false,
      column: insightsToMerge[0]?.column || 'market'
    };
    
    // Add merged insight and remove originals
    setMarketInsights(prev => [
      ...prev.filter(i => !ids.includes(i.id)),
      newInsight
    ]);
    
    // Event tracking
    console.log("onInsightMerge", ids);
    toast.success("Insights merged");
  }, [marketInsights]);

  const moveInsight = useCallback((id: string, column: 'primary' | 'secondary' | 'market') => {
    setMarketInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, column } : insight
    ));
  }, []);

  const generateHeadline = useCallback(() => {
    // In a real app, this would use an API call to generate text
    const starredInsights = marketInsights.filter(i => i.starred);
    const headline = `Market Analysis: ${starredInsights.length} Key Insights Reveal Shifting HR Technology Landscape`;
    setHeadline(headline);
    toast.success("Headline generated");
  }, [marketInsights]);
  
  // Validation counters - memoized calculations to prevent unnecessary rerenders
  const acceptedStatsCount = React.useMemo(() => stats.filter(s => s.accepted).length, [stats]);
  const savedChatterCount = React.useMemo(() => chatterCards.filter(c => c.saved).length, [chatterCards]);
  const savedLibraryCount = React.useMemo(() => libraryItems.filter(i => i.saved).length, [libraryItems]);
  const viewedGraphCount = React.useMemo(() => libraryItems.filter(i => i.viewed && i.type === 'graph').length, [libraryItems]);
  const starredMarketInsightsCount = React.useMemo(() => marketInsights.filter(i => i.starred && i.column === 'market').length, [marketInsights]);
  
  // Validation checks - memoized calculations
  const isSection1Complete = React.useMemo(() => acceptedStatsCount >= 8, [acceptedStatsCount]);
  const isSection2Complete = React.useMemo(() => savedChatterCount >= 6, [savedChatterCount]);
  const isSection3Complete = React.useMemo(() => savedLibraryCount >= 4 && viewedGraphCount >= 1, [savedLibraryCount, viewedGraphCount]);
  const isSection4Complete = React.useMemo(() => starredMarketInsightsCount >= 10, [starredMarketInsightsCount]);
  const isModuleComplete = React.useMemo(() => isSection1Complete && isSection2Complete && isSection3Complete, [isSection1Complete, isSection2Complete, isSection3Complete]);
  
  // Create the context value object with memoization to prevent unnecessary rerenders
  const value = React.useMemo(() => ({
    // Stats section
    stats,
    acceptStat,
    discardStat,
    loadMoreStats,
    filteredStats,
    setFilteredStats,
    filters,
    setFilters,
    
    // Social chatter section
    chatterCards,
    saveChatterCard,
    muteChatterCard,
    searchChatter,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    
    // Library section
    libraryItems,
    saveLibraryItem,
    viewLibraryItem,
    selectedLibraryItem,
    setSelectedLibraryItem,
    
    // Market insights
    marketInsights,
    starInsight,
    mergeInsights,
    moveInsight,
    generateHeadline,
    headline,
    
    // Validation
    isSection1Complete,
    isSection2Complete,
    isSection3Complete,
    isSection4Complete,
    isModuleComplete,
    
    // Counters
    acceptedStatsCount,
    savedChatterCount,
    savedLibraryCount,
    viewedGraphCount,
    starredMarketInsightsCount
  }), [
    stats, acceptStat, discardStat, loadMoreStats, filteredStats, filters,
    chatterCards, saveChatterCard, muteChatterCard, isAutoRefreshEnabled,
    libraryItems, saveLibraryItem, viewLibraryItem, selectedLibraryItem,
    marketInsights, headline, 
    isSection1Complete, isSection2Complete, isSection3Complete, isSection4Complete, isModuleComplete,
    acceptedStatsCount, savedChatterCount, savedLibraryCount, viewedGraphCount, starredMarketInsightsCount
  ]);
  
  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
};
