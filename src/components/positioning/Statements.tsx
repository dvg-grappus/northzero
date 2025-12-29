import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PositioningContext } from "@/contexts/PositioningContext";
import { usePositioningData } from "./PositioningDataProvider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shuffle } from "lucide-react";
import { useProjects } from '@/contexts/ProjectsContext';
import { generatePositioningStatementsJson } from '@/services/openaiService';
import { savePositioningStatements, createStatementItemsFromAI, getPositioningStatements, getLatestPositioningDocument } from '@/services/positioningService';
import { supabase } from '@/lib/supabase';

interface TokenChipProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TokenChip: React.FC<TokenChipProps> = ({ 
  text, 
  isSelected, 
  onClick,
  disabled = false
}) => {
  return (
    <motion.button
      className={`px-3 py-2 text-sm font-medium transition-all border ${
        isSelected 
          ? "bg-primary text-primary-foreground border-primary" 
          : disabled 
            ? "bg-muted text-muted-foreground cursor-not-allowed border-muted" 
            : "bg-background hover:bg-accent text-foreground border-border"
      }`}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
    >
      {text}
    </motion.button>
  );
};

interface StatementPart {
  category: string;
  options: string[];
}

interface TokenSelectProps {
  category: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ category, options, selected, onSelect }) => (
  <div className="mb-6">
    <h3 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant={selected === option ? "default" : "outline"}
          className={`text-sm border rounded-none ${selected === option ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent text-foreground border-border"}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  </div>
);

interface StatementsProps {
  onComplete?: () => void;
}

const Statements: React.FC<StatementsProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { 
    whatStatements,
    howStatements,
    whyStatements,
    opportunities,
    challenges,
    milestones,
    values,
    whileOthers,
    weAreTheOnly,
    isLoading: isLoadingData,
    updateItemState,
    refreshData,
    projectId
  } = usePositioningData();
  
  const { 
    selectedGoldenCircle,
    internalStatement,
    setInternalStatement,
    selectedExternalStatement,
    setSelectedExternalStatement,
    setPositioningComplete,
    completedSteps,
    briefContext,
    selectedOpportunities,
    selectedChallenges,
    roadmapMilestones,
    selectedValues,
    pinnedDifferentiators,
    completeStep
  } = useContext(PositioningContext);
  
  const { isSupabaseConnected } = useProjects();
  
  const [activeTab, setActiveTab] = useState<string>("internal");
  
  const [tokenOptions, setTokenOptions] = useState<Record<string, string[]>>({
    WHAT: [],
    HOW: [],
    WHO: ["innovators", "creative thinkers"],
    WHERE: ["professional environments", "creative workspaces"],
    WHY: [],
    WHEN: ["rapid digital transformation", "growing design awareness"]
  });

  // --- New state for external options and selection ---
  const [externalOptions, setExternalOptions] = useState<Record<string, string[]>>({
    PROPOSITION: [],
    BENEFIT: [],
    OUTCOME: []
  });
  const [externalStatement, setExternalStatement] = useState<Record<string, string>>({
    PROPOSITION: '',
    BENEFIT: '',
    OUTCOME: ''
  });
  const [statementId, setStatementId] = useState<string | null>(null);

  const handleTokenSelect = async (type: string, token: string) => {
    setInternalStatement(prev => ({ ...prev, [type]: token }));
    // Save to DB instantly
    if (statementId) {
      const { data: items } = await supabase
        .from('positioning_items')
        .select('*')
        .eq('statement_id', statementId)
        .eq('item_type', `STATEMENT_${type}`);
      if (items && items.length > 0) {
        for (const item of items) {
          const newState = item.content === token ? 'selected' : 'draft';
          if (item.state !== newState) {
            await supabase
              .from('positioning_items')
              .update({ state: newState })
              .eq('id', item.id);
          }
        }
      }
      // Fetch all selected internal slots for this statement
      const internalSlots = ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'];
      const { data: allItems } = await supabase
        .from('positioning_items')
        .select('*')
        .eq('statement_id', statementId);
      const selected: Record<string, string> = {};
      internalSlots.forEach(slot => {
        const slotItems = (allItems || []).filter(i => i.item_type === `STATEMENT_${slot}`);
        const sel = slotItems.find(i => i.state === 'selected');
        if (sel) selected[slot] = sel.content;
        else if (slotItems.length > 0) selected[slot] = slotItems[0].content;
        else selected[slot] = '';
      });
      // Rebuild the internal statement string
      const template = "The only WHAT that HOW for WHO mostly in WHERE because WHY in an era of WHEN.";
      const internalStatementStr = template.replace(/WHAT|HOW|WHO|WHERE|WHY|WHEN/g, match => selected[match] || `[${match}]`);
      // Update the statements_json.internal.statement field
      const { data: statementRows, error: statementError } = await supabase
        .from('positioning_statements')
        .select('statements_json')
        .eq('id', statementId)
        .maybeSingle();
      if (statementRows && statementRows.statements_json) {
        const newStatementsJson = {
          ...statementRows.statements_json,
          internal: {
            ...statementRows.statements_json.internal,
            statement: internalStatementStr
          }
        };
        await supabase
          .from('positioning_statements')
          .update({ statements_json: newStatementsJson })
          .eq('id', statementId);
      }
    }
  };
  
  const shuffleInternalStatement = async () => {
    const newStatement: Record<string, string> = {};
    for (const [type, tokens] of Object.entries(tokenOptions)) {
      if (tokens.length > 0) {
        const randomIndex = Math.floor(Math.random() * tokens.length);
        newStatement[type] = tokens[randomIndex];
      }
    }
    setInternalStatement(newStatement);
    // Save all shuffled selections to DB
    if (statementId) {
      for (const [type, token] of Object.entries(newStatement)) {
        const { data: items } = await supabase
          .from('positioning_items')
          .select('*')
          .eq('statement_id', statementId)
          .eq('item_type', `STATEMENT_${type}`);
        if (items && items.length > 0) {
          for (const item of items) {
            const newState = item.content === token ? 'selected' : 'draft';
            if (item.state !== newState) {
              await supabase
                .from('positioning_items')
                .update({ state: newState })
                .eq('id', item.id);
            }
          }
        }
      }
    }
  };
  
  const getFormattedInternalStatement = () => {
    const template = "The only WHAT that HOW for WHO mostly in WHERE because WHY in an era of WHEN.";
    
    return template.replace(/WHAT|HOW|WHO|WHERE|WHY|WHEN/g, match => {
      return internalStatement[match] || `[${match}]`;
    });
  };

  // On mount, fetch latest positioning_statements and items for this project
  useEffect(() => {
    (async () => {
      if (!projectId) return;
      const statementRow = await getPositioningStatements(projectId);
      if (statementRow && statementRow.id) {
        setStatementsGenerated(true);
        setAiResult(statementRow.statements_json);
        setStatementId(statementRow.id);
        
        // Fetch all positioning_items for this statement
        const { data: items, error } = await supabase
          .from('positioning_items')
          .select('*')
          .eq('statement_id', statementRow.id);
        if (!error && items) {
          // Internal
          const internal: Record<string, string> = {};
          const newTokenOptions: Record<string, string[]> = {};
          ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'].forEach(slot => {
            const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
            newTokenOptions[slot] = slotItems.map(i => i.content);
            const selected = slotItems.find(i => i.state === 'selected');
            if (selected) internal[slot] = selected.content;
            else if (slotItems.length > 0) internal[slot] = slotItems[0].content;
            else internal[slot] = '';
          });
          setTokenOptions(prev => ({ ...prev, ...newTokenOptions }));
          setInternalStatement(internal);
          // External
          const extOpts: Record<string, string[]> = {};
          const extSel: Record<string, string> = {};
          ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
            const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
            extOpts[slot] = slotItems.map(i => i.content);
            const selected = slotItems.find(i => i.state === 'selected');
            if (selected) extSel[slot] = selected.content;
          });
          setExternalOptions(extOpts);
          setExternalStatement(extSel);
          // Also update context for external statement (for parent completion logic)
          if (extSel.PROPOSITION && extSel.BENEFIT && extSel.OUTCOME) {
            setSelectedExternalStatement(extSel.PROPOSITION); // fallback: set to PROPOSITION
          } else {
            setSelectedExternalStatement('');
          }
        }
      }
    })();
  }, [projectId]);

  // Track if statements have been generated
  const [statementsGenerated, setStatementsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  // Add the effect to populate external options and selection from aiResult after their declarations
  useEffect(() => {
    if (aiResult && statementsGenerated) {
      // Internal slots (already handled)
      // External slots
      const extOpts: Record<string, string[]> = {};
      const extSel: Record<string, string> = {};
      ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
        const slotData = aiResult.external?.[slot];
        if (slotData) {
          extOpts[slot] = [slotData.preferred, ...(slotData.alternatives || [])];
          extSel[slot] = slotData.preferred;
        }
      });
      setExternalOptions(extOpts);
      setExternalStatement(extSel);
    }
  }, [aiResult, statementsGenerated]);

  // Handle selection for external statement
  const handleSelectExternalPart = async (category: string, value: string) => {
    setExternalStatement(prev => ({ ...prev, [category]: value }));
    // Save to DB instantly
    if (statementId) {
      const { data: items } = await supabase
        .from('positioning_items')
        .select('*')
        .eq('statement_id', statementId)
        .eq('item_type', `STATEMENT_${category}`);
      if (items && items.length > 0) {
        for (const item of items) {
          const newState = item.content === value ? 'selected' : 'draft';
          if (item.state !== newState) {
            await supabase
              .from('positioning_items')
              .update({ state: newState })
              .eq('id', item.id);
          }
        }
      }
    }
  };

  // Generate the preview statement for external positioning
  const previewExternalStatement =
    externalStatement.PROPOSITION && externalStatement.BENEFIT && externalStatement.OUTCOME
      ? `${externalStatement.PROPOSITION} that ${externalStatement.BENEFIT} so you achieve ${externalStatement.OUTCOME}.`
      : "Complete your statement by selecting one option from each category...";
  
  const handleSelectInternal = async (type: string, statement: string) => {
    // Find the correct statement object by type and content
    let items = [];
    if (type === 'WHAT') items = whatStatements;
    else if (type === 'HOW') items = howStatements;
    else if (type === 'WHY') items = whyStatements;
    const item = items.find(s => s.content === statement);
    if (!item) return;
    const newState = item.state === 'selected' ? 'draft' : 'selected';
    await updateItemState(item.id, newState);
    setInternalStatement(prev => ({ ...prev, [type]: prev[type] === statement ? '' : statement }));
  };

  const handleSelectExternal = async (statement: string) => {
    // For external, you may need to store the selected statement in a custom way, or skip DB update if not supported
    setSelectedExternalStatement(prev => prev === statement ? '' : statement);
  };

  // At the start of the component render
  const allTokensEmpty =
    tokenOptions.WHAT.length === 0 &&
    tokenOptions.HOW.length === 0 &&
    tokenOptions.WHY.length === 0 &&
    (!tokenOptions.WHO || tokenOptions.WHO.length === 0) &&
    (!tokenOptions.WHERE || tokenOptions.WHERE.length === 0) &&
    (!tokenOptions.WHEN || tokenOptions.WHEN.length === 0);

  // Use the same completion logic as PositioningPage
  const isBriefComplete = briefContext.trim().length > 0;
  const isGoldenCircleComplete = selectedGoldenCircle.what.length > 0 && selectedGoldenCircle.how.length > 0 && selectedGoldenCircle.why.length > 0;
  const selectedWhileOthers = whileOthers.filter(w => w.state === 'selected').map(w => w.content);
  const selectedWeAreTheOnly = weAreTheOnly.filter(w => w.state === 'selected').map(w => w.content);
  const selectedValueTitles = values.filter(v => v.state === 'selected').map(v => v.content);
  const isOpportunitiesChallengesComplete = selectedOpportunities.length > 0;
  const timelinePoints = ["Now", "1 yr"];
  const isRoadmapComplete = timelinePoints.every(point => Array.isArray(roadmapMilestones[point]) && roadmapMilestones[point].length > 0);
  const isValuesComplete = selectedValueTitles.length >= 1;
  const isDifferentiatorsComplete = selectedWhileOthers.length >= 1 && selectedWeAreTheOnly.length >= 1;
  const allStepsComplete = isBriefComplete && isGoldenCircleComplete && isOpportunitiesChallengesComplete && isRoadmapComplete && isValuesComplete && isDifferentiatorsComplete;

  const handleGenerateStatements = async () => {
    console.log('[DEBUG] handleGenerateStatements CALLED');
    if (isLoading || !allStepsComplete) {
      console.log('[DEBUG] Early return - isLoading:', isLoading, 'allStepsComplete:', allStepsComplete);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Build input JSON
      const inputJson: any = {
        brief: briefContext,
        what: whatStatements.filter(s => s.state === 'selected').map(s => s.content),
        how: howStatements.filter(s => s.state === 'selected').map(s => s.content),
        why: whyStatements.filter(s => s.state === 'selected').map(s => s.content),
        opportunities: opportunities.filter(o => o.state === 'selected').map(o => o.content),
        challenges: challenges.filter(c => c.state === 'selected').map(c => c.content),
        milestones: milestones
          .filter(m => m.state === 'selected')
          .map(m => ({
            content: m.content,
            slot: m.slot,
          })),
        values: values
          .filter(v => v.state === 'selected')
          .map(v => ({
            title: v.content,
            blurb: v.extra_json?.blurb || '',
          })),
        differentiators: {
          whileOthers: whileOthers.filter(w => w.state === 'selected').map(w => w.content),
          weAreTheOnly: weAreTheOnly.filter(w => w.state === 'selected').map(w => w.content),
        },
      };
      console.log('[DEBUG] Built inputJson:', JSON.stringify(inputJson, null, 2));
      // Call OpenAI (statements prompt)
      const aiJson = await generatePositioningStatementsJson(inputJson);
      console.log('[DEBUG] Received aiJson from API:', JSON.stringify(aiJson, null, 2));
      console.log('[DEBUG] aiJson.internal:', aiJson?.internal);
      console.log('[DEBUG] aiJson.external:', aiJson?.external);
      setAiResult(aiJson);
      // Save to positioning_statements table
      let saved;
      try {
        saved = await savePositioningStatements(projectId, aiJson);
      } catch (dbErr: any) {
        toast.error('Failed to save statements to DB: ' + (dbErr.message || dbErr.toString()));
        throw dbErr;
      }
      // Seed positioning_items for statements
      console.log('[DEBUG] saved object:', saved);
      if (saved && saved.id) {
        console.log('[DEBUG] saved.id exists:', saved.id);
        // Fetch latest positioning_documents row for this project
        const latestDoc = await getLatestPositioningDocument(projectId);
        console.log('[DEBUG] latestDoc:', latestDoc);
        if (latestDoc && latestDoc.id) {
          console.log('[DEBUG] Calling createStatementItemsFromAI with:', saved.id, latestDoc.id, projectId);
          await createStatementItemsFromAI(saved.id, latestDoc.id, projectId, aiJson);
        } else {
          console.error('[DEBUG] No positioning document found for project when seeding statement items.');
        }
        // Immediately fetch new statement items from DB and update UI state
        console.log('[DEBUG] Fetching statement items from DB for statement_id:', saved.id);
        const { data: items, error } = await supabase
          .from('positioning_items')
          .select('*')
          .eq('statement_id', saved.id);
        console.log('[DEBUG] Fetched items from DB:', items);
        console.log('[DEBUG] Fetch error:', error);
        if (!error && items) {
          console.log('[DEBUG] Processing', items.length, 'items from DB');
          // Internal
          const internal: Record<string, string> = {};
          const newTokenOptions: Record<string, string[]> = {};
          ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'].forEach(slot => {
            const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
            console.log(`[DEBUG] Internal slot ${slot}: found`, slotItems.length, 'items');
            newTokenOptions[slot] = slotItems.map(i => i.content);
            const selected = slotItems.find(i => i.state === 'selected');
            if (selected) internal[slot] = selected.content;
            else if (slotItems.length > 0) internal[slot] = slotItems[0].content;
            else internal[slot] = '';
          });
          console.log('[DEBUG] newTokenOptions:', newTokenOptions);
          console.log('[DEBUG] internal selections:', internal);
          setTokenOptions(prev => ({ ...prev, ...newTokenOptions }));
          setInternalStatement(internal);
          // External
          const extOpts: Record<string, string[]> = {};
          const extSel: Record<string, string> = {};
          ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
            const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
            console.log(`[DEBUG] External slot ${slot}: found`, slotItems.length, 'items');
            extOpts[slot] = slotItems.map(i => i.content);
            const selected = slotItems.find(i => i.state === 'selected');
            if (selected) extSel[slot] = selected.content;
          });
          console.log('[DEBUG] extOpts:', extOpts);
          console.log('[DEBUG] extSel:', extSel);
          setExternalOptions(extOpts);
          setExternalStatement(extSel);
          // Also update context for external statement (for parent completion logic)
          if (extSel.PROPOSITION && extSel.BENEFIT && extSel.OUTCOME) {
            setSelectedExternalStatement(extSel.PROPOSITION); // fallback: set to PROPOSITION
          } else {
            setSelectedExternalStatement('');
          }
        } else {
          console.error('[DEBUG] No items found or error fetching items');
        }
      } else {
        console.error('[DEBUG] saved or saved.id is missing');
      }
      // Refresh UI
      await refreshData();
      setStatementsGenerated(true);
      
      // Call onComplete after successful generation
      // if (onComplete) {
      //   onComplete();
      // } else if (completeStep) {
      //   completeStep("statements");
      // }
    } catch (err: any) {
      setError(err.message || 'Failed to generate statements');
    } finally {
      setIsLoading(false);
    }
  };

  // Shuffle handler for external positioning
  const shuffleExternalStatement = async () => {
    const newParts: Record<string, string> = {};
    ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
      const options = externalOptions[slot] || [];
      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        newParts[slot] = options[randomIndex];
      }
    });
    setExternalStatement(newParts);
    // Save all shuffled selections to DB
    if (statementId) {
      for (const [slot, value] of Object.entries(newParts)) {
        const { data: items } = await supabase
          .from('positioning_items')
          .select('*')
          .eq('statement_id', statementId)
          .eq('item_type', `STATEMENT_${slot}`);
        if (items && items.length > 0) {
          for (const item of items) {
            const newState = item.content === value ? 'selected' : 'draft';
            if (item.state !== newState) {
              await supabase
                .from('positioning_items')
                .update({ state: newState })
                .eq('id', item.id);
            }
          }
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Positioning Statements</h2>
        <Button
          variant="outline"
          className="border-cyan text-cyan hover:bg-cyan/10"
          onClick={handleGenerateStatements}
          disabled={!allStepsComplete || isLoading}
        >
          {isLoading ? 'Generating...' : statementsGenerated ? 'Regenerate' : 'Generate Statements'}
        </Button>
      </div>
      {!statementsGenerated && (
        <div className="text-center text-muted-foreground mb-6">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : allStepsComplete
            ? "Great selections! We're ready to generate."
            : "Please complete all the steps above to generate your final positioning statements."}
        </div>
      )}
      {/* Only show statement content and Complete & Continue CTA if statements have been generated */}
      {statementsGenerated && (
        <>
          <div className="col-span-12">
            <motion.p
              className="text-gray-500 text-sm mb-1 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Lock words that rally your team and convince the world.
            </motion.p>
            {/* Removed static OpenAI output rendering here. Now only interactive UI below. */}
            <div className="flex justify-between items-center mb-2">
              {/* Removed duplicate large heading here */}
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="internal">Internal Positioning</TabsTrigger>
                <TabsTrigger value="external">External Positioning</TabsTrigger>
              </TabsList>
              <TabsContent value="internal">
                <motion.section
                  className="bg-card p-6 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Internal Positioning</h2>
                    <Button 
                      onClick={shuffleInternalStatement} 
                      variant="outline"
                      className="flex items-center gap-2 bg-background text-foreground hover:bg-accent border border-border"
                    >
                      <Shuffle className="h-4 w-4" />
                      <span>Shuffle</span>
                    </Button>
                  </div>
                  {/* Preview at the top */}
                  <div className="bg-muted/50 p-4 rounded-md mb-6">
                    <p className="text-lg text-foreground">
                      {getFormattedInternalStatement()}
                    </p>
                  </div>
                  <div className="space-y-4 mb-6">
                    {Object.entries(tokenOptions).map(([type, tokens]) => (
                      <div key={type} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-sm text-muted-foreground">{type}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tokens.map((token, idx) => (
                            <TokenChip 
                              key={idx} 
                              text={token} 
                              isSelected={internalStatement[type] === token}
                              onClick={() => handleTokenSelect(type, token)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </TabsContent>
              <TabsContent value="external">
                <motion.section
                  className="bg-card p-6 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-foreground">External Positioning</h2>
                    <Button
                      onClick={shuffleExternalStatement}
                      variant="outline"
                      className="flex items-center gap-2 bg-background text-foreground hover:bg-accent border border-border"
                    >
                      <Shuffle className="h-4 w-4" />
                      <span>Shuffle</span>
                    </Button>
                  </div>
                  {/* Preview at the top */}
                  <div className="mb-6 p-4 rounded-md bg-muted/50">
                    <p className="text-lg font-medium text-foreground">
                      {previewExternalStatement}
                    </p>
                  </div>
                  {['PROPOSITION', 'BENEFIT', 'OUTCOME'].map((slot) => (
                    <TokenSelect
                      key={slot}
                      category={slot}
                      options={externalOptions[slot] || []}
                      selected={externalStatement[slot] || ""}
                      onSelect={(value) => handleSelectExternalPart(slot, value)}
                    />
                  ))}
                </motion.section>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default Statements;