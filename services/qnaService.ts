export interface LectureQnaResponse {
  id: number;
  content: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  userImageUrl?: string;
  likeCount: number;
  replies: LectureQnaResponse[];
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';

export async function listQna(lectureId: number): Promise<LectureQnaResponse[]> {
  const res = await fetch(`${BASE}/api/lectures/${lectureId}/qna`, { credentials: 'include' });
  const data = await res.json();
  if (data?.code === 1000 && Array.isArray(data?.result)) return data.result as LectureQnaResponse[];
  throw new Error(data?.message || 'Failed to load Q&A');
}

export async function createQuestion(lectureId: number, content: string): Promise<LectureQnaResponse> {
  const res = await fetch(`${BASE}/api/lectures/${lectureId}/qna`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as LectureQnaResponse;
  throw new Error(data?.message || 'Failed to create question');
}

export async function reply(commentId: number, content: string) {
  const res = await fetch(`${BASE}/api/lectures/comments/${commentId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result;
  throw new Error(data?.message || 'Failed to reply');
}

export async function updateComment(commentId: number, content: string): Promise<LectureQnaResponse> {
  const res = await fetch(`${BASE}/api/lectures/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as LectureQnaResponse;
  throw new Error(data?.message || 'Failed to update comment');
}

export async function deleteComment(commentId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/lectures/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (data?.code === 1000) return;
  throw new Error(data?.message || 'Failed to delete comment');
}

export async function likeComment(commentId: number): Promise<LectureQnaResponse> {
  const res = await fetch(`${BASE}/api/lectures/comments/${commentId}/like`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as LectureQnaResponse;
  throw new Error(data?.message || 'Failed to like');
}

export async function unlikeComment(commentId: number): Promise<LectureQnaResponse> {
  const res = await fetch(`${BASE}/api/lectures/comments/${commentId}/unlike`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as LectureQnaResponse;
  throw new Error(data?.message || 'Failed to unlike');
}
