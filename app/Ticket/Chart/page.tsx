"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import "../chart.css";

const TEST_DRAW_AT = new Date("2026-12-05T20:00:00+06:00").getTime();

const ticketBanners = [
  { price: 10, prize: "৳1,00,000", prizePool: "এক লাখ টাকা", alt: "৳10 ticket — ৳1,00,000 prize pool", image: "/platform/images/tickets/ticket-10.webp" },
  { price: 20, prize: "৳2,00,000", prizePool: "দুই লাখ টাকা", alt: "৳20 ticket — ৳2,00,000 prize pool", image: "/platform/images/tickets/ticket-20.webp" },
  { price: 50, prize: "৳5,00,000", prizePool: "পাঁচ লাখ টাকা", alt: "৳50 ticket — ৳5,00,000 prize pool", image: "/platform/images/tickets/ticket-50.webp" },
  { price: 100, prize: "৳10,00,000", prizePool: "দশ লাখ টাকা", alt: "৳100 ticket — ৳10,00,000 prize pool", image: "/platform/images/tickets/ticket-100.webp" },
  { price: 200, prize: "৳20,00,000", prizePool: "বিশ লাখ টাকা", alt: "৳200 ticket — ৳20,00,000 prize pool", image: "/platform/images/tickets/ticket-200.webp" },
  { price: 500, prize: "৳50,00,000", prizePool: "পঞ্চাশ লাখ টাকা", alt: "৳500 ticket — ৳50,00,000 prize pool", image: "/platform/images/tickets/ticket-500.webp" },
  { price: 1000, prize: "৳1,00,00,000", prizePool: "এক কোটি টাকা", alt: "৳1,000 ticket — ৳1,00,00,000 prize pool", image: "/platform/images/tickets/ticket-1000.webp" },
] as const;

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownTimer({ now }: { now: number }) {
  const time = formatCountdown(TEST_DRAW_AT - now);

  return (
    <span className="ticket-countdown" aria-label={`ড্র শুরু হতে ${time.days} দিন ${time.hours} ঘণ্টা ${time.minutes} মিনিট ${time.seconds} সেকেন্ড বাকি`}>
      <span className="ticket-countdown-unit"><strong>{String(time.days).padStart(2, "0")}</strong><small>দিন</small></span>
      <span className="ticket-countdown-separator">:</span>
      <span className="ticket-countdown-unit"><strong>{String(time.hours).padStart(2, "0")}</strong><small>ঘণ্টা</small></span>
      <span className="ticket-countdown-separator">:</span>
      <span className="ticket-countdown-unit"><strong>{String(time.minutes).padStart(2, "0")}</strong><small>মিনিট</small></span>
      <span className="ticket-countdown-separator">:</span>
      <span className="ticket-countdown-unit"><strong>{String(time.seconds).padStart(2, "0")}</strong><small>সেকেন্ড</small></span>
    </span>
  );
}

export default function TicketChartPage() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <SiteShell>
      <main className="ticket-chart-page" aria-label="Ticket chart">
        <div className="ticket-chart-list">
          {ticketBanners.map((ticket) => (
            <Link
              className="ticket-chart-card"
              key={ticket.price}
              href={`/Ticket/Purchase/?price=${ticket.price}`}
              aria-label={`${ticket.price} টাকার টিকিট কিনুন, প্রাইজ পুল ${ticket.prize}`}
            >
              <img
                className="ticket-chart-image"
                src={ticket.image}
                alt={ticket.alt}
                loading={ticket.price === 10 ? "eager" : "lazy"}
                decoding="async"
              />
              {now > 0 && <CountdownTimer now={now} />}
            </Link>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
