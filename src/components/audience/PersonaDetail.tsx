import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAudience } from "@/providers/AudienceProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PersonaJourney from "./PersonaJourney";
import PersonaAccordions from "./PersonaAccordions";
import PersonaArtifacts from "./PersonaArtifacts";
import PersonaTalkDialog from "./PersonaTalkDialog";

interface PersonaDetailProps {
  personaId?: string;
  onBack: () => void;
}

const PersonaDetail: React.FC<PersonaDetailProps> = ({ personaId, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { personas, addInsight } = useAudience();
  const [activeAccordion, setActiveAccordion] = useState<string>("goals");
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  
  const actualPersonaId = personaId || params.personaId;
  const persona = personas.find(p => p.id === actualPersonaId);
  
  if (!persona) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl">Persona not found</h2>
        <Button onClick={onBack} className="mt-4">
          Back to gallery
        </Button>
      </div>
    );
  }
  
  const captureInsight = (text: string) => {
    addInsight(text, `Persona: ${persona.name}`, true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to gallery
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSimulationDialog(true)}
        >
          <MessageCircle size={16} className="mr-1" />
          Start simulation with {persona.name}
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[68%]">
          <div className="w-full h-[320px] rounded-lg overflow-hidden mb-8">
            <img 
              src={persona.image} 
              alt={persona.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Story</h3>
            <p className="text-muted-foreground">{persona.story}</p>
          </div>
          
          <div className="border-l-4 border-cyan pl-4 mb-8">
            <p className="text-lg italic">"{persona.quote}"</p>
            <p className="text-sm text-muted-foreground mt-2">— {persona.name}</p>
          </div>
          
          <PersonaJourney 
            persona={persona}
            onCaptureInsight={captureInsight}
          />
        </div>
        
        <div className="w-full lg:w-[28%] lg:sticky lg:top-24">
          <PersonaAccordions
            persona={persona}
            activeAccordion={activeAccordion}
            onAccordionChange={setActiveAccordion}
            onCaptureInsight={captureInsight}
          />
          
          <PersonaArtifacts artifacts={persona.artifacts} />
        </div>
      </div>

      {showSimulationDialog && (
        <PersonaTalkDialog
          persona={persona}
          onClose={() => setShowSimulationDialog(false)}
        />
      )}
    </motion.div>
  );
};

export default PersonaDetail;
