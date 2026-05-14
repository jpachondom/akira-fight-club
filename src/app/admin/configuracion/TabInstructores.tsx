import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Profile } from '@/types'

const formVacio = { nombre: '', apellido: '', email: '', telefono: '', password: '' }

export function TabInstructores() {
  const { toast } = useUIStore()
  const [instructores, setInstructores] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Profile | null>(null)
  const [form, setForm] = useState(formVacio)
  const [guardando, setGuardando] = useState(false)

  const fetchInstructores = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('rol', ['instructor', 'admin'])
      .order('nombre')
    setInstructores(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchInstructores() }, [])

  const abrirCrear = () => {
    setEditando(null)
    setForm(formVacio)
    setModalOpen(true)
  }

  const abrirEditar = (p: Profile) => {
    setEditando(p)
    setForm({ nombre: p.nombre, apellido: p.apellido, email: p.email, telefono: p.telefono ?? '', password: '' })
    setModalOpen(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) return
    setGuardando(true)
    try {
      if (editando) {
        // Solo actualizar perfil
        const { error } = await supabase.from('profiles').update({
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono || null,
        }).eq('id', editando.id)
        if (error) throw error
        toast.success('Instructor actualizado')
      } else {
        // Crear nuevo usuario con rol instructor
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password || 'Akira2024!',
          options: {
            data: { nombre: form.nombre, apellido: form.apellido, rol: 'instructor' },
          },
        })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').update({ telefono: form.telefono || null }).eq('id', data.user.id)
        }
        toast.success('Instructor creado')
      }
      setModalOpen(false)
      fetchInstructores()
    } catch (err) {
      toast.error('Error al guardar', err instanceof Error ? err.message : undefined)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (instructor: Profile) => {
    if (!confirm(`¿Eliminar a ${instructor.nombre} ${instructor.apellido}?`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', instructor.id)
    if (error) toast.error('Error al eliminar', error.message)
    else { toast.success('Instructor eliminado'); fetchInstructores() }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirCrear} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo instructor
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : instructores.length === 0 ? (
        <EmptyState title="Sin instructores" description="Agrega el primer instructor" action={<button onClick={abrirCrear} className="btn-primary">Agregar instructor</button>} />
      ) : (
        <div className="space-y-2">
          {instructores.map((inst) => (
            <div key={inst.id} className="card-akira p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar nombre={inst.nombre} apellido={inst.apellido} foto={inst.foto_url} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{inst.nombre} {inst.apellido}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${inst.rol === 'admin' ? 'text-akira-red border-akira-red/30 bg-akira-red/10' : 'text-blue-400 border-blue-400/30 bg-blue-400/10'}`}>
                      {inst.rol === 'admin' ? 'Admin' : 'Instructor'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-akira-muted text-xs"><Mail className="w-3 h-3" />{inst.email}</span>
                    {inst.telefono && <span className="flex items-center gap-1 text-akira-muted text-xs"><Phone className="w-3 h-3" />{inst.telefono}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(inst)} className="p-2 rounded-lg text-akira-muted hover:text-white hover:bg-akira-darker transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                {inst.rol !== 'admin' && (
                  <button onClick={() => eliminar(inst)} className="p-2 rounded-lg text-akira-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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
              <h2 className="text-white font-semibold">{editando ? 'Editar instructor' : 'Nuevo instructor'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-akira-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-akira-muted mb-1">Nombre</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-sm text-akira-muted mb-1">Apellido</label>
                  <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input-field" placeholder="Pérez" />
                </div>
              </div>
              {!editando && (
                <div>
                  <label className="block text-sm text-akira-muted mb-1">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="input-field" placeholder="instructor@email.com" />
                </div>
              )}
              <div>
                <label className="block text-sm text-akira-muted mb-1">Teléfono (opcional)</label>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field" placeholder="+56 9 1234 5678" />
              </div>
              {!editando && (
                <div>
                  <label className="block text-sm text-akira-muted mb-1">Contraseña inicial</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="text" className="input-field" placeholder="Akira2024!" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-akira-border rounded-lg text-akira-muted text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando} className="flex-1 btn-primary disabled:opacity-50">
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
