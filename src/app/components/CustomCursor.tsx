import { useEffect, useMemo, useRef, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<string>('default');
  const [isInRetroArea, setIsInRetroArea] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number; target: HTMLElement | null }>({
    x: 0,
    y: 0,
    target: null
  });
  const currentCursorTypeRef = useRef('default');
  const currentAreaRef = useRef(false);

  useEffect(() => {
    const supportsCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsEnabled(supportsCustomCursor && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const resolveCursorType = (target: HTMLElement | null) => {
      if (!target) return 'retro-default';

      if (
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.portfolio-text') ||
        target.closest('.retro-folder')
      ) {
        return 'retro-hand';
      }

      if (target.matches('input') || target.matches('textarea') || target.matches('[contenteditable]')) {
        return 'retro-text';
      }

      return 'retro-default';
    };

    const flushPointerUpdate = () => {
      animationFrameRef.current = null;
      const { x, y, target } = lastPointerRef.current;
      const inRetroArea = !!target?.closest('.retro-screen-area');

      setPosition((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));

      if (inRetroArea !== currentAreaRef.current) {
        currentAreaRef.current = inRetroArea;
        setIsInRetroArea(inRetroArea);
      }

      const nextCursorType = inRetroArea ? resolveCursorType(target) : 'default';
      if (nextCursorType !== currentCursorTypeRef.current) {
        currentCursorTypeRef.current = nextCursorType;
        setCursorType(nextCursorType);
      }
    };

    const updateCursor = (e: PointerEvent) => {
      lastPointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        target: e.target as HTMLElement | null
      };

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(flushPointerUpdate);
      }
    };

    document.addEventListener('pointermove', updateCursor, { passive: true });

    return () => {
      document.removeEventListener('pointermove', updateCursor);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled]);

  const cursorStyle = useMemo(() => {
    switch (cursorType) {
      case 'retro-hand':
        return {
          width: '16px',
          height: '16px',
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFJlYWxpc3RpYyBQb2ludGluZyBIYW5kIC0tPgogIDxwYXRoIGQ9Ik0zIDlDMyA4IDQgNyA1IDdINlY1QzYgMyA3IDIgOSAyQzEwIDIgMTEgMyAxMSA0VjZDMTEgNiAxMiA1IDEzIDVDMTMuNSA1IDE0IDUuNSAxNCA2VjhDMTQgOCAxNCA4IDE1IDhDMTUuNSA4IDE2IDguNSAxNiA5VjExQzE2IDEyIDE1IDEzIDE0IDEzSDE0QzE0IDEzIDE0IDE0IDEzIDE0QzEzIDE1IDEyIDE2IDExIDE2SDVDNSAxNiA0IDE1IDQgMTRWMTBDNCA5IDMgOSAzIDlaIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMTAiIGN5PSI3IiByPSIwLjgiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        };
      
      case 'retro-text':
        return {
          width: '2px',
          height: '18px',
          backgroundColor: '#51ff38',
          animation: 'cursor-blink 1s infinite'
        };
      
      default:
        return {
          width: '12px',
          height: '18px',
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxMiAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIENsYXNzaWMgQXJyb3cgQ3Vyc29yIC0tPgogIDxwYXRoIGQ9Ik0wIDBWMTZMNCAxNEg4TDAgMFoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIwLjgiLz4KICA8cGF0aCBkPSJNMSAxVjEzTDQgMTJINkwxIDFaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPg==")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left'
        };
    }
  }, [cursorType]);

  // Only show custom cursor when in retro screen area
  if (!isEnabled || !isInRetroArea) return null;

  return (
    <div
      className="fixed pointer-events-none custom-cursor"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x - (cursorType === 'retro-text' ? 1 : cursorType === 'default' ? 0 : 8)}px, ${position.y - (cursorType === 'retro-text' ? 9 : cursorType === 'default' ? 0 : 8)}px, 0)`,
        willChange: 'transform',
        zIndex: 9999,
        ...cursorStyle
      }}
    />
  );
}