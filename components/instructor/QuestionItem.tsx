import React from 'react';
import { QuestionRequest, AnswerRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import AnswerItem from './AnswerItem';

interface QuestionItemProps {
  question: QuestionRequest;
  questionIndex: number;
  onChange: (question: QuestionRequest) => void;
  onRemove: () => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, questionIndex, onChange, onRemove }) => {
  const handleAnswerChange = (answerIndex: number, updatedAnswer: AnswerRequest) => {
    const answers = [...(question.answers || [])];
    answers[answerIndex] = updatedAnswer;
    onChange({ ...question, answers });
  };

  const handleAddAnswer = () => {
    const answers = [...(question.answers || [])];
    answers.push({ content: '', isCorrect: false });
    onChange({ ...question, answers });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    const answers = question.answers?.filter((_, i) => i !== answerIndex) || [];
    onChange({ ...question, answers });
  };

  return (
    <div className="p-3 bg-white border border-gray-200 rounded">
      <input
        type="text"
        value={question.content || ''}
        onChange={(e) => {
          onChange({ ...question, content: e.target.value });
        }}
        placeholder={`Question ${questionIndex + 1}`}
        className="w-full mb-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="space-y-2 mb-2">
        {question.answers && question.answers.map((answer, aIndex) => (
          <AnswerItem
            key={aIndex}
            answer={answer}
            answerIndex={aIndex}
            onChange={(updatedAnswer) => handleAnswerChange(aIndex, updatedAnswer)}
            onRemove={question.answers && question.answers.length > 2 ? () => handleRemoveAnswer(aIndex) : undefined}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAnswer}
        >
          Add Answer
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600"
        >
          Remove Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionItem;

