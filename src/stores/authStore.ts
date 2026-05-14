import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: Profile | null
  loading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw new Error(error.message)
        set({ user: data })
      },

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) throw new Error('No se pudo cargar el perfil')
          set({ user: profile })
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    {
      name: 'akira-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
