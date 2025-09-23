// Template cố định theo format trong JSON request
const CustomEmailTemplate = (
    toEmail,
    emailDateTime = '',
    emailLocation = '',
    emailDuration = '',
    companyName = 'TCC & Partners',
) => `
<div style="max-width:680px;margin:24px auto;background:#ffffff;border-radius:8px;box-shadow:0 6px 18px rgba(12,20,28,0.08);overflow:hidden;border:1px solid #e6e9ee;">

    <div style="padding:20px 24px;background:linear-gradient(90deg,#084c8d,#0b6fb0);color:#fff;">
      <h1 style="margin:0;font-size:18px;font-weight:600;">Lời mời phỏng vấn từ ${companyName}</h1>
    </div>

    <div style="padding:24px;line-height:1.6;font-size:15px;">
      <p>Kính gửi <strong>${toEmail}</strong>,</p>

      <p>Công ty chúng tôi đã xem xét hồ sơ của bạn và rất ấn tượng với kinh nghiệm cũng như kỹ năng của bạn.</p>

      <p>Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn cho vị trí đã ứng tuyển.</p>

      <div style="background:#f7fafc;padding:16px;border-radius:6px;margin:12px 0;border:1px solid #eef2f6;">
        <div style="margin:8px 0;"><strong>Thời gian:</strong> ${emailDateTime || '[Ngày giờ phỏng vấn]'}</div>
        <div style="margin:8px 0;"><strong>Địa điểm:</strong> ${emailLocation || '[Địa chỉ phỏng vấn]'}</div>
        <div style="margin:8px 0;"><strong>Thời gian phỏng vấn:</strong> ${emailDuration || '[Thời gian phỏng vấn]'}</div>
        <div style="margin:8px 0;"><strong>Người liên hệ:</strong> HR Department</div>
      </div>

      <p>Vui lòng xác nhận tham gia và chuẩn bị các giấy tờ cần thiết.</p>

      <a href="#" style="display:inline-block;margin-top:12px;padding:10px 16px;background:#0b6fb0;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Xác nhận tham gia</a>

      <p style="margin-top:18px;">Trân trọng,<br/><strong>${companyName}</strong></p>
    </div>

    <div style="padding:16px 24px;font-size:13px;color:#56606a;border-top:1px solid #f0f2f5;background:#fafbfc;">
      <p>Nếu bạn có thắc mắc hoặc muốn thay đổi lịch, vui lòng liên hệ với HR Department.</p>
    </div>
  </div>
`;

module.exports = { CustomEmailTemplate };
