import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Users, CheckSquare } from 'lucide-react'
import { useClases } from '@/hooks/useClases'
import { formatHora } from '@/lib/utils'
import { BadgeClase } from '@/components/ui/Badge'
import { ModalCrearClase } from './ModalCrearClase'
import { ModalTomarAsistencia } from './ModalTomarAsistencia'
import type { Clase } from '@/types'

export function AdminAgenda() {
  const [semanaBase, setSemanaBase] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date())
  const [modalCrear, setModalCrear] = useState(false)
  const [claseSeleccionada, setClaseSeleccionada] = useState<Clase | null>(null)

  const fechaStr = format(diaSeleccionado, 'yyyy-MM-dd')
  const { clases, loading, refetch } = useClases(fechaStr)

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i))

  const coloresDisciplina: Record<string, string> = {}
  clases.forEach((c) => {
    if (c.disciplina) coloresDisciplina[c.disciplina_id] = c.disciplina.color
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-white tracking-wide">AGENDA</h1>
        <button onClick={() => setModalCrear(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva clase</span>
        </button>
      </div>

      {/* Navegación semanal */}
      <div className="card-akira p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setSemanaBase((d) => addDays(d, -7))} className="p-1.5 rounded-lg hover:bg-akira-darker text-akira-muted hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-white font-medium text-sm">
            {format(semanaBase, "'Semana del' d 'de' MMMM", { locale: es })}
          </p>
          <button onClick={() => setSemanaBase((d) => addDays(d, 7))} className="p-1.5 rounded-lg hover:bg-akira-darker text-akira-muted hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((dia) => {
            const esHoy = isSameDay(dia, new Date())
            const esSeleccionado = isSameDay(dia, diaSeleccionado)
            return (
              <button
                key={dia.toISOString()}
                onClick={() => setDiaSeleccionado(dia)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                  esSeleccionado
                    ? 'bg-akira-red text-white'
                    : esHoy
                    ? 'bg-akira-red/10 text-akira-red'
                    : 'text-akira-muted hover:bg-akira-darker hover:text-white'
                }`}
              >
                <span className="text-xs uppercase">{format(dia, 'EEE', { locale: es })}</span>
                <span className="text-lg font-bold">{format(dia, 'd')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Clases del día seleccionado */}
      <div>
        <h2 className="text-white font-medium mb-3 capitalize">
          {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : clases.length === 0 ? (
          <div className="card-akira p-8 text-center">
            <p className="text-akira-muted">No hay clases programadas para este día</p>
            <button onClick={() => setModalCrear(true)} className="btn-primary mt-4 text-sm">
              Agregar clase
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {clases.map((clase) => (
              <div
                key={clase.id}
                className="card-akira p-4 flex items-center justify-between hover:border-akira-red/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-1 h-14 rounded-full shrink-0"
                    style={{ backgroundColor: clase.disciplina?.color ?? '#E8000D' }}
                  />
                  <div>
                    <p className="text-white font-semibold">{clase.disciplina?.nombre}</p>
                    <p className="text-akira-muted text-sm">
                      {formatHora(clase.hora_inicio)} — {formatHora(clase.hora_fin)}
                      {clase.sala && ` · ${clase.sala}`}
                    </p>
                    <p className="text-akira-muted text-xs mt-0.5">
                      {clase.instructor?.nombre} {clase.instructor?.apellido}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-akira-muted text-sm">
                      <Users className="w-4 h-4" />
                      <span>{clase.cupos_ocupados}/{clase.cupos_max}</span>
                    </div>
                    <BadgeClase estado={clase.estado} />
                  </div>
                  <button
                    onClick={() => setClaseSeleccionada(clase)}
                    className="p-2 rounded-lg bg-akira-darker hover:bg-akira-red/10 text-akira-muted hover:text-akira-red transition-colors"
                    title="Tomar asistencia"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalCrearClase open={modalCrear} onClose={() => setModalCrear(false)} onSuccess={refetch} fecha={fechaStr} />
      {claseSeleccionada && (
        <ModalTomarAsistencia
          clase={claseSeleccionada}
          onClose={() => setClaseSeleccionada(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
