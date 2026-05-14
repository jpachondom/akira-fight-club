import { useState } from 'react'
import { CreditCard, X, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { formatCLP } from '@/lib/utils'
import { mpPagarPlan } from '@/lib/pagos/mercadopago'
import { webpayInit, generarBuyOrder } from '@/lib/pagos/webpay'
import type { Plan } from '@/types'

interface Props {
  plan: Plan
}

const WEBPAY_ACTIVO = false    // Cambiar a true cuando tengas credenciales Transbank
const MP_ACTIVO = false        // Cambiar a true cuando tengas credenciales Mercado Pago

export function BotonPago({ plan }: Props) {
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [procesando, setProcesando] = useState<'webpay' | 'mp' | null>(null)

  const pagarWebpay = async () => {
    if (!user) return
    setProcesando('webpay')
    try {
      const buyOrder = generarBuyOrder(user.id, plan.id)
      const { token, url } = await webpayInit({
        buyOrder,
        sessionId: user.id,
        amount: plan.precio,
        returnUrl: `${window.location.origin}/alumno/plan?pago=webpay&order=${buyOrder}`,
      })
      // Webpay requiere POST al form con el token
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = url
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'token_ws'
      input.value = token
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      toast.error('Error al iniciar pago', err instanceof Error ? err.message : undefined)
      setProcesando(null)
    }
  }

  const pagarMP = async () => {
    if (!user) return
    setProcesando('mp')
    try {
      await mpPagarPlan(
        { id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido },
        { id: plan.id, nombre: plan.nombre, precio: plan.precio }
      )
    } catch (err) {
      toast.error('Error al iniciar pago', err instanceof Error ? err.message : undefined)
      setProcesando(null)
    }
  }

  // Si ninguna pasarela está activa, mostrar mensaje
  const ningunaActiva = !WEBPAY_ACTIVO && !MP_ACTIVO

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="btn-primary text-sm flex items-center gap-1.5">
        <CreditCard className="w-4 h-4" />
        Pagar online
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-akira-dark border border-akira-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-akira-border">
              <div>
                <h2 className="text-white font-semibold">Pagar {plan.nombre}</h2>
                <p className="text-akira-red font-bold text-lg">{formatCLP(plan.precio)}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-akira-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {ningunaActiva ? (
                <div className="text-center py-4">
                  <p className="text-akira-muted text-sm mb-1">Pago online próximamente</p>
                  <p className="text-akira-muted text-xs">Contacta al gym para pagar por transferencia o efectivo</p>
                </div>
              ) : (
                <>
                  <p className="text-akira-muted text-sm text-center mb-4">Elige tu método de pago</p>

                  {WEBPAY_ACTIVO && (
                    <button
                      onClick={pagarWebpay}
                      disabled={procesando !== null}
                      className="w-full flex items-center justify-between p-4 border border-akira-border rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">WP</span>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">Webpay</p>
                          <p className="text-akira-muted text-xs">Débito, crédito, prepago</p>
                        </div>
                      </div>
                      {procesando === 'webpay'
                        ? <span className="text-akira-muted text-xs">Procesando...</span>
                        : <ExternalLink className="w-4 h-4 text-akira-muted" />
                      }
                    </button>
                  )}

                  {MP_ACTIVO && (
                    <button
                      onClick={pagarMP}
                      disabled={procesando !== null}
                      className="w-full flex items-center justify-between p-4 border border-akira-border rounded-xl hover:border-blue-400/50 hover:bg-blue-400/5 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#009EE3] rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MP</span>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">Mercado Pago</p>
                          <p className="text-akira-muted text-xs">Débito, crédito, efectivo</p>
                        </div>
                      </div>
                      {procesando === 'mp'
                        ? <span className="text-akira-muted text-xs">Procesando...</span>
                        : <ExternalLink className="w-4 h-4 text-akira-muted" />
                      }
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
