import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { Edit } from "lucide-react";
import {
  generateGoldenCircle,
  generateRemainingPositioningSections,
} from '@/services/openaiService';
import * as positioningService from '@/services/positioningService';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { replacePositioningDocumentForProject } from '@/services/positioningService';

interface BriefIntakeProps {
  onComplete?: () => void;
  isValid?: boolean;
}

const BriefIntake: React.FC<BriefIntakeProps> = ({ onComplete, isValid = false }) => {
  const { briefContext, setBriefContext, completeStep, completedSteps } = useContext(PositioningContext);
  const { brief, isLoading, refreshData, projectId } = usePositioningData();
  
  const [wordCount, setWordCount] = useState(() => {
    return briefContext.trim().split(/\s+/).filter(Boolean).length;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const isBriefCompleted = briefContext.trim().length > 0 && completedSteps.includes("brief");
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [hasExistingDoc, setHasExistingDoc] = useState(false);

  useEffect(() => {
    if (!isBriefCompleted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isBriefCompleted]);
  
  // Initialize brief from database
  useEffect(() => {
    if (!isLoading && brief && !briefContext) {
      setBriefContext(brief);
      setWordCount(countWords(brief));
    }
  }, [isLoading, brief, briefContext, setBriefContext]);
  
  // Update word count when briefContext changes
  useEffect(() => {
    setWordCount(countWords(briefContext));
  }, [briefContext]);
  
  // Remove 'brief' from completedSteps if brief is empty
  useEffect(() => {
    if (briefContext.trim().length === 0 && completedSteps.includes("brief")) {
      // Remove 'brief' from completedSteps
      const idx = completedSteps.indexOf("brief");
      if (idx !== -1) {
        completedSteps.splice(idx, 1);
      }
    }
  }, [briefContext, completedSteps]);
  
  // Check if a document exists for this project
  useEffect(() => {
    async function checkDoc() {
      if (!projectId) return;
      const doc = await positioningService.getLatestPositioningDocument(projectId);
      setHasExistingDoc(!!doc);
    }
    checkDoc();
  }, [projectId]);
  
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBriefContext(text);
    setWordCount(countWords(text));
  };
  
  const handleGenerateIdeas = async () => {
    if (hasExistingDoc) {
      setShowWarning(true);
      return;
    }
    await generateGoldenCircleOnly();
  };

  const generateGoldenCircleOnly = async () => {
    setError(null);
    setLoading(true);
    try {
      const aiJson = await generateGoldenCircle(briefContext);
      const payload = {
        brief: briefContext,
        whatStatements: aiJson.whatStatements || [],
        howStatements: aiJson.howStatements || [],
        whyStatements: aiJson.whyStatements || [],
        opportunities: [],
        challenges: [],
        milestones: [],
        values: [],
        differentiators: {
          whileOthers: [],
          weAreTheOnly: [],
        },
      };
      await replacePositioningDocumentForProject(projectId, payload);
      if (refreshData) await refreshData();
      if (onComplete) {
        onComplete();
      } else if (completeStep) {
        completeStep("brief");
      }
      setIsEditing(false);
      setHasExistingDoc(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRest = async () => {
    setError(null);
    setLoading(true);
    try {
      const latest = await positioningService.getLatestPositioningDocument(projectId);
      const goldenCircle = latest?.raw_payload || {};
      const rest = await generateRemainingPositioningSections(
        briefContext,
        {
          whatStatements: goldenCircle.whatStatements,
          howStatements: goldenCircle.howStatements,
          whyStatements: goldenCircle.whyStatements,
        }
      );
      const merged = {
        ...goldenCircle,
        brief: briefContext,
        opportunities: rest.opportunities || [],
        challenges: rest.challenges || [],
        milestones: rest.milestones || [],
        values: rest.values || [],
        differentiators: {
          whileOthers: rest.differentiators?.whileOthers || [],
          weAreTheOnly: rest.differentiators?.weAreTheOnly || [],
        },
      };
      await replacePositioningDocumentForProject(projectId, merged);
      if (refreshData) await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to generate remaining sections.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Optionally, reload the brief from the DB to revert any unsaved changes
    if (brief) setBriefContext(brief);
  };
  
  return (
    <div className="max-w-[800px] mx-auto">
      <motion.h2
        className="text-[24px] font-bold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        One paragraph to rule them all
      </motion.h2>
      
      <motion.p
        className="text-[16px] text-gray-600 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Tell us what you're building in 300 words or fewer.
      </motion.p>
      
      {(isBriefCompleted || brief) && !isEditing ? (
        // Non-editable view when brief is completed or exists and not editing
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="w-full min-h-[180px] p-4 text-[16px] bg-muted/20 rounded-md border border-border/30">
            {briefContext}
          </div>
          
          <div className="mt-6 text-right">
            <Button
              onClick={handleEdit}
              className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Brief
            </Button>
          </div>
        </motion.div>
      ) : (
        // Editable view (always show textarea if not completed or if editing)
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {(!briefContext || briefContext.trim() === '') && (
            <div className="mb-2 text-muted-foreground text-center">
              Start by writing a one-paragraph summary of your project.
            </div>
          )}
          <div className="relative mb-16">
            <Textarea 
              ref={textareaRef}
              value={briefContext}
              onChange={handleInputChange}
              placeholder="E.g. An AI-powered platform that…"
              className="w-full min-h-[180px] p-4 text-[16px]"
              maxLength={4000}
              autoFocus
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              {wordCount}/300 words
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-gray-300 text-white"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleGenerateIdeas}
              className="bg-cyan text-black border border-cyan hover:bg-cyan/90 shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? 'Generating…' : 'Generate Ideas'}
            </Button>
          </div>
          {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
          {showWarning && (
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
              <DialogContent>
                <DialogTitle>Warning: This will erase all your progress</DialogTitle>
                <div className="py-2 text-sm text-gray-700">
                  Generating new ideas will delete all your current progress in this module. Are you sure you want to proceed?
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowWarning(false)} disabled={loading}>Cancel</Button>
                  <Button variant="destructive" onClick={async () => { setShowWarning(false); await generateGoldenCircleOnly(); }} disabled={loading}>
                    {loading ? 'Regenerating…' : 'Yes, Regenerate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BriefIntake;