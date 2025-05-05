
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        navigateToBrandHub();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    const hintTimer = setTimeout(() => {
      setShowKeyboardHint(true);
    }, 4000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(hintTimer);
    };
  }, []);

  const navigateToBrandHub = () => {
    navigate("/brand-hub");
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!prefersReducedMotion) {
      const button = e.currentTarget;
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.className = "ripple";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    setTimeout(navigateToBrandHub, 50);
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-background relative overflow-hidden"
      exit={{ y: -40, opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="radial-vignette absolute inset-0 opacity-20"></div>
      
      <motion.div 
        className="absolute top-10 left-10 z-10 overflow-hidden"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="inter-font text-[18px] font-medium tracking-wide text-foreground/90 flex items-center">
            <span className="w-2 h-2 bg-cyan rounded-full mr-2"></span>
            North of Zero
          </h1>
        </motion.div>
      </motion.div>
      
      {!prefersReducedMotion && (
        <motion.div 
          className="w-[1000px] h-[1000px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden opacity-10"
          style={{
            background: "linear-gradient(225deg, #7DF9FF 0%, #FFD56F 50%, #FF6363 100%)",
            filter: "blur(80px)"
          }}
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, ease: "linear", repeat: Infinity },
            scale: {
              duration: 8,
              times: [0, 0.5, 1],
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.h2 
          className="inter-font font-medium text-[56px] leading-[1.1] text-foreground text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Turn a 60-word brief into a complete brand system.
        </motion.h2>
        
        <motion.p 
          className="inter-font text-[20px] text-foreground/70 mt-6 text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          Strategy, visuals and assets—generated in minutes, always under your direction.
        </motion.p>
        
        <motion.button
          className="mt-14 bg-foreground text-background hover:bg-foreground/90 font-medium py-4 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/20 relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-foreground/5"
          onClick={handleButtonClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <span className="inter-font text-[17px]">Enter Brand Hub →</span>
        </motion.button>
      </div>
      
      {showKeyboardHint && (
        <motion.div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <p className="inter-font text-[14px] text-foreground/60">⌘ + ↵ Skip intro</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Welcome;
