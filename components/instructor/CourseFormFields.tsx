import React from 'react';
import { CourseCreationRequest, TagResponse, PaymentOptionRequest } from '@/services/instructorService';
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
  paymentMethods?: PaymentOptionRequest[];
  onPaymentMethodsChange?: (methods: PaymentOptionRequest[]) => void;
}

const CourseFormFields: React.FC<CourseFormFieldsProps> = ({ 
  formData, 
  onChange, 
  imagePreview, 
  onImageChange,
  onThumbnailSelect,
  tags = [],
  selectedTagIds = [],
  onTagsChange,
  paymentMethods = [],
  onPaymentMethodsChange,
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

      {/* Inline Payment Method (only for PAID) */}
      {formData.courseType === 'PAID' && (
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={(paymentMethods[0]?.paymentMethodId === 'STRIPE' || paymentMethods[0]?.paymentMethodId === 'PAYPAL')
                ? 'CARDANO_WALLET'
                : (paymentMethods[0]?.paymentMethodId || 'CARDANO_WALLET')}
              onChange={(e) => {
                const val = e.target.value;
                const next = paymentMethods.length > 0
                  ? [{ ...paymentMethods[0], paymentMethodId: val }]
                  : [{ paymentMethodId: val, receiverAddress: '' }];
                onPaymentMethodsChange && onPaymentMethodsChange(next);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CARDANO_WALLET">Cardano Wallet</option>
              <option value="STRIPE" disabled>Stripe (disabled)</option>
              <option value="PAYPAL" disabled>PayPal (disabled)</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
            <input
              type="text"
              value={paymentMethods[0]?.receiverAddress || ''}
              onChange={(e) => {
                const val = e.target.value;
                const next = paymentMethods.length > 0
                  ? [{ ...paymentMethods[0], receiverAddress: val }]
                  : [{ paymentMethodId: 'CARDANO_WALLET', receiverAddress: val }];
                onPaymentMethodsChange && onPaymentMethodsChange(next);
              }}
              placeholder="Enter address to receive payments"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              value={formData.currency || 'ADA'}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            />
          </div>
        </div>
      )}

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
            step="1"
            required={formData.courseType === 'PAID'}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Discount and End Time (only for PAID) */}
      {formData.courseType === 'PAID' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount ?? 0}
              onChange={onChange}
              min="0"
              max="100"
              step="1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount End Time
            </label>
            <input
              type="datetime-local"
              name="discountEndTime"
              value={formData.discountEndTime || ''}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              key={imagePreview}
              src={imagePreview}
              alt="Preview"
              className="w-48 h-48 object-cover rounded border border-gray-300"
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

{/* Draft Checkbox (align right) */}
      <div className="flex items-center justify-end">
        
        <label htmlFor="draft" className="mr-2 text-sm text-gray-700">
          Save as draft (unpublished) 
        </label>
        <input
          id="draft"
          type="checkbox"
          name="draft"
          checked={formData.draft}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
      
    </>
  );
};

export default CourseFormFields;

