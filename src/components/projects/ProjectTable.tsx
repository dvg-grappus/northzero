
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { Project, ProjectStatus } from '@/types/project';
import { 
  Check, 
  CircleDot, 
  CircleX,
  MoreVertical
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useProjects } from '@/contexts/ProjectsContext';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
}

const statusConfig: Record<ProjectStatus, { icon: React.ReactNode, label: string, className: string }> = {
  active: {
    icon: <CircleDot className="h-3 w-3" />,
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  completed: {
    icon: <Check className="h-3 w-3" />,
    label: 'Completed',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  paused: {
    icon: <CircleX className="h-3 w-3" />,
    label: 'Paused',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  draft: {
    icon: <CircleDot className="h-3 w-3" />,
    label: 'Draft',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  const navigate = useNavigate();
  const { deleteProject } = useProjects();

  const handleRowClick = (projectId: string) => {
    navigate(`/timeline?projectId=${projectId}`);
  };

  const handleEdit = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    toast("Edit functionality will be implemented soon!");
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    deleteProject(projectId);
  };

  // Get project status configuration
  const getStatusConfig = (status: ProjectStatus) => {
    return statusConfig[status];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Project</TableHead>
            <TableHead className="w-[150px]">Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Collaborators</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const status = getStatusConfig(project.status);
            
            // Get same gradient as card view for consistency
            const gradientIndex = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 8;
            const gradientClasses = [
              "from-purple-500/90 to-indigo-500/90",
              "from-cyan-500/90 to-blue-500/90",
              "from-amber-500/90 to-orange-500/90",
              "from-emerald-500/90 to-green-500/90",
              "from-rose-500/90 to-pink-500/90",
              "from-purple-400/90 to-pink-600/90",
              "from-blue-400/90 to-emerald-400/90",
              "from-indigo-500/90 to-purple-500/90"
            ];

            // For projects with legacy URL thumbnails, we'll use the gradient based on ID
            let gradientStyle: React.CSSProperties = {};
            let gradientClass = `bg-gradient-to-br ${gradientClasses[gradientIndex]}`;
            
            if (project.thumbnail && project.thumbnail.startsWith('linear-gradient')) {
              gradientStyle = { background: project.thumbnail };
              gradientClass = '';
            }
            
            return (
              <TableRow 
                key={project.id}
                onClick={() => handleRowClick(project.id)}
                className="cursor-pointer hover:bg-accent/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded flex items-center justify-center ${gradientClass}`}
                      style={gradientStyle}
                    >
                      <span className="text-white font-semibold">{project.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("flex w-fit gap-1 items-center", status.className)}>
                    {status.icon}
                    <span>{status.label}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2 w-24" />
                    <span className="text-xs">{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {project.collaborators.slice(0, 4).map((collaborator) => (
                      <Avatar key={collaborator.id} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {collaborator.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.collaborators.length > 4 && (
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          +{project.collaborators.length - 4}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistance(project.updatedAt, new Date(), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => handleEdit(e, project.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
