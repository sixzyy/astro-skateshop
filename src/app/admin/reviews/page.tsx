import { ReviewsManager } from "@/components/admin/reviews-manager";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Reseñas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Las reseñas nuevas llegan como “por moderar”: solo se publican cuando las apruebas.
        </p>
      </header>
      <ReviewsManager />
    </div>
  );
}
