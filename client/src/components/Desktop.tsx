import { useState, useEffect } from 'react';
import type { WindowState } from '../App';

interface DesktopProps {
  onOpenWindow: (windowId: string) => void;
  windows: Record<string, WindowState>;
}

interface AppIcon {
  id: string;
  title: string;
  icon: string;
  position: { x: number; y: number };
}

export function Desktop({ onOpenWindow, windows }: DesktopProps) {
  const [time, setTime] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const appIcons: AppIcon[] = [
    {
      id: 'about',
      title: 'About Me',
      icon: '👤',
      position: { x: 50, y: 50 }
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: '💼',
      position: { x: 50, y: 150 }
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: '📧',
      position: { x: 50, y: 250 }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      position: { x: 50, y: 350 }
    }
  ];

  const handleIconClick = (iconId: string) => {
    if (selectedIcon === iconId) {
      // Double click effect - open the window
      onOpenWindow(iconId);
      setSelectedIcon(null);
    } else {
      // Single click - select the icon
      setSelectedIcon(iconId);
      setTimeout(() => setSelectedIcon(null), 2000); // Auto-deselect after 2 seconds
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the desktop itself, not on icons
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
    }
  };

  return (
    <div 
      className="w-full h-full relative cursor-pointer"
      onClick={handleDesktopClick}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
        `
      }}
    >
      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-purple-800 border-b border-purple-600 flex items-center px-2 z-40">
        <div className="text-white text-xs font-mono">🍎 Portfolio OS</div>
        <div className="ml-auto text-purple-200 text-xs font-mono">
          {time.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Desktop Icons */}
      {appIcons.map((icon: AppIcon) => (
        <div
          key={icon.id}
          className={`absolute cursor-pointer select-none group ${
            selectedIcon === icon.id ? 'z-30' : 'z-20'
          }`}
          style={{
            left: `${icon.position.x}px`,
            top: `${icon.position.y + 24}px` // Account for menu bar height
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleIconClick(icon.id);
          }}
          onDoubleClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onOpenWindow(icon.id);
            setSelectedIcon(null);
          }}
        >
          {/* Icon Background (selection highlight) */}
          <div className={`absolute inset-0 rounded-lg transition-all duration-200 ${
            selectedIcon === icon.id 
              ? 'bg-purple-500 bg-opacity-50 backdrop-blur-sm' 
              : 'group-hover:bg-purple-600 group-hover:bg-opacity-30'
          }`} />
          
          {/* Icon Container */}
          <div className="relative flex flex-col items-center p-2 w-16">
            {/* Icon */}
            <div className="text-3xl mb-1 filter drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
              {icon.icon}
            </div>
            
            {/* Label */}
            <div className={`text-xs font-mono text-center leading-tight transition-colors duration-200 ${
              selectedIcon === icon.id 
                ? 'text-white font-bold' 
                : 'text-purple-100 group-hover:text-white'
            }`}>
              {icon.title}
            </div>

            {/* Open indicator */}
            {windows[icon.id]?.isOpen && (
              <div className="absolute -bottom-1 w-2 h-1 bg-purple-300 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      ))}

      {/* Decorative Elements */}
      <div className="absolute bottom-20 right-8 text-purple-300 opacity-50 text-xs font-mono">
        Welcome to my portfolio! 💫
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i: number) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-300 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}