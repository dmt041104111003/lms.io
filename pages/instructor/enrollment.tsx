import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { courseService, CourseSummaryResponse } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import UserSearch from '@/components/UserSearch';
import { UserResponse } from '@/services/authService';

const EnrollmentManagement: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();
  const [courses, setCourses] = useState<CourseSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseSummaryResponse | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [newUserId, setNewUserId] = useState('');

  const handleUserSelect = (user: UserResponse) => {
    setSelectedUser(user);
    setNewUserId(user.id);
  };

  const fetchEnrolledUsers = useCallback(async (courseId: string) => {
    try {
      setLoadingEnrolled(true);
      const enrolledData = await enrollmentService.getEnrolledByCourse(courseId);
      console.log('Enrolled data from API:', enrolledData);
      setEnrolledUsers(enrolledData.enrolled || []);
    } catch (error: any) {
      console.error('Error fetching enrolled users:', error);
      showError('Failed to load enrolled users');
    } finally {
      setLoadingEnrolled(false);
    }
  }, [showError]);

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    if (!user) return;
    
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getMyCoursesAll();
        setCourses(coursesData);
        
        // Auto-select first course if available
        if (coursesData.length > 0) {
          const firstCourse = coursesData[0];
          setSelectedCourse(firstCourse);
          fetchEnrolledUsers(firstCourse.id);
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        showError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, showError]);

  const handleCourseSelect = (course: CourseSummaryResponse) => {
    console.log('Selected course:', course); // Debug log
    setSelectedCourse(course);
    if (course.id) {
      fetchEnrolledUsers(course.id);
    }
  };

  

  const handleAddUser = async () => {
    if (!newUserId.trim() || !selectedCourse) {
      showError('Please select a user and a course');
      return;
    }

    try {
      await enrollmentService.setEnrollByInstructor(newUserId.trim(), selectedCourse.id);
      setNewUserId('');
      setSelectedUser(null);
      fetchEnrolledUsers(selectedCourse.id);
      showSuccess('User enrolled successfully');
    } catch (error: any) {
      console.error('Error enrolling user:', error);
      showError('Failed to enroll user');
    }
  };

  const handleRemoveUser = async (enrolledId: number) => {
    if (!selectedCourse) return;

    try {
      await enrollmentService.deleteEnrollment(enrolledId, selectedCourse.id);
      fetchEnrolledUsers(selectedCourse.id);
      showSuccess('User removed successfully');
    } catch (error: any) {
      console.error('Error removing user:', error);
      showError('Failed to remove user');
    }
  };

  if (loading) {
    return (
      <InstructorGuard>
        <SEO
          title="Enrollment Management - Cardano2VN LMS Instructor"
          description="Manage student enrollments and track progress across all your courses."
        />
        <InstructorLayout>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
                <p className="text-gray-600 mt-1">Manage student enrollments and track progress</p>
              </div>
            </div>

            {/* Loading */}
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          </div>
        </InstructorLayout>
      </InstructorGuard>
    );
  }

  return (
    <InstructorGuard>
      <SEO
        title="Enrollment Management - Cardano2VN LMS Instructor"
        description="Manage student enrollments and track progress across all your courses."
      />
      <InstructorLayout>
        <div className="space-y-6 ">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
              <p className="text-gray-600 mt-1">Manage student enrollments and track progress</p>
            </div>
          </div>

          {/* Two Cards in one row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Selection Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Selection</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a course to manage enrollments
                    </label>
                    <select
                      id="course-select"
                      value={selectedCourse?.id || ''}
                      onChange={(e) => {
                        const course = courses.find(c => c.id === e.target.value);
                        if (course) {
                          handleCourseSelect(course);
                        }
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Info Card - appears when course is selected */}
                  {selectedCourse && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedCourse.imageUrl || '/images/course-placeholder.jpg'}
                          alt={selectedCourse.title}
                          className="w-28 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{selectedCourse.title}</h4>
                          <p className="text-gray-600 text-sm">{selectedCourse.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCourse.totalEnrollments} students enrolled
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Add User Card - only show when course is selected */}
            {selectedCourse && (
              <Card>
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
                    <div className="space-y-3">
                      <UserSearch 
                        onUserSelect={handleUserSelect}
                        placeholder="Search users by name or email..."
                      />
                      
                      {/* Show selected user */}
                      {selectedUser && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {selectedUser.imageUrl && (
                            <img
                              src={selectedUser.imageUrl}
                              alt={selectedUser.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedUser.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedUser.email}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedUser(null);
                              setNewUserId('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Fixed Bottom Button */}
                  <div className="p-6 bg-white">
                    <Button
                      onClick={handleAddUser}
                      className="w-full"
                      disabled={!selectedUser}
                    >
                      Add User
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Enrolled Users Table */}
          {selectedCourse && (
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Enrolled Users ({enrolledUsers.length})
                </h3>
              </div>
              
              {loadingEnrolled ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading enrolled users...</p>
                </div>
              ) : enrolledUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No users enrolled in this course yet.
                </div>
              ) : (
                <div>
                  <table className="min-w-full table-fixed border border-gray-200 divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr className="divide-x divide-gray-200">
                        <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Date
                        </th>
                         <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrolledUsers.map((enrolled) => (
                        <tr key={enrolled.enrolledId} className="divide-x divide-gray-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {enrolled.userName || 'N/A'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-900">
                            {enrolled.enrollAt 
                              ? new Date(enrolled.enrollAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border  ${
                              enrolled.totalLecturesAndTestsCompleted === enrolled.totalLecturesAndTests && enrolled.totalLecturesAndTests > 0
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {enrolled.totalLecturesAndTestsCompleted === enrolled.totalLecturesAndTests && enrolled.totalLecturesAndTests > 0
                                ? 'Completed'
                                : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${enrolled.totalLecturesAndTests > 0 
                                      ? Math.round((enrolled.totalLecturesAndTestsCompleted / enrolled.totalLecturesAndTests) * 100) 
                                      : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-600">
                                {enrolled.totalLecturesAndTestsCompleted}/{enrolled.totalLecturesAndTests} ({enrolled.totalLecturesAndTests > 0 
                                  ? Math.round((enrolled.totalLecturesAndTestsCompleted / enrolled.totalLecturesAndTests) * 100) 
                                  : 0}%)
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Dropdown
                              options={[
                                {
                                  label: 'View detail',
                                  value: 'view',
                                  className: 'text-blue-600',
                                  onClick: () => router.push(`/instructor/enrollment/${enrolled.enrolledId}`),
                                },
                                {
                                  label: 'Delete',
                                  value: 'delete',
                                  onClick: () => handleRemoveUser(enrolled.enrolledId),
                                  className: 'text-red-600',
                                }
                              ]}
                              placeholder="Actions"
                              className="w-full max-w-32"
                              buttonClassName="text-xs w-full"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {courses.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <div className="text-gray-600">No courses found</div>
              <p className="text-gray-500 mt-2">You haven't created any courses yet.</p>
              <Button
                onClick={() => router.push('/instructor/course/create')}
                className="mt-4"
              >
                Create Your First Course
              </Button>
            </Card>
          )}
        </div>
      </InstructorLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </InstructorGuard>
  );
};

export default EnrollmentManagement;
