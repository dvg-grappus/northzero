import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateMoreOptions } from '@/services/openaiService';

interface ValueCardProps {
  id: string;
  value: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  onDiscard: () => void;
}

const ValueCard: React.FC<ValueCardProps> = ({ id, value, description, isSelected, onClick, onDiscard }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`p-4 rounded-lg cursor-pointer transition-all relative h-[180px] ${
        isSelected 
          ? "bg-cyan text-black shadow-lg ring-2 ring-cyan" 
          : "bg-[#FFE87A] text-black hover:bg-[#ffeb96] hover:-translate-y-1"
      }`}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="text-lg font-bold mb-1">{value}</h3>
      <p className="text-sm line-clamp-5">{description}</p>
      
      {/* Delete button that appears on hover */}
      {isHovered && (
        <motion.button
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDiscard();
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <X className="w-3 h-3 text-black/70" />
        </motion.button>
      )}
    </motion.div>
  );
};

interface ValuesProps {
  onComplete?: () => void;
}

const Values: React.FC<ValuesProps> = ({ onComplete }) => {
  const { selectedValues, setSelectedValues, completeStep } = useContext(PositioningContext);
  const { values, isLoading, updateItemState, refreshData, projectId } = usePositioningData();
  
  const [formattedValues, setFormattedValues] = useState<{ id: string; value: string; description: string }[]>([]);
  
  // Add custom value dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customValueTitle, setCustomValueTitle] = useState("");
  const [customValueBlurb, setCustomValueBlurb] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Generate 5 More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [extraNote, setExtraNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Format values from database
  useEffect(() => {
    if (!isLoading) {
      const formatted = values.map(item => ({
        id: item.id,
        value: item.content,
        description: item.extra_json?.blurb || ""
      }));
      setFormattedValues(formatted);
      
      // Initialize selected values
      setSelectedValues(values.filter(v => v.state === 'selected').map(v => v.content));
    }
  }, [isLoading, values, setSelectedValues]);
  
  const handleSelect = async (value: string) => {
    const valueItem = values.find(item => item.content === value);
    if (!valueItem) return;

    const newState = valueItem.state === 'selected' ? 'draft' : 'selected';
    
    // Update UI state first
    setSelectedValues(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );

    // Update database state
    try {
      await updateItemState(valueItem.id, newState);
    } catch (error) {
      console.error('Failed to update item state:', error);
      // Revert UI state if DB update fails
      setSelectedValues(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
      toast.error('Failed to update selection');
    }
  };

  const handleDiscard = async (value: string) => {
    const valueItem = values.find(item => item.content === value);
    if (!valueItem) return;

    await updateItemState(valueItem.id, 'archived');
    await refreshData();
  };
  
  const validateSelection = () => {
    if (selectedValues.length < 3) {
      toast.error("Select at least 3 values");
      return false;
    }
    
    if (selectedValues.length > 7) {
      toast.error("Select at most 7 values");
      return false;
    }
    
    return true;
  };
  
  const handleComplete = () => {
    if (validateSelection()) {
      if (onComplete) {
        onComplete();
      } else if (completeStep) {
        completeStep("values");
      }
    }
  };
  
  // Add custom value
  const handleAddCustomValue = async () => {
    if (!customValueTitle.trim()) {
      toast.error("Please enter a value title");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the latest document for the current project
      const { data: documents } = await supabase
        .from('positioning_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1);
      
      if (!documents || documents.length === 0) {
        toast.error("No positioning document found");
        return;
      }
      
      const document = documents[0];
      
      // Get the current values to determine the next index
      const nextIdx = values.length;
      
      // Create the extra_json with the blurb
      const extraJson = { blurb: customValueBlurb.trim() || customValueTitle };
      
      // Insert the new value
      const { data: newItem, error } = await supabase
        .from('positioning_items')
        .insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: 'VALUE',
          content: customValueTitle,
          extra_json: extraJson,
          idx: nextIdx,
          state: 'draft',
          source: 'user'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding custom value:", error);
        toast.error("Failed to add custom value");
        return;
      }
      
      // Refresh data to update the UI
      await refreshData();
      
      toast.success(`Added new value: ${customValueTitle}`);
      
      // Close dialog and reset inputs
      setDialogOpen(false);
      setCustomValueTitle("");
      setCustomValueBlurb("");
    } catch (error) {
      console.error("Error adding custom value:", error);
      toast.error("Failed to add custom value");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for Generate 5 More CTA
  const handleGenerateMore = () => {
    setExtraNote("");
    setGenerateDialogOpen(true);
  };

  // Handler for submitting Generate 5 More
  const handleSubmitGenerateMore = async () => {
    setIsGenerating(true);
    try {
      // Get the latest document for the current project
      const { data: documents } = await supabase
        .from('positioning_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1);
      if (!documents || documents.length === 0) {
        toast.error("No positioning document found");
        setIsGenerating(false);
        return;
      }
      const document = documents[0];
      // Build context JSON (raw_payload is the full dataset)
      const contextJson = document.raw_payload || {};
      // Call OpenAI
      const newOptions = await generateMoreOptions('VALUE', contextJson, extraNote);
      // Insert each new option as a positioning_item
      const nextIdx = values.length;
      for (let i = 0; i < newOptions.length; i++) {
        const valueObj = newOptions[i];
        await supabase.from('positioning_items').insert({
          document_id: document.id,
          project_id: document.project_id,
          item_type: 'VALUE',
          content: valueObj.title,
          extra_json: { blurb: valueObj.blurb },
          idx: nextIdx + i,
          state: 'draft',
          source: 'ai'
        });
      }
      await new Promise(res => setTimeout(res, 300)); // Add delay before refresh
      await refreshData();
      toast.success('Generated 5 new values!');
      setGenerateDialogOpen(false);
      setExtraNote("");
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate more options');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Brand Values</h2>
      {values.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No values defined yet. Add your core values to shape your brand.
        </div>
      ) : (
        <>
          <motion.p
            className="text-gray-500 text-sm mb-1 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Choose the principles you'll never trade.
          </motion.p>
          
          <motion.h1
            className="text-[32px] font-bold mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Top Values
          </motion.h1>
          
          <div className="flex justify-between items-center mb-4">
            <div className={`font-medium ${
              selectedValues.length < 3 ? "text-red-500" : 
              selectedValues.length > 7 ? "text-red-500" : 
              "text-green-500"
            }`}>
              {selectedValues.length} selected ({3} min, {7} max)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2"
                size="sm"
              >
                <Plus size={16} />
                VALUE
              </Button>
              <Button
                onClick={handleGenerateMore}
                className="bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300"
                size="sm"
              >
                ⚡️ 5 More
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center mt-8">
              <div className="grid grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-[180px] bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
              <p className="text-gray-500 mt-4">Still shaping ideas... one second.</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {formattedValues
                .filter(item => {
                  // Find the corresponding database item
                  const dbItem = values.find(v => v.id === item.id);
                  // Only show items that aren't archived
                  return dbItem && dbItem.state !== 'archived';
                })
                .map((item, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <ValueCard 
                      id={item.id}
                      value={item.value} 
                      description={item.description} 
                      isSelected={selectedValues.includes(item.value)}
                      onClick={() => handleSelect(item.value)}
                      onDiscard={() => handleDiscard(item.value)}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </>
      )}
      
      {/* Add custom value dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Value</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Value Title
              </label>
              <Input
                value={customValueTitle}
                onChange={(e) => setCustomValueTitle(e.target.value)}
                placeholder="e.g. Transparency"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Value Description
              </label>
              <Textarea
                value={customValueBlurb}
                onChange={(e) => setCustomValueBlurb(e.target.value)}
                placeholder="e.g. We communicate openly and honestly with our customers."
                className="w-full"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCustomValue}
              disabled={isSubmitting || !customValueTitle.trim()}
            >
              {isSubmitting ? "Adding..." : "Add Value"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-6 text-right">
        <Button
          onClick={handleComplete}
          className="bg-white text-black hover:bg-gray-100 transition-colors"
        >
          Commit to values
        </Button>
      </div>
      
      {/* Generate 5 More dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate 5 More Values</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={extraNote}
              onChange={e => setExtraNote(e.target.value)}
              placeholder="Optional: Add a line of guidance for the AI..."
              className="w-full"
              disabled={isGenerating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleSubmitGenerateMore} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Values;