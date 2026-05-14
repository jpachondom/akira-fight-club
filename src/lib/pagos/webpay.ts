// ============================================================
// WEBPAY (Transbank) — Integración
// Documentación: https://www.transbankdevelopers.cl/documentacion/webpay-plus
//
// Para activar en producción:
// 1. Solicitar credenciales en transbank.cl/web/integracion
// 2. Agregar al .env:
//    VITE_WEBPAY_COMMERCE_CODE=tu-codigo
//    VITE_WEBPAY_API_KEY=tu-api-key
//    VITE_WEBPAY_ENV=integration | production
// 3. Crear Supabase Edge Function (ver /supabase/functions/webpay/)
// ============================================================

export interface WebpayInitParams {
  buyOrder: string
  sessionId: string
  amount: number
  returnUrl: string
}

export interface WebpayTransaction {
  token: string
  url: string
}

export interface WebpayConfirmResult {
  vci: string
  amount: number
  status: string
  buy_order: string
  session_id: string
  card_detail: { card_number: string }
  accounting_date: string
  transaction_date: string
  authorization_code: string
  payment_type_code: string
  response_code: number
  installments_number: number
}

// Inicia una transacción Webpay
export async function webpayInit(params: WebpayInitParams): Promise<WebpayTransaction> {
  const response = await fetch('/api/webpay/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Error al iniciar pago con Webpay')
  }

  return response.json()
}

// Confirma una transacción Webpay (después del redirect)
export async function webpayConfirm(token: string): Promise<WebpayConfirmResult> {
  const response = await fetch('/api/webpay/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Error al confirmar pago con Webpay')
  }

  return response.json()
}

// Genera un buy_order único para la transacción
export function generarBuyOrder(alumnoId: string, planId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `AKR-${timestamp}`
}

// Verifica si el resultado de Webpay fue exitoso
export function webpayFueExitoso(result: WebpayConfirmResult): boolean {
  return result.response_code === 0 && result.status === 'AUTHORIZED'
}
