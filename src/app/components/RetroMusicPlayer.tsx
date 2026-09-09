import { useState, useEffect, useRef } from 'react';
import { MusicTrack } from './audio/types';
import { MUSIC_TRACKS } from './audio/constants';

export default function RetroMusicPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isVinylSpinning, setIsVinylSpinning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true); // Always start requiring user interaction
  const [hasUserStartedPlayback, setHasUserStartedPlayback] = useState(false); // Track if user has ever started playback
  const [soundCloudReady, setSoundCloudReady] = useState(false); // Add missing SoundCloud state
  const [isScrubbing, setIsScrubbing] = useState(false); // Track if user is scrubbing
  const [scrubbingTime, setScrubbingTime] = useState(0); // Time during scrubbing

  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null); // Reference to progress bar

  // Load SoundCloud Widget API
  useEffect(() => {
    const loadSoundCloudAPI = () => {
      if (window.SC) {
        setSoundCloudReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => {
        setSoundCloudReady(true);
      };
      script.onerror = () => {
        console.log('SoundCloud API failed to load');
        setSoundCloudReady(false);
      };
      document.head.appendChild(script);
    };

    loadSoundCloudAPI();
  }, []);

  // Initialize tracks but don't auto-start playback
  useEffect(() => {
    const initializePlayer = async () => {
      setIsLoadingTracks(true);
      try {
        setTracks(MUSIC_TRACKS);
        setIsLoadingTracks(false);
        // Don't auto-start playback - wait for user interaction
        setNeedsUserInteraction(true);
      } catch (error) {
        console.error('Error initializing music player:', error);
        setIsLoadingTracks(false);
        setNeedsUserInteraction(true);
      }
    };

    initializePlayer();
  }, []);

  // Load track when tracks are available or track changes, but don't auto-play
  useEffect(() => {
    if (tracks.length > 0 && !isLoadingTracks) {
      loadTrack(currentTrack, false); // Pass false to prevent auto-play
    }
  }, [tracks, currentTrack, isLoadingTracks]);

  // Update vinyl animation based on play state
  useEffect(() => {
    setIsVinylSpinning(isPlaying);
  }, [isPlaying]);

  const loadTrack = async (trackIndex: number, shouldAutoPlay: boolean = false) => {
    const track = tracks[trackIndex];
    if (!track) return;

    try {
      if (track.type === 'soundcloud') {
        await loadSoundCloudTrack(track.soundcloudUrl!, shouldAutoPlay);
      } else {
        await loadDirectTrack(track.url, shouldAutoPlay); // Changed from track.audioUrl to track.url
      }
      
      setCurrentTrack(trackIndex);
      setIsLoaded(true);
      
      // Only auto-play if user has previously started playback and shouldAutoPlay is true
      if (shouldAutoPlay && hasUserStartedPlayback) {
        setIsPlaying(true);
        setNeedsUserInteraction(false);
      }
    } catch (error) {
      console.error('Error loading track:', error);
      setIsLoaded(false);
    }
  };

  const loadDirectTrack = async (audioUrl: string, shouldAutoPlay: boolean = false) => {
    if (audioRef.current && audioUrl) {
      try {
        // Clear any previous source
        audioRef.current.src = '';
        
        // Set new source
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        
        // Load the audio
        await new Promise((resolve, reject) => {
          const audio = audioRef.current!;
          
          const handleLoadedData = () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('error', handleError);
            resolve(true);
          };
          
          const handleError = (e: Event) => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('error', handleError);
            console.error('Audio loading error:', e);
            reject(new Error('Failed to load audio'));
          };
          
          audio.addEventListener('loadeddata', handleLoadedData);
          audio.addEventListener('error', handleError);
          
          audio.load();
        });
        
        if (shouldAutoPlay && hasUserStartedPlayback) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Error loading direct audio track:', error);
        setIsLoaded(false);
        setNeedsUserInteraction(true);
      }
    }
  };

  const loadSoundCloudTrack = async (soundcloudUrl: string, shouldAutoPlay: boolean = false) => {
    if (iframeRef.current) {
      const autoPlayParam = (shouldAutoPlay && hasUserStartedPlayback) ? 'true' : 'false';
      const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%2351ff38&auto_play=${autoPlayParam}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&callback=?`;
      iframeRef.current.src = src;
    }
  };

  const togglePlay = async () => {
    if (isLoadingTracks) return;

    // Mark that user has started playback for the first time
    if (!hasUserStartedPlayback) {
      setHasUserStartedPlayback(true);
    }

    if (needsUserInteraction) {
      setNeedsUserInteraction(false);
    }

    if (isLoaded) {
      if (isPlaying) {
        pauseCurrentTrack();
      } else {
        await playCurrentTrack();
      }
    } else {
      // Load and play the current track
      await loadTrack(currentTrack, true);
    }
  };

  const playCurrentTrack = async () => {
    const track = tracks[currentTrack];
    if (!track) return;

    try {
      if (track.type === 'soundcloud') {
        // For SoundCloud, we need to reload with auto_play=true
        await loadSoundCloudTrack(track.soundcloudUrl!, true);
      } else if (audioRef.current) {
        await audioRef.current.play();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      setNeedsUserInteraction(true);
    }
  };

  const pauseCurrentTrack = () => {
    const track = tracks[currentTrack];
    if (!track) return;

    if (track.type === 'soundcloud') {
      // For SoundCloud, reload with auto_play=false
      loadSoundCloudTrack(track.soundcloudUrl!, false);
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * tracks.length)
      : (currentTrack + 1) % tracks.length;
    
    // Auto-play next track only if user has started playback before
    const shouldAutoPlay = hasUserStartedPlayback && isPlaying;
    loadTrack(nextIndex, shouldAutoPlay);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    
    const prevIndex = isShuffled 
      ? Math.floor(Math.random() * tracks.length)
      : currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    
    // Auto-play previous track only if user has started playback before
    const shouldAutoPlay = hasUserStartedPlayback && isPlaying;
    loadTrack(prevIndex, shouldAutoPlay);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  // Music scrubbing/seeking functions
  const seekToTime = (time: number) => {
    const track = tracks[currentTrack];
    if (!track || !duration) return;

    // Clamp time within bounds
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    if (track.type === 'soundcloud') {
      // For SoundCloud tracks, we can't directly seek, but we can update the display
      setCurrentTime(clampedTime);
      // Note: SoundCloud seeking would require more complex integration with their widget API
    } else if (audioRef.current) {
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current || !duration) return 0;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    
    return percentage * duration;
  };

  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (!isLoaded || !duration) return;
    
    const newTime = getTimeFromPosition(e.clientX);
    seekToTime(newTime);
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent) => {
    if (!isLoaded || !duration) return;
    
    setIsScrubbing(true);
    const newTime = getTimeFromPosition(e.clientX);
    setScrubbingTime(newTime);
    seekToTime(newTime);
    
    e.preventDefault();
  };

  const handleProgressBarMouseMove = (e: MouseEvent) => {
    if (!isScrubbing || !duration) return;
    
    const newTime = getTimeFromPosition(e.clientX);
    setScrubbingTime(newTime);
    seekToTime(newTime);
  };

  const handleProgressBarMouseUp = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
      setScrubbingTime(0);
    }
  };

  // Touch event handlers for mobile scrubbing
  const handleProgressBarTouchStart = (e: React.TouchEvent) => {
    if (!isLoaded || !duration || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setIsScrubbing(true);
    const newTime = getTimeFromPosition(touch.clientX);
    setScrubbingTime(newTime);
    seekToTime(newTime);
    
    e.preventDefault();
  };

  const handleProgressBarTouchMove = (e: TouchEvent) => {
    if (!isScrubbing || !duration || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const newTime = getTimeFromPosition(touch.clientX);
    setScrubbingTime(newTime);
    seekToTime(newTime);
    
    e.preventDefault();
  };

  const handleProgressBarTouchEnd = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
      setScrubbingTime(0);
    }
  };

  // Global mouse/touch event listeners for scrubbing
  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => handleProgressBarMouseMove(e);
    const handleMouseUp = () => handleProgressBarMouseUp();
    const handleTouchMove = (e: TouchEvent) => handleProgressBarTouchMove(e);
    const handleTouchEnd = () => handleProgressBarTouchEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScrubbing, duration]);

  // Handle audio events for direct tracks
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-advance to next track only if user has started playback
      if (hasUserStartedPlayback) {
        nextTrack();
      }
    };
    const handleVolumeChange = () => setVolume(audio.volume);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [hasUserStartedPlayback]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Calculate progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get current track data
  const currentTrackData = tracks[currentTrack];
  const isSoundCloudTrack = currentTrackData?.type === 'soundcloud';

  return (
    <div className="w-full max-w-xs mx-auto bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-600/50 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="font-['Silkscreen:Regular',_Courier,_monospace] text-green-400 text-xs tracking-wider">
          RETRO AUDIO PLAYER v3.1
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent mt-1"></div>
      </div>

      {/* Vinyl Disk Section */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="relative">
          <div 
            className={`w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 border-2 border-gray-700 flex items-center justify-center relative overflow-hidden ${
              isVinylSpinning ? 'animate-spin' : ''
            }`}
            style={{
              animationDuration: '3s',
              animationTimingFunction: 'linear'
            }}
          >
            <div className="absolute inset-2 rounded-full border border-gray-600 opacity-30"></div>
            <div className="absolute inset-4 rounded-full border border-gray-600 opacity-20"></div>
            <div className="absolute inset-6 rounded-full border border-gray-600 opacity-15"></div>
            <div className="absolute inset-8 rounded-full border border-gray-600 opacity-10"></div>
            
            <div className="w-6 h-6 rounded-full bg-red-600 border border-red-500 flex items-center justify-center relative z-10">
              <div className="w-1 h-1 rounded-full bg-black"></div>
            </div>
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
          </div>
        </div>

        <div className="absolute right-2 top-1">
          <div 
            className={`w-16 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full origin-left transform transition-transform duration-500 ease-in-out ${
              isVinylSpinning ? 'rotate-[110deg]' : 'rotate-[5deg]'
            }`}
          >
            <div className="absolute right-1 top-0 w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300 -translate-y-0.5 shadow-sm"></div>
          </div>
          <div className="absolute -left-1 -top-0.5 w-4 h-3 bg-gray-600 rounded-sm border border-gray-500 shadow-md"></div>
          <div className="absolute -left-0.5 top-1.5 w-2 h-4 bg-gray-700 rounded-sm border border-gray-600"></div>
        </div>
      </div>

      {/* Track Display */}
      <div className="bg-black rounded-lg p-3 mb-4 border border-green-400/30">
        <div className="font-['Courier_New',_monospace] text-green-400 text-xs text-center tracking-wider">
          {isLoadingTracks ? 'LOADING TRACKS...' : needsUserInteraction ? 'PRESS PLAY TO START:' : 'NOW PLAYING:'}
        </div>
        {isLoadingTracks ? (
          <div className="font-['Courier_New',_monospace] text-green-300 text-sm text-center mt-1">
            <div className="animate-pulse">Loading Audio...</div>
          </div>
        ) : needsUserInteraction ? (
          <div className="font-['Courier_New',_monospace] text-yellow-300 text-sm text-center mt-1">
            <div className="animate-pulse">Click ▶ to start music</div>
          </div>
        ) : tracks.length > 0 && currentTrackData ? (
          <>
            <div className="font-['Courier_New',_monospace] text-green-300 text-sm text-center mt-1 truncate">
              {currentTrackData.name}
            </div>
            {currentTrackData.artist && (
              <div className="font-['Courier_New',_monospace] text-green-400/70 text-xs text-center mt-1">
                Artist: {currentTrackData.artist}
              </div>
            )}
            <div className="font-['Courier_New',_monospace] text-cyan-400 text-xs text-center mt-1">
              {isSoundCloudTrack ? '♪ SoundCloud Stream' : '♪ High Quality Audio'}
            </div>
          </>
        ) : (
          <div className="font-['Courier_New',_monospace] text-red-400 text-sm text-center mt-1">
            No tracks available
          </div>
        )}
        
        <div className="w-full h-1 bg-gray-700 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={toggleShuffle}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
            isShuffled 
              ? 'bg-green-600 border-green-400 hover:bg-green-500' 
              : 'bg-gray-700 border-gray-500 hover:bg-gray-600'
          }`}
          title={isShuffled ? 'Shuffle ON' : 'Shuffle OFF'}
        >
          <div className={`text-xs font-bold ${isShuffled ? 'text-white' : 'text-green-400'}`}>🔀</div>
        </button>

        <button
          onClick={prevTrack}
          className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-500 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-green-400/20"
        >
          <div className="text-green-400 font-bold text-sm">‹‹</div>
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoadingTracks}
          className={`w-10 h-10 rounded-full border border-green-400 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-green-400/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            needsUserInteraction && !isPlaying 
              ? 'bg-yellow-600 hover:bg-yellow-500 animate-pulse' 
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          <div className="text-white font-bold text-lg">
            {isPlaying ? '⏸' : '▶'}
          </div>
        </button>

        <button
          onClick={nextTrack}
          className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-500 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-green-400/20"
        >
          <div className="text-green-400 font-bold text-sm">››</div>
        </button>
      </div>

      {/* Track Info */}
      {!isLoadingTracks && tracks.length > 0 && currentTrackData && (
        <div className="text-center mt-2">
          <div className="font-['Courier_New',_monospace] text-green-400/60 text-xs">
            Track {currentTrack + 1} of {tracks.length}
          </div>
          <div className="font-['Courier_New',_monospace] text-green-400/60 text-xs mt-1">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </div>
          {currentTrackData.soundcloudUrl && (
            <a 
              href={currentTrackData.soundcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-['Courier_New',_monospace] text-cyan-400 text-xs hover:text-cyan-300 transition-colors duration-200"
            >
              ↗ Open in SoundCloud
            </a>
          )}
        </div>
      )}

      {/* Status Lights */}
      <div className="flex justify-center space-x-2 mt-3">
        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '1s' }}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${needsUserInteraction ? 'bg-yellow-400 animate-pulse' : isLoaded ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Bottom Grid Pattern */}
      <div className="mt-3 flex justify-center">
        <div className="w-full h-3 bg-gray-800 rounded grid grid-cols-20 gap-px p-1 border border-gray-600">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`bg-gray-700 rounded-sm ${
                isPlaying && i < (progress / 5) ? 'bg-green-400' : ''
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="mt-2 flex items-center justify-center space-x-2">
        <div className="text-green-400 font-mono text-xs">VOL:</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
          }}
          className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="text-green-400 font-mono text-xs w-8 text-right">
          {Math.round(volume * 100)}%
        </div>
      </div>

      {/* Hidden SoundCloud Widget */}
      <iframe
        ref={iframeRef}
        width="100%"
        height="0"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/shubham-sharma-389137437&color=%2351ff38&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&callback=?`}
        style={{ display: 'none' }}
      />

      {/* Hidden Audio Element for real audio tracks */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
        style={{ display: 'none' }}
      />
    </div>
  );
}