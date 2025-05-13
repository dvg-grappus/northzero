import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import type { Cohort } from './MacroLandscape';

interface CohortSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cohortsToDisplay: Cohort[];
  onSelectCohort: (cohortId: string) => void;
  slotDisplayName: string; // e.g., "Primary", "Secondary"
}

export const CohortSelectionDialog: React.FC<CohortSelectionDialogProps> = ({
  isOpen,
  onClose,
  cohortsToDisplay,
  onSelectCohort,
  slotDisplayName,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* <DialogOverlay className="z-50" /> Ensure overlay is above previous modal if needed, Dialog usually handles this */}
      <DialogContent className="sm:max-w-md z-[60]" onInteractOutside={(e) => { 
        // Allow interaction outside if it's for another Radix primitive like a parent Dialog's close button
        // For now, let default behavior handle it, or explicitly call onClose()
        // e.preventDefault(); // This would prevent closing on outside click
       }}>
        <DialogHeader>
          <DialogTitle>Select {slotDisplayName} Cohort</DialogTitle>
        </DialogHeader>
        <Command className="mt-4">
          <CommandInput placeholder="Search cohorts..." />
          <CommandList className="max-h-[calc(80vh-200px)] overflow-y-auto"> {/* Dynamic max height */}
            <CommandEmpty>No cohorts available.</CommandEmpty>
            <CommandGroup>
              {(Array.isArray(cohortsToDisplay) ? cohortsToDisplay : []).map((cohort) => (
                <CommandItem
                  key={cohort.id}
                  value={cohort.title}
                  onSelect={() => {
                    onSelectCohort(cohort.id);
                    onClose(); // Close this dialog after selection
                  }}
                  className="cursor-pointer"
                >
                  {cohort.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {/* No explicit save/cancel needed if selection immediately closes */}
      </DialogContent>
    </Dialog>
  );
}; 