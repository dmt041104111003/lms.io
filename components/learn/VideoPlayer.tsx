import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  fallbackTitle?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, fallbackTitle, onPlay, onPause, onEnded }) => {
  const isYouTubeUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || null;
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || null;
    }
    return null;
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const onPlayRef = useRef<undefined | (() => void)>(onPlay);
  const onPauseRef = useRef<undefined | (() => void)>(onPause);
  const onEndedRef = useRef<undefined | (() => void)>(onEnded);

  // Keep refs in sync without causing player re-creation
  useEffect(() => { onPlayRef.current = onPlay; }, [onPlay]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  useEffect(() => {
    if (!videoUrl || !isYouTubeUrl(videoUrl)) return;
    const id = getYouTubeVideoId(videoUrl);
    if (!id) return;

    let player: any;
    const w = window as any;

    const initPlayer = () => {
      if (!ytContainerRef.current) return;
      player = new w.YT.Player(ytContainerRef.current, {
        width: '100%',
        height: '100%',
        videoId: id,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onStateChange: (e: any) => {
            const state = e?.data;
            if (state === 1) {
              onPlayRef.current && onPlayRef.current();
            } else if (state === 2) {
              onPauseRef.current && onPauseRef.current();
            } else if (state === 0) {
              onEndedRef.current && onEndedRef.current();
            }
          },
        },
      });
    };

    if (!w.YT || !w.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      w.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      try { player && player.destroy && player.destroy(); } catch {}
    };
  }, [videoUrl]);

  return (
    <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video shadow-xl">
      {videoUrl ? (
        isYouTubeUrl(videoUrl) ? (
          <div ref={ytContainerRef} className="w-full h-full" />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
            autoPlay
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400">No video available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

