
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/providers/MarketProvider";
import { toast } from "sonner";

interface SecondaryInsightPoolProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecondaryInsightPool: React.FC<SecondaryInsightPoolProps> = ({ isOpen, onClose }) => {
  const { marketInsights, starInsight } = useMarket();
  const [selectedInsights, setSelectedInsights] = React.useState<string[]>([]);
  
  const toggleInsightSelection = (id: string) => {
    setSelectedInsights(prev => 
      prev.includes(id) 
        ? prev.filter(insightId => insightId !== id) 
        : [...prev, id]
    );
  };
  
  const handleMergeSelected = () => {
    if (selectedInsights.length < 2) {
      toast.error("Select at least 2 insights to merge");
      return;
    }
    
    // Get the selected insights
    const toMerge = selectedInsights.map(id => 
      marketInsights.find(insight => insight.id === id)
    ).filter(Boolean);
    
    // Create a merged text
    const mergedText = `Combined insight: ${toMerge.map(i => i?.text.slice(0, 30)).join(" + ")}...`;
    
    // Clear selection
    setSelectedInsights([]);
    
    toast.success(`${selectedInsights.length} insights merged`);
  };
  
  const handleDeleteSelected = () => {
    if (selectedInsights.length === 0) return;
    
    setSelectedInsights([]);
    
    toast.success(`${selectedInsights.length} insights would be deleted`);
  };

  // Filter to only show market insights
  const filteredInsights = marketInsights.filter(insight => insight.type === 'stat' || insight.type === 'social' || insight.type === 'library');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 bottom-0 w-[340px] bg-[#1B1B1B] shadow-lg z-50 overflow-y-auto border-r border-border/40"
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center">
                  <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
                  Market Pool ({filteredInsights.length})
                </h2>
                <button 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Bulk actions */}
              {selectedInsights.length > 0 && (
                <div className="mb-4 p-2 bg-secondary/20 rounded-md flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-1"
                    onClick={handleMergeSelected}
                  >
                    Merge ({selectedInsights.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-4">
                {filteredInsights.map(insight => (
                  <motion.div
                    key={insight.id} 
                    className={`bg-[#222] rounded-lg p-4 w-[280px] transition-all ${
                      selectedInsights.includes(insight.id)
                        ? "ring-2 ring-teal-500"
                        : ""
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start mb-2">
                      <div className="flex-shrink-0">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-600"
                          checked={selectedInsights.includes(insight.id)}
                          onChange={() => toggleInsightSelection(insight.id)}
                        />
                      </div>
                      
                      <div 
                        className={`w-3 h-3 rounded-full mt-1 ml-2 flex-shrink-0 ${
                          insight.type === 'stat' 
                            ? 'bg-blue-500' 
                            : insight.type === 'social' 
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      
                      <p className="text-sm text-foreground ml-2">{insight.text}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{insight.source}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => starInsight(insight.id)}
                          className={`${
                            insight.starred ? 'text-yellow-500' : 'text-gray-500'
                          } hover:text-yellow-500 transition-colors`}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {filteredInsights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No insights yet.</p>
                    <p className="text-sm mt-2">
                      Insights will be collected as you progress through the market workflow.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
