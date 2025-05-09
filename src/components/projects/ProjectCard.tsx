import React from 'react';
import { formatDistance } from 'date-fns';
import { 
  CalendarDays, 
  Check, 
  CircleDot, 
  CircleX, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Users 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus } from '@/types/project';
import { useProjects } from '@/contexts/ProjectsContext';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const statusConfig: Record<ProjectStatus, { icon: React.ReactNode, label: string, className: string }> = {
  active: {
    icon: <CircleDot className="h-4 w-4" />,
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  completed: {
    icon: <Check className="h-4 w-4" />,
    label: 'Completed',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  paused: {
    icon: <CircleX className="h-4 w-4" />,
    label: 'Paused',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  draft: {
    icon: <CircleDot className="h-4 w-4" />,
    label: 'Draft',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
};

// Collection of gradient backgrounds for project thumbnails
const gradients = [
  "bg-gradient-to-br from-purple-500/90 to-indigo-500/90", // Purple to indigo
  "bg-gradient-to-br from-cyan-500/90 to-blue-500/90",     // Cyan to blue
  "bg-gradient-to-br from-amber-500/90 to-orange-500/90",  // Amber to orange
  "bg-gradient-to-br from-emerald-500/90 to-green-500/90", // Emerald to green
  "bg-gradient-to-br from-rose-500/90 to-pink-500/90",     // Rose to pink
  "bg-gradient-to-br from-purple-400/90 to-pink-600/90",   // Purple to pink
  "bg-gradient-to-br from-blue-400/90 to-emerald-400/90",  // Blue to emerald
  "bg-gradient-to-br from-indigo-500/90 to-purple-500/90"  // Indigo to purple
];

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const navigate = useNavigate();
  const { deleteProject } = useProjects();
  
  // Use hash of project ID to consistently get the same gradient for a project
  const gradientIndex = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const gradientClass = gradients[gradientIndex];

  // For projects with legacy thumbnail URLs, we'll assign a gradient style
  let thumbnailStyle: React.CSSProperties = {};
  
  if (project.thumbnail && project.thumbnail.startsWith('linear-gradient')) {
    thumbnailStyle = { background: project.thumbnail };
  }

  const statusConfig = getStatusConfig(project.status);
  
  const handleNavigate = () => {
    // Navigate to the timeline view for this project
    navigate(`/timeline?projectId=${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast("Edit functionality will be implemented soon!");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(project.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card 
        onClick={handleNavigate}
        className="overflow-hidden cursor-pointer h-full transition-all hover:shadow-lg hover:shadow-cyan/10 hover:-translate-y-1"
      >
        {/* Project gradient thumbnail */}
        <div 
          className={`aspect-video flex items-center justify-center ${project.thumbnail?.startsWith('linear-gradient') ? '' : gradientClass}`}
          style={thumbnailStyle}
        >
          <span className="text-white text-lg font-bold tracking-wider opacity-80">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Project details */}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-1">{project.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{project.progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", getProgressColor(project.progress))}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col items-start space-y-3">
          <div className="flex items-center justify-between w-full">
            {/* Status badge */}
            <div className={cn("px-2 py-1 rounded-full border flex items-center gap-1 text-xs font-medium", statusConfig.className)}>
              {statusConfig.icon}
              {statusConfig.label}
            </div>
            
            {/* Date info */}
            <div className="flex items-center text-muted-foreground text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              {formatDistance(project.updatedAt, new Date(), { addSuffix: true })}
            </div>
          </div>
          
          {/* Collaborators */}
          {project.collaborators.length > 0 && (
            <div className="flex items-center w-full">
              <Users className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <div className="flex -space-x-2 shrink-0">
                {project.collaborators.slice(0, 3).map((collaborator) => (
                  <Avatar key={collaborator.id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {collaborator.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.collaborators.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      +{project.collaborators.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 20) return 'bg-amber-500';
  return 'bg-gray-500';
}

function getStatusConfig(status: ProjectStatus) {
  return statusConfig[status];
}

export default ProjectCard;
