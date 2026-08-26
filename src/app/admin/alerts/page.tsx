import { StockAlertsList } from "@/components/admin/stock-alerts-list";

export const dynamic = "force-dynamic";

export default function AdminAlertsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Alertas de stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Clientes que dejaron su correo en tallas agotadas. Repón stock, cópialos y avísales; luego márcalos como listos.
        </p>
      </header>
      <StockAlertsList />
    </div>
  );
}
