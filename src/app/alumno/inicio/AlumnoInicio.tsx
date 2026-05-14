import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Calendar, CreditCard, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { formatFecha, formatCLP, diasRestantes, porcentajeAsistencia } from '@/lib/utils'
import { BadgeMembresia } from '@/components/ui/Badge'
import { openWA_consultaGeneral } from '@/lib/whatsapp'
import type { Membresia, Clase } from '@/types'

export function AlumnoInicio() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [membresia, setMembresia] = useState<Membresia | null>(null)
  const [proximasClases, setProximasClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('membresias')
        .select('*, plan:planes(*)')
        .eq('alumno_id', user.id)
        .eq('estado', 'activa')
        .single(),
      supabase
        .from('reservas')
        .select('clase:clases(*, disciplina:disciplinas(nombre, color), instructor:profiles!clases_instructor_id_fkey(nombre, apellido))')
        .eq('alumno_id', user.id)
        .in('estado', ['confirmada'])
        .gte('clase.fecha', new Date().toISOString().split('T')[0])
        .order('clase.fecha', { ascending: true })
        .limit(3),
    ]).then(([membresiaRes, reservasRes]) => {
      if (membresiaRes.data) setMembresia(membresiaRes.data)
      if (reservasRes.data) {
        setProximasClases(reservasRes.data.map((r: any) => r.clase).filter(Boolean))
      }
      setLoading(false)
    })
  }, [user])

  if (!user) return null

  const dias = membresia ? diasRestantes(membresia.fecha_fin) : null
  const pct = membresia?.plan?.clases_incluidas
    ? porcentajeAsistencia(membresia.clases_usadas, membresia.plan.clases_incluidas)
    : null

  return (
    <div className="space-y-5">
      {/* Saludo */}
      <div>
        <h1 className="font-display text-3xl text-white tracking-wider">
          ¡Hola, {user.nombre}! 🥊
        </h1>
        <p className="text-akira-muted text-sm mt-1">{formatFecha(new Date().toISOString())}</p>
      </div>

      {/* Alerta vencimiento */}
      {membresia && dias !== null && dias <= 7 && dias >= 0 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-300 text-sm">
            Tu membresía vence en <span className="font-semibold">{dias === 0 ? 'hoy' : `${dias} días`}</span>. ¡Renueva para seguir entrenando!
          </p>
        </div>
      )}

      {/* Estado membresía */}
      <div className="card-akira p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Mi membresía</h2>
          {membresia && <BadgeMembresia estado={membresia.estado} />}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-5 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        ) : membresia ? (
          <>
            <p className="text-akira-red font-bold text-lg">{membresia.plan?.nombre}</p>
            <p className="text-akira-muted text-sm">{formatCLP(membresia.plan?.precio ?? 0)}</p>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-akira-muted">Vence</span>
                <span className={`${dias !== null && dias <= 7 ? 'text-yellow-400' : 'text-white'}`}>
                  {formatFecha(membresia.fecha_fin)} {dias !== null && `(${dias}d)`}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-akira-muted">Clases</span>
                <span className="text-white">
                  {membresia.clases_usadas}
                  {membresia.plan?.clases_incluidas ? `/${membresia.plan.clases_incluidas}` : ' usadas'}
                </span>
              </div>

              {pct !== null && (
                <div>
                  <div className="h-1.5 bg-akira-darker rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-akira-red rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-akira-muted text-sm mb-3">No tienes una membresía activa</p>
            <button
              onClick={() => navigate('/alumno/plan')}
              className="btn-primary text-sm"
            >
              Ver planes
            </button>
          </div>
        )}
      </div>

      {/* Próximas clases */}
      <div className="card-akira p-5">
        <h2 className="text-white font-semibold mb-3">Próximas clases</h2>
        {proximasClases.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-akira-muted text-sm mb-3">No tienes clases reservadas</p>
            <button onClick={() => navigate('/alumno/clases')} className="btn-primary text-sm">
              Reservar clase
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {proximasClases.map((clase) => (
              <div key={clase.id} className="flex items-center gap-3 p-3 bg-akira-darker rounded-lg">
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: clase.disciplina?.color ?? '#E8000D' }}
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{clase.disciplina?.nombre}</p>
                  <p className="text-akira-muted text-xs">{formatFecha(clase.fecha)} · {clase.hora_inicio.substring(0, 5)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/alumno/clases')}
          className="card-akira p-4 flex flex-col items-center gap-2 hover:border-akira-red/40 transition-colors"
        >
          <Calendar className="w-6 h-6 text-akira-red" />
          <span className="text-xs text-akira-muted text-center">Reservar</span>
        </button>
        <button
          onClick={() => navigate('/alumno/plan')}
          className="card-akira p-4 flex flex-col items-center gap-2 hover:border-akira-red/40 transition-colors"
        >
          <CreditCard className="w-6 h-6 text-akira-red" />
          <span className="text-xs text-akira-muted text-center">Pagar</span>
        </button>
        <button
          onClick={() => user && openWA_consultaGeneral(user)}
          className="card-akira p-4 flex flex-col items-center gap-2 hover:border-akira-red/40 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-green-400" />
          <span className="text-xs text-akira-muted text-center">Contactar</span>
        </button>
      </div>
    </div>
  )
}
