
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MoodboardsProvider } from '@/providers/MoodboardsProvider';
import AttributesView from '@/components/moodboards/AttributesView';
import DirectionsView from '@/components/moodboards/DirectionsView';
import MoodboardBuilderView from '@/components/moodboards/MoodboardBuilderView';
import CompareView from '@/components/moodboards/CompareView';
import FloatingAIPanel from '@/components/moodboards/FloatingAIPanel';
import TimelineTopBar from '@/components/TimelineTopBar';

const MoodboardsPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPanelContext, setAIPanelContext] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  const handleOpenAIPanel = (context: string, prompts?: string[]) => {
    setAIPanelContext(context);
    if (prompts) {
      setSuggestedPrompts(prompts);
    } else {
      // Default prompts based on current view
      if (path.includes('attributes')) {
        setSuggestedPrompts([
          "Add some keywords that indicate an AI-first, futuristic vibe",
          "Remove clichés, keep it premium",
          "Suggest keywords for a luxury tech brand"
        ]);
      } else if (path.includes('directions')) {
        setSuggestedPrompts([
          "Generate a more minimalist direction",
          "Create a direction with bold colors",
          "Suggest a direction focused on innovation"
        ]);
      } else if (path.includes('moodboards')) {
        setSuggestedPrompts([
          "Find subtler texture images",
          "Suggest more futuristic typography",
          "Add more contrast to the color palette"
        ]);
      } else if (path.includes('compare')) {
        setSuggestedPrompts([
          "Boost saturation in this board",
          "Remove serif type sample",
          "Add lifestyle photo suggestions"
        ]);
      }
    }
    
    setIsAIPanelOpen(true);
  };
  
  // Render appropriate view based on current URL
  const renderContent = () => {
    switch (true) {
      case path.includes('/step/5/attributes'):
        return <AttributesView onOpenAI={handleOpenAIPanel} />;
      case path.includes('/step/5/directions'):
        return <DirectionsView onOpenAI={handleOpenAIPanel} />;
      case path.includes('/step/5/moodboards'):
        return <MoodboardBuilderView onOpenAI={handleOpenAIPanel} />;
      case path.includes('/step/5/compare'):
        return <CompareView onOpenAI={handleOpenAIPanel} />;
      default:
        return <AttributesView onOpenAI={handleOpenAIPanel} />;
    }
  };

  return (
    <MoodboardsProvider>
      <div className="min-h-screen bg-[#1B1B1B] text-foreground">
        <TimelineTopBar currentStep={5} completedSteps={[1, 2, 3, 4]} />
        
        <div className="pt-[88px] min-h-[calc(100vh-88px)]">
          {renderContent()}
        </div>
        
        <FloatingAIPanel 
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          context={aiPanelContext}
          suggestedPrompts={suggestedPrompts}
        />
      </div>
    </MoodboardsProvider>
  );
};

export default MoodboardsPage;
