import { CouponsManager } from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Cupones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descuentos por porcentaje o monto fijo. Se aplican antes del envío y se validan en el servidor.
        </p>
      </header>
      <CouponsManager />
    </div>
  );
}
