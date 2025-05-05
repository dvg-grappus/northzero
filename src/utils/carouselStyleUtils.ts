
import { CardStyle } from "@/types/carousel";

/**
 * Calculates the visual style for each carousel card based on its position
 * relative to the active card.
 * 
 * @param index - The index of the card to calculate styles for
 * @param activeIndex - The currently active/centered card index
 * @returns CardStyle object with all necessary style properties
 */
export const getCardStyle = (index: number, activeIndex: number): CardStyle => {
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
