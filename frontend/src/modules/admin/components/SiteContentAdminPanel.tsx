import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchSiteContent, updateSiteContent } from '@/shared/api/endpoints'
import type {
  LookbookAspect,
  LookbookItemContent,
  SiteContentResponse,
  UpdateSiteContentRequest,
} from '@/shared/api/types'
import { DEFAULT_SITE_CONTENT } from '@/shared/lib/siteContentDefaults'
import {
  GOOGLE_DRIVE_SHARE_HINT,
  resolveProductImageUrl,
} from '@/shared/lib/productMedia'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import {
  AdminButton,
  AdminField,
  AdminPanelHeader,
  adminInputClass,
} from './AdminFormUi'

const adminTextareaClass = `${adminInputClass} min-h-[6rem] resize-y`

type Tab = 'hero' | 'artist' | 'lookbook' | 'contact'

const ASPECT_OPTIONS: { value: LookbookAspect; label: string }[] = [
  { value: 'tall', label: 'Cao (tall)' },
  { value: 'wide', label: 'Ngang (wide)' },
  { value: 'square', label: 'Vuông (square)' },
]

function DrivePreview({ url, alt }: { url: string; alt: string }) {
  if (!url.trim()) return null
  return (
    <img
      src={resolveProductImageUrl(url)}
      alt={alt}
      referrerPolicy="no-referrer"
      className="mt-2 max-h-36 w-auto rounded-sm border border-zinc-800 object-cover"
    />
  )
}

