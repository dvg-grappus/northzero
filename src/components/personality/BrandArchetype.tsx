import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePersonality } from '@/providers/PersonalityProvider';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import PersonalityNavigation from './PersonalityNavigation';

interface ArchetypeWheelProps {
  archetypes: {
    name: string;
    match: number;
    selected: boolean;
  }[];
  onArchetypeClick: (name: string) => void;
  blendedArchetypes: any[];
}

const ArchetypeWheel: React.FC<ArchetypeWheelProps> = ({ archetypes, onArchetypeClick, blendedArchetypes }) => {
  // Calculate the display values for the wheel
  const radius = 360;
  const archetypeCount = archetypes.length;
  const angleStep = 360 / archetypeCount;

  // Calculate positions of each archetype label
  const getPosition = (index: number, radius: number) => {
    const angle = (index * angleStep - 90) * (Math.PI / 180); // Start from top (90 deg)
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angle: angle * (180 / Math.PI) + 90 };
  };

  // Calculate which archetype is selected or in the blend
  const getSliceFill = (name: string) => {
    const archetype = blendedArchetypes.find(a => a.name === name);
    if (archetype) {
      // Different colors for primary/secondary/tertiary
      if (archetype.blendAmount >= 50) return '#7DF9FF'; // Primary - Cyan
      if (archetype.blendAmount >= 30) return '#5BC8FF'; // Secondary - Light blue
      return '#4F9EFF'; // Tertiary - Blue
    }
    const arch = archetypes.find(a => a.name === name);
    return arch?.selected ? '#7DF9FF' : '#444';
  };

  // Calculate which percent to show in center
  const centerText = () => {
    const selected = archetypes.find(a => a.selected);
    if (selected) {
      return `${selected.match}% fit`;
    }
    if (blendedArchetypes.length > 0) {
      return 'Blended';
    }
    return 'Select';
  };
  
  // Create the wheel slices
  return (
    <div className="relative w-[720px] h-[720px]">
      <svg width="720" height="720" viewBox="-360 -360 720 720">
        {/* Wheel background */}
        <circle cx="0" cy="0" r="360" fill="#262626" stroke="#fff" strokeWidth="1" />
        <circle cx="0" cy="0" r="280" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
        
        {/* Archetype slices */}
        {archetypes.map((archetype, index) => {
          const startAngle = index * angleStep - angleStep/2;
          const endAngle = startAngle + angleStep;
          const startRad = startAngle * Math.PI / 180;
          const endRad = endAngle * Math.PI / 180;
          
          const x1 = Math.cos(startRad) * radius;
          const y1 = Math.sin(startRad) * radius;
          const x2 = Math.cos(endRad) * radius;
          const y2 = Math.sin(endRad) * radius;
          
          // Create SVG arc path
          const largeArcFlag = angleStep <= 180 ? "0" : "1";
          const path = `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;
          
          // Find if this archetype is in the blend
          const blendArchetype = blendedArchetypes.find(a => a.name === archetype.name);
          // Calculate fill based on blend amount
          let fillOpacity = archetype.selected ? 0.7 : 0.3;
          if (blendArchetype) {
            fillOpacity = 0.3 + (blendArchetype.blendAmount / 100) * 0.4;
          }
          
          return (
            <g key={archetype.name}>
              <path
                d={path}
                fill={getSliceFill(archetype.name)}
                opacity={fillOpacity}
                stroke="#fff"
                strokeWidth="1"
                onClick={() => onArchetypeClick(archetype.name)}
                className="cursor-pointer hover:opacity-60 transition-opacity"
              />
              
              {/* Percentage tag */}
              <g transform={`translate(${getPosition(index, radius - 100).x}, ${getPosition(index, radius - 100).y})`}>
                <rect
                  x="-24"
                  y="-12"
                  width="48"
                  height="24"
                  rx="12"
                  fill="#333"
                  stroke="#444"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {archetype.match}%
                </text>
              </g>
            </g>
          );
        })}
        
        {/* White border lines between slices */}
        {archetypes.map((_, index) => {
          const angle = index * angleStep;
          const rad = angle * Math.PI / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          
          return (
            <line
              key={`line-${index}`}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#fff"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          );
        })}
        
        {/* Center circle with percentage */}
        <circle cx="0" cy="0" r="80" fill="#262626" stroke="#fff" strokeWidth="1" />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="28" fontWeight="bold">
          {centerText()}
        </text>
        
        {/* Archetype labels */}
        {archetypes.map((archetype, index) => {
          const pos = getPosition(index, radius - 30);
          
          return (
            <text
              key={`label-${archetype.name}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="16"
              transform={`rotate(${pos.angle}, ${pos.x}, ${pos.y})`}
              className="pointer-events-none"
            >
              {archetype.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

interface ArchetypeModalProps {
  archetype: any;
  onClose: () => void;
  onAddToBlend: () => void;
  isInBlend: boolean;
}

const ArchetypeModal: React.FC<ArchetypeModalProps> = ({ archetype, onClose, onAddToBlend, isInBlend }) => {
  // Mock data for the examples and benefits
  const examples = ["Lego", "Adobe", "Notion"];
  const benefits = [
    "Aligns with your emphasis on building and crafting",
    "Resonates with your focus on tools and enablement",
    "Supports innovation and problem-solving values"
  ];
  const watchOuts = [
    "Can appear inaccessible to non-technical audiences",
    "May need balancing with more emotional elements"
  ];
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 z-30 bg-[#262626] p-8 rounded-t-xl border-t border-border/40 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{archetype.name}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
          <X size={18} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Brand examples</p>
          <div className="flex gap-4 mb-6">
            {examples.map((example, i) => (
              <div 
                key={i}
                className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center text-lg font-bold"
              >
                {example.charAt(0)}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">Why it suits you</p>
          <ul className="list-disc list-inside mb-6 text-sm space-y-1">
            {benefits.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Watch-outs</p>
          <ul className="list-disc list-inside mb-6 text-sm space-y-1">
            {watchOuts.map((watchOut, i) => (
              <li key={i}>{watchOut}</li>
            ))}
          </ul>
          
          <div className="pt-4">
            <Button 
              onClick={onAddToBlend}
              className={isInBlend ? "bg-red-600 hover:bg-red-700" : "bg-cyan text-black hover:bg-cyan/80"}
              size="lg"
            >
              {isInBlend ? "Remove from blend" : "Add to blend"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface BlendBarProps {
  archetypes: any[];
  onUpdateBlend: (name: string, value: number) => void;
}

const BlendBar: React.FC<BlendBarProps> = ({ archetypes, onUpdateBlend }) => {
  // Skip rendering if no archetypes in blend
  if (archetypes.length === 0) return null;
  
  return (
    <div className="mt-8 p-6 bg-[#262626] rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Archetype Blend (up to 3)</h3>
      
      <div className="space-y-4">
        {archetypes.map((archetype) => (
          <div key={archetype.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{archetype.name}</span>
              <span>{archetype.blendAmount}%</span>
            </div>
            <Slider 
              value={[archetype.blendAmount || 50]} 
              min={0} 
              max={100} 
              step={5}
              onValueChange={(values) => onUpdateBlend(archetype.name, values[0])}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const BrandArchetype: React.FC = () => {
  const { 
    archetypes, 
    selectArchetype, 
    selectedArchetype,
    blendedArchetypes,
    addToBlend,
    updateBlendAmount
  } = usePersonality();
  
  const [showModal, setShowModal] = useState(false);
  
  const handleArchetypeClick = (name: string) => {
    selectArchetype(name);
    setShowModal(true);
  };
  
  const handleAddToBlend = () => {
    if (selectedArchetype) {
      addToBlend(selectedArchetype.name);
    }
    setShowModal(false);
  };
  
  const isInBlend = selectedArchetype ? 
    blendedArchetypes.some(a => a.name === selectedArchetype.name) :
    false;
  
  const handleUpdateBlend = (name: string, value: number) => {
    updateBlendAmount(name, value);
  };

  return (
    <div className="container mx-auto px-2 pt-8 pb-20">
      <PersonalityNavigation type="top" />
      
      <div className="grid grid-cols-12 gap-4">
        {/* Left side - Hero header */}
        <div className="col-span-12 md:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 md:mt-20"
          >
            <h1 className="text-4xl font-bold mb-4">Choose your narrative DNA.</h1>
            <p className="text-lg text-muted-foreground">
              Tap an archetype to inspect compatibility, examples and caveats.
            </p>
          </motion.div>
          
          {/* Blend bar appears here when archetypes are selected */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: blendedArchetypes.length > 0 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <BlendBar 
              archetypes={blendedArchetypes} 
              onUpdateBlend={handleUpdateBlend} 
            />
          </motion.div>
        </div>
        
        {/* Right side - Archetype wheel */}
        <div className="col-span-12 md:col-span-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <ArchetypeWheel
              archetypes={archetypes}
              onArchetypeClick={handleArchetypeClick}
              blendedArchetypes={blendedArchetypes}
            />
          </motion.div>
        </div>
      </div>
      
      <PersonalityNavigation />
      
      {/* Modal for archetype details */}
      {showModal && selectedArchetype && (
        <ArchetypeModal 
          archetype={selectedArchetype}
          onClose={() => setShowModal(false)}
          onAddToBlend={handleAddToBlend}
          isInBlend={isInBlend}
        />
      )}
    </div>
  );
};

export default BrandArchetype;
