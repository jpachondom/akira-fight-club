import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const profileSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  rol: z.enum(['admin', 'instructor', 'alumno']),
})

export const alumnoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
})

export const planSchema = z.object({
  nombre: z.string().min(2),
  precio: z.number().int().positive('El precio debe ser positivo'),
  duracion_dias: z.number().int().positive(),
  clases_incluidas: z.number().int().positive().nullable(),
  descripcion: z.string().optional(),
  activo: z.boolean(),
})

export const pagoSchema = z.object({
  alumno_id: z.string().uuid(),
  membresia_id: z.string().uuid().nullable(),
  monto: z.number().int().positive('El monto debe ser positivo'),
  metodo: z.enum(['efectivo', 'transferencia', 'debito', 'webpay', 'mercadopago']),
  estado: z.enum(['pagado', 'pendiente', 'fallido', 'reembolsado']),
  notas: z.string().optional(),
  fecha_pago: z.string(),
})

export const membresiaSchema = z.object({
  alumno_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  estado: z.enum(['activa', 'vencida', 'cancelada', 'pendiente_pago']),
})

export const claseSchema = z.object({
  disciplina_id: z.string().uuid(),
  instructor_id: z.string().uuid(),
  fecha: z.string(),
  hora_inicio: z.string(),
  hora_fin: z.string(),
  sala: z.string().optional(),
  cupos_max: z.number().int().positive(),
  estado: z.enum(['programada', 'en_curso', 'completada', 'cancelada']),
  notas: z.string().optional(),
})

export const horarioSchema = z.object({
  disciplina_id: z.string().uuid(),
  instructor_id: z.string().uuid(),
  dia_semana: z.number().int().min(0).max(6),
  hora_inicio: z.string(),
  hora_fin: z.string(),
  sala: z.string().optional(),
  cupos_max: z.number().int().positive(),
  activo: z.boolean(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type AlumnoInput = z.infer<typeof alumnoSchema>
export type PlanInput = z.infer<typeof planSchema>
export type PagoInput = z.infer<typeof pagoSchema>
export type MembresiaInput = z.infer<typeof membresiaSchema>
export type ClaseInput = z.infer<typeof claseSchema>
export type HorarioInput = z.infer<typeof horarioSchema>
