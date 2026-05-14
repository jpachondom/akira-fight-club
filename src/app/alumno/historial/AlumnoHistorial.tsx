import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Flame } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { formatFecha, formatHora, porcentajeAsistencia } from '@/lib/utils'

interface RegistroAsistencia {
  id: string
  presente: boolean
  created_at: string
  clase: {
    fecha: string
    hora_inicio: string
    disciplina: { nombre: string; color: string }
  }
}

export function AlumnoHistorial() {
  const { user } = useAuthStore()
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('asistencia')
      .select(`
        id, presente, created_at,
        clase:clases(fecha, hora_inicio, disciplina:disciplinas(nombre, color))
      `)
      .eq('alumno_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRegistros((data ?? []) as unknown as RegistroAsistencia[])
        setLoading(false)
      })
  }, [user])

  const asistidas = registros.filter((r) => r.presente).length
  const total = registros.length
  const pct = porcentajeAsistencia(asistidas, total)

  // Calcular racha consecutiva
  const racha = registros.reduce((max, r, i) => {
    if (!r.presente) return max
    let streak = 1
    for (let j = i - 1; j >= 0; j--) {
      if (registros[j].presente) streak++
      else break
    }
    return Math.max(max, streak)
  }, 0)

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-white tracking-wider">HISTORIAL</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-akira p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-akira-muted text-xs mt-1">Total clases</p>
        </div>
        <div className="card-akira p-4 text-center">
          <p className={`text-2xl font-bold ${pct < 50 ? 'text-red-400' : pct < 75 ? 'text-yellow-400' : 'text-green-400'}`}>
            {pct}%
          </p>
          <p className="text-akira-muted text-xs mt-1">Asistencia</p>
        </div>
        <div className="card-akira p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-400" />
            <p className="text-2xl font-bold text-orange-400">{racha}</p>
          </div>
          <p className="text-akira-muted text-xs mt-1">Racha</p>
        </div>
      </div>

      {/* Barra de asistencia */}
      {total > 0 && (
        <div className="card-akira p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-akira-muted">Asistencia total</span>
            <span className="text-white">{asistidas}/{total}</span>
          </div>
          <div className="h-2 bg-akira-darker rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct < 50 ? 'bg-red-500' : pct < 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de registros */}
      <div>
        <h2 className="text-white font-semibold mb-3">Registro de clases</h2>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : registros.length === 0 ? (
          <div className="card-akira p-8 text-center">
            <p className="text-akira-muted">Aún no tienes clases registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {registros.map((r) => (
              <div key={r.id} className="card-akira p-3 flex items-center gap-3">
                {r.presente
                  ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                }
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: r.clase?.disciplina?.color ?? '#E8000D' }}
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{r.clase?.disciplina?.nombre}</p>
                  <p className="text-akira-muted text-xs">
                    {r.clase?.fecha ? formatFecha(r.clase.fecha) : '—'}
                    {r.clase?.hora_inicio && ` · ${formatHora(r.clase.hora_inicio)}`}
                  </p>
                </div>
                <span className={`text-xs font-medium ${r.presente ? 'text-green-400' : 'text-red-400'}`}>
                  {r.presente ? 'Asistió' : 'No asistió'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
