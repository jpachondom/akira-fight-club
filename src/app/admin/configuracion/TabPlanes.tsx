import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Infinity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { formatCLP } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Plan } from '@/types'

const formVacio = { nombre: '', precio: 0, duracion_dias: 30, clases_incluidas: '', descripcion: '', activo: true }

export function TabPlanes() {
  const { toast } = useUIStore()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Plan | null>(null)
  const [form, setForm] = useState(formVacio)
  const [guardando, setGuardando] = useState(false)

  const fetchPlanes = async () => {
    const { data } = await supabase.from('planes').select('*').order('precio')
    setPlanes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPlanes() }, [])

  const abrirCrear = () => {
    setEditando(null)
    setForm(formVacio)
    setModalOpen(true)
  }

  const abrirEditar = (p: Plan) => {
    setEditando(p)
    setForm({
      nombre: p.nombre,
      precio: p.precio,
      duracion_dias: p.duracion_dias,
      clases_incluidas: p.clases_incluidas?.toString() ?? '',
      descripcion: p.descripcion ?? '',
      activo: p.activo,
    })
    setModalOpen(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.precio) return
    setGuardando(true)
    try {
      const datos = {
        nombre: form.nombre,
        precio: Number(form.precio),
        duracion_dias: Number(form.duracion_dias),
        clases_incluidas: form.clases_incluidas ? Number(form.clases_incluidas) : null,
        descripcion: form.descripcion || null,
        activo: form.activo,
      }
      if (editando) {
        const { error } = await supabase.from('planes').update(datos).eq('id', editando.id)
        if (error) throw error
        toast.success('Plan actualizado')
      } else {
        const { error } = await supabase.from('planes').insert(datos)
        if (error) throw error
        toast.success('Plan creado')
      }
      setModalOpen(false)
      fetchPlanes()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : undefined)
    } finally {
      setGuardando(false)
    }
  }

  const toggleActivo = async (plan: Plan) => {
    await supabase.from('planes').update({ activo: !plan.activo }).eq('id', plan.id)
    fetchPlanes()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este plan?')) return
    const { error } = await supabase.from('planes').delete().eq('id', id)
    if (error) toast.error('Error al eliminar', error.message)
    else { toast.success('Plan eliminado'); fetchPlanes() }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirCrear} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : planes.length === 0 ? (
        <EmptyState title="Sin planes" description="Crea el primer plan" action={<button onClick={abrirCrear} className="btn-primary">Crear plan</button>} />
      ) : (
        <div className="space-y-2">
          {planes.map((p) => (
            <div key={p.id} className={`card-akira p-4 flex items-center justify-between ${!p.activo ? 'opacity-50' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{p.nombre}</p>
                  {!p.activo && <span className="text-xs text-akira-muted border border-akira-border rounded px-1.5 py-0.5">Inactivo</span>}
                </div>
                <p className="text-akira-red font-bold">{formatCLP(p.precio)}</p>
                <p className="text-akira-muted text-xs">
                  {p.duracion_dias} días ·{' '}
                  {p.clases_incluidas
                    ? `${p.clases_incluidas} clases`
                    : 'Clases ilimitadas'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActivo(p)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${p.activo ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-akira-darker text-akira-muted hover:text-white'}`}>
                  {p.activo ? 'Activo' : 'Activar'}
                </button>
                <button onClick={() => abrirEditar(p)} className="p-2 rounded-lg text-akira-muted hover:text-white hover:bg-akira-darker transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => eliminar(p.id)} className="p-2 rounded-lg text-akira-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
          <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-akira-border">
              <h2 className="text-white font-semibold">{editando ? 'Editar plan' : 'Nuevo plan'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-akira-muted mb-1">Nombre del plan</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" placeholder="Plan Mensual" autoFocus />
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-1">Precio (CLP)</label>
                <input value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} type="number" className="input-field" placeholder="35000" />
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-1">Duración (días)</label>
                <div className="flex gap-2">
                  {[30, 60, 90, 365].map((d) => (
                    <button key={d} onClick={() => setForm({ ...form, duracion_dias: d })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${form.duracion_dias === d ? 'bg-akira-red border-akira-red text-white' : 'border-akira-border text-akira-muted hover:text-white'}`}>
                      {d === 365 ? '1 año' : `${d}d`}
                    </button>
                  ))}
                </div>
                <input value={form.duracion_dias} onChange={(e) => setForm({ ...form, duracion_dias: Number(e.target.value) })} type="number" className="input-field mt-2" placeholder="Otro número de días" />
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-1">Clases incluidas</label>
                <div className="flex items-center gap-2">
                  <input value={form.clases_incluidas} onChange={(e) => setForm({ ...form, clases_incluidas: e.target.value })} type="number" className="input-field" placeholder="Dejar vacío = ilimitadas" />
                  <Infinity className="w-5 h-5 text-akira-muted shrink-0" />
                </div>
                <p className="text-akira-muted text-xs mt-1">Vacío = clases ilimitadas</p>
              </div>
              <div>
                <label className="block text-sm text-akira-muted mb-1">Descripción (opcional)</label>
                <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input-field" placeholder="Descripción breve para el alumno" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm({ ...form, activo: !form.activo })}
                  className={`w-10 h-6 rounded-full transition-colors ${form.activo ? 'bg-akira-red' : 'bg-akira-border'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.activo ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-akira-muted">Plan activo (visible para alumnos)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim() || !form.precio} className="flex-1 btn-primary disabled:opacity-50">
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
