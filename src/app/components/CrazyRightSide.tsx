import { useState, useEffect, useRef } from 'react';

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 300;
    canvas.height = 400;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    function draw() {
      if (!ctx || !canvas) return;
      
      ctx.fillStyle = 'rgba(30, 30, 30, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? '#FFF' : '#0F0';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  
  return <canvas ref={canvasRef} className="opacity-60" />;
}

function FloatingShapes() {
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4,
    color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            backgroundColor: shape.color,
            animation: `float ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`
          }}
        />
      ))}
    </div>
  );
}

function DataReadouts() {
  const [data, setData] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    temp: 0,
    fps: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 1000),
        temp: Math.floor(Math.random() * 40 + 30),
        fps: Math.floor(Math.random() * 60 + 30)
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 font-mono text-xs text-green-400">
      <div className="flex justify-between">
        <span>CPU:</span>
        <span className={data.cpu > 80 ? 'text-red-400' : data.cpu > 50 ? 'text-yellow-400' : 'text-green-400'}>
          {data.cpu}%
        </span>
      </div>
      <div className="flex justify-between">
        <span>MEM:</span>
        <span className={data.memory > 80 ? 'text-red-400' : 'text-green-400'}>
          {data.memory}%
        </span>
      </div>
      <div className="flex justify-between">
        <span>NET:</span>
        <span className="text-cyan-400">{data.network} KB/s</span>
      </div>
      <div className="flex justify-between">
        <span>TEMP:</span>
        <span className={data.temp > 70 ? 'text-red-400' : 'text-green-400'}>
          {data.temp}°C
        </span>
      </div>
      <div className="flex justify-between">
        <span>FPS:</span>
        <span className="text-green-400">{data.fps}</span>
      </div>
    </div>
  );
}

function GlitchText() {
  const [glitchText, setGlitchText] = useState('SYSTEM ONLINE');
  const texts = ['SYSTEM ONLINE', 'NEURAL LINK', 'DATA STREAM', 'MATRIX MODE', 'QUANTUM FLUX', 'CYBER SPACE'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Random glitch effect
      if (Math.random() > 0.7) {
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        setGlitchText(randomText);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="text-green-400 font-mono text-sm tracking-wider animate-pulse">
        {glitchText}
      </div>
      <div 
        className="absolute inset-0 text-red-400 font-mono text-sm tracking-wider opacity-30 animate-pulse"
        style={{ transform: 'translate(2px, 0)' }}
      >
        {glitchText}
      </div>
      <div 
        className="absolute inset-0 text-blue-400 font-mono text-sm tracking-wider opacity-20 animate-pulse"
        style={{ transform: 'translate(-1px, 1px)' }}
      >
        {glitchText}
      </div>
    </div>
  );
}

function PulsatingIndicators() {
  return (
    <div className="flex flex-col space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full animate-pulse`}
            style={{
              backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i],
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
          <div className="w-16 h-1 bg-gray-700 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-transparent to-green-400 animate-pulse rounded"
              style={{
                width: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RandomBinaryStream() {
  const [binaryText, setBinaryText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const binary = Array.from({ length: 50 }, () => Math.random() > 0.5 ? '1' : '0').join('');
      setBinaryText(binary);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-green-500 font-mono text-[8px] leading-tight opacity-60 break-all">
      {binaryText}
    </div>
  );
}

export default function CrazyRightSide() {
  return (
    <div className="hidden lg:block absolute right-4 top-4 bottom-4 w-80 pointer-events-none">
      <div className="relative h-full bg-black/20 rounded-2xl border border-green-400/20 overflow-hidden backdrop-blur-sm">
        
        {/* Matrix Rain Background */}
        <div className="absolute top-0 left-0 z-0">
          <MatrixRain />
        </div>

        {/* Floating Shapes */}
        <FloatingShapes />

        {/* Content Sections */}
        <div className="relative z-10 p-4 h-full flex flex-col space-y-6">
          
          {/* Glitch Header */}
          <div className="border-b border-green-400/30 pb-2">
            <GlitchText />
          </div>

          {/* Data Readouts */}
          <div className="bg-black/40 rounded-lg p-3 border border-green-400/20">
            <div className="text-green-400 font-mono text-xs mb-2 opacity-80">
              SYSTEM STATUS
            </div>
            <DataReadouts />
          </div>

          {/* Pulsating Indicators */}
          <div className="bg-black/40 rounded-lg p-3 border border-cyan-400/20">
            <div className="text-cyan-400 font-mono text-xs mb-2 opacity-80">
              NEURAL ACTIVITY
            </div>
            <PulsatingIndicators />
          </div>

          {/* Binary Stream */}
          <div className="bg-black/40 rounded-lg p-3 border border-green-400/20 flex-1">
            <div className="text-green-400 font-mono text-xs mb-2 opacity-80">
              DATA STREAM
            </div>
            <div className="h-full overflow-hidden">
              {Array.from({ length: 15 }).map((_, i) => (
                <RandomBinaryStream key={i} />
              ))}
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="border-t border-green-400/30 pt-2">
            <div className="flex justify-between items-center">
              <div className="text-green-400 font-mono text-[10px]">
                UPTIME: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 bg-green-400 rounded-full animate-ping"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}