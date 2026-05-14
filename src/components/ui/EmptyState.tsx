interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-akira-darker border border-akira-border flex items-center justify-center mb-4 text-akira-muted">
          {icon}
        </div>
      )}
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      {description && <p className="text-akira-muted text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
