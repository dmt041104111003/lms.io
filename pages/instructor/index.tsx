import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import instructorService, { CourseDashboardResponse } from '@/services/instructorService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import { BarChart3, Users, DollarSign, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [dashboardData, setDashboardData] = useState<CourseDashboardResponse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDashboardResponse | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editExpertise, setEditExpertise] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLinks, setEditLinks] = useState<Array<{ id?: number; name: string; url: string }>>([]);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        console.log('Instructor profile:', profile);
        
        if (profile?.id) {
          const data = await instructorService.getEducatorDashboard(profile.id);
          console.log('Dashboard data:', data);
          console.log('First course enrollments:', data?.[0]?.enrollments);
          
          const mappedData = (data || []).map((course) => {
            const enrollments = (course as any).enrollments || course.enrollments || [];
            console.log(`Course ${course.id} - Raw course:`, course);
            console.log(`Course ${course.id} enrollments:`, enrollments);
            console.log(`Course ${course.id} enrollments type:`, typeof enrollments, Array.isArray(enrollments));
            
            const uniqueUsers = new Set(enrollments.map((e: any) => e?.user?.id || e?.user?.Id).filter(Boolean));
            const totalRevenue = enrollments.reduce((sum: number, e: any) => {
              const price = e?.price || 0;
              return sum + (price > 0 ? price : 0);
            }, 0);
            
            return {
              ...course,
              courseId: course.id,
              courseTitle: course.title,
              totalStudents: uniqueUsers.size,
              revenue: totalRevenue,
              totalEnrollments: enrollments.length,
            };
          });
          
          console.log('Mapped data:', mappedData);
          setDashboardData(mappedData);
        } else {
          console.warn('No instructor profile found for user:', user.id);
          showError('No instructor profile found');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        showError('Failed to load dashboard data');
        setDashboardData([]);
      }
    };

    fetchDashboard();
  }, [user, showError]);

  const totalStudents = dashboardData.reduce((sum, course) => sum + (course.totalStudents || 0), 0);
  const totalRevenue = dashboardData.reduce((sum, course) => sum + (course.revenue || 0), 0);
  const totalEnrollments = dashboardData.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0);
  const totalCourses = dashboardData.length;

  return (
    <InstructorGuard>
      <SEO
        title="Instructor Dashboard - lms.cardano2vn.io"
        description="Manage your courses, track student progress, and view analytics in your instructor dashboard."
        keywords="instructor, dashboard, course management, Cardano LMS instructor"
        url="/instructor"
        noindex={true}
        nofollow={true}
      />
      <InstructorLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h2>
            </div>
            <p className="text-gray-600">Manage your courses, track student progress, and view analytics</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Courses</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{totalCourses}</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Students</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Enrollments</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{totalEnrollments}</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">${totalRevenue.toFixed(2)}</div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="text-yellow-600" size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/instructor/courses')}
                variant="primary"
                size="sm"
                className="flex items-center justify-center gap-2"
              >
                <BookOpen size={16} />
                Manage Courses
              </Button>
              <Button
                onClick={async () => {
                  if (!user?.id) return;
                  try {
                    const profile = await instructorService.getInstructorProfileByUserId(user.id);
                    if (!profile?.id) {
                      showError('No instructor profile found');
                      return;
                    }
                    setInstructorId(profile.id as any);
                    setEditName(profile.name || '');
                    setEditExpertise(profile.expertise || '');
                    setEditBio(profile.bio || '');
                    setEditLinks((profile.socialLinks || []).map(l => ({ id: l.id as any, name: l.name || (l as any).platform || '', url: l.url })));
                    setEditAvatarFile(null);
                    setEditOpen(true);
                  } catch (e: any) {
                    showError(e?.message || 'Failed to load instructor profile');
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2"
              >
                <Users size={16} />
                Edit Profile
              </Button>
              <Button
                onClick={() => router.push('/instructor/courses/create')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2"
              >
                <BookOpen size={16} />
                Create New Course
              </Button>
            </div>
          </Card>

          {/* Course Statistics */}
          {dashboardData.length > 0 && (
            <Card className="p-6 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Course Statistics</h3>
              </div>
              <div className="space-y-4">
                {dashboardData.slice(0, 5).map((course) => (
                  <div key={course.courseId} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate mb-2">{course.courseTitle}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            {course.totalStudents || 0} students
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} />
                            ${(course.revenue || 0).toFixed(2)} revenue
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedCourse(course)}
                        variant="outline"
                        size="sm"
                        className="ml-4 flex items-center gap-1"
                      >
                        <Clock size={14} />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {dashboardData.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-gray-600 mb-4">No courses yet</div>
              <Button
                onClick={() => router.push('/instructor/courses/create')}
                variant="primary"
                size="sm"
              >
                Create Your First Course
              </Button>
            </Card>
          )}
        </div>
        
        {/* Course Details Dialog */}
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50" onClick={() => setSelectedCourse(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedCourse.courseTitle}</h3>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close dialog"
                    title="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total Students</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">{selectedCourse.totalStudents || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total Enrollments</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">{selectedCourse.totalEnrollments || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">${(selectedCourse.revenue || 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Course ID</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1 break-all">{selectedCourse.courseId || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCourse(null)}
                    size="sm"
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!selectedCourse.courseId) {
                        showError('Course ID is missing');
                        return;
                      }
                      setSelectedCourse(null);
                      router.push(`/instructor/courses/${selectedCourse.courseId}`);
                    }}
                    size="sm"
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {editOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center" onClick={() => !savingProfile && setEditOpen(false)}>
            <div className="bg-white rounded-lg w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-lg font-semibold text-gray-900 mb-4">Edit Instructor Profile</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Expertise</label>
                  <input value={editExpertise} onChange={(e) => setEditExpertise(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Avatar</label>
                  <input type="file" accept="image/*" onChange={(e) => setEditAvatarFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-700">Social Links</label>
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setEditLinks([...editLinks, { name: '', url: '' }])}
                    >
                      Add link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editLinks.map((l, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2">
                        <input
                          placeholder="Name"
                          value={l.name}
                          onChange={(e) => setEditLinks(editLinks.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                          className="col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <input
                          placeholder="URL"
                          value={l.url}
                          onChange={(e) => setEditLinks(editLinks.map((x, i) => i === idx ? { ...x, url: e.target.value } : x))}
                          className="col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => !savingProfile && setEditOpen(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={async () => {
                    if (!instructorId) return;
                    try {
                      setSavingProfile(true);
                      const payload: any = {
                        name: editName || undefined,
                        expertise: editExpertise || undefined,
                        bio: editBio || undefined,
                        socialLinks: editLinks.filter(x => x.name && x.url).map(x => ({ name: x.name, url: x.url })),
                      };
                      await instructorService.updateInstructorProfile(instructorId as any, payload, editAvatarFile || undefined);
                      setEditOpen(false);
                      success('Profile updated');
                    } catch (e: any) {
                      showError(e?.message || 'Failed to update profile');
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorDashboard;

