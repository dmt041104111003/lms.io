import React, { useState } from 'react';
import { useRouter } from 'next/router';
import InstructorGuard from '@/components/instructor/InstructorGuard';
import InstructorLayout from '@/components/instructor/InstructorLayout';
import SEO from '@/components/ui/SEO';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { mintCertificate } from '@/services/certificateService';

const MintCertificatePage: React.FC = () => {
  const router = useRouter();
  const { enrolledId } = router.query as { enrolledId?: string };

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setMessage(null);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async () => {
    if (!enrolledId) return;
    if (!file) {
      setError('Please choose an image file');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await mintCertificate(Number(enrolledId), file);
      setMessage('Mint certificate success');
    } catch (e: any) {
      setError(e?.message || 'Mint certificate failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorGuard>
      <SEO title="Mint Certificate" />
      <InstructorLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 space-y-4">
            <h1 className="text-lg font-semibold text-gray-900">Mint Certificate</h1>
            <div className="text-sm text-gray-600">Upload the certificate image and submit to mint NFT.</div>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="block w-full text-sm text-gray-700"
              />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="preview" className="max-h-64 rounded border" />
                </div>
              )}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-600">{message}</div>}

            <div className="flex gap-3">
              <Button onClick={onSubmit} disabled={loading || !file} className="bg-blue-600 text-white hover:bg-blue-700">
                {loading ? 'Minting...' : 'Mint Certificate'}
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </Card>
        </div>
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default MintCertificatePage;
