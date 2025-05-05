import { Competitor, SecondaryInsight } from '@/providers/CompetitionProvider';

// Competitors mock data
export const MOCK_COMPETITORS: Competitor[] = [
  {
    id: "1",
    name: "Scaler Academy",
    logo: "/placeholder.svg",
    tags: ["Startup", "SaaS", "Recently funded"],
    type: "startup",
    alexaRank: "28,750",
    fundingStage: "Series B",
    priority: 8,
    position: { x: 0.3, y: 0.7 }
  },
  {
    id: "2",
    name: "MasterClass",
    logo: "/placeholder.svg",
    tags: ["Large company", "Provider", "Mobile-first"],
    type: "large-company",
    alexaRank: "2,340",
    fundingStage: "Series F",
    website: "https://www.masterclass.com",
    priority: 6,
    position: { x: 0.6, y: 0.2 }
  },
  {
    id: "3",
    name: "Brilliant",
    logo: "/placeholder.svg",
    tags: ["Startup", "SaaS", "Mobile-first"],
    type: "startup",
    alexaRank: "12,120",
    fundingStage: "Series C",
    website: "https://brilliant.org",
    priority: 7,
    position: { x: 0.4, y: 0.5 }
  },
  {
    id: "4",
    name: "Ask AI Mentor",
    logo: "/placeholder.svg",
    tags: ["Startup", "Mobile-first", "Recently funded"],
    type: "startup",
    alexaRank: "78,500",
    fundingStage: "Seed",
    website: "https://www.askaimentor.com",
    priority: 9,
    position: { x: 0.8, y: 0.3 }
  },
  {
    id: "5",
    name: "EduPop",
    logo: "/placeholder.svg",
    tags: ["Startup", "Community-led", "Bootstrapped"],
    type: "startup",
    alexaRank: "102,300",
    fundingStage: "Bootstrapped",
    website: "https://www.edupop.io",
    priority: 5,
    position: { x: 0.5, y: 0.7 }
  },
  {
    id: "6",
    name: "Google Primer",
    logo: "/placeholder.svg",
    tags: ["Large company", "Mobile-first", "Provider"],
    type: "large-company",
    alexaRank: "1",
    fundingStage: "N/A",
    website: "https://www.yourprimer.com",
    priority: 7,
    position: { x: 0.2, y: 0.2 }
  },
  {
    id: "7",
    name: "Roadtrip Nation",
    logo: "/placeholder.svg",
    tags: ["Marketplace", "Community-led", "SaaS"],
    type: "startup",
    alexaRank: "87,600",
    fundingStage: "Series A",
    website: "https://roadtripnation.com",
    priority: 4,
    position: { x: 0.7, y: 0.6 }
  },
  {
    id: "8",
    name: "Skillshare",
    logo: "/placeholder.svg",
    tags: ["Large company", "Marketplace", "Provider"],
    type: "large-company",
    alexaRank: "3,450",
    fundingStage: "Series E",
    website: "https://www.skillshare.com",
    priority: 8,
    position: { x: 0.6, y: 0.4 }
  },
  {
    id: "9",
    name: "Study Together",
    logo: "/placeholder.svg",
    tags: ["Startup", "Community-led", "Recently funded"],
    type: "startup",
    alexaRank: "156,780",
    fundingStage: "Seed",
    website: "https://studytogether.com",
    priority: 6,
    position: { x: 0.3, y: 0.5 }
  },
  {
    id: "10",
    name: "Nawwel",
    logo: "/placeholder.svg",
    tags: ["Startup", "SaaS", "Bootstrapped"],
    type: "startup",
    alexaRank: "203,400",
    fundingStage: "Bootstrapped",
    website: "https://nawwel.edu",
    priority: 3,
    position: { x: 0.4, y: 0.8 }
  },
  {
    id: "11",
    name: "Wiseshot",
    logo: "/placeholder.svg",
    tags: ["Startup", "Mobile-first", "Recently funded"],
    type: "startup",
    alexaRank: "189,560",
    fundingStage: "Pre-seed",
    website: "https://wiseshot.app",
    priority: 4,
    position: { x: 0.7, y: 0.2 }
  },
  {
    id: "12",
    name: "Landit",
    logo: "/placeholder.svg",
    tags: ["Startup", "SaaS", "Recently funded"],
    type: "startup",
    alexaRank: "112,800",
    fundingStage: "Series A",
    website: "https://www.landit.com",
    priority: 5,
    position: { x: 0.6, y: 0.7 }
  },
  {
    id: "13",
    name: "LearnPath",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "Career platform", "Enterprise"],
    type: "startup",
    alexaRank: "156,780",
    fundingStage: "Series A",
    priority: 6,
    position: { x: 0.4, y: 0.3 }
  },
  {
    id: "14",
    name: "SkillBridge",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "B2B", "Enterprise"],
    type: "large-company",
    alexaRank: "89,450",
    fundingStage: "Series C",
    priority: 7,
    position: { x: 0.6, y: 0.4 }
  },
  {
    id: "15",
    name: "TechMentor",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "1:1 Coaching", "Premium"],
    type: "startup",
    alexaRank: "234,567",
    fundingStage: "Seed",
    priority: 5,
    position: { x: 0.7, y: 0.6 }
  },
  {
    id: "16",
    name: "CareerBoost",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "Job platform", "Enterprise"],
    type: "large-company",
    alexaRank: "45,678",
    fundingStage: "Series D",
    priority: 8,
    position: { x: 0.3, y: 0.4 }
  },
  {
    id: "17",
    name: "SkillForge",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "Community", "B2B"],
    type: "startup",
    alexaRank: "167,890",
    fundingStage: "Series A",
    priority: 6,
    position: { x: 0.5, y: 0.7 }
  },
  {
    id: "18",
    name: "LearnHub Pro",
    logo: "/placeholder.svg",
    tags: ["Adjacent", "Enterprise", "LMS"],
    type: "large-company",
    alexaRank: "78,901",
    fundingStage: "Series B",
    priority: 7,
    position: { x: 0.6, y: 0.3 }
  },
  {
    id: "19",
    name: "AITeach",
    logo: "/placeholder.svg",
    tags: ["Emerging", "AI-powered", "EdTech"],
    type: "startup",
    alexaRank: "345,678",
    fundingStage: "Seed",
    priority: 4,
    position: { x: 0.7, y: 0.5 }
  },
  {
    id: "20",
    name: "SkillAI",
    logo: "/placeholder.svg",
    tags: ["Emerging", "AI", "Personalized"],
    type: "startup",
    alexaRank: "456,789",
    fundingStage: "Pre-seed",
    priority: 3,
    position: { x: 0.4, y: 0.6 }
  },
  {
    id: "21",
    name: "LearnGPT",
    logo: "/placeholder.svg",
    tags: ["Emerging", "AI", "Practice"],
    type: "startup",
    alexaRank: "567,890",
    fundingStage: "Seed",
    priority: 4,
    position: { x: 0.5, y: 0.4 }
  },
  {
    id: "22",
    name: "CodeMaster AI",
    logo: "/placeholder.svg",
    tags: ["Emerging", "AI", "Coding"],
    type: "startup",
    alexaRank: "678,901",
    fundingStage: "Seed",
    priority: 4,
    position: { x: 0.3, y: 0.6 }
  },
  {
    id: "23",
    name: "TechPrep",
    logo: "/placeholder.svg",
    tags: ["Emerging", "Practice", "Community"],
    type: "startup",
    alexaRank: "789,012",
    fundingStage: "Pre-seed",
    priority: 3,
    position: { x: 0.6, y: 0.5 }
  },
  {
    id: "24",
    name: "InterviewPro",
    logo: "/placeholder.svg",
    tags: ["Emerging", "Interview prep", "AI"],
    type: "startup",
    alexaRank: "890,123",
    fundingStage: "Seed",
    priority: 4,
    position: { x: 0.4, y: 0.7 }
  }
];

