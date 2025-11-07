import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import CourseList from '@/components/course/CourseList';
import SEO from '@/components/ui/SEO';
import instructorService, { PageResponse, CourseResponse, TagResponse } from '@/services/instructorService';
import { Course } from '@/components/course/types';
import { useDebounce } from '@/hooks/useDebounce';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    const load = async () => {
      try {
        const res: PageResponse<CourseResponse> = await instructorService.searchCourses({ 
          keyword: debouncedKeyword || undefined,
          tagId: selectedTagId || undefined,
          page: 0, 
          size: 50 
        });
        
        const filtered = res.content.filter((c) => !(c as any).draft && !(c as any).isDraft && (c as any).status !== 'DRAFT');
        
        const coursesWithCreatedAt = await Promise.all(
          filtered.map(async (c) => {
            try {
              const detail = await instructorService.getCourseById(c.id);
              return {
                id: c.id,
                title: c.title,
                instructor: '',
                description: c.description,
                price: c.courseType === 'FREE' || c.price === 0 ? 'Free' : (c.price != null ? `$${c.price}` : undefined),
                image: c.imageUrl,
                createdAt: detail.createdAt || (detail as any).createdAt, 
              } as Course & { createdAt?: string };
            } catch (err) {
              return {
                id: c.id,
                title: c.title,
                instructor: '',
                description: c.description,
                price: c.courseType === 'FREE' || c.price === 0 ? 'Free' : (c.price != null ? `$${c.price}` : undefined),
                image: c.imageUrl,
                createdAt: undefined,
              } as Course & { createdAt?: string };
            }
          })
        );
        
        const mapped = coursesWithCreatedAt.sort((a, b) => {
          const da = a.createdAt || '';
          const db = b.createdAt || '';
          return db.localeCompare(da);
        });
        
        setCourses(mapped);
        setTotalResults(res.totalElements);
      } catch (e) {
        setCourses([]);
        setTotalResults(0);
      }
    };
    load();
  }, [debouncedKeyword, selectedTagId]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const all = await instructorService.getAllTags();
        setTags(all);
      } catch {}
    };
    loadTags();
  }, []);

  return (
    <>
      <SEO
        title="Courses - lms.cardano2vn.io"
        description="Browse our comprehensive collection of blockchain and Cardano courses. Find free and premium courses taught by expert instructors."
        keywords="courses, Cardano courses, blockchain courses, free courses, premium courses, online learning"
        url="/courses"
      />
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mb-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search course name..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              aria-label="Filter by tag"
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={String(tag.id)}>{tag.name}</option>
              ))}
            </select>
          </div>
          <CourseList 
            courses={courses} 
            totalResults={totalResults}
            searchQuery={keyword}
          />
        </div>
      </Layout>
    </>
  );
};

export default CoursesPage;

