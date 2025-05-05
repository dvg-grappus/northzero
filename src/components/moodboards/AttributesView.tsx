import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor,
  DragEndEvent,
  DraggableAttributes,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useMoodboards, KeywordCategory, Keyword } from '@/contexts/MoodboardsContext';
import { TalkToAIButton } from './FloatingAIPanel';

const defaultKeywords: Record<KeywordCategory, string[]> = {
  'Culture': ['Ambitious', 'Pure', 'Redefining', 'Simplify', 'Optimistic', 'Forward-thinking', 'Minimalist', 'Modern'],
  'Customer': ['Result-seeking', 'Youthful', 'Anxious', 'Curious', 'Goal-oriented', 'Tech-savvy', 'Innovative', 'Aspirational'],
  'Voice': ['Jargon-free', 'Optimistic', 'Engaging', 'Feminine', 'Fun', 'Clear', 'Confident', 'Direct'],
  'Feel': ['Empowered', 'Comforted', 'Mindful', 'In-control', 'Aware', 'Focused', 'Energized', 'Inspired'],
  'Impact': ['Wellness', 'Fitness', 'Coaching', 'Self-esteem', 'Growth', 'Success', 'Achievement', 'Progress'],
  'X-Factor': ['Iterative', 'Algorithmic', 'Intuitive', 'Gamified', 'Innovative', 'Future-proof', 'AI-driven', 'Dynamic']
};

interface KeywordItemProps {
  keyword: Keyword;
  onRemove: (id: string) => void;
}

const KeywordItem: React.FC<KeywordItemProps> = ({ keyword, onRemove }) => {
  const [showDelete, setShowDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: keyword.id,
    data: {
      keyword,
    },
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
  } : undefined;
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group flex items-center gap-1 p-2.5 px-3 mb-2 rounded-md bg-[#303030] hover:bg-opacity-80 cursor-grab active:cursor-grabbing select-none w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setShowDelete(!showDelete)}
    >
      <span className="text-xs uppercase font-medium">{keyword.text}</span>
      {showDelete && (
        <button 
          className="ml-auto h-5 w-5 rounded-full flex items-center justify-center hover:bg-red-500/20"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(keyword.id);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
};

interface KeywordColumnProps {
  title: KeywordCategory;
  keywords: Keyword[];
  onRemoveKeyword: (id: string) => void;
  onDropKeyword: (keywordId: string, targetCategory: KeywordCategory) => void;
}

const KeywordColumn: React.FC<KeywordColumnProps> = ({ 
  title, 
  keywords, 
  onRemoveKeyword,
  onDropKeyword
}) => {
  const { setNodeRef } = useDroppable({
    id: title,
    data: {
      category: title,
    },
  });
  
  return (
    <div 
      ref={setNodeRef}
      className="flex-shrink-0 w-[200px] min-w-[200px] overflow-hidden flex flex-col"
    >
      <h3 className="text-base font-bold mb-3 px-1">{title}</h3>
      <div className="flex flex-col bg-[#222222] rounded-md p-2 min-h-[300px]">
        {keywords.map(keyword => (
          <KeywordItem 
            key={keyword.id} 
            keyword={keyword} 
            onRemove={onRemoveKeyword}
          />
        ))}
      </div>
    </div>
  );
};

interface AttributesViewProps {
  onOpenAI: (context: string, prompts?: string[]) => void;
}

const AttributesView: React.FC<AttributesViewProps> = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const { 
    keywords,
    addKeyword,
    removeKeyword,
    moveKeyword
  } = useMoodboards();
  
  const [isAddKeywordOpen, setIsAddKeywordOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KeywordCategory>('Culture');
  const [duplicateError, setDuplicateError] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const keywordId = active.id as string;
      const targetCategory = (over.data?.current as any)?.category || over.id as KeywordCategory;
      
      if (Object.keys(keywords).includes(targetCategory)) {
        moveKeyword(keywordId, targetCategory);
      }
    }
  };
  
  const handleAddKeyword = () => {
    const isDuplicate = Object.values(keywords).flat().some(
      k => k.text.toLowerCase() === newKeyword.toLowerCase()
    );
    
    if (isDuplicate) {
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 2000);
      return;
    }
    
    addKeyword(newKeyword, selectedCategory);
    setNewKeyword('');
    setIsAddKeywordOpen(false);
  };
  
  const handleFineTune = () => {
    onOpenAI('Fine-tuning Keywords', [
      "Add some keywords that indicate an AI-first, futuristic vibe",
      "Remove clichés, keep it premium",
      "Suggest keywords for a luxury tech brand"
    ]);
  };
  
  const handleNavigateToDirections = () => {
    navigate('/step/5/directions');
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-[calc(100vh-88px)] flex flex-col p-8">
        <div className="flex justify-between items-start mb-12 px-10">
          <motion.h1 
            className="text-[32px] font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What we know so far.
          </motion.h1>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddKeywordOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add keyword
            </Button>
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleFineTune}
              >
                Fine-tune
                <TalkToAIButton onClick={handleFineTune} />
              </Button>
            </div>
          </div>
        </div>
        
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto py-4 pl-10 pr-10 mb-6"
        >
          <div className="flex gap-6 min-w-max">
            {(Object.keys(keywords) as KeywordCategory[]).map(category => (
              <KeywordColumn 
                key={category}
                title={category}
                keywords={keywords[category]}
                onRemoveKeyword={removeKeyword}
                onDropKeyword={moveKeyword}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end pr-10">
          <Button 
            onClick={handleNavigateToDirections}
            className="bg-cyan text-black hover:bg-cyan/90"
          >
            Craft directions →
          </Button>
        </div>
        
        <Dialog open={isAddKeywordOpen} onOpenChange={setIsAddKeywordOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add new keyword</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className={`grid grid-cols-4 items-center gap-4 ${duplicateError ? 'animate-shake' : ''}`}>
                <label htmlFor="keyword" className="text-right">
                  Keyword
                </label>
                <Input
                  id="keyword"
                  placeholder="Enter keyword"
                  className={`col-span-3 ${duplicateError ? 'border-red-500' : ''}`}
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                />
                {duplicateError && (
                  <div className="col-start-2 col-span-3 text-xs text-red-500">
                    This keyword already exists
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as KeywordCategory)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(keywords) as KeywordCategory[]).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddKeywordOpen(false)}>Cancel</Button>
              <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
};

export default AttributesView;
