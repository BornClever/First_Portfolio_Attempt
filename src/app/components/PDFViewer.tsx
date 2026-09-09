import { useState } from 'react';
import { ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const handlePDFLoad = () => {
    setIsLoading(false);
    setShowFallback(false);
  };

  const handlePDFError = () => {
    console.error('Failed to load PDF from:', pdfUrl);
    setIsLoading(false);
    setShowFallback(true);
  };

  // Use Mozilla's PDF.js viewer for better compatibility
  const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

  return (
    <div className="flex flex-col h-full bg-gray-50 pdf-viewer-container">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-150"
            title="Zoom Out"
            disabled={showFallback}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-150"
            title="Zoom In"
            disabled={showFallback}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-150"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-100 p-4">
        <div className="flex justify-center h-full">
          <div 
            className="bg-white shadow-lg rounded-sm relative h-full w-full max-w-[600px]"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-full w-full bg-white rounded-sm absolute inset-0 z-10">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading Resume PDF...</span>
                </div>
              </div>
            )}
            
            {/* PDF Display - Try multiple approaches */}
            {!showFallback && (
              <>
                {/* Primary: PDF.js Viewer */}
                <iframe
                  src={pdfViewerUrl}
                  className={`w-full h-full border-0 rounded-sm pointer-events-auto ${isLoading ? 'hidden' : 'block'}`}
                  style={{ 
                    minHeight: '600px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  title="Resume PDF Viewer"
                  onLoad={handlePDFLoad}
                  onError={handlePDFError}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onDrag={(e) => e.preventDefault()}
                  onDragEnd={(e) => e.preventDefault()}
                />
                
                {/* Fallback: Object tag */}
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full hidden pointer-events-auto"
                  style={{ 
                    minHeight: '600px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  onLoad={handlePDFLoad}
                  onError={handlePDFError}
                  draggable={false}
                >
                  <embed
                    src={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full pointer-events-auto"
                    style={{ 
                      minHeight: '600px',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    draggable={false}
                  />
                </object>
              </>
            )}
            
            {/* Show fallback if loading fails */}
            {showFallback && (
              <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-sm border border-gray-200">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Resume PDF</h3>
                  <p className="text-sm text-gray-600 mb-6">Unable to display PDF inline. Click below to view:</p>
                  
                  {/* PDF Preview Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                    <div className="text-sm text-gray-700 font-medium mb-1">Shubham's Resume</div>
                    <div className="text-xs text-gray-500">PDF Document</div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Open Resume</span>
                    </button>
                    
                    {/* Try alternative viewer */}
                    <button
                      onClick={() => {
                        const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
                        window.open(googleViewer, '_blank');
                      }}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                      <span>View in Google Docs</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}