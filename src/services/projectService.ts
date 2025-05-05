import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus, Collaborator } from '@/types/project';
import { toast } from 'sonner';

// Convert database project to frontend project
const dbProjectToProject = (dbProject: any): Project => {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    thumbnail: dbProject.thumbnail,
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at),
    progress: dbProject.progress,
    status: dbProject.status as ProjectStatus,
    collaborators: dbProject.collaborators || [],
  };
};

// Convert frontend project to database project
const projectToDbProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    name: project.name,
    description: project.description,
    thumbnail: project.thumbnail,
    progress: project.progress,
    status: project.status,
    collaborators: project.collaborators,
  };
};

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(dbProjectToProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to fetch projects');
    return [];
  }
};

// Get a single project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data ? dbProjectToProject(data) : null;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    toast.error('Failed to fetch project details');
    return null;
  }
};

// Create a new project
export const createProject = async (
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectToDbProject(project))
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Project created successfully');
    return data ? dbProjectToProject(data) : null;
  } catch (error) {
    console.error('Error creating project:', error);
    toast.error('Failed to create project');
    return null;
  }
};

// Update an existing project
export const updateProject = async (project: Project): Promise<Project | null> => {
  try {
    const { id, createdAt, updatedAt, ...rest } = project;
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...projectToDbProject(rest),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Project updated successfully');
    return data ? dbProjectToProject(data) : null;
  } catch (error) {
    console.error('Error updating project:', error);
    toast.error('Failed to update project');
    return null;
  }
};

// Delete a project
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast.success('Project deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Failed to delete project');
    return false;
  }
};