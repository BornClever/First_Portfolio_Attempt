// Utility functions for calculating folder positions and app dialog positions

export interface FolderPosition {
  x: number;
  y: number;
}

export interface AppPosition {
  x: number;
  y: number;
}

// Calculate approximate folder positions based on screen dimensions
export const getFolderPositions = (screenWidth: number, screenHeight: number) => {
  return {
    projects: {
      // Top Left - Safe zone below status indicators (15% from top, 18% from left)
      x: screenWidth * 0.18,
      y: screenHeight * 0.15
    },
    gallery: {
      // Bottom Left - Below main content area (15% from bottom, 18% from left)
      x: screenWidth * 0.18,
      y: screenHeight * 0.75 // 85% from top = 15% from bottom
    },
    resume: {
      // Center Right - Between content and music player (45% from top, 58% from left)
      x: screenWidth * 0.58,
      y: screenHeight * 0.45
    }
  };
};

// Calculate app positions near their respective folders
export const getAppPositionsNearFolders = (screenWidth: number, screenHeight: number) => {
  const folderPositions = getFolderPositions(screenWidth, screenHeight);
  
  return {
    projects: {
      // Position to the right of the projects folder
      x: Math.min(screenWidth - 400, folderPositions.projects.x + 100),
      y: Math.max(64, folderPositions.projects.y - 50)
    },
    gallery: {
      // Position above the gallery folder
      x: Math.max(64, folderPositions.gallery.x - 50),
      y: Math.max(64, folderPositions.gallery.y - 320)
    },
    resume: {
      // Position to the left of the resume folder
      x: Math.max(64, folderPositions.resume.x - 320),
      y: Math.max(64, folderPositions.resume.y - 50)
    }
  };
};

// Calculate screen-relative positions for the retro device
export const calculateScreenPositions = () => {
  const retroScreen = document.querySelector('.retro-screen-area') as HTMLElement;
  
  if (!retroScreen) {
    // Fallback positions if screen not found
    return {
      folderPositions: getFolderPositions(800, 500),
      appPositions: getAppPositionsNearFolders(800, 500)
    };
  }
  
  const screenRect = retroScreen.getBoundingClientRect();
  const screenWidth = screenRect.width;
  const screenHeight = screenRect.height;
  
  return {
    folderPositions: getFolderPositions(screenWidth, screenHeight),
    appPositions: getAppPositionsNearFolders(screenWidth, screenHeight)
  };
};