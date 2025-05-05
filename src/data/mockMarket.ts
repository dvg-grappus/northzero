// Market module mock data
export const MOCK_STATS = [
  {
    id: "stat1",
    value: "$26 B",
    description: "Global spend on AI recruiting tools (2023)",
    source: "Deloitte",
    url: "deloitte.com/ai-ats-2023",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Spend"
  },
  {
    id: "stat2",
    value: "37%",
    description: "Projected growth of HR tech in APAC (2024-27)",
    source: "Gartner",
    url: "gartner.com/hr-tech-forecast",
    accepted: false,
    region: "APAC",
    year: "2024",
    metric: "CAGR"
  },
  {
    id: "stat3",
    value: "68%",
    description: "Enterprise HR departments using AI screening (2023)",
    source: "McKinsey",
    url: "mckinsey.com/future-of-work",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Adoption"
  },
  {
    id: "stat4",
    value: "$4.2 K",
    description: "Average cost-per-hire reduction with AI tools",
    source: "LinkedIn",
    url: "linkedin.com/business/talent/reports",
    accepted: false,
    region: "North America",
    year: "2022",
    metric: "Cost Savings"
  },
  {
    id: "stat5",
    value: "42%",
    description: "Decrease in time-to-fill positions using AI matching",
    source: "Indeed",
    url: "indeed.com/lead/hiring-stats",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Efficiency"
  },
  {
    id: "stat6",
    value: "92%",
    description: "HR leaders plan to increase tech investment",
    source: "SHRM",
    url: "shrm.org/tech-survey",
    accepted: false,
    region: "North America",
    year: "2023",
    metric: "Investment"
  },
  {
    id: "stat7",
    value: "$122 M",
    description: "VC funding for HR tech startups (Q1 2023)",
    source: "CBInsights",
    url: "cbinsights.com/hr-tech",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Investment"
  },
  {
    id: "stat8",
    value: "3.2×",
    description: "ROI for companies using AI recruitment",
    source: "Bersin",
    url: "bersin.com/research/ai-talent",
    accepted: false,
    region: "Global",
    year: "2022",
    metric: "ROI"
  },
  {
    id: "stat9",
    value: "18%",
    description: "Annual growth in employee experience platforms",
    source: "Forrester",
    url: "forrester.com/hr-tech-wave",
    accepted: false,
    region: "Global",
    year: "2024",
    metric: "Growth"
  },
  {
    id: "stat10",
    value: "76%",
    description: "Companies citing skills gap as hiring challenge",
    source: "PwC",
    url: "pwc.com/workforce-trends",
    accepted: false,
    region: "Europe",
    year: "2023",
    metric: "Challenge"
  },
  {
    id: "stat11",
    value: "$1.8 B",
    description: "Market size for employee wellness technology",
    source: "Grand View Research",
    url: "grandviewresearch.com/wellness-tech",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Market Size"
  },
  {
    id: "stat12",
    value: "52%",
    description: "Job seekers using mobile exclusively for search",
    source: "Glassdoor",
    url: "glassdoor.com/trends/mobile",
    accepted: false,
    region: "Global",
    year: "2023",
    metric: "Behavior"
  }
];

// Mock data for chatter cards
export const MOCK_CHATTER_CARDS = [
  {
    id: "chat1",
    source: "twitter",
    content: "Just got my role via an AI chat-based interview. Future is here.",
    likes: 1400,
    reposts: 284,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat2",
    source: "linkedin",
    content: "Hiring teams hate toggling 5 dashboards; single pane needed.",
    likes: 312,
    reposts: 78,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat3",
    source: "medium",
    content: "AI hiring isn't just about efficiency; it's about removing unconscious bias from the equation entirely.",
    likes: 933,
    reposts: 155,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat4",
    source: "twitter",
    content: "Spent $20K on recruiting software last year. Got 2 decent hires. This system is broken.",
    likes: 2100,
    reposts: 450,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat5",
    source: "linkedin",
    content: "Remote work requires better talent screening tools. Period.",
    likes: 876,
    reposts: 122,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat6",
    source: "medium",
    content: "The gap between hiring tech and actual human connection is widening. We need both.",
    likes: 504,
    reposts: 87,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat7",
    source: "twitter",
    content: "Diverse candidates still getting filtered by \"AI\" that's trained on biased data. Not progress.",
    likes: 3200,
    reposts: 788,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat8",
    source: "linkedin",
    content: "Just tested 5 AI resume scanners with identical content but different names. Results were... enlightening.",
    likes: 5400,
    reposts: 1200,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat9",
    source: "medium",
    content: "The future of HR isn't about replacing humans—it's about augmenting capabilities where we're naturally weakest.",
    likes: 722,
    reposts: 134,
    saved: false,
    muted: false,
    originalUrl: "#"
  },
  {
    id: "chat10",
    source: "twitter",
    content: "Anyone else notice how talent marketplaces are replacing traditional recruiting agencies? Massive shift happening.",
    likes: 987,
    reposts: 213,
    saved: false,
    muted: false,
    originalUrl: "#"
  }
];

