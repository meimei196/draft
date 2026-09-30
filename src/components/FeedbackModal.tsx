import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, AlertCircle, Trash2, Lock, Unlock, Eye, Clock, Image as ImageIcon, Camera } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Client-side on-the-fly image compression using canvas
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG with 0.5 quality to keep payload ultra-tiny (15kb - 40kb) for lightning-fast uploads
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'admin_login' | 'admin_inbox'>('submit');
  const [content, setContent] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image attachments
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox for full screen admin view
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Admin Inbox Data
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setError('');
      setSuccess(false);
      setAdminPassword('');
      setActiveTab('submit');
      setAttachedImage(null);
      setLightboxImage(null);
    }
  }, [isOpen]);

  const loadFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    setError('');
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFeedbacks(list);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải hộp thư. Vui lòng kiểm tra cấu hình Firebase.');
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ chọn tệp hình ảnh (.png, .jpg, .jpeg, .webp).');
      return;
    }

    setIsCompressing(true);
    setError('');
    try {
      const compressedBase64 = await compressImage(file);
      setAttachedImage(compressedBase64);
    } catch (err) {
      console.error(err);
      setError('Nén ảnh thất bại. Thử lại với ảnh khác nhé.');
    } finally {
      setIsCompressing(false);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError('');

    const payload: any = {
      content: content.trim(),
      createdAt: Date.now(),
      status: 'unread'
    };

    if (attachedImage) {
      payload.image = attachedImage;
    }

    // Tăng thời gian chờ lên 25s để bù cho mạng yếu và xử lý lỗi rõ ràng hơn
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 25000)
    );

    try {
      await Promise.race([
        addDoc(collection(db, 'feedbacks'), payload),
        timeoutPromise
      ]);
      setSuccess(true);
      setContent('');
      setAttachedImage(null);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || err?.code || JSON.stringify(err);
      if (err.message === 'TIMEOUT_EXCEEDED') {
        setError('Không thể kết nối tới Firebase (Quá hạn 25s). Hãy kiểm tra: (1) Bạn đã tạo Database tên "(default)" chưa? (2) Đã bật Anonymous Auth chưa?');
      } else if (errMsg.includes('permission-denied')) {
        setError('Lỗi phân quyền Firebase: Bạn cần vào Firebase Console -> Firestore -> Rules để cho phép ghi dữ liệu.');
      } else {
        setError(`Gửi góp ý thất bại. (Lỗi: ${errMsg}). Thử kiểm tra lại cấu hình Firebase nhé!`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'meimeiadmin2026') {
      setActiveTab('admin_inbox');
      setAdminPassword('');
      setError('');
      loadFeedbacks();
    } else {
      setError('Mật khẩu Admin không chính xác!');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      setFeedbacks(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Delete feedback failed:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('vi-VN')} - ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10"
            >
              {/* Header border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800"></div>

              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between select-none">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 serif-title">
                    {activeTab === 'submit' && 'Hòm Thư Góp Ý 𝜗ৎ'}
                    {activeTab === 'admin_login' && 'Xác Thực Admin'}
                    {activeTab === 'admin_inbox' && 'Hộp Thư Góp Ý Admin 📬'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {activeTab === 'submit' && 'Gửi phản hồi ẩn danh (có kèm ảnh chụp màn hình).'}
                    {activeTab === 'admin_login' && 'Nhập mật khẩu quản trị để đọc góp ý.'}
                    {activeTab === 'admin_inbox' && `Hiện có ${feedbacks.length} góp ý trong hệ thống.`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[250px] max-h-[60vh]">
                {activeTab === 'submit' && (
                  <div className="space-y-4">
                    {success ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-8 space-y-3 select-none"
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                          <CheckCircle2 className="w-6 h-6 text-zinc-300 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-100 font-sans">Gửi góp ý thành công!</h4>
                        <p className="text-xs text-zinc-400 px-6 leading-relaxed">
                          Cảm ơn bạn đã gửi đóng góp ý kiến cực kỳ quý giá giúp meimeicorner phát triển 𝜗ৎ
                        </p>
                        <button
                          onClick={() => setSuccess(false)}
                          className="mt-4 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          Viết thêm góp ý
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Text Content */}
                        <div className="space-y-2 select-none">
                          <label className="text-xs font-medium text-zinc-400">Nội dung góp ý:</label>
                          <textarea
                            rows={4}
                            maxLength={2000}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập nội dung góp ý của bạn ở đây... (Tính cách bot bám sát không? Trải nghiệm ra sao?...)"
                            className="w-full bg-black/40 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all custom-scrollbar resize-none"
                            required
                          />
                          <div className="text-right text-[10px] text-zinc-500 font-mono">
                            {content.length}/2000 kí tự
                          </div>
                        </div>

                        {/* Image Attachment Picker */}
                        <div className="space-y-2 select-none">
                          <label className="text-xs font-medium text-zinc-400 flex justify-between items-center">
                            <span>Đính kèm hình ảnh (tùy chọn):</span>
                            {isCompressing && <span className="text-[10px] text-zinc-500 font-mono">Đang xử lý ảnh...</span>}
                          </label>

                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {attachedImage ? (
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 group">
                              <img
                                src={attachedImage}
                                alt="Attached preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={removeAttachedImage}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow"
                                title="Xóa ảnh"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isCompressing}
                              className="w-full py-4 rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.01] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                                <Camera className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-zinc-400">Click để chọn hoặc chụp ảnh</span>
                              <span className="text-[9px] text-zinc-600">Hỗ trợ màn hình máy tính & điện thoại</span>
                            </button>
                          )}
                        </div>

                        {error && (
                          <div className="flex gap-2 p-3.5 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs leading-relaxed">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting || isCompressing || !content.trim()}
                          className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:pointer-events-none cursor-pointer select-none"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Gửi Góp Ý 𝜗ৎ</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === 'admin_login' && (
                  <form onSubmit={handleAdminLogin} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-400 select-none">Mật khẩu Admin:</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Nhập mật khẩu quản trị..."
                          className="w-full pl-11 pr-4 py-3 bg-black/40 border border-zinc-800 rounded-2xl text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs select-none">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở Khóa Hòm Thư</span>
                    </button>
                  </form>
                )}

                {activeTab === 'admin_inbox' && (
                  <div className="space-y-4">
                    {isLoadingFeedbacks ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 select-none">
                        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
                        <p className="text-xs text-zinc-500 font-medium">Đang tải thư đóng góp...</p>
                      </div>
                    ) : feedbacks.length === 0 ? (
                      <div className="text-center py-12 space-y-2 select-none">
                        <p className="text-zinc-500 text-xs font-semibold">Chưa nhận được góp ý nào.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                        {feedbacks.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-3 relative group"
                          >
                            <div className="flex items-center justify-between select-none">
                              <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(item.createdAt)}
                              </span>
                              <button
                                onClick={() => handleDeleteFeedback(item.id)}
                                className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                                title="Xóa góp ý"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-zinc-700/50 select-text">
                              {item.content}
                            </p>

                            {item.image && (
                              <div className="relative w-36 aspect-square rounded-xl overflow-hidden border border-zinc-800 cursor-zoom-in" onClick={() => setLightboxImage(item.image)}>
                                <img
                                  src={item.image}
                                  alt="Feedback attachment"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Switch Footer */}
              <div className="p-4 border-t border-white/5 bg-black/40 text-center text-xs flex justify-between items-center px-6 select-none">
                {activeTab === 'submit' ? (
                  <button
                    onClick={() => {
                      setError('');
                      setActiveTab('admin_login');
                    }}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Hòm thư Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setError('');
                      setActiveTab('submit');
                    }}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 mr-auto cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Quay lại gửi góp ý</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Zoom Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-full max-h-[90vh] z-10"
            >
              <img
                src={lightboxImage}
                alt="Enlarged screenshot"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}