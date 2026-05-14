// ============================================================
// MERCADO PAGO — Integración
// Documentación: https://www.mercadopago.cl/developers/es/docs
//
// Para activar:
// 1. Crear cuenta en mercadopago.cl y obtener credenciales
// 2. Agregar al .env:
//    VITE_MP_PUBLIC_KEY=tu-public-key
//    VITE_MP_ENV=sandbox | production
// 3. Crear Supabase Edge Function (ver /supabase/functions/mercadopago/)
// ============================================================

export interface MPPreferenceItem {
  title: string
  quantity: number
  unit_price: number
  currency_id: 'CLP'
}

export interface MPPreferenceParams {
  items: MPPreferenceItem[]
  payer?: { email: string; name: string }
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return?: 'approved'
}

export interface MPPreference {
  id: string
  init_point: string       // URL producción
  sandbox_init_point: string  // URL sandbox
}

export interface MPPaymentResult {
  collection_id: string
  collection_status: 'approved' | 'pending' | 'in_process' | 'rejected'
  payment_id: string
  status: string
  external_reference: string
  payment_type: string
  merchant_order_id: string
}

// Crea una preferencia de pago en Mercado Pago
export async function mpCrearPreferencia(params: MPPreferenceParams): Promise<MPPreference> {
  const response = await fetch('/api/mercadopago/preferencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Error al crear preferencia de Mercado Pago')
  }

  return response.json()
}

// Redirige al usuario al checkout de Mercado Pago
export async function mpPagarPlan(alumno: { id: string; email: string; nombre: string; apellido: string }, plan: { id: string; nombre: string; precio: number }): Promise<void> {
  const esProduccion = import.meta.env.VITE_MP_ENV === 'production'
  const baseUrl = window.location.origin

  const preferencia = await mpCrearPreferencia({
    items: [{
      title: `${plan.nombre} — Akira Fight Club`,
      quantity: 1,
      unit_price: plan.precio,
      currency_id: 'CLP',
    }],
    payer: {
      email: alumno.email,
      name: `${alumno.nombre} ${alumno.apellido}`,
    },
    external_reference: `${alumno.id}|${plan.id}`,
    back_urls: {
      success: `${baseUrl}/alumno/plan?pago=exito`,
      failure: `${baseUrl}/alumno/plan?pago=error`,
      pending: `${baseUrl}/alumno/plan?pago=pendiente`,
    },
    auto_return: 'approved',
  })

  const url = esProduccion ? preferencia.init_point : preferencia.sandbox_init_point
  window.location.href = url
}

// Verifica el resultado de un pago desde la URL de retorno
export function mpLeerResultadoURL(): MPPaymentResult | null {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('collection_status')
  if (!status) return null

  return {
    collection_id: params.get('collection_id') ?? '',
    collection_status: status as MPPaymentResult['collection_status'],
    payment_id: params.get('payment_id') ?? '',
    status: params.get('status') ?? '',
    external_reference: params.get('external_reference') ?? '',
    payment_type: params.get('payment_type') ?? '',
    merchant_order_id: params.get('merchant_order_id') ?? '',
  }
}

export function mpPagoFueAprobado(result: MPPaymentResult): boolean {
  return result.collection_status === 'approved'
}
