import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePersonality } from '@/providers/PersonalityProvider';
import PersonalityNavigation from './PersonalityNavigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowRightLeft } from 'lucide-react';

interface WordFieldProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

const WordField: React.FC<WordFieldProps> = ({ value, label, onChange }) => {
  const { keywords } = usePersonality();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filter keywords based on search
  const filteredKeywords = keywords
    .filter(k => k.name.toLowerCase().includes(search.toLowerCase()))
    .map(k => k.name)
    .sort();
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[240px] h-[56px] px-4 py-2 rounded-full flex items-center justify-between bg-[#262626] border border-border/50 hover:border-cyan/40 transition-colors overflow-hidden"
      >
        <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">{label}</span>
        <span className="text-lg whitespace-nowrap truncate">{value || "Select"}</span>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 w-[240px] max-h-[320px] overflow-y-auto bg-[#333]/90 backdrop-blur-md shadow-lg rounded-lg border border-border/40 z-10"
        >
          <div className="p-2 sticky top-0 bg-[#333] border-b border-border/30">
            <input
              type="text"
              className="w-full p-2 rounded bg-[#444] text-white placeholder-gray-400 outline-none"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="p-1">
            {filteredKeywords.map((keyword, index) => (
              <button
                key={index}
                className="w-full text-left p-2 hover:bg-cyan/20 rounded"
                onClick={() => {
                  onChange(keyword);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {keyword}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DichotomyNots: React.FC = () => {
  const { 
    dichotomy, 
    updateDichotomyWord, 
    swapDichotomyWords,
    generateDichotomyCombos
  } = usePersonality();
  
  const [comboIndex, setComboIndex] = useState(0);
  
  // Generate a new combination
  const handleGenerateCombo = () => {
    const combos = generateDichotomyCombos();
    if (combos.length > 0) {
      // Pick a combo based on the current index, then increment the index for next time
      const combo = combos[comboIndex % combos.length];
      setComboIndex(prevIndex => prevIndex + 1);
      
      updateDichotomyWord('wordOne', combo.wordOne);
      updateDichotomyWord('wordTwo', combo.wordTwo);
      updateDichotomyWord('notWordOne', combo.notWordOne);
      updateDichotomyWord('notWordTwo', combo.notWordTwo);
    }
  };

  return (
    <div className="container mx-auto px-[120px] pt-8 pb-20">
      <PersonalityNavigation type="top" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-20 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Define your brand boundaries.</h1>
        <p className="text-lg text-muted-foreground">
          Complete this statement to clarify what your brand is and isn't.
        </p>
      </motion.div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="text-3xl font-light flex flex-wrap items-center justify-center">
          <span className="mx-2 my-2">We are</span>
          
          <WordField 
            value={dichotomy.wordOne} 
            label="Word 1"
            onChange={(value) => updateDichotomyWord('wordOne', value)}
          />
          
          <button 
            onClick={swapDichotomyWords}
            className="mx-2 p-2 rounded-full hover:bg-[#333] transition-colors"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>
          
          <WordField 
            value={dichotomy.wordTwo} 
            label="Word 2"
            onChange={(value) => updateDichotomyWord('wordTwo', value)}
          />
        </div>
        
        <div className="text-3xl font-light flex flex-wrap items-center justify-center mt-6">
          <span className="mx-2 my-2">but not</span>
          
          <WordField 
            value={dichotomy.notWordOne} 
            label="Not word 1"
            onChange={(value) => updateDichotomyWord('notWordOne', value)}
          />
          
          <span className="mx-2 my-2">and not</span>
          
          <WordField 
            value={dichotomy.notWordTwo} 
            label="Not word 2"
            onChange={(value) => updateDichotomyWord('notWordTwo', value)}
          />
        </div>

        <div className="mt-8">
          <Button 
            variant="default"
            size="sm"
            className="bg-cyan text-black hover:bg-cyan/80 flex items-center gap-2"
            onClick={handleGenerateCombo}
          >
            <RefreshCw className="h-4 w-4" />
            Generate Combination
          </Button>
        </div>
      </div>
      
      <PersonalityNavigation />
    </div>
  );
};

export default DichotomyNots;
