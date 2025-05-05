
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PersonalityProvider } from '@/providers/PersonalityProvider';
import BrandArchetype from '@/components/personality/BrandArchetype';
import CharacterKeywords from '@/components/personality/CharacterKeywords';
import PersonalitySliders from '@/components/personality/PersonalitySliders';
import XMeetsY from '@/components/personality/XMeetsY';
import DichotomyNots from '@/components/personality/DichotomyNots';
import TimelineTopBar from '@/components/TimelineTopBar';
import FloatingAIPanel from '@/components/FloatingAIPanel';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const PersonalityPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Determine which component to render based on the current path
  const renderContent = () => {
    switch (path) {
      case '/step/4/archetype':
        return <BrandArchetype />;
      case '/step/4/keywords':
        return <CharacterKeywords />;
      case '/step/4/sliders':
        return <PersonalitySliders />;
      case '/step/4/x-meets-y':
        return <XMeetsY />;
      case '/step/4/dichotomy':
        return <DichotomyNots />;
      default:
        return <BrandArchetype />;
    }
  };

  // Get context-specific suggestions based on current path
  const getSuggestedPrompts = () => {
    switch (path) {
      case '/step/4/archetype':
        return [
          "How do I choose between archetypes?",
          "What makes a strong archetype blend?",
          "Should I pick high or low compatibility archetypes?"
        ];
      case '/step/4/keywords':
        return [
          "How many keywords should I select?",
          "What makes a strong keyword combination?",
          "How to choose complementary traits?"
        ];
      case '/step/4/sliders':
        return [
          "How to set personality sliders effectively?",
          "Should my sliders match my archetype?",
          "What if my brand is in the middle on traits?"
        ];
      case '/step/4/x-meets-y':
        return [
          "What makes a good X-meets-Y combination?",
          "How to create tension in brand descriptions",
          "Examples of effective brand combinations"
        ];
      case '/step/4/dichotomy':
        return [
          "How to select effective 'We are/We are not' pairs?",
          "Finding the right balance in dichotomies",
          "Creating meaningful brand boundaries"
        ];
      default:
        return [
          "Help me develop my brand personality",
          "What makes a distinct brand character?",
          "How to maintain personality consistency"
        ];
    }
  };

  // Get context name based on current path
  const getContextName = () => {
    switch (path) {
      case '/step/4/archetype':
        return "Brand Archetypes";
      case '/step/4/keywords':
        return "Character Keywords";
      case '/step/4/sliders':
        return "Personality Sliders";
      case '/step/4/x-meets-y':
        return "X Meets Y";
      case '/step/4/dichotomy':
        return "Dichotomy Statements";
      default:
        return "Brand Personality";
    }
  };

  const toggleAIPanel = () => {
    setShowAIPanel(!showAIPanel);
  };

  return (
    <PersonalityProvider>
      <div className="min-h-screen bg-[#1B1B1B] text-foreground">
        <TimelineTopBar currentStep={4} completedSteps={[1, 2, 3]} />
        
        <div className="pt-[88px] min-h-[calc(100vh-88px)]">
          <div className="w-full mx-auto pb-10">
            {renderContent()}
          </div>
        </div>

        {/* AI Assistant Button */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full bg-cyan text-background shadow-lg hover:bg-cyan/90" 
            onClick={toggleAIPanel}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Floating AI Assistant */}
        <FloatingAIPanel
          isOpen={showAIPanel}
          onClose={toggleAIPanel}
          context={getContextName()}
          suggestedPrompts={getSuggestedPrompts()}
        />
      </div>
    </PersonalityProvider>
  );
};

export default PersonalityPage;
