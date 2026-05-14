import { useState, useRef } from 'react'
import { Camera, Save, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '@/components/ui/Avatar'

interface PerfilForm {
  nombre: string
  apellido: string
  telefono: string
  fecha_nacimiento: string
}

interface PasswordForm {
  nueva_password: string
  confirmar_password: string
}

export function AlumnoPerfil() {
  const { user, fetchProfile } = useAuthStore()
  const { toast } = useUIStore()
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit } = useForm<PerfilForm>({
    defaultValues: {
      nombre: user?.nombre ?? '',
      apellido: user?.apellido ?? '',
      telefono: user?.telefono ?? '',
      fecha_nacimiento: user?.fecha_nacimiento ?? '',
    },
  })

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, watch: watchPass } = useForm<PasswordForm>()

  if (!user) return null

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateError } = await supabase.from('profiles').update({ foto_url: data.publicUrl }).eq('id', user.id)
      if (updateError) throw updateError

      await fetchProfile(user.id)
      toast.success('Foto actualizada')
    } catch (err) {
      toast.error('Error al subir foto', err instanceof Error ? err.message : undefined)
    } finally {
      setUploadingFoto(false)
    }
  }

  const onSavePerfil = async (data: PerfilForm) => {
    setSavingPerfil(true)
    try {
      const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
      if (error) throw error
      await fetchProfile(user.id)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : undefined)
    } finally {
      setSavingPerfil(false)
    }
  }

  const onSavePassword = async (data: PasswordForm) => {
    if (data.nueva_password !== data.confirmar_password) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setSavingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.nueva_password })
      if (error) throw error
      resetPass()
      toast.success('Contraseña actualizada')
    } catch (err) {
      toast.error('Error al cambiar contraseña', err instanceof Error ? err.message : undefined)
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-white tracking-wider">MI PERFIL</h1>

      {/* Foto */}
      <div className="card-akira p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar nombre={user.nombre} apellido={user.apellido} foto={user.foto_url} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingFoto}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-akira-red rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
          </div>
          <div>
            <p className="text-white font-semibold">{user.nombre} {user.apellido}</p>
            <p className="text-akira-muted text-sm">{user.email}</p>
            {uploadingFoto && <p className="text-akira-red text-xs mt-1">Subiendo foto...</p>}
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <form onSubmit={handleSubmit(onSavePerfil)} className="card-akira p-5 space-y-4">
        <h2 className="text-white font-semibold">Datos personales</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-akira-muted mb-1">Nombre</label>
            <input {...register('nombre')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-akira-muted mb-1">Apellido</label>
            <input {...register('apellido')} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-akira-muted mb-1">Teléfono</label>
          <input {...register('telefono')} className="input-field" placeholder="+56 9 1234 5678" />
        </div>

        <div>
          <label className="block text-sm text-akira-muted mb-1">Fecha de nacimiento</label>
          <input {...register('fecha_nacimiento')} type="date" className="input-field" />
        </div>

        <button type="submit" disabled={savingPerfil} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {savingPerfil ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePass(onSavePassword)} className="card-akira p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-akira-muted" />
          <h2 className="text-white font-semibold">Cambiar contraseña</h2>
        </div>

        <div>
          <label className="block text-sm text-akira-muted mb-1">Nueva contraseña</label>
          <input {...regPass('nueva_password', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="••••••••" />
        </div>

        <div>
          <label className="block text-sm text-akira-muted mb-1">Confirmar contraseña</label>
          <input {...regPass('confirmar_password', { required: true })} type="password" className="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={savingPass} className="w-full btn-primary disabled:opacity-50">
          {savingPass ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
