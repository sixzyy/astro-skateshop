"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function labelFor(dateIso: string) {
  const [, m, d] = dateIso.split("-");
  return `${Number(d)} ${MONTHS_SHORT[Number(m) - 1]}`;
}

export function SalesChart() {
  const [data, setData] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (alive) setData(json.dailySeries ?? []);
      })
      .catch(() => null)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest">Ventas · últimos 30 días</h2>
        {!loading && data.length > 0 && (
          <span className="text-xs text-muted-foreground">COP por día</span>
        )}
      </div>
      {loading ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Cargando métricas…
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Sin datos todavía.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={labelFor}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#ffffff22" }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={62}
                tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 2 })} COP`, "Ventas"]}
                labelFormatter={(l) => labelFor(String(l))}
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #00F0FF55",
                  borderRadius: 8,
                  fontFamily: "var(--font-display), sans-serif",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#00F0FF"
                strokeWidth={2}
                fill="url(#salesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
