
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shuffle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoodboards, MoodboardTile } from '@/contexts/MoodboardsContext';
import { TalkToAIButton } from './FloatingAIPanel';
import Masonry from 'react-masonry-css';

// Create an extended repository of fixed, reliable images for all categories
const imageRepository = {
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
    'https://images.unsplash.com/photo-1504194104404-433180773017',
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

// Add some fallback images for any case
const fallbackImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'
];

interface MasonryTileProps {
  tile: MoodboardTile;
  onSwap: () => void;
  onDelete: () => void;
  onOpenAI: () => void;
  boardIndex: number;
  tileIndex: number;
}

const MasonryTile: React.FC<MasonryTileProps> = ({ 
  tile, 
  onSwap, 
  onDelete, 
  onOpenAI,
  boardIndex,
  tileIndex
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { width, height, category } = tile;
  
  const tileStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    marginBottom: '16px'
  };
  
  const getRealImageUrl = (): string => {
    if (imageError) {
      // If we had an error loading the image, use a fallback
      return fallbackImages[tileIndex % fallbackImages.length];
    }

    // Get a specific image for this category from our repository
    const categoryKey = category as keyof typeof imageRepository;
    const images = imageRepository[categoryKey] || fallbackImages;
    
    // Use the board index to offset which image we select, ensuring different boards get different images
    // We multiply by a prime number (17) to ensure good distribution
    const imageIndex = ((boardIndex * 17) + tileIndex) % images.length;
    const baseUrl = images[imageIndex];
    
    // Add parameters to prevent caching and to make the URL unique
    return `${baseUrl}?q=80&w=${width}&h=${height}&auto=format&fit=crop&board=${boardIndex}&tile=${tileIndex}`;
  };

  return (
    <motion.div
      className="relative group"
      style={tileStyle}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full rounded-lg overflow-hidden bg-muted/30 border border-border/20">
        <img
          src={getRealImageUrl()}
          alt={`${category} image`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      
      <div className="absolute top-2 left-2 bg-[#262626]/80 backdrop-blur-sm text-[10px] uppercase px-2 py-1 rounded font-medium">
        {category}
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg flex flex-col justify-center items-center"
          >
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={onSwap}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Swap
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={onDelete}
              >
                <X className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
            
            <div className="mt-2">
              <TalkToAIButton onClick={onOpenAI} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface MoodboardBuilderViewProps {
  onOpenAI: (context: string, prompts?: string[]) => void;
}

const MoodboardBuilderView: React.FC<MoodboardBuilderViewProps> = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const { moodboards, shuffleMoodboard, swapMoodboardTile, removeMoodboardTile } = useMoodboards();
  const [activeMoodboard, setActiveMoodboard] = useState<string | null>(
    moodboards.length > 0 ? moodboards[0].id : null
  );
  
  const currentMoodboard = moodboards.find(board => board.id === activeMoodboard);
  
  const handleTabChange = (value: string) => {
    setActiveMoodboard(value);
  };
  
  const handleShuffleMoodboard = () => {
    if (activeMoodboard) {
      shuffleMoodboard(activeMoodboard);
    }
  };
  
  const handleOpenAI = (category: string) => {
    const prompts = ["Find a more subtle image", "Suggest a different style", "Find something more unique"];
    
    switch (category) {
      case 'TEXTURE':
        onOpenAI('Texture Image', ["Find subtler texture", "More organic pattern", "Tech-inspired texture"]);
        break;
      case 'TYPOGRAPHY':
        onOpenAI('Typography', ["More modern font examples", "Serif typography alternatives", "Tech brand typography"]);
        break;
      case 'COLOR SWATCH':
        onOpenAI('Color Palette', ["Darker color scheme", "Brighter accent colors", "More premium color palette"]);
        break;
      default:
        onOpenAI(`${category} Image`, prompts);
    }
  };
  
  const handleNavigateToCompare = () => {
    navigate('/step/5/compare');
  };
  
  // Extract board index from ID for image variety
  const getBoardIndex = (moodboardId: string): number => {
    if (moodboardId.includes('dir1')) return 1;
    if (moodboardId.includes('dir2')) return 2;
    if (moodboardId.includes('dir-3')) return 3;
    if (moodboardId.includes('dir-4')) return 4;
    if (moodboardId.includes('dir-5')) return 5;
    if (moodboardId.includes('dir-6')) return 6;
    if (moodboardId.includes('dir-7')) return 7;
    if (moodboardId.includes('dir-8')) return 8;
    
    // Extract any number from the ID as a fallback
    const match = moodboardId.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };
  
  // Enhanced title formatting to replace "Direction X" with meaningful names
  const formatMoodboardTitle = (title: string): string => {
    // If the title starts with "Direction " followed by a number, replace it with something better
    if (/^Direction \d+$/.test(title)) {
      const directionNames = [
        "Digital Horizon", 
        "Refined Elegance",
        "Future Forward",
        "Bold Frontiers",
        "Cosmic Vision",
        "Pristine Clarity",
        "Living Innovation",
        "Vibrant Impact"
      ];
      
      // Extract the direction number and map to a name
      const dirNum = parseInt(title.replace("Direction ", "")) || 0;
      return directionNames[(dirNum - 1) % directionNames.length];
    }
    
    return title;
  };
  
  return (
    <div className="min-h-[calc(100vh-88px)] flex flex-col p-8">
      <div className="flex justify-between items-center mb-8 px-10">
        <Tabs
          value={activeMoodboard || ''}
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList>
            {moodboards.map(board => (
              <TabsTrigger
                key={board.id}
                value={board.id}
                className="px-5 data-[state=active]:bg-cyan data-[state=active]:text-black"
              >
                {formatMoodboardTitle(board.direction.title)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleShuffleMoodboard}
          >
            <Shuffle className="h-4 w-4" />
            Shuffle board
          </Button>
          
          <Button 
            onClick={handleNavigateToCompare}
            className="bg-cyan text-black hover:bg-cyan/90"
          >
            Compare boards →
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-10">
        {currentMoodboard && (
          <Masonry
            breakpointCols={{
              default: 4,
              1200: 3,
              900: 2,
              500: 1
            }}
            className="flex w-auto -ml-4"
            columnClassName="pl-4"
          >
            {currentMoodboard.tiles.map((tile, index) => (
              <MasonryTile
                key={tile.id}
                tile={tile}
                boardIndex={getBoardIndex(currentMoodboard.id)}
                tileIndex={index}
                onSwap={() => swapMoodboardTile(
                  currentMoodboard.id,
                  tile.id,
                  `New ${tile.category.toLowerCase()} image`
                )}
                onDelete={() => removeMoodboardTile(currentMoodboard.id, tile.id)}
                onOpenAI={() => handleOpenAI(tile.category)}
              />
            ))}
          </Masonry>
        )}
        
        {!currentMoodboard && (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No moodboard selected. Please select 3 directions first.
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodboardBuilderView;
