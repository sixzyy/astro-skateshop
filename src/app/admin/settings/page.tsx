import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Ajustes de la tienda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envíos, anuncios y contacto. Los cambios se aplican al instante en toda la tienda.
        </p>
      </header>
      <SettingsForm />
    </div>
  );
}
