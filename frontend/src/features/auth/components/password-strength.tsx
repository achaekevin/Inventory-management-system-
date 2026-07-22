import { getPasswordStrength } from '@/utils/validation'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const { strength, score } = getPasswordStrength(password)

  const strengthColors = {
    weak: 'bg-destructive',
    medium: 'bg-warning',
    strong: 'bg-success',
    'very-strong': 'bg-success',
  }

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  }

  const bars = 4
  const filledBars = Math.ceil((score / 6) * bars)

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full bg-muted transition-colors',
              index < filledBars && strengthColors[strength]
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', strengthColors[strength].replace('bg-', 'text-'))}>
        Password strength: {strengthLabels[strength]}
      </p>
    </div>
  )
}
