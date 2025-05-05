import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { 
  MOCK_STATS, 
  MOCK_CHATTER_CARDS, 
  MOCK_LIBRARY_ITEMS, 
  MOCK_MARKET_INSIGHTS 
} from '@/data/mockMarket';

// Define the types for our data
interface Stat {
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

interface ChatterCard {
  id: string;
  source: 'twitter' | 'linkedin' | 'medium';
  content: string;
  likes: number;
  reposts: number;
  saved: boolean;
  muted: boolean;
  originalUrl: string;
}

interface LibraryItem {
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

interface MarketInsight {
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

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stats state
  const [stats, setStats] = useState<Stat[]>(MOCK_STATS.slice(0, 6)); // Initial 6 stats
  const [filteredStats, setFilteredStats] = useState<Stat[]>(MOCK_STATS.slice(0, 6));
  const [filters, setFilters] = useState({ region: '', year: '', metric: '' });
  const [displayedStatsCount, setDisplayedStatsCount] = useState(6);

  // Chatter state
  const [chatterCards, setChatterCards] = useState<ChatterCard[]>(MOCK_CHATTER_CARDS);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false); // Changed to false by default to stop periodic reloads

  // Library state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(MOCK_LIBRARY_ITEMS);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<LibraryItem | null>(null);

  // Market insights state
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>(MOCK_MARKET_INSIGHTS);
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
    const newCount = Math.min(displayedStatsCount + 6, MOCK_STATS.length);
    setDisplayedStatsCount(newCount);
    setStats(MOCK_STATS.slice(0, newCount));
    setFilteredStats(MOCK_STATS.slice(0, newCount));
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
    setChatterCards([...MOCK_CHATTER_CARDS].sort(() => Math.random() - 0.5));
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