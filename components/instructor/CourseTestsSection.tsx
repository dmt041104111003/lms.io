import React from 'react';
import { TestRequest } from '@/services/instructorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TestItem from './TestItem';

interface CourseTestsSectionProps {
  tests: TestRequest[];
  onTestsChange: (tests: TestRequest[]) => void;
}

const CourseTestsSection: React.FC<CourseTestsSectionProps> = ({ tests, onTestsChange }) => {
  const [expandedTestIndex, setExpandedTestIndex] = React.useState<number | null>(null);
  const handleTestChange = (testIndex: number, updatedTest: TestRequest) => {
    const newTests = [...tests];
    newTests[testIndex] = updatedTest;
    onTestsChange(newTests);
  };

  const handleAddTest = () => {
    const newTests = [...tests];
    newTests.push({
      title: '',
      orderIndex: newTests.length + 1,
      questions: [],
    });
    onTestsChange(newTests);
  };

  const handleRemoveTest = (testIndex: number) => {
    const newTests = tests.filter((_, i) => i !== testIndex);
    onTestsChange(newTests);
    if (expandedTestIndex === testIndex) setExpandedTestIndex(null);
  };

  return (
    <Card className="p-4 my-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Tests (Global)</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTest}
        >
          Add Course Test
        </Button>
      </div>

      {tests.length > 0 ? (
        <div className="space-y-4">
          {tests.map((test, testIndex) => (
            <TestItem
              key={testIndex}
              test={test}
              testIndex={testIndex}
              onChange={(updatedTest) => handleTestChange(testIndex, updatedTest)}
              onRemove={() => handleRemoveTest(testIndex)}
              collapsed={expandedTestIndex !== testIndex}
              onToggle={() => setExpandedTestIndex((prev) => (prev === testIndex ? null : testIndex))}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No course tests added yet. Click "Add Course Test" to add a global test for the entire course.
        </p>
      )}
    </Card>
  );
};

export default CourseTestsSection;

