import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface RetroMacAppProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  isShaking?: boolean;
  size?: 'normal' | 'large' | 'xlarge';
  initialPosition?: { x: number; y: number };
  onOpenPDF?: () => void; // New prop for PDF viewer
}

interface Position {
  x: number;
  y: number;
}

interface WindowSize {
  width: number;
  height: number;
}

export default function RetroMacApp({ isOpen, onClose, title, children, isShaking = false, size = 'normal', initialPosition, onOpenPDF }: RetroMacAppProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWindow, setShowWindow] = useState(false);

  // Initial window size based on size prop
  const getInitialSize = useCallback((): WindowSize => {
    switch (size) {
      case 'xlarge':
        return { width: 480, height: 600 };
      case 'large':
        return { width: 384, height: 320 };
      default:
        return { width: 288, height: 288 };
    }
  }, [size]);
  
  // Drag and drop state - use initialPosition if provided, otherwise default
  const [position, setPosition] = useState<Position>(() => 
    initialPosition || { x: 64, y: 64 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Window resize state
  const [windowSize, setWindowSize] = useState<WindowSize>(getInitialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [resizeStart, setResizeStart] = useState<{ mouse: Position; size: WindowSize; pos: Position }>({
    mouse: { x: 0, y: 0 },
    size: getInitialSize(),
    pos: { x: 64, y: 64 }
  });
  
  // Touch support
  const [dragTouchId, setDragTouchId] = useState<number | null>(null);
  
  // Refs for boundary calculations
  const windowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Update position if initialPosition changes when opening
      if (initialPosition) {
        setPosition(initialPosition);
      }
      setShowWindow(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShowWindow(false), 200);
    }
  }, [isOpen, initialPosition]);

  // Get retro screen boundaries for drag and resize constraints
  const getScreenBounds = useCallback(() => {
    const retroScreen = document.querySelector('.retro-screen-area');
    if (!retroScreen) {
      // Fallback bounds if screen not found
      return {
        minX: 16,
        minY: 16,
        maxX: 800,
        maxY: 500,
        screenWidth: 832,
        screenHeight: 532
      };
    }
    
    const screenRect = retroScreen.getBoundingClientRect();
    
    return {
      minX: 16, // Minimum padding from screen edges
      minY: 16,
      maxX: screenRect.width - 16,
      maxY: screenRect.height - 16,
      screenWidth: screenRect.width,
      screenHeight: screenRect.height
    };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!windowRef.current || isResizing) return;
    
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setDragOffset({ x: clientX - position.x, y: clientY - position.y });
    
    // Add grabbing cursor visual feedback
    document.body.style.cursor = 'grabbing';
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }, [position, isResizing]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isResizing) return;
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Apply boundary constraints
    const bounds = getScreenBounds();
    const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX - windowSize.width, newX));
    const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY - windowSize.height, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
    
    // Add subtle shake effect when hitting boundaries
    if (windowRef.current) {
      const hitBoundary = (newX !== constrainedX || newY !== constrainedY);
      if (hitBoundary) {
        windowRef.current.style.animation = 'boundary-shake 0.3s ease-in-out';
        setTimeout(() => {
          if (windowRef.current) {
            windowRef.current.style.animation = '';
          }
        }, 300);
      }
    }
  }, [isDragging, dragOffset, getScreenBounds, windowSize, isResizing]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setDragTouchId(null);
      setResizeHandle('');
      
      // Force restore cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Remove any stuck CSS classes
      if (windowRef.current) {
        windowRef.current.style.animation = '';
      }
    }
  }, [isDragging, isResizing]);

  // Emergency cleanup function
  const forceCleanup = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragTouchId(null);
    setResizeHandle('');
    
    // Force restore cursor and user selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Remove any stuck CSS classes
    if (windowRef.current) {
      windowRef.current.style.animation = '';
    }
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragging) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      mouse: { x: e.clientX, y: e.clientY },
      size: { ...windowSize },
      pos: { ...position }
    });
    
    // Set resize cursor
    document.body.style.cursor = getResizeCursor(handle);
    document.body.style.userSelect = 'none';
  }, [isDragging, windowSize, position]);

  // Get appropriate cursor for resize handle
  const getResizeCursor = (handle: string): string => {
    switch (handle) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nw-resize';
      default:
        return 'default';
    }
  };

  // Handle resize move
  const handleResizeMove = useCallback((clientX: number, clientY: number) => {
    if (!isResizing) return;
    
    const deltaX = clientX - resizeStart.mouse.x;
    const deltaY = clientY - resizeStart.mouse.y;
    
    let newWidth = resizeStart.size.width;
    let newHeight = resizeStart.size.height;
    let newX = resizeStart.pos.x;
    let newY = resizeStart.pos.y;
    
    const bounds = getScreenBounds();
    const minWidth = 200;
    const minHeight = 150;
    const maxWidth = bounds.screenWidth - 32;
    const maxHeight = bounds.screenHeight - 32;
    
    // Handle different resize directions
    if (resizeHandle.includes('e')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.size.width + deltaX));
    }
    if (resizeHandle.includes('w')) {
      const proposedWidth = resizeStart.size.width - deltaX;
      if (proposedWidth >= minWidth && proposedWidth <= maxWidth) {
        newWidth = proposedWidth;
        newX = resizeStart.pos.x + deltaX;
      }
    }
    if (resizeHandle.includes('s')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.size.height + deltaY));
    }
    if (resizeHandle.includes('n')) {
      const proposedHeight = resizeStart.size.height - deltaY;
      if (proposedHeight >= minHeight && proposedHeight <= maxHeight) {
        newHeight = proposedHeight;
        newY = resizeStart.pos.y + deltaY;
      }
    }
    
    // Apply boundary constraints for position
    newX = Math.max(bounds.minX, Math.min(bounds.maxX - newWidth, newX));
    newY = Math.max(bounds.minY, Math.min(bounds.maxY - newHeight, newY));
    
    setWindowSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  }, [isResizing, resizeHandle, resizeStart, getScreenBounds]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle('');
      
      // Restore cursor
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isResizing]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use the first touch that's not already being tracked
    const touch = e.touches[0];
    if (touch && dragTouchId === null) {
      setDragTouchId(touch.identifier);
      handleDragStart(touch.clientX, touch.clientY);
    }
  }, [handleDragStart, dragTouchId]);

  // Global mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX, e.clientY);
    } else if (isResizing) {
      handleResizeMove(e.clientX, e.clientY);
    }
  }, [isDragging, isResizing, handleDragMove, handleResizeMove]);

  // Global touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (dragTouchId === null) return;
    
    const touch = Array.from(e.touches).find(t => t.identifier === dragTouchId);
    if (touch) {
      e.preventDefault(); // Prevent scrolling
      handleDragMove(touch.clientX, touch.clientY);
    }
  }, [handleDragMove, dragTouchId]);

  // Global mouse up handler
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      handleDragEnd();
    } else if (isResizing) {
      handleResizeEnd();
    }
  }, [isDragging, isResizing, handleDragEnd, handleResizeEnd]);

  // Global touch end handler
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (dragTouchId === null) return;
    
    const touchStillActive = Array.from(e.touches).some(t => t.identifier === dragTouchId);
    if (!touchStillActive) {
      handleDragEnd();
    }
  }, [handleDragEnd, dragTouchId]);

  // Add and remove global event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Additional safety events
      document.addEventListener('mouseleave', forceCleanup); // When mouse leaves window
      document.addEventListener('blur', forceCleanup); // When window loses focus
      document.addEventListener('contextmenu', forceCleanup); // Right-click menu
      window.addEventListener('beforeunload', forceCleanup); // Page navigation
      
      // Touch events (only for dragging, not resizing on touch devices)
      if (isDragging) {
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);
      }
      
      // Keyboard escape to cancel dragging
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          forceCleanup();
        }
      };
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        // Cleanup mouse events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Cleanup safety events
        document.removeEventListener('mouseleave', forceCleanup);
        document.removeEventListener('blur', forceCleanup);
        document.removeEventListener('contextmenu', forceCleanup);
        window.removeEventListener('beforeunload', forceCleanup);
        
        // Cleanup touch events
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        
        // Cleanup keyboard events  
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Force cleanup on component cleanup
        forceCleanup();
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, forceCleanup]);

  // Cleanup when window closes
  useEffect(() => {
    if (!isOpen) {
      forceCleanup();
    }
  }, [isOpen, forceCleanup]);

  if (!showWindow) return null;

  return (
    // Draggable container positioned anywhere within the retro screen
    <div 
      ref={containerRef}
      className="absolute z-30 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s ease-out'
      }}
    >
      {/* Clean Minimalistic Mac Window */}
      <div 
        ref={windowRef}
        className={`relative bg-white rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-out select-none overflow-hidden ${
          isAnimating 
            ? 'opacity-100 transform scale-100 translate-y-0' 
            : 'opacity-0 transform scale-95 translate-y-2'
        } ${
          isDragging ? 'mac-window-dragging' : ''
        } ${
          isResizing ? 'mac-window-resizing' : ''
        } ${
          isShaking ? 'mac-window-shake' : ''
        }`}
        style={{
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`,
          boxShadow: (isDragging || isResizing)
            ? '0 15px 35px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4)'
            : '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
          cursor: isDragging ? 'grabbing' : (isResizing ? getResizeCursor(resizeHandle) : 'default'),
          transition: (isDragging || isResizing) ? 'none' : 'all 0.3s ease-out'
        }}
      >
        {/* Clean Header Bar - Drag Handle */}
        <div 
          className={`bg-white border-b border-gray-200 rounded-t-lg px-3 py-2 flex items-center justify-between mac-drag-handle ${
            isDragging ? 'mac-title-bar-dragging cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          
          {/* Window Controls */}
          <div className="flex items-center space-x-2">
            {/* Close Button (Red) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-3 h-3 bg-red-500 rounded-full border border-red-600 hover:bg-red-600 transition-all duration-150 group relative z-10 before:content-[''] before:absolute before:inset-[-6px] before:rounded-full"
            >
              <X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
            
            {/* Minimize Button (Yellow) */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600 hover:bg-yellow-600 transition-all duration-150 group relative z-10"
            >
              <Minus className="w-2 h-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
            
            {/* Maximize Button (Green) */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-3 h-3 bg-green-500 rounded-full border border-green-600 hover:bg-green-600 transition-all duration-150 group relative z-10"
            >
              <Square className="w-2 h-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
          </div>
          
          {/* Window Title */}
          <div className="flex-1 text-center">
            <h2 className="font-medium text-gray-700 text-sm">
              {title}
            </h2>
          </div>
          
          {/* Empty space for balance */}
          <div className="w-16"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white overflow-hidden">
          <div className="p-4 h-full overflow-y-auto">
            {children || (
              // Resume File Browser Interface
              <div className="w-full h-full relative bg-white">
                {/* Main Content Area */}
                <div className="absolute top-0 left-0 right-0 bottom-0 px-2 pt-[7px] pb-[21px] overflow-auto pr-[7px] pl-[0px]">
                  <div className="flex flex-col">
                    {/* Resume Document - Full-width hover row */}
                    <div className="group relative w-full cursor-pointer">
                      {/* Full-width hover background */}
                      <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/70 transition-all duration-150 ease-out rounded-sm border border-transparent group-hover:border-blue-200/50"></div>
                      
                      {/* File item content */}
                      <div className="relative flex items-center justify-start w-full px-3 py-3 min-h-[44px] px-[6px] py-[10px] cursor-pointer hover:bg-blue-50/30 transition-colors duration-150"
                        onClick={() => {
                          // Open PDF viewer window
                          if (typeof onOpenPDF === 'function') {
                            onOpenPDF();
                          }
                        }}
                      >
                        {/* File icon with improved positioning */}
                        <div className="w-5 h-5 bg-[#d9d9d9] border border-gray-300 rounded-sm flex-shrink-0 mr-4 relative group-hover:border-gray-400 transition-colors duration-150">
                          <div className="absolute inset-1 bg-white/40 rounded-sm group-hover:bg-white/60 transition-all duration-150"></div>
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-gray-400/50 transform rotate-45 translate-x-0.5 -translate-y-0.5 group-hover:bg-gray-500/70 transition-colors duration-150"></div>
                        </div>
                        
                        {/* File name and details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-['Inter:Regular',_sans-serif] text-[13px] text-black truncate group-hover:text-blue-800 transition-colors duration-150">Resume.pdf</div>
                          <div className="font-['Inter:Regular',_sans-serif] text-[11px] text-gray-500 group-hover:text-blue-600 transition-colors duration-150">PDF Document</div>
                        </div>
                        
                        {/* File size */}
                        <div className="font-['Inter:Regular',_sans-serif] text-[11px] text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors duration-150">124 KB</div>
                      </div>
                    </div>
                    
                    {/* Additional file examples for demo */}
                    <div className="group relative w-full cursor-pointer">
                      <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/70 transition-all duration-150 ease-out rounded-sm border border-transparent group-hover:border-blue-200/50"></div>
                      
                    </div>
                    
                    <div className="group relative w-full cursor-pointer">
                      <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/70 transition-all duration-150 ease-out rounded-sm border border-transparent group-hover:border-blue-200/50"></div>
                      
                    </div>
                  </div>
                </div>

                {/* Subtle Mac-style background texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                     style={{
                       backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)',
                       backgroundSize: '12px 12px'
                     }}>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Drag Visual Feedback */}
        {isDragging && (
          <>
            <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-blue-400/50 mac-drag-feedback" />
            
            {/* Position indicator */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none font-['Courier_New',_monospace]">
              {Math.round(position.x)}, {Math.round(position.y)}
            </div>
          </>
        )}
        
        {/* Resize Visual Feedback */}
        {isResizing && (
          <>
            <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-green-400/50 mac-resize-feedback" />
            
            {/* Size indicator */}
            <div className="absolute -top-8 right-0 transform bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none font-['Courier_New',_monospace]">
              {Math.round(windowSize.width)}×{Math.round(windowSize.height)}
            </div>
          </>
        )}
        
        {/* Window Resize Handles */}
        {/* Corner Handles */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        
        {/* Edge Handles */}
        <div
          className="absolute -top-1 left-3 right-3 h-2 cursor-n-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div
          className="absolute -bottom-1 left-3 right-3 h-2 cursor-s-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div
          className="absolute -left-1 top-3 bottom-3 w-2 cursor-w-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        <div
          className="absolute -right-1 top-3 bottom-3 w-2 cursor-e-resize z-10"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
      </div>
    </div>
  );
}