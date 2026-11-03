const fs = require('fs')
const path = require('path')

const dir = path.join('docs', 'huong-dan-web')
const files = [
  'qr-dat-lich.png',
  '01-trang-chu.png',
  '02-form-lien-he-nhanh.png',
  '03-form-dat-lich-nhanh.png',
  '04-bang-gia.png',
  '05-dat-lich-dich-vu-da-chon.png',
  '06-dat-lich-form.png',
]

const b64 = {}
for (const f of files) {
  b64[f] = fs.readFileSync(path.join(dir, f)).toString('base64')
}

function img(file, alt, width = 'min(420px, 100%)') {
  return `<figure><img src="data:image/png;base64,${b64[file]}" alt="${alt}" style="width:${width};height:auto;border:1px solid #ddd;border-radius:4px"/><figcaption>${alt}</figcaption></figure>`
}

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Hướng dẫn khách đặt lịch — Trang Tran Hair</title>
<style>
  body{font-family:Segoe UI,system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px 48px;color:#111;line-height:1.55}
  h1{font-size:1.6rem;margin-bottom:.4rem}
  h2{font-size:1.2rem;margin-top:1.8rem;border-bottom:1px solid #e5e5e5;padding-bottom:.35rem}
  h3{font-size:1.05rem;margin-top:1.4rem}
  .meta{color:#444;font-size:.95rem}
  .caption-box{white-space:pre-wrap;background:#f6f6f6;border:1px solid #e0e0e0;border-radius:8px;padding:14px 16px;font-size:.95rem}
  figure{margin:12px 0 8px}
  figcaption{font-size:.85rem;color:#555;margin-top:6px}
  .qr{text-align:center}
  a{color:#8a6a20}
  ul{padding-left:1.2rem}
  @media print{
    body{margin:0;max-width:none}
    .caption-box,figure{break-inside:avoid}
  }
</style>
</head>
<body>
<h1>Hướng dẫn khách đặt lịch trên web</h1>
<p class="meta"><strong>Trang Tran Hair</strong> · Sóc Trăng</p>
<p class="meta">Website: <a href="https://trangtran-hair.pages.dev">https://trangtran-hair.pages.dev</a><br/>
Đặt lịch: <a href="https://trangtran-hair.pages.dev/appointment">https://trangtran-hair.pages.dev/appointment</a><br/>
Hotline / Zalo: <strong>0986 586 058</strong><br/>
Địa chỉ: 18–19 LK2 Tuấn Lan, Hùng Vương, TP. Sóc Trăng<br/>
Giờ: 8:30 – 20:30 (T2–CN)</p>

<h2>QR đặt lịch (dán quầy / gửi khách)</h2>
<div class="qr">${img('qr-dat-lich.png', 'Quét QR để mở trang đặt lịch', '220px')}</div>
<p>Quét mã → mở thẳng trang đặt lịch online.</p>

<h2>Caption đăng Facebook / Zalo</h2>
<div class="caption-box">Đặt lịch làm tóc không cần chờ inbox nữa

Trên web Trang Tran Hair, bạn có thể:
· Xem bảng giá rõ ràng
· Chọn dịch vụ + ghi ngày giờ mong muốn
· Gửi lịch chỉ với họ tên &amp; SĐT
· Salon gọi xác nhận trong giờ mở cửa

Truy cập: https://trangtran-hair.pages.dev/appointment
Hoặc quét QR tại quầy / bấm “Đặt lịch” trên điện thoại

Hotline · Zalo: 0986 586 058
18–19 LK2 Tuấn Lan, Hùng Vương, TP. Sóc Trăng
8:30 – 20:30 (T2–CN)

Trang Tran Hair — Where hair becomes art.</div>

<h2>Các bước kèm ảnh</h2>

<h3>1. Trang chủ — bấm Đặt lịch</h3>
${img('01-trang-chu.png', 'Trang chủ web')}
<p>Vào trang chủ → bấm <strong>ĐẶT LỊCH</strong> (giữa màn hình hoặc nút vàng dưới cùng).</p>

<h3>2. Mục Đặt lịch trên trang chủ</h3>
${img('02-form-lien-he-nhanh.png', 'Mục đặt lịch trên trang chủ')}
<p>Có thể vào <strong>Bảng giá dịch vụ</strong> hoặc <strong>Trang đặt lịch</strong> để chọn nhiều dịch vụ.</p>

<h3>3. Form liên hệ nhanh (trang chủ)</h3>
${img('03-form-dat-lich-nhanh.png', 'Form liên hệ nhanh')}
<p>Điền họ tên, SĐT, dịch vụ quan tâm, <strong>ngày/giờ mong muốn</strong> → Gửi yêu cầu nhanh.</p>

<h3>4. Bảng giá — chọn dịch vụ rồi Thêm</h3>
${img('04-bang-gia.png', 'Bảng giá dịch vụ')}
<p>Vào bảng giá → chọn dịch vụ → <strong>Thêm</strong> → mở Lịch / Đặt lịch.</p>

<h3>5. Trang đặt lịch — dịch vụ đã chọn</h3>
${img('05-dat-lich-dich-vu-da-chon.png', 'Dịch vụ đã chọn trên trang đặt lịch')}
<p>Kiểm tra danh sách dịch vụ (giá tham khảo, thanh toán tại tiệm).</p>

<h3>6. Trang đặt lịch — điền thông tin và gửi</h3>
${img('06-dat-lich-form.png', 'Form gửi yêu cầu đặt lịch')}
<p>Bắt buộc: <strong>Họ tên</strong>, <strong>SĐT</strong>, <strong>Ngày/giờ mong muốn</strong>. Bấm <strong>Gửi yêu cầu đặt lịch</strong> — salon gọi xác nhận trong giờ mở cửa.</p>

<h2>Gợi ý đăng</h2>
<ul>
<li><strong>Facebook:</strong> Caption + album ảnh 1→6 (ghim bài).</li>
<li><strong>Zalo:</strong> Caption + ảnh chính (1, 4, 6) + QR.</li>
<li><strong>Quầy:</strong> In QR dán để khách quét đặt lịch.</li>
</ul>
</body>
</html>`

const out = path.join('docs', 'HUONG_DAN_KHACH_DAT_LICH.html')
fs.writeFileSync(out, html)
console.log('Wrote', out, fs.statSync(out).size, 'bytes')
