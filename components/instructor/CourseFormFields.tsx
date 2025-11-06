import React from 'react';
import { CourseCreationRequest, TagResponse } from '@/services/instructorService';
import VideoPreview from './VideoPreview';

interface CourseFormFieldsProps {
  formData: CourseCreationRequest;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThumbnailSelect?: (thumbnailUrl: string) => void;
  tags?: TagResponse[];
  selectedTagIds?: number[];
  onTagsChange?: (tagIds: number[]) => void;
}

const CourseFormFields: React.FC<CourseFormFieldsProps> = ({ 
  formData, 
  onChange, 
  imagePreview, 
  onImageChange,
  onThumbnailSelect,
  tags = [],
  selectedTagIds = [],
  onTagsChange
}) => {
  const handleTagChange = (tagId: number, checked: boolean) => {
    if (onTagsChange) {
      if (checked) {
        onTagsChange([...selectedTagIds, tagId]);
      } else {
        onTagsChange(selectedTagIds.filter(id => id !== tagId));
      }
    }
  };
  return (
    <>
      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course title"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={onChange}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the course"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Detailed description of the course"
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <textarea
          name="requirement"
          value={formData.requirement}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What students need to know before taking this course"
        />
      </div>

      {/* Course Type */}
      <div>
        <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">
          Course Type <span className="text-red-500">*</span>
        </label>
        <select
          id="courseType"
          name="courseType"
          value={formData.courseType}
          onChange={onChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Price (only for PAID) */}
      {formData.courseType === 'PAID' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            min="0"
            step="0.01"
            required={formData.courseType === 'PAID'}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL (Preview)
        </label>
        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl || ''}
          onChange={onChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {formData.videoUrl && (
          <VideoPreview 
            videoUrl={formData.videoUrl} 
            onThumbnailSelect={onThumbnailSelect}
          />
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="courseImage" className="block text-sm font-medium text-gray-700 mb-1">
          Course Thumbnail
        </label>
        <input
          id="courseImage"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          aria-label="Course thumbnail image"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Tags Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        {tags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
            </div>
            {selectedTagIds.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Select tags to categorize your course</p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">Loading tags...</p>
        )}
      </div>

      {/* Draft Checkbox */}
      <div className="flex items-center">
        <input
          id="draft"
          type="checkbox"
          name="draft"
          checked={formData.draft}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="draft" className="ml-2 text-sm text-gray-700">
          Save as draft (unpublished)
        </label>
      </div>
    </>
  );
};

export default CourseFormFields;

