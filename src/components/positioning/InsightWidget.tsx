import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Loader2, RefreshCw, Info, ThumbsUp, AlertTriangle, AlertOctagon, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInsightFromOpenAI, InsightAgentResponse } from '@/services/openaiService';
import { addInsight, getLatestInsights, Insight } from '@/services/insightService';
import { usePositioningData } from './PositioningDataProvider';
import { usePositioning } from '@/contexts/PositioningContext';

interface InsightWidgetProps {
  currentStep: string;
  completedSteps: string[];
  projectId: string;
  brief: string;
}

const mainSteps = ['golden-circle', 'opportunities-challenges', 'values', 'roadmap', 'differentiators', 'statements'];

const typeLabelMap: Record<string, string> = {
  contradiction: 'Contradiction',
  tip: 'Tip',
  'cliché-alert': 'Cliché Alert',
  redundant: 'Redundant',
  praise: 'Praise',
  'fresh-angle': 'Fresh Angle',
};

const typeIconMap: Record<string, React.ReactNode> = {
  contradiction: <AlertOctagon className="h-6 w-6 text-red-500" />, // red
  tip: <Info className="h-6 w-6 text-gray-300" />, // gray (low priority)
  'cliché-alert': <Info className="h-6 w-6 text-yellow-300" />, // yellow
  redundant: <RefreshCw className="h-6 w-6 text-blue-400" />, // blue
  praise: <ThumbsUp className="h-6 w-6 text-green-400" />, // green
  'fresh-angle': <Lightbulb className="h-6 w-6 text-cyan-400" />, // cyan
};

const sectionLabelMap: Record<string, string> = {
  'golden-circle': 'Golden Circle',
  'opportunities-challenges': 'Opportunities',
  'values': 'Values',
  'roadmap': 'Roadmap',
  'differentiators': 'Differentiators',
  'statements': 'Statements',
  'brief': 'Brief',
  'challenge': 'Challenges',
  'opportunity': 'Opportunities',
  'milestone': 'Milestone',
  'value': 'Value',
  'while_others': 'While Others',
  'we_are_the_only': 'We Are The Only',
};

// Helper to build OpenAI context JSON from hooks
function useInsightContextBuilder(brief: string) {
  const data = usePositioningData();
  const positioning = usePositioning();

  return (section: string) => {
    // Map section to OpenAI schema section
    const sectionMap: Record<string, string> = {
      'golden-circle': 'WHAT',
      'opportunities-challenges': 'OPPORTUNITY',
      'values': 'VALUE',
      'roadmap': 'MILESTONE',
      'differentiators': 'WE_ARE_THE_ONLY',
      'statements': 'STATEMENT',
    };
    const currentSection = sectionMap[section] || section.toUpperCase();

    // Build available and selected
    const available: any = {
      WHAT: data.whatStatements?.map(i => ({ id: i.id, content: i.content })) || [],
      HOW: data.howStatements?.map(i => ({ id: i.id, content: i.content })) || [],
      WHY: data.whyStatements?.map(i => ({ id: i.id, content: i.content })) || [],
      OPPORTUNITY: data.opportunities?.map(i => ({ id: i.id, content: i.content })) || [],
      CHALLENGE: data.challenges?.map(i => ({ id: i.id, content: i.content })) || [],
      MILESTONE: data.milestones?.map(i => ({ id: i.id, content: i.content })) || [],
      VALUE: data.values?.map(i => ({ id: i.id, title: i.content, blurb: i.extra_json?.blurb || '' })) || [],
      WHILE_OTHERS: data.whileOthers?.map(i => ({ id: i.id, content: i.content })) || [],
      WE_ARE_THE_ONLY: data.weAreTheOnly?.map(i => ({ id: i.id, content: i.content })) || [],
    };
    const selected: any = {
      WHAT: data.whatStatements?.filter(i => i.state === 'selected').map(i => i.id) || [],
      HOW: data.howStatements?.filter(i => i.state === 'selected').map(i => i.id) || [],
      WHY: data.whyStatements?.filter(i => i.state === 'selected').map(i => i.id) || [],
      OPPORTUNITY: data.opportunities?.filter(i => i.state === 'selected').map(i => i.id) || [],
      CHALLENGE: data.challenges?.filter(i => i.state === 'selected').map(i => i.id) || [],
      MILESTONE: data.milestones?.filter(i => i.state === 'selected').map(i => i.id) || [],
      VALUE: data.values?.filter(i => i.state === 'selected').map(i => i.id) || [],
      WHILE_OTHERS: data.whileOthers?.filter(i => i.state === 'selected').map(i => i.id) || [],
      WE_ARE_THE_ONLY: data.weAreTheOnly?.filter(i => i.state === 'selected').map(i => i.id) || [],
    };
    return {
      brief,
      currentSection,
      available,
      selected,
    };
  };
}

