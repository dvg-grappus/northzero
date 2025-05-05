
import React from 'react';
import { motion } from 'framer-motion';
import { usePersonality } from '@/providers/PersonalityProvider';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUp } from 'lucide-react';
import PersonalityNavigation from './PersonalityNavigation';

const PersonalitySlider = ({ axis, leftBrand, rightBrand, value, tooltips, onChange }) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center text-xs font-bold">
            {leftBrand.charAt(0)}
          </div>
          <span className="ml-2">{leftBrand}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{rightBrand}</span>
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center text-xs font-bold">
            {rightBrand.charAt(0)}
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Slider track */}
        <div className="bg-[#333] h-2 rounded-full w-full">
          {/* Active track */}
          <div 
            className="absolute left-0 top-0 h-2 bg-gradient-to-r from-secondary to-cyan rounded-full" 
            style={{ width: `${value * 10}%` }}
          />
        </div>
        
        {/* Slider labels */}
        <div className="flex justify-between mt-1 mb-3 text-xs text-muted-foreground">
          <span>{axis.split('↔')[0].trim()}</span>
          <span>{axis.split('↔')[1].trim()}</span>
        </div>
        
        {/* Slider thumb and tooltip */}
        <div 
          className="absolute top-[-6px] cursor-pointer flex flex-col items-center"
          style={{ left: `calc(${value * 10}% - 8px)` }}
        >
          {/* Increased hit area for thumb */}
          <button 
            className="w-8 h-8 absolute top-[-8px] left-[-12px] cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              e.preventDefault();
              
              const track = e.currentTarget.parentElement?.parentElement;
              if (!track) return;
              
              const trackRect = track.getBoundingClientRect();
              const trackWidth = trackRect.width;
              
              const handleDrag = (moveEvent) => {
                const x = moveEvent.clientX - trackRect.left;
                const percentage = Math.max(0, Math.min(1, x / trackWidth));
                const newValue = Math.round(percentage * 10) || 1; // Ensure minimum of 1
                onChange(newValue);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleDrag);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Visible thumb */}
          <div className="w-4 h-4 bg-background border-2 border-cyan rounded-full z-10" />
          <ArrowUp className="w-4 h-4 text-cyan mt-[-2px] z-10" />
          
          {/* Tooltip */}
          <div className="absolute top-6 bg-[#333] text-white text-xs p-2 rounded min-w-[200px] max-w-[300px] z-10">
            {tooltips[value - 1] || "Position your brand along this spectrum"}
          </div>
        </div>
        
        {/* Slider dots - clickable areas enlarged */}
        <div className="absolute top-[-2px] left-0 right-0 flex justify-between">
          {Array.from({length: 10}).map((_, i) => (
            <button 
              key={i} 
              className={`w-6 h-6 flex items-center justify-center cursor-pointer -ml-3 ${i === 0 ? 'ml-0' : ''} ${i === 9 ? 'mr-0' : ''}`}
              onClick={() => onChange(i + 1)}
            >
              <span className={`w-1 h-1 rounded-full ${value === i + 1 ? 'bg-cyan' : 'bg-[#444]'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PersonalitySliders: React.FC = () => {
  const { sliders, updateSliderValue, resetSliders } = usePersonality();

  const handleSliderChange = (axis, value) => {
    updateSliderValue(axis, value);
  };
  
  return (
    <div className="container mx-auto px-[120px] pt-8 pb-20">
      <PersonalityNavigation type="top" />
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-9">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold mb-4">Position your brand voice.</h1>
            <p className="text-lg text-muted-foreground">
              Drag the sliders to define where your brand sits on these key spectrums.
            </p>
          </motion.div>
          
          <div className="max-w-[900px] mt-16">
            {sliders.map((slider) => (
              <PersonalitySlider
                key={slider.axis}
                axis={slider.axis}
                leftBrand={slider.leftBrand}
                rightBrand={slider.rightBrand}
                value={slider.value}
                tooltips={slider.tooltips}
                onChange={(value) => handleSliderChange(slider.axis, value)}
              />
            ))}
          </div>
        </div>
        
        <div className="col-span-3">
          <div className="sticky top-20">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={resetSliders}
            >
              <RefreshCw size={14} />
              Reset all sliders
            </Button>
          </div>
        </div>
      </div>
      
      <PersonalityNavigation />
    </div>
  );
};

export default PersonalitySliders;
