import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import VideoPlayer from '@/components/learn/VideoPlayer';
import LectureInfo from '@/components/learn/LectureInfo';
import TestView from '@/components/learn/TestView';
import CourseSidebar from '@/components/learn/CourseSidebar';
import Dialog from '@/components/ui/Dialog';
import instructorService, { TestDetailResponse, QuestionResponse } from '@/services/instructorService';

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

interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  price?: number;
  courseType?: string;
  chapters?: ChapterSummary[];
  courseTests?: TestSummary[];
}

const LearnPage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();
  const { toasts, removeToast, error: showError } = useToast();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<LectureSummary | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestSummary | null>(null);
  const [testDetail, setTestDetail] = useState<TestDetailResponse | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number[]>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTest, setLoadingTest] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTestConfirmDialog, setShowTestConfirmDialog] = useState(false);
  const [pendingTest, setPendingTest] = useState<TestSummary | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [testTimeRemaining, setTestTimeRemaining] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (testTimeRemaining === null || testTimeRemaining <= 0 || testSubmitted) {
      if (testTimeRemaining === 0 && !testSubmitted && selectedTest) {
        handleSubmitTest();
        setTestTimeRemaining(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setTestTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testTimeRemaining, testSubmitted, selectedTest]);

  useEffect(() => {
    if (!courseId || typeof courseId !== 'string') return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const detailUrl = `/api/course/${courseId}${user?.id ? `?userId=${user.id}` : ''}`;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com'}${detailUrl}`, {
          credentials: 'include',
        });
        const apiResponse = await response.json();

        if (apiResponse.code === 1000 && apiResponse.result) {
          const result = apiResponse.result;
          setCourse({
            id: result.id,
            title: result.title || '',
            description: result.description,
            imageUrl: result.imageUrl,
            videoUrl: result.videoUrl,
            price: result.price,
            courseType: result.courseType,
            chapters: result.chapters || [],
            courseTests: result.courseTests || [],
          });

          const firstLecture = result.chapters
            ?.flatMap((ch: ChapterSummary) => ch.lectures || [])
            .sort((a: LectureSummary, b: LectureSummary) => a.orderIndex - b.orderIndex)[0];
          if (firstLecture) {
            setSelectedLecture(firstLecture);
          }
        } else {
          showError('Failed to load course');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        showError('Failed to load course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, showError]);

  const handleLectureClick = (lecture: LectureSummary) => {
    setSelectedLecture(lecture);
    setSelectedTest(null);
    setTestDetail(null);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(null);
  };

  const handleTestClick = (test: TestSummary) => {
    if (!courseId || typeof courseId !== 'string' || !user?.id) {
      showError('Please login to take the test');
      return;
    }

    setPendingTest(test);
    setShowTestConfirmDialog(true);
  };

  const handleConfirmTestStart = async () => {
    if (!pendingTest || !courseId || typeof courseId !== 'string' || !user?.id) {
      return;
    }

    setShowTestConfirmDialog(false);

    try {
      setLoadingTest(true);
      setSelectedTest(pendingTest);
      setSelectedLecture(null);
      setTestAnswers({});
      setTestSubmitted(false);
      setTestScore(null);

      const detail = await instructorService.getTestDetail(courseId, String(pendingTest.id));
      setTestDetail(detail);

      if (pendingTest.durationMinutes) {
        const durationSeconds = pendingTest.durationMinutes * 60;
        setTestTimeRemaining(durationSeconds);
        setTestStartTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
      showError('Failed to load test. Please try again.');
    } finally {
      setLoadingTest(false);
    }
  };

  const isMultipleChoice = (question: QuestionResponse): boolean => {
    if (!question.answers || question.answers.length === 0) return false;
    const correctAnswers = question.answers.filter(
      (answer) => answer.isCorrect === true || answer.correct === true
    );
    return correctAnswers.length > 1;
  };

  const handleAnswerChange = (questionId: string, answerId: number | string, question: QuestionResponse) => {
    const isMultiple = isMultipleChoice(question);
    setTestAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const newAnswers = current.includes(answerId as number)
          ? current.filter((a) => a !== answerId)
          : [...current, answerId as number];
        return { ...prev, [questionId]: newAnswers };
      } else {
        if (current.includes(answerId as number)) {
          return { ...prev, [questionId]: [] };
        } else {
          return { ...prev, [questionId]: [answerId as number] };
        }
      }
    });
  };

  const handleClearAnswer = (questionId: string) => {
    setTestAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const handleSubmitClick = () => {
    if (!testDetail) return;
    
    const totalQuestions = testDetail.questions?.length || 0;
    const answeredQuestions = Object.keys(testAnswers).length;
    const unansweredQuestions = totalQuestions - answeredQuestions;

    if (unansweredQuestions > 0) {
      setShowSubmitDialog(true);
    } else {
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    setShowSubmitDialog(false);
    setTestTimeRemaining(null);
    setTestStartTime(null);
    
    if (!testDetail || !user?.id || !courseId || typeof courseId !== 'string' || !selectedTest) {
      showError('Cannot submit test');
      return;
    }

    try {
      setLoadingTest(true);
      
      const submission = {
        userId: user.id,
        answers: Object.entries(testAnswers).map(([questionId, answerIds]) => ({
          questionId: Number(questionId),
          answerId: answerIds.map(id => Number(id))
        }))
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com'}/api/course/${courseId}/tests/submit/${selectedTest.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(submission),
        }
      );

      const apiResponse = await response.json();

      if (apiResponse.code === 1000 && apiResponse.result) {
        const result = apiResponse.result;
        setTestSubmitted(true);
        setTestScore(result.score || 0);
      } else {
        showError(apiResponse.message || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
      showError('Failed to submit test. Please try again.');
    } finally {
      setLoadingTest(false);
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-600">Loading course...</div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-600">Course not found</div>
        </div>
      </Layout>
    );
  }

  // Get all lectures from all chapters
  const allLectures = course.chapters
    ?.flatMap((ch) => ch.lectures || [])
    .sort((a, b) => a.orderIndex - b.orderIndex) || [];

  // Get all tests from all chapters
  const allTests = course.chapters
    ?.flatMap((ch) => ch.tests || [])
    .sort((a, b) => a.orderIndex - b.orderIndex) || [];

  return (
    <>
      <SEO
        title={`${course.title} - Learn - lms.cardano2vn.io`}
        description={course.description || 'Learn course'}
        url={`/learn/${course.id}`}
      />
      <Layout hideFooter={true}>
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Main Content - Left Side */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* Sidebar Toggle Button - Hamburger (only show when collapsed) */}
                {sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="fixed top-24 right-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors border border-gray-200"
                    aria-label="Open sidebar"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                {/* Test View */}
                {selectedTest && testDetail ? (
                  <TestView
                    test={selectedTest}
                    testDetail={testDetail}
                    testAnswers={testAnswers}
                    testSubmitted={testSubmitted}
                    testScore={testScore}
                    loadingTest={loadingTest}
                    showSubmitDialog={showSubmitDialog}
                    testTimeRemaining={testTimeRemaining}
                    isMultipleChoice={isMultipleChoice}
                    onAnswerChange={handleAnswerChange}
                    onClearAnswer={handleClearAnswer}
                    onSubmitClick={handleSubmitClick}
                    onSubmitTest={handleSubmitTest}
                    onCancelSubmit={() => setShowSubmitDialog(false)}
                    onRetake={() => {
                      setTestSubmitted(false);
                      setTestAnswers({});
                      setTestScore(null);
                      setTestTimeRemaining(null);
                      setTestStartTime(null);
                    }}
                  />
                ) : (
                  <>
                    {/* Video Player */}
                    <VideoPlayer
                      videoUrl={selectedLecture?.videoUrl || course.videoUrl}
                      title={selectedLecture?.title || course.title}
                    />

                    {/* Lecture Info */}
                    {selectedLecture && (
                      <LectureInfo
                        title={selectedLecture.title}
                        description={selectedLecture.description}
                        duration={selectedLecture.duration}
                        previewFree={selectedLecture.previewFree}
                      />
                    )}

                    {/* Course Description */}
                    {course.description && !selectedLecture && (
                      <div className="bg-white rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">About this course</h2>
                        <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">{course.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className={`${
              sidebarCollapsed ? 'hidden lg:block lg:w-0' : 'w-full lg:w-72 xl:w-80'
            } bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto custom-scrollbar flex-shrink-0 max-h-[50vh] lg:max-h-none transition-all duration-300`}>
              <CourseSidebar
                chapters={course.chapters}
                courseTests={course.courseTests}
                selectedLecture={selectedLecture}
                selectedTest={selectedTest}
                onLectureClick={handleLectureClick}
                onTestClick={handleTestClick}
                onClose={() => setSidebarCollapsed(true)}
              />
            </div>
          </div>
        </div>
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Test Start Confirmation Dialog */}
      {pendingTest && (
        <Dialog
          isOpen={showTestConfirmDialog}
          title="Start Test"
          message={
            `Are you sure you want to start the test "${pendingTest.title}"?${
              pendingTest.durationMinutes 
                ? `\n\nDuration: ${pendingTest.durationMinutes} minutes\nOnce started, the timer will begin and the test will be automatically submitted when time runs out.`
                : ''
            }`
          }
          confirmText="Start Test"
          cancelText="Cancel"
          onConfirm={handleConfirmTestStart}
          onCancel={() => {
            setShowTestConfirmDialog(false);
            setPendingTest(null);
          }}
          type="default"
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f1f1;
        }
      `}</style>
    </>
  );
};

export default LearnPage;

