import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '../hooks/use-auth'
import { cn } from '@/lib/utils'

const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

type UnlockFormData = z.infer<typeof unlockSchema>

export function LockScreenPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const { user, logout } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UnlockFormData>({
    resolver: zodResolver(unlockSchema),
  })

  const onSubmit = async (data: UnlockFormData) => {
    setIsUnlocking(true)
    try {
      // In a real app, you'd verify the password against the server
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Simulated password check
      if (data.password === 'correct') {
        window.location.href = '/dashboard'
      } else {
        setError('password', { message: 'Incorrect password' })
      }
    } catch (error) {
      setError('password', { message: 'Failed to unlock. Please try again.' })
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {user?.firstName} {user?.lastName}
          </CardTitle>
          <CardDescription className="text-center">
            Your session is locked. Enter your password to continue.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
                  {...register('password')}
                  disabled={isUnlocking}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  disabled={isUnlocking}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isUnlocking}
                className="w-full"
              >
                Sign in as different user
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
