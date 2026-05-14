import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, MessageCircle, LayoutGrid, List } from 'lucide-react'
import { useAlumnos } from '@/hooks/useAlumnos'
import { formatFecha, formatCLP, diasRestantes } from '@/lib/utils'
import { BadgeMembresia } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { openWA_consultaGeneral } from '@/lib/whatsapp'
import { ModalCrearAlumno } from './ModalCrearAlumno'
import { exportAlumnosExcel } from '@/lib/exports'

export function AdminAlumnos() {
  const { alumnos, loading, refetch } = useAlumnos()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [vista, setVista] = useState<'tabla' | 'cards'>('tabla')
  const [modalCrear, setModalCrear] = useState(false)

  const filtrados = useMemo(() => {
    return alumnos.filter((a) => {
      const matchSearch =
        search === '' ||
        `${a.nombre} ${a.apellido} ${a.email}`.toLowerCase().includes(search.toLowerCase())
      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && a.membresia_activa?.estado === 'activa') ||
        (filtroEstado === 'vencido' && a.membresia_activa?.estado === 'vencida') ||
        (filtroEstado === 'sin_plan' && !a.membresia_activa)
      return matchSearch && matchEstado
    })
  }, [alumnos, search, filtroEstado])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-white tracking-wide">ALUMNOS</h1>
          <p className="text-akira-muted text-sm mt-1">{alumnos.length} alumnos registrados</p>
        </div>
        <button onClick={() => setModalCrear(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo alumno</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-akira-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-akira-dark border border-akira-border rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-akira-muted/50 focus:outline-none focus:border-akira-red text-sm"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-akira-dark border border-akira-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-akira-red"
        >
          <option value="todos">Todos</option>
          <option value="activo">Con membresía activa</option>
          <option value="vencido">Membresía vencida</option>
          <option value="sin_plan">Sin plan</option>
        </select>

        <div className="flex items-center gap-1 bg-akira-dark border border-akira-border rounded-lg p-1">
          <button
            onClick={() => setVista('tabla')}
            className={`p-1.5 rounded ${vista === 'tabla' ? 'bg-akira-red text-white' : 'text-akira-muted hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVista('cards')}
            className={`p-1.5 rounded ${vista === 'cards' ? 'bg-akira-red text-white' : 'text-akira-muted hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => exportAlumnosExcel(filtrados)}
          className="flex items-center gap-2 px-4 py-2.5 bg-akira-dark border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="No hay alumnos"
          description={search ? 'Sin resultados para la búsqueda' : 'Agrega el primer alumno'}
          action={
            <button onClick={() => setModalCrear(true)} className="btn-primary">
              Agregar alumno
            </button>
          }
        />
      ) : vista === 'tabla' ? (
        <div className="card-akira overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-akira-border">
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase tracking-wider">Alumno</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Vencimiento</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-akira-border">
                {filtrados.map((alumno) => {
                  const dias = alumno.membresia_activa ? diasRestantes(alumno.membresia_activa.fecha_fin) : null
                  return (
                    <tr
                      key={alumno.id}
                      onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
                      className="hover:bg-akira-darker cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar nombre={alumno.nombre} apellido={alumno.apellido} foto={alumno.foto_url} size="sm" />
                          <div>
                            <p className="text-white text-sm font-medium">{alumno.nombre} {alumno.apellido}</p>
                            <p className="text-akira-muted text-xs">{alumno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-white text-sm">{alumno.membresia_activa?.plan?.nombre ?? '—'}</p>
                        {alumno.membresia_activa?.plan?.precio && (
                          <p className="text-akira-muted text-xs">{formatCLP(alumno.membresia_activa.plan.precio)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {alumno.membresia_activa ? (
                          <div>
                            <p className="text-white text-sm">{formatFecha(alumno.membresia_activa.fecha_fin)}</p>
                            {dias !== null && (
                              <p className={`text-xs ${dias <= 7 ? 'text-yellow-400' : 'text-akira-muted'}`}>
                                {dias > 0 ? `${dias} días restantes` : 'Venció hoy'}
                              </p>
                            )}
                          </div>
                        ) : <span className="text-akira-muted text-sm">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {alumno.membresia_activa ? (
                          <BadgeMembresia estado={alumno.membresia_activa.estado} />
                        ) : (
                          <span className="text-akira-muted text-sm">Sin plan</span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openWA_consultaGeneral(alumno)}
                          className="p-1.5 rounded-lg text-akira-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((alumno) => (
            <div
              key={alumno.id}
              onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
              className="card-akira p-4 cursor-pointer hover:border-akira-red/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar nombre={alumno.nombre} apellido={alumno.apellido} foto={alumno.foto_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{alumno.nombre} {alumno.apellido}</p>
                  <p className="text-akira-muted text-xs truncate">{alumno.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {alumno.membresia_activa ? (
                  <BadgeMembresia estado={alumno.membresia_activa.estado} />
                ) : (
                  <span className="text-akira-muted text-xs">Sin plan</span>
                )}
                <p className="text-akira-muted text-xs">{alumno.membresia_activa?.plan?.nombre}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalCrearAlumno open={modalCrear} onClose={() => setModalCrear(false)} onSuccess={refetch} />
    </div>
  )
}
