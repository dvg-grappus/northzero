
import React, { useState, useRef } from "react";
import { Step } from "@/types/timeline";
import { motion } from "framer-motion";

interface TimelineCarouselProps {
  steps: Step[];
  onBegin: (id: number) => void;
}

// Define an interface for the card style to fix TypeScript errors
interface CardStyle {
  zIndex: number;
  opacity: number;
  scale: number;
  rotateY?: string;
  rotateX?: string;
  translateZ?: string;
  translateX?: string;
  translateY?: string;
}

const TimelineCarousel3D: React.FC<TimelineCarouselProps> = ({ steps, onBegin }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Simple function to navigate to specific card
  const goToCard = (index: number) => {
    console.log(`Navigating to card index ${index}`);
    // Limit index to valid range
    const newIndex = Math.max(0, Math.min(steps.length - 1, index));
    
    if (newIndex !== activeIndex) {
      setIsAnimating(true);
      setActiveIndex(newIndex);
      
      // Release animation lock after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // Navigate one card at a time
  const handleScroll = (direction: 'next' | 'prev') => {
    console.log("Scroll attempt:", direction);
    
    if (isAnimating) {
      console.log("Ignoring scroll - animation in progress");
      return;
    }
    
    const newIndex = direction === 'next' 
      ? Math.min(activeIndex + 1, steps.length - 1)
      : Math.max(activeIndex - 1, 0);
    
    goToCard(newIndex);
  };
  
  // Handle mouse wheel event
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Simple direction detection - no acceleration
    const direction = e.deltaY > 0 ? 'next' : 'prev';
    handleScroll(direction);
  };
  
  // Handle card click - focus the clicked card
  const handleCardClick = (index: number) => {
    console.log(`Card ${index} clicked`);
    goToCard(index);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log("Key pressed:", e.key);
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      handleScroll('next');
      e.preventDefault();
    } 
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      handleScroll('prev');
      e.preventDefault();
    } 
    else if (e.key === 'Enter' || e.key === ' ' && activeIndex >= 0) {
      onBegin(steps[activeIndex].id);
      e.preventDefault();
    }
  };

  // Simple touch handling
  const touchStartRef = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;
    
    // Simple threshold-based direction detection
    if (Math.abs(diff) > 20) {
      handleScroll(diff > 0 ? 'next' : 'prev');
    }
  };

  // Get visual style for each card based on its position relative to active card
  const getCardStyle = (index: number): CardStyle => {
    const diff = index - activeIndex;
    
    // Base styles for all cards
    const baseStyles: CardStyle = {
      zIndex: 50 - Math.abs(diff) * 10,
      opacity: diff === 0 ? 1 : Math.max(1 - Math.abs(diff) * 0.3, 0),
      scale: diff === 0 ? 1 : Math.max(0.95 - Math.abs(diff) * 0.05, 0.8),
      rotateY: '-15deg',
      rotateX: '8deg',
      translateZ: '0px',
      translateX: '0px',
      translateY: '0px'
    };
    
    // Only show a limited number of cards in each direction
    if (Math.abs(diff) > 3) {
      return { ...baseStyles, opacity: 0 };
    }
    
    // Active card
    if (diff === 0) {
      return {
        ...baseStyles,
        rotateY: '-15deg',
        rotateX: '8deg',
        translateZ: '0px',
        translateX: '0%',
        translateY: '0px',
      };
    } else if (diff > 0) {
      // Cards after active
      return {
        ...baseStyles,
        rotateY: '-15deg',
        rotateX: '8deg',
        translateZ: `-${diff * 150}px`,
        translateX: `${diff * 50}%`,
        translateY: `-${diff * 80}px`,
      };
    } else {
      // Cards before active
      return {
        ...baseStyles,
        rotateY: '-15deg',
        rotateX: '8deg',
        translateZ: `${Math.abs(diff) * 150}px`,
        translateX: `${diff * 50}%`,
        translateY: `${Math.abs(diff) * 80}px`,
      };
    }
  };
  
  // Use consistent purple gradient for all cards
  const getCardGradient = () => {
    return "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)";
  };
  
  return (
    <div 
      className="w-full h-[700px] relative" 
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0} // Make div focusable for keyboard events
      style={{ 
        perspective: '1500px',
        touchAction: 'none',
        overflow: 'visible',
        outline: 'none', // Hide focus outline
      }}
    >
      <div className="absolute w-full h-full flex items-center justify-center">
        {steps.map((step, index) => {
          const style = getCardStyle(index);
          const isActive = activeIndex === index;
          const visible = Math.abs(index - activeIndex) <= 3;
          
          if (!visible) return null;
          
          return (
            <motion.div
              key={step.id}
              className="absolute"
              initial={false}
              animate={{
                zIndex: style.zIndex,
                opacity: style.opacity,
                rotateY: style.rotateY || '0deg',
                rotateX: style.rotateX || '0deg',
                translateZ: style.translateZ || '0px',
                translateX: style.translateX || '0px',
                translateY: style.translateY || '0px',
                scale: style.scale,
              }}
              whileHover={isActive ? { scale: 1.06, translateZ: "30px" } : {}}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30
              }}
              style={{
                width: '340px',
                height: '480px',
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
              }}
              onClick={() => handleCardClick(index)}
            >
              <div 
                className="w-full h-full rounded-lg p-8 flex flex-col justify-between transform-gpu backdrop-blur-sm"
                style={{
                  background: getCardGradient(),
                  boxShadow: isActive ? '0 10px 40px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                {/* Card Header */}
                <div className="text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-black/70">{step.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-black/90">{step.title}</h3>
                  <p className="text-black/80 mb-4">{step.description}</p>
                </div>
                
                {/* Card Footer */}
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-black/70">{step.duration}</span>
                  
                  {isActive && (
                    <motion.button
                      className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onBegin(step.id);
                      }}
                    >
                      Begin
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-muted-foreground flex items-center space-x-2">
        <span>Use</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="m7 15 5 5 5-5"/>
          <path d="m7 9 5-5 5 5"/>
        </svg>
        <span>keys or mousewheel to navigate</span>
      </div>
    </div>
  );
};

export default TimelineCarousel3D;
