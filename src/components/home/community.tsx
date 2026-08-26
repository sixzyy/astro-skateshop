import { Heart, MessageCircle, Music2 } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

const POSTS = [
  {
    handle: "@astro.rita",
    likes: "12.4k",
    type: "ig" as const,
    gradient: "from-galaxy via-[#4b1a8f] to-accent/40",
    caption: "Sesión nocturna en el cráter",
  },
  {
    handle: "@nico_ollies",
    likes: "8.1k",
    type: "tt" as const,
    gradient: "from-cta/70 via-[#7a2d00] to-background",
    caption: "Kickflip orbital",
  },
  {
    handle: "@astro.skateshop",
    likes: "3.2k",
    type: "yt" as const,
    gradient: "from-accent/50 via-[#005f6b] to-background",
    caption: "Setup de la semana",
  },
  {
    handle: "@luna.grinds",
    likes: "21.9k",
    type: "tt" as const,
    gradient: "from-[#a1128c]/70 via-galaxy to-background",
    caption: "Nosegrind interestelar",
  },
  {
    handle: "@astro.crew",
    likes: "6.7k",
    type: "ig" as const,
    gradient: "from-[#0e8f7c]/60 via-[#023a31] to-background",
    caption: "Drop 03 detrás de cámaras",
  },
  {
    handle: "@pablo.bowl",
    likes: "15.3k",
    type: "ig" as const,
    gradient: "from-[#1173b4]/60 via-[#032c47] to-background",
    caption: "Bowl con gravedad cero",
  },
];

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/astroskateshop" },
  { icon: Music2, label: "TikTok", href: "https://tiktok.com/@astroskateshop" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@astroskateshop" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/5215512345678" },
];

function PostIcon({ type }: { type: "ig" | "tt" | "yt" }) {
  if (type === "tt") return <Music2 className="h-6 w-6" strokeWidth={1.6} />;
  if (type === "yt") return <YoutubeIcon className="h-6 w-6" strokeWidth={1.6} />;
  return <InstagramIcon className="h-6 w-6" strokeWidth={1.6} />;
}

export function AstroCommunity() {
  return (
    <section className="border-t border-accent/15 bg-gradient-to-b from-background to-galaxy-deep/40 py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">// astro community</span>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              Sigue el flow
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Riders del equipo, drops exclusivos y sesiones que rompen la gravedad. Etiquétanos para aparecer aquí.
            </p>
          </div>
          <div className="flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_16px_rgba(0,240,255,0.35)]"
              >
                <s.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {POSTS.map((post) => (
            <a
              key={post.handle + post.caption}
              href={SOCIALS.find((s) =>
                post.type === "tt" ? s.label === "TikTok" : post.type === "yt" ? s.label === "YouTube" : s.label === "Instagram"
              )!.href}
              target="_blank"
              rel="noreferrer"
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-lg border border-border bg-gradient-to-br p-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_0_28px_rgba(0,240,255,0.22)] ${post.gradient}`}
            >
              <div className="scanlines absolute inset-0 opacity-30" />
              <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/80">
                <PostIcon type={post.type} />
                {post.handle}
              </div>
              <div className="relative">
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">{post.caption}</p>
                <p className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-white/70">
                  <Heart className="h-3 w-3 fill-current" /> {post.likes}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
