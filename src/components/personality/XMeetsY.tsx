
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePersonality } from '@/providers/PersonalityProvider';
import PersonalityNavigation from './PersonalityNavigation';
import { Button } from '@/components/ui/button';
import { X, Shuffle, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BrandGrid = ({ brands, onSelectBrand }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {brands.map((brand) => (
        <Card
          key={brand.name}
          className="bg-[#262626] border-border/30 hover:border-cyan/40 transition-all duration-200 cursor-pointer"
          onClick={() => onSelectBrand(brand)}
        >
          <CardContent className="p-5 flex flex-col items-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-xl font-bold mb-3">
              {brand.logo}
            </div>
            <h3 className="font-medium mb-1 text-center">{brand.name}</h3>
            <p className="text-xs text-muted-foreground text-center">{brand.description || `${brand.name}'s brand identity`}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const BrandSlot = ({ brand, onChange, slotName }) => {
  return (
    <div
      className={`h-[80px] w-[240px] ${
        brand ? 'bg-[#262626] border border-cyan' : 'bg-[#333] border border-[#444] hover:border-muted-foreground'
      } rounded-lg flex items-center justify-center cursor-pointer transition-colors relative`}
      onClick={() => !brand && onChange(null)}
    >
      {brand ? (
        <>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">
              {brand.logo}
            </div>
            <span className="mt-1 text-sm font-medium">{brand.name}</span>
          </div>
          <button
            className="absolute top-2 right-2 h-6 w-6 bg-[#444] rounded-full flex items-center justify-center hover:bg-[#555]"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <span className="text-muted-foreground text-sm">{slotName}</span>
      )}
    </div>
  );
};

const XMeetsY: React.FC = () => {
  const { 
    brands, 
    combination, 
    setBrandA, 
    setBrandB, 
    generateCombinationSummary,
    saveCombination
  } = usePersonality();
  
  const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | null>('A'); // Start with left slot selected
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSelectBrand = (brand) => {
    if (selectingSlot === 'A') {
      setBrandA(brand);
    } else if (selectingSlot === 'B') {
      setBrandB(brand);
    }
    setSelectingSlot(null);
  };
  
  const handleSlotClick = (slot: 'A' | 'B') => {
    setSelectingSlot(slot);
  };
  
  const filteredBrands = searchTerm 
    ? brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())) 
    : brands;
    
  const handleShuffleBrands = () => {
    const randomBrandA = brands[Math.floor(Math.random() * brands.length)];
    let randomBrandB = brands[Math.floor(Math.random() * brands.length)];
    
    // Make sure brands are different
    while (randomBrandB.name === randomBrandA.name) {
      randomBrandB = brands[Math.floor(Math.random() * brands.length)];
    }
    
    setBrandA(randomBrandA);
    setBrandB(randomBrandB);
  };

  return (
    <div className="container mx-auto px-[120px] pt-8 pb-20">
      <PersonalityNavigation type="top" />
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">Mix influential brands.</h1>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleShuffleBrands}
              >
                <Shuffle size={14} />
                Shuffle brands
              </Button>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Create a unique identity by blending two brand personalities.
            </p>
          </motion.div>
        </div>
        
        {/* Brand combination area */}
        <div className="col-span-12">
          <div className="flex justify-center items-center mb-8">
            <BrandSlot 
              brand={combination.brandA} 
              onChange={() => handleSlotClick('A')} 
              slotName="Select Brand A"
            />
            
            <div className="mx-4 text-2xl font-light">meets</div>
            
            <BrandSlot 
              brand={combination.brandB} 
              onChange={() => handleSlotClick('B')} 
              slotName="Select Brand B"
            />
          </div>
        </div>
        
        {/* Summary card or brand grid */}
        <div className="col-span-12">
          {selectingSlot ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="w-full p-3 bg-[#262626] border border-[#444] rounded-lg text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <BrandGrid brands={filteredBrands} onSelectBrand={handleSelectBrand} />
            </motion.div>
          ) : (
            combination.brandA && combination.brandB ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#262626] p-6 rounded-lg max-w-[560px] mx-auto"
              >
                <h3 className="text-xl font-semibold mb-4">What {combination.brandA.name} × {combination.brandB.name} means</h3>
                
                <p className="text-muted-foreground mb-6">
                  {combination.summary || `${combination.brandA.name} × ${combination.brandB.name} represents a fusion of ${combination.brandA.name}'s innovation with ${combination.brandB.name}'s approach. This combination creates a brand identity that balances technological prowess with emotional connection.`}
                </p>
                
                <h4 className="text-sm font-medium mb-2">Implications</h4>
                <ul className="space-y-2 mb-6">
                  {combination.implications.length > 0 ? 
                    combination.implications.map((imp, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">{imp}</li>
                    )) : (
                      <>
                        <li className="text-sm text-muted-foreground">Voice: Adopt {combination.brandA.name}'s directness with {combination.brandB.name}'s friendliness.</li>
                        <li className="text-sm text-muted-foreground">Visual: Blend {combination.brandA.name}'s color palette with {combination.brandB.name}'s typography.</li>
                        <li className="text-sm text-muted-foreground">Behavior: Balance {combination.brandA.name}'s innovation with {combination.brandB.name}'s reliability.</li>
                      </>
                    )
                  }
                </ul>
                
                <Button 
                  className="w-full bg-cyan text-black hover:bg-cyan/80"
                  onClick={saveCombination}
                >
                  <Check size={16} className="mr-2" />
                  Save this combination
                </Button>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground">
                Select two brands to see how they can blend together
              </div>
            )
          )}
        </div>
      </div>
      
      <PersonalityNavigation />
    </div>
  );
};

export default XMeetsY;
