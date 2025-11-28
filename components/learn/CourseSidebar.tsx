import React from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { Check } from 'lucide-react';

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
  completedLectureIds?: number[];
  completedTestIds?: number[];
  courseId?: string;
  userId?: string;
  isCourseCompleted?: boolean;
  isCourseMarkedCompleted?: boolean;
  onRequestCertificate?: () => void;
  requestingCertificate?: boolean;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  chapters,
  courseTests,
  selectedLecture,
  selectedTest,
  onLectureClick,
  onTestClick,
  onClose,
  completedLectureIds,
  completedTestIds,
  courseId,
  userId,
  isCourseCompleted,
  isCourseMarkedCompleted,
  onRequestCertificate,
  requestingCertificate,
}) => {
  return (
    <div className="relative flex flex-col h-full p-3 sm:p-4">
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
                        const isCompleted = (completedLectureIds || []).includes(lecture.id);
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
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {isCompleted && (
                                    <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                                  )}
                                </div>
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
                        const isCompleted = (completedTestIds || []).includes(test.id);
                        const tooltipContent = `Test: ${test.title}${test.durationMinutes ? ` - ${test.durationMinutes} min` : ''}${test.passScore ? ` - Pass: ${test.passScore}%` : ''}`;
                        return (
                          <Tooltip key={test.id} content={tooltipContent} className="w-full">
                            <button
                              onClick={() => onTestClick(test)}
                              className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-50 border-l-4 transition-colors hover:bg-blue-100 ${
                                selectedTest?.id === test.id ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                  Test: {test.title}
                                </div>
                                {isCompleted && (
                                  <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                                )}
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
                const isCompleted = (completedTestIds || []).includes(test.id);
                const tooltipContent = `${test.title}${test.durationMinutes ? ` - ${test.durationMinutes} min` : ''}${test.passScore ? ` - Pass: ${test.passScore}%` : ''}`;
                return (
                  <Tooltip key={test.id} content={tooltipContent} className="w-full">
                    <button
                      onClick={() => onTestClick(test)}
                      className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-50 border-l-4 rounded transition-colors hover:bg-blue-100 ${
                        selectedTest?.id === test.id ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{test.title}</div>
                        {isCompleted && (
                          <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                        )}
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
      )}

      {/* Certificate Request Button */}
      {isCourseCompleted && onRequestCertificate && (
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={onRequestCertificate}
            disabled={requestingCertificate || isCourseMarkedCompleted}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCourseMarkedCompleted ? 'Đang chờ duyệt chứng chỉ' : requestingCertificate ? 'Đang xử lý...' : 'Nhận chứng chỉ khóa học'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseSidebar;

