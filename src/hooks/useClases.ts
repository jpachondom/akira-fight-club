import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Clase } from '@/types'
import { useUIStore } from '@/stores/uiStore'

export function useClases(fecha?: string) {
  const [clases, setClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useUIStore()

  const fetchClases = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('clases')
        .select(`
          *,
          disciplina:disciplinas (id, nombre, color),
          instructor:profiles!clases_instructor_id_fkey (id, nombre, apellido)
        `)
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (fecha) query = query.eq('fecha', fecha)

      const { data, error } = await query
      if (error) throw error
      setClases(data ?? [])
    } catch (err) {
      toast.error('Error al cargar clases', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClases() }, [fecha])

  return { clases, loading, refetch: fetchClases }
}

export function useClaseDetalle(claseId: string) {
  const [clase, setClase] = useState<Clase | null>(null)
  const [reservas, setReservas] = useState<Array<{
    id: string
    alumno_id: string
    estado: string
    alumno: { nombre: string; apellido: string; foto_url: string | null }
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!claseId) return
    Promise.all([
      supabase
        .from('clases')
        .select('*, disciplina:disciplinas(*), instructor:profiles!clases_instructor_id_fkey(*)')
        .eq('id', claseId)
        .single(),
      supabase
        .from('reservas')
        .select('id, alumno_id, estado, alumno:profiles!reservas_alumno_id_fkey(nombre, apellido, foto_url)')
        .eq('clase_id', claseId)
        .neq('estado', 'cancelada'),
    ]).then(([claseRes, reservasRes]) => {
      if (claseRes.data) setClase(claseRes.data)
      if (reservasRes.data) setReservas(reservasRes.data as unknown as typeof reservas)
      setLoading(false)
    })
  }, [claseId])

  return { clase, reservas, loading }
}
