import { Heart } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

const POSTS = [
  {
    handle: "@astro.rita",
    likes: "12.4k",
    caption: "Sesion nocturna en el crater",
    color: "bg-cosmic-violet",
  },
  {
    handle: "@nico_ollies",
    likes: "8.1k",
    caption: "Kickflip orbital",
    color: "bg-cta/15",
  },
  {
    handle: "@astro.skateshop",
    likes: "3.2k",
    caption: "Setup de la semana",
    color: "bg-accent-deep",
  },
  {
    handle: "@luna.grinds",
    likes: "21.9k",
    caption: "Nosegrind interestelar",
    color: "bg-cosmic-indigo",
  },
  {
    handle: "@astro.crew",
    likes: "6.7k",
    caption: "Drop 03 detras de camaras",
    color: "bg-cosmic-blue",
  },
  {
    handle: "@pablo.bowl",
    likes: "15.3k",
    caption: "Bowl con gravedad cero",
    color: "bg-card-elevated",
  },
];

export function AstroCommunity() {
  return (
    <section className="cosmic-indigo py-20">
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-secondary transition-all duration-300 hover:border-border-active hover:text-foreground"
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
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-lg p-3 transition-all duration-300 hover:-translate-y-0.5 ${post.color}`}
            >
              <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground-secondary/70">
                {post.handle}
              </div>
              <div className="relative">
                <p className="text-xs font-semibold leading-snug text-foreground">
                  {post.caption}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-foreground-secondary/50">
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
