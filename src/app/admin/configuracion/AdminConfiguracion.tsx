import { useState } from 'react'
import { Dumbbell, CreditCard, Users } from 'lucide-react'
import { TabDisciplinas } from './TabDisciplinas'
import { TabPlanes } from './TabPlanes'
import { TabInstructores } from './TabInstructores'

const tabs = [
  { key: 'disciplinas', label: 'Disciplinas', icon: Dumbbell },
  { key: 'planes', label: 'Planes', icon: CreditCard },
  { key: 'instructores', label: 'Instructores', icon: Users },
]

export function AdminConfiguracion() {
  const [tab, setTab] = useState<'disciplinas' | 'planes' | 'instructores'>('disciplinas')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl text-white tracking-wide">CONFIGURACIÓN</h1>
        <p className="text-akira-muted text-sm mt-1">Administra disciplinas, planes e instructores</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-akira-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-akira-red text-akira-red'
                : 'border-transparent text-akira-muted hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'disciplinas' && <TabDisciplinas />}
      {tab === 'planes' && <TabPlanes />}
      {tab === 'instructores' && <TabInstructores />}
    </div>
  )
}
