import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import HeroSlider from '@/components/ui/HeroSlider';
import { instructorService, type PageResponse, type CourseResponse, type TagResponse, type TopInstructorResponse } from '@/services/instructorService';

const SearchSection: React.FC = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [coursePage, setCoursePage] = useState<PageResponse<CourseResponse> | null>(null); // search results or new
  const [popularPage, setPopularPage] = useState<PageResponse<CourseResponse> | null>(null);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagResponse | null>(null);
  const [topInstructors, setTopInstructors] = useState<TopInstructorResponse[]>([]);
  const [topCoursesByInstructor, setTopCoursesByInstructor] = useState<Record<number, CourseResponse[]>>({});
  const [loadingTop, setLoadingTop] = useState(false);
  const [topLimit, setTopLimit] = useState<number>(8);
  const [topCourseCount, setTopCourseCount] = useState<number>(3);

  // Load courses helper
  const loadCourses = async (params: { keyword?: string; tagId?: string; sort?: 'popular'|'new'; page?: number; size?: number } = {}) => {
    setLoading(true);
    try {
      const res = await instructorService.searchCourses({
        keyword: params.keyword,
        tagId: params.tagId,
        sort: params.sort,
        page: params.page ?? 0,
        size: params.size ?? 12,
      });
      setCoursePage(res);
    } catch (e) {
      // noop toast per requirements (no alerts); keep silent
    } finally {
      setLoading(false);
    }
  };

  // Initial load: Slides + New Releases + Popular + Top Instructors
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
    loadCourses({ sort: 'new', page: 0, size: 12 });
    (async () => {
      try {
        const res = await instructorService.searchCourses({ sort: 'popular', page: 0, size: 12 });
        setPopularPage(res);
      } catch {}
    })();
    loadTopInstructors();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await instructorService.getAllTags();
        setTags(res || []);
      } catch {}
    })();
  }, []);

  const loadTopInstructors = async () => {
    setLoadingTop(true);
    try {
      const list = await instructorService.getTopInstructors(topLimit);
      setTopInstructors(list || []);
      const entries = await Promise.all((list || []).map(async (ins) => {
        try {
          const page = await instructorService.getCoursesByProfile(ins.id, 0, topCourseCount);
          return [ins.id, page?.content || []] as const;
        } catch {
          return [ins.id, []] as const;
        }
      }));
      setTopCoursesByInstructor(Object.fromEntries(entries));
    } finally {
      setLoadingTop(false);
    }
  };

  const [slides, setSlides] = useState<Array<{ id: string; title: string; subtitle: string; backgroundImage?: string; gradientDirection?: 'left'|'right'|'top'|'bottom' }>>([]);

  const hasKeyword = q.trim().length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            {/* Hero Slider */}
            <HeroSlider slides={slides} autoPlay={true} autoPlayInterval={5000} />
          </div>
          <div className="lg:col-span-1">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="relative flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
                <FiSearch className="absolute left-3 sm:left-4 text-gray-400 text-lg sm:text-xl" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses, instructors, or topics..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-full text-sm sm:text-base focus:outline-none"
                />
              </div>
            </div>
            {/* Browse by topics */}
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Browse by topics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2">
                {(tags || []).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTag(t); setQ(''); setCoursePage(null); loadCourses({ tagId: String(t.id), page:0, size:12 }); }}
                    className={`border rounded px-2 py-1.5 sm:py-2 text-xs text-center transition ${selectedTag?.id === t.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
        {/* Search Results (if any) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {!loading && !selectedTag && hasKeyword && (
          <>
            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Search Results</h3>
            {(coursePage && coursePage.content && coursePage.content.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-10">
                {coursePage.content.map((c) => (
                  <div key={c.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative w-full h-40 bg-gray-100">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📚</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                      <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                        <span>{c.courseType || 'N/A'}</span>
                        {typeof c.price === 'number' && <span className="font-semibold text-gray-900">${c.price}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600 pb-10">Không có dữ liệu</div>
            )}
          </>
        )}
      </div>

      {/* Courses by topic */}
      {selectedTag && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-medium text-gray-900">Courses for {selectedTag.name}</h3>
            <button className="text-xs text-blue-600 hover:underline" onClick={() => { setSelectedTag(null); setCoursePage(null); loadCourses({ sort: 'new', page:0, size:12 }); }}>Clear</button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-600 pb-10">Loading...</div>
          ) : (coursePage && coursePage.content && coursePage.content.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-10">
              {coursePage.content.map((c) => (
                <div key={c.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative w-full h-40 bg-gray-100">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">📚</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                    <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                      <span>{c.courseType || 'N/A'}</span>
                      {typeof c.price === 'number' && <span className="font-semibold text-gray-900">${c.price}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600 pb-10">Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Popular Courses */}
      {!selectedTag && !hasKeyword && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Popular Courses</h3>
        {popularPage && popularPage.content && popularPage.content.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-10">
            {popularPage.content.map((c) => (
              <div key={c.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative w-full h-40 bg-gray-100">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">📚</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                    <span>{c.courseType || 'N/A'}</span>
                    {typeof c.price === 'number' && <span className="font-semibold text-gray-900">${c.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* New Releases */}
      {!selectedTag && !hasKeyword && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">New Releases</h3>
        {!loading && coursePage && coursePage.content && coursePage.content.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-10">
            {coursePage.content.map((c) => (
              <div key={c.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative w-full h-40 bg-gray-100">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">📚</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                    <span>{c.courseType || 'N/A'}</span>
                    {typeof c.price === 'number' && <span className="font-semibold text-gray-900">${c.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* More courses by instructors */}
      {!selectedTag && !hasKeyword && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          {loadingTop && (<div className="text-sm text-gray-600">Loading top instructors...</div>)}
          {!loadingTop && (topInstructors || []).length === 0 && (
            <div className="text-sm text-gray-600">No data</div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {(topInstructors || []).map((ins) => {
              return (
              <div key={ins.id} className="rounded-xl p-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">More courses by {ins.name}</h3>
                <div className="grid grid-cols-4 gap-4 sm:gap-6">
                  {(topCoursesByInstructor[ins.id] || []).slice(0,3).map((c) => (
                    <div key={c.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                      <div className="relative w-full h-40 bg-gray-100">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📚</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{c.title}</h3>
                        <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                          <span>{c.courseType || 'N/A'}</span>
                          {typeof c.price === 'number' && <span className="font-semibold text-gray-900">${c.price}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

    

    </div>
  );
};

export default SearchSection;

