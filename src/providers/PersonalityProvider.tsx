import React, { createContext, useState, useContext, ReactNode } from 'react';

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

// Archetype mock data
const archetypeData: ArchetypeData[] = [
  { name: "Innocent", match: 35, selected: false },
  { name: "Explorer", match: 62, selected: false },
  { name: "Sage", match: 48, selected: false },
  { name: "Creator", match: 72, selected: false },
  { name: "Outlaw", match: 18, selected: false },
  { name: "Magician", match: 55, selected: false },
  { name: "Hero", match: 21, selected: false },
  { name: "Lover", match: 27, selected: false },
  { name: "Jester", match: 31, selected: false },
  { name: "Everyman", match: 43, selected: false },
  { name: "Caregiver", match: 29, selected: false },
  { name: "Ruler", match: 24, selected: false },
];

// Mock brand logo mapping - in a real app, these would be image URLs
const mockBrands: BrandData[] = [
  { name: "Nike", logo: "N", description: "Athletic innovation with emotional storytelling" },
  { name: "Tesla", logo: "T", description: "Future-forward technology with bold design language" },
  { name: "Apple", logo: "A", description: "Premium simplicity with human-centered experience" },
  { name: "Netflix", logo: "N", description: "Disruptive storytelling with personalized content" },
  { name: "Airbnb", logo: "A", description: "Human connection with authentic local experiences" },
  { name: "Patagonia", logo: "P", description: "Sustainable quality with environmental activism" },
  { name: "Lego", logo: "L", description: "Creative play with systematic construction" },
  { name: "Adobe", logo: "A", description: "Creative tools with professional precision" },
  { name: "Chanel", logo: "C", description: "Timeless luxury with elegant minimalism" },
  { name: "Spotify", logo: "S", description: "Music discovery with personalized curation" },
  { name: "IKEA", logo: "I", description: "Democratic design with functional simplicity" },
  { name: "Stripe", logo: "S", description: "Developer-first with clean infrastructure" },
  { name: "Mercedes", logo: "M", description: "Engineering excellence with premium craftsmanship" },
  { name: "Starbucks", logo: "S", description: "Coffee ritual with consistent community space" },
  { name: "Disney", logo: "D", description: "Magical storytelling with nostalgic emotion" },
];

// Mock keywords with default selections
const keywordData: KeywordData[] = [
  { name: "Bold", selected: true },
  { name: "Helpful", selected: false },
  { name: "Serious", selected: false },
  { name: "Adventurous", selected: false },
  { name: "Imaginative", selected: false },
  { name: "Youthful", selected: false },
  { name: "Dependable", selected: true },
  { name: "Friendly", selected: false },
  { name: "Expertise", selected: false },
  { name: "Quiet", selected: false },
  { name: "Noble", selected: false },
  { name: "Whimsical", selected: false },
  { name: "Masculine", selected: false },
  { name: "Feminine", selected: false },
  { name: "Cooperative", selected: false },
  { name: "Edgy", selected: false },
  { name: "Conservative", selected: false },
  { name: "Innovative", selected: true },
  { name: "Mature", selected: false },
  { name: "Calm", selected: false },
  { name: "Luxurious", selected: false },
  { name: "Humorous", selected: false },
  { name: "Mysterious", selected: false },
  { name: "Earnest", selected: false },
  { name: "Warm", selected: false },
  { name: "Healthy", selected: false },
  { name: "Worldly", selected: false },
  { name: "Glamorous", selected: false },
  { name: "Old-fashioned", selected: false },
  { name: "Sweet", selected: false },
  { name: "Cosmopolitan", selected: false },
  { name: "Gentle", selected: false },
  { name: "Humble", selected: false },
  { name: "Energetic", selected: false },
  { name: "Caring", selected: false },
  { name: "Light-hearted", selected: false },
  { name: "Rational", selected: false },
  { name: "Witty", selected: false },
  { name: "Altruistic", selected: false },
  { name: "Tough", selected: false },
  { name: "Confident", selected: true },
  { name: "Leader", selected: false },
  { name: "Relaxed", selected: false },
  { name: "Quirky", selected: false },
  { name: "Intellectual", selected: false },
  { name: "Clever", selected: false },
  { name: "Feisty", selected: false },
  { name: "Competent", selected: true },
  { name: "Spiritual", selected: false },
  { name: "Liberal", selected: false },
  { name: "Sophisticated", selected: false },
];

// Conflict pairs
const conflictPairsData: ConflictPair[] = [
  ["Dependable", "Rebellious"],
  ["Humble", "Luxurious"],
  ["Quiet", "Loud"],
];