// Mock data for library items
export const MOCK_LIBRARY_ITEMS = [
  {
    id: "lib1",
    type: "report",
    title: "PwC Future of Talent 2024 (72 pp)",
    saved: false,
    viewed: false,
    content: "This report explores the changing dynamics of talent acquisition...",
    url: "#",
    previewUrl: "/placeholder.svg" 
  },
  {
    id: "lib2",
    type: "case-study",
    title: "Spotify's squad culture framework",
    saved: false,
    viewed: false,
    content: "How Spotify restructured their talent organization to promote agility...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib3",
    type: "graph",
    title: "VC investment in HR Tech by quarter",
    saved: false,
    viewed: false,
    content: "Quarterly investment trends in HR Technology startups...",
    data: {
      labels: ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
      datasets: [
        {
          label: 'Investment in $M',
          data: [120, 145, 132, 165, 178, 156, 201, 235],
          borderColor: '#7DF9FF',
          tension: 0.4
        }
      ]
    }
  },
  {
    id: "lib4",
    type: "report",
    title: "Accenture: Future of Work 2025",
    saved: false,
    viewed: false,
    content: "This report details how AI and automation will reshape work environments...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib5",
    type: "case-study",
    title: "Netflix's hyper-personalised UI",
    saved: false,
    viewed: false,
    content: "How Netflix applies personalization techniques to their user interface...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib6",
    type: "graph",
    title: "ARPU growth vs churn (2018-24)",
    saved: false,
    viewed: false,
    content: "Analysis of average revenue per user growth compared to customer churn rates...",
    data: {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'ARPU ($)',
          data: [42, 45, 50, 58, 63, 69, 75],
          borderColor: '#7DF9FF',
          tension: 0.4
        },
        {
          label: 'Churn Rate (%)',
          data: [12, 11, 8, 7.5, 6.8, 6.2, 5.8],
          borderColor: '#FF6363',
          tension: 0.4
        }
      ]
    }
  },
  {
    id: "lib7",
    type: "report",
    title: "Deloitte: HR Tech Stack Survey 2023",
    saved: false,
    viewed: false,
    content: "Key findings from Deloitte's annual survey of HR technology adoption...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib8",
    type: "case-study",
    title: "Airbnb's Remote-First Transition",
    saved: false,
    viewed: false,
    content: "How Airbnb rebuilt their talent processes for a distributed workforce...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib9",
    type: "graph",
    title: "Remote vs In-Office Productivity Metrics",
    saved: false,
    viewed: false,
    content: "Comparative analysis of productivity metrics across remote and in-office workers...",
    data: {
      labels: ['Focus Time', 'Meeting Hours', 'Project Completion', 'Collaboration', 'Satisfaction'],
      datasets: [
        {
          label: 'Remote',
          data: [78, 65, 82, 72, 88],
          backgroundColor: 'rgba(125, 249, 255, 0.6)',
        },
        {
          label: 'In-Office',
          data: [62, 85, 75, 88, 76],
          backgroundColor: 'rgba(255, 99, 99, 0.6)',
        }
      ]
    }
  },
  {
    id: "lib10",
    type: "report",
    title: "McKinsey: Global Workforce Trends 2024",
    saved: false,
    viewed: false,
    content: "Analysis of major workforce shifts and strategic responses...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib11",
    type: "case-study",
    title: "Google's Project Oxygen Findings",
    saved: false,
    viewed: false,
    content: "How Google identified key management behaviors that drive team success...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib12",
    type: "graph",
    title: "Skills Gap Trend by Industry Sector",
    saved: false,
    viewed: false,
    content: "Analysis of skills gap severity across different industry sectors...",
    data: {
      labels: ['Tech', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'],
      datasets: [
        {
          label: '2020',
          data: [76, 52, 48, 65, 41],
          backgroundColor: 'rgba(125, 249, 255, 0.6)',
        },
        {
          label: '2023',
          data: [82, 68, 59, 72, 55],
          backgroundColor: 'rgba(253, 213, 111, 0.6)',
        }
      ]
    }
  },
  {
    id: "lib13",
    type: "report",
    title: "Gartner: HR Technology Magic Quadrant 2023",
    saved: false,
    viewed: false,
    content: "Evaluation of leading HR technology vendors and platforms...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib14",
    type: "case-study",
    title: "Microsoft's Talent Data Lake Implementation",
    saved: false,
    viewed: false,
    content: "How Microsoft unified disparate talent data sources to improve decision making...",
    url: "#",
    previewUrl: "/placeholder.svg"
  },
  {
    id: "lib15",
    type: "graph",
    title: "Time-to-Hire Benchmark by Company Size",
    saved: false,
    viewed: false,
    content: "Analysis of average time-to-hire across different company size segments...",
    data: {
      labels: ['<50', '50-200', '201-1000', '1001-5000', '>5000'],
      datasets: [
        {
          label: 'Days to Hire',
          data: [18, 25, 32, 48, 62],
          backgroundColor: 'rgba(125, 249, 255, 0.8)',
        }
      ]
    }
  }
];

// Mock data for market insights
export const MOCK_MARKET_INSIGHTS = [
  {
    id: "mi1",
    text: "68% of enterprise HR departments now use AI screening tools",
    source: "McKinsey Research",
    type: "stat",
    starred: true,
    column: "market"
  },
  {
    id: "mi2",
    text: "AI-driven recruitment shows 3.2× ROI compared to traditional methods",
    source: "Industry Report",
    type: "stat",
    starred: true,
    column: "market"
  },
  {
    id: "mi3",
    text: "Remote hiring practices have increased talent pool diversity by 47%",
    source: "LinkedIn Insights",
    type: "social",
    starred: true,
    column: "market"
  },
  {
    id: "mi4",
    text: "Talent marketplace adoption grew 58% YoY in tech sector",
    source: "Market Analysis",
    type: "library",
    starred: true,
    column: "market"
  },
  {
    id: "mi5",
    text: "AI screening reduces time-to-hire by average of 42%",
    source: "Research Report",
    type: "stat",
    starred: true,
    column: "market"
  }
];