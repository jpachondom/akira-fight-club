import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { claseSchema, type ClaseInput } from '@/schemas'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import type { Disciplina, Profile } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  fecha?: string
}

export function ModalCrearClase({ open, onClose, onSuccess, fecha }: Props) {
  const { toast } = useUIStore()
  const [loading, setLoading] = useState(false)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [instructores, setInstructores] = useState<Profile[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClaseInput>({
    resolver: zodResolver(claseSchema),
    defaultValues: { fecha, estado: 'programada', cupos_max: 20 },
  })

  useEffect(() => {
    if (!open) return
    Promise.all([
      supabase.from('disciplinas').select('*').order('nombre'),
      supabase.from('profiles').select('*').in('rol', ['admin', 'instructor']).order('nombre'),
    ]).then(([d, i]) => {
      if (d.data) setDisciplinas(d.data)
      if (i.data) setInstructores(i.data)
    })
  }, [open])

  if (!open) return null

  const onSubmit = async (data: ClaseInput) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('clases').insert(data)
      if (error) throw error
      toast.success('Clase creada')
      reset()
      onClose()
      onSuccess()
    } catch (err) {
      toast.error('Error al crear clase', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-akira-border sticky top-0 bg-akira-dark">
          <h2 className="text-white font-semibold">Nueva clase</h2>
          <button onClick={onClose} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-akira-muted mb-1">Disciplina</label>
            <select {...register('disciplina_id')} className="input-field">
              <option value="">Seleccionar...</option>
              {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            {errors.disciplina_id && <p className="text-red-400 text-xs mt-1">Requerido</p>}
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Instructor</label>
            <select {...register('instructor_id')} className="input-field">
              <option value="">Seleccionar...</option>
              {instructores.map((i) => <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>)}
            </select>
            {errors.instructor_id && <p className="text-red-400 text-xs mt-1">Requerido</p>}
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Fecha</label>
            <input {...register('fecha')} type="date" className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-akira-muted mb-1">Hora inicio</label>
              <input {...register('hora_inicio')} type="time" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-akira-muted mb-1">Hora fin</label>
              <input {...register('hora_fin')} type="time" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-akira-muted mb-1">Sala</label>
              <input {...register('sala')} className="input-field" placeholder="Ring Principal" />
            </div>
            <div>
              <label className="block text-sm text-akira-muted mb-1">Cupos máx.</label>
              <input {...register('cupos_max', { valueAsNumber: true })} type="number" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Notas (opcional)</label>
            <textarea {...register('notas')} className="input-field resize-none" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear clase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
