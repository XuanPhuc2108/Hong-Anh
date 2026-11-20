/**
 * Nội dung mặc định cho website.
 * Đây là placeholder trung tính — có thể chỉnh sửa toàn bộ qua bảng điều khiển admin
 * hoặc thay đổi trực tiếp tại đây. Không có chi tiết cá nhân nào bị bịa ra.
 */

export type StoryItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  photo?: string;
};

export type NoteItem = {
  id: string;
  title: string;
  body: string;
};

export type DiaryEntry = {
  id: string;
  date: string;
  caption: string;
  photo: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  caption: string;
  span: 'tall' | 'wide' | 'square' | 'big';
};

export const siteContent = {
  hero: {
    eyebrow: 'Cuốn nhật ký nhỏ',
    title: 'Dành cho Ánh',
    subtitle:
      'Một nơi để cất giữ những khoảnh khắc, câu chuyện và điều nhỏ bé — để sau này có thể lật từng trang mà mỉm cười.',
    scrollHint: 'Cuộn xuống để lật trang',
  },

  story: {
    eyebrow: '01 — Câu chuyện',
    title: 'Dòng thời gian của chúng mình',
    intro:
      'Những mốc thời gian đáng nhớ — ghi lại theo thứ tự, để sau này nhớ lại không bị sót điều gì.',
    items: [
      {
        id: 's1',
        date: 'Chưa có ngày',
        title: 'Lần đầu tiên gặp nhau',
        description:
          'Thêm ngày và vài dòng mô tả cho khoảnh khắc này — viết theo giọng của bạn, không cần văn vẻ.',
      },
      {
        id: 's2',
        date: 'Chưa có ngày',
        title: 'Một buổi chiều đáng nhớ',
        description:
          'Mô tả ngắn về một ngày mà bạn muốn nhớ mãi. Có thể là một chi tiết nhỏ nhưng ý nghĩa.',
      },
      {
        id: 's3',
        date: 'Chưa có ngày',
        title: 'Khoảnh khắc trọn vẹn',
        description:
          'Một cột mốc khác trong dòng thời gian — thêm bao nhiêu tuỳ bạn.',
      },
    ] as StoryItem[],
  },

  gallery: {
    eyebrow: '02 — Khoảnh khắc',
    title: 'Tủ ảnh',
    intro:
      'Chạm vào từng ảnh để xem lớn hơn. Có thể sắp xếp, thêm chú thích và ngày tháng qua trang quản lý.',
    images: [] as GalleryImage[],
  },

  littleThings: {
    eyebrow: '03 — Điều nhỏ bé',
    title: 'Những điều nhỏ bé mà mình giữ lại',
    intro:
      'Góc riêng cho những chi tiết vụn vặt — câu nói buông, thói quen dễ thương, hay một lát cắt của ngày thường.',
    notes: [
      {
        id: 'n1',
        title: 'Một điều nhỏ',
        body: 'Ghi lại một chi tiết nhỏ khiến bạn mỉm cười khi nhớ đến.',
      },
      {
        id: 'n2',
        title: 'Một thói quen',
        body: 'Một thói quen nhỏ của Ánh mà bạn muốn lưu giữ.',
      },
      {
        id: 'n3',
        title: 'Một câu nói',
        body: 'Một câu nói mà hai người hay nhắc nhau — giữ nguyên, không cần sửa lại cho hay hơn.',
      },
    ] as NoteItem[],
  },

  diary: {
    eyebrow: '04 — Nhật ký ảnh',
    title: 'Trang nhật ký',
    intro:
      'Mỗi trang là một ngày, một khoảnh khắc và vài dòng ghi chú — như lật từng trang sổ.',
    entries: [] as DiaryEntry[],
  },

  letter: {
    eyebrow: '05 — Một bức thư',
    title: 'Gửi Ánh',
    body: 'Viết bức thư của bạn tại đây. Một vài dòng thật thành, theo giọng của chính bạn — không cần phải dài.',
    signature: '— [Tên của bạn]',
  },

  nextChapter: {
    eyebrow: '06 — Chương tiếp theo',
    title: 'Chuyện vẫn còn đang viết',
    body: 'Cuốn nhật ký này sẽ tiếp tục dài ra — thêm nhiều trang, nhiều ảnh và nhiều điều nhỏ bé. Hẹn gặp lại ở những trang sau.',
  },
};
