/**
 * 🎀 BẢNG THÔNG BÁO CẬP NHẬT TRANG HOME (meimeicorner)
 * =====================================================================
 * Hướng dẫn dành cho Nàng:
 * - Để thêm thông báo mới: copy 1 khối object bên dưới và dán vào danh sách.
 * - Để sửa thông báo: chỉnh sửa trực tiếp nội dung trong dấu ngoặc kép.
 * - Để xóa thông báo: xóa dòng tương ứng đi là xong nè!
 * 
 * Các trường dữ liệu:
 * - badge: Nhãn chữ hiển thị (VD: 'Khóa link', 'Đang fix', 'Update', 'Bảo trì', 'Thông báo', 'Lore mới')
 * - type: Màu sắc nhãn:
 *     + 'rose': Màu đỏ hồng cảnh báo (thích hợp cho: Khóa link, Bảo trì, Cảnh báo)
 *     + 'amber': Màu vàng cam nổi bật (thích hợp cho: Đang fix, Chờ duyệt, Lưu ý)
 *     + 'pink': Màu hồng phấn ngọt ngào (thích hợp cho: Update, Bot mới, Tính năng mới)
 *     + 'purple': Màu tím huyền bí (thích hợp cho: Lore mới, Sự kiện)
 * - content: Nội dung thông báo chi tiết
 * - date: (Tùy chọn) Ngày tháng hoặc ghi chú thời gian (VD: '26/09', 'Hôm nay', 'Mới nhất')
 */

export interface AnnouncementItem {
  id: string;
  badge: string;
  type: 'rose' | 'amber' | 'pink' | 'purple';
  content: string;
  date?: string;
}

export const HOME_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    badge: 'Khóa link',
    type: 'rose',
    content: 'Tạm khóa link bot Huấn Luyện Viên & Trùm Mafia để nâng cấp prompt và bổ sung lore mới.',
    date: '26/09',
  },
  {
    id: 'ann-2',
    badge: 'Đang fix',
    type: 'amber',
    content: 'Đang fix lỗi lặp từ và tối ưu trí nhớ cho bot Daddy vibe. Nàng cứ thoải mái góp ý thêm nha!',
    date: '26/09',
  },
  {
    id: 'ann-3',
    badge: 'Update',
    type: 'pink',
    content: 'Forum Tám Zai đã mở mục đính kèm ảnh động GIF & ghim bài thông báo. Ghé qua tám chuyện nhé 𝜗ৎ',
    date: 'Hôm nay',
  },
];
