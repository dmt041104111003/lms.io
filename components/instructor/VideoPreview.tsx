import React from 'react';
import { extractYouTubeVideoId, isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/lib/youtubeUtils';

interface VideoPreviewProps {
  videoUrl: string;
  onThumbnailSelect?: (thumbnailUrl: string) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onThumbnailSelect }) => {
  if (!videoUrl || !isYouTubeUrl(videoUrl)) {
    return null;
  }

  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, 'maxres');

  React.useEffect(() => {
    if (onThumbnailSelect && thumbnailUrl) {
      onThumbnailSelect(thumbnailUrl);
    }
  }, [videoId, onThumbnailSelect, thumbnailUrl]);

  return (
    <div className="mt-3">
      {/* Video Embed Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Video Preview
        </label>
        <div className="relative w-full max-w-md aspect-video">
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-md"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video preview"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;

