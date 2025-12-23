import React, { useEffect, useMemo, useState } from 'react';
import {
  LectureQnaResponse,
  listQna,
  createQuestion,
  reply as replyApi,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '@/services/qnaService';

interface QnaPanelProps {
  lectureId?: number;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const QnaPanel: React.FC<QnaPanelProps> = ({ lectureId, open, onClose, currentUserId }) => {
  const [items, setItems] = useState<LectureQnaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const canInteract = useMemo(() => !!currentUserId && !!lectureId, [currentUserId, lectureId]);

  const load = async () => {
    if (!open || !lectureId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listQna(lectureId);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load Q&A');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lectureId]);

  const handlePost = async () => {
    if (!lectureId || !newContent.trim()) return;
    const res = await createQuestion(lectureId, newContent.trim());
    setItems((prev) => [res, ...prev]);
    setNewContent('');
  };

  const handleLikeToggle = async (commentId: number) => {
    const hasLiked = liked.has(commentId);
    try {
      const res = hasLiked ? await unlikeComment(commentId) : await likeComment(commentId);
      setItems((prev) => updateNode(prev, res));
      const next = new Set(liked);
      if (hasLiked) next.delete(commentId);
      else next.add(commentId);
      setLiked(next);
    } catch {}
  };

  const handleReply = async (commentId: number, content: string) => {
    if (!content.trim()) return;
    const res = await replyApi(commentId, content.trim());
    // reply API trả về reply đơn lẻ -> reload nhanh cây
    await load();
  };

  const handleUpdate = async (commentId: number, content: string) => {
    const res = await updateComment(commentId, content);
    setItems((prev) => updateNode(prev, res));
  };

  const handleDelete = async (commentId: number) => {
    // optimistic UI: mark as deleted immediately
    setItems((prev) => markDeleted(prev, commentId));
    try {
      await deleteComment(commentId);
      // confirm by reloading latest tree
      await load();
    } catch {
      // fallback reload in case of error
      await load();
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-xl transition-transform duration-300 overflow-y-auto ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Hỏi đáp</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <textarea
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={canInteract ? 'Nhập bình luận mới của bạn' : 'Bạn cần đăng nhập/đang học để bình luận'}
              disabled={!canInteract}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handlePost}
                disabled={!canInteract || !newContent.trim()}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
              >
                Đăng bình luận
              </button>
            </div>
          </div>

          {loading && <div className="text-sm text-gray-500">Đang tải bình luận...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="space-y-4">
              {items.map((c) => (
                <QnaItem
                  key={c.id}
                  node={c}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onLikeToggle={handleLikeToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function updateNode(list: LectureQnaResponse[], updated: LectureQnaResponse): LectureQnaResponse[] {
  const dfs = (nodes: LectureQnaResponse[]): LectureQnaResponse[] =>
    nodes.map((n) => {
      if (n.id === updated.id) return { ...updated };
      if (n.replies && n.replies.length) return { ...n, replies: dfs(n.replies) };
      return n;
    });
  return dfs(list);
}

function markDeleted(list: LectureQnaResponse[], id: number): LectureQnaResponse[] {
  const dfs = (nodes: LectureQnaResponse[]): LectureQnaResponse[] =>
    nodes.map((n) => {
      if (n.id === id) return { ...n, content: '' };
      if (n.replies && n.replies.length) return { ...n, replies: dfs(n.replies) };
      return n;
    });
  return dfs(list);
}

const QnaItem: React.FC<{
  node: LectureQnaResponse;
  currentUserId?: string;
  onReply: (commentId: number, content: string) => void;
  onLikeToggle: (commentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
}> = ({ node, currentUserId, onReply, onLikeToggle, onUpdate, onDelete }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.content || '');
  const isDeleted = !((node.content || '').trim());

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
          {node.userName?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">{node.userName || 'Người dùng'}</div>
            <div className="text-xs text-gray-500">{new Date(node.createdAt).toLocaleString()}</div>
          </div>
          {!editing ? (
            <p className={`text-sm whitespace-pre-wrap mt-1 ${isDeleted ? 'text-gray-400 italic' : 'text-gray-800'}`}>
              {isDeleted ? 'Bình luận đã bị xóa' : node.content}
            </p>
          ) : (
            <div className="mt-1">
              <textarea className="w-full border rounded p-2 text-sm" value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => { onUpdate(node.id, editText); setEditing(false); }}>Lưu</button>
                <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
            <button className="hover:text-blue-600 disabled:text-gray-400" disabled={isDeleted} onClick={() => onLikeToggle(node.id)}>Thích ({node.likeCount})</button>
            <button className="hover:text-blue-600 disabled:text-gray-400" disabled={isDeleted} onClick={() => setShowReply((s) => !s)}>Phản hồi</button>
            {currentUserId && currentUserId === node.userId && !editing && !isDeleted && (
              <>
                <button className="hover:text-blue-600" onClick={() => setEditing(true)}>Chỉnh sửa</button>
                <button className="hover:text-red-600" onClick={() => onDelete(node.id)}>Xóa</button>
              </>
            )}
          </div>

          {showReply && (
            <div className="mt-2">
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={2}
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => { onReply(node.id, replyText); setReplyText(''); setShowReply(false); }}>Gửi</button>
                <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => setShowReply(false)}>Hủy</button>
              </div>
            </div>
          )}

          {node.replies && node.replies.length > 0 && (
            <RepliesFlat
              parent={node}
              currentUserId={currentUserId}
              onReply={onReply}
              onLikeToggle={onLikeToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const RepliesFlat: React.FC<{
  parent: LectureQnaResponse;
  currentUserId?: string;
  onReply: (commentId: number, content: string) => void;
  onLikeToggle: (commentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
}> = ({ parent, currentUserId, onReply, onLikeToggle, onUpdate, onDelete }) => {
  const flat = React.useMemo(() => {
    const out: LectureQnaResponse[] = [];
    const dfs = (list: LectureQnaResponse[]) => {
      list?.forEach((n) => {
        out.push(n);
        if (n.replies && n.replies.length) dfs(n.replies);
      });
    };
    dfs(parent.replies || []);
    return out.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [parent.replies]);

  return (
    <div className="mt-3 space-y-3 pl-4 border-l">
      {flat.map((child) => (
        <ReplyRow
          key={child.id}
          node={child}
          currentUserId={currentUserId}
          onReply={onReply}
          onLikeToggle={onLikeToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const ReplyRow: React.FC<{
  node: LectureQnaResponse;
  currentUserId?: string;
  onReply: (commentId: number, content: string) => void;
  onLikeToggle: (commentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
}> = ({ node, currentUserId, onReply, onLikeToggle, onUpdate, onDelete }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.content || '');
  const isDeleted = !((node.content || '').trim());

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
          {node.userName?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">{node.userName || 'Người dùng'}</div>
            <div className="text-xs text-gray-500">{new Date(node.createdAt).toLocaleString()}</div>
          </div>
          {!editing ? (
            <p className={`text-sm whitespace-pre-wrap mt-1 ${isDeleted ? 'text-gray-400 italic' : 'text-gray-800'}`}>
              {isDeleted ? 'Bình luận đã bị xóa' : node.content}
            </p>
          ) : (
            <div className="mt-1">
              <textarea className="w-full border rounded p-2 text-sm" value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => { onUpdate(node.id, editText); setEditing(false); }}>Lưu</button>
                <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
            <button className="hover:text-blue-600 disabled:text-gray-400" disabled={isDeleted} onClick={() => onLikeToggle(node.id)}>Thích ({node.likeCount})</button>
            <button className="hover:text-blue-600 disabled:text-gray-400" disabled={isDeleted} onClick={() => setShowReply((s) => !s)}>Phản hồi</button>
            {currentUserId && currentUserId === node.userId && !editing && !isDeleted && (
              <>
                <button className="hover:text-blue-600" onClick={() => setEditing(true)}>Chỉnh sửa</button>
                <button className="hover:text-red-600" onClick={() => onDelete(node.id)}>Xóa</button>
              </>
            )}
          </div>

          {showReply && (
            <div className="mt-2">
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={2}
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => { onReply(node.id, replyText); setReplyText(''); setShowReply(false); }}>Gửi</button>
                <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => setShowReply(false)}>Hủy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QnaPanel;
