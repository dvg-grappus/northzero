import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { generateAudienceData } from '@/services/audienceService';

interface ResetAudienceStateButtonProps {
  projectId: string;
  onReset?: () => void;
}

const ResetAudienceStateButton: React.FC<ResetAudienceStateButtonProps> = ({ projectId, onReset }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      // 1. Get the latest audience document for the project
      const { data: latestDoc } = await supabase
        .from('audience_documents')
        .select('id, version, raw_payload')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestDoc) {
        toast.error('No audience document found for this project.');
        setLoading(false);
        setOpen(false);
        return;
      }

      // 2. Delete all audience_items for this project
      const { error: deleteItemsError } = await supabase
        .from('audience_items')
        .delete()
        .eq('project_id', projectId);

      if (deleteItemsError) {
        console.error('[ERROR] Failed to delete audience items:', deleteItemsError);
        toast.error('Failed to delete existing items.');
        setLoading(false);
        setOpen(false);
        return;
      }

      // 3. Reset the document version back to 1 and keep the same payload
      const { error: updateDocError } = await supabase
        .from('audience_documents')
        .update({
          version: 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', latestDoc.id);

      if (updateDocError) {
        console.error('[ERROR] Failed to update audience document:', updateDocError);
        toast.error('Failed to update audience document.');
        setLoading(false);
        setOpen(false);
        return;
      }

      // 4. Regenerate the audience data from scratch - this will create new items
      await generateAudienceData(projectId);
      
      // 5. Show success message
      toast.success('Audience module has been reset!');
      
      // 6. Call the refresh callback if provided
      if (onReset) {
        try {
          await onReset();
          // Wait a moment to make sure the UI updates
          setTimeout(() => {
            setLoading(false);
            setOpen(false);
          }, 500);
        } catch (error) {
          console.error('[ERROR] Error in onReset callback:', error);
          // Fall back to page reload
          window.location.reload();
        }
      } else {
        // 7. Force a page reload to ensure clean state if no callback provided
        window.location.reload();
      }
    } catch (err) {
      console.error('Error during reset:', err);
      toast.error('Unexpected error during reset.');
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={loading} className="ml-2">
        Reset All
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

export default ResetAudienceStateButton; 