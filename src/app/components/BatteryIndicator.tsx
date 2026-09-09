import { useState, useEffect } from 'react';
import svgPaths from "../imports/svg-gngatunttr";
import imgHeartIcon1 from "figma:asset/1af5e61252d6df9420e6ea034e63a6e2c23e5e0c.png";

export default function BatteryIndicator() {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flickering, setFlickering] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      const startTime = Date.now();
      const duration = 8000; // 8 seconds for more retro feel

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Chunky retro-style level drops (drops in steps, not smooth)
        let newLevel;
        if (progress < 0.2) {
          newLevel = 100 - (progress / 0.2) * 33; // 100% to 67%
        } else if (progress < 0.5) {
          newLevel = 67 - ((progress - 0.2) / 0.3) * 33; // 67% to 34%
        } else if (progress < 0.8) {
          newLevel = 34 - ((progress - 0.5) / 0.3) * 34; // 34% to 0%
        } else {
          newLevel = 0;
          // Start flickering when battery is critically low
          setFlickering(true);
          if (progress > 0.9) {
            setGlitchMode(true);
          }
        }
        
        // Add some random fluctuation for retro effect
        if (newLevel > 0 && Math.random() > 0.85) {
          newLevel += (Math.random() - 0.5) * 10;
        }
        
        setBatteryLevel(Math.max(0, Math.floor(newLevel)));

        if (progress >= 1) {
          clearInterval(interval);
          // Reset after dramatic pause
          setTimeout(() => {
            setBatteryLevel(100);
            setIsAnimating(false);
            setFlickering(false);
            setGlitchMode(false);
          }, 2000);
        }
      }, 200); // Slower, chunkier updates

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  // Retro chunky segment calculation
  const getSegmentCount = () => {
    if (batteryLevel > 66) return 3;
    if (batteryLevel > 33) return 2;
    if (batteryLevel > 0) return 1;
    return 0;
  };

  const getSegmentColor = (segmentIndex: number) => {
    const segmentCount = getSegmentCount();
    if (segmentIndex >= segmentCount) return "transparent";
    
    // More dramatic color changes for retro effect
    if (batteryLevel > 66) return "#06FF6B"; // Green
    if (batteryLevel > 33) return "#FFAA00"; // Orange
    if (batteryLevel > 15) return "#FF4444"; // Red
    return "#FF0000"; // Critical red
  };

  const getSegmentOpacity = (segmentIndex: number) => {
    const segmentCount = getSegmentCount();
    if (segmentIndex >= segmentCount) return 0;
    
    // Flickering effect when battery is low
    if (flickering && batteryLevel < 20) {
      return Math.random() > 0.3 ? 1 : 0.2;
    }
    
    // Glitch effect in critical state
    if (glitchMode && batteryLevel === 0) {
      return Math.random() > 0.7 ? 1 : 0;
    }
    
    return 1;
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-5 h-5 sm:w-6 sm:h-6 bg-contain bg-no-repeat bg-center flex-shrink-0" 
        style={{ backgroundImage: `url('${imgHeartIcon1}')` }}
      />
      
      <div className={`w-8 h-5 sm:w-10 sm:h-6 ${glitchMode ? 'animate-pulse' : ''}`}>
        <svg className="w-full h-full" fill="none" viewBox="0 0 41 22">
          <g style={{ filter: batteryLevel < 20 ? 'drop-shadow(0 0 2px #ff0000)' : 'none' }}>
            <path d={svgPaths.p18b07e00} fill="white" />
            <path d={svgPaths.p3db00b70} fill="white" />
            <path d={svgPaths.p3c48280} fill="white" />
            <path d={svgPaths.p2d0c9000} fill="white" />
            <path d={svgPaths.p2913e400} fill="white" />
            <rect 
              fill={getSegmentColor(0)} 
              height="9.75" 
              width="6.5" 
              x="6" 
              y="6.5"
              style={{
                opacity: getSegmentOpacity(0),
                transition: batteryLevel < 20 ? 'none' : 'opacity 0.3s ease-out'
              }}
            />
            <rect 
              fill={getSegmentColor(1)} 
              height="9.75" 
              width="6.5" 
              x="15.5" 
              y="6.5"
              style={{
                opacity: getSegmentOpacity(1),
                transition: batteryLevel < 20 ? 'none' : 'opacity 0.3s ease-out'
              }}
            />
            <rect 
              fill={getSegmentColor(2)} 
              height="9.75" 
              width="6.5" 
              x="25" 
              y="6.5"
              style={{
                opacity: getSegmentOpacity(2),
                transition: batteryLevel < 20 ? 'none' : 'opacity 0.3s ease-out'
              }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}