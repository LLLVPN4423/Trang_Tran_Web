# Salon Tour images

Ảnh tour salon được cấu hình trong:

```
frontend/src/modules/portfolio/data/content.ts
```

Field `image` trên mỗi item trong `LOOKBOOK_ITEMS`.

**Thư mục ảnh:** `frontend/public/images/salon-tour/`

**Hiện tại:** 11 ảnh `Salon Tour.jpg` → `Salon Tour10.jpg` đã được gắn vào Lookbook section.

Để thêm ảnh mới:
1. Copy file `.jpg` vào thư mục này
2. Thêm object vào `LOOKBOOK_ITEMS` trong `content.ts`
3. Commit Git và deploy

Tên file có dấu cách vẫn dùng được (encode tự động trong code).
