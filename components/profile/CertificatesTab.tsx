import React, { useEffect, useState } from 'react';
import { CertificateResponse, getCertificatesByUser } from '@/services/certificateService';

interface CertificatesTabProps {
  userId: string;
}

const CertificatesTab: React.FC<CertificatesTabProps> = ({ userId }) => {
  const [items, setItems] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCertificatesByUser(userId);
        if (mounted) setItems(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load certificates');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (userId) load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">My certificate</h2>

        {loading && (
          <div className="py-3 text-sm text-gray-600">Loading...</div>
        )}
        {error && (
          <div className="py-3 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-3 text-sm text-gray-600">You don't have any certificates yet.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => (
              <div key={c.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {c.imgUrl && (
                  <img src={c.imgUrl} alt={c.courseTitle || c.assetName || 'Certificate'} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{c.courseTitle || c.name || 'Certificate'}</div>
                  {c.issuedAt && (
                    <div className="text-xs text-gray-500">Issued: {new Date(c.issuedAt).toLocaleDateString()}</div>
                  )}
                  {c.assetName && (
                    <div className="text-xs text-gray-500 truncate">Asset: {c.assetName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesTab;
