import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/ui/SEO';
import CourseList from '@/components/course/CourseList';
import RankingsList from '@/components/course/RankingsList';
import instructorService, { PageResponse, CourseResponse, TagResponse } from '@/services/instructorService';
import { Course } from '@/components/course/types';
import { useDebounce } from '@/hooks/useDebounce';
import HeroSlider from '@/components/ui/HeroSlider';

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [slides, setSlides] = useState<Array<{ id: string; title: string; subtitle: string; backgroundImage?: string; link?: string; gradientDirection?: 'left'|'right'|'top'|'bottom' }>>([]);
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
              // Prefer fields from search (CourseSummaryResponse)
              let instructorName = (c as any)?.instructorName || (c as any)?.educatorName || '';
              let educatorAvatar = (c as any)?.instructorAvatar || (c as any)?.educatorAvatar as string | undefined;
              // Fallback from detail response if search lacks educator fields
              instructorName = instructorName || (detail as any)?.instructorName || '';
              educatorAvatar = educatorAvatar || (detail as any)?.instructorAvatar;
              if (!instructorName || !educatorAvatar) {
                try {
                  const iid = (detail as any)?.instructorId;
                  const iuid = (detail as any)?.instructorUserId;
                  if (iid) {
                    const ins = await instructorService.getInstructorProfileById(iid);
                    instructorName = instructorName || (ins?.name || '');
                    educatorAvatar = educatorAvatar || ins?.avatar;
                  } else if (iuid) {
                    const ins = await instructorService.getInstructorProfileByUserId(iuid);
                    instructorName = instructorName || (ins?.name || '');
                    educatorAvatar = educatorAvatar || ins?.avatar;
                  }
                } catch {}
              }
              // Normalize avatar URL (handle relative paths)
              const resolveUrl = (u?: string) => {
                if (!u) return undefined;
                if (/^https?:\/\//i.test(u)) return u;
                const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';
                return `${base}${u.startsWith('/') ? u : `/${u}`}`;
              };
              const normalizedAvatar = resolveUrl(educatorAvatar);
              return {
                id: c.id,
                title: c.title,
                instructor: instructorName,
                description: c.description,
                price: c.courseType === 'FREE' || c.price === 0 ? 'Free' : (c.price != null ? `$${c.price}` : undefined),
                originalPrice: c.price ?? detail.price ?? 0,
                discountPercent: (c as any).discount ?? (detail as any)?.discount ?? 0,
                currency: (c as any)?.currency || (detail as any)?.currency,
                courseType: c.courseType || (detail as any)?.courseType,
                educatorAvatar: normalizedAvatar,
                enrollmentCount: (c as any)?.enrollmentCount ?? (c as any)?.numOfStudents ?? (detail as any)?.numOfStudents,
                image: c.imageUrl,
                createdAt: detail.createdAt || (detail as any).createdAt,
                rating: (c as any)?.rating ?? (detail as any)?.rating,
              } as Course & { createdAt?: string };
            } catch (err) {
              return {
                id: c.id,
                title: c.title,
                instructor: '',
                description: c.description,
                price: c.courseType === 'FREE' || c.price === 0 ? 'Free' : (c.price != null ? `$${c.price}` : undefined),
                originalPrice: c.price ?? 0,
                discountPercent: (c as any).discount ?? 0,
                currency: undefined,
                courseType: c.courseType,
                educatorAvatar: undefined,
                enrollmentCount: (c as any)?.enrollmentCount,
                image: c.imageUrl,
                createdAt: undefined,
                rating: (c as any)?.rating,
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
    (async () => {
      try {
        const media = await instructorService.getSlides();
        const mapped = (media || [])
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map((m) => ({
            id: String(m.id),
            title: m.title || '',
            subtitle: m.description || '',
            backgroundImage: m.url,
            link: m.link,
            gradientDirection: 'left' as const,
          }));
        setSlides(mapped);
      } catch {}
    })();
  }, []);

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
        title="Home - lms.cardano2vn.io"
        description="Discover blockchain and Cardano courses. Learn from expert instructors and advance your knowledge in cryptocurrency, smart contracts, and DeFi."
        keywords="Cardano, blockchain, cryptocurrency, smart contracts, DeFi, education, courses, learning"
        url="/home"
      />
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6">
          {/* Slider full-width */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mb-4 sm:mb-6">
            <HeroSlider slides={slides} autoPlay={true} autoPlayInterval={5000} />
          </div>

          {/* Rankings under the slider */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mb-4 sm:mb-6">
            <RankingsList courses={courses.slice(0, 9)} />
          </div>

          {/* Search below the slider */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
            <div className="relative flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search courses, instructors, or topics..."
                className="w-full pl-4 pr-4 py-2.5 sm:py-3 rounded-full text-sm sm:text-base focus:outline-none"
              />
            </div>
          </div>

          {/* Browse by topics below the search */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mb-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Browse by topics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <button
                onClick={() => { setSelectedTagId(''); setKeyword(''); }}
                className={`border rounded px-2 py-1.5 sm:py-2 text-xs text-center transition ${selectedTagId === '' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                All Courses
              </button>
              {(tags || []).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTagId(String(t.id)); setKeyword(''); }}
                  className={`border rounded px-2 py-1.5 sm:py-2 text-xs text-center transition ${selectedTagId === String(t.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Course list */}
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

export default Home;

