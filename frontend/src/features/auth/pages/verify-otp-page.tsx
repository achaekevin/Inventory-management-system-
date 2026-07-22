import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Shield, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '../hooks/use-auth'

export function VerifyOTPPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verifyOTP, resendOTP, isVerifyingOTP, isResendingOTP } = useAuth()

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtp(newOtp)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()

    // Auto-submit if all 6 digits pasted
    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = (otpString: string) => {
    verifyOTP({ email, otp: otpString })
  }

  const handleResend = () => {
    resendOTP(email)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invalid Request</CardTitle>
            <CardDescription className="text-center">
              Email parameter is missing. Please try logging in again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link to="/login">Go to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-14 w-12 text-center text-lg font-semibold"
                disabled={isVerifyingOTP}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendingOTP || isVerifyingOTP}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isResendingOTP ? 'Sending...' : 'Resend'}
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={() => handleVerify(otp.join(''))}
            className="w-full"
            disabled={otp.some((digit) => !digit) || isVerifyingOTP}
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify email'
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
