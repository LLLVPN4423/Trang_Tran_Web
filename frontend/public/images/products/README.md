# Ảnh sản phẩm — Google Drive (khuyến nghị)

Salon **up ảnh/video lên Google Drive**, không cần Firebase Storage trả phí.

## Quy trình (Admin)

1. Up JPG/PNG (và video MP4 nếu có) lên Drive — nên gom trong 1 thư mục `TrangTranHair/Products`.
2. **Chuột phải file → Chia sẻ → Bất kỳ ai có đường liên kết → Sao chép liên kết.**
3. Admin → **Sản phẩm** → **Sửa**:
   - **Gallery ảnh:** mỗi dòng 1 link Drive (tối đa **7** ảnh)
   - **Video:** 1 link Drive hoặc YouTube (để trống nếu không có)
4. **Lưu** — ảnh hiện ngay trên catalog và trang chi tiết, **không cần deploy**.

Ví dụ link:
```
https://drive.google.com/file/d/1ABC...xyz/view?usp=sharing
```

## Sau khi đã live — cần deploy lại không?

| Việc làm | Deploy lại? |
|----------|-------------|
| Thêm/đổi link Drive trong Admin | **Không** |
| Sửa giá, tồn kho, tên SP (Admin) | Không |
| Thêm file `.jpg` vào thư mục này (cách dự phòng) | **Có** |

## Cách dự phòng — file trong project

Nếu muốn ảnh nằm trong code (ít linh hoạt hơn):

1. Copy JPG vào `frontend/public/images/products/ten-anh.jpg`
2. Deploy lại frontend
3. Admin → URL `/images/products/ten-anh.jpg`

## Dịch vụ (cắt tóc, nhuộm…)

Web **không hiển thị ảnh dịch vụ** — chỉ tên và giá.

## Firebase Storage (tùy chọn, trả phí)

Chỉ khi bật `VITE_FIREBASE_STORAGE_BUCKET` — Admin có nút upload trực tiếp.
