import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_STYLESCAPE_ROWS } from '@/data/mockStylescapes';

type PanelRole = 'HEADLINE' | 'HERO PEOPLE' | 'TEXTURE & COLOUR' | 'CONTEXT SHOT' | 'EMOJI/ICON CLUSTER';

export interface StylescapePanel {
  id: string;
  role: PanelRole;
  img: string;
  query: string;
}

export interface StylescapeRow {
  id: string;
  theme: string;
  themeEmoji: string;
  relevance: number;
  queries: string[];
  panels: StylescapePanel[];
  chips: string[];
}

interface StylescapesContextType {
  rows: StylescapeRow[];
  winner: string | null;
  setWinner: (rowId: string) => void;
  replacePanel: (rowId: string, panelId: string, newImageUrl: string) => void;
  updateRow: (rowId: string, updatedRow: Partial<StylescapeRow>) => void;
  onPanelReplace: (rowId: string, panelId: string) => void;
  onBoardRegenerate: (rowId: string) => void;
  onAIApply: (contextId: string) => void;
  onStylescapeSave: (rowId: string) => void;
  onWinnerChoose: (rowId: string) => void;
  onModuleComplete: (module: string, rowId: string) => void;
}

const StylescapesContext = createContext<StylescapesContextType>({
  rows: DEFAULT_STYLESCAPE_ROWS,
  winner: null,
  setWinner: () => {},
  replacePanel: () => {},
  updateRow: () => {},
  onPanelReplace: () => {},
  onBoardRegenerate: () => {},
  onAIApply: () => {},
  onStylescapeSave: () => {},
  onWinnerChoose: () => {},
  onModuleComplete: () => {},
});

export const useStylescapes = () => useContext(StylescapesContext);

const StylescapesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState<StylescapeRow[]>(DEFAULT_STYLESCAPE_ROWS);
  const [winner, setWinnerState] = useState<string | null>(null);

  // Set winner and track analytics
  const setWinner = (rowId: string) => {
    setWinnerState(rowId);
  };

  // Replace a panel's image
  const replacePanel = (rowId: string, panelId: string, newImageUrl: string) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            panels: row.panels.map(panel => {
              if (panel.id === panelId) {
                return { ...panel, img: newImageUrl };
              }
              return panel;
            })
          };
        }
        return row;
      });
    });
  };

  // Update a row's properties
  const updateRow = (rowId: string, updatedRow: Partial<StylescapeRow>) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id === rowId) {
          return { ...row, ...updatedRow };
        }
        return row;
      });
    });
  };

  // Analytics hooks
  const onPanelReplace = (rowId: string, panelId: string) => {
  };

  const onBoardRegenerate = (rowId: string) => {
  };

  const onAIApply = (contextId: string) => {
  };

  const onStylescapeSave = (rowId: string) => {
  };

  const onWinnerChoose = (rowId: string) => {
  };

  const onModuleComplete = (module: string, rowId: string) => {
  };

  return (
    <StylescapesContext.Provider
      value={{
        rows,
        winner,
        setWinner,
        replacePanel,
        updateRow,
        onPanelReplace,
        onBoardRegenerate,
        onAIApply,
        onStylescapeSave,
        onWinnerChoose,
        onModuleComplete,
      }}
    >
      {children}
    </StylescapesContext.Provider>
  );
};

export default StylescapesProvider;