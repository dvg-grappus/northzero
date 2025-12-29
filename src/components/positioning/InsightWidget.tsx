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
  'hot-tip': 'Hot Tip',
  'cliché-alert': 'Cliché Alert',
  praise: 'Praise',
};

const typeIconMap: Record<string, React.ReactNode> = {
  contradiction: <AlertOctagon className="h-6 w-6 text-red-500" />, // red
  'hot-tip': <Info className="h-6 w-6 text-orange-400" />, // orange
  'cliché-alert': <Info className="h-6 w-6 text-yellow-300" />, // yellow
  praise: <ThumbsUp className="h-6 w-6 text-green-400" />, // green
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
  // Kill switch: keep icon visible, disable auto calls and popout
  const ASSISTANT_DISABLED = true;
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const prevCompletedSteps = useRef<string[]>(completedSteps);

  const buildContext = useInsightContextBuilder(brief);

  // Fetch latest insights from Supabase
  const fetchInsights = async () => {
    if (ASSISTANT_DISABLED) return;
    if (!projectId) return;
    const data = await getLatestInsights(projectId, 'positioning', 10);
    setInsights(data);
  };

  useEffect(() => {
    if (ASSISTANT_DISABLED) return;
    fetchInsights();
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    if (ASSISTANT_DISABLED) return;
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
    if (ASSISTANT_DISABLED) return;
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
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black"
        onClick={() => {}}
        aria-label="Assistant disabled"
      >
        <Lightbulb className="h-5 w-5" />
      </Button>
      {/* Popout and auto-calls disabled by ASSISTANT_DISABLED */}
    </div>
  );
};

export default InsightWidget; 