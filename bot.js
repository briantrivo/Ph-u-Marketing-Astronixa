require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const db = require('./db');
const { DRIP_CAMPAIGN, ONBOARDING_STEPS, QA_KNOWLEDGE_BASE } = require('./drip_campaigns');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3002;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

// Khởi tạo Express Server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Landing Page, PDF Ebook, Cockpit Dashboard)
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

let bot = null;
if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  bot = new Telegraf(BOT_TOKEN);
} else {
  console.log('ℹ️ TELEGRAM_BOT_TOKEN chưa được cấu hình. Hệ thống Webhook Server & Admin Cockpit vẫn hoạt động độc lập 100%.');
}

function isAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

// =========================================================================
// TELEGRAM BOT LOGIC (SÀNG LỌC 3 CÂU HỎI & XỬ LÝ CHEN NGANG Q&A)
// =========================================================================
if (bot) {
  // Lệnh /start: Bước 0 - Chào và trao quà trước
  bot.command('start', async (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name || 'anh/chị';

    db.saveOrUpdateUser(userId, {
      first_name: ctx.from.first_name || '',
      username: ctx.from.username || '',
      source: 'Telegram Bot Ohana-C'
    });

    const welcomeMsg = `Chào anh/chị ${name}, em là trợ lý của cộng đồng **OHANA-C** (One Universe | One Family) 👋\n\n` +
      `Em gửi anh/chị **bộ khởi đầu 0đ** trước nhé:\n` +
      `1️⃣ **Tài liệu 11 Mảnh Ghép Ohana:** Tải Ebook PDF chính thức\n` +
      `2️⃣ **Tài khoản Ohana Basic miễn phí:** Trải nghiệm không giới hạn thời gian\n` +
      `3️⃣ **Lộ trình 5 Video Chuẩn Hóa:** Đăng ký và kích hoạt từng bước\n\n` +
      `Anh/chị mở xem thử nhé! Em xin phép hỏi nhanh 3 câu (chưa tới 1 phút) để gợi ý đúng phần phù hợp nhất với anh/chị.`;

    await ctx.reply(welcomeMsg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Bắt đầu trả lời 3 câu hỏi nhanh', 'START_SURVEY')],
        [Markup.button.url('📄 Tải Ebook 11 Mảnh Ghép', 'https://astronixa.com'), Markup.button.url('📱 Tạo tài khoản Basic 0đ', 'https://ohana.astronixa.com/register')]
      ])
    });
  });

  // Action Bắt đầu trả lời
  bot.action('START_SURVEY', async (ctx) => {
    await ctx.answerCbQuery();
    await askQuestion1(ctx);
  });

  // Câu 1: Xác thực nguồn kênh
  async function askQuestion1(ctx) {
    const msg = `**Câu 1/3:** Anh/chị biết tới Ohana qua đâu ạ?`;
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👥 Bạn bè giới thiệu', 'SRC_FRIEND'), Markup.button.callback('📱 Facebook / TikTok', 'SRC_SOCIAL')],
        [Markup.button.callback('🎤 Sự kiện / Zoom', 'SRC_EVENT'), Markup.button.callback('🌐 Kênh khác', 'SRC_OTHER')]
      ])
    });
  }

  // Handle Câu 1
  bot.action(/SRC_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const srcType = ctx.match[1].toLowerCase();
    const userId = ctx.from.id;

    db.saveOrUpdateUser(userId, {
      source_tag: `src-${srcType}`,
      tags: [`src-${srcType}`]
    });

    await askQuestion2(ctx);
  });

  // Câu 2: Chân dung nghề nghiệp (ICP)
  async function askQuestion2(ctx) {
    const msg = `**Câu 2/3:** Công việc hiện tại của anh/chị gần nhất với nhóm nào ạ?\n` +
      `*(Em hỏi để gợi ý đúng tính năng thực tế, không hỏi để bán gói đâu ạ)*`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🛍️ Bán hàng online / chủ shop', 'ICP_SELLER')],
        [Markup.button.callback('🎨 Freelancer / creator / marketer', 'ICP_FREELANCER')],
        [Markup.button.callback('👑 Leader cộng đồng / đào tạo', 'ICP_LEADER')],
        [Markup.button.callback('💻 Yêu công nghệ / khác', 'ICP_TECH')]
      ])
    });
  }

  // Handle Câu 2
  bot.action(/ICP_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const icpType = ctx.match[1].toLowerCase();
    const userId = ctx.from.id;

    db.saveOrUpdateUser(userId, {
      icp: icpType,
      tags: [`icp-${icpType}`]
    });

    await askQuestion3(ctx);
  });

  // Câu 3: Câu quyết định (Ưu tiên bắt đầu)
  async function askQuestion3(ctx) {
    const msg = `**Câu 3/3:** Anh/chị muốn bắt đầu theo hướng nào ạ?`;
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🅰️ Trải nghiệm sản phẩm trước', 'GOAL_PRODUCT')],
        [Markup.button.callback('🅱️ Tìm hiểu thêm cơ hội Affiliate', 'GOAL_AFFILIATE')]
      ])
    });
  }

  // Handle Câu 3 - Nhánh A: Trải nghiệm sản phẩm
  bot.action('GOAL_PRODUCT', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const updated = db.saveOrUpdateUser(userId, {
      goal: 'Trải nghiệm App trước',
      persona: 'product_user',
      completed_3_questions: true,
      tags: ['intent-product']
    });

    const msg = `Tuyệt vời ạ! Anh/chị tạo tài khoản **Basic 0đ** miễn phí tại link bên dưới — có ngay Ref Link của riêng mình dù chưa mua bất kỳ gói nào.\n\n` +
      `🎁 **Đặc quyền 0đ từ chương trình User Growth:**\n` +
      `Nếu anh/chị chia sẻ app tới 10 người trực tiếp và có 100 người trong mạng lưới tải app, hệ thống tự động tặng gói **Ohana Social 6 tháng (trị giá $28.50)** hoàn toàn miễn phí!\n\n` +
      `Em sẽ đồng hành hỗ trợ anh/chị trong 5 ngày tới với các hướng dẫn ngắn gọn, không áp lực.`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📲 Kích hoạt App Ohana Basic 0đ', 'https://ohana.astronixa.com/register')],
        [Markup.button.callback('📚 Xem 5 Video Onboarding', 'VIEW_ONBOARDING')]
      ])
    });

    // Thông báo Admin
    notifyAdminLead(updated);
  });

  // Handle Câu 3 - Nhánh B: Tìm hiểu cơ hội Affiliate
  bot.action('GOAL_AFFILIATE', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const updated = db.saveOrUpdateUser(userId, {
      goal: 'Tìm hiểu cơ hội affiliate',
      persona: 'affiliate_partner',
      completed_3_questions: true,
      tags: ['intent-affiliate']
    });

    const msg = `Dạ rất hoan nghênh anh/chị! Cơ chế cộng đồng **OHANA-C Affiliate**:\n\n` +
      `• **Hoa hồng trực tiếp:** 5% / 7% / 10% theo từng nhóm sản phẩm qua Ref Link cá nhân.\n` +
      `• **Hoa hồng AI Points:** 5% riêng biệt.\n` +
      `• **Không áp lực:** Không bắt buộc ôm hàng, không phí gia hạn duy trì vô lý.\n` +
      `• **Hệ thống tự động:** Có sẵn Funnel 24/7 và bộ 5 video chuyển giao 60 phút.\n\n` +
      `Hàng tuần có buổi **Webinar Ohana Meet** trực tiếp giải đáp mọi thắc mắc và định hướng thực chiến. Anh/chị có muốn đăng ký giữ chỗ tham gia không ạ?`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎟️ Đăng ký giữ chỗ Webinar', 'REGISTER_WEBINAR')],
        [Markup.button.callback('📚 Xem 5 Video Onboarding Chuẩn Hóa', 'VIEW_ONBOARDING')],
        [Markup.button.url('💬 Tham gia Nhóm Zalo Hỗ Trợ', 'https://zalo.me/g/8fldfg1glzsy43berjgd')]
      ])
    });

    // Thông báo Admin
    notifyAdminLead(updated);
  });

  // Xem 5 Video Onboarding
  bot.action('VIEW_ONBOARDING', async (ctx) => {
    await ctx.answerCbQuery();
    const msg = `🎥 **BỘ 5 VIDEO CHUẨN HÓA ONBOARDING (60 PHÚT NHÂN BẢN)**\n\n` +
      `1️⃣ [Đăng ký tài khoản Ohana](${ONBOARDING_STEPS.step1.videoUrl})\n` +
      `2️⃣ [Tìm hiểu các hạng gói 10/2026](${ONBOARDING_STEPS.step2.videoUrl})\n` +
      `3️⃣ [Hướng dẫn nạp tiền minh bạch](${ONBOARDING_STEPS.step3.videoUrl})\n` +
      `4️⃣ [Xác minh danh tính KYC](${ONBOARDING_STEPS.step4.videoUrl})\n` +
      `5️⃣ [Rút tiền & Kích hoạt Ref Link](${ONBOARDING_STEPS.step5.videoUrl})`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url('▶️ Mở danh sách Video trên YouTube', 'https://www.youtube.com/@astronixavn')]
      ])
    });
  });

  // Đăng ký Webinar
  bot.action('REGISTER_WEBINAR', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const updated = db.saveOrUpdateUser(userId, {
      registered_webinar: true,
      tags: ['event-registered']
    });

    await ctx.reply(`🎉 Anh/chị đã đăng ký giữ chỗ thành công! Trợ lý sẽ gửi thông báo và đường link phòng Zoom/Meet trước giờ bắt đầu 75 phút nhé.`);
    notifyAdminLead(updated);
  });

  // Lắng nghe tin nhắn text để xử lý câu hỏi phản biện chen ngang (Chương 9 Q&A)
  bot.on('text', async (ctx) => {
    const text = (ctx.message.text || '').toLowerCase();
    const userId = ctx.from.id;

    // Kiểm tra câu hỏi chen ngang
    for (const [key, item] of Object.entries(QA_KNOWLEDGE_BASE)) {
      const match = item.keywords.some(kw => text.includes(kw));
      if (match) {
        if (key === 'co_founder') {
          db.saveOrUpdateUser(userId, { tags: ['intent-cofounder'] });
        }
        await ctx.reply(item.answer);
        return;
      }
    }

    // Tin nhắn mặc định nếu bot không nhận diện được
    const fallbackMsg = `Dạ em đã ghi nhận tin nhắn của anh/chị. Em là trợ lý tự động của OHANA-C.\n` +
      `Nếu anh/chị cần hỗ trợ kỹ thuật hoặc tư vấn 1-1 trực tiếp, anh/chị có thể để lại số điện thoại hoặc nhắn trực tiếp cho đội ngũ hỗ trợ tại nhóm Zalo nhé: https://zalo.me/g/8fldfg1glzsy43berjgd`;

    await ctx.reply(fallbackMsg);
  });
}

