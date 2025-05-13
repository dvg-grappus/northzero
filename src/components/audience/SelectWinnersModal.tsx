import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Cohort, WinningCohortSelection } from './MacroLandscape';
import { CohortSelectionDialog } from './CohortSelectionDialog';
import { XIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SelectWinnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCohorts: Cohort[]; 
  currentWinningCohorts: WinningCohortSelection;
  onSave: (newSelection: WinningCohortSelection) => Promise<void>;
  projectId: string;
}

export const SelectWinnersModal: React.FC<SelectWinnersModalProps> = ({
  isOpen,
  onClose,
  allCohorts,
  currentWinningCohorts,
  onSave,
  projectId,
}) => {
  const [localSelection, setLocalSelection] = useState<WinningCohortSelection>(currentWinningCohorts);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the new CohortSelectionDialog
  const [isCohortSelectionDialogOpen, setIsCohortSelectionDialogOpen] = useState(false);
  const [targetSlotForDialog, setTargetSlotForDialog] = useState<keyof WinningCohortSelection | null>(null);
  const [cohortsForPickerDialog, setCohortsForPickerDialog] = useState<Cohort[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelection(currentWinningCohorts);
      setIsCohortSelectionDialogOpen(false); // Ensure picker dialog is closed when main modal opens/resyncs
    }
  }, [isOpen, currentWinningCohorts]);

  const handleOpenCohortSelectionDialog = (slotKey: keyof WinningCohortSelection) => {
    const available = getAvailableCohortsForSlot(slotKey);
    if (available.length === 0) {
      toast.info("No more unique cohorts available to select for this slot.");
      return;
    }
    setCohortsForPickerDialog(available);
    setTargetSlotForDialog(slotKey);
    setIsCohortSelectionDialogOpen(true);
  };

  const handleCohortSelectedFromDialog = (selectedCohortId: string) => {
    if (targetSlotForDialog) {
      setLocalSelection(prev => ({
        ...prev,
        [targetSlotForDialog]: selectedCohortId,
      }));
    }
    setIsCohortSelectionDialogOpen(false);
    setTargetSlotForDialog(null);
  };

  const handleClearSlot = (slot: keyof WinningCohortSelection, event: React.MouseEvent) => {
    event.stopPropagation(); 
    setLocalSelection(prev => ({ ...prev, [slot]: null }));
  };

  const getCohortTitle = (cohortId: string | null): string => {
    if (!cohortId) return 'Not Selected';
    const cohort = allCohorts.find(c => c.id === cohortId);
    return cohort ? cohort.title : 'Unknown Cohort';
  };
  
  const getAvailableCohortsForSlot = (slotToFill: keyof WinningCohortSelection): Cohort[] => {
    const selectedInOtherSlots: string[] = [];
    if (slotToFill !== 'primary' && localSelection.primary) selectedInOtherSlots.push(localSelection.primary);
    if (slotToFill !== 'secondary' && localSelection.secondary) selectedInOtherSlots.push(localSelection.secondary);
    if (slotToFill !== 'tertiary' && localSelection.tertiary) selectedInOtherSlots.push(localSelection.tertiary);
    return allCohorts.filter(cohort => !selectedInOtherSlots.includes(cohort.id));
  };

  const handleSaveSelection = async () => {
    setIsLoading(true);
    try {
      console.log("[SelectWinnersModal] Attempting to save selection:", localSelection);
      await onSave(localSelection); 
      onClose(); 
    } catch (error) {
      console.error("Failed to save winning cohorts from SelectWinnersModal:", error);
      toast.error("Saving failed. Please check console or try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const canSave = localSelection.primary && localSelection.secondary && localSelection.tertiary;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Select Your Top 3 Audience Cohorts</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              Choose a Primary, Secondary, and Tertiary cohort. These will be central to developing your personas and simulations.
            </p>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            {(Object.keys(localSelection) as Array<keyof WinningCohortSelection>).map((slotKey) => {
              const slotDisplayName = slotKey.charAt(0).toUpperCase() + slotKey.slice(1);
              const isPrimary = slotKey === 'primary';
              const currentCohortId = localSelection[slotKey];

              return (
                <div 
                  key={slotKey}
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors relative group ${
                    isPrimary ? 'border-2 border-primary' : 'border-border'
                  }`}
                  onClick={() => handleOpenCohortSelectionDialog(slotKey)}
                >
                  {currentCohortId && (
                    <Button
                      variant="ghost" size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleClearSlot(slotKey, e)}
                    ><XIcon className="h-4 w-4" /></Button>
                  )}
                  <h3 className={`text-sm font-medium mb-1 ${
                    isPrimary ? 'text-primary' : 'text-muted-foreground'
                  }`}>{slotDisplayName.toUpperCase()} COHORT</h3>
                  <p className="text-lg font-semibold truncate">{getCohortTitle(currentCohortId)}</p>
                  {currentCohortId === null && <p className="text-xs text-muted-foreground">+ Click to select</p>}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSaveSelection} disabled={!canSave || isLoading} className="min-w-[100px]">
              {isLoading ? 'Saving...' : 'Save Selection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {targetSlotForDialog && (
        <CohortSelectionDialog
          isOpen={isCohortSelectionDialogOpen}
          onClose={() => {
            setIsCohortSelectionDialogOpen(false);
            setTargetSlotForDialog(null);
          }}
          cohortsToDisplay={cohortsForPickerDialog} // Pass the pre-filtered list
          onSelectCohort={handleCohortSelectedFromDialog}
          slotDisplayName={targetSlotForDialog.charAt(0).toUpperCase() + targetSlotForDialog.slice(1)}
        />
      )}
    </>
  );
}; 