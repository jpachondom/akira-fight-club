import { useState, useMemo } from 'react'
import { Plus, Download, Search, MessageCircle } from 'lucide-react'
import { usePagos } from '@/hooks/usePagos'
import { formatCLP, formatFecha } from '@/lib/utils'
import { BadgePago } from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { openWA_cobrar } from '@/lib/whatsapp'
import { ModalRegistrarPago } from './ModalRegistrarPago'
import { exportPagosPDF, exportPagosExcel } from '@/lib/exports'
import type { Plan } from '@/types'

const METODOS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  debito: 'Débito',
  webpay: 'Webpay',
  mercadopago: 'Mercado Pago',
}

export function AdminPagos() {
  const { pagos, loading, refetch } = usePagos()
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalPago, setModalPago] = useState(false)

  const filtrados = useMemo(() => {
    return pagos.filter((p) => {
      const matchSearch =
        search === '' ||
        `${p.alumno?.nombre} ${p.alumno?.apellido}`.toLowerCase().includes(search.toLowerCase())
      const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
      return matchSearch && matchEstado
    })
  }, [pagos, search, filtroEstado])

  const totalFiltrado = filtrados.filter((p) => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-white tracking-wide">PAGOS</h1>
          <p className="text-akira-muted text-sm mt-1">
            {filtrados.filter((p) => p.estado === 'pagado').length} pagos confirmados · {formatCLP(totalFiltrado)}
          </p>
        </div>
        <button onClick={() => setModalPago(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Registrar pago</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-akira-muted" />
          <input
            type="text"
            placeholder="Buscar alumno..."
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
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes</option>
          <option value="fallido">Fallidos</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => exportPagosPDF(filtrados)}
            className="flex items-center gap-2 px-3 py-2.5 bg-akira-dark border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => exportPagosExcel(filtrados)}
            className="flex items-center gap-2 px-3 py-2.5 bg-akira-dark border border-akira-border rounded-lg text-akira-muted hover:text-white text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtrados.length === 0 ? (
        <EmptyState title="No hay pagos" description="Registra el primer pago" />
      ) : (
        <div className="card-akira overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-akira-border">
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase">Alumno</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase hidden sm:table-cell">Monto</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase hidden md:table-cell">Método</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-4 py-3 text-akira-muted text-xs font-medium uppercase">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-akira-border">
                {filtrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-akira-darker transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{pago.alumno?.nombre} {pago.alumno?.apellido}</p>
                      <p className="text-akira-muted text-xs sm:hidden">{formatCLP(pago.monto)}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-white text-sm font-semibold">{formatCLP(pago.monto)}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-akira-muted text-sm">{METODOS[pago.metodo] ?? pago.metodo}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-akira-muted text-sm">{formatFecha(pago.fecha_pago)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <BadgePago estado={pago.estado} />
                    </td>
                    <td className="px-4 py-3">
                      {pago.estado === 'pendiente' && pago.alumno && pago.membresia?.plan && (
                        <button
                          onClick={() => openWA_cobrar(
                            pago.alumno!,
                            pago.membresia!.plan as Plan,
                            pago.membresia!.fecha_fin
                          )}
                          className="p-1.5 rounded-lg text-akira-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Cobrar por WhatsApp"
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

      <ModalRegistrarPago open={modalPago} onClose={() => setModalPago(false)} onSuccess={refetch} />
    </div>
  )
}
