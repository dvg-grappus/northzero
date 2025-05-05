
import BriefIntake from "@/components/positioning/BriefIntake";
import GoldenCircle from "@/components/positioning/GoldenCircle";
import OpportunitiesChallenges from "@/components/positioning/OpportunitiesChallenges";
import Roadmap from "@/components/positioning/Roadmap";
import Values from "@/components/positioning/Values";
import Differentiators from "@/components/positioning/Differentiators";
import Statements from "@/components/positioning/Statements";

export const STEP_CONFIG = [
  { 
    id: "brief", 
    name: "Brief Intake", 
    component: BriefIntake, 
    isValid: () => true  // Always valid
  },
  { 
    id: "golden-circle", 
    name: "Golden Circle", 
    component: GoldenCircle, 
    isValid: () => true  // Always valid
  },
  { 
    id: "opportunities-challenges", 
    name: "Opportunities & Challenges", 
    component: OpportunitiesChallenges, 
    isValid: () => true  // Always valid
  },
  { 
    id: "roadmap", 
    name: "Roadmap", 
    component: Roadmap, 
    isValid: () => true  // Always valid
  },
  { 
    id: "values", 
    name: "Values", 
    component: Values, 
    isValid: () => true  // Always valid
  },
  { 
    id: "differentiators", 
    name: "Differentiators", 
    component: Differentiators, 
    isValid: () => true  // Always valid
  },
  { 
    id: "statements", 
    name: "Statements", 
    component: Statements, 
    isValid: () => true  // Always valid
  },
];
