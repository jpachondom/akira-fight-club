import { useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alumnoSchema, type AlumnoInput } from '@/schemas'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalCrearAlumno({ open, onClose, onSuccess }: Props) {
  const { toast } = useUIStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlumnoInput>({
    resolver: zodResolver(alumnoSchema),
  })

  if (!open) return null

  const onSubmit = async (data: AlumnoInput) => {
    setLoading(true)
    try {
      // Crear usuario con signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password ?? 'Akira2024!',
        options: {
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            rol: 'alumno',
          },
        },
      })

      if (authError) throw authError

      // Actualizar perfil con datos adicionales
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            telefono: data.telefono || null,
            fecha_nacimiento: data.fecha_nacimiento || null,
          })
          .eq('id', authData.user.id)
      }

      toast.success('Alumno creado exitosamente')
      reset()
      onClose()
      onSuccess()
    } catch (err) {
      toast.error('Error al crear alumno', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-akira-border">
          <h2 className="text-white font-semibold">Nuevo alumno</h2>
          <button onClick={onClose} className="p-1 rounded text-akira-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-akira-muted mb-1">Nombre</label>
              <input {...register('nombre')} className="input-field" placeholder="Juan" />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-akira-muted mb-1">Apellido</label>
              <input {...register('apellido')} className="input-field" placeholder="Pérez" />
              {errors.apellido && <p className="text-red-400 text-xs mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="juan@email.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Teléfono (opcional)</label>
            <input {...register('telefono')} className="input-field" placeholder="+56 9 1234 5678" />
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Fecha de nacimiento (opcional)</label>
            <input {...register('fecha_nacimiento')} type="date" className="input-field" />
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Contraseña inicial</label>
            <input {...register('password')} type="text" className="input-field" placeholder="Akira2024!" />
            <p className="text-akira-muted text-xs mt-1">El alumno puede cambiarla desde su perfil</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted hover:text-white transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? 'Creando...' : 'Crear alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
