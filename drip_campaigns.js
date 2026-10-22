// =========================================================================
// HỆ THỐNG KỊCH BẢN CHUẨN HÓA OHANA-C MARKETING FUNNEL (BẢN 10/2026)
// Căn cứ: Tài liệu chính thức Astronixa LLC & Bộ Funnel Blueprint OHANA-C
// =========================================================================

// Bộ 5 Video Onboarding Chuẩn Hóa (5 Bước hoàn tất trong 60 phút)
const ONBOARDING_STEPS = {
  step1: {
    title: "Bước 1: Đăng ký tài khoản App Ohana & Kích hoạt Basic 0đ",
    desc: "Tải ứng dụng và tạo tài khoản nhanh bằng số điện thoại, sở hữu ngay Ref Link giới thiệu của riêng bạn.",
    videoUrl: process.env.VIDEO_STEP_1_URL || "https://youtu.be/k7eo_NnI7uI",
    key: "STEP_1_REGISTER"
  },
  step2: {
    title: "Bước 2: Tìm hiểu các hạng gói theo bảng giá chính thức",
    desc: "Tìm hiểu 4 dòng sản phẩm chính thức: Ohana Social, Ohana Meet, Ohana AI Agent và All-in-One Pack.",
    videoUrl: process.env.VIDEO_STEP_2_URL || "https://youtu.be/8Oljb4DCwlo",
    key: "STEP_2_PACKAGES"
  },
  step3: {
    title: "Bước 3: Hướng dẫn nạp tiền minh bạch và an toàn",
    desc: "Thao tác nạp tiền qua các cổng thanh toán được tích hợp sẵn trên hệ thống.",
    videoUrl: process.env.VIDEO_STEP_3_URL || "https://youtu.be/3Gr7Zo8cK8Q",
    key: "STEP_3_DEPOSIT"
  },
  step4: {
    title: "Bước 4: Xác minh danh tính bảo mật (KYC)",
    desc: "Bảo vệ tài khoản và đảm bảo tính hợp pháp theo tiêu chuẩn tài chính quốc tế.",
    videoUrl: process.env.VIDEO_STEP_4_URL || "https://youtu.be/sPvb7_qvIWs",
    key: "STEP_4_KYC"
  },
  step5: {
    title: "Bước 5: Rút tiền hoa hồng & Kích hoạt nhân bản Affiliate",
    desc: "Quy trình rút tiền về tài khoản ngân hàng và sử dụng công cụ tiếp thị tự động.",
    videoUrl: process.env.VIDEO_STEP_5_URL || "https://youtu.be/l9vAc7C8Zz4",
    key: "STEP_5_WITHDRAW"
  }
};

