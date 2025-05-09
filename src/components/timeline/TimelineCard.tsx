import React from "react";
import { motion } from "framer-motion";
import { Step } from "@/types/timeline";
import { useProjects } from "@/contexts/ProjectsContext";
import { useParams, useSearchParams } from "react-router-dom";

// Collection of gradient backgrounds for project thumbnails
const gradients = [
  "linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)", // Purple to indigo
  "linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)", // Cyan to blue
  "linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)", // Amber to orange
  "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)", // Emerald to green
  "linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", // Rose to pink
  "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", // Purple to pink
  "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)", // Blue to emerald
  "linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)"  // Indigo to purple
];

interface TimelineCardProps {
  step: Step;
  isActive: boolean;
  style: {
    zIndex: number;
    opacity: number;
    scale: number;
    rotateY?: string;
    rotateX?: string;
    translateZ?: string;
    translateX?: string;
    translateY?: string;
  };
  onClick: () => void;
  onBeginClick: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  step,
  isActive,
  style,
  onClick,
  onBeginClick
}) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { projects } = useProjects();
  
  // Default gradient as a fallback
  let cardGradient = "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)";
  
  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // If the project has a gradient thumbnail, use it
      if (project.thumbnail && project.thumbnail.startsWith('linear-gradient')) {
        cardGradient = project.thumbnail;
      } else {
        // Otherwise generate a consistent gradient based on project ID
        const gradientIndex = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
        cardGradient = gradients[gradientIndex];
      }
    }
  }
  
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
      onClick={onClick}
      id={`timeline-card-${step.id}`}
    >
      <div 
        className="w-full h-full rounded-lg p-8 flex flex-col justify-between transform-gpu backdrop-blur-sm"
        style={{
          background: cardGradient,
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
                onBeginClick();
              }}
            >
              Begin
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineCard;
