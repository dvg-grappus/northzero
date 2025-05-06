import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Step } from "@/types/timeline";
import { useProjects } from "@/contexts/ProjectsContext";
import { useParams, useSearchParams } from "react-router-dom";
import { useTimelineStatus } from './TimelineStatusProvider';
import { Eye } from 'lucide-react';
import ReactDOM from "react-dom";

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
  const [showPreview, setShowPreview] = React.useState(false);
  const { getCardStatus, getCardPreview } = useTimelineStatus();
  const cardStatus = getCardStatus(step.id);
  const previewData = getCardPreview(step.id);
  
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

  console.log('showPreview', showPreview);
  console.log('previewData', previewData);

  return (
    <>
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
          <div className="text-left relative">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-black/70">{step.id}</span>
              {cardStatus !== 'unstarted' && (
                <span className={`px-3 py-1 text-black text-xs rounded-full font-semibold ${cardStatus === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`}>
                  {cardStatus === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-black/90">{step.title}</h3>
            <p className="text-black/80 mb-4">{step.description}</p>
            {/* Preview Button: left-aligned, below description */}
            {cardStatus === 'completed' && previewData && (
              <button
                className="mt-2 flex items-center gap-2 bg-black text-white px-4 py-2 rounded shadow-sm text-sm font-semibold hover:bg-gray-900 transition"
                onClick={e => { 
                  e.stopPropagation(); 
                  console.log('Preview button clicked');
                  setShowPreview(true); 
                }}
                style={{ width: 'fit-content' }}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            )}
          </div>
          {/* Card Footer */}
          <div className="flex justify-between items-end mt-auto">
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
                {cardStatus === 'completed' ? 'Fine tune' : cardStatus === 'in-progress' ? 'Continue' : 'Begin'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
      {/* Bottom Sheet Preview - Plain Portal, No Animation */}
      {showPreview && previewData && ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowPreview(false)}>
          <div
            style={{ minHeight: 340 }}
            className="w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl p-10 flex flex-col md:flex-row gap-10 relative border border-cyan-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-cyan-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="flex-1 flex flex-col items-start border-r border-gray-200 pl-8 pr-8 min-w-[0]">
              <h4 className="text-lg font-bold text-gray-900 mb-4 tracking-wide">Internal Statement</h4>
              <p className="text-base text-gray-800 font-medium whitespace-pre-line break-words">
                {previewData.internal || <span className="text-gray-400">No internal statement found.</span>}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-start pl-4 min-w-[0]">
              <h4 className="text-lg font-bold text-gray-900 mb-4 tracking-wide">External Statement</h4>
              <p className="text-base text-gray-800 font-medium whitespace-pre-line break-words">
                {previewData.external || <span className="text-gray-400">No external statement found.</span>}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TimelineCard;
