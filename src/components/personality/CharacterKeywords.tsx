
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonality } from '@/providers/PersonalityProvider';
import PersonalityNavigation from './PersonalityNavigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const CharacterKeywords: React.FC = () => {
  const { keywords, toggleKeyword, selectKeywordSet, hasKeywordConflict } = usePersonality();
  
  const [showConflictToast, setShowConflictToast] = useState(false);
  const [conflictPair, setConflictPair] = useState<[string, string] | null>(null);
  
  // Check for conflicts when keywords change
  useEffect(() => {
    const conflict = hasKeywordConflict();
    if (conflict) {
      setConflictPair(conflict);
      setShowConflictToast(true);
    } else {
      setShowConflictToast(false);
    }
  }, [keywords, hasKeywordConflict]);

  // Split keywords into 3 columns for better display
  const keywordsPerColumn = Math.ceil(keywords.length / 3);
  const columns = [
    keywords.slice(0, keywordsPerColumn),
    keywords.slice(keywordsPerColumn, keywordsPerColumn * 2),
    keywords.slice(keywordsPerColumn * 2)
  ];
  
  // Predefined sets
  const presetSets = [
    {
      name: "Future-forward & Bold",
      keywords: ["Innovative", "Bold", "Confident", "Tech-savvy"]
    },
    {
      name: "Warm & Dependable",
      keywords: ["Warm", "Dependable", "Helpful", "Friendly"]
    },
    {
      name: "Playful & Human",
      keywords: ["Playful", "Light-hearted", "Whimsical", "Humorous"]
    },
    {
      name: "Premium & Minimal",
      keywords: ["Luxurious", "Sophisticated", "Minimal", "Exclusive"]
    }
  ];
  
  // Handle preset set selection
  const handlePresetSelect = (set: string[]) => {
    selectKeywordSet(set);
  };
  
  return (
    <div className="container mx-auto px-[120px] pt-8 pb-20">
      <PersonalityNavigation type="top" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold">Own your adjectives.</h1>
      </motion.div>
      
      <div className="flex">
        {/* Main keyword cloud section - 3 columns */}
        <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-3">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-3">
              {column.map((keyword) => (
                <motion.button
                  key={keyword.name}
                  onClick={() => toggleKeyword(keyword.name)}
                  className={`
                    w-full py-2 px-4 rounded-md text-left transition-colors
                    ${keyword.selected ? 'bg-cyan text-black' : 'bg-[#262626] text-white hover:bg-[#333]'}
                  `}
                  whileTap={{ scale: 1.06 }}
                >
                  {keyword.name}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
        
        {/* Preset combinations panel */}
        <div className="ml-8 w-[280px]">
          <div className="bg-[#262626] p-5 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Preset combinations</h3>
            
            <div className="space-y-3">
              {presetSets.map((set, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start border-border/50"
                  onClick={() => handlePresetSelect(set.keywords)}
                >
                  {set.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Conflict toast notification */}
      <AnimatePresence>
        {showConflictToast && conflictPair && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 text-yellow-100 px-6 py-3 rounded-lg flex items-center shadow-lg max-w-2xl"
          >
            <AlertCircle className="mr-3 h-5 w-5 text-yellow-300" />
            <p className="text-sm">
              ⚠️ '{conflictPair[0]}' rarely coexists with '{conflictPair[1]}'. You can keep both, but tone clarity drops.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <PersonalityNavigation />
    </div>
  );
};

export default CharacterKeywords;