// Hàm thông báo Admin qua Telegram khi có Lead
async function notifyAdminLead(lead) {
  if (!bot || ADMIN_IDS.length === 0) return;

  const isHot = lead.lead_category === 'HOT' || lead.score >= 70;
  const header = isHot
    ? `🚨🚨 **[CẢNH BÁO LEAD NÓNG - CẦN GỌI ĐIỆN TRONG 15 PHÚT]** 🚨🚨`
    : `📥 **CÓ LEAD MỚI VÀO PHỄU OHANA-C**`;

  const msg = `${header}\n\n` +
    `👤 **Họ tên:** ${lead.name || lead.first_name || 'Khách hàng'}\n` +
    `📞 **Số Zalo:** \`${lead.phone || 'Chưa cung cấp'}\`\n` +
    `📧 **Email:** ${lead.email || 'Không có'}\n` +
    `🎯 **Phân loại:** **${lead.lead_category}** (${lead.score} điểm)\n` +
    `💼 **Mục tiêu:** ${lead.goal || lead.persona || 'Chưa rõ'}\n` +
    `🏷️ **Nhãn CRM:** ${(lead.tags || []).join(', ')}\n` +
    `🌐 **Nguồn:** ${lead.source || 'Landing Page 0d'}\n` +
    `⏰ **Thời gian:** ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;

  for (const adminId of ADMIN_IDS) {
    try {
      await bot.telegram.sendMessage(adminId, msg, { parse_mode: 'Markdown' });
    } catch (e) {
      // Bỏ qua lỗi gửi tin Telegram nếu ID chưa chat với bot
    }
  }
}

// =========================================================================
// REST API & WEBHOOK ENDPOINTS
// =========================================================================

// Endpoint Webhook tiếp nhận Lead từ Landing Page / ManyChat / TikTok Ads / Web
app.post('/api/webhook/lead', async (req, res) => {
  try {
    const { name, phone, email, persona, goal, icp, source, utm_source, utm_medium, utm_campaign, ref } = req.body;

    const id = `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const saved = db.saveOrUpdateUser(id, {
      name: name || 'Khách hàng',
      phone: phone || '',
      email: email || '',
      persona: persona || 'freelancer',
      goal: goal || 'Trải nghiệm App trước',
      icp: icp || persona || '',
      source: source || 'Landing Page Thu Lead 0d',
      utm_source: utm_source || '',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      ref_link: ref || ''
    });

    console.log(`📥 [LEAD MỚI] ${saved.name} (${saved.phone}) - Điểm: ${saved.score} [${saved.lead_category}]`);

    // Gửi cảnh báo Admin nếu có cấu hình
    notifyAdminLead(saved);

    return res.json({
      success: true,
      message: 'Tiếp nhận và chấm điểm lead thành công!',
      lead: saved,
      score: saved.score,
      category: saved.lead_category
    });
  } catch (err) {
    console.error('Lỗi tiếp nhận Lead Webhook:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint thống kê phễu
app.get('/api/stats', (req, res) => {
  res.json({ success: true, stats: db.getStats() });
});

// Endpoint lấy toàn bộ danh sách leads
app.get('/api/leads', (req, res) => {
  res.json({ success: true, leads: db.getAllUsers() });
});

// Endpoint xuất file CSV
app.get('/api/export-csv', (req, res) => {
  const csv = db.exportCSV();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ohana_leads_export.csv"');
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8
});

// Endpoint chạy test mô phỏng 3 luồng (Hot, Warm, Cold, De-dup)
app.post('/api/test-flow', (req, res) => {
  const { type } = req.body;
  let testLead = null;

  if (type === 'hot') {
    testLead = db.saveOrUpdateUser(`test_hot_${Date.now()}`, {
      name: 'Trần Văn Hoàng (Test Leader)',
      phone: '0912345678',
      email: 'hoang.tran@test.com',
      goal: 'Tìm hiểu cơ hội affiliate',
      persona: 'affiliate_partner',
      icp: 'Leader cộng đồng / đào tạo',
      source: 'Facebook Ads - Chiến dịch GoLive',
      completed_3_questions: true,
      registered_webinar: true,
      viewed_pricing: true,
      tags: ['intent-affiliate', 'icp-leader', 'event-registered']
    });
  } else if (type === 'warm') {
    testLead = db.saveOrUpdateUser(`test_warm_${Date.now()}`, {
      name: 'Nguyễn Thị Thu Lan (Test Freelancer)',
      phone: '0987654321',
      email: 'lan.nguyen@test.com',
      goal: 'Trải nghiệm App trước',
      persona: 'product_user',
      icp: 'Freelancer / creator / marketer',
      source: 'TikTok Bio Link',
      completed_3_questions: true,
      activated_basic: true,
      tags: ['intent-product', 'icp-freelancer']
    });
  } else if (type === 'dup') {
    // Test gửi trùng lại SĐT của Anh Hoàng
    testLead = db.saveOrUpdateUser(`test_dup_${Date.now()}`, {
      name: 'Trần Văn Hoàng (Đăng ký thêm lần 2)',
      phone: '0912345678',
      email: 'hoang.tran.updated@test.com',
      goal: 'Cả hai',
      tags: ['intent-cofounder']
    });
  } else {
    // Cold Lead
    testLead = db.saveOrUpdateUser(`test_cold_${Date.now()}`, {
      name: 'Lê Quốc Bảo (Test Khách xem)',
      phone: '0933112233',
      goal: 'Trải nghiệm App trước',
      persona: 'other',
      source: 'Quà tặng 0d Direct Link',
      tags: ['gift-only']
    });
  }

  notifyAdminLead(testLead);

  return res.json({
    success: true,
    message: `Đã kích hoạt luồng kiểm thử ${type.toUpperCase()} thành công! Điểm: ${testLead.score} (${testLead.lead_category})`,
    lead: testLead
  });
});

// Admin Cockpit Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    version: '10/2026',
    server: 'OHANA-C Funnel Automation Core',
    stats: db.getStats()
  });
});

