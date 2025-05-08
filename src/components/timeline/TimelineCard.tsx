import React from "react";
import { Step } from "@/types/timeline";
import { useSearchParams } from "react-router-dom";
import { useTimelineStatus } from './TimelineStatusProvider';
import { Eye, Lock, Check, Circle } from 'lucide-react';
import ReactDOM from "react-dom";

interface TimelineCardProps {
  step: Step;
  onBeginClick: () => void;
  className?: string;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  step,
  onBeginClick,
  className = ''
}) => {
  const [searchParams] = useSearchParams();
  const { getCardStatus, getCardPreview } = useTimelineStatus();
  const stepIdNum = typeof step.id === 'number' ? step.id : parseInt(step.id, 10);
  const cardStatus = getCardStatus(stepIdNum);
  const previewData = getCardPreview(stepIdNum);
  const [showPreview, setShowPreview] = React.useState(false);

  // Status circle icon/color
  const statusCircle = () => {
    switch (cardStatus) {
      case 'completed':
        return <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white"><Check size={20} /></span>;
      case 'in-progress':
        return <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-black"><Circle size={20} fill="currentColor" strokeWidth={0} /></span>;
      case 'locked':
        return <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400"><Lock size={18} /></span>;
      case 'ready':
      default:
        return <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-cyan-400 text-cyan-400"><Circle size={20} strokeWidth={2.5} /></span>;
    }
  };

  // Status label (for screen readers or future use)
  const statusLabel = () => {
    switch (cardStatus) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'locked': return 'Locked';
      case 'ready': return 'Ready';
      default: return '';
    }
  };

  // CTA text
  const ctaText = () => {
    switch (cardStatus) {
      case 'locked':
        return '🔒 Locked';
      case 'completed':
        return 'Fine tune';
      case 'in-progress':
        return 'Continue';
      case 'ready':
        return 'Begin';
      default:
        return 'Begin';
    }
  };

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto mb-6 rounded-2xl shadow-lg bg-zinc-900 border border-zinc-800 flex items-center px-6 py-6 gap-6 transition-all ${className}`}
      style={{ opacity: cardStatus === 'locked' ? 0.7 : 1 }}
    >
      {/* Status circle and vertical line */}
      <div className="flex flex-col items-center mr-4">
        {statusCircle()}
        {/* Vertical line (hidden for last card, handled in parent) */}
        <div className="flex-1 w-px bg-zinc-700 mt-1" />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white truncate">{step.title}</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-800 text-zinc-300">{statusLabel()}</span>
          {cardStatus === 'completed' && previewData && (
            <button
              className="ml-1 text-zinc-400 hover:text-cyan-400 transition"
              onClick={e => { e.stopPropagation(); setShowPreview(true); }}
              aria-label="Preview"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-zinc-300 text-base truncate">{step.description}</p>
      </div>
      {/* CTA */}
      <div className="flex flex-col items-end ml-4">
        <button
          className={`text-base font-semibold underline underline-offset-4 transition-colors ${
            cardStatus === 'locked'
              ? 'text-zinc-500 cursor-not-allowed opacity-60'
              : 'text-cyan-400 hover:text-cyan-300'
          }`}
          disabled={cardStatus === 'locked'}
          onClick={e => { e.stopPropagation(); if (cardStatus !== 'locked') onBeginClick(); }}
        >
          {ctaText()}
        </button>
      </div>
      {/* Preview Modal */}
      {showPreview && previewData && ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowPreview(false)}>
          <div
            style={{ minHeight: 340 }}
            className="w-full max-w-3xl bg-zinc-900 rounded-2xl shadow-2xl p-10 flex flex-col md:flex-row gap-10 relative border border-cyan-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-cyan-400 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="flex-1 flex flex-col items-start border-r border-zinc-800 pl-8 pr-8 min-w-[0]">
              <h4 className="text-lg font-bold text-white mb-4 tracking-wide">Internal Statement</h4>
              <p className="text-base text-zinc-200 font-medium whitespace-pre-line break-words">
                {previewData.internal || <span className="text-zinc-500">No internal statement found.</span>}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-start pl-4 min-w-[0]">
              <h4 className="text-lg font-bold text-white mb-4 tracking-wide">External Statement</h4>
              <p className="text-base text-zinc-200 font-medium whitespace-pre-line break-words">
                {previewData.external || <span className="text-zinc-500">No external statement found.</span>}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TimelineCard;
