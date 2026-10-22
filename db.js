const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'ohana_users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: {},
    stats: {
      totalLeads: 0,
      hotLeads: 0,
      warmLeads: 0,
      coldLeads: 0,
      productUsers: 0,
      affiliatePartners: 0,
      completedStep5: 0
    }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

class Database {
  constructor() {
    this.filePath = DB_FILE;
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Lỗi đọc database:', err);
      return { users: {}, stats: {} };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Lỗi ghi database:', err);
      return false;
    }
  }

  getUser(userId) {
    const data = this.read();
    return data.users[String(userId)] || null;
  }

  findUserByPhone(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    const data = this.read();
    return Object.values(data.users).find(u => normalizePhone(u.phone) === normalized) || null;
  }

  calculateLeadScore(user) {
    let score = 0;
    const tags = new Set(user.tags || []);

    // Nhánh mục tiêu
    if (user.goal === 'Tìm hiểu cơ hội affiliate' || user.persona === 'affiliate_partner' || tags.has('intent-affiliate')) {
      score += 40;
      tags.add('intent-affiliate');
    } else if (user.goal === 'Trải nghiệm App trước' || user.persona === 'product_user' || tags.has('intent-product')) {
      score += 30;
      tags.add('intent-product');
    } else if (user.goal === 'Cả hai') {
      score += 45;
      tags.add('intent-affiliate');
      tags.add('intent-product');
    }

    // Chân dung ICP
    const icp = user.icp || user.role_category || '';
    if (icp.includes('shop') || icp.includes('bán hàng') || tags.has('icp-seller')) {
      score += 15;
      tags.add('icp-seller');
    } else if (icp.includes('freelancer') || icp.includes('creator') || tags.has('icp-freelancer')) {
      score += 15;
      tags.add('icp-freelancer');
    } else if (icp.includes('leader') || icp.includes('cộng đồng') || tags.has('icp-leader')) {
      score += 20;
      tags.add('icp-leader');
    } else if (icp.includes('công nghệ') || tags.has('icp-tech')) {
      score += 10;
      tags.add('icp-tech');
    }

    // Tương tác bổ sung
    if (user.phone && normalizePhone(user.phone).length === 10) score += 20;
    if (user.email) score += 5;
    if (user.completed_3_questions) score += 10;
    if (user.viewed_pricing) score += 15;
    if (user.activated_basic) score += 25;
    if (user.registered_webinar) score += 20;
    if (user.onboarding_step > 0) score += user.onboarding_step * 5;

    // Phân loại Lead
    let category = 'COLD';
    if (score >= 70) {
      category = 'HOT';
      tags.add('hot-lead');
      tags.delete('warm-lead');
      tags.delete('cold-lead');
    } else if (score >= 35) {
      category = 'WARM';
      tags.add('warm-lead');
      tags.delete('hot-lead');
      tags.delete('cold-lead');
    } else {
      category = 'COLD';
      tags.add('cold-lead');
      tags.delete('hot-lead');
      tags.delete('warm-lead');
    }

    return { score, category, tags: Array.from(tags) };
  }

  saveOrUpdateUser(userId, fields = {}) {
    const data = this.read();
    let idStr = String(userId);

    // Kiểm tra khử trùng lặp qua số điện thoại nếu có
    const phone = normalizePhone(fields.phone);
    if (phone) {
      const existingByPhone = Object.values(data.users).find(u => normalizePhone(u.phone) === phone);
      if (existingByPhone) {
        idStr = existingByPhone.id;
      }
    }

    const existing = data.users[idStr] || {
      id: idStr,
      created_at: new Date().toISOString(),
      persona: 'unknown',
      goal: 'Trải nghiệm App trước',
      icp: '',
      source: 'Direct Web',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      step: 1,
      onboarding_step: 0,
      drip_day: 0,
      last_drip_at: null,
      phone: null,
      email: null,
      notes: '',
      tags: [],
      score: 0,
      lead_category: 'COLD',
      completed_3_questions: false,
      activated_basic: false,
      viewed_pricing: false,
      registered_webinar: false
    };

    // Chuẩn hóa fields đầu vào
    if (fields.phone) fields.phone = normalizePhone(fields.phone);

    // Gộp tags nếu có
    const mergedTags = new Set([...(existing.tags || []), ...(fields.tags || [])]);
    const mergedUser = {
      ...existing,
      ...fields,
      tags: Array.from(mergedTags),
      updated_at: new Date().toISOString()
    };

    // Tính toán lại Lead Score & Phân loại
    const scoreResult = this.calculateLeadScore(mergedUser);
    mergedUser.score = scoreResult.score;
    mergedUser.lead_category = scoreResult.category;
    mergedUser.tags = scoreResult.tags;

    data.users[idStr] = mergedUser;

    // Cập nhật thống kê
    let totalLeads = Object.keys(data.users).length;
    let hot = 0;
    let warm = 0;
    let cold = 0;
    let prod = 0;
    let aff = 0;
    let step5 = 0;

    Object.values(data.users).forEach(u => {
      if (u.lead_category === 'HOT') hot++;
      else if (u.lead_category === 'WARM') warm++;
      else cold++;

      if (u.persona === 'product_user' || (u.tags && u.tags.includes('intent-product'))) prod++;
      if (u.persona === 'affiliate_partner' || (u.tags && u.tags.includes('intent-affiliate'))) aff++;
      if (u.onboarding_step >= 5) step5++;
    });

    data.stats = {
      totalLeads,
      hotLeads: hot,
      warmLeads: warm,
      coldLeads: cold,
      productUsers: prod,
      affiliatePartners: aff,
      completedStep5: step5,
      lastUpdated: new Date().toISOString()
    };

    this.write(data);

    // Đồng bộ sang Google Sheet nếu có webhook
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      this.syncToGoogleSheet(mergedUser).catch(e => console.error('Lỗi sync Google Sheet CRM:', e.message));
    }

    return mergedUser;
  }

  async syncToGoogleSheet(userData) {
    if (!process.env.GOOGLE_SHEET_WEBHOOK_URL) return;
    try {
      await axios.post(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        userId: userData.id,
        name: userData.first_name || userData.name || 'Khách hàng',
        phone: userData.phone || '',
        email: userData.email || '',
        persona: userData.persona || '',
        goal: userData.goal || '',
        lead_category: userData.lead_category || 'COLD',
        score: userData.score || 0,
        tags: (userData.tags || []).join(', '),
        source: userData.source || 'Landing Page 0d',
        utm_source: userData.utm_source || '',
        onboarding_step: userData.onboarding_step || 0,
        drip_day: userData.drip_day || 0
      }, { timeout: 4500 });
    } catch (err) {
      // Không chặn luồng chính
    }
  }

  getAllUsers() {
    const data = this.read();
    return Object.values(data.users);
  }

  getStats() {
    const data = this.read();
    return data.stats || {};
  }

  exportCSV() {
    const users = this.getAllUsers();
    const headers = ['ID', 'Họ Tên', 'Số Điện Thoại', 'Email', 'Phân Loại', 'Điểm', 'Nhãn Tags', 'Mục Tiêu', 'Chân Dung', 'Nguồn', 'Ngày Tạo'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${(u.name || u.first_name || '').replace(/"/g, '""')}"`,
      `"${u.phone || ''}"`,
      `"${u.email || ''}"`,
      `"${u.lead_category || ''}"`,
      u.score || 0,
      `"${(u.tags || []).join('; ')}"`,
      `"${(u.goal || '').replace(/"/g, '""')}"`,
      `"${(u.icp || u.persona || '').replace(/"/g, '""')}"`,
      `"${(u.source || '').replace(/"/g, '""')}"`,
      `"${u.created_at || ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

module.exports = new Database();
