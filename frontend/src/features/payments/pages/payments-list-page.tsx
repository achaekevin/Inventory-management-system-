import { CreditCard } from 'lucide-react';

export function PaymentsListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track and manage payments</p>
        </div>
      </div>

      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <div className="text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Management</h3>
          <p className="text-muted-foreground">Feature coming soon...</p>
        </div>
      </div>
    </div>
  );
}
