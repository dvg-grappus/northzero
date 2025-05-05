import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { usePositioningData } from './PositioningDataProvider';
import * as positioningService from '@/services/positioningService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ResetPositioningStateButtonProps {
  projectId: string;
}

const ResetPositioningStateButton: React.FC<ResetPositioningStateButtonProps> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshData } = usePositioningData();

  const handleReset = async () => {
    setLoading(true);
    try {
      // 1. Get the latest positioning document for the project
      const latestDoc = await positioningService.getLatestPositioningDocument(projectId);
      if (!latestDoc) {
        toast.error('No positioning document found for this project.');
        setLoading(false);
        setOpen(false);
        return;
      }
      // 2. Delete all positioning_items for this document
      const { error: deleteError } = await supabase
        .from('positioning_items')
        .delete()
        .eq('document_id', latestDoc.id);
      if (deleteError) {
        toast.error('Failed to delete existing items.');
        setLoading(false);
        setOpen(false);
        return;
      }
      // 3. Reseed items from raw_payload
      const success = await positioningService.createPositioningItemsFromDocument(
        latestDoc.id,
        latestDoc.project_id,
        latestDoc.raw_payload
      );
      if (!success) {
        toast.error('Failed to reseed positioning items.');
        setLoading(false);
        setOpen(false);
        return;
      }
      // 4. Refresh UI
      await refreshData();
      toast.success('Positioning module has been reset!');
    } catch (err) {
      toast.error('Unexpected error during reset.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={loading} className="ml-2">
        Reset All States
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Reset All States?</DialogTitle>
          <div className="py-2 text-sm text-gray-700">
            This will erase all your selections and restore the module to its initial state. This action cannot be undone. Are you sure you want to proceed?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} disabled={loading}>
              {loading ? 'Resetting…' : 'Yes, Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetPositioningStateButton; 