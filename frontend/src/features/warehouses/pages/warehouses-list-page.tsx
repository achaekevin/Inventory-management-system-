import { useState } from 'react'
import {
  Warehouse as WarehouseIcon,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Package,
  LayoutList,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Layers,
  Search,
  X,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  useWarehouse,
  useCreateZone,
  useDeleteZone,
} from '../hooks/use-warehouses'
import type { Warehouse, WarehouseZone } from '../services/warehouse-service'

// ─── Validation Schemas ───────────────────────────────────────────────────────

const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').toUpperCase(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

const zoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  code: z.string().min(1, 'Zone code is required').toUpperCase(),
  description: z.string().optional(),
})

type WarehouseFormData = z.infer<typeof warehouseSchema>
type ZoneFormData = z.infer<typeof zoneSchema>

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Warehouse Form Dialog ────────────────────────────────────────────────────

function WarehouseFormDialog({
  open,
  onClose,
  editingWarehouse,
}: {
  open: boolean
  onClose: () => void
  editingWarehouse: Warehouse | null
}) {
  const { mutate: createWarehouse, isPending: isCreating } = useCreateWarehouse()
  const { mutate: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: editingWarehouse
      ? {
          name: editingWarehouse.name,
          code: editingWarehouse.code,
          description: editingWarehouse.description || '',
          address: editingWarehouse.address || '',
          city: editingWarehouse.city || '',
          state: editingWarehouse.state || '',
          country: editingWarehouse.country || '',
          zipCode: editingWarehouse.zipCode || '',
          phone: editingWarehouse.phone || '',
          email: editingWarehouse.email || '',
          isActive: editingWarehouse.isActive,
        }
      : { isActive: true },
  })

  const onSubmit = (data: WarehouseFormData) => {
    const payload = { ...data, email: data.email || undefined }
    if (editingWarehouse) {
      updateWarehouse({ id: editingWarehouse.id, ...payload }, { onSuccess: () => { onClose(); reset() } })
    } else {
      createWarehouse(payload, { onSuccess: () => { onClose(); reset() } })
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WarehouseIcon className="h-5 w-5" />
            {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-name">Warehouse Name *</Label>
              <Input id="w-name" {...register('name')} placeholder="Main Warehouse" disabled={isPending} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-code">Warehouse Code *</Label>
              <Input id="w-code" {...register('code')} placeholder="WH-001" disabled={isPending} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="w-desc">Description</Label>
            <Textarea id="w-desc" {...register('description')} placeholder="Optional description..." disabled={isPending} rows={2} />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-phone">Phone</Label>
              <Input id="w-phone" {...register('phone')} placeholder="+1 234 567 890" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-email">Email</Label>
              <Input id="w-email" type="email" {...register('email')} placeholder="warehouse@example.com" disabled={isPending} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="w-address">Address</Label>
            <Input id="w-address" {...register('address')} placeholder="123 Industrial Ave" disabled={isPending} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-city">City</Label>
              <Input id="w-city" {...register('city')} placeholder="Nairobi" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-state">State / County</Label>
              <Input id="w-state" {...register('state')} placeholder="Nairobi County" disabled={isPending} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-country">Country</Label>
              <Input id="w-country" {...register('country')} placeholder="Kenya" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-zip">ZIP / Postal Code</Label>
              <Input id="w-zip" {...register('zipCode')} placeholder="00100" disabled={isPending} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="w-active" {...register('isActive')} disabled={isPending} className="h-4 w-4 rounded border-input" />
            <Label htmlFor="w-active">Active Warehouse</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { onClose(); reset() }} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Zone Form Dialog ─────────────────────────────────────────────────────────

function ZoneFormDialog({
  open,
  warehouseId,
  onClose,
}: {
  open: boolean
  warehouseId: string
  onClose: () => void
}) {
  const { mutate: createZone, isPending } = useCreateZone()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ZoneFormData>({ resolver: zodResolver(zoneSchema) })

  const onSubmit = (data: ZoneFormData) => {
    createZone({ warehouseId, ...data }, {
      onSuccess: () => { onClose(); reset() }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Add Warehouse Zone
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="z-name">Zone Name *</Label>
            <Input id="z-name" {...register('name')} placeholder="Zone A" disabled={isPending} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="z-code">Zone Code *</Label>
            <Input id="z-code" {...register('code')} placeholder="ZA-01" disabled={isPending} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="z-desc">Description</Label>
            <Textarea id="z-desc" {...register('description')} placeholder="Optional description..." disabled={isPending} rows={2} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Zone'}</Button>
            <Button type="button" variant="outline" onClick={() => { onClose(); reset() }}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Warehouse Detail Sheet ───────────────────────────────────────────────────

function WarehouseDetailSheet({
  warehouseId,
  open,
  onClose,
  onEdit,
}: {
  warehouseId: string | null
  open: boolean
  onClose: () => void
  onEdit: (w: Warehouse) => void
}) {
  const [addingZone, setAddingZone] = useState(false)
  const { data: warehouse, isLoading } = useWarehouse(warehouseId || '')
  const { mutate: deleteZone } = useDeleteZone()

  if (!warehouseId) return null

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <WarehouseIcon className="h-5 w-5" />
              Warehouse Details
            </SheetTitle>
            <SheetDescription>Full information and zones for this warehouse.</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>
          ) : warehouse ? (
            <div className="mt-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{warehouse.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{warehouse.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={warehouse.isActive ? 'success' : 'secondary'}>
                    {warehouse.isActive ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" />Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                    )}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => onEdit(warehouse)}>
                    <Pencil className="h-4 w-4 mr-1" />Edit
                  </Button>
                </div>
              </div>

              {warehouse.description && (
                <p className="text-sm text-muted-foreground">{warehouse.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{warehouse._count?.inventory ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Inventory Items</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{warehouse._count?.zones ?? warehouse.zones?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Zones</p>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact & Location</h3>
                {(warehouse.address || warehouse.city || warehouse.country) && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>
                      {[warehouse.address, warehouse.city, warehouse.state, warehouse.zipCode, warehouse.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {warehouse.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{warehouse.phone}</span>
                  </div>
                )}
                {warehouse.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{warehouse.email}</span>
                  </div>
                )}
              </div>

              {/* Zones */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Zones</h3>
                  <Button size="sm" onClick={() => setAddingZone(true)}>
                    <Plus className="h-4 w-4 mr-1" />Add Zone
                  </Button>
                </div>

                {warehouse.zones && warehouse.zones.length > 0 ? (
                  <div className="space-y-2">
                    {warehouse.zones.map((zone: WarehouseZone) => (
                      <div
                        key={zone.id}
                        className="flex items-center justify-between rounded-lg border p-3 bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Layers className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{zone.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{zone.code}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Delete this zone?')) {
                              deleteZone({ warehouseId: warehouse.id, zoneId: zone.id })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 rounded-lg border border-dashed text-muted-foreground text-sm">
                    No zones yet. Click "Add Zone" to create one.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground mt-6">Warehouse not found.</p>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Zone Dialog */}
      {warehouseId && (
        <ZoneFormDialog
          open={addingZone}
          warehouseId={warehouseId}
          onClose={() => setAddingZone(false)}
        />
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function WarehousesListPage() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [detailWarehouseId, setDetailWarehouseId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading } = useWarehouses({ search: search || undefined })
  const { mutate: deleteWarehouse } = useDeleteWarehouse()

  const warehouses = data?.data || []

  const totalActive = warehouses.filter((w) => w.isActive).length
  const totalInventory = warehouses.reduce((s, w) => s + (w._count?.inventory || 0), 0)
  const totalZones = warehouses.reduce((s, w) => s + (w._count?.zones || 0), 0)

  const handleEdit = (w: Warehouse) => {
    setEditingWarehouse(w)
    setFormOpen(true)
    setDetailOpen(false)
  }

  const handleAdd = () => {
    setEditingWarehouse(null)
    setFormOpen(true)
  }

  const handleViewDetail = (id: string) => {
    setDetailWarehouseId(id)
    setDetailOpen(true)
  }

  const handleDelete = (w: Warehouse) => {
    if (confirm(`Delete warehouse "${w.name}"? This cannot be undone.`)) {
      deleteWarehouse(w.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground mt-1">Manage your storage facilities and zones</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Building2} label="Total Warehouses" value={warehouses.length} color="bg-blue-500/10 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Active" value={totalActive} color="bg-green-500/10 text-green-600" />
        <StatCard icon={Package} label="Inventory Items" value={totalInventory} color="bg-purple-500/10 text-purple-600" />
        <StatCard icon={Layers} label="Total Zones" value={totalZones} color="bg-orange-500/10 text-orange-600" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouses..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Table / Empty / Loading */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            Warehouse List
          </CardTitle>
          <CardDescription>
            {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Loading warehouses...
            </div>
          ) : warehouses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <WarehouseIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No warehouses found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? `No results for "${search}". Try a different search.` : 'Get started by adding your first warehouse.'}
                </p>
              </div>
              {!search && (
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Warehouse
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Zones</TableHead>
                  <TableHead className="text-center">Inventory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                          <WarehouseIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{warehouse.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{warehouse.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {warehouse.city || warehouse.country ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{[warehouse.city, warehouse.country].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {warehouse.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {warehouse.phone}
                          </div>
                        )}
                        {warehouse.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {warehouse.email}
                          </div>
                        )}
                        {!warehouse.phone && !warehouse.email && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{warehouse._count?.zones ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{warehouse._count?.inventory ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={warehouse.isActive ? 'success' : 'secondary'}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(warehouse.id)}
                          title="View details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(warehouse)}
                          title="Edit warehouse"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(warehouse)}
                          title="Delete warehouse"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Warehouse Form Dialog */}
      <WarehouseFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingWarehouse(null) }}
        editingWarehouse={editingWarehouse}
      />

      {/* Warehouse Detail Sheet */}
      <WarehouseDetailSheet
        warehouseId={detailWarehouseId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  )
}
