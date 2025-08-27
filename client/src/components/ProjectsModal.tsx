import { MacWindow } from './MacWindow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WindowState } from '../App';
import type { Project, PortfolioSettings } from '../../../server/src/schema';

interface ProjectsModalProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onUpdatePosition: (windowId: string, position: { x: number; y: number }) => void;
  onUpdateSize: (windowId: string, size: { width: number; height: number }) => void;
  projects: Project[];
  settings: PortfolioSettings | null;
}

export function ProjectsModal({
  window,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  projects,
  settings
}: ProjectsModalProps) {
  
  // Dummy projects data since backend returns empty array
  const dummyProjects: Project[] = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution built with React, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, and payment processing.',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'JWT'],
      demo_link: 'https://demo-ecommerce.example.com',
      image_url: null,
      display_order: 1,
      is_active: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Weather Dashboard',
      description: 'An interactive weather dashboard that displays current conditions, forecasts, and historical data. Built with React and integrated with multiple weather APIs.',
      tags: ['React', 'TypeScript', 'Chart.js', 'Weather API'],
      demo_link: 'https://weather-dashboard.example.com',
      image_url: null,
      display_order: 2,
      is_active: true,
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10')
    },
    {
      id: 3,
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      tags: ['Vue.js', 'Socket.io', 'MongoDB', 'Express'],
      demo_link: 'https://taskmanager.example.com',
      image_url: null,
      display_order: 3,
      is_active: true,
      created_at: new Date('2024-03-05'),
      updated_at: new Date('2024-03-05')
    },
    {
      id: 4,
      title: 'Portfolio Website',
      description: 'This very portfolio website! Built with React, TypeScript, and styled as a retro Mac desktop. Features interactive windows, animations, and a nostalgic 90s aesthetic.',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'tRPC'],
      demo_link: null,
      image_url: null,
      display_order: 4,
      is_active: true,
      created_at: new Date('2024-03-20'),
      updated_at: new Date('2024-03-20')
    }
  ];

  // Use dummy data if no real projects are available
  const displayProjects = projects.length > 0 ? projects : dummyProjects;
  
  const sortedProjects = [...displayProjects].sort((a: Project, b: Project) => 
    a.display_order - b.display_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getProjectIcon = (tags: string[]) => {
    if (tags.includes('React') || tags.includes('Vue.js')) return '⚛️';
    if (tags.includes('Node.js') || tags.includes('Express')) return '🟢';
    if (tags.includes('Python')) return '🐍';
    if (tags.includes('Database') || tags.includes('PostgreSQL') || tags.includes('MongoDB')) return '🗄️';
    return '💻';
  };

  const handleDemoClick = (demoLink: string | null) => {
    if (demoLink && settings?.sound_enabled) {
      console.log('🔊 Demo click sound');
    }
    if (demoLink) {
      globalThis.window.open(demoLink, '_blank');
    }
  };

  return (
    <MacWindow
      window={window}
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      onUpdatePosition={onUpdatePosition}
      onUpdateSize={onUpdateSize}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💼</div>
          <h1 className="text-2xl font-bold text-purple-900 mb-2">My Projects</h1>
          <p className="text-purple-700">A showcase of my recent work and creative endeavors</p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {sortedProjects.map((project: Project) => (
            <Card key={project.id} className="border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getProjectIcon(project.tags)}</div>
                    <div>
                      <CardTitle className="text-lg text-purple-900">
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-purple-600 font-mono">
                        {project.created_at.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {project.demo_link && (
                    <Button
                      onClick={() => handleDemoClick(project.demo_link)}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      🌐 Live Demo
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Project Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <div className="text-purple-400 text-center">
                    <div className="text-3xl mb-2">{getProjectIcon(project.tags)}</div>
                    <div className="text-sm font-mono">Project Preview</div>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
                
                {/* Technologies */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-purple-800">Technologies Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <Badge 
                        key={tag}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Project Stats */}
                <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                  <div className="text-xs text-purple-600 font-mono">
                    Created: {project.created_at.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-purple-600">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {displayProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">💻</div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">No Projects Yet</h3>
            <p className="text-purple-600">Projects will appear here once they're added to the portfolio.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-purple-200 text-center">
          <p className="text-sm text-purple-600">
            💡 More projects coming soon! Check back for updates.
          </p>
        </div>
      </div>
    </MacWindow>
  );
}