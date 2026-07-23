import { useState } from 'react'
import { 
  User as UserIcon, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/store/auth-store'
import apiClient from '@/lib/api-client'
import { getInitials } from '@/utils/format'
import { getPrimaryRoleCategory } from '@/utils/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export function ProfilePage() {
  const { user } = useAuth()
  const { setUser } = useAuthStore()
  const roleCategory = getPrimaryRoleCategory(user)

  // Personal Info Form State
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // Password Form State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('')

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setProfileSuccessMsg('')
    setProfileErrorMsg('')

    try {
      const response = await apiClient.put('/auth/profile', {
        firstName,
        lastName,
        email,
        phone,
      })

      if (response.data?.data) {
        setUser(response.data.data)
      } else if (user) {
        setUser({
          ...user,
          firstName,
          lastName,
          email,
          phone,
        })
      }

      setProfileSuccessMsg('Your profile and login email details have been saved to the database!')
    } catch (err: any) {
      setProfileErrorMsg(err.response?.data?.message || 'Failed to update profile details.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccessMsg('')
    setPasswordErrorMsg('')

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordErrorMsg('New password must be at least 8 characters long.')
      return
    }

    setIsChangingPassword(true)

    try {
      await apiClient.put('/auth/change-password', {
        oldPassword,
        newPassword,
      })

      setPasswordSuccessMsg('New password saved to database! You can now use your new password whenever logging in.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordErrorMsg(err.response?.data?.message || 'Failed to change password. Verify your current password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const userRoles = user?.roles || (user?.role ? [user.role] : ['user'])
  const userPermissions = user?.permissions || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 via-purple-600 to-primary p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
            <AvatarImage src={user?.avatar} alt={user?.firstName} />
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
              {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1">
                <Sparkles className="h-3 w-3" />
                Active Account
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {user?.phone}
                </span>
              )}
            </div>

            {/* Assigned Roles Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {userRoles.map((role) => (
                <Badge key={role} className="bg-black/30 text-white capitalize border-0">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  {role.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="details" className="gap-2">
            <UserIcon className="h-4 w-4" /> Profile Details
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Permissions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Details */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Update your personal contact details and profile attributes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {profileSuccessMsg && (
                  <div className="flex items-center gap-2 p-4 text-sm bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="flex items-center gap-2 p-4 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Login Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Updating your email changes your system login credential.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isUpdatingProfile} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Security</CardTitle>
              <CardDescription>
                Change your account password to keep your inventory access secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                {passwordSuccessMsg && (
                  <div className="flex items-center gap-2 p-4 text-sm bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                {passwordErrorMsg && (
                  <div className="flex items-center gap-2 p-4 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isChangingPassword} className="gap-2">
                    <KeyRound className="h-4 w-4" />
                    {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Permissions & Role Overview */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Assigned Role & System Capabilities</CardTitle>
              <CardDescription>
                View your active permissions and operational access in the inventory system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div>
                  <h4 className="font-semibold capitalize text-base">
                    Primary Role: {roleCategory.replace(/-/g, ' ')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {roleCategory === 'super-admin' && 'Full system control, administrative actions, and management across all modules.'}
                    {roleCategory === 'inventory-manager' && 'Manage product stock levels, warehouses, categories, and inventory audits.'}
                    {roleCategory === 'procurement-officer' && 'Manage purchase orders, suppliers, and incoming inventory shipments.'}
                    {roleCategory === 'sales-officer' && 'Manage POS terminal checkouts, customer sales, and order invoicing.'}
                    {roleCategory === 'finance-manager' && 'View financial reports, payment transactions, profit margins, and export summaries.'}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize text-sm py-1 px-3">
                  {userRoles[0] || 'User'}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Active Module Permissions</h4>
                {userPermissions.length === 0 ? (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-muted-foreground">
                    All standard module operations are granted to your account role.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userPermissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="font-mono text-xs py-1 px-2.5">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
