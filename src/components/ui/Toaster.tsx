import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-fade-in',
            toast.type === 'success' && 'bg-green-950 border-green-800 text-green-100',
            toast.type === 'error' && 'bg-red-950 border-red-800 text-red-100',
            toast.type === 'info' && 'bg-blue-950 border-blue-800 text-blue-100',
            toast.type === 'warning' && 'bg-yellow-950 border-yellow-800 text-yellow-100',
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <Info className="w-5 h-5 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{toast.title}</p>
            {toast.description && (
              <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
