import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
}

interface UIState {
  sidebarOpen: boolean
  toasts: Toast[]
  setSidebarOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toast: {
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
    info: (title: string, description?: string) => void
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toast: {
    success: (title, description) =>
      get().addToast({ type: 'success', title, description }),
    error: (title, description) =>
      get().addToast({ type: 'error', title, description }),
    info: (title, description) =>
      get().addToast({ type: 'info', title, description }),
  },
}))
