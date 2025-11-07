import React from 'react';
import { TestDetailResponse, QuestionResponse } from '@/services/instructorService';
import TestQuestion from './TestQuestion';
import Dialog from '@/components/ui/Dialog';

interface TestSummary {
  id: number;
  title: string;
  durationMinutes?: number;
  passScore?: number;
  orderIndex: number;
}

interface TestViewProps {
  test: TestSummary;
  testDetail: TestDetailResponse;
  testAnswers: Record<string, number[]>;
  testSubmitted: boolean;
  testScore: number | null;
  loadingTest: boolean;
  showSubmitDialog: boolean;
  isMultipleChoice: (question: QuestionResponse) => boolean;
  onAnswerChange: (questionId: string, answerId: number | string, question: QuestionResponse) => void;
  onClearAnswer: (questionId: string) => void;
  onSubmitClick: () => void;
  onSubmitTest: () => void;
  onCancelSubmit: () => void;
  onRetake: () => void;
}

const TestView: React.FC<TestViewProps> = ({
  test,
  testDetail,
  testAnswers,
  testSubmitted,
  testScore,
  loadingTest,
  showSubmitDialog,
  isMultipleChoice,
  onAnswerChange,
  onClearAnswer,
  onSubmitClick,
  onSubmitTest,
  onCancelSubmit,
  onRetake,
}) => {
  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{testDetail.title}</h1>
        {testDetail.description && (
          <p className="text-gray-600 mb-4">{testDetail.description}</p>
        )}
        {test.durationMinutes && (
          <p className="text-sm text-gray-500">Duration: {test.durationMinutes} minutes</p>
        )}
        {test.passScore && (
          <p className="text-sm text-gray-500">Pass Score: {test.passScore}%</p>
        )}
      </div>

      {/* Test Questions */}
      {loadingTest ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading test...</div>
        </div>
      ) : testSubmitted ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <div className={`text-4xl font-bold mb-4 ${testScore && testScore >= (test.passScore || 0) ? 'text-green-600' : 'text-red-600'}`}>
            {testScore?.toFixed(1)}%
          </div>
          <p className="text-lg text-gray-700 mb-2">
            {testScore && testScore >= (test.passScore || 0) ? 'Congratulations! You passed!' : 'You did not pass. Try again!'}
          </p>
          <button
            onClick={onRetake}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retake Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {testDetail.questions?.map((question, qIndex) => (
            <TestQuestion
              key={question.id}
              question={question}
              questionIndex={qIndex}
              testAnswers={testAnswers}
              isMultipleChoice={isMultipleChoice}
              onAnswerChange={onAnswerChange}
              onClearAnswer={onClearAnswer}
            />
          ))}

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-6 mt-6">
            {testDetail.questions && (
              <div className="mb-3 text-sm text-gray-600">
                Answered: {Object.keys(testAnswers).length} / {testDetail.questions.length} questions
                {Object.keys(testAnswers).length < testDetail.questions.length && (
                  <span className="ml-2 text-orange-600 font-medium">
                    ({testDetail.questions.length - Object.keys(testAnswers).length} unanswered)
                  </span>
                )}
              </div>
            )}
            <button
              onClick={onSubmitClick}
              disabled={loadingTest || Object.keys(testAnswers).length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingTest ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      )}

      {/* Submit Test Confirmation Dialog */}
      {testDetail && (
        <Dialog
          isOpen={showSubmitDialog}
          title="Confirm Submit Test"
          message={
            (() => {
              const totalQuestions = testDetail.questions?.length || 0;
              const answeredQuestions = Object.keys(testAnswers).length;
              const unansweredQuestions = totalQuestions - answeredQuestions;
              
              if (unansweredQuestions > 0) {
                return `You have ${unansweredQuestions} unanswered question${unansweredQuestions > 1 ? 's' : ''}. Are you sure you want to submit the test?`;
              }
              return 'Are you sure you want to submit the test?';
            })()
          }
          confirmText="Submit"
          cancelText="Cancel"
          onConfirm={onSubmitTest}
          onCancel={onCancelSubmit}
          type="default"
        />
      )}
    </div>
  );
};

export default TestView;

