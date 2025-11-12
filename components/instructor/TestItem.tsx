import React from 'react';
import { TestRequest, QuestionRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import QuestionItem from './QuestionItem';
import {ChevronDownIcon, ChevronUpIcon, Trash2} from 'lucide-react'
interface TestItemProps {
  test: TestRequest;
  testIndex: number;
  onChange: (test: TestRequest) => void;
  onRemove: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const TestItem: React.FC<TestItemProps> = ({ test, testIndex, onChange, onRemove, collapsed: collapsedProp, onToggle }) => {
  const [selfCollapsed, setSelfCollapsed] = React.useState(true);
  const collapsed = (collapsedProp ?? selfCollapsed);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (collapsed) setExpandedQuestionIndex(null);
  }, [collapsed]);
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
    if (expandedQuestionIndex === questionIndex) setExpandedQuestionIndex(null);
  };

  return (
    <div className="bg-gray-50 px-3  py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (onToggle ? onToggle() : setSelfCollapsed((c) => !c))}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm"
          aria-label="Toggle test"
          title="Toggle"
        >
          {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </button>
        <input
          type="text"
          value={test.title || ''}
          onChange={(e) => {
            onChange({ ...test, title: e.target.value });
          }}
          placeholder="Test Title"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
      {!collapsed && (
        <div className="space-y-3 mt-3">
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
          <input
            type="text"
            value={test.rule || ''}
            onChange={(e) => onChange({ ...test, rule: e.target.value })}
            placeholder="Rule (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
            >
              Add Question
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
              collapsed={expandedQuestionIndex !== qIndex}
              onToggle={() => setExpandedQuestionIndex((prev) => (prev === qIndex ? null : qIndex))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TestItem;

