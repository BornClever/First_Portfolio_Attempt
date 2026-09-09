import { useState, useEffect } from 'react';

export default function DigitalStopwatch() {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000); // Convert to seconds
      setElapsedTime(elapsed);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-xl tracking-wider">
      {formatTime(elapsedTime)}
    </div>
  );
}