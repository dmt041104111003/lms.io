import React from 'react';
import { ChapterRequest } from '@/services/instructorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ChapterItem from './ChapterItem';

interface CourseContentSectionProps {
  chapters: ChapterRequest[];
  onChaptersChange: (chapters: ChapterRequest[]) => void;
}

const CourseContentSection: React.FC<CourseContentSectionProps> = ({ chapters, onChaptersChange }) => {
  const handleChapterChange = (chapterIndex: number, updatedChapter: ChapterRequest) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex] = updatedChapter;
    onChaptersChange(newChapters);
  };

  const handleAddChapter = () => {
    const newChapters = [...chapters];
    newChapters.push({
      title: '',
      orderIndex: newChapters.length + 1,
      lectures: [],
      tests: [],
    });
    onChaptersChange(newChapters);
  };

  const handleRemoveChapter = (chapterIndex: number) => {
    const newChapters = chapters.filter((_, i) => i !== chapterIndex);
    onChaptersChange(newChapters);
  };

  return (
    <Card className="p-4 sm:p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddChapter}
        >
          Add Chapter
        </Button>
      </div>

      {chapters.length > 0 ? (
        <div className="space-y-4">
          {chapters.map((chapter, chapterIndex) => (
            <ChapterItem
              key={chapterIndex}
              chapter={chapter}
              chapterIndex={chapterIndex}
              onChange={(updatedChapter) => handleChapterChange(chapterIndex, updatedChapter)}
              onRemove={() => handleRemoveChapter(chapterIndex)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No chapters added yet. Click "Add Chapter" to start building your course content.
        </p>
      )}
    </Card>
  );
};

export default CourseContentSection;

