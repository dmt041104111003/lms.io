import React, { useEffect, useState } from 'react';
import enrollmentService, { type PaymentHistoryItem } from '@/services/enrollmentService';

interface PaymentHistoryTabProps {
  userId: string;
}

const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ userId }) => {
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await enrollmentService.getPaymentHistoryByUser(userId);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load payment history');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (userId) load();
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment history</h2>

        {loading && (
          <div className="py-3 text-sm text-gray-600">Loading...</div>
        )}
        {!loading && error && (
          <div className="py-3 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="py-3 text-sm text-gray-600">No payments found.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Course</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.orderId} className="border-t border-gray-100">
                    <td className="py-2 pr-4 align-top">{new Date(it.enrolledAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 align-top flex items-center gap-3">
                      {it.imageUrl && (
                        <img src={it.imageUrl} alt={it.courseTitle} className="w-10 h-10 rounded object-cover" />
                      )}
                      <span className="text-gray-900">{it.courseTitle}</span>
                    </td>
                    <td className="py-2 pr-4 align-top">{it.coursePaymentMethodName}</td>
                    <td className="py-2 pr-4 align-top">
                      <span className="inline-block rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-700">
                        {it.status}
                      </span>
                    </td>
                    <td className="py-2 pl-4 align-top text-right">{it.price?.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryTab;
