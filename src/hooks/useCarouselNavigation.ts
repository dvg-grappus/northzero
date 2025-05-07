import { useState, useRef, useEffect } from "react";

// Smaller hook for managing animation timeouts and cleanup
function useAnimationState(animationDuration: number = 300) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const wheelEventBlockerRef = useRef<number | null>(null);
  
  // Function to start animation state and set timers
  const startAnimation = (callback?: () => void) => {
    setIsAnimating(true);
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    
    // Set timeout to end animation state
    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      if (callback) callback();
    }, animationDuration + 50);
  };
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      if (wheelEventBlockerRef.current) {
        window.clearTimeout(wheelEventBlockerRef.current);
      }
    };
  }, []);
  
  return {
    isAnimating,
    startAnimation,
    animationTimeoutRef,
    wheelEventBlockerRef
  };
}

// Hook for wheel event management
function useWheelNavigation(
  containerRef: React.RefObject<HTMLDivElement>, 
  activeIndex: number, 
  totalItems: number, 
  isAnimating: boolean,
  goToCard: (index: number) => void
) {
  const isWheelEnabledRef = useRef(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault(); // Always prevent default
      
      // Only process if wheel events are enabled and not animating
      if (!isWheelEnabledRef.current || isAnimating) {
        return;
      }
      
      // Immediately mark wheel as processed to block subsequent events
      isWheelEnabledRef.current = false;
      
      // Determine direction and trigger navigation
      if (e.deltaY > 0) {
        goToCard(Math.min(activeIndex + 1, totalItems - 1));
      } else {
        goToCard(Math.max(activeIndex - 1, 0));
      }
      
      // Re-enable wheel after a delay
      setTimeout(() => {
        isWheelEnabledRef.current = true;
      }, 750);
    };
    
    // Add non-passive wheel event listener
    element.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    // Clean up
    return () => {
      element.removeEventListener('wheel', handleWheelEvent);
    };
  }, [activeIndex, totalItems, isAnimating, goToCard, containerRef]);
  
  return {
    isWheelEnabledRef
  };
}

// Hook for touch navigation
function useTouchNavigation(activeIndex: number, totalItems: number) {
  const touchStartRef = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };
  
  return {
    touchStartRef,
    handleTouchStart
  };
}

// Main hook that composes the smaller hooks
interface UseCarouselNavigationProps {
  totalItems: number;
  animationDuration?: number;
}

interface CarouselNavigationResult {
  activeIndex: number;
  isAnimating: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  goToCard: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Custom hook that manages carousel navigation state and event handling
 */
export const useCarouselNavigation = ({
  totalItems,
  animationDuration = 300,
}: UseCarouselNavigationProps): CarouselNavigationResult => {
  // State management
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation state management
  const { 
    isAnimating, 
    startAnimation, 
    wheelEventBlockerRef 
  } = useAnimationState(animationDuration);
  
  // Refs for navigation control
  const keyboardNavigationEnabledRef = useRef(true);
  const lastNavigatedIndexRef = useRef(0);
  const lastKeyPressTimeRef = useRef(0);
  
  // Integration with touch navigation
  const { touchStartRef, handleTouchStart } = useTouchNavigation(activeIndex, totalItems);
  
  // Navigate to specific card with enhanced protection
  const goToCard = (index: number) => {
    // Verify index is different from current and within bounds
    if (index < 0 || index >= totalItems) {
      return;
    }
    
    if (isAnimating) {
      return;
    }
    
    if (index === activeIndex) {
      return;
    }
    
    // Store the last index we're navigating to
    lastNavigatedIndexRef.current = index;
    
    startAnimation(() => {
      // Re-enable keyboard navigation after animation completes
      keyboardNavigationEnabledRef.current = true;
      
      // After animation completes, wait before re-enabling wheel events
      wheelEventBlockerRef.current = window.setTimeout(() => {
      }, 750);
    });
    
    // Update the active index
    setActiveIndex(index);
  };
  
  // Connect wheel navigation
  useWheelNavigation(
    containerRef, 
    activeIndex, 
    totalItems, 
    isAnimating, 
    goToCard
  );
  
  // Disable page scrolling while carousel is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  
  // Handle touch events for mobile navigation
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;
    
    // For touch events, also use the separate lock
    if (isAnimating) {
      return;
    }
    
    if (!keyboardNavigationEnabledRef.current) {
      return;
    }
    
    // Use a threshold for better responsiveness
    if (Math.abs(diff) > 20) {
      // Temporarily disable keyboard/touch navigation
      keyboardNavigationEnabledRef.current = false;
      
      // Calculate target index
      const targetIndex = diff > 0 
        ? Math.min(activeIndex + 1, totalItems - 1)
        : Math.max(activeIndex - 1, 0);
      
      goToCard(targetIndex);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Debounce key presses to avoid rapid, unintended double-presses
    const now = Date.now();
    const timeSinceLastKeypress = now - lastKeyPressTimeRef.current;
    
    // Record the keypress time
    lastKeyPressTimeRef.current = now;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      // Always prevent default for arrow keys to avoid page scrolling
      e.preventDefault();
      
      // Check if we need to block this navigation due to animation
      if (isAnimating) {
        return;
      }
      
      // Check if keyboard navigation is enabled
      if (!keyboardNavigationEnabledRef.current) {
        return;
      }
      
      // Throttle navigation if keypresses are too rapid (less than 100ms apart)
      if (timeSinceLastKeypress < 100) {
        return;
      }
      
      let targetIndex = activeIndex;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = Math.min(activeIndex + 1, totalItems - 1);
        
        // If we can actually move (not at the end)
        if (targetIndex !== activeIndex) {
          // Temporarily disable keyboard navigation until animation completes
          keyboardNavigationEnabledRef.current = false;
          goToCard(targetIndex);
        }
      } 
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = Math.max(activeIndex - 1, 0);
        
        // If we can actually move (not at the beginning)
        if (targetIndex !== activeIndex) {
          // Temporarily disable keyboard navigation until animation completes
          keyboardNavigationEnabledRef.current = false;
          goToCard(targetIndex);
        }
      }
    }
  };

  return {
    activeIndex,
    isAnimating,
    containerRef,
    goToCard,
    handleKeyDown,
    handleTouchStart,
    handleTouchEnd
  };
};
