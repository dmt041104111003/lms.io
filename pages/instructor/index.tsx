import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import instructorService, { CourseDashboardResponse } from '@/services/instructorService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

const InstructorDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();
  const [dashboardData, setDashboardData] = useState<CourseDashboardResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await instructorService.getInstructorProfileByUserId(user.id);
        if (profile?.id) {
          const data = await instructorService.getEducatorDashboard(profile.id);
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const totalStudents = dashboardData.reduce((sum, course) => sum + course.totalStudents, 0);
  const totalRevenue = dashboardData.reduce((sum, course) => sum + course.revenue, 0);
  const totalEnrollments = dashboardData.reduce((sum, course) => sum + course.totalEnrollments, 0);
  const totalCourses = dashboardData.length;

  return (
    <InstructorGuard>
      <InstructorLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Overview of your courses and students</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600">Total Courses</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totalCourses}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totalStudents}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">Total Enrollments</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totalEnrollments}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push('/instructor/courses')}
                variant="primary"
                size="sm"
              >
                Manage Courses
              </Button>
              <Button
                onClick={() => router.push('/instructor/courses/create')}
                variant="outline"
                size="sm"
              >
                Create New Course
              </Button>
            </div>
          </Card>

          {/* Course Statistics */}
          {dashboardData.length > 0 && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
              <div className="space-y-3">
                {dashboardData.map((course) => (
                  <div key={course.courseId} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{course.courseTitle}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {course.totalStudents} students • ${course.revenue.toFixed(2)} revenue
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/instructor/courses/${course.courseId}`)}
                        variant="outline"
                        size="sm"
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {loading && (
            <Card className="p-12 text-center">
              <div className="text-gray-600">Loading dashboard...</div>
            </Card>
          )}

          {!loading && dashboardData.length === 0 && (
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
        
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default InstructorDashboard;

