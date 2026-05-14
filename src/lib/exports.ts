import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCLP, formatFecha } from './utils'
import type { Pago, Profile } from '@/types'

const GYM_NAME = import.meta.env.VITE_GYM_NAME ?? 'Akira Fight Club'

function pdfHeader(doc: jsPDF, titulo: string) {
  doc.setFillColor(232, 0, 13)
  doc.rect(0, 0, 210, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(GYM_NAME, 14, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(titulo, 210 - 14, 13, { align: 'right' })
  doc.setTextColor(0, 0, 0)
}

// ============================================================
// ALUMNOS
// ============================================================
export function exportAlumnosExcel(alumnos: (Profile & { membresia_activa: { plan?: { nombre: string } | null; fecha_fin: string; estado: string } | null })[]) {
  const data = alumnos.map((a) => ({
    Nombre: `${a.nombre} ${a.apellido}`,
    Email: a.email,
    Teléfono: a.telefono ?? '',
    Plan: a.membresia_activa?.plan?.nombre ?? 'Sin plan',
    'Vencimiento': a.membresia_activa?.fecha_fin ? formatFecha(a.membresia_activa.fecha_fin) : '',
    Estado: a.membresia_activa?.estado ?? 'Sin membresía',
    'Fecha registro': formatFecha(a.created_at),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Alumnos')
  XLSX.writeFile(wb, `${GYM_NAME}-alumnos-${new Date().toISOString().split('T')[0]}.xlsx`)
}

// ============================================================
// PAGOS
// ============================================================
export function exportPagosPDF(pagos: Pago[]) {
  const doc = new jsPDF()
  pdfHeader(doc, 'Reporte de Pagos')

  doc.setFontSize(11)
  doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, 14, 28)

  const total = pagos.filter((p) => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total recaudado: ${formatCLP(total)}`, 14, 35)

  autoTable(doc, {
    startY: 42,
    head: [['Alumno', 'Monto', 'Método', 'Fecha', 'Estado']],
    body: pagos.map((p) => [
      `${p.alumno?.nombre ?? ''} ${p.alumno?.apellido ?? ''}`,
      formatCLP(p.monto),
      p.metodo,
      formatFecha(p.fecha_pago),
      p.estado,
    ]),
    headStyles: { fillColor: [232, 0, 13], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 9 },
  })

  doc.save(`${GYM_NAME}-pagos-${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportPagosExcel(pagos: Pago[]) {
  const data = pagos.map((p) => ({
    Alumno: `${p.alumno?.nombre ?? ''} ${p.alumno?.apellido ?? ''}`,
    Monto: p.monto,
    'Monto (formato)': formatCLP(p.monto),
    Método: p.metodo,
    Fecha: formatFecha(p.fecha_pago),
    Estado: p.estado,
    Notas: p.notas ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos')
  XLSX.writeFile(wb, `${GYM_NAME}-pagos-${new Date().toISOString().split('T')[0]}.xlsx`)
}

// ============================================================
// ASISTENCIA
// ============================================================
export function exportAsistenciaPDF(alumnos: Array<Profile & { total_clases: number; clases_asistidas: number; pct: number }>) {
  const doc = new jsPDF()
  pdfHeader(doc, 'Reporte de Asistencia')

  doc.setFontSize(11)
  doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, 14, 28)

  autoTable(doc, {
    startY: 35,
    head: [['Alumno', 'Email', 'Clases totales', 'Asistidas', '% Asistencia']],
    body: alumnos.map((a) => [
      `${a.nombre} ${a.apellido}`,
      a.email,
      a.total_clases,
      a.clases_asistidas,
      `${a.pct}%`,
    ]),
    headStyles: { fillColor: [232, 0, 13], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 9 },
  })

  doc.save(`${GYM_NAME}-asistencia-${new Date().toISOString().split('T')[0]}.pdf`)
}
