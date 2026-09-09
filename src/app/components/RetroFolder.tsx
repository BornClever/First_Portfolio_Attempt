import { useState } from 'react';

interface RetroFolderProps {
  name: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function RetroFolder({ name, style, className = "", onClick }: RetroFolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Extract rotation from style prop to set CSS custom property
  const getRotationFromStyle = () => {
    if (style?.transform) {
      const match = style.transform.match(/rotate\(([^)]+)\)/);
      return match ? match[1] : '0deg';
    }
    return '0deg';
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`group cursor-pointer select-none retro-folder folder-shadow ${className}`}
      style={{
        ...style,
        // Set CSS custom property for animations
        '--rotation': getRotationFromStyle()
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Folder Icon */}
      <div className={`relative transition-all duration-200 ${isClicked ? 'scale-95' : 'scale-100'} ${isHovered ? 'transform -translate-y-0.5' : ''}`}>
        {/* Folder Body */}
        <div className={`w-12 h-10 relative transition-all duration-200 folder-pattern ${isHovered ? 'brightness-110' : ''}`}>
          {/* Folder Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-sm border border-yellow-600 shadow-lg">
            {/* Folder Tab */}
            <div className="absolute -top-1.5 left-2 w-6 h-3 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-t-sm border-t border-l border-r border-yellow-600"></div>
            
            {/* Folder Highlights */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-200/60 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-700/40 rounded-full"></div>
            
            {/* Folder Lines (to simulate paper) */}
            <div className="absolute top-3 left-1.5 right-1.5 h-px bg-yellow-600/30"></div>
            <div className="absolute top-5 left-1.5 right-2 h-px bg-yellow-600/20"></div>
            <div className="absolute top-7 left-1.5 right-1 h-px bg-yellow-600/15"></div>
          </div>
          
          {/* Glowing effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-yellow-400/20 rounded-sm animate-pulse"></div>
          )}
        </div>
        
        {/* Folder Label */}
        <div className="mt-1 text-center">
          <div className={`font-['Silkscreen:Regular',_Courier,_monospace] text-white text-xs max-w-16 truncate mx-auto transition-all duration-200 ${isHovered ? 'text-yellow-300 shadow-lg' : ''}`}>
            {name}
          </div>
          {isHovered && (
            <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
          )}
        </div>
      </div>
      
      {/* Double-click ripple effect */}
      {isClicked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-400/60 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
}