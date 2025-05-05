import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePersonality } from '@/providers/PersonalityProvider';
import { ChartPie, Layers, CircleDot } from 'lucide-react';

interface PersonalitySummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PersonalitySummaryDialog: React.FC<PersonalitySummaryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { completeModule } = usePersonality();
  
  // This is mock data for the intelligent summary
  const personalityInsights = {
    essence: "Your brand embodies a balance of innovation and reliability, with an exploratory spirit that appeals to forward-thinking audiences while maintaining approachability.",
    voice: "Confident and knowledgeable, but never authoritative or condescending. Speak with clarity and enthusiasm that invites participation.",
    visualIdentity: "Clean, contemporary designs with purposeful bursts of energy. Use negative space strategically to highlight key elements.",
    traits: [
      { name: "Innovative", score: 87 },
      { name: "Trustworthy", score: 75 },
      { name: "Approachable", score: 82 },
      { name: "Thoughtful", score: 69 },
    ],
    dosDonts: [
      { do: "Emphasize problem-solving and forward-thinking", dont: "Appear overly technical or complicated" },
      { do: "Show transparency in processes and decisions", dont: "Make unfounded claims or exaggerations" },
      { do: "Use conversational, accessible language", dont: "Use industry jargon without explanation" },
      { do: "Create content that educates and empowers", dont: "Talk down to your audience" },
    ],
    archetypeMeaning: "Your primary Explorer/Creator blend suggests a brand that values discovery, authenticity, and craftsmanship. This combination resonates with audiences seeking meaningful innovation rather than novelty for its own sake.",
    narrativeDirections: [
      "Journey of continuous improvement",
      "Collaborative problem-solving",
      "Transformative but accessible solutions",
      "Human-centered innovation"
    ],
    competitivePositioning: "Your brand stands apart by balancing technical expertise with human connection—distinct from competitors who may lean too heavily toward either cold efficiency or emotional appeal without substance."
  };

  const handlePublishAndExit = () => {
    completeModule();
    navigate('/timeline');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Personality Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Brand Essence */}
          <section className="bg-card/30 p-6 rounded-lg border border-card/20">
            <h3 className="text-lg font-semibold mb-4 text-cyan flex items-center">
              <CircleDot className="mr-2" size={20} />
              Brand Essence
            </h3>
            <p className="text-lg">{personalityInsights.essence}</p>
          </section>

          {/* Core Traits Visualization */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-cyan flex items-center">
              <ChartPie className="mr-2" size={20} />
              Core Traits Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {personalityInsights.traits.map((trait) => (
                <div key={trait.name} className="bg-card/30 p-4 rounded-lg border border-card/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{trait.name}</span>
                    <span className="text-cyan font-semibold">{trait.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan" 
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dos & Don'ts Guidelines */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-cyan flex items-center">
              <Layers className="mr-2" size={20} />
              Brand Guardrails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-950/30 p-5 rounded-lg border border-emerald-800/30">
                <h4 className="text-emerald-400 font-medium mb-3">DO</h4>
                <ul className="space-y-3">
                  {personalityInsights.dosDonts.map((item, idx) => (
                    <li key={`do-${idx}`} className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{item.do}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-950/30 p-5 rounded-lg border border-red-800/30">
                <h4 className="text-red-400 font-medium mb-3">DON'T</h4>
                <ul className="space-y-3">
                  {personalityInsights.dosDonts.map((item, idx) => (
                    <li key={`dont-${idx}`} className="flex items-start">
                      <span className="text-red-400 mr-2">✕</span>
                      <span>{item.dont}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Voice & Tone */}
          <section className="bg-card/30 p-6 rounded-lg border border-card/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan">Brand Voice</h3>
            <p>{personalityInsights.voice}</p>
          </section>

          {/* Visual Direction */}
          <section className="bg-card/30 p-6 rounded-lg border border-card/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan">Visual Direction</h3>
            <p>{personalityInsights.visualIdentity}</p>
          </section>

          {/* Archetype Meaning */}
          <section className="bg-card/30 p-6 rounded-lg border border-card/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan">Archetype Significance</h3>
            <p>{personalityInsights.archetypeMeaning}</p>
          </section>

          {/* Narrative Directions */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-cyan">Narrative Opportunities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalityInsights.narrativeDirections.map((direction, idx) => (
                <div 
                  key={`narrative-${idx}`} 
                  className="bg-cyan/10 p-4 rounded-lg border border-cyan/20"
                >
                  <p className="text-center">{direction}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Competitive Positioning */}
          <section className="bg-card/30 p-6 rounded-lg border border-card/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan">Competitive Positioning</h3>
            <p>{personalityInsights.competitivePositioning}</p>
          </section>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Edit
          </Button>
          <Button 
            className="bg-cyan text-black hover:bg-cyan/80"
            onClick={handlePublishAndExit}
          >
            Publish and Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalitySummaryDialog;