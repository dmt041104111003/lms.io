import React from 'react';
import { QuestionRequest, AnswerRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import AnswerItem from './AnswerItem';
import {ChevronDownIcon, ChevronUpIcon, Trash2} from 'lucide-react'

interface QuestionItemProps {
  question: QuestionRequest;
  questionIndex: number;
  onChange: (question: QuestionRequest) => void;
  onRemove: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, questionIndex, onChange, onRemove, collapsed: collapsedProp, onToggle }) => {
  const [selfCollapsed, setSelfCollapsed] = React.useState(true);
  const collapsed = (collapsedProp ?? selfCollapsed);
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
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => (onToggle ? onToggle() : setSelfCollapsed((c) => !c))}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm"
          aria-label="Toggle question"
          title="Toggle"
        >
          {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </button>
        <input
          type="text"
          value={question.content || ''}
          onChange={(e) => {
            onChange({ ...question, content: e.target.value });
          }}
          placeholder={`Question ${questionIndex + 1}`}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
      {!collapsed && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <input
              type="number"
              value={question.score ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ ...question, score: v === '' ? undefined : parseInt(v) || 0 });
              }}
              placeholder="Score"
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={question.imageUrl || ''}
              onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
              placeholder="Image URL (optional)"
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionItem;

