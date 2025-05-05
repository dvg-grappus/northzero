import { Cohort, Persona, Insight, SimulationTopic } from '@/providers/AudienceProvider';

// Sample cohorts data
export const SAMPLE_COHORTS: Cohort[] = [
  {
    id: "c1",
    title: "Urban Gen-Z side-hustlers",
    description: "Young digital natives with entrepreneurial spirit and multiple income streams",
    size: 7,
    buyingPower: 5,
    growthRate: 9
  },
  {
    id: "c2",
    title: "Corporate innovators",
    description: "Mid-level managers tasked with driving innovation in large organizations",
    size: 6,
    buyingPower: 8,
    growthRate: 6
  },
  {
    id: "c3",
    title: "Creative freelancers",
    description: "Independent designers, writers and artists seeking efficient project management",
    size: 8,
    buyingPower: 6,
    growthRate: 7
  },
  {
    id: "c4",
    title: "Tech startup founders",
    description: "Early-stage entrepreneurs building scalable tech products",
    size: 5,
    buyingPower: 7,
    growthRate: 8
  },
  {
    id: "c5",
    title: "Remote team managers",
    description: "Leaders coordinating distributed teams across time zones",
    size: 6,
    buyingPower: 9,
    growthRate: 9
  },
  {
    id: "c6",
    title: "Digital marketers",
    description: "Campaign specialists seeking better analytics and workflow tools",
    size: 7,
    buyingPower: 7,
    growthRate: 6
  },
  {
    id: "c7",
    title: "Product managers",
    description: "Professionals orchestrating product development across departments",
    size: 8,
    buyingPower: 8,
    growthRate: 7
  },
  {
    id: "c8",
    title: "Small agency owners",
    description: "Boutique agency leaders balancing client work and business operations",
    size: 6,
    buyingPower: 7,
    growthRate: 5
  },
  {
    id: "c9",
    title: "Tech-savvy educators",
    description: "Teaching professionals integrating digital tools into learning environments",
    size: 9,
    buyingPower: 4,
    growthRate: 8
  }
];

// Sample personas data
export const SAMPLE_PERSONAS: Persona[] = [
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

// Sample simulation topics
export const SAMPLE_SIMULATION_TOPICS: SimulationTopic[] = [
  { id: "1", title: "Adoption hurdles" },
  { id: "2", title: "Pricing pushback" },
  { id: "3", title: "Referral triggers" },
  { id: "4", title: "Best-case future" },
  { id: "5", title: "Worst-case scenario" },
  { id: "6", title: "React to a price increase" },
  { id: "7", title: "Rate a new feature" },
  { id: "8", title: "Compare competitors" },
  { id: "9", title: "Discuss ideal workflow" },
  { id: "10", title: "Needs at work" },
];

// Sample initial insights
export const INITIAL_INSIGHTS: Insight[] = [
  {
    id: "initial-1",
    text: "Young engineers crave public praise moments inside productivity tools.",
    source: "System",
    isSystemGenerated: true,
    timestamp: new Date(),
  }
];