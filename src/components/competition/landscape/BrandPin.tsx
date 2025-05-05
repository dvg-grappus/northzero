
import React, { useState } from "react";
import { motion, useDragControls } from "framer-motion";

interface BrandPinProps {
  position: { x: number; y: number } | null;
  onDragEnd: (position: { x: number; y: number }) => void;
}

export const BrandPin: React.FC<BrandPinProps> = ({ position, onDragEnd }) => {
  const controls = useDragControls();
  const [isPressed, setIsPressed] = useState(false);
  
  // Calculate position in pixels for the brand pin
  const getPixelPosition = () => {
    if (!position) {
      // Default position outside canvas
      return { x: window.innerWidth - 140, y: 100 };
    }
    
    const canvas = document.getElementById("landscape-canvas");
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: position.x * rect.width,
      y: position.y * rect.height
    };
  };
  
  const handleDragEnd = (event: any, info: any) => {
    const canvas = document.getElementById("landscape-canvas");
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Check if within canvas bounds
    if (
      info.point.x >= rect.left && 
      info.point.x <= rect.right &&
      info.point.y >= rect.top && 
      info.point.y <= rect.bottom
    ) {
      // Convert to canvas coordinates
      const canvasX = info.point.x - rect.left;
      const canvasY = info.point.y - rect.top;
      
      // Convert to normalized coordinates (0-1)
      const normalizedX = Math.min(Math.max(canvasX / rect.width, 0), 1);
      const normalizedY = Math.min(Math.max(canvasY / rect.height, 0), 1);
      
      onDragEnd({ x: normalizedX, y: normalizedY });
    }
  };
  
  const pixelPosition = getPixelPosition();
  
  return (
    <motion.div
      drag
      dragControls={controls}
      onDragEnd={handleDragEnd}
      dragMomentum={false}
      dragElastic={0.2}
      initial={false}
      animate={{ 
        x: pixelPosition.x, 
        y: pixelPosition.y,
        scale: isPressed ? 1.1 : 1,
        zIndex: isPressed ? 10 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      style={{ position: "absolute", top: 0, left: 0 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <div 
        className={`flex items-center justify-center rounded-full ${
          position ? "bg-[#FEF7CD] border border-amber-400" : "bg-[#FEF7CD]/70 border border-amber-400/70 animate-pulse"
        } shadow-lg`}
        style={{ 
          width: 60, 
          height: 60, 
          transform: "translate(-50%, -50%)"
        }}
      >
        <span className="text-sm text-black font-semibold text-center px-1">
          You
        </span>
      </div>
      
      {!position && (
        <div className="absolute left-full top-1/2 ml-2 -mt-2 whitespace-nowrap bg-card border border-border rounded-md px-2 py-1 text-xs">
          Drag me onto the map
        </div>
      )}
    </motion.div>
  );
};
