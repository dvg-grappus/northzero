
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCompetition } from '@/providers/CompetitionProvider';
import { toast } from 'sonner';

interface CompetitorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompetitorSearchModal: React.FC<CompetitorSearchModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { addCompetitor } = useCompetition();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Mock search process
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Create a category name based on the search query
      const categoryName = generateCategoryName(searchQuery);
      
      // Generate mock competitors based on the search query
      const mockCompetitors = generateMockCompetitors(searchQuery, categoryName);
      
      // Add each mock competitor to the competition provider
      mockCompetitors.forEach(competitor => {
        addCompetitor(competitor);
      });
      
      toast.success(`Found ${mockCompetitors.length} competitors matching your query`);
      
      // Reset form and close modal
      setSearchQuery('');
      setIsSearching(false);
      onClose();
    }, 1500);
  };
  
  // Generate a category name based on the search query
  const generateCategoryName = (query: string): string => {
    if (query.toLowerCase().includes('australia') || query.toLowerCase().includes('australian')) {
      return 'Australian Startups';
    } else if (query.toLowerCase().includes('fund')) {
      return 'Recently Funded Companies';
    } else if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('artificial intelligence')) {
      return 'AI Innovators';
    } else if (query.toLowerCase().includes('tech')) {
      return 'Tech Disruptors';
    } else {
      return `${query.charAt(0).toUpperCase() + query.slice(1)} Competitors`;
    }
  };
  
  // Generate mock competitors based on the search query
  const generateMockCompetitors = (query: string, category: string) => {
    const baseNames = [
      "Nexus", "Quantum", "Apex", "Horizon", "Eclipse", 
      "Fusion", "Vertex", "Catalyst", "Zenith", "Pulse"
    ];
    
    const industries = [
      "Tech", "AI", "Fintech", "Health", "SaaS"
    ];
    
    // Generate 3-5 mock competitors
    const count = 3 + Math.floor(Math.random() * 3);
    const mockCompetitors = [];
    
    for (let i = 0; i < count; i++) {
      const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
      const industry = industries[Math.floor(Math.random() * industries.length)];
      
      // Create a unique mock competitor
      const mockCompetitor = {
        id: `mock-${Date.now()}-${i}`,
        name: `${baseName} ${industry}`,
        logo: "/placeholder.svg",
        tags: [category, industry, query.includes('fund') ? 'Funded' : 'Startup'],
        type: "startup" as const,
        priority: 3 + Math.floor(Math.random() * 7),
        position: { x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4 }
      };
      
      mockCompetitors.push(mockCompetitor);
    }
    
    return mockCompetitors;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find Competitors</DialogTitle>
          <DialogDescription>
            Use natural language to describe the competitors you're looking for
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="py-4 space-y-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="e.g., 'Find me competitors who are recently funded in Australia'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <h3 className="font-medium mb-2">How this works</h3>
            <p className="text-sm text-muted-foreground">
              Enter a natural language query describing the competitors you want to find.
              Our AI will search for relevant companies and add them to your competition map.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? "Searching..." : "Find Competitors"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
