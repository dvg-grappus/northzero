import { KeywordCategory, Keyword, DirectionCard, ImageCategory } from '@/contexts/MoodboardsContext';

// Seed keywords as specified in the spec
export const SEED_KEYWORDS: Record<KeywordCategory, string[]> = {
  'Culture': ['Ambitious', 'Pure', 'Redefining', 'Simplify', 'Optimism'],
  'Customer': ['Result-seeking', 'Youthful', 'Anxious', 'Curious', 'Goal-oriented'],
  'Voice': ['Jargon-free', 'Optimistic', 'Engaging', 'Feminine', 'Fun'],
  'Feel': ['Empowered', 'Comforted', 'Mindful', 'In-control', 'Aware'],
  'Impact': ['Wellness', 'Fitness', 'Coaching', 'Self-esteem'],
  'X-Factor': ['Iterative', 'Algorithmic', 'Intuitive', 'Gamified', 'Innovative']
};

// Sample direction cards
export const SEED_DIRECTIONS: Partial<DirectionCard>[] = [
  {
    id: "dir1",
    title: "Spark of Innovation",
    tags: ["FUTURISTIC", "TECHNICAL", "PROGRESSIVE", "ASPIRATIONAL"],
    description: "Think limitless possibilities. Think fluid interactions. Where digital meets physical, each touchpoint creates moments of delight and discovery.",
    relevance: 86,
    thumbnails: [
      "Neon-edged mobile dashboard in dark UI",
      "Iridescent gradient archway installation",
      "Macro photo of diffraction lens"
    ],
    selected: false
  },
  {
    id: "dir2",
    title: "Intentional Minimalism",
    tags: ["REGAL", "UNDERSTATED", "EXPERT", "CONFIDENT"],
    description: "Envision a space where minimalism isn't just aesthetic—it's transformative. Clean lines and thoughtful design create breathing room for ideas to flourish.",
    relevance: 92,
    thumbnails: [
      "Stationery set on grey linen",
      "Wide billboard with sparse serif headline",
      "Beige modular grid web mock-up"
    ],
    selected: false
  }
];

// Image category suggestions for Unsplash
export const IMAGE_CATEGORY_SUGGESTIONS: Record<ImageCategory, string> = {
  'BACKGROUND STYLE': "abstract gradient dark cyan",
  'TYPOGRAPHY': "magazine serif headline close-up",
  'LAYOUT': "mobile app clean dashboard ui",
  'ICON/ILLUSTRATION': "outlined interface icons set",
  'PHOTO TREATMENT': "business portrait duotone",
  'TEXTURE': "carbon fibre macro pattern",
  'COLOR SWATCH': "cyan gradient",
  'MOTION REF': "looping neon ring gif",
  'PRINT COLLATERAL': "foil stamped business card black",
  'ENVIRONMENT': "modern lobby lighting installation",
  'WILD CARD': "AI generated vaporwave sculpture"
};

// Image dimensions by category
export const IMAGE_DIMENSIONS: Record<ImageCategory, { width: number, height: number }> = {
  'BACKGROUND STYLE': { width: 440, height: 280 },
  'TYPOGRAPHY': { width: 300, height: 180 },
  'LAYOUT': { width: 300, height: 300 },
  'ICON/ILLUSTRATION': { width: 200, height: 200 },
  'PHOTO TREATMENT': { width: 300, height: 400 },
  'TEXTURE': { width: 200, height: 200 },
  'COLOR SWATCH': { width: 200, height: 120 },
  'MOTION REF': { width: 260, height: 260 },
  'PRINT COLLATERAL': { width: 300, height: 200 },
  'ENVIRONMENT': { width: 440, height: 300 },
  'WILD CARD': { width: 320, height: 240 }
};

