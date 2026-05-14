import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pago } from '@/types'
import { useUIStore } from '@/stores/uiStore'

export function usePagos(alumnoId?: string) {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useUIStore()

  const fetchPagos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('pagos')
        .select(`
          *,
          alumno:profiles!pagos_alumno_id_fkey (id, nombre, apellido, telefono),
          membresia:membresias (id, fecha_inicio, fecha_fin, plan:planes (nombre, precio))
        `)
        .order('fecha_pago', { ascending: false })

      if (alumnoId) query = query.eq('alumno_id', alumnoId)

      const { data, error } = await query
      if (error) throw error
      setPagos(data ?? [])
    } catch (err) {
      toast.error('Error al cargar pagos', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPagos() }, [alumnoId])

  return { pagos, loading, refetch: fetchPagos }
}

export function useDashboardKPIs() {
  const [kpis, setKpis] = useState({
    alumnos_activos: 0,
    clases_hoy: 0,
    ingresos_mes: 0,
    pagos_pendientes: 0,
    membresias_por_vencer: 0,
  })
  const [loading, setLoading] = useState(true)
  const [ingresosMensuales, setIngresosMensuales] = useState<Array<{ mes: string; total: number }>>([])

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const en7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    Promise.all([
      supabase.from('membresias').select('id', { count: 'exact' }).eq('estado', 'activa'),
      supabase.from('clases').select('id', { count: 'exact' }).eq('fecha', hoy),
      supabase.from('pagos').select('monto').eq('estado', 'pagado').gte('fecha_pago', primerDiaMes),
      supabase.from('pagos').select('id', { count: 'exact' }).eq('estado', 'pendiente'),
      supabase.from('membresias').select('id', { count: 'exact' }).eq('estado', 'activa').lte('fecha_fin', en7Dias),
    ]).then(([activos, clasesHoy, pagosMes, pendientes, porVencer]) => {
      const ingresosMes = (pagosMes.data ?? []).reduce((sum, p) => sum + (p.monto ?? 0), 0)
      setKpis({
        alumnos_activos: activos.count ?? 0,
        clases_hoy: clasesHoy.count ?? 0,
        ingresos_mes: ingresosMes,
        pagos_pendientes: pendientes.count ?? 0,
        membresias_por_vencer: porVencer.count ?? 0,
      })
      setLoading(false)
    })

    // Ingresos últimos 6 meses
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    }).reverse()

    Promise.all(
      meses.map(({ year, month }) => {
        const inicio = `${year}-${String(month).padStart(2, '0')}-01`
        const fin = new Date(year, month, 0).toISOString().split('T')[0]
        return supabase
          .from('pagos')
          .select('monto')
          .eq('estado', 'pagado')
          .gte('fecha_pago', inicio)
          .lte('fecha_pago', fin)
          .then(({ data }) => ({
            mes: new Date(year, month - 1).toLocaleString('es-CL', { month: 'short' }),
            total: (data ?? []).reduce((s, p) => s + (p.monto ?? 0), 0),
          }))
      })
    ).then(setIngresosMensuales)
  }, [])

  return { kpis, loading, ingresosMensuales }
}
