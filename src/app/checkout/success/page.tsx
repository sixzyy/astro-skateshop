import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido confirmado" };

type SearchParams = Promise<{ number?: string }>;

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { number } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
        {number ? (
          <CheckCircle2 className="h-10 w-10 text-accent" strokeWidth={1.5} />
        ) : (
          <Package className="h-10 w-10 text-accent" strokeWidth={1.5} />
        )}
      </span>

      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight">
        {number ? "¡Gracias por tu compra!" : "Pedido en proceso"}
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        {number
          ? "Tu pedido fue registrado correctamente. Te enviamos la confirmación y el detalle de entrega a tu correo."
          : "Estamos confirmando tu pago. En unos minutos recibirás la confirmación en tu correo."}
      </p>

      {number && (
        <p className="mt-6 rounded-lg border border-dashed border-border px-6 py-3 font-display text-lg font-bold tracking-wide">
          N° de orden: <span className="text-accent">{number}</span>
        </p>
      )}

      <Link
        href="/products"
        className="mt-8 inline-flex h-12 items-center rounded-md bg-accent px-7 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-accent-strong active:scale-[0.98]"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
