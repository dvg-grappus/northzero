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
import { generateMoreOptions, generateDifferentiators, generateValues } from '@/services/openaiService';
import { getLatestPositioningDocument, updatePositioningDocumentForProject } from '@/services/positioningService';

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
  const { selectedValues, setSelectedValues, completeStep, selectedGoldenCircle, selectedOpportunities, selectedChallenges } = useContext(PositioningContext);
  const { values, challenges, opportunities, milestones, isLoading, updateItemState, refreshData, projectId, brief, weAreTheOnly } = usePositioningData();
  
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
  
  const hasExistingDifferentiators = (weAreTheOnly?.length || 0) > 0;
  const isComplete = selectedValues.length > 0;
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleComplete = async () => {
    if (!isComplete || isAdvancing) return;
    if (hasExistingDifferentiators) {
      if (onComplete) onComplete();
      else if (completeStep) completeStep("values");
      return;
    }
    setIsAdvancing(true);
    try {
      const latestDoc = await getLatestPositioningDocument(projectId);
      const selectionBundle = {
        brief,
        what: selectedGoldenCircle.what,
        how: selectedGoldenCircle.how,
        why: selectedGoldenCircle.why,
        opportunities: selectedOpportunities,
        challenges: selectedChallenges,
        milestones: milestones.map(m => m.content),
        values: values.map(v => ({
          title: v.content,
          blurb: v.extra_json?.blurb || '',
          state: v.state,
        })),
      };
      const genDiffs = await generateDifferentiators(brief, selectionBundle);
      const normalizedDiffs = {
        whileOthers: (genDiffs.differentiators?.whileOthers || []).map((c: string) => ({ content: c, state: 'draft' })),
        weAreTheOnly: (genDiffs.differentiators?.weAreTheOnly || []).map((c: string) => ({ content: c, state: 'draft' })),
      };

      const mergedPayload = {
        ...(latestDoc?.raw_payload || {}),
        brief,
        whatStatements: latestDoc?.raw_payload?.whatStatements || [],
        howStatements: latestDoc?.raw_payload?.howStatements || [],
        whyStatements: latestDoc?.raw_payload?.whyStatements || [],
        opportunities: latestDoc?.raw_payload?.opportunities || [],
        challenges: latestDoc?.raw_payload?.challenges || [],
        milestones: latestDoc?.raw_payload?.milestones || [],
        values: values.map(v => ({
          title: v.content,
          blurb: v.extra_json?.blurb || '',
          state: v.state,
        })),
        differentiators: normalizedDiffs,
      };

      await updatePositioningDocumentForProject(projectId, mergedPayload);
      if (refreshData) await refreshData();

      if (onComplete) onComplete();
      else if (completeStep) completeStep("values");
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate differentiators');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const latestDoc = await getLatestPositioningDocument(projectId);
      const selectionBundle = {
        what: selectedGoldenCircle.what,
        how: selectedGoldenCircle.how,
        why: selectedGoldenCircle.why,
        opportunities: selectedOpportunities,
        challenges: selectedChallenges,
        milestones: milestones.map(m => m.content),
      };
      const genValues = await generateValues(brief, selectionBundle);
      const normalizedValues = (genValues.values || []).map((v: any) => ({
        title: v.title || '',
        blurb: v.blurb || '',
        state: 'draft',
      }));

      // Clear existing VALUE items to avoid duplicates on regen
      if (latestDoc?.id) {
        await supabase
          .from('positioning_items')
          .delete()
          .eq('document_id', latestDoc.id)
          .eq('item_type', 'VALUE');
      }

      const mergedPayload = {
        ...(latestDoc?.raw_payload || {}),
        brief,
        whatStatements: latestDoc?.raw_payload?.whatStatements || [],
        howStatements: latestDoc?.raw_payload?.howStatements || [],
        whyStatements: latestDoc?.raw_payload?.whyStatements || [],
        opportunities: latestDoc?.raw_payload?.opportunities || [],
        challenges: latestDoc?.raw_payload?.challenges || [],
        milestones: latestDoc?.raw_payload?.milestones || [],
        values: normalizedValues,
        differentiators: { whileOthers: [], weAreTheOnly: [] },
      };

      await updatePositioningDocumentForProject(projectId, mergedPayload);
      setSelectedValues([]);
      if (refreshData) await refreshData();
      toast.success('Values regenerated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to regenerate values');
    } finally {
      setIsRegenerating(false);
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Brand Values</h2>
        <Button
          variant="outline"
          className="border-cyan text-cyan hover:bg-cyan/10"
          onClick={handleRegenerate}
          disabled={isRegenerating || isAdvancing}
        >
          {isRegenerating ? 'Generating...' : 'Regenerate'}
        </Button>
      </div>
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
        <div className="font-medium text-green-500">
          {selectedValues.length} selected
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
        {isAdvancing && !hasExistingDifferentiators && (
          <div className="text-sm text-muted-foreground mb-2">Generating...</div>
        )}
        <Button
          onClick={handleComplete}
          className="bg-white text-black hover:bg-gray-100 transition-colors"
          disabled={!isComplete || isAdvancing}
        >
          {hasExistingDifferentiators ? 'Next' : 'Complete & Continue'}
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