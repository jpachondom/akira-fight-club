import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Disciplina } from '@/types'

const COLORES_PRESET = [
  '#E8000D', '#FF6B00', '#8B00FF', '#0066FF',
  '#00CC88', '#FF0080', '#FFD600', '#00BFFF',
]

export function TabDisciplinas() {
  const { toast } = useUIStore()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Disciplina | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '#E8000D' })
  const [guardando, setGuardando] = useState(false)

  const fetchDisciplinas = async () => {
    const { data } = await supabase.from('disciplinas').select('*').order('nombre')
    setDisciplinas(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchDisciplinas() }, [])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ nombre: '', descripcion: '', color: '#E8000D' })
    setModalOpen(true)
  }

  const abrirEditar = (d: Disciplina) => {
    setEditando(d)
    setForm({ nombre: d.nombre, descripcion: d.descripcion ?? '', color: d.color })
    setModalOpen(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return
    setGuardando(true)
    try {
      if (editando) {
        const { error } = await supabase.from('disciplinas').update(form).eq('id', editando.id)
        if (error) throw error
        toast.success('Disciplina actualizada')
      } else {
        const { error } = await supabase.from('disciplinas').insert(form)
        if (error) throw error
        toast.success('Disciplina creada')
      }
      setModalOpen(false)
      fetchDisciplinas()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : undefined)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta disciplina? Las clases asociadas no se eliminarán.')) return
    const { error } = await supabase.from('disciplinas').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar', error.message)
    } else {
      toast.success('Disciplina eliminada')
      fetchDisciplinas()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirCrear} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva disciplina
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : disciplinas.length === 0 ? (
        <EmptyState title="Sin disciplinas" description="Crea la primera disciplina" action={<button onClick={abrirCrear} className="btn-primary">Crear disciplina</button>} />
      ) : (
        <div className="space-y-2">
          {disciplinas.map((d) => (
            <div key={d.id} className="card-akira p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div>
                  <p className="text-white font-medium">{d.nombre}</p>
                  {d.descripcion && <p className="text-akira-muted text-xs">{d.descripcion}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(d)} className="p-2 rounded-lg text-akira-muted hover:text-white hover:bg-akira-darker transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => eliminar(d.id)} className="p-2 rounded-lg text-akira-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-akira-border">
              <h2 className="text-white font-semibold">{editando ? 'Editar disciplina' : 'Nueva disciplina'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-akira-muted mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Box, Muay Thai, MMA..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-1">Descripción (opcional)</label>
                <input
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="input-field"
                  placeholder="Descripción breve"
                />
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORES_PRESET.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                    >
                      {form.color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted text-sm">
                  Cancelar
                </button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim()} className="flex-1 btn-primary disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
