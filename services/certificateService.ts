export interface CertificateResponse {
  id: number;
  certificateNumber?: string;
  issuedAt: string;
  imgUrl?: string;
  assetName?: string;
  enrollmentId?: number;
  userId?: string;
  name?: string;
  courseId?: number;
  courseTitle?: string;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';

export async function mintCertificate(enrollmentId: number, file: File): Promise<CertificateResponse> {
  const url = `${BASE}/api/certificates/mint`;
  const form = new FormData();
  form.append('enrollmentId', String(enrollmentId));
  form.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  const data = await res.json();
  if (data?.code === 1000 && data?.result) {
    return data.result as CertificateResponse;
  }
  throw new Error(data?.message || 'Mint certificate failed');
}

export async function getCertificatesByUser(userId: string): Promise<CertificateResponse[]> {
  const url = `${BASE}/api/certificates/user/${userId}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  if (data?.code === 1000 && Array.isArray(data?.result)) {
    return data.result as CertificateResponse[];
  }
  throw new Error(data?.message || 'Failed to fetch certificates');
}
