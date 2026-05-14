import { cn, iniciales } from '@/lib/utils'

interface AvatarProps {
  nombre: string
  apellido: string
  foto?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ nombre, apellido, foto, size = 'md', className }: AvatarProps) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={`${nombre} ${apellido}`}
        className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-akira-red/20 border border-akira-red/30 flex items-center justify-center shrink-0 font-semibold text-akira-red',
        sizes[size],
        className
      )}
    >
      {iniciales(nombre, apellido)}
    </div>
  )
}
