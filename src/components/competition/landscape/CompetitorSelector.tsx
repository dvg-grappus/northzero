
import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Plus, Search } from "lucide-react";
import { Competitor, useCompetition } from "@/providers/CompetitionProvider";

export const CompetitorSelector: React.FC = () => {
  const { competitors, selectedCompetitors, toggleSelectCompetitor } = useCompetition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCompetitors = competitors.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-1">
          <Plus className="h-4 w-4" />
          Add Competitors
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Competitors</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
              <CommandInput 
                placeholder="Search competitors..." 
                value={search}
                onValueChange={setSearch}
                className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList>
              <CommandEmpty>No competitors found</CommandEmpty>
              <CommandGroup>
                {filteredCompetitors.map((competitor) => (
                  <CommandItem
                    key={competitor.id}
                    value={competitor.name}
                    onSelect={() => {
                      toggleSelectCompetitor(competitor.id);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${competitor.type === 'startup' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <span>{competitor.name}</span>
                    </div>
                    {selectedCompetitors.includes(competitor.id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {selectedCompetitors.length} competitors selected
          </div>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
