import { useState, useEffect, ReactNode } from 'react';

interface ResponsiveWrapperProps {
  children: ReactNode;
}

export interface ResponsiveContext {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  joystickScale: number;
  buttonScale: number;
  displayScale: number;
}

export function useResponsive(): ResponsiveContext {
  const [screenWidth, setScreenWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Use passive event listener for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // Calculate responsive scales
  const joystickScale = screenWidth < 640 ? 0.8 : screenWidth < 768 ? 0.9 : 1;
  const buttonScale = screenWidth < 640 ? 0.85 : screenWidth < 768 ? 0.92 : 1;
  const displayScale = screenWidth < 640 ? 0.75 : screenWidth < 768 ? 0.85 : screenWidth < 1024 ? 0.9 : 1;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    joystickScale,
    buttonScale,
    displayScale,
  };
}

export default function ResponsiveWrapper({ children }: ResponsiveWrapperProps) {
  return <>{children}</>;
}