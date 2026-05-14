import { useState, useEffect } from 'react'
import { MessageCircle, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatFecha, formatHora, porcentajeAsistencia } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { openWA_bajaAsistencia } from '@/lib/whatsapp'
import { exportAsistenciaPDF } from '@/lib/exports'
import type { Profile } from '@/types'

interface AlumnoAsistencia extends Profile {
  total_clases: number
  clases_asistidas: number
  pct: number
}

export function AdminAsistencia() {
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'baja'>('todos')

  useEffect(() => {
    async function fetchAsistencia() {
      const [perfilesRes, asistenciaRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('rol', 'alumno'),
        supabase.from('asistencia').select('alumno_id, presente'),
      ])

      if (!perfilesRes.data || !asistenciaRes.data) {
        setLoading(false)
        return
      }

      const conteo: Record<string, { total: number; asistidas: number }> = {}
      asistenciaRes.data.forEach((r) => {
        if (!conteo[r.alumno_id]) conteo[r.alumno_id] = { total: 0, asistidas: 0 }
        conteo[r.alumno_id].total++
        if (r.presente) conteo[r.alumno_id].asistidas++
      })

      const resultado = perfilesRes.data.map((p) => {
        const c = conteo[p.id] ?? { total: 0, asistidas: 0 }
        return {
          ...p,
          total_clases: c.total,
          clases_asistidas: c.asistidas,
          pct: porcentajeAsistencia(c.asistidas, c.total),
        }
      })

      setAlumnos(resultado)
      setLoading(false)
    }

    fetchAsistencia()
  }, [])

  const filtrados = filtro === 'baja' ? alumnos.filter((a) => a.total_clases > 0 && a.pct < 50) : alumnos

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-white tracking-wide">ASISTENCIA</h1>
        <button
          onClick={() => exportAsistenciaPDF(filtrados)}
          className="flex items-center gap-2 px-3 py-2.5 bg-akira-dark border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === 'todos' ? 'bg-akira-red text-white' : 'bg-akira-dark border border-akira-border text-akira-muted hover:text-white'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('baja')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === 'baja' ? 'bg-akira-red text-white' : 'bg-akira-dark border border-akira-border text-akira-muted hover:text-white'}`}
        >
          Baja asistencia (&lt;50%)
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="card-akira overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-akira-border">
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase">Alumno</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase hidden sm:table-cell">Asistencias</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase">% Asistencia</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-akira-border">
                {filtrados.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-akira-darker transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={alumno.nombre} apellido={alumno.apellido} foto={alumno.foto_url} size="sm" />
                        <span className="text-white text-sm">{alumno.nombre} {alumno.apellido}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-akira-muted text-sm">{alumno.clases_asistidas}/{alumno.total_clases}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-akira-darker rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className={`h-full rounded-full ${alumno.pct < 50 ? 'bg-red-500' : alumno.pct < 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${alumno.pct}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${alumno.pct < 50 ? 'text-red-400' : alumno.pct < 75 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {alumno.pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {alumno.pct < 50 && alumno.total_clases > 0 && (
                        <button
                          onClick={() => openWA_bajaAsistencia(alumno)}
                          className="p-1.5 rounded-lg text-akira-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Notificar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
