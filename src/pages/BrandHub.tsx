
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '@/contexts/ProjectsContext';
import { Search, LayoutGrid, LayoutList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectDialog from '@/components/projects/NewProjectDialog';
import ProjectTable from '@/components/projects/ProjectTable';

const BrandHub: React.FC = () => {
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold tracking-tight">Brand Hub</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your brand projects
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <NewProjectDialog />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* View toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">View:</span>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
                <TabsList>
                  <TabsTrigger 
                    value="grid"
                    className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="list"
                    className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <LayoutList className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </header>
      
      {/* Projects Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 mb-20">
        {filteredProjects.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <ProjectTable projects={filteredProjects} />
            )}
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-center">No projects found</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandHub;
