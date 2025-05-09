import { useState, useEffect } from 'react';
import { llmConfigService } from '../services/llmConfig';
import { openAIService } from '../services/openai';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Model {
  id: string;
  name: string;
  created: string;
  model_type: 'chat' | 'completion' | 'reasoning';
}

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Load current config
        const config = await llmConfigService.getCurrentConfig();
        
        // Load available models
        const models = await openAIService.getAvailableModels();
        const displayModels = openAIService.getDisplayModels(models);
        setAvailableModels(displayModels);

        // Set selected model
        if (config) {
          setSelectedModel(config.model_id);
        } else if (displayModels.length > 0) {
          // Default to first available model if no config exists
          setSelectedModel(displayModels[0].id);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        setError(error instanceof Error ? error.message : 'Failed to load models');
        toast({
          title: "Error",
          description: "Failed to load available models. Please check your OpenAI API key configuration.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [toast]);

  const handleModelChange = async (modelId: string) => {
    setIsLoading(true);
    try {
      const model = availableModels.find(m => m.id === modelId);
      const modelType = model?.model_type;
      const success = await llmConfigService.updateModel(modelId, modelType);
      if (success) {
        setSelectedModel(modelId);
        toast({
          title: "Success",
          description: "Model updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast({
        title: "Error",
        description: "Failed to update model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group models by type
  const groupedModels = {
    chat: [] as Model[],
    reasoning: [] as Model[],
  };
  availableModels.forEach((model) => {
    if (model.model_type === 'chat') groupedModels.chat.push(model);
    else if (model.model_type === 'reasoning') groupedModels.reasoning.push(model);
  });

  // Segment toggle state
  const [segment, setSegment] = useState<'chat' | 'reasoning'>(groupedModels.chat.length > 0 ? 'chat' : 'reasoning');

  useEffect(() => {
    if (groupedModels.chat.length > 0) setSegment('chat');
    else if (groupedModels.reasoning.length > 0) setSegment('reasoning');
  }, [availableModels.length]);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="API Key Required" />
        </SelectTrigger>
      </Select>
    );
  }

  if (availableModels.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="No models available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          {availableModels.find(m => m.id === selectedModel)?.name || "Select a model"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[220px] max-h-[340px]">
        <div className="px-3 pt-2 pb-1">
          <Tabs value={segment} onValueChange={v => setSegment(v as 'chat' | 'reasoning')} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="chat" className="w-full">Chat</TabsTrigger>
              <TabsTrigger value="reasoning" className="w-full">Reasoning</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="pt-2">
          {segment === 'chat' && groupedModels.chat.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col w-[180px]">
                <span className="font-medium truncate" title={model.name}>{model.name}</span>
                <span className="text-xs text-muted-foreground">Created: {model.created}</span>
              </div>
            </SelectItem>
          ))}
          {segment === 'reasoning' && groupedModels.reasoning.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col w-[180px]">
                <span className="font-medium truncate" title={model.name}>{model.name}</span>
                <span className="text-xs text-muted-foreground">Created: {model.created}</span>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
} 