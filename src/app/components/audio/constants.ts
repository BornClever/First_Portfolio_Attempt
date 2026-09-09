import { MusicTrack, SpotifyTrack } from './types';

// High-quality audio tracks
export const AUDIO_TRACKS: SpotifyTrack[] = [
  {
    name: "Web Song",
    url: "https://res.cloudinary.com/dmgndgjeg/video/upload/v1757004122/web_song_olu4di.mp3",
    artist: "Artist",
    album: "Single",
    type: 'audio'
  },
  {
    name: "Forest Walk - Peaceful Ambient",
    url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    artist: "Nature Sounds",
    album: "Peaceful Moments",
    type: 'audio'
  },
  {
    name: "Digital Atmosphere - Electronic", 
    url: "https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/start.ogg",
    artist: "Cyber Dreams",
    album: "Future Soundscapes",
    type: 'audio'
  },
  {
    name: "Retro Vibes - Synthwave",
    url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Erase_this_please.ogg",
    artist: "Neon Nights",
    album: "80s Revival",
    type: 'audio'
  }
];

// Main music playlist
export const MUSIC_TRACKS: MusicTrack[] = [
  ...AUDIO_TRACKS
];