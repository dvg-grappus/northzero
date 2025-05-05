import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectStatus, Collaborator } from '@/types/project';
import { toast } from 'sonner';
import { initialProjects } from '@/data/mockProjects';
import * as projectService from '@/services/projectService';

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project | null>;
  updateProject: (project: Project) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Project | undefined;
  refreshProjects: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Check if Supabase is properly configured
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-supabase-url.supabase.co') {
      setIsSupabaseConnected(true);
    } else {
      console.warn('Supabase not configured. Using mock data.');
      setProjects(initialProjects);
      setIsLoading(false);
    }
  }, []);

  // Fetch projects from Supabase if connected
  const fetchProjects = async () => {
    if (!isSupabaseConnected) return;
    
    try {
      setIsLoading(true);
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      // Fallback to mock data if fetch fails
      setProjects(initialProjects);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isSupabaseConnected) {
      fetchProjects();
    }
  }, [isSupabaseConnected]);

  // Create a new project
  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isSupabaseConnected) {
      // Mock creation with local data
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
    }
    
    try {
      const createdProject = await projectService.createProject(project);
      if (createdProject) {
        setProjects((prevProjects) => [...prevProjects, createdProject]);
      }
      return createdProject;
    } catch (err) {
      console.error('Error creating project:', err);
      return null;
    }
  };

  // Update an existing project
  const updateProject = async (updatedProject: Project) => {
    if (!isSupabaseConnected) {
      // Mock update with local data
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === updatedProject.id
            ? { ...updatedProject, updatedAt: new Date() }
            : project
        )
      );
      toast.success("Project updated successfully!");
      return updatedProject;
    }
    
    try {
      const updated = await projectService.updateProject(updatedProject);
      if (updated) {
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === updated.id ? updated : project
          )
        );
      }
      return updated;
    } catch (err) {
      console.error('Error updating project:', err);
      return null;
    }
  };

  // Delete a project
  const deleteProject = async (id: string) => {
    if (!isSupabaseConnected) {
      // Mock deletion with local data
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
      toast.success("Project deleted successfully!");
      return true;
    }
    
    try {
      const success = await projectService.deleteProject(id);
      if (success) {
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error deleting project:', err);
      return false;
    }
  };

  // Get a project by ID
  const getProject = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  // Refresh projects list
  const refreshProjects = async () => {
    if (isSupabaseConnected) {
      await fetchProjects();
    }
  };

  return (
    <ProjectsContext.Provider
      value={{ 
        projects, 
        isLoading, 
        error, 
        createProject, 
        updateProject, 
        deleteProject, 
        getProject,
        refreshProjects,
        isSupabaseConnected
      }}
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