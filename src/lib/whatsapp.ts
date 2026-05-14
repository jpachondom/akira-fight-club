import type { Profile, Membresia, Plan, Clase } from '@/types'
import { formatCLP, formatFecha } from './utils'

const gymPhone = () => import.meta.env.VITE_GYM_WHATSAPP ?? '56912345678'
const gymName = () => import.meta.env.VITE_GYM_NAME ?? 'Akira Fight Club'

function abrirWA(mensaje: string): void {
  const url = `https://wa.me/${gymPhone()}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}

export function openWA_pagoVencido(alumno: Profile, membresia: Membresia & { plan?: Plan }): void {
  const mensaje = `Hola ${alumno.nombre} 👋, te contactamos desde ${gymName()}.\n\nNos dimos cuenta que tu membresía ${membresia.plan?.nombre ?? ''} venció el ${formatFecha(membresia.fecha_fin)}.\n\nPara continuar entrenando necesitamos regularizar tu pago de ${formatCLP(membresia.plan?.precio ?? 0)}.\n\n¿Cómo te acomoda pagar? Te esperamos 💪🥊`
  abrirWA(mensaje)
}

export function openWA_renovarPlan(alumno: Profile, plan: Plan): void {
  const mensaje = `Hola ${alumno.nombre}! 🥊 Te escribe ${gymName()}.\n\nTu membresía está próxima a vencer. Te queremos avisar que puedes renovar tu plan ${plan.nombre} por ${formatCLP(plan.precio)}.\n\n¿Te interesa renovar? Cuéntanos cómo prefieres pagar 💪`
  abrirWA(mensaje)
}

export function openWA_cambiarPlan(alumno: Profile, planActual: Plan, planNuevo: Plan): void {
  const mensaje = `Hola ${alumno.nombre}! Desde ${gymName()} 🥊\n\nVemos que estás en el plan ${planActual.nombre} y quisieras cambiarte al plan ${planNuevo.nombre} (${formatCLP(planNuevo.precio)}).\n\nCon gusto te ayudamos a hacer el cambio. ¿Cuándo te gustaría que empiece? 💪`
  abrirWA(mensaje)
}

export function openWA_consultaGeneral(alumno: Profile): void {
  const mensaje = `Hola! Soy ${alumno.nombre} ${alumno.apellido} y quiero hacer una consulta sobre ${gymName()} 🥊`
  abrirWA(mensaje)
}

export function openWA_reagendarClase(alumno: Profile, clase: Clase & { disciplina?: { nombre: string } }): void {
  const mensaje = `Hola ${alumno.nombre}! Te escribe ${gymName()} 🥊\n\nNos comunicamos porque la clase de ${clase.disciplina?.nombre ?? 'entrenamiento'} del ${formatFecha(clase.fecha)} a las ${clase.hora_inicio.substring(0, 5)} necesita ser reagendada.\n\n¿Qué día te acomoda mejor? Te buscamos un espacio 💪`
  abrirWA(mensaje)
}

export function openWA_comprobantePago(alumno: Profile, monto: number): void {
  const mensaje = `Hola! Soy ${alumno.nombre} ${alumno.apellido}.\n\nAcabo de realizar un pago de ${formatCLP(monto)} para ${gymName()}. Te envío el comprobante de transferencia 📎`
  abrirWA(mensaje)
}

export function openWA_bienvenida(alumno: Profile, plan: Plan): void {
  const mensaje = `¡Bienvenido/a ${alumno.nombre}! 🥊🔥\n\nNos alegra que formes parte de la familia ${gymName()}.\n\nTu plan ${plan.nombre} ya está activo. ¡Te esperamos en el gym para empezar a entrenar! 💪\n\nCualquier duda que tengas, estamos acá.`
  abrirWA(mensaje)
}

export function openWA_bajaAsistencia(alumno: Profile): void {
  const mensaje = `Hola ${alumno.nombre} 👋, te saluda ${gymName()}.\n\nNos dimos cuenta que llevas un tiempo sin entrenar y te echamos de menos 😅\n\n¿Todo bien? Si necesitas algo o quieres reprogramar tus clases, aquí estamos 💪🥊`
  abrirWA(mensaje)
}

export function openWA_cobrar(alumno: Profile, plan: Plan, fechaVencimiento: string): void {
  const mensaje = `Hola ${alumno.nombre}! Te escribe ${gymName()} 🥊\n\nTu plan ${plan.nombre} vence el ${formatFecha(fechaVencimiento)} y el monto es ${formatCLP(plan.precio)}.\n\n¿Cómo prefieres pagar? (Efectivo, transferencia, débito) 💪`
  abrirWA(mensaje)
}

export function generarLinkPagoAlumno(alumno: Profile, plan: Plan): string {
  const mensaje = `Hola ${gymName()}! Soy ${alumno.nombre} ${alumno.apellido}.\n\nQuiero contratar el plan ${plan.nombre} por ${formatCLP(plan.precio)}. ¿Cómo puedo pagar? 🥊`
  return `https://wa.me/${gymPhone()}?text=${encodeURIComponent(mensaje)}`
}
