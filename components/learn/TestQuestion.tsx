import React from 'react';
import { QuestionResponse } from '@/services/instructorService';

interface TestQuestionProps {
  question: QuestionResponse;
  questionIndex: number;
  testAnswers: Record<string, number[]>;
  isMultipleChoice: (question: QuestionResponse) => boolean;
  onAnswerChange: (questionId: string, answerId: number | string, question: QuestionResponse) => void;
  onClearAnswer: (questionId: string) => void;
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  questionIndex,
  testAnswers,
  isMultipleChoice,
  onAnswerChange,
  onClearAnswer,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
          {questionIndex + 1}
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{question.content}</h3>
          {testAnswers[String(question.id)] && testAnswers[String(question.id)].length > 0 && (
            <button
              onClick={() => onClearAnswer(String(question.id))}
              className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>
      {question.imageUrl && (
        <div className="mb-4 ml-11">
          <img src={question.imageUrl} alt="Question image" className="max-w-full h-auto rounded-lg" />
        </div>
      )}
      <div className="space-y-2 ml-11">
        {(question.answers || []).map((answer: any, oIndex: number) => {
          const answerContent = answer.content || answer;
          const answerId = answer.id || oIndex;
          const isSelected = testAnswers[String(question.id)]?.includes(answerId) || false;
          return (
            <label
              key={oIndex}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type={isMultipleChoice(question) ? 'checkbox' : 'radio'}
                checked={isSelected}
                onChange={() => onAnswerChange(String(question.id), answerId, question)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex-1 text-gray-700">{answerContent}</span>
            </label>
          );
        })}
        {(!question.answers || question.answers.length === 0) && (
          <p className="text-sm text-gray-500 italic">No options available for this question</p>
        )}
      </div>
    </div>
  );
};

export default TestQuestion;

