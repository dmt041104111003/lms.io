import apiRequest from '@/lib/api';

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

export const enrollmentService = {
  async getPaymentHistoryByUser(userId: string): Promise<PaymentHistoryItem[]> {
    return apiRequest<PaymentHistoryItem[]>(`/api/enrollment/payment-history/user/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
};

export default enrollmentService;
