
import React, { createContext, useContext } from 'react';

export type KeywordCategory = 'Culture' | 'Customer' | 'Voice' | 'Feel' | 'Impact' | 'X-Factor';

export interface Keyword {
  id: string;
  text: string;
  category: KeywordCategory;
}

export interface DirectionCard {
  id: string;
  title: string;
  tags: string[];
  description: string;
  relevance: number;
  thumbnails: string[];
  selected: boolean;
}

export type ImageCategory = 
  'BACKGROUND STYLE' | 
  'TYPOGRAPHY' | 
  'LAYOUT' | 
  'ICON/ILLUSTRATION' | 
  'PHOTO TREATMENT' | 
  'TEXTURE' | 
  'COLOR SWATCH' | 
  'MOTION REF' | 
  'PRINT COLLATERAL' | 
  'ENVIRONMENT' | 
  'WILD CARD';

export interface MoodboardTile {
  id: string;
  category: ImageCategory;
  imageUrl: string;
  width: number;
  height: number;
}

export interface Moodboard {
  id: string;
  direction: DirectionCard;
  tiles: MoodboardTile[];
}

interface MoodboardsContextProps {
  keywords: Record<KeywordCategory, Keyword[]>;
  directions: DirectionCard[];
  moodboards: Moodboard[];
  selectedDirections: DirectionCard[];
  selectedMoodboard: string | null;
  
  addKeyword: (keyword: string, category: KeywordCategory) => void;
  removeKeyword: (keywordId: string) => void;
  moveKeyword: (keywordId: string, targetCategory: KeywordCategory) => void;
  
  toggleDirectionSelection: (directionId: string) => void;
  replaceDirection: (directionId: string) => void;
  deleteDirection: (directionId: string) => void;
  generateMoreDirections: (count?: number) => void;
  
  swapMoodboardTile: (moodboardId: string, tileId: string, newImage: string) => void;
  removeMoodboardTile: (moodboardId: string, tileId: string) => void;
  shuffleMoodboard: (moodboardId: string) => void;
  
  selectFinalMoodboard: (moodboardId: string) => void;
  completeModule: () => void;
  
  logEvent: (eventType: string, data: any) => void;
}

export const MoodboardsContext = createContext<MoodboardsContextProps | null>(null);

export const useMoodboards = () => {
  const context = useContext(MoodboardsContext);
  if (!context) {
    throw new Error("useMoodboards must be used within a MoodboardsProvider");
  }
  return context;
};
