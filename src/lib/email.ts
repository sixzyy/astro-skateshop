import nodemailer from "nodemailer";
import { trackUrl } from "@/lib/utils";

const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export function mailConfigured() {
  return Boolean(
    RESEND_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

const FROM = () =>
  process.env.MAIL_FROM ??
  process.env.SMTP_USER ??
  (RESEND_KEY ? "Astro SkateShop <onboarding@resend.dev>" : "Astro SkateShop");

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM(), to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error(`[email] Resend respondió ${res.status}; se intenta con SMTP.`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] fallo en Resend; se intenta con SMTP:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] SMTP no configurado. Omitido -> "${subject}" para ${to}`);
    return false;
  }
  try {
    await tx.sendMail({ from: FROM(), to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] fallo al enviar:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function send(to: string, subject: string, html: string) {
  if (RESEND_KEY) {
    const ok = await sendViaResend(to, subject, html);
    if (ok) return true;
  }
  return sendViaSmtp(to, subject, html);
}

function shell(title: string, body: string, cta?: { label: string; href: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `<!doctype html><html><body style="margin:0;background:#0b0b10;font-family:Arial,Helvetica,sans-serif;color:#e8e8f0;padding:28px">
  <div style="max-width:560px;margin:0 auto;border:1px solid #26263a;border-radius:12px;overflow:hidden">
    <div style="background:#0b1424;padding:18px 24px;border-bottom:2px solid #6fc8e9">
      <span style="font-size:20px;font-weight:800;letter-spacing:2px;color:#fff">ASTRO<span style="color:#6fc8e9">SKATE</span></span>
    </div>
    <div style="padding:26px 24px">
      <h1 style="margin:0 0 14px;font-size:19px;color:#fff">${title}</h1>
      ${body}
      ${
        cta
          ? `<a href="${cta.href}" style="display:inline-block;margin-top:18px;background:#46d4bf;color:#0b1424;font-weight:700;padding:11px 22px;border-radius:6px;text-decoration:none">${cta.label}</a>`
          : ""
      }
    </div>
    <div style="padding:14px 24px;border-top:1px solid #26263a;font-size:11px;color:#8a8aa0">
      Astro SkateShop · ${url}
    </div>
  </div></body></html>`;
}

const money = (n: number) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

export async function sendOrderConfirmation(input: {
  to: string;
  number: string;
  total: number;
  items: { productName: string; variantTitle: string; quantity: number }[];
}) {
  const rows = input.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#cfcfe0">${escapeHtml(i.productName)} — ${escapeHtml(i.variantTitle)} × ${i.quantity}</td></tr>`,
    )
    .join("");
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/rastrear?numero=${input.number}`;
  const body = `
    <p style="color:#cfcfe0;margin:0 0 12px">Recibimos tu pedido y ya lo estamos preparando. 🛹</p>
    <p style="font-mono;margin:0 0 8px"><strong style="color:#6fc8e9">${input.number}</strong></p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="font-size:17px;margin:16px 0 0"><strong>Total: ${money(input.total)}</strong></p>`;
  return send(input.to, `Pedido confirmado ${input.number} · Astro SkateShop`, shell("¡Gracias por tu compra!", body, { label: "Rastrear pedido", href: url }));
}

const STATUS_COPY: Record<string, string> = {
  PAID: "Tu pago fue confirmado. 🎉",
  SHIPPED: "¡Tu pedido va en camino! Prepara la pistas.",
  DELIVERED: "Pedido entregado. ¡Que disfrutes tu setup!",
  CANCELLED: "Tu pedido fue cancelado. Si es un error contáctanos.",
};

export async function sendOrderStatusUpdate(input: {
  to: string;
  number: string;
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
}) {
  const msg = STATUS_COPY[input.status] ?? `Estado actualizado: ${input.status}`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/rastrear?numero=${input.number}`;

  let trackingHtml = "";
  if (input.trackingNumber && input.status !== "CANCELLED") {
    const link = trackUrl(input.trackingNumber, input.carrier);
    const carrierName =
      input.carrier === "estafeta" ? "Estafeta"
      : input.carrier === "dhl" ? "DHL"
      : input.carrier === "fedex" ? "FedEx"
      : null;
    trackingHtml = `
      <div style="margin-top:16px;padding:14px;border:1px solid #26263a;border-radius:8px;background:#101018">
        <p style="margin:0 0 4px;font-size:12px;color:#8a8aa0;text-transform:uppercase;letter-spacing:1px">Guía de rastreo</p>
        <p style="margin:0 0 10px;font-size:18px;font-weight:bold;color:#6fc8e9;letter-spacing:1px">${escapeHtml(input.trackingNumber)}</p>
        <a href="${link}" style="color:#6fc8e9;font-size:13px">Rastrear paquete${carrierName ? ` en ${carrierName}` : " aquí"} →</a>
      </div>`;
  }

  return send(
    input.to,
    `Actualización ${input.number} · Astro SkateShop`,
    shell("Tu pedido tiene novedades", `<p style="color:#cfcfe0">${msg}</p>${trackingHtml}`, {
      label: "Ver estado",
      href: url,
    }),
  );
}

export async function sendRestockAlerts(input: {
  product: string;
  variantTitle: string;
  emails: string[];
}) {
  let sent = 0;
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/`;
  for (const to of input.emails) {
    const ok = await send(
      to,
      `Ya está disponible: ${input.product} · Astro SkateShop`,
      shell("Corre que se vuela", `<p style="color:#cfcfe0"><strong>${escapeHtml(input.product)}</strong> — talla ${escapeHtml(input.variantTitle)} — acaba de reabastecerse.</p>`, { label: "Comprar ahora", href: url }),
    );
    if (ok) sent++;
  }
  return sent;
}
