import { Activity, BookOpen, FileQuestion } from 'lucide-react';

interface Progress {
  type: string;
  progressId: number;
  completedAt: string;
}

interface ActivityCardProps {
  progress: Progress;
}

export default function ActivityCard({ progress }: ActivityCardProps) {
  // Tính điểm: lecture +1, test +2
  const score = progress.type === 'lecture' ? 1 : 2;
  
  const getIcon = () => {
    if (progress.type === 'lecture') {
      return <BookOpen className="w-4 h-4 text-green-500" />;
    }
    return <FileQuestion className="w-4 h-4 text-purple-500" />;
  };

  const getTypeColor = () => {
    return progress.type === 'lecture' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <div className="font-medium text-gray-800 capitalize">
              {progress.type}
            </div>
            <div className="text-sm text-gray-500">
              ID: {progress.progressId}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {score} pt
          </div>
          <div className="text-xs text-gray-500">
            {progress.completedAt && new Date(progress.completedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs">
        <span className={`px-2 py-1 rounded ${getTypeColor()}`}>
          {progress.type}: {score}pt
        </span>
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-500">
          Completed: {progress.completedAt ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
}
