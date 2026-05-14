import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { formatHora, fechaHoy } from '@/lib/utils'
import type { Clase } from '@/types'

interface ClaseConReserva extends Clase {
  reservado: boolean
  reserva_id?: string
}

export function AlumnoClases() {
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const [diaOffset, setDiaOffset] = useState(0)
  const [clases, setClases] = useState<ClaseConReserva[]>([])
  const [loading, setLoading] = useState(false)
  const [accion, setAccion] = useState<string | null>(null)

  const fechaBase = new Date()
  const fechaSeleccionada = format(addDays(fechaBase, diaOffset), 'yyyy-MM-dd')
  const dias = Array.from({ length: 7 }, (_, i) => addDays(fechaBase, i))

  useEffect(() => {
    if (!user) return
    setLoading(true)

    Promise.all([
      supabase
        .from('clases')
        .select('*, disciplina:disciplinas(nombre, color), instructor:profiles!clases_instructor_id_fkey(nombre, apellido)')
        .eq('fecha', fechaSeleccionada)
        .neq('estado', 'cancelada')
        .order('hora_inicio'),
      supabase
        .from('reservas')
        .select('id, clase_id, estado')
        .eq('alumno_id', user.id)
        .neq('estado', 'cancelada'),
    ]).then(([clasesRes, reservasRes]) => {
      const reservasMap = new Map((reservasRes.data ?? []).map((r) => [r.clase_id, r]))
      setClases(
        (clasesRes.data ?? []).map((c) => {
          const reserva = reservasMap.get(c.id)
          return { ...c, reservado: !!reserva, reserva_id: reserva?.id }
        })
      )
      setLoading(false)
    })
  }, [user, fechaSeleccionada])

  const handleReservar = async (clase: ClaseConReserva) => {
    if (!user) return
    setAccion(clase.id)
    try {
      if (clase.reservado && clase.reserva_id) {
        // Cancelar reserva
        const { error } = await supabase
          .from('reservas')
          .update({ estado: 'cancelada' })
          .eq('id', clase.reserva_id)
        if (error) throw error
        toast.success('Reserva cancelada')
      } else {
        // Verificar cupos
        if (clase.cupos_ocupados >= clase.cupos_max) {
          toast.info('Sin cupos disponibles', 'Puedes quedar en lista de espera')
          return
        }
        const { error } = await supabase
          .from('reservas')
          .insert({ clase_id: clase.id, alumno_id: user.id, estado: 'confirmada' })
        if (error) throw error
        toast.success('¡Clase reservada!')
      }

      // Refrescar
      setClases((prev) =>
        prev.map((c) =>
          c.id === clase.id
            ? {
                ...c,
                reservado: !c.reservado,
                cupos_ocupados: c.reservado ? c.cupos_ocupados - 1 : c.cupos_ocupados + 1,
              }
            : c
        )
      )
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : undefined)
    } finally {
      setAccion(null)
    }
  }

  const cuposColor = (ocupados: number, max: number) => {
    const pct = ocupados / max
    if (pct >= 1) return 'text-red-400'
    if (pct >= 0.75) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-white tracking-wider">CLASES</h1>

      {/* Selector de día */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {dias.map((dia, i) => (
          <button
            key={i}
            onClick={() => setDiaOffset(i)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl min-w-[52px] transition-colors shrink-0 ${
              diaOffset === i
                ? 'bg-akira-red text-white'
                : 'bg-akira-dark border border-akira-border text-akira-muted hover:text-white'
            }`}
          >
            <span className="text-xs uppercase">{format(dia, 'EEE', { locale: es })}</span>
            <span className="text-lg font-bold">{format(dia, 'd')}</span>
          </button>
        ))}
      </div>

      {/* Clases */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : clases.length === 0 ? (
        <div className="card-akira p-8 text-center">
          <p className="text-akira-muted">No hay clases disponibles este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clases.map((clase) => {
            const llena = clase.cupos_ocupados >= clase.cupos_max && !clase.reservado
            return (
              <div
                key={clase.id}
                className={`card-akira p-4 ${clase.reservado ? 'border-akira-red/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className="w-1 h-full min-h-[60px] rounded-full shrink-0"
                      style={{ backgroundColor: clase.disciplina?.color ?? '#E8000D' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{clase.disciplina?.nombre}</p>
                        {clase.reservado && (
                          <span className="flex items-center gap-1 text-akira-red text-xs font-medium">
                            <Check className="w-3 h-3" /> Reservado
                          </span>
                        )}
                      </div>
                      <p className="text-akira-muted text-sm">
                        {formatHora(clase.hora_inicio)} — {formatHora(clase.hora_fin)}
                        {clase.sala && ` · ${clase.sala}`}
                      </p>
                      <p className="text-akira-muted text-xs mt-0.5">
                        {clase.instructor?.nombre} {clase.instructor?.apellido}
                      </p>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${cuposColor(clase.cupos_ocupados, clase.cupos_max)}`}>
                        <Users className="w-3 h-3" />
                        {llena ? 'Sin cupos' : `${clase.cupos_max - clase.cupos_ocupados} cupos disponibles`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReservar(clase)}
                    disabled={accion === clase.id || (llena && !clase.reservado)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      clase.reservado
                        ? 'bg-akira-red/10 text-akira-red hover:bg-akira-red/20'
                        : llena
                        ? 'bg-akira-darker text-akira-muted cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {accion === clase.id ? '...' : clase.reservado ? 'Cancelar' : llena ? 'Sin cupos' : 'Reservar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
