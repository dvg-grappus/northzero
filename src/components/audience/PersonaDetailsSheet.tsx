
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PersonaDetail from "./PersonaDetail";

interface PersonaDetailsSheetProps {
  isOpen: boolean;
  personaId: string | null;
  onClose: () => void;
}

export const PersonaDetailsSheet: React.FC<PersonaDetailsSheetProps> = ({
  isOpen,
  personaId,
  onClose,
}) => {
  if (!isOpen || !personaId) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-end md:items-center md:justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="bg-[#1E1E1E] w-full max-w-4xl rounded-t-lg md:rounded-2xl shadow-xl border border-border/30 z-10 overflow-hidden flex flex-col"
          style={{ height: "80vh" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="p-4 border-b border-border/30 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Persona Profile</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <PersonaDetail
              personaId={personaId}
              onBack={onClose}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
