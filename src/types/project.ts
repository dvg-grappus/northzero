
export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'draft';

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  progress: number; // 0-100
  status: ProjectStatus;
  collaborators: Collaborator[];
}
