import React from 'react';
import { AnswerRequest } from '@/services/instructorService';

interface AnswerItemProps {
  answer: AnswerRequest;
  answerIndex: number;
  onChange: (answer: AnswerRequest) => void;
  onRemove?: () => void;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, answerIndex, onChange, onRemove }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 flex-1">
        <input
          type="checkbox"
          checked={answer.isCorrect || false}
          onChange={(e) => {
            onChange({ ...answer, isCorrect: e.target.checked });
          }}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          aria-label={`Mark answer ${answerIndex + 1} as correct`}
        />
        <input
          type="text"
          value={answer.content || ''}
          onChange={(e) => {
            onChange({ ...answer, content: e.target.value });
          }}
          placeholder={`Answer ${answerIndex + 1}`}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 text-sm hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  );
};

export default AnswerItem;

