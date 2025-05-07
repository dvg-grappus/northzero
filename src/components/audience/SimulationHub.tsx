import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleCheck, Play, Pause, Lightbulb } from "lucide-react";
import { useAudience, SimulationTopic, Persona } from "@/providers/AudienceProvider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimulationTranscript {
  id: string;
  topic: string;
  timestamp: Date;
  messages: {
    persona: string;
    text: string;
    containsInsight?: boolean;
  }[];
  personaIds: string[];
}

interface SimulationHubProps {
  onComplete: () => void;
}

const SimulationHub: React.FC<SimulationHubProps> = ({ onComplete }) => {
  const { simulationTopics, personas, createSimulation, addInsight } = useAudience();
  const [topic, setTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [transcripts, setTranscripts] = useState<SimulationTranscript[]>([]);
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of active transcript
  useEffect(() => {
    if (isSimulating) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isSimulating, activeTranscript, transcripts]);
  
  const togglePersona = (personaId: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        return prev.filter(id => id !== personaId);
      } else {
        return [...prev, personaId];
      }
    });
  };
  
  const startSimulation = () => {
    if (selectedPersonas.length < 2 || (!topic && !customTopic)) return;
    
    setIsSimulating(true);
    const topicName = topic ? simulationTopics.find(t => t.id === topic)?.title || customTopic : customTopic;
    
    // Create a new transcript
    const newTranscript: SimulationTranscript = {
      id: Date.now().toString(),
      topic: topicName,
      timestamp: new Date(),
      messages: [],
      personaIds: selectedPersonas,
    };
    
    setTranscripts(prev => [newTranscript, ...prev]);
    setActiveTranscript(newTranscript.id);
    
    // Generate transcript messages with fake typing effect
    simulateConversation(newTranscript.id, selectedPersonas, topicName);
  };
  
  const simulateConversation = (transcriptId: string, personaIds: string[], topicName: string) => {
    const selectedPersonaObjects = personas.filter(p => personaIds.includes(p.id));
    
    // Sample conversation templates based on topic
    const conversations: Record<string, string[]> = {
      // Generic template
      generic: [
        "I think %%TOPIC%% is really important because it directly impacts my workflow.",
        "I agree, but I find the current solutions frustrating because they don't address %%PAIN%%.",
        "That's a good point. For me, the key feature would be something that solves %%NEED%%.",
        "What if there was a way to %%SOLUTION%% while still keeping things simple?",
        "I'd definitely pay more for that! The time savings alone would be worth it.",
        "Does anyone else struggle with %%PAIN2%% when trying to accomplish this?",
        "Always! And what frustrates me is there's no good way to %%WORKAROUND%%.",
        "Exactly! I end up having to %%INSIGHT%% as a workaround, but it's not ideal."
      ],
    };
    
    // Select appropriate template or use generic
    const template = conversations.generic;
    
    // Create message substitutions based on personas
    const substitutions: Record<string, string[]> = {
      "%%TOPIC%%": [topicName],
      "%%PAIN%%": ["the steep learning curve", "the lack of integration", "how much manual work is required"],
      "%%NEED%%": ["automation of repetitive tasks", "better visualization", "customizable workflows"],
      "%%SOLUTION%%": ["automate the entire process", "get real-time insights", "collaborate more effectively"],
      "%%PAIN2%%": ["keeping everyone updated", "maintaining consistency", "tracking progress accurately"],
      "%%WORKAROUND%%": ["switch between multiple tools", "create manual reports", "build custom integrations"],
      "%%INSIGHT%%": ["combine multiple tools into a custom workflow", "use spreadsheets as a makeshift database", "create my own templates from scratch"]
    };
    
    // Replace placeholders with random substitutions
    const processedMessages = template.map(message => {
      let processedMessage = message;
      Object.entries(substitutions).forEach(([pattern, replacements]) => {
        if (processedMessage.includes(pattern)) {
          processedMessage = processedMessage.replace(
            pattern, 
            replacements[Math.floor(Math.random() * replacements.length)]
          );
        }
      });
      return processedMessage;
    });
    
    // Add messages to transcript with delays for typing simulation
    processedMessages.forEach((message, index) => {
      setTimeout(() => {
        const persona = selectedPersonaObjects[index % selectedPersonaObjects.length];
        const containsInsight = index >= 5; // Mark later messages as containing insights
        
        setTranscripts(prev => prev.map(transcript => {
          if (transcript.id === transcriptId) {
            return {
              ...transcript,
              messages: [
                ...transcript.messages,
                {
                  persona: persona.name,
                  text: message,
                  containsInsight
                }
              ]
            };
          }
          return transcript;
        }));
        
        // If message contains insight, capture it
        if (containsInsight) {
          setTimeout(() => {
            addInsight(
              message.substring(0, 90) + (message.length > 90 ? '...' : ''),
              `Simulation: ${topicName}`,
              false
            );
          }, 1000);
        }
        
        // End simulation after last message
        if (index === processedMessages.length - 1) {
          setTimeout(() => {
            setIsSimulating(false);
          }, 1000);
        }
      }, 1000 + (index * 2500)); // Delay each message
    });
  };
  
  const handleTopicSelection = (value: string) => {
    setTopic(value);
    setCustomTopic("");
  };
  
  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomTopic(e.target.value);
    setTopic("");
  };
  
  const viewTranscript = (transcriptId: string) => {
    setActiveTranscript(transcriptId);
  };
  
  const toggleSpeech = () => {
    setIsSpeechPlaying(!isSpeechPlaying);
  };
  
  const addAllHighlightedInsights = (transcriptId: string) => {
    const transcript = transcripts.find(t => t.id === transcriptId);
    if (!transcript) return;
    
    const insightMessages = transcript.messages.filter(m => m.containsInsight);
    
    insightMessages.forEach(message => {
      addInsight(
        message.text.substring(0, 90) + (message.text.length > 90 ? '...' : ''),
        `Simulation: ${transcript.topic}`,
        false
      );
    });
  };
  
  // Find active transcript
  const currentTranscript = activeTranscript 
    ? transcripts.find(t => t.id === activeTranscript) 
    : transcripts[0];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Run thought experiments.</h1>
        <p className="text-muted-foreground">Put your personas in conversation and listen for sparks.</p>
      </motion.div>
      
      {/* Topic carousel */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {simulationTopics.map(simulationTopic => (
            <Button
              key={simulationTopic.id}
              variant="outline"
              size="sm"
              className={`rounded-full whitespace-nowrap ${
                simulationTopic.id === topic ? "bg-cyan/20 border-cyan" : ""
              }`}
              onClick={() => handleTopicSelection(simulationTopic.id)}
            >
              {simulationTopic.title}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Debate composer */}
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Conversation Setup</h3>
        
        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-2">
            Topic
          </label>
          <Textarea
            placeholder="Type a question or drag a topic pill"
            value={customTopic}
            onChange={handleCustomTopicChange}
            className="bg-background border-border"
            rows={2}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-2">
            Select Personas (minimum 2)
          </label>
          <div className="flex flex-wrap gap-2">
            {personas.map(persona => (
              <Button
                key={persona.id}
                variant={selectedPersonas.includes(persona.id) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePersona(persona.id)}
                className={selectedPersonas.includes(persona.id) ? "bg-cyan text-background" : ""}
              >
                {persona.name}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={startSimulation}
          disabled={selectedPersonas.length < 2 || (!topic && !customTopic) || isSimulating}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Run Simulation
        </Button>
      </div>
      
      {/* Output panel */}
      <div className="flex gap-6">
        {/* Transcript history */}
        <div className="w-[160px] flex-shrink-0">
          <h4 className="text-sm font-medium mb-3">History</h4>
          <div className="space-y-2">
            {transcripts.map(transcript => (
              <Button
                key={transcript.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left h-auto py-2 ${
                  activeTranscript === transcript.id ? "bg-muted" : ""
                }`}
                onClick={() => viewTranscript(transcript.id)}
              >
                <div>
                  <p className="text-xs mb-1 font-normal truncate w-[130px]">
                    {transcript.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transcript.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Button>
            ))}
            {transcripts.length === 0 && (
              <p className="text-xs text-muted-foreground p-2">
                No simulations yet
              </p>
            )}
          </div>
        </div>
        
        {/* Transcript content */}
        <div className="flex-1 border border-border/50 rounded-lg overflow-hidden">
          {currentTranscript ? (
            <>
              <div className="p-3 border-b border-border/50 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{currentTranscript.topic}</h4>
                  <p className="text-xs text-muted-foreground">
                    {currentTranscript.personaIds.length} personas in conversation
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleSpeech}
                    className="gap-1"
                  >
                    {isSpeechPlaying ? <Pause size={14} /> : <Play size={14} />}
                    {isSpeechPlaying ? "Pause" : "Play"}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => addAllHighlightedInsights(currentTranscript.id)}
                  >
                    Add all insights
                  </Button>
                </div>
              </div>
              
              <div className="p-4 h-[300px] overflow-y-auto">
                {currentTranscript.messages.map((message, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="py-0 h-5">
                        {message.persona}
                      </Badge>
                    </div>
                    <p className={`pl-2 ${message.containsInsight ? 'text-cyan' : ''}`}>
                      {message.text}
                      {message.containsInsight && (
                        <button 
                          className="ml-2 text-amber-400 hover:text-amber-300"
                          onClick={() => addInsight(
                            message.text.substring(0, 90) + (message.text.length > 90 ? '...' : ''),
                            `Simulation: ${currentTranscript.topic}`,
                            false
                          )}
                        >
                          <Lightbulb size={16} />
                        </button>
                      )}
                    </p>
                  </div>
                ))}
                {isSimulating && currentTranscript.id === activeTranscript && (
                  <div className="flex space-x-1 mt-4">
                    <div className="h-2 w-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Run a simulation to see the transcript
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-8 inset-x-0 mx-8 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-t border-border/40">
        <div className="text-sm">
          {transcripts.length > 0 ? (
            <span className="flex items-center text-cyan gap-1">
              <CircleCheck size={16} /> Created {transcripts.length} simulation{transcripts.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Run at least one simulation
            </span>
          )}
        </div>
        <Button 
          onClick={onComplete}
          className="bg-cyan hover:bg-cyan/90 text-background"
        >
          Review insights →
        </Button>
      </div>
    </motion.div>
  );
};

export default SimulationHub;
