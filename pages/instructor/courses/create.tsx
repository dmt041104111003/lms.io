import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CourseFormFields from '@/components/instructor/CourseFormFields';
import CourseContentSection from '@/components/instructor/CourseContentSection';
import CourseTestsSection from '@/components/instructor/CourseTestsSection';
import JsonImportTab from '@/components/instructor/JsonImportTab';
import instructorService, { CourseCreationRequest, TagResponse } from '@/services/instructorService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

const CreateCourse: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [instructorProfileId, setInstructorProfileId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CourseCreationRequest>({
    title: '',
    description: '',
    shortDescription: '',
    requirement: '',
    videoUrl: '',
    draft: false,
    price: 0,
    currency: 'USD',
    courseType: 'FREE',
    instructorId: 0,
    chapters: [],
    courseTests: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInstructorProfile = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        if (profile?.id) {
          setInstructorProfileId(profile.id);
          setFormData(prev => ({ ...prev, instructorId: profile.id }));
        }
      } catch (err) {
        console.error('Failed to fetch instructor profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load instructor profile';
        if (errorMessage.includes('USER_NOT_EXISTED') || errorMessage.includes('not found')) {
          error('Instructor profile not found. Please contact administrator to set up your instructor account.');
        } else {
          error(errorMessage);
        }
      }
    };

    fetchInstructorProfile();
  }, [user, error]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await instructorService.getAllTags();
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };

    fetchTags();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailSelect = (thumbnailUrl: string) => {
    // Convert thumbnail URL to blob and set as image file
    fetch(thumbnailUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'youtube-thumbnail.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(thumbnailUrl);
      })
      .catch(err => {
        console.error('Failed to fetch thumbnail:', err);
      });
  };

  const handleJsonImport = (importedData: CourseCreationRequest) => {
    setFormData({
      ...importedData,
      instructorId: instructorProfileId || importedData.instructorId || 0,
    });
    if (importedData.tagIds && importedData.tagIds.length > 0) {
      setSelectedTagIds(importedData.tagIds);
    }
    setActiveTab('form');
    success('Course data imported successfully from JSON!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent double submit
    
    if (!instructorProfileId) {
      error('Instructor profile not found');
      return;
    }

    if (!formData.title.trim()) {
      error('Please enter a course title');
      return;
    }

    if (!imageFile) {
      error('Please select a thumbnail image for the course');
      return;
    }

    try {
      setSubmitting(true);
      const courseData = {
        ...formData,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      };
      await instructorService.createCourse(courseData, imageFile || undefined);
      success('Course created successfully');
      router.push('/instructor/courses');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InstructorGuard>
      <InstructorLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Course</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Fill in the details to create your course</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'json'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                JSON Import
              </button>
            </nav>
          </div>

          {activeTab === 'json' ? (
            <JsonImportTab onImport={handleJsonImport} />
          ) : (
            <form onSubmit={handleSubmit}>
            <Card className="p-4 sm:p-6 space-y-4">
              <CourseFormFields
                formData={formData}
                onChange={handleChange}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onThumbnailSelect={handleThumbnailSelect}
                tags={tags}
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
              />
            </Card>

            <CourseContentSection
              chapters={formData.chapters || []}
              onChaptersChange={(chapters) => setFormData(prev => ({ ...prev, chapters }))}
            />

            <CourseTestsSection
              tests={formData.courseTests || []}
              onTestsChange={(courseTests) => setFormData(prev => ({ ...prev, courseTests }))}
            />

            {/* Submit Buttons */}
            <Card className="p-4 sm:p-6">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!instructorProfileId || submitting}
                >
                  {submitting ? 'Creating…' : 'Create Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </Card>
            </form>
          )}
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default CreateCourse;

