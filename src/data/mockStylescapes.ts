import { StylescapeRow } from '@/contexts/StylescapesContext';

// Use verified Unsplash images
export const UNSPLASH_IMAGES = {
  headline: [
    // Updated the first headline image for "COUCH FEEL" that was broken
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format",
    "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format",
    "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&auto=format"
  ],
  hero: [
    "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=800&auto=format",
    "https://images.unsplash.com/photo-1439886183900-e79ec0057170?w=800&auto=format",
    "https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=800&auto=format"
  ],
  texture: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&auto=format",
    "https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=800&auto=format"
  ],
  context: [
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format",
    "https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=800&auto=format", 
    "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format"
  ],
  emoji: [
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format",
    "https://images.unsplash.com/photo-1452960962994-acf4fd70b632?w=800&auto=format",
    "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format"
  ]
};

export const DEFAULT_STYLESCAPE_ROWS: StylescapeRow[] = [
  {
    id: "row1",
    theme: "COUCH FEEL",
    themeEmoji: "😌",
    relevance: 0.78,
    queries: [
      "living-room football friends laughing",
      "close-up console controller warm light",
      "velvet sofa macro olive tone",
      "smart-tv sports on wall mockup",
      "friendly emoji pack hugging thumbs-up"
    ],
    panels: [
      { id: "row1_p1", role: "HEADLINE", img: UNSPLASH_IMAGES.headline[0], query: "living-room football friends laughing" },
      { id: "row1_p2", role: "HERO PEOPLE", img: UNSPLASH_IMAGES.hero[0], query: "close-up console controller warm light" },
      { id: "row1_p3", role: "TEXTURE & COLOUR", img: UNSPLASH_IMAGES.texture[0], query: "velvet sofa macro olive tone" },
      { id: "row1_p4", role: "CONTEXT SHOT", img: UNSPLASH_IMAGES.context[0], query: "smart-tv sports on wall mockup" },
      { id: "row1_p5", role: "EMOJI/ICON CLUSTER", img: UNSPLASH_IMAGES.emoji[0], query: "friendly emoji pack hugging thumbs-up" },
    ],
    chips: ["Friendly 🤗", "Casual 🤷", "Social 👯", "Nostalgic 👶", "Relatable 🙂", "Inclusive 🤝"]
  },
  {
    id: "row2",
    theme: "STREET FEEL",
    themeEmoji: "😤",
    relevance: 0.82,
    queries: [
      "urban night alley neon football juggling",
      "dynamic motion blur street athlete",
      "graffiti wall peeling paint high-contrast",
      "wheat-paste poster mockup grunge",
      "angry spray-paint emoji sheet"
    ],
    panels: [
      { id: "row2_p1", role: "HEADLINE", img: UNSPLASH_IMAGES.headline[1], query: "urban night alley neon football juggling" },
      { id: "row2_p2", role: "HERO PEOPLE", img: UNSPLASH_IMAGES.hero[1], query: "dynamic motion blur street athlete" },
      { id: "row2_p3", role: "TEXTURE & COLOUR", img: UNSPLASH_IMAGES.texture[1], query: "graffiti wall peeling paint high-contrast" },
      { id: "row2_p4", role: "CONTEXT SHOT", img: UNSPLASH_IMAGES.context[1], query: "wheat-paste poster mockup grunge" },
      { id: "row2_p5", role: "EMOJI/ICON CLUSTER", img: UNSPLASH_IMAGES.emoji[1], query: "angry spray-paint emoji sheet" },
    ],
    chips: ["Active 🏃", "Die-hard 🤾", "Unconventional 🙃", "Raw 🤬", "Underground 🕳", "Rebellious 😤"]
  },
  {
    id: "row3",
    theme: "FUTURE TECH",
    themeEmoji: "⚡",
    relevance: 0.75,
    queries: [
      "digital grid holographic tunnel",
      "LED suit runner cyberpunk",
      "dark iridescent metal surface macro",
      "AR HUD screen in hand",
      "glitch 3D futurist icon set"
    ],
    panels: [
      { id: "row3_p1", role: "HEADLINE", img: UNSPLASH_IMAGES.headline[2], query: "digital grid holographic tunnel" },
      { id: "row3_p2", role: "HERO PEOPLE", img: UNSPLASH_IMAGES.hero[2], query: "LED suit runner cyberpunk" },
      { id: "row3_p3", role: "TEXTURE & COLOUR", img: UNSPLASH_IMAGES.texture[2], query: "dark iridescent metal surface macro" },
      { id: "row3_p4", role: "CONTEXT SHOT", img: UNSPLASH_IMAGES.context[2], query: "AR HUD screen in hand" },
      { id: "row3_p5", role: "EMOJI/ICON CLUSTER", img: UNSPLASH_IMAGES.emoji[2], query: "glitch 3D futurist icon set" },
    ],
    chips: ["Innovative 🚀", "Sleek 💎", "Digital 💻", "Cutting-edge 🔪", "Futuristic 🤖", "High-tech 📱"]
  }
];