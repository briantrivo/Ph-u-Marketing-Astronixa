import os

def update_landing_pages():
    desktop_lp = os.path.join(os.path.expanduser('~'), 'Desktop', 'PHỄU MARKETING ASTRONIXA', 'Landing page thu lead 0đ.html')
    public_lp = r'd:\AI AGENT ANTIGRAVITY\14-ohana-funnel-automation\public\index.html'

    google_sheet_url = "https://script.google.com/macros/s/AKfycbwlYK0UcsFwZStFfjWhMUcT-62HDwJx32_kCtYfuaNYqnI9ebD9T1lOzkGu9PYkBSRX/exec"

    for path in [desktop_lp, public_lp]:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Update the lead submission logic
        old_fetch_target = "function postLead(endpoint) {"
        if old_fetch_target in html:
            # Replace with enhanced multi-destination post
            old_block = """            function postLead(endpoint) {
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
              });"""

            new_block = """            function postLead(endpoint) {
              return fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload)
              });
            }

            // Gửi đồng thời tới Server Funnel và Google Sheets CRM dự phòng
            postLead('/api/webhook/lead')
              .catch(function () {
                return postLead('http://localhost:3002/api/webhook/lead');
              })
              .then(function (res) {
                if (res && res.ok) console.log('Lead sent successfully to Funnel Server');
              })
              .catch(function () {});

            try {
              fetch('https://script.google.com/macros/s/AKfycbwlYK0UcsFwZStFfjWhMUcT-62HDwJx32_kCtYfuaNYqnI9ebD9T1lOzkGu9PYkBSRX/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload)
              }).catch(function() {});
            } catch(e) {}"""

            if old_block in html:
                html = html.replace(old_block, new_block)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Updated fail-safe CRM post in {os.path.basename(path)}")

if __name__ == '__main__':
    update_landing_pages()
