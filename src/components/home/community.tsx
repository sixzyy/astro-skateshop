import { Heart, Star } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

const POSTS = [
  { handle: "@astro.rita", likes: "12.4k", caption: "Sesion nocturna", color: "bg-cosmic-violet" },
  { handle: "@nico_ollies", likes: "8.1k", caption: "Kickflip orbital", color: "bg-cosmic-blue" },
  { handle: "@astro.skateshop", likes: "3.2k", caption: "Setup de la semana", color: "bg-card-elevated" },
  { handle: "@luna.grinds", likes: "21.9k", caption: "Nosegrind smooth", color: "bg-cosmic-indigo" },
  { handle: "@astro.crew", likes: "6.7k", caption: "Drop 03 behind the scenes", color: "bg-card" },
  { handle: "@pablo.bowl", likes: "15.3k", caption: "Bowl session", color: "bg-cosmic-purple" },
];

export function AstroCommunity() {
  return (
    <section className="bg-background-secondary py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">
              Community
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              Sigue el flow
            </h2>
          </div>
          <div className="flex gap-2">
            {[
              { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/astroskateshop" },
              { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@astroskateshop" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground-secondary transition-all duration-200 hover:border-border-active hover:text-foreground hover:bg-background-secondary"
              >
                <s.icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {POSTS.map((post) => (
            <a
              key={post.handle + post.caption}
              href="https://instagram.com/astroskateshop"
              target="_blank"
              rel="noreferrer"
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-lg p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(84,216,255,0.06)] ${post.color}`}
            >
              <div className="relative font-mono text-[10px] font-medium uppercase tracking-wider text-foreground-disabled">
                {post.handle}
              </div>
              <div className="relative">
                <p className="text-xs font-semibold text-foreground">{post.caption}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-foreground-muted">
                  <Heart className="h-3 w-3" /> {post.likes}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
