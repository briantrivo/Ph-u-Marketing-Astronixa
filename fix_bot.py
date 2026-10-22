import sys

p = r'd:\AI AGENT ANTIGRAVITY\14-ohana-funnel-automation\bot.js'
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_block = [
    "// Khởi chạy Express Server khi chạy độc lập cục bộ\n",
    "if (require.main === module) {\n",
    "  const server = app.listen(PORT, () => {\n",
    "    console.log('=======================================================');\n",
    "    console.log('🚀 OHANA-C MARKETING FUNNEL SERVER ĐÃ KHỞI CHẠY THÀNH CÔNG!');\n",
    "    console.log(`🌐 Landing Page Thu Lead 0đ: http://localhost:${PORT}/`);\n",
    "    console.log(`📊 Admin Funnel Cockpit:    http://localhost:${PORT}/admin`);\n",
    "    console.log(`📄 Quà Tặng 11 Mảnh Ghép:   http://localhost:${PORT}/ohana-11-manh-ghep.pdf`);\n",
    "    console.log(`📡 Webhook Tiếp Nhận Lead:  POST http://localhost:${PORT}/api/webhook/lead`);\n",
    "    console.log('=======================================================');\n",
    "  });\n"
]

lines[443:454] = new_block

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated bot.js lines 444-455!")
