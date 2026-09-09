import { useState } from 'react';

export default function PortfolioText() {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isAnimating) {
      setIsAnimating(true);
      // Complete animation duration: base duration (0.6s) + last letter delay (0.6s) = 1.2s
      setTimeout(() => {
        setIsAnimating(false);
      }, 1200);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className="relative w-full h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 cursor-pointer portfolio-text" 
      data-name="Portfolio Text"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* P */}
      <div className="absolute inset-y-0 left-[0%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Regular',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-1' : ''}`}>P</span>
      </div>
      {/* O */}
      <div className="absolute inset-y-0 left-[11%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-2' : ''}`}>O</span>
      </div>
      {/* R */}
      <div className="absolute inset-y-0 left-[22%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-3' : ''}`}>R</span>
      </div>
      {/* T */}
      <div className="absolute inset-y-0 left-[33%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-4' : ''}`}>T</span>
      </div>
      {/* F */}
      <div className="absolute inset-y-0 left-[44%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-5' : ''}`}>F</span>
      </div>
      {/* O */}
      <div className="absolute inset-y-0 left-[55%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-6' : ''}`}>O</span>
      </div>
      {/* L */}
      <div className="absolute inset-y-0 left-[66%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-7' : ''}`}>L</span>
      </div>
      {/* I */}
      <div className="absolute inset-y-0 left-[77%] w-[8%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-8' : ''}`}>I</span>
      </div>
      {/* O */}
      <div className="absolute inset-y-0 left-[85%] w-[11%] flex items-center justify-center">
        <span className={`font-['Silkscreen:Bold',_Courier,_monospace] text-white text-[clamp(1.2rem,6vw,5.5rem)] leading-none select-none transition-transform duration-300 ease-in-out ${isAnimating ? 'animate-wave-9' : ''}`}>O</span>
      </div>
    </div>
  );
}