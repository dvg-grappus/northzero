
import React, { createContext, useContext, useState } from 'react';
import { Project, ProjectStatus, Collaborator } from '@/types/project';
import { toast } from '@/components/ui/sonner';

// Sample data for initial projects
const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'Alex Morgan', initials: 'AM' },
  { id: '2', name: 'Taylor Swift', initials: 'TS' },
  { id: '3', name: 'Jordan Lee', initials: 'JL' },
  { id: '4', name: 'Casey Johnson', initials: 'CJ' },
  { id: '5', name: 'Morgan Freeman', initials: 'MF' },
];

// Collection of gradient backgrounds for project thumbnails
const gradients = [
  "linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)", // Purple to indigo
  "linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)", // Cyan to blue
  "linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)", // Amber to orange
  "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)", // Emerald to green
  "linear-gradient(135deg, rgba(225, 29, 72, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", // Rose to pink
  "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)", // Purple to pink
];

// Initialize with some dummy projects
const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Refresh Beverage Co.',
    description: 'Brand identity for organic juice line targeting urban professionals.',
    thumbnail: gradients[2], // Amber to Orange gradient
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-04-01'),
    progress: 85,
    status: 'active',
    collaborators: [mockCollaborators[0], mockCollaborators[1]],
  },
  {
    id: '2',
    name: 'NexTech Solutions',
    description: 'Complete rebrand for a growing SaaS company focusing on AI tools.',
    thumbnail: gradients[0], // Purple to Indigo gradient
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-03-25'),
    progress: 60,
    status: 'active',
    collaborators: [mockCollaborators[2], mockCollaborators[3], mockCollaborators[0]],
  },
  {
    id: '3',
    name: 'EcoSustain Products',
    description: 'Sustainable packaging brand identity for eco-conscious consumers.',
    thumbnail: gradients[3], // Emerald to Green gradient
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-04-10'),
    progress: 40,
    status: 'active',
    collaborators: [mockCollaborators[1], mockCollaborators[4]],
  },
  {
    id: '4',
    name: 'Metropolitan Gallery',
    description: 'Brand refresh for a contemporary art space expanding to digital experiences.',
    thumbnail: gradients[5], // Purple to Pink gradient
    createdAt: new Date('2025-02-28'),
    updatedAt: new Date('2025-03-15'),
    progress: 100,
    status: 'completed',
    collaborators: [mockCollaborators[0], mockCollaborators[3], mockCollaborators[4]],
  },
  {
    id: '5',
    name: 'Astral Coffee Shop',
    description: 'Branding for a new coffee chain with an astronomy theme.',
    thumbnail: gradients[1], // Cyan to Blue gradient
    createdAt: new Date('2025-04-01'),
    updatedAt: new Date('2025-04-15'),
    progress: 25,
    status: 'paused',
    collaborators: [mockCollaborators[2]],
  },
  {
    id: '6',
    name: 'Solace Wellness',
    description: 'Brand system for a holistic health and meditation studio.',
    thumbnail: gradients[4], // Rose to Pink gradient
    createdAt: new Date('2025-03-20'),
    updatedAt: new Date('2025-04-10'),
    progress: 15,
    status: 'draft',
    collaborators: [mockCollaborators[0], mockCollaborators[1], mockCollaborators[4]],
  },
];

interface ProjectsContextType {
  projects: Project[];
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const createProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const now = new Date();
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success("Project created successfully!");
    return newProject;
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id
          ? { ...updatedProject, updatedAt: new Date() }
          : project
      )
    );
    toast.success("Project updated successfully!");
  };

  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    toast.success("Project deleted successfully!");
  };

  const getProject = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  return (
    <ProjectsContext.Provider
      value={{ projects, createProject, updateProject, deleteProject, getProject }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