// Slider data
const sliderData: SliderData[] = [
  {
    axis: "Serious ↔ Playful",
    leftBrand: "LinkedIn",
    rightBrand: "Snapchat",
    value: 5, // Middle position
    tooltips: [
      "Edge 7-9 may alienate enterprise buyers.",
      "Too serious might bore Gen Z users.",
      "Mid-range balances approachability with credibility.",
      "Slight playfulness improves engagement.",
      "This area works for most B2B SaaS products.",
      "Consumer products trend right of center.",
      "Educational content needs left positioning.",
      "Social platforms live 7-10 on this scale.",
      "Financial services cluster 1-3 typically.",
      "Health tech balances at 4-6 for trust."
    ],
  },
  {
    axis: "Conventional ↔ Rebel",
    leftBrand: "Honda",
    rightBrand: "Tesla",
    value: 5,
    tooltips: [
      "Going full rebel? Expect polarised PR.",
      "Most legacy brands operate at 2-4 here.",
      "Emerging tech startups thrive at 7-9.",
      "Mid-range lets you innovate without alienating.",
      "Finance & healthcare rarely exceed 6.",
      "Most D2C disruptors live at 8-10.",
      "Regulated industries cluster below 5.",
      "Consumer packaged goods average 3-6.",
      "Social impact brands often push 7-9.",
      "Modern B2B SaaS trends to 6-7."
    ],
  },
  {
    axis: "Cordial ↔ Authority",
    leftBrand: "Swatch",
    rightBrand: "Rolex",
    value: 5,
    tooltips: [
      "Too authoritative risks seeming arrogant.",
      "Experts deserve higher authority positions.",
      "Entertainment skews cordial (1-4).",
      "Medical and legal benefit from 7-9 authority.",
      "Tech products balance around 4-6.",
      "Educational brands thrive at 6-8.",
      "Consumer apps rarely exceed 5.",
      "Financial services cluster 6-9.",
      "Food & beverage brands perform best 2-4.",
      "Luxury retail demands 7-10 positioning."
    ],
  },
  {
    axis: "Mature ↔ Youthful",
    leftBrand: "Taj",
    rightBrand: "Airbnb",
    value: 5,
    tooltips: [
      "Enterprise audiences respond to 3-5 maturity.",
      "Youth brands risk alienating older demographics above 8.",
      "Multi-generational appeal works best 4-6.",
      "1-3 feels traditional, established, sometimes rigid.",
      "8-10 can appear inexperienced to senior buyers.",
      "Financial services rarely exceed 4.",
      "Youth-oriented consumer tech thrives 7-10.",
      "Established tech balances at 5-7.",
      "Healthcare and insurance cluster 2-4.",
      "Media and entertainment span full spectrum."
    ],
  },
  {
    axis: "Limited ↔ Mass",
    leftBrand: "Hermès",
    rightBrand: "H&M",
    value: 5,
    tooltips: [
      "Premium products require 1-4 positioning.",
      "Volume businesses need 7-10 approachability.",
      "Mid-market brands balance at 5-6.",
      "Too limited (1-2) restricts growth potential.",
      "Too mass (9-10) sacrifices premium perception.",
      "Tech startups often begin 2-4, then move right.",
      "Enterprise solutions cluster 3-5.",
      "Consumer staples thrive at 7-9.",
      "Luxury services require 1-3 positioning.",
      "Mainstream entertainment aims for 6-8."
    ],
  },
];

export const PersonalityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Archetype state
  const [archetypes, setArchetypes] = useState<ArchetypeData[]>(archetypeData);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData | null>(null);
  const [blendedArchetypes, setBlendedArchetypes] = useState<ArchetypeData[]>([]);

  // Keywords state
  const [keywords, setKeywords] = useState<KeywordData[]>(keywordData);
  const [conflictPairs] = useState<ConflictPair[]>(conflictPairsData);

  // Sliders state
  const [sliders, setSliders] = useState<SliderData[]>(sliderData);

  // X meets Y state
  const [brands] = useState<BrandData[]>(mockBrands);
  const [combination, setCombination] = useState<CombinationData>({
    brandA: mockBrands[0], // Now we preselect Nike
    brandB: null,
    summary: "",
    implications: [],
  });

  // Dichotomy state
  const [dichotomy, setDichotomy] = useState<DichotomyData>({
    wordOne: "Competent",
    wordTwo: "Meaningful",
    notWordOne: "Authoritative",
    notWordTwo: "Loud",
  });

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
