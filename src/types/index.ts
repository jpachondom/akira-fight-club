export type Rol = 'admin' | 'instructor' | 'alumno'

export type EstadoMembresia = 'activa' | 'vencida' | 'cancelada' | 'pendiente_pago'

export type EstadoPago = 'pagado' | 'pendiente' | 'fallido' | 'reembolsado'

export type MetodoPago = 'efectivo' | 'transferencia' | 'debito' | 'webpay' | 'mercadopago'

export type EstadoClase = 'programada' | 'en_curso' | 'completada' | 'cancelada'

export type EstadoReserva = 'confirmada' | 'cancelada' | 'lista_espera' | 'asistio' | 'no_asistio'

export interface Profile {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  fecha_nacimiento: string | null
  foto_url: string | null
  rol: Rol
  created_at: string
}

export interface Disciplina {
  id: string
  nombre: string
  descripcion: string | null
  color: string
}

export interface Plan {
  id: string
  nombre: string
  precio: number
  duracion_dias: number
  clases_incluidas: number | null
  descripcion: string | null
  activo: boolean
}

export interface Membresia {
  id: string
  alumno_id: string
  plan_id: string
  fecha_inicio: string
  fecha_fin: string
  estado: EstadoMembresia
  clases_usadas: number
  created_at: string
  // joins
  alumno?: Profile
  plan?: Plan
}

export interface Pago {
  id: string
  membresia_id: string | null
  alumno_id: string
  monto: number
  metodo: MetodoPago
  estado: EstadoPago
  comprobante_url: string | null
  notas: string | null
  fecha_pago: string
  created_by: string | null
  // joins
  alumno?: Profile
  membresia?: Membresia
}

export interface Horario {
  id: string
  disciplina_id: string
  instructor_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  sala: string | null
  cupos_max: number
  activo: boolean
  // joins
  disciplina?: Disciplina
  instructor?: Profile
}

export interface Clase {
  id: string
  horario_id: string | null
  disciplina_id: string
  instructor_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  sala: string | null
  cupos_max: number
  cupos_ocupados: number
  estado: EstadoClase
  notas: string | null
  // joins
  disciplina?: Disciplina
  instructor?: Profile
}

export interface Reserva {
  id: string
  clase_id: string
  alumno_id: string
  estado: EstadoReserva
  created_at: string
  // joins
  clase?: Clase
  alumno?: Profile
}

export interface Asistencia {
  id: string
  clase_id: string
  alumno_id: string
  presente: boolean
  tomada_por: string | null
  created_at: string
  // joins
  alumno?: Profile
}

export interface Notificacion {
  id: string
  alumno_id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  created_at: string
}

// Tipos compuestos para UI
export interface AlumnoConMembresia extends Profile {
  membresia_activa: Membresia | null
  total_clases: number
  porcentaje_asistencia: number
}

export interface DashboardKPIs {
  alumnos_activos: number
  clases_hoy: number
  ingresos_mes: number
  pagos_pendientes: number
  membresias_por_vencer: number
}

export interface ResumenFinanciero {
  mes: string
  ingresos: number
  pagos: number
}
