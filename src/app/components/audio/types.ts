export interface MusicTrack {
  name: string;
  url: string;
  soundcloudUrl?: string;
  spotifyUrl?: string;
  artist?: string;
  album?: string;
  image?: string;
  type: 'audio' | 'soundcloud';
}

export interface SpotifyTrack extends MusicTrack {
  type: 'audio';
}

export interface SoundCloudTrack extends MusicTrack {
  type: 'soundcloud';
  soundcloudUrl: string;
}