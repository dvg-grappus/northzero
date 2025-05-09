import React, { useEffect, useState } from 'react';
import { llmConfigService, LLMConfig } from '../services/llmConfig';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PromptManagerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const PromptManagerDrawer: React.FC<PromptManagerDrawerProps> = ({ open, onClose }) => {
  const [prompts, setPrompts] = useState<LLMConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<LLMConfig | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await llmConfigService.getPrompts('positioning');
      setPrompts(data);
    } catch (e) {
      setError('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPrompts();
  }, [open]);

  const handleEdit = (prompt: LLMConfig) => {
    setEditingPrompt(prompt);
    setEditText(prompt.prompt_text || '');
  };

  const handleSave = async () => {
    if (!editingPrompt) return;
    setSaving(true);
    setError(null);
    const success = await llmConfigService.updatePrompt(
      editingPrompt.prompt_name!,
      editingPrompt.prompt_type!,
      editText
    );
    if (success) {
      setEditingPrompt(null);
      setEditText('');
      fetchPrompts();
    } else {
      setError('Failed to save prompt');
    }
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-[480px] max-w-full">
        <SheetHeader>
          <SheetTitle>Prompt Wallet</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading prompts...</div>
          ) : error ? (
            <div className="text-center text-destructive">{error}</div>
          ) : (
            <>
              {editingPrompt ? (
                <div>
                  <div className="mb-2 font-semibold">Editing: {editingPrompt.prompt_name}</div>
                  <Textarea
                    className="w-full min-h-[180px] mb-4"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPrompt(null)} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-lg font-semibold">Positioning Prompts</div>
                  <ul className="space-y-4">
                    {prompts.map(prompt => (
                      <li key={prompt.id} className="border rounded p-3 flex flex-col gap-2 bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">{prompt.prompt_type}</span>
                        </div>
                        <div className="font-medium text-sm break-words truncate max-w-full" title={prompt.prompt_name}>{prompt.prompt_name}</div>
                        <div className="text-xs text-muted-foreground mb-1 whitespace-pre-line break-words">{prompt.prompt_description}</div>
                        <div>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(prompt)}>
                            Edit
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}; 