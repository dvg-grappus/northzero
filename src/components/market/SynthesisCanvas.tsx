
import React from "react";
import { useMarket } from "@/providers/MarketProvider";

interface SynthesisCanvasProps {
  onComplete: () => void;
}

export const SynthesisCanvas: React.FC<SynthesisCanvasProps> = ({ onComplete }) => {
  const { isSection3Complete } = useMarket();
  
  // Monitor for completion - we're not using section 4 anymore
  React.useEffect(() => {
    if (isSection3Complete) {
      onComplete();
    }
  }, [isSection3Complete, onComplete]);
  
  return (
    <div className="p-4 text-center">
      <p>This section has been removed as requested.</p>
    </div>
  );
};
