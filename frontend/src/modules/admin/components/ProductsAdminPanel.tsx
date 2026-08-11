import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  updateProduct,
} from '@/shared/api/endpoints'
import type { CreateProductRequest, ProductResponse, UpdateProductRequest } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { isFirebaseStorageConfigured, uploadProductImage } from '@/shared/auth/firebase'
import {
  galleryToTextarea,
  getProductGallery,
  GOOGLE_DRIVE_SHARE_HINT,
  MAX_PRODUCT_GALLERY,
  parseGalleryLines,
  resolveProductImageUrl,
} from '@/shared/lib/productMedia'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import {
  AdminButton,
  AdminField,
  AdminFormActions,
  AdminModal,
  AdminPanelHeader,
  adminInputClass,
} from './AdminFormUi'

type FormMode = { type: 'create' } | { type: 'edit'; product: ProductResponse }

export function ProductsAdminPanel() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [saving, setSaving] = useState(false)
  const storageEnabled = isFirebaseStorageConfigured()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await fetchAllProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (product: ProductResponse) => {
    try {
      await updateProduct(product.id, toUpdateRequest(product, !product.isActive))
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    try {
      await deleteProduct(id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const file = form.get('imageFile') as File | null
    let galleryUrls = parseGalleryLines(String(form.get('galleryUrls') ?? ''))

    try {
      if (storageEnabled && file && file.size > 0 && formMode?.type === 'edit') {
        const uploaded = await uploadProductImage(file, formMode.product.id)
        galleryUrls = [uploaded, ...galleryUrls.filter((u) => u !== uploaded)].slice(0, MAX_PRODUCT_GALLERY)
      }

      const payload = {
        name: String(form.get('name')).trim(),
        brand: String(form.get('brand')).trim(),
        description: String(form.get('description')).trim() || null,
        price: Number(form.get('price')),
        stock: Number(form.get('stock')),
        imageUrl: galleryUrls[0] ?? null,
        galleryUrls,
        videoUrl: String(form.get('videoUrl')).trim() || null,
        isActive: form.get('isActive') === 'on',
      }

      if (formMode?.type === 'edit') {
        await updateProduct(formMode.product.id, payload as UpdateProductRequest)
      } else {
        const created = await createProduct(payload as CreateProductRequest)
        if (storageEnabled && file && file.size > 0) {
          const uploaded = await uploadProductImage(file, created.id)
          const urls = [uploaded, ...galleryUrls.filter((u) => u !== uploaded)].slice(0, MAX_PRODUCT_GALLERY)
          await updateProduct(created.id, {
            ...payload,
            imageUrl: urls[0] ?? null,
            galleryUrls: urls,
            isActive: payload.isActive,
          })
        }
      }
      setFormMode(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Đang tải sản phẩm..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Moroccanoil"
        count={products.length}
        action={
          <AdminButton variant="primary" onClick={() => setFormMode({ type: 'create' })}>
            + Thêm sản phẩm
          </AdminButton>
        }
      />

      <p className="text-sm text-zinc-500">
        Ảnh &amp; video trên <strong className="text-zinc-400">Google Drive</strong>: up file → Chia sẻ &quot;Bất kỳ ai có
        link&quot; → dán link vào form (tối đa {MAX_PRODUCT_GALLERY} ảnh). {GOOGLE_DRIVE_SHARE_HINT}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((p) => {
          const gallery = getProductGallery(p)
          const thumb = gallery[0]
          return (
            <article key={p.id} className="border border-zinc-800 p-4">
              <div className="flex gap-4">
                {thumb ? (
                  <img
                    src={resolveProductImageUrl(thumb)}
                    alt={p.name}
                    className="h-24 w-24 shrink-0 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-zinc-900 text-xs text-zinc-600">
                    Chưa có ảnh
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-zinc-200">{p.name}</p>
                  <p className="text-sm text-zinc-500">
                    {p.brand} · {formatVnd(p.price)} · Tồn {p.stock}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {gallery.length} ảnh{p.videoUrl ? ' · có video' : ''}
                  </p>
                  <p className={`mt-1 text-xs ${p.isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {p.isActive ? 'Active' : 'Off'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/catalog/product/${p.id}`} className="text-xs uppercase tracking-wider text-zinc-500 hover:text-gold">
                  Xem trang
                </Link>
                <button type="button" onClick={() => setFormMode({ type: 'edit', product: p })} className="text-xs uppercase tracking-wider hover:text-gold">
                  Sửa
                </button>
                <button type="button" onClick={() => toggleActive(p)} className="text-xs uppercase tracking-wider hover:text-gold">
                  {p.isActive ? 'Tắt' : 'Bật'}
                </button>
                <button type="button" onClick={() => handleDelete(p.id, p.name)} className="text-xs uppercase tracking-wider text-red-400/70 hover:text-red-400">
                  Xóa
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {formMode && (
        <AdminModal
          title={formMode.type === 'create' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
          onClose={() => setFormMode(null)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Tên sản phẩm *">
              <input name="name" required defaultValue={formMode.type === 'edit' ? formMode.product.name : ''} className={adminInputClass} />
            </AdminField>
            <AdminField label="Thương hiệu *">
              <input name="brand" required defaultValue={formMode.type === 'edit' ? formMode.product.brand : 'Moroccanoil'} className={adminInputClass} />
            </AdminField>
            <AdminField label="Mô tả">
              <textarea name="description" rows={3} defaultValue={formMode.type === 'edit' ? formMode.product.description ?? '' : ''} className={adminInputClass} />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Giá (VND) *">
                <input name="price" type="number" min={0} required defaultValue={formMode.type === 'edit' ? formMode.product.price : ''} className={adminInputClass} />
              </AdminField>
              <AdminField label="Tồn kho *">
                <input name="stock" type="number" min={0} required defaultValue={formMode.type === 'edit' ? formMode.product.stock : 10} className={adminInputClass} />
              </AdminField>
            </div>
            <AdminField label={`Gallery ảnh — Google Drive (tối đa ${MAX_PRODUCT_GALLERY}, mỗi dòng 1 link)`}>
              <textarea
                name="galleryUrls"
                rows={7}
                placeholder={
                  'https://drive.google.com/file/d/XXXX/view?usp=sharing\nhttps://drive.google.com/file/d/YYYY/view?usp=sharing'
                }
                defaultValue={
                  formMode.type === 'edit' ? galleryToTextarea(getProductGallery(formMode.product)) : ''
                }
                className={`${adminInputClass} resize-y font-mono text-xs`}
              />
            </AdminField>
            <AdminField label="Video — Google Drive hoặc YouTube (tùy chọn)">
              <input
                name="videoUrl"
                placeholder="https://drive.google.com/file/d/XXXX/view?usp=sharing"
                defaultValue={formMode.type === 'edit' ? formMode.product.videoUrl ?? '' : ''}
                className={adminInputClass}
              />
            </AdminField>
            {storageEnabled && (
              <AdminField label="Hoặc upload 1 ảnh lên Storage (thêm vào gallery)">
                <input type="file" name="imageFile" accept="image/*" className="text-xs text-zinc-500" />
              </AdminField>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" name="isActive" defaultChecked={formMode.type === 'edit' ? formMode.product.isActive : true} />
              Hiển thị trên catalog
            </label>
            <AdminFormActions onCancel={() => setFormMode(null)} submitLabel={formMode.type === 'edit' ? 'Cập nhật' : 'Tạo mới'} loading={saving} />
          </form>
        </AdminModal>
      )}
    </div>
  )
}

function toUpdateRequest(product: ProductResponse, isActive: boolean): UpdateProductRequest {
  const gallery = getProductGallery(product)
  return {
    name: product.name,
    description: product.description,
    brand: product.brand,
    price: product.price,
    stock: product.stock,
    imageUrl: gallery[0] ?? null,
    galleryUrls: gallery,
    videoUrl: product.videoUrl,
    isActive,
  }
}
