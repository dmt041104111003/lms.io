import React, { useState } from 'react';
import { ChapterRequest, LectureRequest, TestRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import LectureItem from './LectureItem';
import TestItem from './TestItem';

interface ChapterItemProps {
  chapter: ChapterRequest;
  chapterIndex: number;
  onChange: (chapter: ChapterRequest) => void;
  onRemove: () => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, chapterIndex, onChange, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLectureChange = (lectureIndex: number, updatedLecture: LectureRequest) => {
    const lectures = [...(chapter.lectures || [])];
    lectures[lectureIndex] = updatedLecture;
    onChange({ ...chapter, lectures });
  };

  const handleAddLecture = () => {
    const lectures = [...(chapter.lectures || [])];
    lectures.push({
      title: '',
      orderIndex: lectures.length + 1,
    });
    onChange({ ...chapter, lectures });
  };

  const handleRemoveLecture = (lectureIndex: number) => {
    const lectures = chapter.lectures?.filter((_, i) => i !== lectureIndex) || [];
    onChange({ ...chapter, lectures });
  };

  const handleTestChange = (testIndex: number, updatedTest: TestRequest) => {
    const tests = [...(chapter.tests || [])];
    tests[testIndex] = updatedTest;
    onChange({ ...chapter, tests });
  };

  const handleAddTest = () => {
    const tests = [...(chapter.tests || [])];
    tests.push({
      title: '',
      orderIndex: tests.length + 1,
      questions: [],
    });
    onChange({ ...chapter, tests });
  };

  const handleRemoveTest = (testIndex: number) => {
    const tests = chapter.tests?.filter((_, i) => i !== testIndex) || [];
    onChange({ ...chapter, tests });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => {
              onChange({ ...chapter, title: e.target.value });
            }}
            placeholder={`Chapter ${chapterIndex + 1} Title`}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 ml-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
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
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Lectures */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Lectures</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLecture}
              >
                Add Lecture
              </Button>
            </div>
            {chapter.lectures && chapter.lectures.map((lecture, lectureIndex) => (
              <LectureItem
                key={lectureIndex}
                lecture={lecture}
                lectureIndex={lectureIndex}
                onChange={(updatedLecture) => handleLectureChange(lectureIndex, updatedLecture)}
                onRemove={() => handleRemoveLecture(lectureIndex)}
              />
            ))}
          </div>

          {/* Tests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Chapter Tests</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTest}
              >
                Add Test
              </Button>
            </div>
            {chapter.tests && chapter.tests.length > 0 ? (
              <div className="space-y-3">
                {chapter.tests.map((test, testIndex) => (
                  <TestItem
                    key={testIndex}
                    test={test}
                    testIndex={testIndex}
                    onChange={(updatedTest) => handleTestChange(testIndex, updatedTest)}
                    onRemove={() => handleRemoveTest(testIndex)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-2">No tests added to this chapter yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterItem;

