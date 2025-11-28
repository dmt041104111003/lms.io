import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface CourseSummaryResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  courseType: string;
  totalTime: string;
  totalEnrollments: number;
  rating: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: number;
    name: string;
    avatar: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}

export const courseService = {
  // Get all courses for current educator
  getMyCoursesAll: async (): Promise<CourseSummaryResponse[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/course/profile/me/public`, {
        withCredentials: true,
      });
      return response.data.result || [];
      console.log(response.data.result);
    } catch (error) {
      console.error('Error fetching my courses:', error);
      throw error;
    }
  },

  // Get paginated courses for current educator (for Course Management page)
  getMyCoursesAllPaginated: async (page: number = 0, size: number = 10): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/course/profile/me/all`, {
        params: { page, size },
        withCredentials: true,
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching paginated courses:', error);
      throw error;
    }
  },

  // Get short information courses for profile
  getAllCourseShortInformation: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/course/short/profile/me`, {
        withCredentials: true,
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching course short information:', error);
      throw error;
    }
  },

  // Get paginated courses for current educator (existing method)
  getMyCourses: async (page: number = 0, size: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/course/profile/me/all`, {
        params: { page, size },
        withCredentials: true,
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching my courses:', error);
      throw error;
    }
  },
};
