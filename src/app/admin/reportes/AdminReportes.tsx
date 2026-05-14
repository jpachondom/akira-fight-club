import { useState, useEffect } from 'react'
import { Download, TrendingUp, Users, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCLP } from '@/lib/utils'
import { exportPagosPDF, exportPagosExcel } from '@/lib/exports'

const COLORS = ['#E8000D', '#FF6B00', '#8B00FF', '#0066FF', '#00CC88']

export function AdminReportes() {
  const [tab, setTab] = useState<'ingresos' | 'membresias' | 'ocupacion'>('ingresos')
  const [ingresosPorPlan, setIngresosPorPlan] = useState<Array<{ nombre: string; total: number }>>([])
  const [ingresosPorMetodo, setIngresosPorMetodo] = useState<Array<{ metodo: string; total: number }>>([])
  const [estadoMembresias, setEstadoMembresias] = useState<Array<{ name: string; value: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [pagosRes, membresiasRes] = await Promise.all([
        supabase
          .from('pagos')
          .select('monto, metodo, membresia:membresias(plan:planes(nombre))')
          .eq('estado', 'pagado'),
        supabase.from('membresias').select('estado'),
      ])

      if (pagosRes.data) {
        // Por plan
        const porPlan: Record<string, number> = {}
        pagosRes.data.forEach((p: any) => {
          const nombre = p.membresia?.plan?.nombre ?? 'Sin plan'
          porPlan[nombre] = (porPlan[nombre] ?? 0) + p.monto
        })
        setIngresosPorPlan(Object.entries(porPlan).map(([nombre, total]) => ({ nombre, total })))

        // Por método
        const porMetodo: Record<string, number> = {}
        pagosRes.data.forEach((p: any) => {
          porMetodo[p.metodo] = (porMetodo[p.metodo] ?? 0) + p.monto
        })
        setIngresosPorMetodo(Object.entries(porMetodo).map(([metodo, total]) => ({ metodo, total })))
      }

      if (membresiasRes.data) {
        const conteo: Record<string, number> = {}
        membresiasRes.data.forEach((m) => {
          conteo[m.estado] = (conteo[m.estado] ?? 0) + 1
        })
        const labels: Record<string, string> = {
          activa: 'Activas',
          vencida: 'Vencidas',
          cancelada: 'Canceladas',
          pendiente_pago: 'Pendientes',
        }
        setEstadoMembresias(Object.entries(conteo).map(([k, v]) => ({ name: labels[k] ?? k, value: v })))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-white tracking-wide">REPORTES</h1>
        <button
          onClick={() => exportPagosPDF([])}
          className="flex items-center gap-2 px-3 py-2.5 bg-akira-dark border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-akira-border">
        {[
          { key: 'ingresos', label: 'Ingresos', icon: TrendingUp },
          { key: 'membresias', label: 'Membresías', icon: Users },
          { key: 'ocupacion', label: 'Ocupación', icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-akira-red text-akira-red'
                : 'border-transparent text-akira-muted hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      ) : tab === 'ingresos' ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card-akira p-5">
            <h2 className="text-white font-semibold mb-4">Ingresos por plan</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ingresosPorPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="nombre" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #2A2A2A', borderRadius: 8 }}
                  formatter={(v: number) => [formatCLP(v), 'Total']}
                />
                <Bar dataKey="total" fill="#E8000D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-akira p-5">
            <h2 className="text-white font-semibold mb-4">Ingresos por método de pago</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ingresosPorMetodo}
                  dataKey="total"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ metodo, percent }) => `${metodo} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#444' }}
                >
                  {ingresosPorMetodo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #2A2A2A', borderRadius: 8 }}
                  formatter={(v: number) => [formatCLP(v), 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : tab === 'membresias' ? (
        <div className="card-akira p-5">
          <h2 className="text-white font-semibold mb-4">Estado de membresías</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadoMembresias}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {estadoMembresias.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #2A2A2A', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card-akira p-8 text-center">
          <p className="text-akira-muted">Reporte de ocupación disponible próximamente</p>
        </div>
      )}
    </div>
  )
}
