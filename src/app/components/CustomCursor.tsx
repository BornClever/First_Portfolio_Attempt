import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<string>('default');
  const [isInRetroArea, setIsInRetroArea] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if cursor is in the retro screen area ONLY
      const retroScreen = document.querySelector('.retro-screen-area');
      const target = e.target as HTMLElement;
      
      let isInArea = false;
      
      // Check if we're in the retro screen area
      if (retroScreen) {
        const rect = retroScreen.getBoundingClientRect();
        isInArea = e.clientX >= rect.left && 
                   e.clientX <= rect.right && 
                   e.clientY >= rect.top && 
                   e.clientY <= rect.bottom;
      }
      
      // Also check by DOM hierarchy
      if (!isInArea && target) {
        isInArea = !!target.closest('.retro-screen-area');
      }
      
      setIsInRetroArea(isInArea);
      
      if (isInArea) {
        // Simple cursor hiding for retro area only
        document.body.style.cursor = 'none';
        
        // Determine cursor type based on element
        if (target.closest('button') || target.closest('[role="button"]') || target.closest('a') || target.classList.contains('cursor-pointer')) {
          setCursorType('retro-hand');
        } else if (target.matches('input') || target.matches('textarea') || target.matches('[contenteditable]')) {
          setCursorType('retro-text');
        } else if (target.closest('.portfolio-text') || target.closest('.retro-folder')) {
          setCursorType('retro-hand');
        } else {
          setCursorType('retro-default');
        }
      } else {
        // Restore normal cursor outside retro area
        document.body.style.cursor = '';
        setCursorType('default');
      }
    };

    document.addEventListener('mousemove', updateCursor);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      // Restore normal cursor on cleanup
      document.body.style.cursor = '';
    };
  }, []);

  const getCursorStyle = () => {
    switch (cursorType) {
      case 'retro-hand':
        return {
          width: '16px',
          height: '16px',
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFJlYWxpc3RpYyBQb2ludGluZyBIYW5kIC0tPgogIDxwYXRoIGQ9Ik0zIDlDMyA4IDQgNyA1IDdINlY1QzYgMyA3IDIgOSAyQzEwIDIgMTEgMyAxMSA0VjZDMTEgNiAxMiA1IDEzIDVDMTMuNSA1IDE0IDUuNSAxNCA2VjhDMTQgOCAxNCA4IDE1IDhDMTUuNSA4IDE2IDguNSAxNiA5VjExQzE2IDEyIDE1IDEzIDE0IDEzSDE0QzE0IDEzIDE0IDE0IDEzIDE0QzEzIDE1IDEyIDE2IDExIDE2SDVDNSAxNiA0IDE1IDQgMTRWMTBDNCA5IDMgOSAzIDlaIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTAiIGN5PSI3IiByPSIwLjgiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 0 4px #51ff38)'
        };
      
      case 'retro-text':
        return {
          width: '2px',
          height: '18px',
          backgroundColor: '#51ff38',
          filter: 'drop-shadow(0 0 3px #51ff38) drop-shadow(0 0 6px rgba(81, 255, 56, 0.5))',
          animation: 'cursor-blink 1s infinite'
        };
      
      default:
        return {
          width: '12px',
          height: '18px',
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMiAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIENsYXNzaWMgQXJyb3cgQ3Vyc29yIC0tPgogIDxwYXRoIGQ9Ik0wIDBWMTZMNCAxNEg4TDAgMFoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIwLjgiLz4KICA8cGF0aCBkPSJNMSAxVjEzTDQgMTJINkwxIDFaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left',
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 0 3px #51ff38)'
        };
    }
  };

  // Only show custom cursor when in retro screen area
  if (!isInRetroArea) return null;

  return (
    <div
      className="fixed pointer-events-none transition-all duration-100 ease-out"
      style={{
        left: position.x - (cursorType === 'retro-text' ? 1 : cursorType === 'default' ? 0 : 8),
        top: position.y - (cursorType === 'retro-text' ? 9 : cursorType === 'default' ? 0 : 8),
        zIndex: 9999,
        ...getCursorStyle(),
        mixBlendMode: 'screen'
      }}
    />
  );
}