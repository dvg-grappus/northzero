
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Persona } from "@/providers/AudienceProvider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import VoiceWaveform from "./VoiceWaveform";

interface PersonaTalkDialogProps {
  persona: Persona;
  onClose: () => void;
}

const PersonaTalkDialog: React.FC<PersonaTalkDialogProps> = ({ persona, onClose }) => {
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: "Hello, how can I help you today?", isUser: false }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    setMessages(prev => [...prev, { text: userInput, isUser: true }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: `As ${persona.name}, I'd say that's an interesting point. From my perspective as a ${persona.archetype.toLowerCase()}, I approach problems differently.`,
          isUser: false
        }
      ]);
      setIsTyping(false);
    }, 2000);

    setUserInput("");
  };

  return (
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
        className="bg-[#1E1E1E] w-full max-w-lg rounded-t-lg md:rounded-2xl shadow-xl border border-border/30 z-10 overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 80px)" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="p-4 border-b border-border/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-border/50">
              <AvatarImage src={persona.image} alt={persona.name} />
              <AvatarFallback>{persona.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{persona.name}</h3>
              <span
                className="px-2 py-1 text-xs rounded text-background inline-block"
                style={{ backgroundColor: persona.archeTypeColor }}
              >
                {persona.archetype}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.isUser
                    ? 'bg-cyan text-black'
                    : 'bg-[#2B2B2B] text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2B2B2B] text-white p-3 rounded-lg flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`rounded-full ${isListening ? 'bg-cyan text-background' : ''}`}
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2 2 20 20"/>
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                  <path d="M5 10v2a7 7 0 0 0 12 5"/>
                  <path d="M15 9.34V5a3 3 0 0 0-5.94-.6"/>
                  <path d="M12 19v3"/>
                </svg>
              )}
            </Button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[#2B2B2B] border border-border/30 rounded-full px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan"
              placeholder="Ask me anything..."
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              className="bg-cyan hover:bg-cyan/90 text-background rounded-full"
              size="icon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 3 3 9-3 9 19-9Z"/>
                <path d="M6 12h16"/>
              </svg>
            </Button>
          </div>

          {isListening && <VoiceWaveform />}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PersonaTalkDialog;