// Takeaways mock data
export const MOCK_TAKEAWAYS = [
  {
    id: "1",
    title: "Discover Page onboarding",
    description: "Daily inspiration feed increases sticky visits from day one.",
    screenshot: "/placeholder.svg",
    source: "MasterClass",
    sourceIcon: "/placeholder.svg",
    category: "UX idea",
    saved: false
  },
  {
    id: "2",
    title: "Social referrals loop",
    description: "Referral codes embedded in user stories drive 28% sign-ups.",
    screenshot: "/placeholder.svg",
    source: "Skillshare",
    sourceIcon: "/placeholder.svg",
    category: "Growth tactic",
    saved: false
  },
  {
    id: "3",
    title: "Weekly video digest",
    description: "Curated editorial keeps dormant users engaged.",
    screenshot: "/placeholder.svg",
    source: "Brilliant",
    sourceIcon: "/placeholder.svg",
    category: "Growth tactic",
    saved: false
  },
  {
    id: "4",
    title: "Microcredentials gallery",
    description: "Visible skill badges motivate course completions by 34%.",
    screenshot: "/placeholder.svg",
    source: "Scaler Academy",
    sourceIcon: "/placeholder.svg",
    category: "Product wedge",
    saved: false
  },
  {
    id: "5",
    title: "Personalized learning path",
    description: "AI-driven skill assessments create custom roadmaps for users.",
    screenshot: "/placeholder.svg",
    source: "Ask AI Mentor",
    sourceIcon: "/placeholder.svg",
    category: "Product wedge",
    saved: false
  },
  {
    id: "6",
    title: "Community showcase",
    description: "User content highlighted on homepage builds loyalty.",
    screenshot: "/placeholder.svg",
    source: "Study Together",
    sourceIcon: "/placeholder.svg",
    category: "Brand move",
    saved: false
  },
  {
    id: "7",
    title: "Mobile learning snacks",
    description: "5-minute micro-lessons drive 3x daily app opens.",
    screenshot: "/placeholder.svg",
    source: "Google Primer",
    sourceIcon: "/placeholder.svg",
    category: "UX idea",
    saved: false
  },
  {
    id: "8",
    title: "Expert AMA sessions",
    description: "Live Q&A events create appointment viewing and FOMO.",
    screenshot: "/placeholder.svg",
    source: "Roadtrip Nation",
    sourceIcon: "/placeholder.svg",
    category: "Brand move",
    saved: false
  }
];

