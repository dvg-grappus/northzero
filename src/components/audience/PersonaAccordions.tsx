
import React from "react";
import { Persona } from "@/providers/AudienceProvider";
import { Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PersonaAccordionsProps {
  persona: Persona;
  activeAccordion: string;
  onAccordionChange: (value: string) => void;
  onCaptureInsight: (text: string) => void;
}

const PersonaAccordions: React.FC<PersonaAccordionsProps> = ({
  persona,
  activeAccordion,
  onAccordionChange,
  onCaptureInsight
}) => {
  const renderList = (items: string[], color: string) => (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 group">
          <span className="text-muted-foreground">•</span>
          <span className="flex-1">{item}</span>
          <button 
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-cyan transition-opacity"
            onClick={() => onCaptureInsight(item)}
          >
            <Lightbulb size={16} />
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <Accordion
      type="single"
      collapsible
      value={activeAccordion}
      onValueChange={onAccordionChange}
      className="mb-8"
    >
      <AccordionItem value="goals" className="border-b border-border/50">
        <AccordionTrigger className="bg-blue-950/20 hover:bg-blue-950/30 px-3 rounded-t-md">
          <span className="text-blue-400">Goals</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 py-2 bg-blue-950/10">
          {renderList(persona.goals, "blue")}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="needs" className="border-b border-border/50">
        <AccordionTrigger className="bg-green-950/20 hover:bg-green-950/30 px-3">
          <span className="text-green-400">Needs</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 py-2 bg-green-950/10">
          {renderList(persona.needs, "green")}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="wants" className="border-b border-border/50">
        <AccordionTrigger className="bg-purple-950/20 hover:bg-purple-950/30 px-3">
          <span className="text-purple-400">Wants</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 py-2 bg-purple-950/10">
          {renderList(persona.wants, "purple")}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="fears" className="border-b border-border/50">
        <AccordionTrigger className="bg-orange-950/20 hover:bg-orange-950/30 px-3 rounded-b-md">
          <span className="text-orange-400">Fears</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 py-2 bg-orange-950/10">
          {renderList(persona.fears, "orange")}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PersonaAccordions;
