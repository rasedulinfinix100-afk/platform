"use client";

import { useEffect, useState } from "react";
import "./chart.css";

export type TicketChartProps = {
  jackpotAmounts?: Partial<Record<10 | 20 | 50 | 80 | 100, number | string>>;
  prizePool?: number | string;
  drawAt?: string;
};

const ticketOptions = [
  { price: 10, label: "৳10" },
  { price: 20, label: "৳20" },
  { price: 50, label: "৳50" },
  { price: 80, label: "৳80" },
  { price: 100, label: "৳100" },
] as const;

function money(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") return "—";
  return typeof value === "number" ? `৳${value.toLocaleString("en-US")}` : value;
}

export default function TicketChart({
  jackpotAmounts = {},
  prizePool,
  drawAt,
}: TicketChartProps) {
  const [remaining, setRemaining] = useState({ days: "--", hours: "--", minutes: "--", seconds: "--" });

  useEffect(() => {
    if (!drawAt) return;
    const update = () => {
      const distance = new Date(drawAt).getTime() - Date.now();
      if (!Number.isFinite(distance) || distance <= 0) {
        setRemaining({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      const total = Math.floor(distance / 1000);
      setRemaining({
        days: String(Math.floor(total / 86400)).padStart(2, "0"),
        hours: String(Math.floor((total % 86400) / 3600)).padStart(2, "0"),
        minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
        seconds: String(total % 60).padStart(2, "0"),
      });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [drawAt]);

  return (
    <section className="ticket-chart-page">
      <section className="ticket-chart-hero" aria-label="Ticket prize, prize pool and draw countdown">
        <div className="ticket-chart-hero-copy">
          <div className="ticket-chart-stat">
            <span className="ticket-chart-stat-label">TICKET PRIZE</span>
            <strong>৳10 – ৳100</strong>
          </div>
          <div className="ticket-chart-stat">
            <span className="ticket-chart-stat-label">PRIZE POOL</span>
            <strong>{money(prizePool)}</strong>
          </div>
          <div className="ticket-chart-countdown-wrap">
            <span className="ticket-chart-stat-label">DRAW TIME COUNTDOWN</span>
            <div className="ticket-chart-countdown">
              {([
                ["days", "D"],
                ["hours", "H"],
                ["minutes", "M"],
                ["seconds", "S"],
              ] as const).map(([key, unit]) => (
                <div className="ticket-chart-time-unit" key={key}>
                  <strong>{remaining[key]}</strong>
                  <span>{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <img
          className="ticket-chart-balls"
          src="/platform/images/ticket-lottery-balls.png"
          alt="Gold and green lottery balls"
          width="256"
          height="203"
        />
      </section>

      <section className="ticket-chart-grid" aria-label="Ticket prices and jackpots">
        {ticketOptions.map(({ price, label }) => (
          <article className="ticket-chart-card" key={price}>
            <span className="ticket-chart-price">{label}</span>
            <strong className="ticket-chart-jackpot">{money(jackpotAmounts[price])}</strong>
            <span className="ticket-chart-caption">JACKPOT</span>
          </article>
        ))}
      </section>
    </section>
  );
}
