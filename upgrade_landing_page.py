import os
import re

def update_landing_page():
    desktop_folder = os.path.join(os.path.expanduser('~'), 'Desktop', 'PHỄU MARKETING ASTRONIXA')
    orig_path = os.path.join(desktop_folder, 'Landing page thu lead 0đ.html')
    public_folder = r'd:\AI AGENT ANTIGRAVITY\14-ohana-funnel-automation\public'
    public_index = os.path.join(public_folder, 'index.html')
    
    with open(orig_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update success-actions buttons
    old_success_actions = '''<div class="success-actions">
                <button class="btn btn-dark" id="btn-download" type="button">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4M4.5 19.5h15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Tải ngay bản tóm tắt tài liệu
                </button>
                <button class="btn btn-line" id="btn-copy" type="button">Sao chép thông tin đăng ký</button>
                <p class="copied-msg" id="copied-msg" aria-live="polite"></p>
              </div>'''

    new_success_actions = '''<div class="success-actions">
                <a class="btn btn-primary" id="btn-download-pdf" href="./ohana-11-manh-ghep.pdf" download="ohana-11-manh-ghep.pdf" target="_blank" style="text-decoration:none; text-align:center; font-weight:700; box-shadow:0 4px 14px rgba(14,138,115,0.35); display:flex; align-items:center; justify-content:center; gap:8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4M4.5 19.5h15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Tải Ebook PDF “11 Mảnh Ghép Ohana” (Bản Gốc 14 Trang)
                </a>
                <a class="btn btn-line" href="https://zalo.me/g/dkw23jqczybbdk0fxj" target="_blank" rel="noopener noreferrer" style="text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Vào Nhóm Zalo Nhận Thông Báo Webinar & Hỗ Trợ
                </a>
                <button class="btn btn-dark" id="btn-download" type="button">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4M4.5 19.5h15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Tải bản tóm tắt nhanh (.txt)
                </button>
                <button class="btn btn-line" id="btn-copy" type="button">Sao chép thông tin đăng ký</button>
                <p class="copied-msg" id="copied-msg" aria-live="polite"></p>
              </div>'''

    if old_success_actions in html:
        html = html.replace(old_success_actions, new_success_actions)
        print("Updated success-actions in HTML")
    else:
        print("Warning: old_success_actions not found exactly, trying regex...")
        # fallback regex replace
        pattern = r'<div class="success-actions">.*?</div>'
        html = re.sub(pattern, new_success_actions, html, count=1, flags=re.DOTALL)
        print("Regex replaced success-actions")

    # 2. Update form submit JS to send Webhook
    old_lead_assign = "leadData = { name: name, phone: phone, email: email, persona: persona, goal: goal };"
    new_lead_assign = """leadData = { name: name, phone: phone, email: email, persona: persona, goal: goal };

          // Gửi dữ liệu Lead về Webhook Server
          try {
            var urlParams = new URLSearchParams(window.location.search);
            var leadPayload = {
              name: name,
              phone: phone,
              email: email,
              persona: persona,
              goal: goal,
              source: 'Landing Page Thu Lead 0d',
              utm_source: urlParams.get('utm_source') || 'direct',
              utm_medium: urlParams.get('utm_medium') || '',
              utm_campaign: urlParams.get('utm_campaign') || '',
              ref: urlParams.get('ref') || ''
            };

            function postLead(endpoint) {
              return fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload)
              });
            }

            postLead('/api/webhook/lead')
              .catch(function () {
                return postLead('http://localhost:3002/api/webhook/lead');
              })
              .then(function (res) {
                if (res && res.ok) console.log('Lead sent successfully to Funnel Server');
              })
              .catch(function (e) {
                console.log('Offline/file mode: saved locally');
              });
          } catch (e) {
            console.error('Error sending webhook:', e);
          }"""

    if old_lead_assign in html:
        html = html.replace(old_lead_assign, new_lead_assign)
        print("Updated JS form submission with webhook POST")
    else:
        print("Warning: old_lead_assign not found!")

    # Write back to Desktop original
    with open(orig_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {orig_path}")

    # Write to public/index.html
    with open(public_index, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {public_index}")

if __name__ == '__main__':
    update_landing_page()
