import { getImageUrl } from './utils/imageUtils';

declare global {
  interface Navigator {
    mediaSession?: MediaSession;
  }
}

class MediaSessionManager {
  updateSessionMetadata(artworkURL: string) {
    if (!navigator.mediaSession) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      artwork: [
        { src: getImageUrl(artworkURL, 96), sizes: '96x96', type: 'image/jpg' },
        { src: getImageUrl(artworkURL, 128), sizes: '128x128', type: 'image/jpg' },
        { src: getImageUrl(artworkURL, 192), sizes: '192x192', type: 'image/jpg' },
        { src: getImageUrl(artworkURL, 256), sizes: '256x256', type: 'image/jpg' },
        { src: getImageUrl(artworkURL, 384), sizes: '384x384', type: 'image/jpg' },
        { src: getImageUrl(artworkURL, 512), sizes: '512x512', type: 'image/jpg' }
      ]
    });
  }
  
  setNextHandler(handler: () => void) {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.setActionHandler('nexttrack', handler);
  }
  
  setPrevHandler(handler: () => void) {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.setActionHandler('previoustrack', handler);
  }
}

export const mediaSessionManager = new MediaSessionManager();