// Image repository for moodboards
export const IMAGE_REPOSITORY = {
  'BACKGROUND STYLE': [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d'
  ],
  'TYPOGRAPHY': [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
    'https://images.unsplash.com/photo-1498936178812-4b2e558d2937',
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
    'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    'https://images.unsplash.com/photo-1618761714954-0b8cd0026356',
    'https://images.unsplash.com/photo-1456081445129-830eb8d4bfc6'
  ],
  'LAYOUT': [
    'https://images.unsplash.com/photo-1481487196290-c152efe083f5',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a',
    'https://images.unsplash.com/photo-1572044162444-ad60f128bdea',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e',
    'https://images.unsplash.com/photo-1558655146-d09347e92766'
  ],
  'ICON/ILLUSTRATION': [
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d',
    'https://images.unsplash.com/photo-1558655146-d09347e92766',
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868',
    'https://images.unsplash.com/photo-1629752187687-3d3c7ea3a21b',
    'https://images.unsplash.com/photo-1624996379697-f01d168b1a52',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d',
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
    'https://images.unsplash.com/photo-1614332287897-cdc485fa562d'
  ],
  'PHOTO TREATMENT': [
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
    'https://images.unsplash.com/photo-1549388604-817d15aa0110',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
    'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7',
    'https://images.unsplash.com/photo-1516962126636-27bf1c5b898f',
    'https://images.unsplash.com/photo-1580121441575-41bcb5c6b47c',
    'https://images.unsplash.com/photo-1544080917-d09a973fe808',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'
  ],
  'TEXTURE': [
    'https://images.unsplash.com/photo-1493397212122-2b85dda8106b',
    'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1',
    'https://images.unsplash.com/photo-1520333789090-1afc82db536a',
    'https://images.unsplash.com/photo-1604147706283-d7119b5b822c',
    'https://images.unsplash.com/photo-1556139902-7367723b433e',
    'https://images.unsplash.com/photo-1618764400608-7e989d40caeb',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b',
    'https://images.unsplash.com/photo-1601225998662-12aca8c19264'
  ],
  'COLOR SWATCH': [
    'https://images.unsplash.com/photo-1589365278144-c9e705f843ba',
    'https://images.unsplash.com/photo-1541140134513-85a161dc4a00',
    'https://images.unsplash.com/photo-1513346940221-6f673d962e97',
    'https://images.unsplash.com/photo-1507908708918-778587c9e563',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17',
    'https://images.unsplash.com/photo-1589395937772-f67057e233df',
    'https://images.unsplash.com/photo-1557682250-81bd739a0946',
    'https://images.unsplash.com/photo-1558244661-d248897f7bc4'
  ],
  'MOTION REF': [
    'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    'https://images.unsplash.com/photo-1543857778-c4a1a9e0615f',
    'https://images.unsplash.com/photo-1492037766660-2a56f9eb3fcb',
    'https://images.unsplash.com/photo-1600758208050-a22f17dc5bb9',
    'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b',
    'https://images.unsplash.com/photo-1504193104404-433180773017',
    'https://images.unsplash.com/photo-1574610409244-057e688706c0',
    'https://images.unsplash.com/photo-1620510625142-b45cbb784397'
  ],
  'PRINT COLLATERAL': [
    'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3',
    'https://images.unsplash.com/photo-1544516229-5150a1bbc973',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111',
    'https://images.unsplash.com/photo-1506784926709-22f1ec395907',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
    'https://images.unsplash.com/photo-1579751626657-72bc17010498',
    'https://images.unsplash.com/photo-1532105956626-9569c03602f6',
    'https://images.unsplash.com/photo-1616654052439-760f53943a56'
  ],
  'ENVIRONMENT': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1511884642898-4c92249e20b6',
    'https://images.unsplash.com/photo-1506259091721-347e791bab0f',
    'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2',
    'https://images.unsplash.com/photo-1499955085172-a104c9463ece',
    'https://images.unsplash.com/photo-1577639673027-1338d246196a'
  ],
  'WILD CARD': [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    'https://images.unsplash.com/photo-1512641406448-6574e777bec6',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb',
    'https://images.unsplash.com/photo-1633484872497-d01466700dba',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21'
  ],
};

// Fallback images for any case
export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'
];