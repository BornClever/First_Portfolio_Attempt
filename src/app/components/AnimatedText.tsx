import { useState, useEffect } from 'react';

const FONTS = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Helvetica, sans-serif',
  'Comic Sans MS, cursive',
  'Impact, sans-serif',
  'Trebuchet MS, sans-serif',
  'Palatino, serif',
  'Garamond, serif',
  'Bookman, serif',
  'Tahoma, sans-serif',
  'Monaco, monospace',
  'Lucida Console, monospace',
  'Brush Script MT, cursive',
  'Papyrus, fantasy',
  'Rockwell, serif',
  'Optima, sans-serif',
  'Futura, sans-serif'
];

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedText({ children, className }: AnimatedTextProps) {
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFontIndex((prevIndex) => (prevIndex + 1) % FONTS.length);
    }, 140); // Perfect balance of speed and readability

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={className} 
      style={{ 
        fontFamily: FONTS[currentFontIndex]
      }}
    >
      {children}
    </div>
  );
}