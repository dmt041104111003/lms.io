import React, { useEffect, useState } from 'react';
import { LectureRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import VideoPreview from './VideoPreview';
import {ChevronDown, ChevronUp,Trash, Trash2} from 'lucide-react';
interface LectureItemProps {
  lecture: LectureRequest;
  lectureIndex: number;
  onChange: (lecture: LectureRequest) => void;
  onRemove: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const LectureItem: React.FC<LectureItemProps> = ({ lecture, lectureIndex, onChange, onRemove, collapsed: collapsedProp, onToggle }) => {
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [selfCollapsed, setSelfCollapsed] = useState(true);
  const collapsed = (collapsedProp ?? selfCollapsed);

  const formatHMS = (totalSeconds?: number) => {
    if (!totalSeconds || totalSeconds <= 0) return '';
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  };

  useEffect(() => {
    const url = lecture.videoUrl?.trim();
    if (!url) return;
    const ytMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      setDetecting(true);
      setDetectError(null);
      const ensureYT = () => new Promise<void>((resolve) => {
        if ((window as any).YT?.Player) return resolve();
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (typeof prev === 'function') prev();
          resolve();
        };
      });
      ensureYT().then(() => {
        const vid = ytMatch[1];
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        const YT = (window as any).YT;
        const player = new YT.Player(container, {
          videoId: vid,
          playerVars: { autoplay: 0, controls: 0 },
          events: {
            onReady: () => {
              const secs = Math.floor(player.getDuration?.() || 0);
              if (secs > 0) onChange({ ...lecture, duration: secs });
              try { player.destroy?.(); } catch {}
              container.remove();
              setDetecting(false);
            },
            onError: () => {
              try { player.destroy?.(); } catch {}
              container.remove();
              setDetectError('Unable to detect duration');
              setDetecting(false);
            }
          }
        });
      }).catch(() => {
        setDetectError('Unable to detect duration');
        setDetecting(false);
      });
      return;
    }
    setDetecting(true);
    setDetectError(null);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.crossOrigin = 'anonymous';
    const onLoaded = () => {
      const secs = Math.round(video.duration || 0);
      if (secs > 0) onChange({ ...lecture, duration: secs });
      setDetecting(false);
      cleanup();
    };
    const onError = () => {
      setDetectError('Unable to detect duration');
      setDetecting(false);
      cleanup();
    };
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
      video.src = '';
    };
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);
    return () => cleanup();
  }, [lecture.videoUrl]);

  return (
    <div className="p-3 bg-gray-50 rounded">
      <div className="flex items-center  gap-2">
        <button
          type="button"
          onClick={() => (onToggle ? onToggle() : setSelfCollapsed((c) => !c))}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm"
          aria-label="Toggle lecture"
          title="Toggle"
        >
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
        <input
          type="text"
          value={lecture.title || ''}
          onChange={(e) => {
            onChange({ ...lecture, title: e.target.value });
          }}
          placeholder="Lecture Title"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* <Trash2 className="w-6 h-6 text-red-600 cursor-pointer"  onClick={onRemove} /> */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600"
        >
          Remove
        </Button>
      </div>
      {!collapsed && (
        <>
      <div className="flex pt-3 flex-col sm:flex-row items-center gap-2">
        <input
          type="url"
          value={lecture.videoUrl || ''}
          onChange={(e) => {
            onChange({ ...lecture, videoUrl: e.target.value });
          }}
          placeholder="Video URL"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center  gap-1">
          <input
            type="number"
            min={0}
            className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={Math.floor((lecture.duration || 0) / 3600)}
            onChange={(e) => {
              const hours = Math.max(0, parseInt(e.target.value || '0'));
              const total = lecture.duration || 0;
              const minutes = Math.floor((total % 3600) / 60);
              const seconds = total % 60;
              onChange({ ...lecture, duration: hours * 3600 + minutes * 60 + seconds });
            }}
          />
          <span className="text-xs">h</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={59}
            className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={Math.floor(((lecture.duration || 0) % 3600) / 60)}
            onChange={(e) => {
              const minutes = Math.min(59, Math.max(0, parseInt(e.target.value || '0')));
              const total = lecture.duration || 0;
              const hours = Math.floor(total / 3600);
              const seconds = total % 60;
              onChange({ ...lecture, duration: hours * 3600 + minutes * 60 + seconds });
            }}
          />
          <span className="text-xs">m</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={59}
            className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={(lecture.duration || 0) % 60}
            onChange={(e) => {
              const seconds = Math.min(59, Math.max(0, parseInt(e.target.value || '0')));
              const total = lecture.duration || 0;
              const hours = Math.floor(total / 3600);
              const minutes = Math.floor((total % 3600) / 60);
              onChange({ ...lecture, duration: hours * 3600 + minutes * 60 + seconds });
            }}
          />
          <span className="text-xs">s</span>
        </div>
        
      </div>
      <textarea
        value={lecture.description || ''}
        onChange={(e) => {
          onChange({ ...lecture, description: e.target.value });
        }}
        placeholder="Lecture Description (optional)"
        rows={2}
        className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <span className="text-sm">Preview free</span>
        <input
          type="checkbox"
          checked={!!lecture.previewFree}
          onChange={(e) => onChange({ ...lecture, previewFree: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        
      </div>
      {/* <div className="mt-1 text-xs text-gray-500">
        {detecting
          ? 'Detecting duration...'
          : lecture.duration
            ? `Duration: ${formatHMS(lecture.duration)} (seconds: ${lecture.duration})`
            : detectError || ''}
      </div> */}
      
      {lecture.videoUrl && (
        <div className="mt-2">
          <VideoPreview videoUrl={lecture.videoUrl} />
        </div>
      )}
        </>
      )}
      
    </div>
  );
};

export default LectureItem;

