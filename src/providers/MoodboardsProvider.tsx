import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MoodboardsContext, KeywordCategory, Keyword, DirectionCard, Moodboard, MoodboardTile, ImageCategory } from "@/contexts/MoodboardsContext";
import { 
  SEED_KEYWORDS, 
  SEED_DIRECTIONS, 
  IMAGE_CATEGORY_SUGGESTIONS, 
  IMAGE_DIMENSIONS, 
  IMAGE_REPOSITORY, 
  FALLBACK_IMAGES 
} from '@/data/mockMoodboards';

// Helper function to generate a placeholder image URL
const getPlaceholderImage = (category: ImageCategory): string => {
  // For now, use placeholder URLs. In a real implementation, this would integrate with Unsplash API
  return `https://source.unsplash.com/random/${IMAGE_DIMENSIONS[category].width}x${IMAGE_DIMENSIONS[category].height}/?${encodeURIComponent(IMAGE_CATEGORY_SUGGESTIONS[category])}`;
};

export const MoodboardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // Initialize keywords from seed data
  const [keywords, setKeywords] = useState<Record<KeywordCategory, Keyword[]>>(() => {
    const initialKeywords: Record<KeywordCategory, Keyword[]> = {
      'Culture': [],
      'Customer': [],
      'Voice': [],
      'Feel': [],
      'Impact': [],
      'X-Factor': []
    };

    // Convert seed strings to Keyword objects
    Object.entries(SEED_KEYWORDS).forEach(([category, words]) => {
      initialKeywords[category as KeywordCategory] = words.map((word, index) => ({
        id: `${category}-${index}`,
        text: word,
        category: category as KeywordCategory
      }));
    });

    return initialKeywords;
  });

  // Initialize directions
  const [directions, setDirections] = useState<DirectionCard[]>(() => 
    SEED_DIRECTIONS.map((dir, index) => ({
      id: dir.id || `dir-${index + 1}`,
      title: dir.title || `Direction ${index + 1}`,
      tags: dir.tags || [],
      description: dir.description || "A brand direction with a clear focus and purpose.",
      relevance: dir.relevance || Math.floor(Math.random() * 20) + 75, // Random between 75-95
      thumbnails: dir.thumbnails || [],
      selected: dir.selected || false
    }))
  );

  // Generate 6 more mock directions to have 8 total
  useEffect(() => {
    if (directions.length < 8) {
      const newDirections = Array.from({ length: 8 - directions.length }).map((_, index) => {
        const dirIndex = directions.length + index;
        return {
          id: `dir-${dirIndex + 1}`,
          title: `Direction ${dirIndex + 1}`,
          tags: ["MODERN", "CLEAN", "PROFESSIONAL", "VIBRANT"].slice(0, Math.floor(Math.random() * 3) + 2),
          description: "This direction focuses on creating a memorable brand experience with clear visual language.",
          relevance: Math.floor(Math.random() * 20) + 75, // Random between 75-95
          thumbnails: [
            "Digital interface with smooth gradients",
            "Clean typography on dark background",
            "Abstract geometric shapes and patterns"
          ],
          selected: false
        };
      });
      
      setDirections(prev => [...prev, ...newDirections]);
    }
  }, []);

  // Track selected directions
  const [selectedDirections, setSelectedDirections] = useState<DirectionCard[]>([]);

  // Initialize moodboards (will be populated when directions are selected)
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);

  // Track the final selected moodboard
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);

  // Add a new keyword
  const addKeyword = (keyword: string, category: KeywordCategory) => {
    // Check if keyword already exists in any category
    const isDuplicate = Object.values(keywords).flat().some(k => 
      k.text.toLowerCase() === keyword.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error("This keyword already exists");
      return;
    }

    setKeywords(prev => ({
      ...prev,
      [category]: [
        ...prev[category],
        {
          id: `${category}-${Date.now()}`,
          text: keyword,
          category
        }
      ]
    }));
    
    logEvent("onKeywordEdit", { action: "add", word: keyword });
  };

  // Remove a keyword
  const removeKeyword = (keywordId: string) => {
    let removedKeyword: Keyword | null = null;
    
    setKeywords(prev => {
      const updated = { ...prev };
      
      for (const category of Object.keys(updated) as KeywordCategory[]) {
        const keywordIndex = updated[category].findIndex(k => k.id === keywordId);
        if (keywordIndex !== -1) {
          removedKeyword = updated[category][keywordIndex];
          updated[category] = updated[category].filter(k => k.id !== keywordId);
          break;
        }
      }
      
      return updated;
    });
    
    if (removedKeyword) {
      logEvent("onKeywordEdit", { action: "remove", word: removedKeyword.text });
    }
  };

  // Move a keyword to a different category
  const moveKeyword = (keywordId: string, targetCategory: KeywordCategory) => {
    let movedKeyword: Keyword | null = null;
    
    setKeywords(prev => {
      const updated = { ...prev };
      
      // Find and remove the keyword from its current category
      for (const category of Object.keys(updated) as KeywordCategory[]) {
        const keywordIndex = updated[category].findIndex(k => k.id === keywordId);
        if (keywordIndex !== -1) {
          movedKeyword = { 
            ...updated[category][keywordIndex],
            category: targetCategory
          };
          updated[category] = updated[category].filter(k => k.id !== keywordId);
          break;
        }
      }
      
      // Add it to the target category
      if (movedKeyword) {
        updated[targetCategory] = [...updated[targetCategory], movedKeyword];
      }
      
      return updated;
    });
    
    if (movedKeyword) {
      logEvent("onKeywordEdit", { 
        action: "drag", 
        word: movedKeyword.text, 
        from: movedKeyword.category, 
        to: targetCategory 
      });
    }
  };

  // Toggle direction selection
  const toggleDirectionSelection = (directionId: string) => {
    setDirections(prev => {
      const updatedDirections = prev.map(dir => {
        if (dir.id === directionId) {
          return { ...dir, selected: !dir.selected };
        }
        return dir;
      });
      
      const selectedCount = updatedDirections.filter(dir => dir.selected).length;
      
      // Enforce maximum of 3 selected directions
      if (selectedCount > 3) {
        toast.error("You can select a maximum of 3 directions");
        return prev;
      }
      
      const direction = updatedDirections.find(dir => dir.id === directionId);
      if (direction) {
        logEvent("onDirectionSelect", { id: directionId, state: direction.selected });
      }
      
      return updatedDirections;
    });
  };

  // Replace a direction with a new one
  const replaceDirection = (directionId: string) => {
    setDirections(prev => {
      const dirIndex = prev.findIndex(dir => dir.id === directionId);
      if (dirIndex === -1) return prev;
      
      const newDirectionId = `dir-${Date.now()}`;
      const newDirection: DirectionCard = {
        id: newDirectionId,
        title: `New Direction ${Math.floor(Math.random() * 100)}`,
        tags: ["FRESH", "DYNAMIC", "UNIQUE"].slice(0, Math.floor(Math.random() * 2) + 2),
        description: "A fresh approach to brand communication with a focus on authentic connection.",
        relevance: Math.floor(Math.random() * 20) + 75,
        thumbnails: [
          "Abstract pattern with brand colors",
          "Minimalist UI components",
          "Typography layout on dark background"
        ],
        selected: false
      };
      
      logEvent("onDirectionRegenerate", { id_old: directionId, id_new: newDirectionId });
      
      const result = [...prev];
      result[dirIndex] = newDirection;
      return result;
    });
  };

  // Delete a direction
  const deleteDirection = (directionId: string) => {
    setDirections(prev => prev.filter(dir => dir.id !== directionId));
  };

  // Generate more directions
  const generateMoreDirections = (count: number = 2) => {
    const newDirections = Array.from({ length: count }).map((_, index) => {
      const newId = `dir-${Date.now() + index}`;
      return {
        id: newId,
        title: `Direction ${Math.floor(Math.random() * 100)}`,
        tags: ["MODERN", "CLEAN", "BOLD", "ELEGANT", "DYNAMIC"].slice(0, Math.floor(Math.random() * 3) + 2),
        description: "A brand direction that brings together essential elements with a carefully crafted visual style.",
        relevance: Math.floor(Math.random() * 20) + 75,
        thumbnails: [
          "Digital interface elements",
          "Brand photography style sample",
          "Color palette application"
        ],
        selected: false
      };
    });
    
    setDirections(prev => [...prev, ...newDirections]);
  };

  // Update moodboards whenever selected directions change
  useEffect(() => {
    const newSelectedDirections = directions.filter(dir => dir.selected);
    setSelectedDirections(newSelectedDirections);
    
    // Create moodboards for newly selected directions
    const currentMoodboardIds = moodboards.map(board => board.direction.id);
    const directionsNeedingMoodboards = newSelectedDirections.filter(
      dir => !currentMoodboardIds.includes(dir.id)
    );
    
    // Create new moodboards for these directions
    const newMoodboards = directionsNeedingMoodboards.map(direction => {
      // Create 11 tiles for this moodboard
      const categories = Object.keys(IMAGE_CATEGORY_SUGGESTIONS) as ImageCategory[];
      const tiles: MoodboardTile[] = categories.map(category => {
        const { width, height } = IMAGE_DIMENSIONS[category];
        return {
          id: `${direction.id}-${category}`,
          category,
          imageUrl: getPlaceholderImage(category),
          width,
          height
        };
      });
      
      return {
        id: `moodboard-${direction.id}`,
        direction,
        tiles
      };
    });
    
    if (newMoodboards.length > 0) {
      setMoodboards(prev => [...prev, ...newMoodboards]);
    }
    
    // Remove moodboards for deselected directions
    const selectedDirectionIds = newSelectedDirections.map(dir => dir.id);
    setMoodboards(prev => prev.filter(board => selectedDirectionIds.includes(board.direction.id)));
  }, [directions]);

  // Swap a moodboard tile with a new image
  const swapMoodboardTile = (moodboardId: string, tileId: string, newImage: string) => {
    setMoodboards(prev => {
      return prev.map(board => {
        if (board.id === moodboardId) {
          const tiles = board.tiles.map(tile => {
            if (tile.id === tileId) {
              const category = tile.category;
              logEvent("onTileSwap", { board_id: moodboardId, tile_type: category });
              return { ...tile, imageUrl: newImage };
            }
            return tile;
          });
          return { ...board, tiles };
        }
        return board;
      });
    });
  };

  // Remove a moodboard tile
  const removeMoodboardTile = (moodboardId: string, tileId: string) => {
    setMoodboards(prev => {
      return prev.map(board => {
        if (board.id === moodboardId) {
          const tiles = board.tiles.filter(tile => tile.id !== tileId);
          return { ...board, tiles };
        }
        return board;
      });
    });
  };

  // Shuffle a moodboard
  const shuffleMoodboard = (moodboardId: string) => {
    setMoodboards(prev => {
      return prev.map(board => {
        if (board.id === moodboardId) {
          const shuffledTiles = [...board.tiles]
            .sort(() => Math.random() - 0.5);
          return { ...board, tiles: shuffledTiles };
        }
        return board;
      });
    });
  };

  // Select the final moodboard
  const selectFinalMoodboard = (moodboardId: string) => {
    setSelectedMoodboard(moodboardId);
    logEvent("onMoodboardPick", { winner_id: moodboardId });
  };

  // Complete the module and redirect to timeline
  const completeModule = () => {
    if (!selectedMoodboard) {
      toast.error("Please select a moodboard first");
      return;
    }
    
    const winningMoodboard = moodboards.find(board => board.id === selectedMoodboard);
    if (!winningMoodboard) {
      toast.error("Selected moodboard not found");
      return;
    }
    
    toast.success(`Moodboard "${winningMoodboard.direction.title}" selected`);
    navigate("/timeline", { state: { fromMoodboards: true } });
  };

  // Log analytics events
  const logEvent = (eventType: string, data: any) => {
    console.log(`[Analytics] ${eventType}:`, data);
    // In a real application, this would send data to an analytics service
  };

  return (
    <MoodboardsContext.Provider
      value={{
        keywords,
        directions,
        moodboards,
        selectedDirections,
        selectedMoodboard,
        
        addKeyword,
        removeKeyword,
        moveKeyword,
        
        toggleDirectionSelection,
        replaceDirection,
        deleteDirection,
        generateMoreDirections,
        
        swapMoodboardTile,
        removeMoodboardTile,
        shuffleMoodboard,
        
        selectFinalMoodboard,
        completeModule,
        
        logEvent
      }}
    >
      {children}
    </MoodboardsContext.Provider>
  );
};