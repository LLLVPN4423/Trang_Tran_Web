/** Câu hỏi thường gặp — hiển thị trên trang + FAQPage JSON-LD (SEO địa phương, miễn phí). */
export const SALON_FAQ = [
  {
    question: 'Salon Trang Trần ở đâu tại Sóc Trăng?',
    answer:
      'Salon tại 18–19 LK2, KDC Tuấn Lan, đường Hùng Vương, TP. Sóc Trăng. Bạn có thể bấm “Chỉ đường Google Maps” trên web hoặc tìm “Trang Tran Hair” trên Maps.',
  },
  {
    question: 'Giờ mở cửa salon?',
    answer: '8:30 – 20:30, từ Thứ Hai đến Chủ Nhật. Nên đặt lịch trước để được sắp giờ phù hợp.',
  },
  {
    question: 'Có đặt lịch online không?',
    answer:
      'Có. Vào mục Bảng giá, chọn dịch vụ, thêm vào danh sách rồi gửi lịch tại trang Đặt lịch — hoặc gọi/Zalo 0986 586 058.',
  },
  {
    question: 'Salon có nhuộm, balayage, uốn tóc không?',
    answer:
      'Có đầy đủ cắt, uốn/duỗi, nhuộm/balayage, phục hồi tóc. Bảng giá cập nhật trên web; tóc dài/dày có thể UpSize (S–XL).',
  },
  {
    question: 'Có bán sản phẩm chăm sóc tóc không?',
    answer:
      'Có shop Moroccanoil trên web — đặt hàng online, thanh toán theo hướng dẫn. Dùng mã khuyến mãi (nếu có) khi đặt.',
  },
  {
    question: 'Làm sao để liên hệ nhanh nhất?',
    answer:
      'Gọi 0986 586 058, nhắn Zalo cùng số, hoặc inbox Facebook TrangTranHair. Trên điện thoại, dùng nút Gọi / Zalo / Đặt lịch cố định dưới màn hình.',
  },
] as const

export function buildFaqJsonLd() {
  return {
    '@type': 'FAQPage',
    mainEntity: SALON_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
