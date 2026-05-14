import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pagoSchema, type PagoInput } from '@/schemas'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { fechaHoy } from '@/lib/utils'
import type { Profile, Plan, Membresia } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalRegistrarPago({ open, onClose, onSuccess }: Props) {
  const { toast } = useUIStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [alumnos, setAlumnos] = useState<Profile[]>([])
  const [planes, setPlanes] = useState<Plan[]>([])
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string>('')
  const [membresias, setMembresias] = useState<Membresia[]>([])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PagoInput>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      estado: 'pagado',
      metodo: 'efectivo',
      fecha_pago: fechaHoy(),
      membresia_id: null,
    },
  })

  useEffect(() => {
    if (!open) return
    Promise.all([
      supabase.from('profiles').select('*').eq('rol', 'alumno').order('nombre'),
      supabase.from('planes').select('*').eq('activo', true).order('precio'),
    ]).then(([a, p]) => {
      if (a.data) setAlumnos(a.data)
      if (p.data) setPlanes(p.data)
    })
  }, [open])

  useEffect(() => {
    if (!alumnoSeleccionado) return
    setValue('alumno_id', alumnoSeleccionado)
    supabase
      .from('membresias')
      .select('*, plan:planes(nombre)')
      .eq('alumno_id', alumnoSeleccionado)
      .order('fecha_inicio', { ascending: false })
      .limit(5)
      .then(({ data }) => setMembresias(data ?? []))
  }, [alumnoSeleccionado, setValue])

  const planSeleccionado = watch('membresia_id')

  if (!open) return null

  const onSubmit = async (data: PagoInput) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('pagos').insert({
        ...data,
        created_by: user?.id ?? null,
      })
      if (error) throw error
      toast.success('Pago registrado')
      reset()
      setAlumnoSeleccionado('')
      onClose()
      onSuccess()
    } catch (err) {
      toast.error('Error al registrar pago', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-akira-border">
          <h2 className="text-white font-semibold">Registrar pago</h2>
          <button onClick={onClose} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-akira-muted mb-1">Alumno</label>
            <select
              value={alumnoSeleccionado}
              onChange={(e) => setAlumnoSeleccionado(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar alumno...</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
              ))}
            </select>
            {errors.alumno_id && <p className="text-red-400 text-xs mt-1">Requerido</p>}
          </div>

          {alumnoSeleccionado && membresias.length > 0 && (
            <div>
              <label className="block text-sm text-akira-muted mb-1">Membresía (opcional)</label>
              <select {...register('membresia_id')} className="input-field">
                <option value="">Sin membresía específica</option>
                {membresias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.plan?.nombre} — {m.fecha_inicio} al {m.fecha_fin}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-akira-muted mb-1">Monto (CLP)</label>
            <input
              {...register('monto', { valueAsNumber: true })}
              type="number"
              className="input-field"
              placeholder="35000"
            />
            {errors.monto && <p className="text-red-400 text-xs mt-1">{errors.monto.message}</p>}
            {/* Sugerencias de precios */}
            <div className="flex flex-wrap gap-2 mt-2">
              {planes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setValue('monto', p.precio)}
                  className="px-2 py-1 text-xs bg-akira-darker border border-akira-border rounded text-akira-muted hover:text-white hover:border-akira-red/50 transition-colors"
                >
                  {p.nombre}: ${p.precio.toLocaleString('es-CL')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-akira-muted mb-1">Método de pago</label>
              <select {...register('metodo')} className="input-field">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="debito">Débito</option>
                <option value="webpay">Webpay</option>
                <option value="mercadopago">Mercado Pago</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-akira-muted mb-1">Estado</label>
              <select {...register('estado')} className="input-field">
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Fecha de pago</label>
            <input {...register('fecha_pago')} type="date" className="input-field" />
          </div>

          <div>
            <label className="block text-sm text-akira-muted mb-1">Notas (opcional)</label>
            <textarea {...register('notas')} className="input-field resize-none" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