// Trends mock data
export const MOCK_TRENDS = [
  {
    id: "1",
    title: "Microsubscriptions",
    description: "Platforms slice offerings into ₹99 micro-tiers.",
    icon: "sparkles",
    accepted: false
  },
  {
    id: "2",
    title: "AI copilots in onboarding",
    description: "Chat-style guides replace static tours.",
    icon: "bot",
    accepted: false
  },
  {
    id: "3",
    title: "Gamified dashboards",
    description: "Progress tracking with game mechanics increases retention.",
    icon: "gamepad",
    accepted: false
  },
  {
    id: "4",
    title: "Community-led help",
    description: "User forums replacing traditional support channels.",
    icon: "users",
    accepted: false
  },
  {
    id: "5",
    title: "Well-being upsells",
    description: "Mental wellness features becoming premium add-ons.",
    icon: "heart",
    accepted: false
  },
  {
    id: "6",
    title: "Creator brand partnerships",
    description: "Influencer collaborations driving acquisition strategies.",
    icon: "star",
    accepted: false
  },
  {
    id: "7",
    title: "Voice search SEO",
    description: "Optimizing content for conversational queries.",
    icon: "mic",
    accepted: false
  },
  {
    id: "8",
    title: "Hyper-local pricing",
    description: "Geo-specific pricing tiers based on market capacity.",
    icon: "map-pin",
    accepted: false
  },
  {
    id: "9",
    title: "Credential badges",
    description: "Portable achievement tokens for professional profiles.",
    icon: "award",
    accepted: false
  }
];

// Secondary insights mock data
export const MOCK_SECONDARY_INSIGHTS: SecondaryInsight[] = [
  {
    id: "1",
    text: "Competitors with daily active content have 3x higher retention",
    source: "Discovered from Scaler Academy",
    category: "competitor",
    timestamp: new Date(),
    starred: true
  },
  {
    id: "2",
    text: "Freemium model with low entry barriers is dominant in our space",
    source: "Market trend analysis",
    category: "trend",
    timestamp: new Date(),
    starred: false
  }
];