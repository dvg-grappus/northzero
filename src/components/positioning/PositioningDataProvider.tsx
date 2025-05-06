import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as positioningService from '@/services/positioningService';
import { PositioningItem } from '@/services/positioningService';
import { PositioningContext } from "@/contexts/PositioningContext";
import { supabase } from '@/lib/supabase';
import { useProjects } from '@/contexts/ProjectsContext';
import { usePositioning } from '@/contexts/PositioningContext';

interface PositioningDataContextType {
  isLoading: boolean;
  error: Error | null;
  brief: string;
  whatStatements: PositioningItem[];
  howStatements: PositioningItem[];
  whyStatements: PositioningItem[];
  opportunities: PositioningItem[];
  challenges: PositioningItem[];
  milestones: PositioningItem[];
  values: PositioningItem[];
  whileOthers: PositioningItem[];
  weAreTheOnly: PositioningItem[];
  updateItemState: (itemId: string, state: 'draft' | 'selected' | 'archived') => Promise<void>;
  updateMilestoneSlot: (itemId: string, slot: 'now' | '1yr' | '3yr' | '5yr' | '10yr' | 'unassigned') => Promise<void>;
  refreshData: () => Promise<void>;
  projectId: string;
  syncStates: Record<string, boolean>;
}

const PositioningDataContext = createContext<PositioningDataContextType | undefined>(undefined);

