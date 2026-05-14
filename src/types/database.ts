export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nombre: string
          apellido: string
          email: string
          telefono: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          rol: 'admin' | 'instructor' | 'alumno'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      disciplinas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          color: string
        }
        Insert: Omit<Database['public']['Tables']['disciplinas']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['disciplinas']['Insert']>
      }
      planes: {
        Row: {
          id: string
          nombre: string
          precio: number
          duracion_dias: number
          clases_incluidas: number | null
          descripcion: string | null
          activo: boolean
        }
        Insert: Omit<Database['public']['Tables']['planes']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['planes']['Insert']>
      }
      membresias: {
        Row: {
          id: string
          alumno_id: string
          plan_id: string
          fecha_inicio: string
          fecha_fin: string
          estado: 'activa' | 'vencida' | 'cancelada' | 'pendiente_pago'
          clases_usadas: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['membresias']['Row'], 'id' | 'created_at' | 'clases_usadas'>
        Update: Partial<Database['public']['Tables']['membresias']['Insert']>
      }
      pagos: {
        Row: {
          id: string
          membresia_id: string | null
          alumno_id: string
          monto: number
          metodo: 'efectivo' | 'transferencia' | 'debito' | 'webpay' | 'mercadopago'
          estado: 'pagado' | 'pendiente' | 'fallido' | 'reembolsado'
          comprobante_url: string | null
          notas: string | null
          fecha_pago: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['pagos']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>
      }
      horarios: {
        Row: {
          id: string
          disciplina_id: string
          instructor_id: string
          dia_semana: number
          hora_inicio: string
          hora_fin: string
          sala: string | null
          cupos_max: number
          activo: boolean
        }
        Insert: Omit<Database['public']['Tables']['horarios']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['horarios']['Insert']>
      }
      clases: {
        Row: {
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
          estado: 'programada' | 'en_curso' | 'completada' | 'cancelada'
          notas: string | null
        }
        Insert: Omit<Database['public']['Tables']['clases']['Row'], 'id' | 'cupos_ocupados'>
        Update: Partial<Database['public']['Tables']['clases']['Insert']>
      }
      reservas: {
        Row: {
          id: string
          clase_id: string
          alumno_id: string
          estado: 'confirmada' | 'cancelada' | 'lista_espera' | 'asistio' | 'no_asistio'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reservas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reservas']['Insert']>
      }
      asistencia: {
        Row: {
          id: string
          clase_id: string
          alumno_id: string
          presente: boolean
          tomada_por: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['asistencia']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['asistencia']['Insert']>
      }
      notificaciones: {
        Row: {
          id: string
          alumno_id: string
          tipo: string
          titulo: string
          mensaje: string
          leida: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notificaciones']['Row'], 'id' | 'created_at' | 'leida'>
        Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
