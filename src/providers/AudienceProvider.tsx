import React, { createContext, useState, useContext, ReactNode } from "react";
import { SAMPLE_COHORTS, SAMPLE_PERSONAS, SAMPLE_SIMULATION_TOPICS, INITIAL_INSIGHTS } from '@/data/mockAudience';

// Define types
export interface Insight {
  id: string;
  text: string;
  source: string;
  isSystemGenerated: boolean;
  timestamp: Date;
  rating?: number; // 1-5 star rating
}

export interface Cohort {
  id: string;
  title: string;
  description: string;
  size: number; // 1-10 scale
  buyingPower: number; // 1-10 scale
  growthRate: number; // 1-10 scale
  isSelected?: boolean;
  isDiscarded?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  country: string;
  archetype: string;
  archeTypeColor: string;
  image: string;
  whyTheyMatter: string;
  story: string;
  quote: string;
  journey: {
    discover: string;
    decide: string;
    firstUse: string;
    habit: string;
    advocate: string;
  };
  goals: string[];
  needs: string[];
  wants: string[];
  fears: string[];
  artifacts: string[];
}

export interface SimulationTopic {
  id: string;
  title: string;
}

interface Simulation {
  id: string;
  topicId: string;
  personaIds: string[];
  transcript: { persona: string; text: string }[];
  timestamp: Date;
}

interface DemographicFilters {
  age: [number, number];
  income: [number, number];
  geography: [number, number];
  techAffinity: [number, number];
  purchaseFrequency: [number, number];
}

// Define context type
interface AudienceContextType {
  // Demographics
  filters: DemographicFilters;
  updateFilters: (filter: keyof DemographicFilters, values: [number, number]) => void;
  
  // Tags
  selectedTags: string[];
  toggleTag: (tagId: string) => void;
  
  // Cohorts
  cohorts: Cohort[];
  setCohorts: (cohorts: Cohort[]) => void;
  selectCohort: (id: string) => void;
  discardCohort: (id: string) => void;
  
  // Personas
  personas: Persona[];
  setPersonas: (personas: Persona[]) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  replacePersona: (id: string) => void;
  
  // Simulations
  simulationTopics: SimulationTopic[];
  simulations: Simulation[];
  createSimulation: (topicId: string, personaIds: string[]) => void;
  
  // Insights
  insights: Insight[];
  addInsight: (text: string, source: string, isSystemGenerated: boolean) => void;
  rateInsight: (id: string, rating: number) => void;
  mergeInsights: (id1: string, id2: string, mergedText: string) => void;
}

// Create context
const AudienceContext = createContext<AudienceContextType | undefined>(undefined);

// Provider component
export const AudienceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Demographics state
  const [filters, setFilters] = useState<DemographicFilters>({
    age: [18, 65],
    income: [20, 200],
    geography: [1, 10],
    techAffinity: [1, 10],
    purchaseFrequency: [1, 10],
  });
  
  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Cohorts state
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  
  // Personas state
  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // Simulations state
  const [simulationTopics, setSimulationTopics] = useState<SimulationTopic[]>(SAMPLE_SIMULATION_TOPICS);
  
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  
  // Insights state
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);
  
  // Update demographic filters
  const updateFilters = (filter: keyof DemographicFilters, values: [number, number]) => {
    setFilters(prev => ({ ...prev, [filter]: values }));
  };
  
  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
    
    // Fire the hook for analytics
    console.log("onCohortSelect", tagId);
  };
  
  // Select a cohort
  const selectCohort = (id: string) => {
    setCohorts(prev => 
      prev.map(cohort => 
        cohort.id === id 
          ? { ...cohort, isSelected: true, isDiscarded: false } 
          : cohort
      )
    );
  };
  
  // Discard a cohort
  const discardCohort = (id: string) => {
    setCohorts(prev => 
      prev.map(cohort => 
        cohort.id === id 
          ? { ...cohort, isSelected: false, isDiscarded: true } 
          : cohort
      )
    );
  };
  
  // Update a persona
  const updatePersona = (id: string, updates: Partial<Persona>) => {
    setPersonas(prev => 
      prev.map(persona => 
        persona.id === id 
          ? { ...persona, ...updates } 
          : persona
      )
    );
  };
  
  // Replace a persona with a new one
  const replacePersona = (id: string) => {
    // Simulate generating a new persona
    // In a real app, this would call an API or run a model
    setTimeout(() => {
      setPersonas(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index === -1) return prev;
        
        const newPersonas = [...prev];
        newPersonas[index] = {
          ...newPersonas[index],
          name: Math.random() > 0.5 ? "Alex Chen" : "Jordan Taylor",
          age: Math.floor(Math.random() * 15) + 22,
          country: Math.random() > 0.5 ? "Canada" : "Australia",
          archetype: Math.random() > 0.5 ? "Expert" : "Spiral",
          whyTheyMatter: "This persona represents an emerging segment with unique needs and significant growth potential.",
        };
        return newPersonas;
      });
    }, 1500);
  };
  
  // Create a new simulation
  const createSimulation = (topicId: string, personaIds: string[]) => {
    console.log("onSimulationRun", topicId, personaIds);
    
    const newSimulation: Simulation = {
      id: Date.now().toString(),
      topicId,
      personaIds,
      transcript: [],
      timestamp: new Date(),
    };
    
    setSimulations(prev => [newSimulation, ...prev]);
    
    // Return the simulation ID for further reference
    return newSimulation.id;
  };
  
  // Add a new insight
  const addInsight = (text: string, source: string, isSystemGenerated: boolean) => {
    const newInsight: Insight = {
      id: Date.now().toString(),
      text,
      source,
      isSystemGenerated,
      timestamp: new Date(),
    };
    
    setInsights(prev => [newInsight, ...prev]);
    
    // Fire the hook for analytics
    console.log("onInsightCreate", text, source);
  };
  
  // Rate an insight
  const rateInsight = (id: string, rating: number) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id 
          ? { ...insight, rating } 
          : insight
      )
    );
  };
  
  // Merge two insights
  const mergeInsights = (id1: string, id2: string, mergedText: string) => {
    // Create a new merged insight
    const insight1 = insights.find(i => i.id === id1);
    const insight2 = insights.find(i => i.id === id2);
    
    if (!insight1 || !insight2) return;
    
    const newInsight: Insight = {
      id: Date.now().toString(),
      text: mergedText,
      source: `Merged from ${insight1.source} & ${insight2.source}`,
      isSystemGenerated: insight1.isSystemGenerated && insight2.isSystemGenerated,
      timestamp: new Date(),
    };
    
    // Add the new insight and remove the original two
    setInsights(prev => [
      newInsight,
      ...prev.filter(i => i.id !== id1 && i.id !== id2)
    ]);
  };
  
  return (
    <AudienceContext.Provider value={{
      filters,
      updateFilters,
      selectedTags,
      toggleTag,
      cohorts,
      setCohorts,
      selectCohort,
      discardCohort,
      personas,
      setPersonas,
      updatePersona,
      replacePersona,
      simulationTopics,
      simulations,
      createSimulation,
      insights,
      addInsight,
      rateInsight,
      mergeInsights,
    }}>
      {children}
    </AudienceContext.Provider>
  );
};

// Custom hook to use the audience context
export const useAudience = () => {
  const context = useContext(AudienceContext);
  if (context === undefined) {
    throw new Error("useAudience must be used within an AudienceProvider");
  }
  return context;
};