import apiRequest from '@/lib/api';

export type NotificationType = 'FEEDBACK' | 'PROGRESS' | 'CERTIFICATE' | 'SYSTEM' | 'OTHER';

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  userId: string;
}

export const notificationService = {
  async getByUserId(userId: string): Promise<NotificationResponse[]> {
    return apiRequest<NotificationResponse[]>(`/api/notifications/user/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    return apiRequest<NotificationResponse>(`/api/notifications/${notificationId}/markAsRead`, {
      method: 'PUT',
    });
  },
};

export default notificationService;
