
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw, MessageCircle } from "lucide-react";
import { Persona } from "@/providers/AudienceProvider";

interface PersonaCardProps {
  persona: Persona;
  onReplace: (id: string) => void;
  onEdit: (id: string) => void;
  onTalk: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onReplace,
  onEdit,
  onTalk,
  onViewProfile,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full mb-8 flex flex-col">
      <motion.div
        className="w-full h-[380px] relative perspective-1000 cursor-pointer mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Edit button on image */}
        <button
          className="absolute top-2 left-2 z-20 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(persona.id);
          }}
        >
          <Edit size={16} className="text-white" />
        </button>

        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div
            className={`absolute backface-hidden w-full h-full rounded-lg shadow-lg bg-[#2B2B2B] p-4 border border-border/30 overflow-hidden ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={() => setIsFlipped(true)}
          >
            <div className="aspect-w-3 aspect-h-4 bg-black/20 w-full h-[280px] rounded-lg overflow-hidden">
              <img
                src={persona.image}
                alt={persona.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs bg-background/30 backdrop-blur-sm rounded">
                  {persona.country}
                </span>
                <span
                  className="px-2 py-1 text-xs rounded text-background"
                  style={{ backgroundColor: persona.archeTypeColor }}
                >
                  {persona.archetype}
                </span>
              </div>

              <h3 className="text-lg font-semibold">
                {persona.name}, {persona.age}
              </h3>
            </div>
          </div>

          <div
            className={`absolute backface-hidden w-full h-full rounded-lg shadow-lg bg-[#2B2B2B] p-5 border border-border/30 overflow-hidden rotate-y-180 ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsFlipped(false)}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">
                {persona.name}, {persona.age}
              </h3>

              <div
                className="px-3 py-1 text-sm rounded text-background w-fit mb-6"
                style={{ backgroundColor: persona.archeTypeColor }}
              >
                {persona.archetype}
              </div>

              <div className="space-y-4 flex-1">
                <h4 className="text-sm font-medium text-cyan">Why they matter:</h4>
                <p className="text-sm">{persona.whyTheyMatter}</p>
              </div>

              <Button
                variant="link"
                className="text-cyan mt-4 text-left p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(persona.id);
                }}
              >
                See full profile →
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full flex-grow"
          onClick={(e) => {
            e.stopPropagation();
            onReplace(persona.id);
          }}
        >
          <RefreshCw size={14} className="mr-1" />
          Replace
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="rounded-full flex-grow"
          onClick={(e) => {
            e.stopPropagation();
            onTalk(persona.id);
          }}
        >
          <MessageCircle size={14} className="mr-1" />
          Talk
        </Button>
      </div>
    </div>
  );
};

export default PersonaCard;
