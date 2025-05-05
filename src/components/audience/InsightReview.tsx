import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAudience, Insight } from "@/providers/AudienceProvider";
import { Star, CircleCheck, ArrowDown } from "lucide-react";

interface InsightCardProps {
  insight: Insight;
  onRate: (id: string, rating: number) => void;
  onStartDrag: (id: string) => void;
  onDrop: (targetId: string) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onRate, onStartDrag, onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', insight.id);
    setIsDragging(true);
    onStartDrag(insight.id);
    
    // For visual feedback during drag
    if (e.dataTransfer.setDragImage && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        cardRef.current, 
        e.clientX - rect.x, 
        e.clientY - rect.y
      );
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== insight.id) {
      onDrop(insight.id);
    }
  };
  
  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-[280px] h-[120px] bg-[#2B2B2B] rounded-lg p-4 shadow-md relative ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <div className="flex items-start mb-2">
          <div 
            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
              insight.isSystemGenerated ? "bg-green-500" : "bg-purple-500"
            }`}
          />
          <p className="text-sm text-foreground ml-2 line-clamp-3">{insight.text}</p>
        </div>
        
        <div className="absolute bottom-3 left-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRate(insight.id, star)}
                className={`${
                  (insight.rating || 0) >= star ? "text-yellow-500" : "text-gray-500"
                } hover:text-yellow-500 transition-colors`}
              >
                <Star size={14} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
          {insight.source}
        </div>
      </motion.div>
    </div>
  );
};

interface MergeModalProps {
  insight1: Insight;
  insight2: Insight;
  onMerge: (text: string) => void;
  onCancel: () => void;
}

const MergeModal: React.FC<MergeModalProps> = ({ insight1, insight2, onMerge, onCancel }) => {
  const [mergedText, setMergedText] = useState(
    `${insight1.text} + ${insight2.text}`
  );
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Merge Insights</h3>
        
        <div className="space-y-4 mb-6">
          <div className="p-3 bg-muted rounded flex items-start gap-2">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
              insight1.isSystemGenerated ? "bg-green-500" : "bg-purple-500"
            }`} />
            <p className="text-sm">{insight1.text}</p>
          </div>
          
          <div className="flex justify-center">
            <ArrowDown size={20} className="text-muted-foreground" />
          </div>
          
          <div className="p-3 bg-muted rounded flex items-start gap-2">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
              insight2.isSystemGenerated ? "bg-green-500" : "bg-purple-500"
            }`} />
            <p className="text-sm">{insight2.text}</p>
          </div>
          
          <div className="flex justify-center">
            <ArrowDown size={20} className="text-muted-foreground" />
          </div>
          
          <textarea
            value={mergedText}
            onChange={(e) => setMergedText(e.target.value)}
            className="w-full p-3 bg-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan resize-none"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            className="bg-cyan hover:bg-cyan/90 text-background" 
            onClick={() => onMerge(mergedText)}
          >
            Merge Insights
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface InsightReviewProps {
  onComplete: () => void;
}

const InsightReview: React.FC<InsightReviewProps> = ({ onComplete }) => {
  const { insights, rateInsight, mergeInsights } = useAudience();
  const [draggedInsightId, setDraggedInsightId] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState<{ id1: string, id2: string } | null>(null);
  
  const handleStartDrag = (id: string) => {
    setDraggedInsightId(id);
  };
  
  const handleDrop = (targetId: string) => {
    if (draggedInsightId && draggedInsightId !== targetId) {
      const insight1 = insights.find(i => i.id === draggedInsightId);
      const insight2 = insights.find(i => i.id === targetId);
      
      if (insight1 && insight2) {
        setMergeTarget({ id1: draggedInsightId, id2: targetId });
      }
    }
    setDraggedInsightId(null);
  };
  
  const handleMerge = (mergedText: string) => {
    if (mergeTarget) {
      mergeInsights(mergeTarget.id1, mergeTarget.id2, mergedText);
      setMergeTarget(null);
    }
  };
  
  // Group insights by source (system vs user)
  const systemInsights = insights.filter(i => i.isSystemGenerated);
  const userInsights = insights.filter(i => !i.isSystemGenerated);
  
  // Check if all insights have been rated
  const allRated = insights.every(i => i.rating !== undefined);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Primary Insight Digest</h1>
        <p className="text-muted-foreground">Rate your insights to identify the most valuable findings.</p>
      </motion.div>
      
      {/* System-generated insights */}
      {systemInsights.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-xl font-semibold">System-generated insights</h3>
          </div>
          
          <div className="flex flex-wrap gap-6">
            {systemInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onRate={rateInsight}
                onStartDrag={handleStartDrag}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* User-captured insights */}
      {userInsights.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h3 className="text-xl font-semibold">User-captured insights</h3>
          </div>
          
          <div className="flex flex-wrap gap-6">
            {userInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onRate={rateInsight}
                onStartDrag={handleStartDrag}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Merge modal */}
      {mergeTarget && (
        <MergeModal
          insight1={insights.find(i => i.id === mergeTarget.id1)!}
          insight2={insights.find(i => i.id === mergeTarget.id2)!}
          onMerge={handleMerge}
          onCancel={() => setMergeTarget(null)}
        />
      )}
      
      {/* Instructions */}
      <div className="bg-muted/30 rounded-lg p-6 mt-8 mb-16">
        <h3 className="text-lg font-medium mb-2">How to organize insights:</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Drag one insight card onto another to merge them</li>
          <li>Star rate every insight from 1-5</li>
          <li>Highest-rated insights will be highlighted in the final report</li>
        </ul>
      </div>
      
      <div className="fixed bottom-8 inset-x-0 mx-8 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-t border-border/40">
        <div className="text-sm">
          {!allRated ? (
            <span className="text-muted-foreground">
              Rate all insights to finish 
              ({insights.filter(i => i.rating !== undefined).length}/{insights.length})
            </span>
          ) : (
            <span className="flex items-center text-cyan gap-1">
              <CircleCheck size={16} /> All insights rated successfully
            </span>
          )}
        </div>
        <Button 
          onClick={onComplete}
          disabled={!allRated}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Publish audience insights →
        </Button>
      </div>
    </motion.div>
  );
};

export default InsightReview;
