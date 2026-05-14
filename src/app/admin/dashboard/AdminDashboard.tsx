import { Users, Calendar, TrendingUp, Clock, AlertTriangle, MessageCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardKPIs, usePagos } from '@/hooks/usePagos'
import { useClases } from '@/hooks/useClases'
import { formatCLP, formatFecha, fechaHoy, formatHora } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { BadgeClase, BadgePago } from '@/components/ui/Badge'
import { openWA_cobrar } from '@/lib/whatsapp'
import type { Plan } from '@/types'

function KpiCard({ title, value, icon: Icon, color, subtitle }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtitle?: string
}) {
  return (
    <div className="card-akira p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-akira-muted text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-akira-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { kpis, loading: kpisLoading, ingresosMensuales } = useDashboardKPIs()
  const { clases, loading: clasesLoading } = useClases(fechaHoy())
  const { pagos: pagosPendientes, loading: pagosLoading } = usePagos()

  const pendientes = pagosPendientes.filter((p) => p.estado === 'pendiente').slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-white tracking-wide">DASHBOARD</h1>
        <p className="text-akira-muted text-sm mt-1">{formatFecha(fechaHoy(), "EEEE d 'de' MMMM yyyy")}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard title="Alumnos activos" value={kpis.alumnos_activos} icon={Users} color="bg-blue-500/10 text-blue-400" />
            <KpiCard title="Clases hoy" value={kpis.clases_hoy} icon={Calendar} color="bg-green-500/10 text-green-400" />
            <KpiCard title="Ingresos del mes" value={formatCLP(kpis.ingresos_mes)} icon={TrendingUp} color="bg-akira-red/10 text-akira-red" />
            <KpiCard
              title="Pagos pendientes"
              value={kpis.pagos_pendientes}
              icon={Clock}
              color="bg-yellow-500/10 text-yellow-400"
            />
          </>
        )}
      </div>

      {/* Alerta membresías por vencer */}
      {!kpisLoading && kpis.membresias_por_vencer > 0 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-300 text-sm">
            <span className="font-semibold">{kpis.membresias_por_vencer} membresías</span> vencen en los próximos 7 días.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico ingresos */}
        <div className="card-akira p-5">
          <h2 className="text-white font-semibold mb-4">Ingresos últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ingresosMensuales}>
              <defs>
                <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8000D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8000D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="mes" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid #2A2A2A', borderRadius: 8 }}
                labelStyle={{ color: '#F5F5F5' }}
                formatter={(v: number) => [formatCLP(v), 'Ingresos']}
              />
              <Area type="monotone" dataKey="total" stroke="#E8000D" strokeWidth={2} fill="url(#colorIngreso)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clases del día */}
        <div className="card-akira p-5">
          <h2 className="text-white font-semibold mb-4">Clases de hoy</h2>
          {clasesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : clases.length === 0 ? (
            <p className="text-akira-muted text-sm text-center py-8">No hay clases programadas para hoy</p>
          ) : (
            <div className="space-y-2">
              {clases.map((clase) => (
                <div key={clase.id} className="flex items-center justify-between p-3 bg-akira-darker rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: clase.disciplina?.color ?? '#E8000D' }}
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{clase.disciplina?.nombre}</p>
                      <p className="text-akira-muted text-xs">{formatHora(clase.hora_inicio)} — {formatHora(clase.hora_fin)} · {clase.cupos_ocupados}/{clase.cupos_max} cupos</p>
                    </div>
                  </div>
                  <BadgeClase estado={clase.estado} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagos pendientes */}
      <div className="card-akira p-5">
        <h2 className="text-white font-semibold mb-4">Pagos pendientes</h2>
        {pagosLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
        ) : pendientes.length === 0 ? (
          <p className="text-akira-muted text-sm text-center py-8">No hay pagos pendientes</p>
        ) : (
          <div className="space-y-2">
            {pendientes.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between p-3 bg-akira-darker rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">
                    {pago.alumno?.nombre} {pago.alumno?.apellido}
                  </p>
                  <p className="text-akira-muted text-xs">{formatCLP(pago.monto)} · {formatFecha(pago.fecha_pago)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BadgePago estado={pago.estado} />
                  {pago.alumno && pago.membresia?.plan && (
                    <button
                      onClick={() => openWA_cobrar(
                        pago.alumno!,
                        pago.membresia!.plan as Plan,
                        pago.membresia!.fecha_fin
                      )}
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Cobrar por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