export function SiteContentAdminPanel() {
  const [tab, setTab] = useState<Tab>('hero')
  const [form, setForm] = useState<SiteContentResponse>(DEFAULT_SITE_CONTENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setForm(await fetchSiteContent())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được nội dung trang chủ')
      setForm(DEFAULT_SITE_CONTENT)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload: UpdateSiteContentRequest = {
        hero: { ...form.hero },
        artist: {
          ...form.artist,
          statementLines: form.artist.statementLines.filter((l) => l.trim()),
        },
        lookbook: {
          ...form.lookbook,
          items: form.lookbook.items.map((item, index) => ({
            ...item,
            id: index + 1,
          })),
        },
        contact: { ...form.contact },
        socialLinks: form.socialLinks
          .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
          .filter((l) => l.label && l.url),
      }
      setForm(await updateSiteContent(payload))
      setMessage('Đã lưu — trang chủ cập nhật sau vài giây.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  const updateLookbookItem = (index: number, patch: Partial<LookbookItemContent>) => {
    setForm((prev) => ({
      ...prev,
      lookbook: {
        ...prev.lookbook,
        items: prev.lookbook.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      },
    }))
  }

  const addLookbookItem = () => {
    setForm((prev) => ({
      ...prev,
      lookbook: {
        ...prev.lookbook,
        items: [
          ...prev.lookbook.items,
          {
            id: prev.lookbook.items.length + 1,
            label: 'Tiêu đề ảnh',
            imageUrl: '',
            aspect: 'square' as LookbookAspect,
            speed: 0.12,
          },
        ],
      },
    }))
  }

  const removeLookbookItem = (index: number) => {
    if (!confirm('Xóa ảnh này khỏi Lookbook?')) return
    setForm((prev) => ({
      ...prev,
      lookbook: {
        ...prev.lookbook,
        items: prev.lookbook.items.filter((_, i) => i !== index),
      },
    }))
  }

  if (loading) return <LoadingState label="Đang tải nội dung trang chủ..." />
  if (error && !form.hero.imageUrl) return <ApiErrorState message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-6">
      <AdminPanelHeader title="Trang chủ — Hero · Artist · Lookbook · Liên hệ" />
      <p className="text-sm text-zinc-500">
        Dán link Google Drive (chia sẻ “Bất kỳ ai có link”) như sản phẩm / dịch vụ.
      </p>

      <p className="text-xs text-zinc-500">{GOOGLE_DRIVE_SHARE_HINT}</p>

      {message && <p className="text-sm text-emerald-400">{message}</p>}
      {error && <ApiErrorState message={error} />}

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        {(
          [
            ['hero', 'Hero'],
            ['artist', 'The Artist'],
            ['lookbook', 'Salon Tour / Lookbook'],
            ['contact', 'Liên hệ & Mạng xã hội'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-2 text-xs uppercase tracking-widest ${
              tab === id ? 'bg-gold/10 text-gold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {tab === 'hero' && (
          <section className="space-y-4 border border-zinc-800 p-4 sm:p-6">
            <h2 className="font-serif text-xl text-zinc-200">Hero panel</h2>
            <AdminField label="Ảnh nền (Google Drive hoặc /images/...)">
              <input
                className={adminInputClass}
                value={form.hero.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, hero: { ...p.hero, imageUrl: e.target.value } }))}
                placeholder="https://drive.google.com/file/d/..."
              />
              <DrivePreview url={form.hero.imageUrl} alt="Hero" />
            </AdminField>
            <AdminField label="Dòng phụ (eyebrow)">
              <input
                className={adminInputClass}
                value={form.hero.eyebrow}
                onChange={(e) => setForm((p) => ({ ...p, hero: { ...p.hero, eyebrow: e.target.value } }))}
              />
            </AdminField>
            <AdminField label="Tiêu đề chính">
              <input
                className={adminInputClass}
                value={form.hero.title}
                onChange={(e) => setForm((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
              />
            </AdminField>
            <AdminField label="Tagline (dòng italic)">
              <input
                className={adminInputClass}
                value={form.hero.tagline}
                onChange={(e) => setForm((p) => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))}
              />
            </AdminField>
          </section>
        )}

        {tab === 'artist' && (
          <section className="space-y-4 border border-zinc-800 p-4 sm:p-6">
            <h2 className="font-serif text-xl text-zinc-200">The Artist</h2>
            <AdminField label="Ảnh chính">
              <input
                className={adminInputClass}
                value={form.artist.mainImageUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, artist: { ...p.artist, mainImageUrl: e.target.value } }))
                }
              />
              <DrivePreview url={form.artist.mainImageUrl} alt="Artist main" />
            </AdminField>
            <AdminField label="Ảnh phụ (góc)">
              <input
                className={adminInputClass}
                value={form.artist.secondaryImageUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, artist: { ...p.artist, secondaryImageUrl: e.target.value } }))
                }
              />
              <DrivePreview url={form.artist.secondaryImageUrl} alt="Artist secondary" />
            </AdminField>
            <AdminField label="Eyebrow">
              <input
                className={adminInputClass}
                value={form.artist.eyebrow}
                onChange={(e) => setForm((p) => ({ ...p, artist: { ...p.artist, eyebrow: e.target.value } }))}
              />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Tiêu đề (phần thường)">
                <input
                  className={adminInputClass}
                  value={form.artist.heading}
                  onChange={(e) => setForm((p) => ({ ...p, artist: { ...p.artist, heading: e.target.value } }))}
                />
              </AdminField>
              <AdminField label="Tiêu đề (phần vàng italic)">
                <input
                  className={adminInputClass}
                  value={form.artist.headingAccent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, artist: { ...p.artist, headingAccent: e.target.value } }))
                  }
                />
              </AdminField>
            </div>
            <AdminField label="Đoạn giới thiệu">
              <textarea
                className={adminTextareaClass}
                rows={4}
                value={form.artist.bio}
                onChange={(e) => setForm((p) => ({ ...p, artist: { ...p.artist, bio: e.target.value } }))}
              />
            </AdminField>
            <AdminField label="Marquee (mỗi dòng một câu)">
              <textarea
                className={adminTextareaClass}
                rows={5}
                value={form.artist.statementLines.join('\n')}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    artist: {
                      ...p.artist,
                      statementLines: e.target.value.split('\n'),
                    },
                  }))
                }
              />
            </AdminField>
          </section>
        )}

        {tab === 'contact' && (
          <section className="space-y-4 border border-zinc-800 p-4 sm:p-6">
            <h2 className="font-serif text-xl text-zinc-200">Liên hệ &amp; Mạng xã hội</h2>
            <p className="text-sm text-zinc-500">
              Hiển thị ở cuối trang chủ (Đặt lịch) và dòng lưu ý ở section Bảng giá.
            </p>
            <AdminField label="Số điện thoại (hiển thị)">
              <input
                className={adminInputClass}
                value={form.contact.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))
                }
                placeholder="0986 586 058"
              />
            </AdminField>
            <AdminField label="Số gọi (chỉ số, không khoảng trắng — để bấm gọi)">
              <input
                className={adminInputClass}
                value={form.contact.phoneRaw}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: { ...p.contact, phoneRaw: e.target.value } }))
                }
                placeholder="0986586058"
              />
            </AdminField>
            <AdminField label="Địa chỉ">
              <textarea
                className={adminTextareaClass}
                rows={2}
                value={form.contact.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: { ...p.contact, address: e.target.value } }))
                }
              />
            </AdminField>
            <AdminField label="Lưu ý (UpSize, tư vấn...)">
              <textarea
                className={adminTextareaClass}
                rows={2}
                value={form.contact.note}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: { ...p.contact, note: e.target.value } }))
                }
              />
            </AdminField>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Link mạng xã hội / Portfolio</p>
              {form.socialLinks.map((link, index) => (
                <div key={index} className="grid gap-3 border border-zinc-800/80 p-3 sm:grid-cols-[1fr_2fr_auto]">
                  <AdminField label="Tên hiển thị">
                    <input
                      className={adminInputClass}
                      value={link.label}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.map((item, i) =>
                            i === index ? { ...item, label: e.target.value } : item,
                          ),
                        }))
                      }
                      placeholder="Portfolio"
                    />
                  </AdminField>
                  <AdminField label="URL">
                    <input
                      className={adminInputClass}
                      value={link.url}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.map((item, i) =>
                            i === index ? { ...item, url: e.target.value } : item,
                          ),
                        }))
                      }
                      placeholder="https://..."
                    />
                  </AdminField>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          socialLinks: p.socialLinks.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-xs text-red-400 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    socialLinks: [...p.socialLinks, { label: 'Portfolio', url: '' }],
                  }))
                }
                className="text-xs uppercase tracking-widest text-gold hover:underline"
              >
                + Thêm link
              </button>
            </div>
          </section>
        )}

        {tab === 'lookbook' && (
          <section className="space-y-4 border border-zinc-800 p-4 sm:p-6">
            <h2 className="font-serif text-xl text-zinc-200">Salon Tour / Lookbook</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Eyebrow section">
                <input
                  className={adminInputClass}
                  value={form.lookbook.eyebrow}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lookbook: { ...p.lookbook, eyebrow: e.target.value } }))
                  }
                />
              </AdminField>
              <AdminField label="Tiêu đề section">
                <input
                  className={adminInputClass}
                  value={form.lookbook.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lookbook: { ...p.lookbook, title: e.target.value } }))
                  }
                />
              </AdminField>
            </div>

            <div className="space-y-6">
              {form.lookbook.items.map((item, index) => (
                <article key={item.id} className="border border-zinc-800/80 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Ảnh {String(index + 1).padStart(2, '0')}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLookbookItem(index)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <AdminField label="Tiêu đề trên ảnh">
                      <input
                        className={adminInputClass}
                        value={item.label}
                        onChange={(e) => updateLookbookItem(index, { label: e.target.value })}
                      />
                    </AdminField>
                    <AdminField label="Layout">
                      <select
                        className={adminInputClass}
                        value={item.aspect}
                        onChange={(e) =>
                          updateLookbookItem(index, { aspect: e.target.value as LookbookAspect })
                        }
                      >
                        {ASPECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                    <AdminField label="Link ảnh Google Drive">
                      <input
                        className={adminInputClass}
                        value={item.imageUrl}
                        onChange={(e) => updateLookbookItem(index, { imageUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                      />
                      <DrivePreview url={item.imageUrl} alt={item.label} />
                    </AdminField>
                    <AdminField label="Parallax speed (0.05 – 0.35)">
                      <input
                        type="number"
                        step={0.01}
                        min={0.05}
                        max={0.35}
                        className={adminInputClass}
                        value={item.speed}
                        onChange={(e) => updateLookbookItem(index, { speed: Number(e.target.value) })}
                      />
                    </AdminField>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={addLookbookItem}
              className="text-xs uppercase tracking-widest text-gold hover:underline"
            >
              + Thêm ảnh Lookbook
            </button>
          </section>
        )}

        <div className="pt-4">
          <AdminButton type="submit" variant="primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu trang chủ'}
          </AdminButton>
        </div>
      </form>
    </div>
  )
}