// =========================================================================
// AUTOMATED CRON SCHEDULER (DRIP CAMPAIGN)
// =========================================================================
// Chạy mỗi ngày vào lúc 08:30 sáng và 19:30 tối theo múi giờ Việt Nam
cron.schedule('30 8,19 * * *', () => {
  console.log('⏰ [DRIP SCHEDULER] Bắt đầu quét chuỗi nuôi dưỡng 5 ngày...');
  const users = db.getAllUsers();
  users.forEach(u => {
    // Chỉ kích hoạt drip campaign cho lead Warm/Cold, lead Hot đã có người tiếp quản
    if (u.lead_category !== 'HOT' && u.drip_day < 5) {
      const nextDay = u.drip_day + 1;
      db.saveOrUpdateUser(u.id, {
        drip_day: nextDay,
        last_drip_at: new Date().toISOString()
      });
      console.log(`📤 Gửi tin Drip Ngày ${nextDay} cho ${u.name || u.phone}`);
    }
  });
});

// Khởi chạy Express Server khi chạy độc lập cục bộ
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log('=======================================================');
    console.log('🚀 OHANA-C MARKETING FUNNEL SERVER ĐÃ KHỞI CHẠY THÀNH CÔNG!');
    console.log(`🌐 Landing Page Thu Lead 0đ: http://localhost:${PORT}/`);
    console.log(`📊 Admin Funnel Cockpit:    http://localhost:${PORT}/admin`);
    console.log(`📄 Quà Tặng 11 Mảnh Ghép:   http://localhost:${PORT}/ohana-11-manh-ghep.pdf`);
    console.log(`📡 Webhook Tiếp Nhận Lead:  POST http://localhost:${PORT}/api/webhook/lead`);
    console.log('=======================================================');
  });

  if (bot) {
    bot.launch().then(() => {
      console.log('🤖 Telegram Bot đã kết nối chế độ polling.');
    }).catch((err) => {
      console.warn('⚠️ Lỗi kết nối Telegram Polling:', err.message);
    });
  }

  // Graceful shutdown
  process.once('SIGINT', () => {
    if (bot) bot.stop('SIGINT');
    server.close();
  });
  process.once('SIGTERM', () => {
    if (bot) bot.stop('SIGTERM');
    server.close();
  });
}

// Export cho Vercel Serverless
module.exports = app;
