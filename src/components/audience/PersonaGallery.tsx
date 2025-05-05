
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudience, Persona } from "@/providers/AudienceProvider";
import PersonaCard from "./PersonaCard";
import PersonaTalkDialog from "./PersonaTalkDialog";
import { PersonaDetailsSheet } from "./PersonaDetailsSheet";

const SAMPLE_PERSONAS = [
  {
    id: "p1",
    name: "Sara Wales",
    age: 22,
    country: "United States",
    archetype: "Spiral",
    archeTypeColor: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
    whyTheyMatter: "Sara represents our most engaged early adopters. Her feedback drives 40% of new feature adoption across our user base.",
    story: "As a recent design graduate working at a tech startup, Sara is constantly balancing multiple responsibilities. She seeks tools that help her organize chaotic workflows without rigid structure.",
    quote: "I don't think linearly. I need tools that let me work in spirals and still arrive at my destination.",
    journey: {
      discover: "Found via Twitter thread about design tools",
      decide: "Free trial solved a project bottleneck",
      firstUse: "Onboarded team for collaborative project",
      habit: "Now uses daily for task organization",
      advocate: "Regularly shares workflows on social media"
    },
    goals: [
      "Build impressive portfolio while working full-time",
      "Get promoted to senior designer within 2 years",
      "Learn new creative skills outside formal education"
    ],
    needs: [
      "Flexibility to organize tasks in non-linear ways",
      "Visual tools that complement her spatial thinking",
      "Quick ways to share progress with stakeholders"
    ],
    wants: [
      "Recognition for innovative approaches",
      "Tools that feel modern and well-designed",
      "Integration with other creative platforms"
    ],
    fears: [
      "Being forced into rigid processes that limit creativity",
      "Falling behind peers in competitive industry",
      "Tools becoming obsolete after investing time learning them"
    ],
    artifacts: [
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=300&q=80"
    ]
  },
  {
    id: "p2",
    name: "Liz Gao",
    age: 26,
    country: "Singapore",
    archetype: "Linear",
    archeTypeColor: "#4ECDC4",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    whyTheyMatter: "Liz represents our power users who integrate our product deeply into their workflow and drive our highest lifetime value.",
    story: "As a product manager at a finance company, Liz values structure and clarity. With multiple stakeholders and tight deadlines, she needs tools that provide clear visibility and accountability.",
    quote: "Show me the data, give me the timeline, and let me track every step of the way.",
    journey: {
      discover: "Recommended by colleague",
      decide: "Compared features in detailed spreadsheet",
      firstUse: "Migrated entire team workflow",
      habit: "Created templates for recurring projects",
      advocate: "Presented ROI to leadership team"
    },
    goals: [
      "Successfully launch 4 major features per year",
      "Reduce meeting time by improving async communication",
      "Advance to senior leadership within 3 years"
    ],
    needs: [
      "Clear dashboards tracking project status and metrics",
      "Ability to create repeatable processes",
      "Robust reporting for stakeholder updates"
    ],
    wants: [
      "Advanced forecasting and resource planning",
      "Customizable views for different teams",
      "Enterprise-grade security features"
    ],
    fears: [
      "Missing critical deadlines due to poor visibility",
      "Teams working in silos with conflicting priorities",
      "Being unable to demonstrate quantifiable value to executives"
    ],
    artifacts: [
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&q=80"
    ]
  },
  {
    id: "p3",
    name: "Tushar Rao",
    age: 30,
    country: "India",
    archetype: "Expert",
    archeTypeColor: "#7D80DA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    whyTheyMatter: "Tushar represents our technical users who push our platform to its limits and provide critical feedback for advanced features.",
    story: "As an engineering lead transitioning to management, Tushar needs tools that balance technical depth with people management. He values efficiency and integration capabilities above all.",
    quote: "I need systems that get out of my way and let me focus on solving the real problems.",
    journey: {
      discover: "Found through technical blog post",
      decide: "Tested API capabilities thoroughly",
      firstUse: "Integrated with existing development tools",
      habit: "Built custom extensions for team workflow",
      advocate: "Contributes to developer community"
    },
    goals: [
      "Scale team from 8 to 20 engineers this year",
      "Reduce technical debt while maintaining release velocity",
      "Build mentor reputation in tech community"
    ],
    needs: [
      "Powerful APIs and integration capabilities",
      "Fine-grained access controls for team permissions",
      "Automation of routine management tasks"
    ],
    wants: [
      "Ability to customize and extend platform functionality",
      "Data portability and open standards",
      "Early access to beta features"
    ],
    fears: [
      "Tools becoming a bottleneck for high-performing team",
      "Vendor lock-in limiting future flexibility",
      "Security vulnerabilities compromising sensitive data"
    ],
    artifacts: [
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80"
    ]
  }
];

interface PersonaGalleryProps {
  onComplete: () => void;
}

const PersonaGallery: React.FC<PersonaGalleryProps> = ({ onComplete }) => {
  const { personas, setPersonas, replacePersona } = useAudience();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTalkPersona, setActiveTalkPersona] = useState<string | null>(null);
  const [activePersonaCard, setActivePersonaCard] = useState<Persona | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPersonas(SAMPLE_PERSONAS);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setPersonas]);

  const handleEdit = (id: string) => {
    setSelectedPersonaId(id);
    setShowDetailSheet(true);
  };

  const handleViewProfile = (id: string) => {
    setSelectedPersonaId(id);
    setShowDetailSheet(true);
  };

  const handleReplace = (id: string) => {
    setIsLoading(true);
    replacePersona(id);

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleTalk = (id: string) => {
    const persona = personas.find(p => p.id === id);
    if (persona) {
      setActivePersonaCard(persona);
      setActiveTalkPersona(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <motion.div
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Meet your audience</h1>
        <p className="text-muted-foreground">Get to know the personas behind your core cohorts.</p>
      </motion.div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-2 border-t-cyan rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Creating detailed personas from your selected cohorts...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
            {personas.map(persona => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onReplace={handleReplace}
                onEdit={handleEdit}
                onTalk={handleTalk}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          <p className="text-center text-muted-foreground max-w-2xl px-4">
            These personas represent the key segments of your audience. Each has unique goals, needs, and behaviors that inform product decisions.
            Explore their profiles to understand their motivations deeper.
          </p>
        </div>
      )}

      {activeTalkPersona && activePersonaCard && (
        <PersonaTalkDialog
          persona={activePersonaCard}
          onClose={() => {
            setActiveTalkPersona(null);
            setActivePersonaCard(null);
          }}
        />
      )}

      <PersonaDetailsSheet
        isOpen={showDetailSheet}
        personaId={selectedPersonaId}
        onClose={() => {
          setShowDetailSheet(false);
          setSelectedPersonaId(null);
        }}
      />

      <div className="fixed bottom-8 inset-x-0 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-t border-border/40 mx-8">
        <div className="text-sm">
          {personas.length === 3 && (
            <span className="flex items-center text-cyan gap-1">
              <CircleCheck size={16} /> Three personas ready for review
            </span>
          )}
        </div>
        <Button
          onClick={onComplete}
          disabled={personas.length !== 3}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Approve personas →
        </Button>
      </div>
    </motion.div>
  );
};

export default PersonaGallery;
