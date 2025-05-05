
import React from "react";
import { Persona } from "@/providers/AudienceProvider";
import TimelineNode from "./TimelineNode";

interface PersonaJourneyProps {
  persona: Persona;
  onCaptureInsight: (text: string) => void;
}

const PersonaJourney: React.FC<PersonaJourneyProps> = ({ persona, onCaptureInsight }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-6">Journey</h3>
      
      <div className="relative flex flex-wrap lg:flex-nowrap justify-between">
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted hidden lg:block"></div>
        
        <TimelineNode 
          label="Discover" 
          text={persona.journey.discover}
          onCapture={() => onCaptureInsight(persona.journey.discover)}
        />
        
        <TimelineNode 
          label="Decide" 
          text={persona.journey.decide}
          onCapture={() => onCaptureInsight(persona.journey.decide)}
        />
        
        <TimelineNode 
          label="First Use" 
          text={persona.journey.firstUse}
          onCapture={() => onCaptureInsight(persona.journey.firstUse)}
        />
        
        <TimelineNode 
          label="Habit" 
          text={persona.journey.habit}
          onCapture={() => onCaptureInsight(persona.journey.habit)}
        />
        
        <TimelineNode 
          label="Advocate" 
          text={persona.journey.advocate}
          onCapture={() => onCaptureInsight(persona.journey.advocate)}
        />
      </div>
    </div>
  );
};

export default PersonaJourney;
