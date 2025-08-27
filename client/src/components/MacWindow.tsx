import { useState, useRef, useEffect } from 'react';
import type { WindowState } from '../App';

interface MacWindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onUpdatePosition: (windowId: string, position: { x: number; y: number }) => void;
  onUpdateSize: (windowId: string, size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

export function MacWindow({
  window,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  children
}: MacWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y
      });
      onFocus();
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height
    });
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(globalThis.window.innerWidth - window.size.width, e.clientX - dragStart.x));
        const newY = Math.max(24, Math.min(globalThis.window.innerHeight - window.size.height - 48, e.clientY - dragStart.y)); // Account for menu bar and taskbar
        onUpdatePosition(window.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        onUpdateSize(window.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'se-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart, window, onUpdatePosition, onUpdateSize]);

  if (window.isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-gray-100 border-2 border-gray-800 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex
      }}
      onMouseDown={(e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onFocus();
        }
      }}
    >
      {/* Title Bar */}
      <div
        className="h-8 bg-gradient-to-r from-purple-600 to-purple-500 border-b border-gray-700 flex items-center px-2 cursor-grab active:cursor-grabbing drag-handle"
        onMouseDown={handleMouseDown}
      >
        {/* Window Controls */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 border border-red-700 transition-colors"
            title="Close"
          />
          <button
            onClick={onMinimize}
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 border border-yellow-700 transition-colors"
            title="Minimize"
          />
          <button
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 border border-green-700 transition-colors"
            title="Maximize"
            disabled
          />
        </div>

        {/* Window Title */}
        <div className="flex-1 text-center text-white text-sm font-mono font-bold drag-handle">
          {window.title}
        </div>

        {/* Pattern for authentic Mac look */}
        <div className="flex space-x-px">
          {[...Array(8)].map((_, i: number) => (
            <div key={i} className="w-px h-4 bg-purple-400 opacity-50" />
          ))}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto bg-white" style={{ height: 'calc(100% - 32px)' }}>
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2">
          <div className="w-full h-px bg-gray-400" />
          <div className="w-full h-px bg-gray-400 mt-px" />
        </div>
      </div>
    </div>
  );
}