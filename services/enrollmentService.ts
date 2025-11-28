import apiRequest from "@/lib/api";

export interface PaymentHistoryItem {
  enrolledAt: string;
  completed: boolean;
  coursePaymentMethodName: string;
  status: string;
  orderId: string;
  price: number;
  courseTitle: string;
  imageUrl?: string;
}

export interface ProgressLectureResponse {
  id: number;
  title: string;
  orderIndex: number;
  resourceUrl?: string;
  duration?: number;
}

export interface ProgressTestResponse {
  id: number;
  title: string;
  orderIndex?: number;
}

export interface ProgressChapterResponse {
  id: number;
  title: string;
  orderIndex?: number;
  lectures: ProgressLectureResponse[];
  tests: ProgressTestResponse[];
}

export interface TestAndLectureCompletedResponse {
  id: number;
  type: "lecture" | "test" | string;
  score?: number;
  completedAt?: string;
  completed?: boolean;
  contentId?: number;
  currentTime?: number;
  duration?: number;
}

export interface ProgressResponse {
  id: string;
  title: string;
  imageUrl?: string;
  completed: boolean;
  instructorName?: string;
  fullName?: string;
  avatar?: string;
  chapters: ProgressChapterResponse[];
  courseTests: ProgressTestResponse[];
  testAndLectureCompleted: TestAndLectureCompletedResponse[];
}

export const enrollmentService = {
  async getPaymentHistoryByUser(userId: string): Promise<PaymentHistoryItem[]> {
    return apiRequest<PaymentHistoryItem[]>(
      `/api/enrollment/payment-history/user/${encodeURIComponent(userId)}`,
      {
        method: "GET",
      }
    );
  },

  async getEnrolledByCourse(courseId: string): Promise<any> {
    return apiRequest<any>(`/api/course/${courseId}/enrolled`, {
      method: "GET",
    });
  },

  async setEnrollByInstructor(userId: string, courseId: string): Promise<any> {
    return apiRequest<any>(
      `/api/enrollment/course/${courseId}/user/${userId}/set-enroll`,
      {
        method: "POST",
      }
    );
  },

  async deleteEnrollment(enrolledId: number, courseId: string): Promise<void> {
    return apiRequest<void>(
      `/api/enrollment/delete/${enrolledId}?courseId=${courseId}`,
      {
        method: "DELETE",
      }
    );
  },

  async getEnrollmentProgress(enrolledId: number): Promise<ProgressResponse> {
    return apiRequest<ProgressResponse>(`/api/enrollment/${enrolledId}`, {
      method: "GET",
    });
  },
};

export default enrollmentService;
