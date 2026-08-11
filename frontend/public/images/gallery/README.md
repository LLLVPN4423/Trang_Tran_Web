# Gallery — Ảnh tóc mẫu

Section **Tóc mẫu** trên trang chủ hiện khi có ít nhất 1 mục trong `GALLERY_ITEMS`.

## Cách thêm ảnh

1. Copy ảnh JPG/PNG vào thư mục này (tỷ lệ ~4:5 khuyến nghị)
2. Mở `frontend/src/modules/portfolio/data/content.ts`
3. Thêm vào mảng `GALLERY_ITEMS`:

```ts
{ id: 1, label: 'Balayage honey', category: 'Balayage', image: '/images/gallery/balayage-01.jpg' },
```

4. Chạy lại dev server hoặc deploy frontend

Section tự ẩn khi mảng rỗng — không cần sửa code khác.
