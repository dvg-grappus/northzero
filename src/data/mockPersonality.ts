import { ArchetypeData, KeywordData, ConflictPair, SliderData, BrandData, CombinationData, DichotomyData } from '@/providers/PersonalityProvider';

// Archetype mock data
export const ARCHETYPE_DATA: ArchetypeData[] = [
  { name: "Innocent", match: 35, selected: false },
  { name: "Explorer", match: 62, selected: false },
  { name: "Sage", match: 48, selected: false },
  { name: "Creator", match: 72, selected: false },
  { name: "Outlaw", match: 18, selected: false },
  { name: "Magician", match: 55, selected: false },
  { name: "Hero", match: 21, selected: false },
  { name: "Lover", match: 27, selected: false },
  { name: "Jester", match: 31, selected: false },
  { name: "Everyman", match: 43, selected: false },
  { name: "Caregiver", match: 29, selected: false },
  { name: "Ruler", match: 24, selected: false },
];

// Mock brand logo mapping - in a real app, these would be image URLs
export const MOCK_BRANDS: BrandData[] = [
  { name: "Nike", logo: "N", description: "Athletic innovation with emotional storytelling" },
  { name: "Tesla", logo: "T", description: "Future-forward technology with bold design language" },
  { name: "Apple", logo: "A", description: "Premium simplicity with human-centered experience" },
  { name: "Netflix", logo: "N", description: "Disruptive storytelling with personalized content" },
  { name: "Airbnb", logo: "A", description: "Human connection with authentic local experiences" },
  { name: "Patagonia", logo: "P", description: "Sustainable quality with environmental activism" },
  { name: "Lego", logo: "L", description: "Creative play with systematic construction" },
  { name: "Adobe", logo: "A", description: "Creative tools with professional precision" },
  { name: "Chanel", logo: "C", description: "Timeless luxury with elegant minimalism" },
  { name: "Spotify", logo: "S", description: "Music discovery with personalized curation" },
  { name: "IKEA", logo: "I", description: "Democratic design with functional simplicity" },
  { name: "Stripe", logo: "S", description: "Developer-first with clean infrastructure" },
  { name: "Mercedes", logo: "M", description: "Engineering excellence with premium craftsmanship" },
  { name: "Starbucks", logo: "S", description: "Coffee ritual with consistent community space" },
  { name: "Disney", logo: "D", description: "Magical storytelling with nostalgic emotion" },
];

// Mock keywords with default selections
export const KEYWORD_DATA: KeywordData[] = [
  { name: "Bold", selected: true },
  { name: "Helpful", selected: false },
  { name: "Serious", selected: false },
  { name: "Adventurous", selected: false },
  { name: "Imaginative", selected: false },
  { name: "Youthful", selected: false },
  { name: "Dependable", selected: true },
  { name: "Friendly", selected: false },
  { name: "Expertise", selected: false },
  { name: "Quiet", selected: false },
  { name: "Noble", selected: false },
  { name: "Whimsical", selected: false },
  { name: "Masculine", selected: false },
  { name: "Feminine", selected: false },
  { name: "Cooperative", selected: false },
  { name: "Edgy", selected: false },
  { name: "Conservative", selected: false },
  { name: "Innovative", selected: true },
  { name: "Mature", selected: false },
  { name: "Calm", selected: false },
  { name: "Luxurious", selected: false },
  { name: "Humorous", selected: false },
  { name: "Mysterious", selected: false },
  { name: "Earnest", selected: false },
  { name: "Warm", selected: false },
  { name: "Healthy", selected: false },
  { name: "Worldly", selected: false },
  { name: "Glamorous", selected: false },
  { name: "Old-fashioned", selected: false },
  { name: "Sweet", selected: false },
  { name: "Cosmopolitan", selected: false },
  { name: "Gentle", selected: false },
  { name: "Humble", selected: false },
  { name: "Energetic", selected: false },
  { name: "Caring", selected: false },
  { name: "Light-hearted", selected: false },
  { name: "Rational", selected: false },
  { name: "Witty", selected: false },
  { name: "Altruistic", selected: false },
  { name: "Tough", selected: false },
  { name: "Confident", selected: true },
  { name: "Leader", selected: false },
  { name: "Relaxed", selected: false },
  { name: "Quirky", selected: false },
  { name: "Intellectual", selected: false },
  { name: "Clever", selected: false },
  { name: "Feisty", selected: false },
  { name: "Competent", selected: true },
  { name: "Spiritual", selected: false },
  { name: "Liberal", selected: false },
  { name: "Sophisticated", selected: false },
];

