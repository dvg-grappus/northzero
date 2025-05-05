import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  ARCHETYPE_DATA, 
  MOCK_BRANDS, 
  KEYWORD_DATA, 
  CONFLICT_PAIRS_DATA, 
  SLIDER_DATA, 
  DEFAULT_DICHOTOMY 
} from '@/data/mockPersonality';

// Define types for the archetypes
interface ArchetypeData {
  name: string;
  match: number;
  selected: boolean;
  blendAmount?: number;
  examples?: string[];
  benefits?: string[];
  watchOuts?: string[];
}

// Define a type for the keywords
type KeywordData = {
  name: string;
  selected: boolean;
};

// Define a type for the conflict pairs
type ConflictPair = [string, string];

// Define a type for the slider
interface SliderData {
  axis: string;
  leftBrand: string;
  rightBrand: string;
  value: number;
  tooltips: string[];
}

// Define a type for the brand
interface BrandData {
  name: string;
  logo: string;
  description?: string;
}

// Define a type for the X meets Y combination
interface CombinationData {
  brandA: BrandData | null;
  brandB: BrandData | null;
  summary: string;
  implications: string[];
}

// Define a type for the dichotomy words
interface DichotomyData {
  wordOne: string;
  wordTwo: string;
  notWordOne: string;
  notWordTwo: string;
}

// Define the context type
interface PersonalityContextType {
  // Archetype state and methods
  archetypes: ArchetypeData[];
  selectedArchetype: ArchetypeData | null;
  blendedArchetypes: ArchetypeData[];
  selectArchetype: (name: string) => void;
  addToBlend: (name: string) => void;
  updateBlendAmount: (name: string, amount: number) => void;
  
  // Keywords state and methods
  keywords: KeywordData[];
  conflictPairs: ConflictPair[];
  toggleKeyword: (name: string) => void;
  selectKeywordSet: (set: string[]) => void;
  hasKeywordConflict: () => [string, string] | null;
  
  // Sliders state and methods
  sliders: SliderData[];
  updateSliderValue: (axis: string, value: number) => void;
  resetSliders: () => void;
  
  // X meets Y state and methods
  brands: BrandData[];
  combination: CombinationData;
  setBrandA: (brand: BrandData | null) => void;
  setBrandB: (brand: BrandData | null) => void;
  generateCombinationSummary: () => void;
  saveCombination: () => void;
  
  // Dichotomy state and methods
  dichotomy: DichotomyData;
  updateDichotomyWord: (position: keyof DichotomyData, word: string) => void;
  swapDichotomyWords: () => void;
  generateDichotomyCombos: () => DichotomyData[];
  
  // Navigation and completion
  completeModule: () => void;
}

