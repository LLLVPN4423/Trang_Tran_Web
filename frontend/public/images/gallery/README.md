# Gallery — Lookbook slots

Drop hair portfolio images here, then update `src/data/content.ts`:

```typescript
// Example — fill slot 01:
{
  id: '01',
  image: '/images/gallery/01.jpg',
  title: { en: 'Platinum Editorial', vi: 'Platinum Editorial' },
  category: { en: 'Color', vi: 'Nhuộm' },
}
```

**Slot limits** (edit in `src/config/slots.ts`):
- Max lookbook slots: **12**
- Visible in horizontal scroll: **6** (increase when you add more photos)
