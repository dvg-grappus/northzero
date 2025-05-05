
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Trash2, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMoodboards } from '@/contexts/MoodboardsContext';
import { TalkToAIButton } from './FloatingAIPanel';

interface DirectionCardProps {
  id: string;
  title: string;
  tags: string[];
  description: string;
  relevance: number;
  thumbnails: string[];
  selected: boolean;
  onSelect: (id: string) => void;
  onReplace: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAI: (context: string) => void;
}

const DirectionCard: React.FC<DirectionCardProps> = ({
  id,
  title,
  tags,
  description,
  relevance,
  thumbnails,
  selected,
  onSelect,
  onReplace,
  onDelete,
  onOpenAI
}) => {
  // Generate a unique hash for each card to ensure images are unique
  const uniqueHash = id + Math.random().toString(36).substring(2, 8);
  
  return (
    <div 
      className={`w-full h-[300px] rounded-lg relative overflow-hidden mb-6 cursor-pointer ${
        selected ? 'border-2 border-cyan' : 'border border-border/30'
      }`}
      onClick={() => onSelect(id)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4 z-30">
        <div 
          className={`h-6 w-6 rounded-full flex items-center justify-center ${
            selected ? 'bg-cyan' : 'bg-background/80 border border-border'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
        >
          {selected && <Check className="h-4 w-4 text-background" />}
        </div>
      </div>
      
      {/* Percentage badge - fixed positioning */}
      <div className="absolute top-4 right-4 bg-[#262626]/80 px-3 py-1 rounded text-sm backdrop-blur-sm z-20">
        Relevance {relevance}%
      </div>
      
      {/* Title and content with proper spacing */}
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4 mt-4">
          <h2 className="text-[32px] leading-[1.1] font-bold">{title}</h2>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="text-xs uppercase bg-[#303030] py-1 px-3 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="mt-auto flex justify-between items-end">
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onReplace(id);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </Button>
            
            <div onClick={(e) => e.stopPropagation()}>
              <TalkToAIButton onClick={() => onOpenAI(`Direction: ${title}`)} />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-xs text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {thumbnails.slice(0, 3).map((thumbnail, idx) => {
              const imageUrls = [
                // First direction images
                [
                  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
                  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
                  'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
                ],
                // Second direction images
                [
                  'https://images.unsplash.com/photo-1493397212122-2b85dda8106b',
                  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
                  'https://images.unsplash.com/photo-1500673922987-e212871fec22'
                ],
                // Third direction images
                [
                  'https://images.unsplash.com/photo-1481487196290-c152efe083f5',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                  'https://images.unsplash.com/photo-1613665813446-82a78c468a1d'
                ],
                // Fourth direction images
                [
                  'https://images.unsplash.com/photo-1589365278144-c9e705f843ba',
                  'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3',
                  'https://images.unsplash.com/photo-1527576539890-dfa815648363'
                ],
                // Additional directions images
                [
                  'https://images.unsplash.com/photo-1498936178812-4b2e558d2937',
                  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
                  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
                ],
                [
                  'https://images.unsplash.com/photo-1439886183900-e79ec0057170',
                  'https://images.unsplash.com/photo-1486718448742-163732cd1544',
                  'https://images.unsplash.com/photo-1473177104440-ffee2f376098'
                ],
                [
                  'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
                  'https://images.unsplash.com/photo-1551038247-3d9af20df552',
                  'https://images.unsplash.com/photo-1524230572899-a752b3835840'
                ],
                [
                  'https://images.unsplash.com/photo-1433832597046-4f10e10ac764',
                  'https://images.unsplash.com/photo-1466442929976-97f336a657be',
                  'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e'
                ]
              ];
              
              // Get the correct direction images - with better error handling
              const dirIndex = parseInt(id.replace('dir', '')) % imageUrls.length;
              // Safely access images or use fallbacks
              const dirImages = imageUrls[dirIndex] || imageUrls[0];
              const imageUrl = dirImages[idx % dirImages.length];
              
              return (
                <div 
                  key={idx}
                  className="h-[120px] w-[180px] bg-muted rounded overflow-hidden"
                >
                  <img 
                    src={`${imageUrl}?q=80&w=180&h=120&auto=format&fit=crop&unique=${id}-${idx}-${uniqueHash}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=180&h=120&auto=format&fit=crop";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DirectionsViewProps {
  onOpenAI: (context: string, prompts?: string[]) => void;
}

const DirectionsView: React.FC<DirectionsViewProps> = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const { 
    directions, 
    toggleDirectionSelection, 
    replaceDirection,
    deleteDirection,
    generateMoreDirections,
    selectedDirections
  } = useMoodboards();
  
  const enhanceDirectionDescriptions = () => {
    return directions.map((dir, index) => {
      if (dir.title.startsWith("Direction ")) {
        const uniqueTitles = [
          "Digital Horizon", 
          "Refined Elegance",
          "Future Forward",
          "Bold Frontiers",
          "Cosmic Vision",
          "Pristine Clarity",
          "Living Innovation",
          "Vibrant Impact"
        ];
        
        const richDescriptions = [
          "Think limitless possibilities. Think fluid interactions. Where digital meets physical, each touchpoint creates moments of delight and discovery.",
          "Envision a space where minimalism isn't just aesthetic—it's transformative. Clean lines and thoughtful design create breathing room for ideas to flourish.",
          "The future isn't static; it's dynamic. This direction embraces motion, transformation, and the constant evolution of technology and human experience.",
          "Here, boldness isn't just about visuals—it's about vision. This direction speaks with authority through deliberate choices and powerful contrasts.",
          "Imagine depth beyond the ordinary. Like a perfect galaxy viewed through the clearest lens, every element aligns with cosmic precision.",
          "True clarity comes from purposeful restraint. This direction strips away the unnecessary to reveal what truly matters.",
          "Technology that breathes. Visual language that feels alive. This direction creates interfaces that feel responsive and organic, mirroring how we interact naturally.",
          "In a world of sameness, stand apart. This direction uses vivid contrasts and unexpected moments to create lasting brand impressions that resonate."
        ];
        
        const getThumbnailsForDirection = (dirIndex: number) => {
          const thumbnails = [
            [
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=180&h=120&auto=format&fit=crop"
            ],
            [
              "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=180&h=120&auto=format&fit=crop"
            ],
            [
              "https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=180&h=120&auto=format&fit=crop"
            ],
            [
              "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?q=80&w=180&h=120&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1527576539890-dfa815648363?q=80&w=180&h=120&auto=format&fit=crop"
            ]
          ];
          return thumbnails[dirIndex % thumbnails.length];
        };
        
        return {
          ...dir,
          title: uniqueTitles[index % uniqueTitles.length],
          description: richDescriptions[index % richDescriptions.length],
          thumbnails: getThumbnailsForDirection(index)
        };
      }
      return dir;
    });
  };
  
  const enhancedDirections = enhanceDirectionDescriptions();
  
  const handleOpenAI = (context: string) => {
    onOpenAI(context, [
      "Refine this direction with more personality",
      "Suggest alternative tags for this concept",
      "Make this more innovative and less generic"
    ]);
  };
  
  const handleNavigateToMoodboards = () => {
    if (selectedDirections.length !== 3) {
      return;
    }
    navigate('/step/5/moodboards');
  };
  
  return (
    <div className="min-h-[calc(100vh-88px)] flex flex-col p-8">
      <div className="flex justify-between items-center mb-8 px-10">
        <motion.h1
          className="text-[32px] font-bold text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Brand Directions
        </motion.h1>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Selected <span className="text-cyan">{selectedDirections.length}/3</span>
          </div>
          
          <Button
            onClick={() => generateMoreDirections(2)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate more
          </Button>
          
          <Button 
            onClick={handleNavigateToMoodboards}
            disabled={selectedDirections.length !== 3}
            className="bg-cyan text-black hover:bg-cyan/90"
          >
            Next → Moodboards
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-10">
        <AnimatePresence>
          {enhancedDirections.map(direction => (
            <DirectionCard
              key={direction.id}
              id={direction.id}
              title={direction.title}
              tags={direction.tags}
              description={direction.description}
              relevance={direction.relevance}
              thumbnails={direction.thumbnails}
              selected={direction.selected}
              onSelect={toggleDirectionSelection}
              onReplace={replaceDirection}
              onDelete={deleteDirection}
              onOpenAI={handleOpenAI}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Plus = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default DirectionsView;
