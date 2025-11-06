import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import CourseList from '@/components/course/CourseList';
import SEO from '@/components/ui/SEO';
import instructorService, { PageResponse, CourseResponse } from '@/services/instructorService';
import { Course } from '@/components/course/types';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const res: PageResponse<CourseResponse> = await instructorService.searchCourses({ page: 0, size: 50 });
        const mapped: Course[] = res.content.map((c) => ({
          id: c.id,
          title: c.title,
          instructor: '',
          description: c.description,
          price: c.courseType === 'FREE' || c.price === 0 ? 'Free' : (c.price != null ? `$${c.price}` : undefined),
          image: c.imageUrl,
        }));
        setCourses(mapped);
        setTotalResults(res.totalElements);
      } catch (e) {
        setCourses([]);
        setTotalResults(0);
      }
    };
    load();
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
          <CourseList 
            courses={courses} 
            totalResults={totalResults}
            searchQuery=""
          />
        </div>
      </Layout>
    </>
  );
};

export default CoursesPage;

