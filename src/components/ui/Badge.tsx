import { cn } from '@/lib/utils'
import type { EstadoMembresia, EstadoPago, EstadoClase, EstadoReserva } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variant === 'success' && 'bg-green-500/15 text-green-400 border-green-500/30',
        variant === 'danger' && 'bg-red-500/15 text-red-400 border-red-500/30',
        variant === 'warning' && 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        variant === 'info' && 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        variant === 'muted' && 'bg-gray-500/15 text-gray-400 border-gray-500/30',
        variant === 'default' && 'bg-akira-red/15 text-akira-red border-akira-red/30',
        className
      )}
    >
      {children}
    </span>
  )
}

export function BadgeMembresia({ estado }: { estado: EstadoMembresia }) {
  const map: Record<EstadoMembresia, { label: string; variant: BadgeProps['variant'] }> = {
    activa: { label: 'Activa', variant: 'success' },
    vencida: { label: 'Vencida', variant: 'danger' },
    cancelada: { label: 'Cancelada', variant: 'muted' },
    pendiente_pago: { label: 'Pendiente', variant: 'warning' },
  }
  const { label, variant } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}

export function BadgePago({ estado }: { estado: EstadoPago }) {
  const map: Record<EstadoPago, { label: string; variant: BadgeProps['variant'] }> = {
    pagado: { label: 'Pagado', variant: 'success' },
    pendiente: { label: 'Pendiente', variant: 'warning' },
    fallido: { label: 'Fallido', variant: 'danger' },
    reembolsado: { label: 'Reembolsado', variant: 'info' },
  }
  const { label, variant } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}

export function BadgeClase({ estado }: { estado: EstadoClase }) {
  const map: Record<EstadoClase, { label: string; variant: BadgeProps['variant'] }> = {
    programada: { label: 'Programada', variant: 'info' },
    en_curso: { label: 'En curso', variant: 'success' },
    completada: { label: 'Completada', variant: 'muted' },
    cancelada: { label: 'Cancelada', variant: 'danger' },
  }
  const { label, variant } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}

export function BadgeReserva({ estado }: { estado: EstadoReserva }) {
  const map: Record<EstadoReserva, { label: string; variant: BadgeProps['variant'] }> = {
    confirmada: { label: 'Confirmada', variant: 'success' },
    cancelada: { label: 'Cancelada', variant: 'danger' },
    lista_espera: { label: 'En espera', variant: 'warning' },
    asistio: { label: 'Asistió', variant: 'success' },
    no_asistio: { label: 'No asistió', variant: 'muted' },
  }
  const { label, variant } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}
