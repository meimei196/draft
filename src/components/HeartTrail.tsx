import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function HeartTrail() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Ẩn con trỏ chuột mặc định trên màn hình lớn
    const style = document.createElement('style');
    style.id = 'hide-cursor-style';
    style.innerHTML = `
      @media (min-width: 768px) {
        * { cursor: none !important; }
      }
    `;
    document.head.appendChild(style);

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Tạo đuôi tim lấp lánh (trail)
      const newHeart: Heart = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 12 + 8, // Kích thước từ 8px đến 20px
      };

      // Giới hạn số lượng trái tim hiển thị cùng lúc để tránh lag
      setHearts((prev) => [...prev.slice(-12), newHeart]);

      // Tự động xóa trái tim sau khi hiệu ứng kết thúc
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.getElementById('hide-cursor-style')?.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden hidden md:block">
      {/* Con trỏ chuột hình trái tim cố định */}
      <div 
        className="absolute pointer-events-none transition-transform duration-75"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0.8, 0], 
              scale: [0.5, 1.2, 1, 0.5],
              rotate: [0, 20, -20, 0],
              y: heart.y - 50 // Bay lên nhẹ nhàng
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute"
            style={{
              left: heart.x - heart.size / 2,
              top: heart.y - heart.size / 2,
            }}
          >
            <svg width={heart.size} height={heart.size} viewBox="0 0 24 24" fill="white" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}