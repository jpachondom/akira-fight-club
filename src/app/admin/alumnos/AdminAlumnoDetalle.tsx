import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Phone, Mail, Calendar } from 'lucide-react'
import { useAlumno } from '@/hooks/useAlumnos'
import { usePagos } from '@/hooks/usePagos'
import { formatFecha, formatCLP, diasRestantes, porcentajeAsistencia } from '@/lib/utils'
import { BadgeMembresia, BadgePago } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { openWA_consultaGeneral, openWA_renovarPlan } from '@/lib/whatsapp'
import type { Plan } from '@/types'

export function AdminAlumnoDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { alumno, loading } = useAlumno(id!)
  const { pagos } = usePagos(id)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    )
  }

  if (!alumno) {
    return (
      <div className="text-center py-16">
        <p className="text-akira-muted">Alumno no encontrado</p>
        <button onClick={() => navigate('/admin/alumnos')} className="btn-primary mt-4">Volver</button>
      </div>
    )
  }

  const membresia = alumno.membresia_activa
  const dias = membresia ? diasRestantes(membresia.fecha_fin) : null
  const clases_usadas = membresia?.clases_usadas ?? 0
  const clases_incluidas = membresia?.plan?.clases_incluidas ?? null
  const pct = clases_incluidas ? porcentajeAsistencia(clases_usadas, clases_incluidas) : null

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/admin/alumnos')} className="flex items-center gap-2 text-akira-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Volver a alumnos
      </button>

      {/* Perfil */}
      <div className="card-akira p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Avatar nombre={alumno.nombre} apellido={alumno.apellido} foto={alumno.foto_url} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{alumno.nombre} {alumno.apellido}</h1>
                <p className="text-akira-muted text-sm">{alumno.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openWA_consultaGeneral(alumno)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {alumno.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-akira-muted" />
                  <span className="text-akira-muted">{alumno.telefono}</span>
                </div>
              )}
              {alumno.fecha_nacimiento && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-akira-muted" />
                  <span className="text-akira-muted">{formatFecha(alumno.fecha_nacimiento)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-akira-muted" />
                <span className="text-akira-muted">Desde {formatFecha(alumno.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membresía activa */}
      <div className="card-akira p-5">
        <h2 className="text-white font-semibold mb-4">Membresía actual</h2>
        {membresia ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{membresia.plan?.nombre}</p>
                <p className="text-akira-muted text-sm">{formatCLP(membresia.plan?.precio ?? 0)}</p>
              </div>
              <BadgeMembresia estado={membresia.estado} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-akira-muted">Inicio</p>
                <p className="text-white">{formatFecha(membresia.fecha_inicio)}</p>
              </div>
              <div>
                <p className="text-akira-muted">Vencimiento</p>
                <p className={`${dias !== null && dias <= 7 ? 'text-yellow-400' : 'text-white'}`}>
                  {formatFecha(membresia.fecha_fin)}
                  {dias !== null && <span className="text-xs ml-1">({dias}d)</span>}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-akira-muted">Clases usadas</span>
                <span className="text-white">{clases_usadas}{clases_incluidas ? `/${clases_incluidas}` : ''}</span>
              </div>
              {pct !== null && (
                <div className="h-1.5 bg-akira-darker rounded-full overflow-hidden">
                  <div className="h-full bg-akira-red rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            {membresia.plan && (
              <button
                onClick={() => openWA_renovarPlan(alumno, membresia.plan as Plan)}
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Notificar renovación por WhatsApp
              </button>
            )}
          </div>
        ) : (
          <p className="text-akira-muted text-sm">Este alumno no tiene una membresía activa</p>
        )}
      </div>

      {/* Historial de pagos */}
      <div className="card-akira p-5">
        <h2 className="text-white font-semibold mb-4">Historial de pagos</h2>
        {pagos.length === 0 ? (
          <p className="text-akira-muted text-sm">Sin historial de pagos</p>
        ) : (
          <div className="space-y-2">
            {pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between p-3 bg-akira-darker rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{formatCLP(pago.monto)}</p>
                  <p className="text-akira-muted text-xs">{pago.metodo} · {formatFecha(pago.fecha_pago)}</p>
                </div>
                <BadgePago estado={pago.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
