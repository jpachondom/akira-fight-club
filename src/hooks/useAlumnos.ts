import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Membresia } from '@/types'
import { useUIStore } from '@/stores/uiStore'

export interface AlumnoConMembresia extends Profile {
  membresia_activa: Membresia | null
}

export function useAlumnos() {
  const [alumnos, setAlumnos] = useState<AlumnoConMembresia[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useUIStore()

  const fetchAlumnos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          membresias (
            id, plan_id, fecha_inicio, fecha_fin, estado, clases_usadas,
            plan:planes (nombre, precio, duracion_dias, clases_incluidas)
          )
        `)
        .eq('rol', 'alumno')
        .order('created_at', { ascending: false })

      if (error) throw error

      const alumnosConMembresia = (data ?? []).map((a) => {
        const membresias = (a.membresias as Membresia[] | null) ?? []
        const activa = membresias.find((m) => m.estado === 'activa') ?? null
        return { ...a, membresia_activa: activa }
      })

      setAlumnos(alumnosConMembresia)
    } catch (err) {
      toast.error('Error al cargar alumnos', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlumnos() }, [])

  return { alumnos, loading, refetch: fetchAlumnos }
}

export function useAlumno(id: string) {
  const [alumno, setAlumno] = useState<AlumnoConMembresia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('profiles')
      .select(`
        *,
        membresias (*, plan:planes (*))
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const membresias = (data.membresias as Membresia[] | null) ?? []
          const activa = membresias.find((m) => m.estado === 'activa') ?? null
          setAlumno({ ...data, membresia_activa: activa })
        }
        setLoading(false)
      })
  }, [id])

  return { alumno, loading }
}