export const PositioningDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projectId: paramProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('projectId');
  
  // Use project ID from params or query string
  const projectId = paramProjectId || queryProjectId || '1'; // Default to first project if none specified
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [brief, setBrief] = useState('');
  const [whatStatements, setWhatStatements] = useState<PositioningItem[]>([]);
  const [howStatements, setHowStatements] = useState<PositioningItem[]>([]);
  const [whyStatements, setWhyStatements] = useState<PositioningItem[]>([]);
  const [opportunities, setOpportunities] = useState<PositioningItem[]>([]);
  const [challenges, setChallenges] = useState<PositioningItem[]>([]);
  const [milestones, setMilestones] = useState<PositioningItem[]>([]);
  const [values, setValues] = useState<PositioningItem[]>([]);
  const [whileOthers, setWhileOthers] = useState<PositioningItem[]>([]);
  const [weAreTheOnly, setWeAreTheOnly] = useState<PositioningItem[]>([]);
  
  // Flag to prevent infinite API calls
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  const {
    setRoadmapMilestones,
    setSelectedGoldenCircle,
    setSelectedValues,
    setSelectedOpportunities,
    setSelectedChallenges,
    setPinnedDifferentiators,
    setBriefContext,
    setInternalStatement,
    setSelectedExternalStatement
  } = useContext(PositioningContext);
  
  // Add a force refresh counter
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // Add loading states for each sync operation
  const [syncStates, setSyncStates] = useState({
    goldenCircle: false,
    values: false,
    opportunities: false,
    challenges: false,
    differentiators: false,
    roadmap: false
  });
  
  // Add retry state
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  // Debug logging function with more context
  const logSync = (operation: string, data: any, context?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PositioningDataProvider] ${operation}${context ? ` (${context})` : ''}:`, data);
    }
  };
  
  const fetchPositioningData = async () => {
    // Always fetch data when called
    setIsLoading(true);
    try {
      logSync('fetchPositioningData', 'Starting data fetch');
      
      // Get the latest document
      const document = await positioningService.getLatestPositioningDocument(projectId);
      
      if (document) {
        logSync('fetchPositioningData', { documentId: document.id });
        
        setBrief(document.brief);
        setBriefContext(document.brief);
        
        // Get all items for this document
        const items = await positioningService.getPositioningItems(document.id);
        logSync('fetchPositioningData', { itemsCount: items.length });
        
        // If no items found and we haven't exceeded retries, schedule a retry
        if (items.length === 0 && retryCount < MAX_RETRIES) {
          logSync('fetchPositioningData', `No items found, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
          return;
        }
        
        // Organize items by type
        setWhatStatements(items.filter(item => item.item_type === 'WHAT'));
        setHowStatements(items.filter(item => item.item_type === 'HOW'));
        setWhyStatements(items.filter(item => item.item_type === 'WHY'));
        setOpportunities(items.filter(item => item.item_type === 'OPPORTUNITY'));
        setChallenges(items.filter(item => item.item_type === 'CHALLENGE'));
        setMilestones(items.filter(item => item.item_type === 'MILESTONE'));
        setValues(items.filter(item => item.item_type === 'VALUE'));
        setWhileOthers(items.filter(item => item.item_type === 'WHILE_OTHERS'));
        setWeAreTheOnly(items.filter(item => item.item_type === 'WE_ARE_THE_ONLY'));
        
        // --- NEW: Fetch and sync statements context ---
        try {
          const statementRow = await positioningService.getPositioningStatements(projectId);
          if (statementRow && statementRow.id) {
            // Fetch all positioning_items for this statement
            const { data: statementItems, error } = await supabase
              .from('positioning_items')
              .select('*')
              .eq('statement_id', statementRow.id);
            if (!error && statementItems) {
              // Internal
              const internal: Record<string, string> = {};
              ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'].forEach(slot => {
                const slotItems = statementItems.filter(i => i.item_type === `STATEMENT_${slot}`);
                const selected = slotItems.find(i => i.state === 'selected');
                if (selected) internal[slot] = selected.content;
                else if (slotItems.length > 0) internal[slot] = slotItems[0].content;
                else internal[slot] = '';
              });
              setInternalStatement(internal);
              // External
              const extSel: Record<string, string> = {};
              ['PROPOSITION', 'BENEFIT', 'OUTCOME'].forEach(slot => {
                const slotItems = statementItems.filter(i => i.item_type === `STATEMENT_${slot}`);
                const selected = slotItems.find(i => i.state === 'selected');
                if (selected) extSel[slot] = selected.content;
              });
              if (extSel.PROPOSITION && extSel.BENEFIT && extSel.OUTCOME) {
                setSelectedExternalStatement(extSel.PROPOSITION); // fallback: set to PROPOSITION
              } else {
                setSelectedExternalStatement('');
              }
            }
          }
        } catch (err) {
          // Ignore errors here, just don't set statements context
        }
        // --- END NEW ---
        
        // Reset retry count on successful load
        setRetryCount(0);
        setHasInitiallyLoaded(true);
      } else {
        setBrief('');
        setBriefContext('');
        setWhatStatements([]);
        setHowStatements([]);
        setWhyStatements([]);
        setOpportunities([]);
        setChallenges([]);
        setMilestones([]);
        setValues([]);
        setWhileOthers([]);
        setWeAreTheOnly([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching positioning data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch positioning data'));
      
      // If error occurs and we haven't exceeded retries, schedule a retry
      if (retryCount < MAX_RETRIES) {
        logSync('fetchPositioningData', `Error occurred, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, RETRY_DELAY);
      } else {
        toast.error('Failed to load positioning data. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an item's state with enhanced logging
  const updateItemState = async (itemId: string, state: 'draft' | 'selected' | 'archived') => {
    try {
      logSync('updateItemState', { itemId, newState: state }, 'Before Update');
      
      const success = await positioningService.updateItemState(itemId, state);
      
      if (success) {
        logSync('updateItemState', { itemId, newState: state }, 'After DB Update');
        
        // Update local state to reflect the change
        const updateItemsState = (items: PositioningItem[]) => {
          const updated = items.map(item => {
            if (item.id === itemId) {
              return { ...item, state };
            }
            return item;
          });
          return updated;
        };
        
        setWhatStatements(prev => updateItemsState(prev));
        setHowStatements(prev => updateItemsState(prev));
        setWhyStatements(prev => updateItemsState(prev));
        setOpportunities(prev => updateItemsState(prev));
        setChallenges(prev => updateItemsState(prev));
        setMilestones(prev => updateItemsState(prev));
        setValues(prev => updateItemsState(prev));
        setWhileOthers(prev => updateItemsState(prev));
        setWeAreTheOnly(prev => updateItemsState(prev));
      }
    } catch (err) {
      console.error('Error updating item state:', err);
      toast.error('Failed to update item');
    }
  };
  
  // Update a milestone's slot
  const updateMilestoneSlot = async (
    itemId: string, 
    slot: 'now' | '1yr' | '3yr' | '5yr' | '10yr' | 'unassigned'
  ) => {
    try {
      const success = await positioningService.updateMilestoneSlot(itemId, slot);
      
      if (success) {
        // Update local state to reflect the change
        setMilestones(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, slot, state: slot === 'unassigned' ? 'draft' : 'selected' } 
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating milestone slot:', err);
      toast.error('Failed to update milestone');
    }
  };
  
  // Modify refreshData to reset retry count
  const refreshData = async () => {
    try {
      setIsLoading(true);
      logSync('refreshData', 'Starting data refresh');
      
      setRetryCount(0); // Reset retry count
      await fetchPositioningData();
      setForceRefreshCounter(prev => prev + 1);
      
      logSync('refreshData', 'Data refresh completed');
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced sync functions with detailed logging
  const syncGoldenCircle = async () => {
    try {
      setSyncStates(prev => ({ ...prev, goldenCircle: true }));
      logSync('syncGoldenCircle', 'Starting sync');

      if (!isLoading && whatStatements.length > 0) {
        const what = whatStatements.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncGoldenCircle', { what, items: whatStatements.map(i => ({ id: i.id, state: i.state })) }, 'WHAT');
        setSelectedGoldenCircle(prev => ({ ...prev, what }));
      }

      if (!isLoading && howStatements.length > 0) {
        const how = howStatements.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncGoldenCircle', { how, items: howStatements.map(i => ({ id: i.id, state: i.state })) }, 'HOW');
        setSelectedGoldenCircle(prev => ({ ...prev, how }));
      }

      if (!isLoading && whyStatements.length > 0) {
        const why = whyStatements.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncGoldenCircle', { why, items: whyStatements.map(i => ({ id: i.id, state: i.state })) }, 'WHY');
        setSelectedGoldenCircle(prev => ({ ...prev, why }));
      }
    } catch (error) {
      console.error('Error syncing Golden Circle:', error);
      toast.error('Failed to sync Golden Circle state');
    } finally {
      setSyncStates(prev => ({ ...prev, goldenCircle: false }));
    }
  };

  const syncValues = async () => {
    try {
      setSyncStates(prev => ({ ...prev, values: true }));
      logSync('syncValues', 'Starting sync');

      if (!isLoading && values.length > 0) {
        const selected = values.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncValues', { selected });
        setSelectedValues(selected);
      }
    } catch (error) {
      console.error('Error syncing Values:', error);
      toast.error('Failed to sync Values state');
    } finally {
      setSyncStates(prev => ({ ...prev, values: false }));
    }
  };

  const syncOpportunities = async () => {
    try {
      setSyncStates(prev => ({ ...prev, opportunities: true }));
      logSync('syncOpportunities', 'Starting sync');

      if (!isLoading && opportunities.length > 0) {
        const selected = opportunities.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncOpportunities', { selected });
        setSelectedOpportunities(selected);
      }
    } catch (error) {
      console.error('Error syncing Opportunities:', error);
      toast.error('Failed to sync Opportunities state');
    } finally {
      setSyncStates(prev => ({ ...prev, opportunities: false }));
    }
  };

  const syncChallenges = async () => {
    try {
      setSyncStates(prev => ({ ...prev, challenges: true }));
      logSync('syncChallenges', 'Starting sync');

      if (!isLoading && challenges.length > 0) {
        const selected = challenges.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncChallenges', { selected });
        setSelectedChallenges(selected);
      }
    } catch (error) {
      console.error('Error syncing Challenges:', error);
      toast.error('Failed to sync Challenges state');
    } finally {
      setSyncStates(prev => ({ ...prev, challenges: false }));
    }
  };

  const syncDifferentiators = async () => {
    try {
      setSyncStates(prev => ({ ...prev, differentiators: true }));
      logSync('syncDifferentiators', 'Starting sync');

      if (!isLoading && weAreTheOnly.length > 0) {
        const selected = weAreTheOnly.filter(item => item.state === 'selected').map(item => item.content);
        logSync('syncDifferentiators', { 
          selected,
          items: weAreTheOnly.map(i => ({ id: i.id, state: i.state, content: i.content }))
        }, 'WE_ARE_THE_ONLY');
        setPinnedDifferentiators(selected);
      }
    } catch (error) {
      console.error('Error syncing Differentiators:', error);
      toast.error('Failed to sync Differentiators state');
    } finally {
      setSyncStates(prev => ({ ...prev, differentiators: false }));
    }
  };
  
  // Replace the useEffect hooks with the new sync functions
  useEffect(() => {
    syncGoldenCircle();
  }, [isLoading, whatStatements, howStatements, whyStatements, setSelectedGoldenCircle, forceRefreshCounter]);

  useEffect(() => {
    syncValues();
  }, [isLoading, values, setSelectedValues, forceRefreshCounter]);

  useEffect(() => {
    syncOpportunities();
  }, [isLoading, opportunities, setSelectedOpportunities, forceRefreshCounter]);

  useEffect(() => {
    syncChallenges();
  }, [isLoading, challenges, setSelectedChallenges, forceRefreshCounter]);

  useEffect(() => {
    syncDifferentiators();
  }, [isLoading, weAreTheOnly, setPinnedDifferentiators, forceRefreshCounter]);
  
  // Fetch data on mount and when projectId changes
  useEffect(() => {
    fetchPositioningData();
  }, [projectId, retryCount]);
  
  // Sync roadmapMilestones
  useEffect(() => {
    if (!isLoading && milestones.length > 0) {
      const initialMilestones: Record<string, string[]> = {
        "Now": [],
        "1 yr": [],
        "3 yr": [],
        "5 yr": [],
        "10 yr": []
      };
      const slotToTimepoint: Record<string, string> = {
        'now': 'Now',
        '1yr': '1 yr',
        '3yr': '3 yr',
        '5yr': '5 yr',
        '10yr': '10 yr'
      };
      milestones.forEach(milestone => {
        if (milestone.slot && milestone.slot !== 'unassigned' && slotToTimepoint[milestone.slot]) {
          const timepoint = slotToTimepoint[milestone.slot];
          initialMilestones[timepoint] = [...initialMilestones[timepoint], milestone.content];
        }
      });
      setRoadmapMilestones(initialMilestones);
    }
  }, [isLoading, milestones, setRoadmapMilestones]);
  
  const value = {
    isLoading,
    error,
    brief,
    whatStatements,
    howStatements,
    whyStatements,
    opportunities,
    challenges,
    milestones,
    values,
    whileOthers,
    weAreTheOnly,
    updateItemState,
    updateMilestoneSlot,
    refreshData,
    projectId,
    syncStates // Expose sync states to components
  };
  
  return (
    <PositioningDataContext.Provider value={value}>
      {children}
    </PositioningDataContext.Provider>
  );
};

export const usePositioningData = () => {
  const context = useContext(PositioningDataContext);
  if (context === undefined) {
    throw new Error('usePositioningData must be used within a PositioningDataProvider');
  }
  return context;
};