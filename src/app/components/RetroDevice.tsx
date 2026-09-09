import React, { useState, useEffect } from 'react';
import StatusIndicators from './StatusIndicators';
import BatteryIndicator from './BatteryIndicator';
import PortfolioText from './PortfolioText';
import AnimatedText from './AnimatedText';
import RetroMusicPlayer from './RetroMusicPlayer';
import RetroFolder from './RetroFolder';
import RetroMacApp from './RetroMacApp';
import PDFViewer from './PDFViewer'; // Import PDF viewer
import { calculateScreenPositions } from '../utils/folder-positions';

interface RetroDeviceProps {
  onResumeClick: () => void;
  showResumeApp: boolean;
  onCloseResumeApp: () => void;
  resumeAppShake?: boolean;
}

export default function RetroDevice({ onResumeClick, showResumeApp, onCloseResumeApp, resumeAppShake = false }: RetroDeviceProps) {
  // State management for Project and Gallery apps
  const [showProjectApp, setShowProjectApp] = useState<boolean>(false);
  const [projectAppShake, setProjectAppShake] = useState<boolean>(false);
  const [showGalleryApp, setShowGalleryApp] = useState<boolean>(false);
  const [galleryAppShake, setGalleryAppShake] = useState<boolean>(false);
  
  // PDF Viewer state
  const [showPDFViewer, setShowPDFViewer] = useState<boolean>(false);
  
  // Screen positions for positioning apps near folders
  const [screenPositions, setScreenPositions] = useState(() => calculateScreenPositions());

  // PDF URL from Cloudinary
  const pdfUrl = "https://res.cloudinary.com/dmgndgjeg/image/upload/v1757249320/Shubham_s_Resume_yy4zrs.pdf";

  // Handle PDF viewer opening
  const handleOpenPDF = () => {
    setShowPDFViewer(true);
  };

  // Smart project app click handler
  const handleProjectClick = () => {
    if (showProjectApp) {
      // App is already open - trigger shake animation
      setProjectAppShake(true);
      setTimeout(() => setProjectAppShake(false), 600); // Reset shake after animation
    } else {
      // App is not open - open it normally
      setShowProjectApp(true);
    }
  };

  // Smart gallery app click handler
  const handleGalleryClick = () => {
    if (showGalleryApp) {
      // App is already open - trigger shake animation
      setGalleryAppShake(true);
      setTimeout(() => setGalleryAppShake(false), 600); // Reset shake after animation
    } else {
      // App is not open - open it normally
      setShowGalleryApp(true);
    }
  };

  // Update screen positions when component mounts or screen resizes
  useEffect(() => {
    const updatePositions = () => {
      setScreenPositions(calculateScreenPositions());
    };

    // Update positions after component renders
    const timer = setTimeout(updatePositions, 100);

    // Update on window resize
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  return (
    <div className="relative w-full max-w-7xl aspect-[16/10]">
      
      {/* Outer Device Shell */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8e8] via-[#d4d4d4] to-[#b8b8b8] rounded-[50px] shadow-2xl">
        {/* Device Shadow/Depth */}
        <div className="absolute inset-1 bg-gradient-to-br from-[#a8a8a8] via-[#888888] to-[#606060] rounded-[45px] shadow-inner">
          
          {/* Inner Bezel */}
          <div className="absolute inset-2 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#000000] rounded-[40px] shadow-lg">
            
            {/* Screen Bezel */}
            <div className="absolute inset-1 bg-gradient-to-br from-[#404040] via-[#2e2e2e] to-[#1a1a1a] rounded-[35px] shadow-inner">
              
              {/* CRT Screen Effect */}
              <div className="absolute inset-2 bg-[#1e1e1e] rounded-[30px] border border-[#444444] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden desktop-grid retro-screen-area">
                
                {/* Screen Curvature Effect */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20 rounded-[25px]"></div>
                
                {/* Scanlines Effect */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                }}></div>
                
                {/* Header Section */}
                <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-start z-20">
                  <StatusIndicators />
                  <BatteryIndicator />
                </div>

                {/* Main Content */}
                <div className="absolute inset-4 sm:inset-8 lg:inset-8 lg:right-80 flex flex-col justify-center z-10">
                  
                  {/* Introduction */}
                  <div className="mb-6 sm:mb-8 md:mb-12">
                    <h1 className="font-['Silkscreen:Regular',_Courier,_monospace] text-white text-[clamp(1.5rem,5vw,3.5rem)] leading-tight mb-4">
                      I am Shubham!!
                    </h1>
                    
                    <div className="flex flex-col gap-1">
                      <p className="font-['Rubik:Italic',_sans-serif] italic text-white text-[clamp(1rem,3vw,2rem)] leading-tight mb-2">
                        A designer who is obsessed with
                      </p>
                      
                      <AnimatedText className="text-white text-[clamp(1.2rem,4vw,2.5rem)] leading-tight">
                        Micro Interactions
                      </AnimatedText>
                    </div>
                  </div>

                  {/* Portfolio Text */}
                  <div className="w-full">
                    <PortfolioText />
                  </div>
                </div>

                {/* Retro Music Player - Positioned on right side */}
                <div className="hidden lg:block absolute top-32 right-8 pointer-events-auto z-20">
                  <div className="w-72">
                    <RetroMusicPlayer />
                  </div>
                </div>

                {/* Scattered Desktop Folders - 4 Strategic Positions */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Enable pointer events only for folders */}
                  <div className="absolute inset-0 [&>*]:pointer-events-auto">
                    
                    {/* Top Left - Safe zone below status indicators */}
                    <RetroFolder 
                      name="Projects" 
                      style={{ 
                        position: 'absolute', 
                        top: '15%', 
                        left: '18%',
                        transform: 'rotate(-3deg)',
                        animationDelay: '0.8s'
                      }}
                      onClick={handleProjectClick}
                    />
                    
                    {/* Bottom Left - Below main content area */}
                    <RetroFolder 
                      name="Gallery" 
                      style={{ 
                        position: 'absolute', 
                        bottom: '15%', 
                        left: '18%',
                        transform: 'rotate(2deg)',
                        animationDelay: '2.1s'
                      }}
                      onClick={handleGalleryClick}
                    />
                    
                    {/* Center Right - Between content and music player */}
                    <RetroFolder 
                      name="Resume" 
                      style={{ 
                        position: 'absolute', 
                        top: '45%', 
                        right: '42%',
                        transform: 'rotate(1deg)',
                        animationDelay: '1.4s'
                      }}
                      onClick={onResumeClick}
                    />
                    
                  </div>
                </div>

                {/* Resume Mac Application - Inside the screen */}
                <RetroMacApp
                  isOpen={showResumeApp}
                  onClose={onCloseResumeApp}
                  title="Resume.txt"
                  isShaking={resumeAppShake}
                  initialPosition={screenPositions.appPositions.resume}
                  onOpenPDF={handleOpenPDF}
                />

                {/* Project Mac Application - Inside the screen (Larger) */}
                <RetroMacApp
                  isOpen={showProjectApp}
                  onClose={() => setShowProjectApp(false)}
                  title="Projects"
                  isShaking={projectAppShake}
                  size="large"
                  initialPosition={screenPositions.appPositions.projects}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-700">My Projects</div>
                      <div>Project content will be added here</div>
                    </div>
                  </div>
                </RetroMacApp>

                {/* Gallery Mac Application - Inside the screen */}
                <RetroMacApp
                  isOpen={showGalleryApp}
                  onClose={() => setShowGalleryApp(false)}
                  title="Gallery"
                  isShaking={galleryAppShake}
                  initialPosition={screenPositions.appPositions.gallery}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500 text-sm text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-700">Design Gallery</div>
                      <div>Gallery content will be added here</div>
                    </div>
                  </div>
                </RetroMacApp>

                {/* System Version Text - Bottom Right Edge */}
                <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-20">
                  <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-[#51ff38] text-xs sm:text-sm md:text-base leading-none bg-black/20 px-3 py-1 rounded border border-[#51ff38]/20 backdrop-blur-sm font-normal not-italic no-underline">
                    System Ver 2.0
                  </div>
                </div>

                {/* Mobile Optimized Layout */}
                <div className="sm:hidden absolute inset-4 flex flex-col justify-center z-10">
                  
                  {/* Mobile Introduction */}
                  <div className="mb-8">
                    <h1 className="font-['Silkscreen:Regular',_Courier,_monospace] text-white text-2xl leading-tight mb-4">
                      I am Shubham!!
                    </h1>
                    
                    <div className="space-y-2">
                      <p className="font-['Rubik:Italic',_sans-serif] italic text-white text-lg leading-tight">
                        A designer who is obsessed with
                      </p>
                      
                      <AnimatedText className="text-white text-xl leading-tight">
                        Micro Interactions
                      </AnimatedText>
                    </div>
                  </div>

                  {/* Mobile Portfolio Text - Simplified */}
                  <div className="flex justify-center">
                    <span className="font-['Silkscreen:Bold',_Courier,_monospace] text-white text-4xl leading-none tracking-wider">
                      PORTFOLIO
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        {/* Device Brand Label */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#c0c0c0] to-[#a0a0a0] px-3 py-0.5 rounded-full shadow-inner border border-[#808080]">
            <span className="font-['Silkscreen:Regular',_Courier,_monospace] text-[#333333] text-[10px] tracking-wider">RETRO-COMP 3000</span>
          </div>
        </div>
        
        {/* Power Indicator */}
        <div className="absolute top-4 right-4">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg animate-pulse border border-green-300"></div>
        </div>
        
        {/* Ventilation Grilles */}
        <div className="absolute bottom-3 left-6 right-6 flex justify-center space-x-0.5">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="w-0.5 h-2 bg-gradient-to-b from-[#606060] to-[#404040] rounded-full"></div>
          ))}
        </div>
        
        {/* Side Ports */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-3 h-1.5 bg-gradient-to-r from-[#1a1a1a] to-[#404040] rounded-sm border border-[#606060] shadow-inner"></div>
          ))}
        </div>
        
        {/* Left Side Controls */}
        <div className="absolute left-1 top-1/3 space-y-2">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#606060] to-[#404040] rounded-full border border-[#808080] shadow-inner"></div>
          <div className="w-2.5 h-6 bg-gradient-to-r from-[#606060] to-[#404040] rounded-full border border-[#808080] shadow-inner"></div>
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#606060] to-[#404040] rounded-full border border-[#808080] shadow-inner"></div>
        </div>
      </div>
      
      {/* PDF Viewer Mac Application - Inside the screen */}
      <RetroMacApp
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        title="Resume.pdf"
        size="xlarge"
        initialPosition={{ x: 120, y: 120 }}
      >
        <PDFViewer pdfUrl={pdfUrl} />
      </RetroMacApp>      
    </div>
  );
}