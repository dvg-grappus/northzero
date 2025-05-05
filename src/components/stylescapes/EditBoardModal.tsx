
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StylescapeRow } from '@/contexts/StylescapesContext';

interface EditBoardModalProps {
  row: StylescapeRow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rowId: string, queries: string[]) => void;
}

const EditBoardModal: React.FC<EditBoardModalProps> = ({
  row,
  isOpen,
  onClose,
  onSave,
}) => {
  const [queries, setQueries] = useState<string[]>([...row.queries]);

  const handleQueryChange = (index: number, value: string) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(row.id, queries);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[#262626] rounded-lg shadow-lg max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">
            Edit {row.theme} {row.themeEmoji} Board
          </h2>
          <button
            className="rounded-full p-2 hover:bg-[#303030]"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {row.panels.map((panel, index) => (
              <div key={panel.id} className="space-y-2">
                <label className="text-sm font-medium text-[#9A9A9A] block">
                  {panel.role}
                </label>
                <Input
                  value={queries[index]}
                  onChange={(e) => handleQueryChange(index, e.target.value)}
                  className="bg-[#1B1B1B] border border-[#444] text-white"
                  placeholder={`Enter query for ${panel.role}`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-[#444] text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#7DF9FF] text-black hover:bg-[#7DF9FF]/90"
            >
              Save & Regenerate Images
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditBoardModal;
