import { Suspense } from "react";
import { CheckoutBody } from "@/components/checkout/checkout-body";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  const expressAvailable = Boolean(getStripe());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-bold uppercase tracking-tight">Finalizar compra</h1>
      <Suspense fallback={null}>
        <CheckoutBody expressAvailable={expressAvailable} />
      </Suspense>
    </div>
  );
}
