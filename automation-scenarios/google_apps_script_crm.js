/**
 * GOOGLE APPS SCRIPT - TỰ ĐỘNG LƯU & PHÂN LOẠI LEAD VÀO GOOGLE SHEETS CRM
 * Hệ Thống Marketing Funnel OHANA-C (Astronixa LLC - Bản Chuẩn 10/2026)
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheet mới -> Tiện ích mở rộng (Extensions) -> Apps Script.
 * 2. Xóa hết code cũ, dán toàn bộ đoạn mã này vào.
 * 3. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment).
 * 4. Loại: Ứng dụng web (Web app).
 *    - Thực thi dưới dạng (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 5. Bấm Triển khai, cấp quyền truy cập và copy đường link Web App (kết thúc bằng /exec).
 * 6. Dán link này vào GOOGLE_SHEET_WEBHOOK_URL trong file .env hoặc hệ thống Landing Page.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tạo tiêu đề và định dạng màu sắc nếu trang tính mới
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời Gian",
        "Mã Lead ID",
        "Họ Và Tên",
        "Số Zalo / Phone",
        "Email",
        "Phân Hạng Lead",
        "Điểm Số",
        "Mục Tiêu",
        "Chân Dung ICP",
        "Nhãn Tags CRM",
        "Nguồn (Source)",
        "UTM Campaign",
        "Trạng Thái Xử Lý"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight("bold").setBackground("#0E8A73").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var userId = data.userId || ("web_" + new Date().getTime());
    var name = data.name || data.first_name || "Khách hàng";
    var phone = data.phone || data.phone_number || "";
    var email = data.email || "";
    var category = (data.lead_category || (data.score >= 70 ? "HOT" : (data.score >= 35 ? "WARM" : "COLD"))).toUpperCase();
    var score = data.score || 0;
    var goal = data.goal || (data.persona === "product_user" ? "Trải nghiệm App trước" : "Tìm hiểu cơ hội affiliate");
    var icp = data.icp || data.persona || "";
    var tags = data.tags || "";
    var source = data.source || "Landing Page 0d";
    var utm = data.utm_campaign || data.utm_source || "direct";
    var status = category === "HOT" ? "🚨 CẦN GỌI TRONG 15 PHÚT" : (category === "WARM" ? "Nuôi dưỡng 5 ngày" : "Chăm sóc định kỳ");

    // Thêm dòng mới
    sheet.appendRow([
      timestamp,
      userId,
      name,
      "'" + phone, // Dấu nháy đơn để giữ số 0 đầu
      email,
      category,
      score,
      goal,
      icp,
      tags,
      source,
      utm,
      status
    ]);

    var lastRow = sheet.getLastRow();
    var catCell = sheet.getRange(lastRow, 6);
    if (category === "HOT") {
      catCell.setBackground("#FF5E57").setFontColor("#FFFFFF").setFontWeight("bold");
    } else if (category === "WARM") {
      catCell.setBackground("#FFA801").setFontColor("#000000").setFontWeight("bold");
    } else {
      catCell.setBackground("#0BE881").setFontColor("#000000");
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Lead đã được lưu và chấm điểm thành công vào CRM Google Sheets!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("OHANA-C CRM Webhook is active and waiting for POST data.").setMimeType(ContentService.MimeType.TEXT);
}
