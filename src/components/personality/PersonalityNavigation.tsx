
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersonality } from '@/providers/PersonalityProvider';
import PersonalitySummaryDialog from './PersonalitySummaryDialog';

interface PersonalityNavigationProps {
  type?: 'top' | 'bottom';
}

const routes = [
  '/step/4/archetype',
  '/step/4/keywords',
  '/step/4/sliders',
  '/step/4/x-meets-y',
  '/step/4/dichotomy'
];

const PersonalityNavigation: React.FC<PersonalityNavigationProps> = ({ type = 'bottom' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSummary, setShowSummary] = useState(false);
  
  const currentIndex = routes.indexOf(location.pathname);
  const isLastPage = currentIndex === routes.length - 1;
  const isFirstPage = currentIndex === 0;
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      navigate(routes[currentIndex - 1]);
    } else {
      navigate('/timeline');
    }
  };
  
  const goToNext = () => {
    if (currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1]);
    }
  };
  
  if (type === 'top') {
    return (
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={goToPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {isFirstPage ? "Back to Timeline" : "Back"}
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <PersonalitySummaryDialog 
        open={showSummary}
        onOpenChange={setShowSummary}
      />

      <div className="flex justify-between mt-8">
        {!isFirstPage && (
          <Button 
            variant="outline" 
            onClick={goToPrevious}
            className="px-6"
          >
            Back
          </Button>
        )}
        
        {isFirstPage && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/timeline')}
            className="px-6"
          >
            Back to Timeline
          </Button>
        )}
        
        {!isLastPage ? (
          <Button 
            onClick={goToNext}
            className="px-6 bg-cyan text-black hover:bg-cyan/80"
          >
            Next <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={() => setShowSummary(true)}
            className="px-6 bg-cyan text-black hover:bg-cyan/80"
          >
            Generate Personality <ArrowRight size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </>
  );
};

export default PersonalityNavigation;
