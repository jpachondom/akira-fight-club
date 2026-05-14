import { useState } from 'react'
import { X } from 'lucide-react'
import { useClaseDetalle } from '@/hooks/useClases'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import type { Clase } from '@/types'

interface Props {
  clase: Clase
  onClose: () => void
  onSuccess: () => void
}

export function ModalTomarAsistencia({ clase, onClose, onSuccess }: Props) {
  const { reservas, loading } = useClaseDetalle(clase.id)
  const { toast } = useUIStore()
  const { user } = useAuthStore()
  const [presentes, setPresentes] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const togglePresente = (alumnoId: string) => {
    setPresentes((prev) => {
      const next = new Set(prev)
      if (next.has(alumnoId)) next.delete(alumnoId)
      else next.add(alumnoId)
      return next
    })
  }

  const guardar = async () => {
    setSaving(true)
    try {
      const registros = reservas.map((r) => ({
        clase_id: clase.id,
        alumno_id: r.alumno_id,
        presente: presentes.has(r.alumno_id),
        tomada_por: user?.id ?? null,
      }))

      const { error } = await supabase
        .from('asistencia')
        .upsert(registros, { onConflict: 'clase_id,alumno_id' })

      if (error) throw error

      // Marcar clase como completada
      await supabase.from('clases').update({ estado: 'completada' }).eq('id', clase.id)

      toast.success('Asistencia registrada')
      onClose()
      onSuccess()
    } catch (err) {
      toast.error('Error al guardar asistencia', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-akira-border">
          <div>
            <h2 className="text-white font-semibold">Tomar asistencia</h2>
            <p className="text-akira-muted text-xs">{clase.disciplina?.nombre} · {clase.hora_inicio.substring(0, 5)}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : reservas.length === 0 ? (
            <p className="text-akira-muted text-sm text-center py-8">No hay alumnos inscritos</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-akira-muted mb-3">
                <span>{reservas.length} alumnos inscritos</span>
                <span>{presentes.size} presentes</span>
              </div>
              {reservas.map((r) => (
                <button
                  key={r.alumno_id}
                  onClick={() => togglePresente(r.alumno_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    presentes.has(r.alumno_id)
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-akira-darker border-akira-border hover:border-akira-muted/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    presentes.has(r.alumno_id) ? 'bg-green-500 border-green-500' : 'border-akira-muted'
                  }`}>
                    {presentes.has(r.alumno_id) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <Avatar nombre={r.alumno.nombre} apellido={r.alumno.apellido} foto={r.alumno.foto_url} size="sm" />
                  <span className="text-white text-sm">{r.alumno.nombre} {r.alumno.apellido}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-akira-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted text-sm">
            Cancelar
          </button>
          <button onClick={guardar} disabled={saving || loading} className="flex-1 btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </div>
      </div>
    </div>
  )
}