const InsightWidget: React.FC<InsightWidgetProps> = ({ currentStep, completedSteps, projectId, brief }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const prevCompletedSteps = useRef<string[]>(completedSteps);

  const buildContext = useInsightContextBuilder(brief);

  // Fetch latest insights from Supabase
  const fetchInsights = async () => {
    if (!projectId) return;
    const data = await getLatestInsights(projectId, 'positioning', 10);
    setInsights(data);
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    if (isMuted) return;
    const prevSet = new Set(prevCompletedSteps.current);
    const newSteps = completedSteps.filter(
      step => mainSteps.includes(step) && !prevSet.has(step)
    );
    if (newSteps.length > 0) {
      const stepToTrigger = newSteps[newSteps.length - 1];
      // Trigger OpenAI here
      (async () => {
        setIsThinking(true);
        const contextJson = buildContext(stepToTrigger);
        try {
          const aiResult: InsightAgentResponse = await getInsightFromOpenAI(contextJson);
          await addInsight({
            project_id: projectId,
            type: 'positioning',
            insight_type: aiResult.type,
            message: aiResult.message,
            insight_references: aiResult.references,
            section: stepToTrigger,
          });
          await fetchInsights();
        } catch (e) {
          console.error('Insight agent error:', e);
        }
        setIsThinking(false);
      })();
    }
    prevCompletedSteps.current = completedSteps;
    // eslint-disable-next-line
  }, [completedSteps, isMuted]);

  // Manual refresh for current section
  const handleRefresh = async () => {
    if (isThinking || refreshing || !projectId || isMuted) return;
    setRefreshing(true);
    setIsThinking(true);
    const contextJson = buildContext(currentStep);
    try {
      const aiResult: InsightAgentResponse = await getInsightFromOpenAI(contextJson);
      await addInsight({
        project_id: projectId,
        type: 'positioning',
        insight_type: aiResult.type,
        message: aiResult.message,
        insight_references: aiResult.references,
        section: currentStep,
      });
      await fetchInsights();
    } catch (e) {
      console.error('Insight agent error:', e);
    }
    setIsThinking(false);
    setRefreshing(false);
  };

  const latestInsight = insights[0];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Insight Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Lightbulb className="h-5 w-5" />
        {insights.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </Button>

      {/* Insights Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-14 right-0 w-80 bg-black/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Insights</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="mute-insights"
                  checked={isMuted}
                  onChange={e => setIsMuted(e.target.checked)}
                  className="accent-yellow-400 w-4 h-4 rounded focus:ring-2 focus:ring-yellow-400"
                />
                <label htmlFor="mute-insights" className="text-xs text-white/80 select-none cursor-pointer">Mute Insights</label>
                {isMuted && <span className="text-xs text-yellow-400 ml-2">(No new tips or popups)</span>}
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {typeIconMap[insight.insight_type]}
                      <span className={`text-xs font-semibold rounded px-2 py-0.5 ${
                        insight.insight_type === 'contradiction' ? 'bg-red-900 text-red-300' :
                        insight.insight_type === 'tip' ? 'bg-gray-800 text-gray-200' :
                        insight.insight_type === 'cliché-alert' ? 'bg-yellow-900 text-yellow-300' :
                        insight.insight_type === 'redundant' ? 'bg-blue-900 text-blue-300' :
                        insight.insight_type === 'praise' ? 'bg-green-900 text-green-300' :
                        insight.insight_type === 'fresh-angle' ? 'bg-yellow-400 text-yellow-950' :
                        'bg-gray-800 text-gray-200'
                      }`}>{typeLabelMap[insight.insight_type]}</span>
                      <span className="text-xs font-semibold rounded px-2 py-0.5 bg-gray-800 text-gray-200">
                        {sectionLabelMap[insight.section] || insight.section}
                      </span>
                    </div>
                    <p className="text-sm text-white/90 whitespace-pre-line">{insight.message}</p>
                    <p className="text-xs text-white/50 mt-2">{new Date(insight.created_at).toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latest Insight Tooltip or Thinking Indicator */}
      <AnimatePresence>
        {!isOpen && (isThinking || latestInsight) && !isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-14 right-0 w-72 bg-black/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 p-3 flex items-center justify-between"
          >
            {isThinking ? (
              <div className="flex items-center gap-2 w-full">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                <p className="text-sm text-white/90">Thinking...</p>
              </div>
            ) : latestInsight ? (
              <div className="flex items-start">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {typeIconMap[latestInsight.insight_type]}
                    <span className={`text-xs font-semibold rounded px-2 py-0.5 ${
                      latestInsight.insight_type === 'contradiction' ? 'bg-red-900 text-red-300' :
                      latestInsight.insight_type === 'tip' ? 'bg-gray-800 text-gray-200' :
                      latestInsight.insight_type === 'cliché-alert' ? 'bg-yellow-900 text-yellow-300' :
                      latestInsight.insight_type === 'redundant' ? 'bg-blue-900 text-blue-300' :
                      latestInsight.insight_type === 'praise' ? 'bg-green-900 text-green-300' :
                      latestInsight.insight_type === 'fresh-angle' ? 'bg-yellow-400 text-yellow-950' :
                      'bg-gray-800 text-gray-200'
                    }`}>{typeLabelMap[latestInsight.insight_type]}</span>
                    <span className="text-xs font-semibold rounded px-2 py-0.5 bg-gray-800 text-gray-200">
                      {sectionLabelMap[latestInsight.section] || latestInsight.section}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 whitespace-pre-line">{latestInsight.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-yellow-300 hover:text-yellow-400 ml-2 mt-1"
                  onClick={handleRefresh}
                  disabled={isThinking || refreshing}
                  tabIndex={-1}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsightWidget; 