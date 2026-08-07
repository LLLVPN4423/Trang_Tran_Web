import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  moduleName: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.moduleName}]`, error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center bg-zinc-950 px-6 py-24 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
            {this.props.moduleName}
          </p>
          <h2 className="font-serif text-3xl text-zinc-300">Đang bảo trì</h2>
          <p className="mt-3 max-w-md text-sm text-zinc-500">
            Module này tạm thời gặp sự cố. Các phần khác của trang vẫn hoạt động bình thường.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-8 border border-zinc-700 px-6 py-2 text-xs uppercase tracking-widest text-zinc-400 transition hover:border-gold hover:text-gold"
          >
            Thử lại
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
