import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPositioningStatements } from '@/services/positioningService';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export type TimelineCardStatus = 'unstarted' | 'in-progress' | 'completed';

interface TimelineCardMeta {
  id: number;
  status: TimelineCardStatus;
  previewData?: any;
}

interface TimelineStatusContextType {
  getCardStatus: (id: number) => TimelineCardStatus;
  getCardPreview: (id: number) => any;
}

const TimelineStatusContext = createContext<TimelineStatusContextType>({
  getCardStatus: () => 'unstarted',
  getCardPreview: () => undefined,
});

export const TimelineStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [statusMap, setStatusMap] = useState<Record<number, TimelineCardMeta>>({});

  useEffect(() => {
    console.log('[TimelineStatusProvider] useEffect running, projectId:', projectId);
    async function fetchStatuses() {
      const map: Record<number, TimelineCardMeta> = {};
      // Positioning (step 1)
      if (projectId) {
        try {
          // Fetch all positioning_items for this project
          const { data: items, error } = await supabase
            .from('positioning_items')
            .select('*')
            .eq('project_id', projectId);
          console.log('[TimelineStatusProvider] supabase error:', error);
          console.log('[TimelineStatusProvider] items (raw):', items);
          if (!error && items) {
            // Internal
            const internalSlots = ['WHAT', 'HOW', 'WHY', 'WHO', 'WHERE', 'WHEN'];
            const selected: Record<string, string> = {};
            internalSlots.forEach(slot => {
              const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
              const sel = slotItems.find(i => i.state === 'selected');
              if (sel) selected[slot] = sel.content;
              else if (slotItems.length > 0) selected[slot] = slotItems[0].content;
              else selected[slot] = '';
            });
            const internalTemplate = "The only WHAT that HOW for WHO mostly in WHERE because WHY in an era of WHEN.";
            const internalStatement = internalTemplate.replace(/WHAT|HOW|WHO|WHERE|WHY|WHEN/g, match => selected[match] || `[${match}]`);
            // External
            const extSlots = ['PROPOSITION', 'BENEFIT', 'OUTCOME'];
            const extSel: Record<string, string> = {};
            extSlots.forEach(slot => {
              const slotItems = items.filter(i => i.item_type === `STATEMENT_${slot}`);
              const sel = slotItems.find(i => i.state === 'selected');
              if (sel) extSel[slot] = sel.content;
              else if (slotItems.length > 0) extSel[slot] = slotItems[0].content;
              else extSel[slot] = '';
            });
            const externalStatement =
              extSel.PROPOSITION && extSel.BENEFIT && extSel.OUTCOME
                ? `${extSel.PROPOSITION} that ${extSel.BENEFIT} so you achieve ${extSel.OUTCOME}.`
                : '';
            // Determine status
            let status: TimelineCardStatus = 'unstarted';
            if (items.length > 0) {
              status = 'in-progress';
            }
            if (
              internalSlots.every(slot => selected[slot] && selected[slot].length > 0) &&
              extSlots.every(slot => extSel[slot] && extSel[slot].length > 0)
            ) {
              status = 'completed';
            }
            console.log('[TimelineStatusProvider] computed status:', status);
            map[1] = {
              id: 1,
              status,
              previewData: {
                internal: internalStatement,
                external: externalStatement,
              },
            };
          } else {
            map[1] = { id: 1, status: 'unstarted' };
          }
        } catch {
          map[1] = { id: 1, status: 'unstarted' };
        }
      }
      // TODO: Add logic for other modules as you implement them
      setStatusMap(map);
    }
    fetchStatuses();
  }, [projectId]);

  const getCardStatus = (id: number) => statusMap[id]?.status || 'unstarted';
  const getCardPreview = (id: number) => statusMap[id]?.previewData;

  return (
    <TimelineStatusContext.Provider value={{ getCardStatus, getCardPreview }}>
      {children}
    </TimelineStatusContext.Provider>
  );
};

export const useTimelineStatus = () => useContext(TimelineStatusContext); 