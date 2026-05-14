import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TIMEZONE = 'America/Santiago'

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatFecha(fecha: string, fmt = 'd MMM yyyy'): string {
  try {
    const date = toZonedTime(parseISO(fecha), TIMEZONE)
    return format(date, fmt, { locale: es })
  } catch {
    return fecha
  }
}

export function formatFechaHora(fecha: string): string {
  return formatFecha(fecha, "d MMM yyyy 'a las' HH:mm")
}

export function formatRelativo(fecha: string): string {
  try {
    return formatDistanceToNow(parseISO(fecha), { addSuffix: true, locale: es })
  } catch {
    return fecha
  }
}

export function fechaHoy(): string {
  const now = toZonedTime(new Date(), TIMEZONE)
  return format(now, 'yyyy-MM-dd')
}

export function diasRestantes(fechaFin: string): number {
  return differenceInDays(parseISO(fechaFin), new Date())
}

export function diaSemanaLabel(dia: number): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[dia] ?? ''
}

export function diaSemanaCorto(dia: number): string {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return dias[dia] ?? ''
}

export function formatHora(hora: string): string {
  return hora.substring(0, 5)
}

export function porcentajeAsistencia(asistidas: number, total: number): number {
  if (total === 0) return 0
  return Math.round((asistidas / total) * 100)
}

export function iniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

export function telefonoChile(tel: string): string {
  const limpio = tel.replace(/\D/g, '')
  if (limpio.startsWith('56')) return limpio
  if (limpio.startsWith('9')) return `56${limpio}`
  return `569${limpio}`
}
