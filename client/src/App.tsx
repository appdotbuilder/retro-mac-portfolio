import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Desktop } from '@/components/Desktop';
import { AboutMeModal } from '@/components/AboutMeModal';
import { ProjectsModal } from '@/components/ProjectsModal';
import { ContactModal } from '@/components/ContactModal';
import { SettingsModal } from '@/components/SettingsModal';
// Using type-only imports for better TypeScript compliance
import type { Project, PortfolioStats, Like, PortfolioSettings, FeedbackMessage, ContactMessage } from '../../server/src/schema';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

function App() {
  // State for all data
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [likes, setLikes] = useState<Like | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  
  // Window management state
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    about: {
      id: 'about',
      title: 'About Me',
      isOpen: false,
      isMinimized: false,
      position: { x: 50, y: 50 },
      size: { width: 600, height: 500 },
      zIndex: 1
    },
    projects: {
      id: 'projects',
      title: 'Projects',
      isOpen: false,
      isMinimized: false,
      position: { x: 100, y: 100 },
      size: { width: 700, height: 600 },
      zIndex: 1
    },
    contact: {
      id: 'contact',
      title: 'Contact',
      isOpen: false,
      isMinimized: false,
      position: { x: 150, y: 150 },
      size: { width: 500, height: 400 },
      zIndex: 1
    },
    settings: {
      id: 'settings',
      title: 'Settings',
      isOpen: false,
      isMinimized: false,
      position: { x: 200, y: 200 },
      size: { width: 450, height: 350 },
      zIndex: 1
    }
  });

  const [maxZIndex, setMaxZIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectsData, statsData, likesData, settingsData, feedbackData, contactData] = await Promise.all([
        trpc.getProjects.query(),
        trpc.getPortfolioStats.query(),
        trpc.getLikes.query(),
        trpc.getPortfolioSettings.query(),
        trpc.getFeedbackMessages.query(),
        trpc.getContactMessages.query()
      ]);

      setProjects(projectsData);
      setPortfolioStats(statsData);
      setLikes(likesData);
      setSettings(settingsData);
      setFeedbackMessages(feedbackData);
      setContactMessages(contactData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Increment visitor count on first load
    trpc.incrementVisitorCount.mutate().catch(console.error);
  }, [loadData]);

  // Window management functions
  const openWindow = (windowId: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        isOpen: true,
        isMinimized: false,
        zIndex: newZIndex
      }
    }));
  };

  const closeWindow = (windowId: string) => {
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        isOpen: false
      }
    }));
  };

  const minimizeWindow = (windowId: string) => {
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        isMinimized: !prev[windowId].isMinimized
      }
    }));
  };

  const focusWindow = (windowId: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        zIndex: newZIndex,
        isMinimized: false
      }
    }));
  };

  const updateWindowPosition = (windowId: string, position: { x: number; y: number }) => {
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        position
      }
    }));
  };

  const updateWindowSize = (windowId: string, size: { width: number; height: number }) => {
    setWindows((prev: Record<string, WindowState>) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        size
      }
    }));
  };

  // Handle like increment
  const handleLike = async () => {
    try {
      const updatedLikes = await trpc.incrementLikes.mutate({ increment: 1 });
      setLikes(updatedLikes);
      // Play sound effect (will be implemented in component)
    } catch (error) {
      console.error('Failed to increment likes:', error);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (name: string, email: string | null, message: string) => {
    try {
      const newFeedback = await trpc.createFeedbackMessage.mutate({ name, email, message });
      setFeedbackMessages((prev: FeedbackMessage[]) => [...prev, newFeedback]);
      return true;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (name: string, email: string | null, subject: string, message: string) => {
    try {
      const newContact = await trpc.createContactMessage.mutate({ name, email, subject, message });
      setContactMessages((prev: ContactMessage[]) => [...prev, newContact]);
      return true;
    } catch (error) {
      console.error('Failed to submit contact message:', error);
      return false;
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async (newSettings: Partial<PortfolioSettings>) => {
    try {
      const updatedSettings = await trpc.updatePortfolioSettings.mutate(newSettings);
      setSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-purple-200 text-2xl font-mono animate-pulse">Loading Portfolio...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden relative">
      {/* Desktop with app icons */}
      <Desktop onOpenWindow={openWindow} windows={windows} />

      {/* About Me Modal */}
      {windows.about.isOpen && (
        <AboutMeModal
          window={windows.about}
          onClose={() => closeWindow('about')}
          onMinimize={() => minimizeWindow('about')}
          onFocus={() => focusWindow('about')}
          onUpdatePosition={updateWindowPosition}
          onUpdateSize={updateWindowSize}
          portfolioStats={portfolioStats}
          likes={likes}
          onLike={handleLike}
          onFeedbackSubmit={handleFeedbackSubmit}
          settings={settings}
        />
      )}

      {/* Projects Modal */}
      {windows.projects.isOpen && (
        <ProjectsModal
          window={windows.projects}
          onClose={() => closeWindow('projects')}
          onMinimize={() => minimizeWindow('projects')}
          onFocus={() => focusWindow('projects')}
          onUpdatePosition={updateWindowPosition}
          onUpdateSize={updateWindowSize}
          projects={projects}
          settings={settings}
        />
      )}

      {/* Contact Modal */}
      {windows.contact.isOpen && (
        <ContactModal
          window={windows.contact}
          onClose={() => closeWindow('contact')}
          onMinimize={() => minimizeWindow('contact')}
          onFocus={() => focusWindow('contact')}
          onUpdatePosition={updateWindowPosition}
          onUpdateSize={updateWindowSize}
          onContactSubmit={handleContactSubmit}
          settings={settings}
        />
      )}

      {/* Settings Modal */}
      {windows.settings.isOpen && (
        <SettingsModal
          window={windows.settings}
          onClose={() => closeWindow('settings')}
          onMinimize={() => minimizeWindow('settings')}
          onFocus={() => focusWindow('settings')}
          onUpdatePosition={updateWindowPosition}
          onUpdateSize={updateWindowSize}
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
        />
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-purple-800 to-purple-700 border-t-2 border-purple-600 flex items-center px-4 z-50">
        <div className="flex space-x-2">
          {Object.values(windows).map((window: WindowState) => (
            window.isOpen && (
              <button
                key={window.id}
                onClick={() => window.isMinimized ? minimizeWindow(window.id) : focusWindow(window.id)}
                className={`px-3 py-1 text-xs font-mono rounded border ${
                  window.isMinimized 
                    ? 'bg-purple-600 border-purple-500 text-purple-200' 
                    : 'bg-purple-500 border-purple-400 text-white'
                } hover:bg-purple-400 transition-colors`}
              >
                {window.title}
              </button>
            )
          ))}
        </div>
        
        <div className="ml-auto text-purple-200 text-xs font-mono">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default App;