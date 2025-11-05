import React from 'react';
import { TestRequest, QuestionRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import QuestionItem from './QuestionItem';

interface TestItemProps {
  test: TestRequest;
  testIndex: number;
  onChange: (test: TestRequest) => void;
  onRemove: () => void;
}

const TestItem: React.FC<TestItemProps> = ({ test, testIndex, onChange, onRemove }) => {
  const handleQuestionChange = (questionIndex: number, updatedQuestion: QuestionRequest) => {
    const questions = [...(test.questions || [])];
    questions[questionIndex] = updatedQuestion;
    onChange({ ...test, questions });
  };

  const handleAddQuestion = () => {
    const questions = [...(test.questions || [])];
    questions.push({
      content: '',
      answers: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
      ],
    });
    onChange({ ...test, questions });
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    const questions = test.questions?.filter((_, i) => i !== questionIndex) || [];
    onChange({ ...test, questions });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        <input
          type="text"
          value={test.title || ''}
          onChange={(e) => {
            onChange({ ...test, title: e.target.value });
          }}
          placeholder="Test Title"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={test.durationMinutes || ''}
            onChange={(e) => {
              onChange({ ...test, durationMinutes: parseInt(e.target.value) || undefined });
            }}
            placeholder="Duration (minutes)"
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={test.passScore || ''}
            onChange={(e) => {
              onChange({ ...test, passScore: parseInt(e.target.value) || undefined });
            }}
            placeholder="Pass Score"
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600"
          >
            Remove Test
          </Button>
        </div>
        {/* Questions */}
        {test.questions && test.questions.map((question, qIndex) => (
          <QuestionItem
            key={qIndex}
            question={question}
            questionIndex={qIndex}
            onChange={(updatedQuestion) => handleQuestionChange(qIndex, updatedQuestion)}
            onRemove={() => handleRemoveQuestion(qIndex)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestItem;

