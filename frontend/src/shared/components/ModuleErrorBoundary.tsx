import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  moduleName: string
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string | null
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null }

  static getDerivedStateFromError(error: Error): State {
    const isChunk =
      /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(
        error.message,
      )
    return {
      hasError: true,
      message: isChunk
        ? 'Phiên bản web vừa cập nhật. Vui lòng tải lại trang (Ctrl+F5 hoặc kéo xuống refresh trên điện thoại).'
        : error.message || null,
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.moduleName}]`, error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center bg-canvas px-6 py-24 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-ink-subtle">
            {this.props.moduleName}
          </p>
          <h2 className="font-serif text-3xl text-ink-secondary">Không tải được trang</h2>
          <p className="mt-3 max-w-md text-sm text-ink-subtle">
            {this.state.message ??
              'Module này tạm thời gặp sự cố. Các phần khác của trang vẫn hoạt động bình thường.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (this.state.message?.includes('tải lại trang')) {
                window.location.reload()
                return
              }
              this.setState({ hasError: false, message: null })
            }}
            className="mt-8 border border-edge-strong px-6 py-2 text-xs uppercase tracking-widest text-ink-muted transition hover:border-gold hover:text-gold-300"
          >
            {this.state.message?.includes('tải lại trang') ? 'Tải lại trang' : 'Thử lại'}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