// Conflict pairs
export const CONFLICT_PAIRS_DATA: ConflictPair[] = [
  ["Dependable", "Rebellious"],
  ["Humble", "Luxurious"],
  ["Quiet", "Loud"],
];

// Slider data
export const SLIDER_DATA: SliderData[] = [
  {
    axis: "Serious ↔ Playful",
    leftBrand: "LinkedIn",
    rightBrand: "Snapchat",
    value: 5, // Middle position
    tooltips: [
      "Edge 7-9 may alienate enterprise buyers.",
      "Too serious might bore Gen Z users.",
      "Mid-range balances approachability with credibility.",
      "Slight playfulness improves engagement.",
      "This area works for most B2B SaaS products.",
      "Consumer products trend right of center.",
      "Educational content needs left positioning.",
      "Social platforms live 7-10 on this scale.",
      "Financial services cluster 1-3 typically.",
      "Health tech balances at 4-6 for trust."
    ],
  },
  {
    axis: "Conventional ↔ Rebel",
    leftBrand: "Honda",
    rightBrand: "Tesla",
    value: 5,
    tooltips: [
      "Going full rebel? Expect polarised PR.",
      "Most legacy brands operate at 2-4 here.",
      "Emerging tech startups thrive at 7-9.",
      "Mid-range lets you innovate without alienating.",
      "Finance & healthcare rarely exceed 6.",
      "Most D2C disruptors live at 8-10.",
      "Regulated industries cluster below 5.",
      "Consumer packaged goods average 3-6.",
      "Social impact brands often push 7-9.",
      "Modern B2B SaaS trends to 6-7."
    ],
  },
  {
    axis: "Cordial ↔ Authority",
    leftBrand: "Swatch",
    rightBrand: "Rolex",
    value: 5,
    tooltips: [
      "Too authoritative risks seeming arrogant.",
      "Experts deserve higher authority positions.",
      "Entertainment skews cordial (1-4).",
      "Medical and legal benefit from 7-9 authority.",
      "Tech products balance around 4-6.",
      "Educational brands thrive at 6-8.",
      "Consumer apps rarely exceed 5.",
      "Financial services cluster 6-9.",
      "Food & beverage brands perform best 2-4.",
      "Luxury retail demands 7-10 positioning."
    ],
  },
  {
    axis: "Mature ↔ Youthful",
    leftBrand: "Taj",
    rightBrand: "Airbnb",
    value: 5,
    tooltips: [
      "Enterprise audiences respond to 3-5 maturity.",
      "Youth brands risk alienating older demographics above 8.",
      "Multi-generational appeal works best 4-6.",
      "1-3 feels traditional, established, sometimes rigid.",
      "8-10 can appear inexperienced to senior buyers.",
      "Financial services rarely exceed 4.",
      "Youth-oriented consumer tech thrives 7-10.",
      "Established tech balances at 5-7.",
      "Healthcare and insurance cluster 2-4.",
      "Media and entertainment span full spectrum."
    ],
  },
  {
    axis: "Limited ↔ Mass",
    leftBrand: "Hermès",
    rightBrand: "H&M",
    value: 5,
    tooltips: [
      "Premium products require 1-4 positioning.",
      "Volume businesses need 7-10 approachability.",
      "Mid-market brands balance at 5-6.",
      "Too limited (1-2) restricts growth potential.",
      "Too mass (9-10) sacrifices premium perception.",
      "Tech startups often begin 2-4, then move right.",
      "Enterprise solutions cluster 3-5.",
      "Consumer staples thrive at 7-9.",
      "Luxury services require 1-3 positioning.",
      "Mainstream entertainment aims for 6-8."
    ],
  },
];

// Default dichotomy data
export const DEFAULT_DICHOTOMY: DichotomyData = {
  wordOne: "Competent",
  wordTwo: "Meaningful",
  notWordOne: "Authoritative",
  notWordTwo: "Loud",
};