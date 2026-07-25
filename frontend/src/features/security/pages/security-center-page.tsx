import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  History,
  Lock,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Trash2,
  Plus,
  Monitor,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  securityApi,
  SessionDevice,
  LoginLog,
  PasswordPolicy,
  ApiToken,
} from '@/features/security/api/security-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SecurityCenterPage() {
  const [activeTab, setActiveTab] = useState<'2fa' | 'sessions' | 'logs' | 'policy' | 'tokens'>('2fa')

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [isLoading2FA, setIsLoading2FA] = useState(false)

  // Sessions state
  const [sessions, setSessions] = useState<SessionDevice[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  // Login History state
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  // Password Policy state
  const [policy, setPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
  })
  const [testPassword, setTestPassword] = useState('')
  const [showTestPassword, setShowTestPassword] = useState(false)

  // API Tokens state
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [newTokenName, setNewTokenName] = useState('')
  const [createdTokenKey, setCreatedTokenKey] = useState<string | null>(null)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  // Load initial security data
  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const [res2fa, resSessions, resLogs, resPolicy, resTokens] = await Promise.all([
        securityApi.get2FAStatus(),
        securityApi.getSessions(),
        securityApi.getLoginHistory(),
        securityApi.getPasswordPolicy(),
        securityApi.getApiTokens(),
      ])

      if (res2fa.success && res2fa.data) setIs2FAEnabled(res2fa.data.isEnabled)
      if (resSessions.success && resSessions.data) setSessions(resSessions.data)
      if (resLogs.success && resLogs.data) setLoginLogs(resLogs.data)
      if (resPolicy.success && resPolicy.data) setPolicy(resPolicy.data)
      if (resTokens.success && resTokens.data) setTokens(resTokens.data)
    } catch (error) {
      console.error('Failed to fetch security center data:', error)
    }
  }

  // 2FA Actions
  const handleGenerate2FA = async () => {
    setIsLoading2FA(true)
    try {
      const res = await securityApi.generate2FASecret()
      if (res.success && res.data) {
        setQrCodeData(res.data)
        toast.info('Scan QR code or use secret key in Authenticator App.')
      }
    } catch {
      toast.error('Failed to generate 2FA secret.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!totpCode || totpCode.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit authentication code.')
      return
    }
    setIsLoading2FA(true)
    try {
      const res = await securityApi.enable2FA(totpCode)
      if (res.success) {
        setIs2FAEnabled(true)
        setQrCodeData(null)
        setTotpCode('')
        toast.success('Two-factor authentication enabled successfully!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enable 2FA.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsLoading2FA(true)
    try {
      const res = await securityApi.disable2FA()
      if (res.success) {
        setIs2FAEnabled(false)
        setQrCodeData(null)
        toast.success('Two-factor authentication disabled.')
      }
    } catch {
      toast.error('Failed to disable 2FA.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  // Session Actions
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await securityApi.revokeSession(sessionId)
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        toast.success('Session revoked successfully.')
      }
    } catch {
      toast.error('Failed to revoke session.')
    }
  }

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await securityApi.revokeOtherSessions()
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent))
        toast.success(`Revoked ${res.data?.revokedCount || 0} other active sessions.`)
      }
    } catch {
      toast.error('Failed to revoke other sessions.')
    }
  }

  // Password Policy Save
  const handleSavePolicy = async () => {
    try {
      const res = await securityApi.updatePasswordPolicy(policy)
      if (res.success) {
        toast.success('Password policy updated successfully.')
      }
    } catch {
      toast.error('Failed to update password policy.')
    }
  }

  // API Token Actions
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTokenName.trim()) {
      toast.error('Please enter a token name.')
      return
    }
    setIsLoadingTokens(true)
    try {
      const res = await securityApi.createApiToken(newTokenName, ['read', 'write'])
      if (res.success && res.data) {
        setTokens((prev) => [res.data.token, ...prev])
        setCreatedTokenKey(res.data.token.fullKey || null)
        setNewTokenName('')
        toast.success('API token created successfully!')
      }
    } catch {
      toast.error('Failed to create API token.')
    } finally {
      setIsLoadingTokens(false)
    }
  }

  const handleRevokeToken = async (tokenId: string) => {
    try {
      const res = await securityApi.revokeApiToken(tokenId)
      if (res.success) {
        setTokens((prev) => prev.filter((t) => t.id !== tokenId))
        toast.success('API token revoked.')
      }
    } catch {
      toast.error('Failed to revoke API token.')
    }
  }

  // Password Strength Calculator
  const calculateStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= policy.minLength) score += 25
    if (/[A-Z]/.test(pwd) && policy.requireUppercase) score += 25
    if (/[0-9]/.test(pwd) && policy.requireNumbers) score += 25
    if (/[^A-Za-z0-9]/.test(pwd) && policy.requireSpecialChars) score += 25
    return score
  }

  const passwordScore = calculateStrength(testPassword)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-emerald-500" />
            Security Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage authentication security, active sessions, login history, password policies, and API keys.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSecurityData} className="gap-1.5 self-start md:self-auto text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Audit Data
        </Button>
      </div>

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">2FA Protection</p>
              <h3 className="text-lg font-bold mt-1 flex items-center gap-1.5">
                {is2FAEnabled ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Enabled</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">Disabled</span>
                )}
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Devices</p>
              <h3 className="text-lg font-bold mt-1">{sessions.length} Session{sessions.length !== 1 ? 's' : ''}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Monitor className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Login History</p>
              <h3 className="text-lg font-bold mt-1">{loginLogs.length} Recent Event{loginLogs.length !== 1 ? 's' : ''}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">API Keys</p>
              <h3 className="text-lg font-bold mt-1">{tokens.length} Active Key{tokens.length !== 1 ? 's' : ''}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Key className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b overflow-x-auto no-scrollbar gap-2 pb-1">
        {[
          { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone },
          { id: 'sessions', label: 'Sessions & Devices', icon: Monitor },
          { id: 'logs', label: 'Login History', icon: History },
          { id: 'policy', label: 'Password Policy', icon: Lock },
          { id: 'tokens', label: 'API Tokens', icon: Key },
        ].map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* 1. TWO-FACTOR AUTHENTICATION */}
        {activeTab === '2fa' && (
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-500" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Secure your account with an extra layer of protection using Google Authenticator or Authy.
                  </CardDescription>
                </div>
                <Badge variant={is2FAEnabled ? 'default' : 'outline'} className={is2FAEnabled ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}>
                  {is2FAEnabled ? '2FA Active' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {is2FAEnabled ? (
                <div className="rounded-lg border bg-emerald-500/5 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">2FA Security is Enabled</h4>
                      <p className="text-xs text-muted-foreground">
                        Your account requires a 6-digit TOTP verification code on every login.
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDisable2FA} disabled={isLoading2FA}>
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!qrCodeData ? (
                    <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">Set up Two-Factor Authentication</h4>
                        <p className="text-xs text-muted-foreground">
                          Scan a QR code with an authenticator app (Google Authenticator, Authy, 1Password).
                        </p>
                      </div>
                      <Button onClick={handleGenerate2FA} disabled={isLoading2FA} className="gap-2 shrink-0">
                        <QrCode className="h-4 w-4" />
                        Generate Setup Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Scan QR Code or Copy Secret Key</h4>
                        <p className="text-xs text-muted-foreground">
                          Enter secret code <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground font-semibold">{qrCodeData.secret}</code> manually or scan in your authenticator app.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 border p-4 rounded-lg bg-background">
                        <div className="p-3 bg-white rounded-lg border shadow-sm">
                          <QrCode className="h-28 w-28 text-slate-900" />
                        </div>
                        <div className="space-y-3 flex-1 w-full">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Verify 6-Digit Code</Label>
                            <Input
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value)}
                              className="font-mono text-center tracking-widest text-lg h-11"
                            />
                          </div>
                          <Button onClick={handleEnable2FA} disabled={isLoading2FA || totpCode.length !== 6} className="w-full">
                            Verify & Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 2. SESSION & DEVICE MANAGEMENT */}
        {activeTab === 'sessions' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    Active Sessions & Authorized Devices
                  </CardTitle>
                  <CardDescription className="text-xs">
                    View active web sessions and revoke unknown device access.
                  </CardDescription>
                </div>
                {sessions.length > 1 && (
                  <Button variant="outline" size="sm" onClick={handleRevokeAllOtherSessions} className="text-xs text-destructive hover:bg-destructive/10">
                    Revoke All Other Sessions
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border rounded-lg p-3 bg-card shadow-xs gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-muted shrink-0">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{session.device}</h4>
                          {session.isCurrent && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              Current Device
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.browser} | IP: {session.ipAddress}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Last active: {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)} className="text-xs text-destructive hover:bg-destructive/10">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. LOGIN HISTORY */}
        {activeTab === 'logs' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-purple-500" />
                Login Activity Audit Log
              </CardTitle>
              <CardDescription className="text-xs">
                Review recent account sign-in attempts, timestamps, and IP addresses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Device / Browser</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20">
                        <td className="p-3 font-medium whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={log.status === 'SUCCESS' ? 'outline' : 'destructive'}
                            className={log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono">{log.ipAddress}</td>
                        <td className="p-3 text-muted-foreground">{log.device} ({log.browser})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. PASSWORD POLICY */}
        {activeTab === 'policy' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Password Complexity & Policy Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure complexity rules and test password strength compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-semibold text-sm">Policy Requirements</h4>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={policy.minLength}
                      onChange={(e) => setPolicy({ ...policy, minLength: Number(e.target.value) })}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    {[
                      { key: 'requireUppercase', label: 'Require Uppercase Letter (A-Z)' },
                      { key: 'requireNumbers', label: 'Require Numbers (0-9)' },
                      { key: 'requireSpecialChars', label: 'Require Special Characters (!@#$)' },
                    ].map((rule) => (
                      <label key={rule.key} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(policy as any)[rule.key]}
                          onChange={(e) => setPolicy({ ...policy, [rule.key]: e.target.checked })}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <span>{rule.label}</span>
                      </label>
                    ))}
                  </div>

                  <Button onClick={handleSavePolicy} size="sm" className="w-full mt-2">
                    Update Password Policy
                  </Button>
                </div>

                {/* Password Strength Preview Tool */}
                <div className="space-y-4 border rounded-lg p-4 bg-card">
                  <h4 className="font-semibold text-sm">Interactive Password Strength Meter</h4>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Test Password Input</Label>
                    <div className="relative">
                      <Input
                        type={showTestPassword ? 'text' : 'password'}
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        placeholder="Type a password to test compliance..."
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTestPassword(!showTestPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showTestPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {testPassword && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Password Strength:</span>
                        <span className={passwordScore >= 75 ? 'text-emerald-500' : passwordScore >= 50 ? 'text-amber-500' : 'text-rose-500'}>
                          {passwordScore >= 100 ? 'Strong' : passwordScore >= 50 ? 'Medium' : 'Weak'} ({passwordScore}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordScore >= 75 ? 'bg-emerald-500' : passwordScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${passwordScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. API TOKENS */}
        {activeTab === 'tokens' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-5 w-5 text-rose-500" />
                API Token & Key Management
              </CardTitle>
              <CardDescription className="text-xs">
                Create personal access tokens to integrate external apps with system APIs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create Key Form */}
              <form onSubmit={handleCreateToken} className="flex flex-col sm:flex-row items-end gap-3 border p-4 rounded-lg bg-muted/20">
                <div className="space-y-1 flex-1 w-full">
                  <Label className="text-xs font-medium">Token Name / Purpose</Label>
                  <Input
                    placeholder="e.g. Mobile App Integration, POS Terminal 1"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <Button type="submit" disabled={isLoadingTokens} className="h-10 px-4 gap-1.5 shrink-0">
                  <Plus className="h-4 w-4" />
                  Generate Token
                </Button>
              </form>

              {/* Created Token Secret Alert */}
              {createdTokenKey && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Copy Your API Secret Key Now</span>
                  </div>
                  <p className="text-muted-foreground">
                    This secret key will <strong>never be shown again</strong>. Please copy and store it securely.
                  </p>
                  <div className="flex items-center gap-2 bg-background p-2.5 rounded border font-mono font-semibold">
                    <span className="flex-1 truncate">{createdTokenKey}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTokenKey)
                        toast.success('Copied to clipboard!')
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              {/* Tokens Table */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Active API Keys</h4>
                {tokens.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No API tokens created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tokens.map((token) => (
                      <div key={token.id} className="flex items-center justify-between border rounded-lg p-3 bg-card">
                        <div>
                          <h5 className="font-semibold text-sm">{token.name}</h5>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{token.maskedKey}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Created: {new Date(token.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeToken(token.id)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
