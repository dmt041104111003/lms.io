import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

interface ChapterSummary {
  id: number;
  title: string;
  orderIndex: number;
  lectures?: LectureSummary[];
  tests?: TestSummary[];
}

interface LectureSummary {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  previewFree?: boolean;
}

interface TestSummary {
  id: number;
  title: string;
  durationMinutes?: number;
  passScore?: number;
  orderIndex: number;
}

interface CourseSidebarProps {
  chapters?: ChapterSummary[];
  courseTests?: TestSummary[];
  selectedLecture: LectureSummary | null;
  selectedTest: TestSummary | null;
  onLectureClick: (lecture: LectureSummary) => void;
  onTestClick: (test: TestSummary) => void;
  onClose: () => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  chapters,
  courseTests,
  selectedLecture,
  selectedTest,
  onLectureClick,
  onTestClick,
  onClose,
}) => {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Course Content</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chapters */}
      {chapters && chapters.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {chapters
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((chapter) => (
              <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-gray-200">
                  <Tooltip content={`Chapter ${chapter.orderIndex + 1}: ${chapter.title}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      Ch {chapter.orderIndex + 1}: {chapter.title}
                    </h3>
                  </Tooltip>
                </div>

                <div className="divide-y divide-gray-100">
                  {/* Lectures */}
                  {chapter.lectures &&
                    chapter.lectures
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((lecture) => {
                        const tooltipContent = lecture.description 
                          ? `${lecture.title}${lecture.duration ? ` - ${lecture.duration} min` : ''}\n${lecture.description}`
                          : `${lecture.title}${lecture.duration ? ` - ${lecture.duration} min` : ''}`;
                        return (
                          <Tooltip key={lecture.id} content={tooltipContent} className="w-full">
                            <button
                              onClick={() => onLectureClick(lecture)}
                              className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-gray-50 transition-colors ${
                                selectedLecture?.id === lecture.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {lecture.orderIndex + 1}. {lecture.title}
                                  </div>
                                  {lecture.duration && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {lecture.duration} min
                                    </div>
                                  )}
                                </div>
                                {lecture.previewFree && (
                                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex-shrink-0">
                                    Free
                                  </span>
                                )}
                              </div>
                            </button>
                          </Tooltip>
                        );
                      })}

                  {/* Tests */}
                  {chapter.tests &&
                    chapter.tests
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((test) => {
                        const tooltipContent = `Test: ${test.title}${test.durationMinutes ? ` - ${test.durationMinutes} min` : ''}${test.passScore ? ` - Pass: ${test.passScore}%` : ''}`;
                        return (
                          <Tooltip key={test.id} content={tooltipContent} className="w-full">
                            <button
                              onClick={() => onTestClick(test)}
                              className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-50 border-l-4 transition-colors hover:bg-blue-100 ${
                                selectedTest?.id === test.id ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                              }`}
                            >
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                Test: {test.title}
                              </div>
                              <div className="flex gap-3 mt-1">
                                {test.durationMinutes && (
                                  <div className="text-xs text-gray-600">
                                    {test.durationMinutes} min
                                  </div>
                                )}
                                {test.passScore && (
                                  <div className="text-xs text-gray-600">
                                    Pass: {test.passScore}%
                                  </div>
                                )}
                              </div>
                            </button>
                          </Tooltip>
                        );
                      })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-xs sm:text-sm text-gray-500">No content available</div>
      )}

      {/* Course Tests (not in chapters) */}
      {courseTests && courseTests.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Course Tests</h3>
          <div className="space-y-2">
            {courseTests
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .map((test) => {
                const tooltipContent = `${test.title}${test.durationMinutes ? ` - ${test.durationMinutes} min` : ''}${test.passScore ? ` - Pass: ${test.passScore}%` : ''}`;
                return (
                  <Tooltip key={test.id} content={tooltipContent} className="w-full">
                    <button
                      onClick={() => onTestClick(test)}
                      className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-50 border-l-4 rounded transition-colors hover:bg-blue-100 ${
                        selectedTest?.id === test.id ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{test.title}</div>
                      <div className="flex gap-3 mt-1">
                        {test.durationMinutes && (
                          <div className="text-xs text-gray-600">
                            {test.durationMinutes} min
                          </div>
                        )}
                        {test.passScore && (
                          <div className="text-xs text-gray-600">
                            Pass: {test.passScore}%
                          </div>
                        )}
                      </div>
                    </button>
                  </Tooltip>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSidebar;

