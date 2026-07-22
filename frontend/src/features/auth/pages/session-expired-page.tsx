import { useNavigate } from 'react-router'
import { Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'

export function SessionExpiredPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogin = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <CardTitle className="text-center text-2xl">Session expired</CardTitle>
          <CardDescription className="text-center">
            Your session has expired due to inactivity. Please sign in again to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Why did this happen?</p>
            <ul className="list-inside list-disc space-y-1">
              <li>You've been inactive for too long</li>
              <li>Your session token has expired</li>
              <li>You logged in from another device</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleLogin} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sign in again
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Your data is safe and will be available after signing in
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
