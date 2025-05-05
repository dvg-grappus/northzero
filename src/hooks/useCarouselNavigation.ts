
import { useState, useRef, useEffect } from "react";

// Smaller hook for managing animation timeouts and cleanup
function useAnimationState(animationDuration: number = 300) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const wheelEventBlockerRef = useRef<number | null>(null);
  
  // Function to start animation state and set timers
  const startAnimation = (callback?: () => void) => {
    console.log("Animation started");
    setIsAnimating(true);
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    
    // Set timeout to end animation state
    animationTimeoutRef.current = window.setTimeout(() => {
      console.log("Animation completed, releasing animation lock");
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
      // Always log wheel events
      console.log("Wheel event detected", { 
        deltaY: e.deltaY, 
        enabled: isWheelEnabledRef.current,
        isAnimating,
        activeIndex 
      });
      
      e.preventDefault(); // Always prevent default
      
      // Only process if wheel events are enabled and not animating
      if (!isWheelEnabledRef.current || isAnimating) {
        console.log("Wheel event blocked - waiting for previous scroll to finish");
        return;
      }
      
      // Immediately mark wheel as processed to block subsequent events
      isWheelEnabledRef.current = false;
      console.log("Processing wheel event, blocking others");
      
      // Determine direction and trigger navigation
      if (e.deltaY > 0) {
        console.log("Scrolling DOWN/RIGHT");
        goToCard(Math.min(activeIndex + 1, totalItems - 1));
      } else {
        console.log("Scrolling UP/LEFT");
        goToCard(Math.max(activeIndex - 1, 0));
      }
      
      // Re-enable wheel after a delay
      setTimeout(() => {
        isWheelEnabledRef.current = true;
        console.log("Wheel events re-enabled");
      }, 750);
    };
    
    // Add non-passive wheel event listener
    console.log("Wheel event listener added to", element);
    element.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    // Clean up
    return () => {
      console.log("Wheel event listener removed");
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
    console.log("Touch start detected at position:", touchStartRef.current);
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
    // ALWAYS log navigation attempts
    console.log("goToCard called", { index, currentIndex: activeIndex, isAnimating });
    
    // Verify index is different from current and within bounds
    if (index < 0 || index >= totalItems) {
      console.log(`goToCard blocked - index ${index} out of bounds [0-${totalItems-1}]`);
      return;
    }
    
    if (isAnimating) {
      console.log("goToCard blocked - already animating");
      return;
    }
    
    if (index === activeIndex) {
      console.log("goToCard blocked - same index");
      return;
    }
    
    // Store the last index we're navigating to
    lastNavigatedIndexRef.current = index;
    
    console.log("Starting navigation from", activeIndex, "to", index);
    startAnimation(() => {
      // Re-enable keyboard navigation after animation completes
      keyboardNavigationEnabledRef.current = true;
      console.log("Keyboard navigation re-enabled");
      
      // After animation completes, wait before re-enabling wheel events
      wheelEventBlockerRef.current = window.setTimeout(() => {
        console.log("Wheel events can be processed again");
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
    // ALWAYS log touch events
    console.log("Touch end detected");
    
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;
    console.log("Touch diff:", diff);
    
    // For touch events, also use the separate lock
    if (isAnimating) {
      console.log("Touch navigation blocked - animation in progress");
      return;
    }
    
    if (!keyboardNavigationEnabledRef.current) {
      console.log("Touch navigation blocked - keyboard nav disabled");
      return;
    }
    
    // Use a threshold for better responsiveness
    if (Math.abs(diff) > 20) {
      // Temporarily disable keyboard/touch navigation
      keyboardNavigationEnabledRef.current = false;
      console.log("Touch navigation detected, disabling keyboard nav temporarily");
      
      // Calculate target index
      const targetIndex = diff > 0 
        ? Math.min(activeIndex + 1, totalItems - 1)
        : Math.max(activeIndex - 1, 0);
      
      console.log(`Touch navigation to index: ${targetIndex} (current: ${activeIndex})`);
      goToCard(targetIndex);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ALWAYS log EVERY keypress, without any conditions, so we can debug
    console.log(`Key pressed: ${e.key}, Current index: ${activeIndex}, Animation status: ${isAnimating}, Keyboard nav enabled: ${keyboardNavigationEnabledRef.current}`);
    
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
        console.log(`Arrow key navigation blocked - animation in progress`);
        return;
      }
      
      // Check if keyboard navigation is enabled
      if (!keyboardNavigationEnabledRef.current) {
        console.log(`Arrow key navigation blocked - keyboard navigation disabled`);
        return;
      }
      
      // Throttle navigation if keypresses are too rapid (less than 100ms apart)
      if (timeSinceLastKeypress < 100) {
        console.log(`Arrow key navigation throttled - too rapid keypresses (${timeSinceLastKeypress}ms)`);
        return;
      }
      
      let targetIndex = activeIndex;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = Math.min(activeIndex + 1, totalItems - 1);
        console.log(`Arrow DOWN/RIGHT processed, attempting to navigate to index ${targetIndex}`);
        
        // If we can actually move (not at the end)
        if (targetIndex !== activeIndex) {
          // Temporarily disable keyboard navigation until animation completes
          keyboardNavigationEnabledRef.current = false;
          goToCard(targetIndex);
        } else {
          console.log("Already at last card, can't navigate further down/right");
        }
      } 
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = Math.max(activeIndex - 1, 0);
        console.log(`Arrow UP/LEFT processed, attempting to navigate to index ${targetIndex}`);
        
        // If we can actually move (not at the beginning)
        if (targetIndex !== activeIndex) {
          // Temporarily disable keyboard navigation until animation completes
          keyboardNavigationEnabledRef.current = false;
          goToCard(targetIndex);
        } else {
          console.log("Already at first card, can't navigate further up/left");
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