// Chuỗi Nuôi Dưỡng 5 Ngày (Drip Nurture Sequence N01 - N14)
const DRIP_CAMPAIGN = {
  // NGÀY 0: KÍCH HOẠT DƯỚI 3 PHÚT
  day0: {
    dayIndex: 0,
    title: "🎁 [Ngày 0] Kích hoạt quà tặng 0đ và App Basic của bạn",
    zalo: {
      code: "N01",
      timing: "Gửi ngay sau khi điền form / hoàn tất chatbot",
      text: `Chào {ten}, em là trợ lý của cộng đồng OHANA-C. Bộ quà 0đ của anh/chị đang ở đây: {link_qua}\n\n` +
        `Để không bỏ phí, anh/chị làm giúp em 1 bước mất chưa tới 3 phút: mở App Ohana tại {link_app} và tạo tài khoản miễn phí bằng đúng số điện thoại này. Xong bước này, ngày mai em gửi tiếp phần hướng dẫn đáng giá nhất trong bộ quà.\n\n` +
        `Anh/chị đã mở được App chưa ạ?`,
      buttons: [
        { label: "✅ Rồi, em vào được", action: "day0_activated" },
        { label: "❓ Chưa, gửi lại link", action: "day0_resend_link" },
        { label: "⚠️ Em bị lỗi hỗ trợ", action: "day0_support" }
      ]
    },
    email: {
      code: "N02",
      timing: "+30 phút sau khi nhận quà",
      subject: "Bộ quà 0đ của bạn đã sẵn sàng, {ten} ạ",
      preview: "Bắt đầu bằng bước 3 phút này để không bỏ phí phần còn lại.",
      text: `Chào {ten},\n\n` +
        `Cảm ơn bạn đã đăng ký nhận bộ quà 0đ từ cộng đồng OHANA-C.\n\n` +
        `Để bắt đầu trải nghiệm thực tế ngay hôm nay, dưới đây là 3 tài sản bạn nhận được hoàn toàn miễn phí:\n` +
        `1. Ebook E-guide: "11 Mảnh Ghép Hệ Sinh Thái Ohana" (Tải tại: {link_qua})\n` +
        `2. Tài khoản Trải Nghiệm Ohana Basic 0đ trọn đời (Đăng ký tại: {link_app})\n` +
        `3. Lộ trình 5 Video Chuẩn Hóa hướng dẫn từ A-Z: {link_video_playlist}\n\n` +
        `Hãy tải tài liệu và tạo tài khoản trước nhé! Ngày mai mình sẽ chia sẻ với bạn bằng chứng thực tế về 4 phân hệ đang vận hành.`
    }
  },

  // NGÀY 1: BẰNG CHỨNG SẢN PHẨM THẬT
  day1: {
    dayIndex: 1,
    title: "🧩 [Ngày 1] 4 Phân hệ chủ lực & Bức tranh 11 mảnh ghép",
    zalo: {
      code: "N04",
      timing: "19h30 Ngày 1",
      text: `{ten} ơi, hôm nay em giới thiệu nhanh để anh/chị hình dung Ohana gồm những gì.\n\n` +
        `Ohana là siêu ứng dụng do Astronixa LLC (Hoa Kỳ) phát triển. Bốn cấu phần chủ lực dùng chung một tài khoản:\n` +
        `1️⃣ Ohana Social — Mạng xã hội & cộng đồng, nhắn tin mã hóa đầu cuối E2EE.\n` +
        `2️⃣ Ohana Meet — Họp trực tuyến HD không giới hạn thời lượng.\n` +
        `3️⃣ Ohana AI Agent — Trợ lý AI sáng tạo nội dung, chăm sóc khách và bán hàng đa kênh.\n` +
        `4️⃣ All-in-One Pack — Gói gộp cả ba phân hệ với chi phí tiết kiệm nhất.\n\n` +
        `Gói Basic của cả 3 phân hệ đều MIỄN PHÍ. Hệ sinh thái đầy đủ gồm 11 thành phần mở rộng theo lộ trình minh bạch. Anh/chị đã trải nghiệm tính năng nào chưa ạ?`,
      buttons: [
        { label: "📱 Thử Ohana Social", action: "explore_social" },
        { label: "🤖 Thử Ohana AI Agent", action: "explore_ai" },
        { label: "💻 Thử Ohana Meet", action: "explore_meet" }
      ]
    }
  },

  // NGÀY 2: CÁ NHÂN HÓA THEO CHÂN DUNG NGHỀ NGHIỆP
  day2: {
    dayIndex: 2,
    title: "💼 [Ngày 2] Giải pháp thực chiến dành riêng cho công việc của bạn",
    // Nhánh Shop Online / Bán Hàng
    branchSeller: {
      code: "N06A",
      timing: "8h30 Ngày 2",
      text: `{ten} ơi, riêng cho hoạt động kinh doanh bán hàng của anh/chị, thứ đáng thử trước nhất là **Ohana AI Agent**.\n\n` +
        `Nó đọc hiểu tin nhắn tiếng Việt tự nhiên của khách (kể cả viết tắt), nhận diện ý định — hỏi giá, xin tư vấn hay khiếu nại — rồi đề xuất câu trả lời chuẩn theo giọng của shop. AI còn hỗ trợ tạo đơn hàng, link thanh toán và mã vận đơn ngay trong khung chat Zalo, Facebook, Instagram.\n\n` +
        `Tối {ngay_webinar} {gio_webinar} có webinar chuyên sâu, em sẽ gửi link đăng ký vào ngày mai nhé!`
    },
    // Nhánh Freelancer / Marketer / Creator
    branchFreelancer: {
      code: "N06B",
      timing: "8h30 Ngày 2",
      text: `{ten} ơi, với công việc freelancer / creator, điểm mạnh nhất của Ohana là **bộ đôi Ohana Meet + AI Agent**.\n\n` +
        `Ohana Meet cho phép họp trực tuyến HD không lo bị ngắt 40 phút như Zoom miễn phí; còn AI Agent là trợ lý hỗ trợ lên dàn ý kịch bản, viết nội dung đa kênh và dịch thuật siêu mượt. Tất cả thao tác trong cùng một app duy nhất.`
    },
    // Nhánh Leader / Đào tạo
    branchLeader: {
      code: "N06C",
      timing: "8h30 Ngày 2",
      text: `{ten} ơi, với các anh/chị làm leader và đào tạo, Ohana mang lại giải pháp xây dựng 'ngôi nhà số' riêng cho cộng đồng của mình: không lo thuật toán bóp tương tác, họp nhóm hàng tuần trên Ohana Meet với chất lượng cao và có sẵn kênh phân phối Affiliate minh bạch.`
    }
  },

  // NGÀY 3: ĐIỂM CHUYỂN ĐỔI CHÍNH - WEBINAR OHANA MEET
  day3: {
    dayIndex: 3,
    title: "🎯 [Ngày 3] Điểm chuyển đổi chính — Webinar Ohana Meet hàng tuần",
    zaloInvite: {
      code: "N08",
      timing: "8h30 sáng Ngày Webinar",
      text: `{ten} ơi, tối nay {gio_webinar} có buổi Zoom giới thiệu Ohana và cơ hội Affiliate cùng đội ngũ Astronixa.\n\n` +
        `Nội dung buổi:\n` +
        `• Trực tiếp demo 4 phân hệ chủ lực của Ohana đang chạy thực tế.\n` +
        `• Cách cộng đồng Affiliate OHANA-C đang vận hành tự động 24/7.\n` +
        `• Bảng giá niêm yết 10/2026 và chính sách hoa hồng chính thức hiện hành.\n` +
        `• Hỏi đáp trực tiếp cùng các Leader và Đại diện công ty.\n\n` +
        `Buổi này hoàn toàn miễn phí (60 phút). Anh/chị bấm đăng ký giữ chỗ tại: {link_webinar}`,
      buttons: [
        { label: "🎟️ Đã đăng ký giữ chỗ", action: "webinar_confirmed" },
        { label: "⏰ Tối nay bận, gửi bản ghi", action: "webinar_record_request" }
      ]
    },
    zaloReminder: {
      code: "N09",
      timing: "Trước giờ bắt đầu 75 phút",
      text: `Nhắc lịch nhẹ {ten} ơi: Buổi Zoom sẽ bắt đầu lúc {gio_webinar} (còn hơn 1 tiếng nữa).\n` +
        `Anh/chị mở sẵn đường link: {link_webinar} để tham gia đúng giờ nhé!`
    }
  },

  // NGÀY 4: NIỀM TIN, PHÁP LÝ & TỰ KIỂM CHỨNG
  day4: {
    dayIndex: 4,
    title: "⚖️ [Ngày 4] Minh bạch Pháp lý & Cách tự kiểm chứng độc lập",
    zalo: {
      code: "N12",
      timing: "19h30 Ngày 4",
      text: `{ten} ơi, em gửi phần nhiều anh/chị hay quan tâm nhất trước khi quyết định: Thông tin pháp lý và cách tự kiểm chứng minh bạch.\n\n` +
        `• Đơn vị phát triển: **Astronixa LLC** — công ty công nghệ đăng ký tại bang Delaware, Hoa Kỳ.\n` +
        `• Tại Việt Nam: **Công ty TNHH Astronixa** (Tầng 7 Rise Building, 2A1 Nguyễn Thị Minh Khai, P. Đa Kao, Q.1, TP.HCM) phụ trách tiếp thị và hỗ trợ người dùng theo Hợp đồng hợp tác hiệu lực từ 01/06/2026.\n` +
        `• Mã hóa & Bảo mật: Ứng dụng Ohana Chat triển khai mã hóa đầu cuối (E2EE) và kiến trúc Zero-Knowledge theo đúng Sách trắng v1.0 tháng 6/2026.\n\n` +
        `Cộng đồng OHANA-C hoạt động theo nguyên tắc: **Nói đúng – Nói đủ – Không thổi phồng**. Chúng tôi không cam kết mức thu nhập hay lợi nhuận cố định; mọi kết quả đều đến từ trải nghiệm thực và nỗ lực cá nhân.`
    }
  },

  // NGÀY 5: BƯỚC TIẾP THEO & BẢNG GIÁ CHÍNH THỨC
  day5: {
    dayIndex: 5,
    title: "🚀 [Ngày 5] Lựa chọn bước đi phù hợp cho bạn",
    // Nhánh Trải Nghiệm Sản Phẩm
    branchProduct: {
      code: "N14A",
      timing: "8h30 Ngày 5",
      text: `{ten} ơi, hôm nay là tin cuối trong chuỗi 5 ngày của em.\n\n` +
        `Nếu anh/chị đang dùng gói **Basic miễn phí** thấy ổn, anh/chị cứ tiếp tục dùng trải nghiệm — không ai ép nâng cấp.\n\n` +
        `Khi nào cần thêm tính năng cho công việc, bảng giá niêm yết hiện hành (Web, chưa VAT 10%):\n` +
        `• Social hoặc Meet Pro 1 năm: **$54** | Gói Family 1 năm (5 người dùng): **$243**\n` +
        `• All-in-One Pack (Gộp Social + Meet + AI Agent) Pro 1 năm: **$486**\n` +
        `• Đặc quyền tặng cổ phần: Mỗi $100 giá trị gói được tặng 50 cổ phần ghi nhận trên hồ sơ tài khoản.\n\n` +
        `Chi tiết nằm trong App Ohana, mục Nâng Cấp ạ.`
    },
    // Nhánh Đối Tác Affiliate
    branchAffiliate: {
      code: "N14B",
      timing: "8h30 Ngày 5",
      text: `{ten} ơi, nếu anh/chị muốn đồng hành phát triển cùng OHANA-C Affiliate:\n\n` +
        `• Hoa hồng trực tiếp: 5% / 7% / 10% theo từng nhóm sản phẩm qua Ref Link cá nhân.\n` +
        `• Hoa hồng phân hệ AI Points: 5% riêng biệt.\n` +
        `• Chương trình User Growth: Giới thiệu 10 người trực tiếp và 100 người trong mạng lưới tải app được tặng ngay gói Social 6 tháng ($28.50) mà không cần mua gói trước.\n` +
        `• Chương trình Co-Founder Membership ($5,000 – $50,000): Dành cho đối tác chiến lược với hạn ngạch giới hạn, được trao đổi riêng 1-1.\n\n` +
        `Anh/chị sẵn sàng bắt đầu chưa ạ?`,
      buttons: [
        { label: "🚀 Đăng ký Onboarding 5 bước", action: "start_onboarding" },
        { label: "🤝 Đặt lịch tư vấn 1-1", action: "book_consultation" }
      ]
    }
  }
};

