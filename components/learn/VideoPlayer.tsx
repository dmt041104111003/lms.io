import React from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  fallbackTitle?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, fallbackTitle }) => {
  const isYouTubeUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video shadow-xl">
      {videoUrl ? (
        isYouTubeUrl(videoUrl) ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            className="w-full h-full"
            title={`Video: ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            autoPlay
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

