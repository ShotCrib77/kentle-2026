interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: {
    Player: new (options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }) => SpotifyPlayer;
  };
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (state: any) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<any>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  togglePlay: () => Promise<void>;
}

interface SpotifyTrack {
  uri: string;
  name: string;
  album: {
      name: string;
      images: { url: string }[];
  };
  artists: { name: string }[];
}

interface SpotifyPlaylistItem {
  track: SpotifyTrack;
}