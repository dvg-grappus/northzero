import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Collection of gradient options for project thumbnails
const gradientOptions = [
  { value: "linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)", label: "Purple to Indigo" },
  { value: "linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)", label: "Cyan to Blue" },
  { value: "linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)", label: "Amber to Orange" },
  { value: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)", label: "Emerald to Green" },
  { value: "linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", label: "Rose to Pink" },
  { value: "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", label: "Purple to Pink" },
];

const NewProjectDialog: React.FC = () => {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0].value);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsCreating(true);
    
    // Create the new project
    const newProject = await createProject({
      name,
      description,
      thumbnail: selectedGradient,
      progress: 0,
      status: 'draft',
      collaborators: []
    });
    
    // Close dialog and navigate to the new project
    setOpen(false);
    setIsCreating(false);
    
    setTimeout(() => {
      // Reset form
      setName('');
      setDescription('');
      setSelectedGradient(gradientOptions[0].value);
      
      // Navigate to timeline with the new project ID
      if (newProject && newProject.id) {
        navigate(`/timeline?projectId=${newProject.id}`);
      }
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-5 w-5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Add details for your new brand project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your brand project"
              className="col-span-3 resize-none"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Choose a gradient</Label>
            <div className="grid grid-cols-3 gap-3">
              {gradientOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => setSelectedGradient(option.value)}
                  className={`
                    relative cursor-pointer overflow-hidden h-20 rounded-md border-2
                    ${selectedGradient === option.value ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                  `}
                >
                  <div 
                    style={{ background: option.value }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-medium opacity-80">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;