// Create the context
const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export const PersonalityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Archetype state
  const [archetypes, setArchetypes] = useState<ArchetypeData[]>(ARCHETYPE_DATA);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData | null>(null);
  const [blendedArchetypes, setBlendedArchetypes] = useState<ArchetypeData[]>([]);

  // Keywords state
  const [keywords, setKeywords] = useState<KeywordData[]>(KEYWORD_DATA);
  const [conflictPairs] = useState<ConflictPair[]>(CONFLICT_PAIRS_DATA);

  // Sliders state
  const [sliders, setSliders] = useState<SliderData[]>(SLIDER_DATA);

  // X meets Y state
  const [brands] = useState<BrandData[]>(MOCK_BRANDS);
  const [combination, setCombination] = useState<CombinationData>({
    brandA: MOCK_BRANDS[0], // Now we preselect Nike
    brandB: null,
    summary: "",
    implications: [],
  });

  // Dichotomy state
  const [dichotomy, setDichotomy] = useState<DichotomyData>(DEFAULT_DICHOTOMY);

  // Archetype methods
  const selectArchetype = (name: string) => {
    const updatedArchetypes = archetypes.map(archetype => ({
      ...archetype,
      selected: archetype.name === name
    }));

    const selected = updatedArchetypes.find(a => a.name === name) || null;
    setArchetypes(updatedArchetypes);
    setSelectedArchetype(selected);

    // Analytics hook
    if (selected) {
      console.log(`onArchetypeSelect: ${name}, ${selected.match}%`);
    }
  };

  const addToBlend = (name: string) => {
    // Modified to allow up to 3 archetypes in blend
    if (blendedArchetypes.length >= 3 && !blendedArchetypes.some(a => a.name === name)) {
      return; // Maximum 3 archetypes in blend
    }

    const archetype = archetypes.find(a => a.name === name);
    if (!archetype) return;

    // If already in blend, remove it
    if (blendedArchetypes.some(a => a.name === name)) {
      setBlendedArchetypes(prev => prev.filter(a => a.name !== name));
      return;
    }

    // Otherwise add it and rebalance blend amounts
    const newBlendArray = [...blendedArchetypes];
    
    if (newBlendArray.length === 0) {
      // First archetype gets 100%
      newBlendArray.push({ ...archetype, blendAmount: 100 });
    } 
    else if (newBlendArray.length === 1) {
      // Second archetype - split 50/50
      newBlendArray[0] = { ...newBlendArray[0], blendAmount: 50 };
      newBlendArray.push({ ...archetype, blendAmount: 50 });
    }
    else if (newBlendArray.length === 2) {
      // Third archetype - split 33/33/33
      const newAmount = Math.floor(100 / 3);
      newBlendArray[0] = { ...newBlendArray[0], blendAmount: newAmount };
      newBlendArray[1] = { ...newBlendArray[1], blendAmount: newAmount };
      newBlendArray.push({ ...archetype, blendAmount: 100 - (newAmount * 2) });
    }
    
    setBlendedArchetypes(newBlendArray);
  };

  const updateBlendAmount = (name: string, amount: number) => {
    const archetypeIndex = blendedArchetypes.findIndex(a => a.name === name);
    if (archetypeIndex === -1) return;
    
    // Create a copy of the blended archetypes
    let updatedBlend = [...blendedArchetypes];
    
    if (blendedArchetypes.length === 2) {
      // For 2 archetypes, just adjust the other one to maintain 100%
      updatedBlend[archetypeIndex] = { ...updatedBlend[archetypeIndex], blendAmount: amount };
      const otherIndex = archetypeIndex === 0 ? 1 : 0;
      updatedBlend[otherIndex] = { ...updatedBlend[otherIndex], blendAmount: 100 - amount };
    } 
    else if (blendedArchetypes.length === 3) {
      // For 3 archetypes, distribute the remaining percentage proportionally
      updatedBlend[archetypeIndex] = { ...updatedBlend[archetypeIndex], blendAmount: amount };
      
      // Find the other two archetypes
      const otherIndices = [0, 1, 2].filter(i => i !== archetypeIndex);
      
      // Calculate current sum of the other two archetypes
      const otherSum = updatedBlend[otherIndices[0]].blendAmount! + updatedBlend[otherIndices[1]].blendAmount!;
      
      // Calculate remaining percentage to distribute
      const remaining = 100 - amount;
      
      if (otherSum > 0) {
        // Distribute proportionally
        const ratio = remaining / otherSum;
        updatedBlend[otherIndices[0]] = { 
          ...updatedBlend[otherIndices[0]], 
          blendAmount: Math.round(updatedBlend[otherIndices[0]].blendAmount! * ratio) 
        };
        updatedBlend[otherIndices[1]] = { 
          ...updatedBlend[otherIndices[1]], 
          blendAmount: remaining - updatedBlend[otherIndices[0]].blendAmount! 
        };
      } else {
        // If other amounts were 0, split evenly
        updatedBlend[otherIndices[0]] = { ...updatedBlend[otherIndices[0]], blendAmount: Math.floor(remaining / 2) };
        updatedBlend[otherIndices[1]] = { ...updatedBlend[otherIndices[1]], blendAmount: Math.ceil(remaining / 2) };
      }
    }
    
    setBlendedArchetypes(updatedBlend);
  };

  // Keywords methods
  const toggleKeyword = (name: string) => {
    const updatedKeywords = keywords.map(keyword => 
      keyword.name === name ? { ...keyword, selected: !keyword.selected } : keyword
    );
    setKeywords(updatedKeywords);

    // Analytics hook
    const isSelected = updatedKeywords.find(k => k.name === name)?.selected;
    console.log(`onKeywordToggle: ${name}, ${isSelected ? "selected" : "deselected"}`);
  };

  const selectKeywordSet = (set: string[]) => {
    const updatedKeywords = keywords.map(keyword => ({
      ...keyword,
      selected: set.includes(keyword.name)
    }));
    setKeywords(updatedKeywords);
  };

  const hasKeywordConflict = (): [string, string] | null => {
    const selectedKeywordNames = keywords
      .filter(k => k.selected)
      .map(k => k.name);

    for (const [word1, word2] of conflictPairs) {
      if (selectedKeywordNames.includes(word1) && selectedKeywordNames.includes(word2)) {
        return [word1, word2];
      }
    }
    return null;
  };

  // Slider methods
  const updateSliderValue = (axis: string, value: number) => {
    const updatedSliders = sliders.map(slider =>
      slider.axis === axis ? { ...slider, value } : slider
    );
    setSliders(updatedSliders);

    // Analytics hook
    console.log(`onSliderMove: ${axis}, ${value}`);
  };

  const resetSliders = () => {
    const resetSliders = sliders.map(slider => ({ ...slider, value: 5 }));
    setSliders(resetSliders);
  };

  // X meets Y methods
  const setBrandA = (brand: BrandData | null) => {
    setCombination(prev => ({ ...prev, brandA: brand }));
    if (combination.brandB) {
      generateCombinationSummary();
    }
  };

  const setBrandB = (brand: BrandData | null) => {
    setCombination(prev => ({ ...prev, brandB: brand }));
    if (combination.brandA) {
      generateCombinationSummary();
    }
  };

  const generateCombinationSummary = () => {
    if (!combination.brandA || !combination.brandB) return;

    // Mock generation of summary
    const summary = `${combination.brandA.name} × ${combination.brandB.name} represents a fusion of ${combination.brandA.name}'s [innovation/style/approach] with ${combination.brandB.name}'s [strength/appeal/methodology]. This combination creates a brand identity that balances [attribute1] with [attribute2], appealing to customers who value both [value1] and [value2].`;

    const implications = [
      `Voice: Adopt ${combination.brandA.name}'s [tone] with ${combination.brandB.name}'s [clarity/simplicity/etc].`,
      `Visual: Blend ${combination.brandA.name}'s [design element] with ${combination.brandB.name}'s [aesthetic].`,
      `Behavior: Balance ${combination.brandA.name}'s [customer approach] with ${combination.brandB.name}'s [service philosophy].`
    ];

    setCombination(prev => ({ ...prev, summary, implications }));
  };

  const saveCombination = () => {
    if (!combination.brandA || !combination.brandB) return;

    // Analytics hook
    console.log(`onComboSave: ${combination.brandA.name}, ${combination.brandB.name}`);

    // In a real app, would save this to state/DB
    alert(`Saved combination: ${combination.brandA.name} × ${combination.brandB.name}`);
  };

  // Dichotomy methods
  const updateDichotomyWord = (position: keyof DichotomyData, word: string) => {
    setDichotomy(prev => ({ ...prev, [position]: word }));

    // Analytics hook
    console.log(`onDichotomyUpdate: ${[
      dichotomy.wordOne, 
      dichotomy.wordTwo, 
      dichotomy.notWordOne, 
      dichotomy.notWordTwo
    ]}`);
  };

  const swapDichotomyWords = () => {
    setDichotomy(prev => ({
      ...prev,
      wordOne: prev.wordTwo,
      wordTwo: prev.wordOne
    }));
  };

  const generateDichotomyCombos = () => {
    // Generate 3 dichotomy combinations
    return [
      {
        wordOne: "Innovative",
        wordTwo: "Approachable",
        notWordOne: "Complicated",
        notWordTwo: "Boring"
      },
      {
        wordOne: "Confident",
        wordTwo: "Ethical",
        notWordOne: "Arrogant",
        notWordTwo: "Rigid"
      },
      {
        wordOne: "Creative",
        wordTwo: "Professional",
        notWordOne: "Disorganized",
        notWordTwo: "Conservative"
      }
    ];
  };

  // Module completion
  const completeModule = () => {
    console.log("onModuleComplete: personality");
    // In a real app, would call API or update global state
  };

  const value = {
    // Archetype
    archetypes,
    selectedArchetype,
    blendedArchetypes,
    selectArchetype,
    addToBlend,
    updateBlendAmount,
    
    // Keywords
    keywords,
    conflictPairs,
    toggleKeyword,
    selectKeywordSet,
    hasKeywordConflict,
    
    // Sliders
    sliders,
    updateSliderValue,
    resetSliders,
    
    // X meets Y
    brands,
    combination,
    setBrandA,
    setBrandB,
    generateCombinationSummary,
    saveCombination,
    
    // Dichotomy
    dichotomy,
    updateDichotomyWord,
    swapDichotomyWords,
    generateDichotomyCombos,
    
    // Completion
    completeModule,
  };

  return (
    <PersonalityContext.Provider value={value}>
      {children}
    </PersonalityContext.Provider>
  );
};

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
};