// Bộ Câu Trả Lời Q&A Chuẩn Theo Sách Trắng & Tài Liệu Công Ty (Chương 9)
const QA_KNOWLEDGE_BASE = {
  is_mlm: {
    keywords: ["đa cấp", "mlm", "mô hình đa cấp", "có phải lừa đảo", "lừa đảo"],
    answer: "Không ạ. Đây là Affiliate Marketing (Tiếp thị liên kết) — mô hình các tập đoàn công nghệ như Amazon, Shopee, Tiki đang sử dụng: Hoa hồng chỉ phát sinh khi có người dùng đăng ký hoặc mua sản phẩm số thật qua Ref Link của bạn. Hệ thống không bắt buộc ôm hàng, không có phí gia hạn duy trì vô lý và hoàn toàn không có thu nhập nếu chỉ lôi kéo người mà không phát sinh giá trị giao dịch sản phẩm thật."
  },
  is_scam: {
    keywords: ["sợ bị lừa", "uy tín không", "có đáng tin", "tin tưởng"],
    answer: "Anh/chị đừng vội tin lời quảng cáo — hãy tự mình kiểm chứng ạ: Tạo tài khoản Ohana Basic miễn phí (0đ, 0 rủi ro), tải ứng dụng dùng thử các tính năng thật, đối chiếu văn bản pháp lý minh bạch của Astronixa LLC và tham gia cộng đồng để lắng nghe chia sẻ của người dùng thật trước khi đưa ra bất kỳ quyết định nào."
  },
  legal_info: {
    keywords: ["pháp lý", "công ty ở đâu", "trụ sở", "giấy phép", "astronixa"],
    answer: "Hệ sinh thái Ohana do Astronixa LLC phát triển — công ty đăng ký thành lập tại bang Delaware, Hoa Kỳ. Tại Việt Nam, Công ty TNHH Astronixa phụ trách hoạt động tiếp thị, quan hệ đối tác và chăm sóc khách hàng (Trụ sở: Tầng 7, Rise Building, 2A1 Nguyễn Thị Minh Khai, P. Đa Kao, Q.1, TP.HCM) theo Hợp đồng hợp tác ký ngày 01/06/2026."
  },
  income_commitment: {
    keywords: ["cam kết thu nhập", "kiếm được bao nhiêu", "lãi suất", "bao lâu hoàn vốn", "lợi nhuận"],
    answer: "Cộng đồng OHANA-C và Astronixa tuyệt đối KHÔNG cam kết bất kỳ mức thu nhập, lợi nhuận cố định hay lãi suất nào. Mọi khoản thu nhập từ Affiliate phụ thuộc vào chính sách hoa hồng chính thức, năng lực và nỗ lực tiếp thị thực tế của từng cá nhân theo đúng tôn chỉ: Nói đúng – Nói đủ – Không thổi phồng."
  },
  co_founder: {
    keywords: ["co-founder", "gói vip", "cổ đông", "cổ phần sáng lập", "5000"],
    answer: "Chương trình Co-Founder Membership là chương trình giới hạn dành cho các đối tác chiến lược cấp cao (các mức VIP từ $5,000 đến $50,000 đi kèm quyền lợi quyền chọn cổ phần). Chương trình này không được tư vấn đại trà qua chatbot tự động. Em xin phép kết nối anh/chị với Trưởng ban phát triển để trao đổi riêng 1-1 qua Zoom hoặc gặp trực tiếp ạ."
  },
  chat_security: {
    keywords: ["bảo mật", "mã hóa", "lộ tin nhắn", "sách trắng"],
    answer: "Ohana Chat áp dụng cơ chế mã hóa đầu cuối (End-to-End Encryption - E2EE) và kiến trúc Không-Tri-Thức (Zero-Knowledge) theo tiêu chuẩn Sách trắng Bảo mật Ohana Chat v1.0 (tháng 6/2026). Khóa mã hóa chỉ được lưu cục bộ trên thiết bị của bạn; máy chủ trung gian không thể đọc được nội dung tin nhắn hay cuộc gọi."
  }
};

module.exports = {
  ONBOARDING_STEPS,
  DRIP_CAMPAIGN,
  QA_KNOWLEDGE_BASE
};
