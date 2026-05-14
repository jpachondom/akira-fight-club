import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { formatCLP, formatFecha, diasRestantes } from '@/lib/utils'
import { BadgeMembresia, BadgePago } from '@/components/ui/Badge'
import { generarLinkPagoAlumno } from '@/lib/whatsapp'
import { BotonPago } from '@/components/alumno/BotonPago'
import type { Membresia, Plan, Pago } from '@/types'

export function AlumnoPlan() {
  const { user } = useAuthStore()
  const [membresia, setMembresia] = useState<Membresia | null>(null)
  const [planes, setPlanes] = useState<Plan[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('membresias').select('*, plan:planes(*)').eq('alumno_id', user.id).eq('estado', 'activa').single(),
      supabase.from('planes').select('*').eq('activo', true).order('precio'),
      supabase.from('pagos').select('*').eq('alumno_id', user.id).order('fecha_pago', { ascending: false }).limit(10),
    ]).then(([m, p, pa]) => {
      if (m.data) setMembresia(m.data)
      if (p.data) setPlanes(p.data)
      if (pa.data) setPagos(pa.data)
      setLoading(false)
    })
  }, [user])

  const dias = membresia ? diasRestantes(membresia.fecha_fin) : null

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-white tracking-wider">MI PLAN</h1>

      {/* Membresía actual */}
      {!loading && membresia && (
        <div className="card-akira p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Membresía activa</h2>
            <BadgeMembresia estado={membresia.estado} />
          </div>
          <p className="text-akira-red font-bold text-xl">{membresia.plan?.nombre}</p>
          <p className="text-akira-muted text-sm">{formatCLP(membresia.plan?.precio ?? 0)}</p>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <p className="text-akira-muted">Inicio</p>
              <p className="text-white">{formatFecha(membresia.fecha_inicio)}</p>
            </div>
            <div>
              <p className="text-akira-muted">Vencimiento</p>
              <p className={dias !== null && dias <= 7 ? 'text-yellow-400' : 'text-white'}>
                {formatFecha(membresia.fecha_fin)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planes disponibles */}
      <div>
        <h2 className="text-white font-semibold mb-3">Planes disponibles</h2>
        <div className="space-y-3">
          {planes.map((plan) => {
            const link = user ? generarLinkPagoAlumno(user, plan) : '#'
            const esActual = membresia?.plan_id === plan.id
            return (
              <div
                key={plan.id}
                className={`card-akira p-4 ${esActual ? 'border-akira-red/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{plan.nombre}</p>
                      {esActual && (
                        <span className="text-xs bg-akira-red/10 text-akira-red border border-akira-red/30 px-2 py-0.5 rounded-full">
                          Tu plan actual
                        </span>
                      )}
                    </div>
                    <p className="text-akira-red font-bold text-xl mt-1">{formatCLP(plan.precio)}</p>
                    <p className="text-akira-muted text-xs mt-0.5">
                      {plan.duracion_dias} días
                      {plan.clases_incluidas ? ` · ${plan.clases_incluidas} clases` : ' · Clases ilimitadas'}
                    </p>
                    {plan.descripcion && (
                      <p className="text-akira-muted text-xs mt-1">{plan.descripcion}</p>
                    )}
                    {plan.clases_incluidas === null && (
                      <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                        <Check className="w-3 h-3" />
                        Clases ilimitadas incluidas
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <BotonPago plan={plan} />
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-center text-akira-muted hover:text-green-400 transition-colors">
                      Pagar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historial de pagos */}
      {pagos.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Historial de pagos</h2>
          <div className="space-y-2">
            {pagos.map((pago) => (
              <div key={pago.id} className="card-akira p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{formatCLP(pago.monto)}</p>
                  <p className="text-akira-muted text-xs">{formatFecha(pago.fecha_pago)} · {pago.metodo}</p>
                </div>
                <BadgePago estado={pago.estado} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
