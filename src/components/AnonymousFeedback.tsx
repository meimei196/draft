import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Send } from 'lucide-react';
import { playFortuneClickSound } from '../lib/sound';

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1530072747177414779/dMR0IXkoakW3bgaZ1vVSK1nCJS8xTw4PrcYoBF1YKqsQYJnSLwF1aK1HeJKX8K8kP0ei";

export const AnonymousFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [botName, setBotName] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageWarning, setImageWarning] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (images.length + selectedFiles.length > 3) {
      setImageWarning("Tối đa 3 ảnh thôi nè baby!");
      setTimeout(() => setImageWarning(null), 3000);
      return;
    }

    setImages(prev => [...prev, ...selectedFiles]);
    selectedFiles.forEach((f: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleSend = async () => {
    if (!text.trim() && images.length === 0) return;
    setStatus('sending');

    try {
      const formData = new FormData();
      const payload = {
        content: `**🎀 CÓ FEEDBACK MỚI 🎀**\n\n**Tên chồng:** ${botName || "Không rõ"}\n**Nội dung:**\n> ${text || "*(Chỉ có ảnh)*"}\n\n---`,
      };
      formData.append('payload_json', JSON.stringify(payload));
      
      images.forEach((img, i) => {
        formData.append(`file${i}`, img);
      });

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setText('');
        setBotName('');
        setImages([]);
        setPreviews([]);
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 2000);
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex justify-center mt-2">
        <button
          onClick={() => {
            playFortuneClickSound();
            setIsOpen(true);
          }}
          className="relative flex items-center justify-center px-6 py-2 rounded-full bg-zinc-900/60 border border-zinc-700 text-zinc-300 text-sm font-serif italic hover:bg-zinc-800 hover:text-zinc-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] group overflow-hidden"
        >
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          <span className="relative z-10 flex items-center gap-1.5">
            feedback cho sốp 𝜗ৎ
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-zinc-400 text-xs"></span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => status !== 'sending' && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-800 via-pink-500/40 to-zinc-800"></div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-pink-200 font-serif italic text-xl">✦ feedback ẩn danh ݁˖</h3>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mt-1 font-bold italic">Secret Message for MeiMei 🎀</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">tên chồng:</label>
                  <input 
                    type="text" 
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="Anh nào làm em buồn/vui?..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/30 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Feedback:</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập điều bae muốn nói.."
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/30 transition-all resize-none [&::-webkit-scrollbar]:hidden overflow-y-auto"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Ảnh (tối đa 3):</label>
                    {imageWarning && <span className="text-[10px] text-pink-400 font-medium">{imageWarning}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                        <img src={src} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-1 text-zinc-600"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[7px] font-bold">Thêm</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" multiple />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleSend}
                  disabled={status === 'sending' || (!text.trim() && images.length === 0)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-30 ${
                    status === 'success' ? 'bg-emerald-500 text-white' :
                    status === 'error' ? 'bg-rose-500 text-white' :
                    'bg-zinc-100 hover:bg-white text-zinc-950'
                  }`}
                >
                  {status === 'sending' ? 'Đang gửi...' : status === 'success' ? 'Đã gửi thành công! ✨' : status === 'error' ? 'Lỗi rồi!' : 'Gửi Feedback 𝜗ৎ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};