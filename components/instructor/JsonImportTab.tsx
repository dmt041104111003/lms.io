import React, { useState } from 'react';
import { CourseCreationRequest } from '@/services/instructorService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface JsonImportTabProps {
  onImport: (data: CourseCreationRequest) => void;
}

const JsonImportTab: React.FC<JsonImportTabProps> = ({ onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleParse = () => {
    setError(null);
    setSuccess(false);

    if (!jsonText.trim()) {
      setError('Please paste JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      
      // Validate và transform data
      const courseData: CourseCreationRequest = {
        title: parsed.title || '',
        description: parsed.description || '',
        shortDescription: parsed.shortDescription || '',
        requirement: parsed.requirement || '',
        videoUrl: parsed.videoUrl || '',
        draft: parsed.draft !== undefined ? parsed.draft : true,
        price: parsed.price || 0,
        currency: parsed.currency || 'USD',
        courseType: parsed.courseType === 'PRO' ? 'PAID' : (parsed.courseType || 'FREE'),
        instructorId: parsed.instructorId || 0,
        chapters: parsed.chapters || [],
        courseTests: parsed.courseTests || [],
      };

      onImport(courseData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const handleClear = () => {
    setJsonText('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import from JSON</h3>
        <p className="text-xs text-gray-600 mb-4">
          Paste your course data in JSON format. The JSON should match the CourseCreationRequest structure.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            JSON Data
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder='{"title": "Course Title", "description": "...", "chapters": [...], "courseTests": [...]}'
            rows={12}
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600">
            JSON imported successfully! Check the form below.
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleParse}
          >
            Parse & Import
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>


      </div>
    </Card>
  );
};

export default JsonImportTab;

