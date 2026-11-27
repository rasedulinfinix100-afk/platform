import "../chart.css";
import { SiteShell } from "@/components/SiteShell";

const ticketBanners = [
  { price: 10, prize: "৳1,00,000", prizePool: "এক লাখ টাকা", alt: "৳10 ticket — ৳1,00,000 prize pool" },
  { price: 20, prize: "৳2,00,000", prizePool: "দুই লাখ টাকা", alt: "৳20 ticket — ৳2,00,000 prize pool" },
  { price: 50, prize: "৳5,00,000", prizePool: "পাঁচ লাখ টাকা", alt: "৳50 ticket — ৳5,00,000 prize pool" },
  { price: 200, prize: "৳20,00,000", prizePool: "বিশ লাখ টাকা", alt: "৳200 ticket — ৳20,00,000 prize pool" },
  { price: 500, prize: "৳50,00,000", prizePool: "পঞ্চাশ লাখ টাকা", alt: "৳500 ticket — ৳50,00,000 prize pool" },
] as const;

const countdownUnits = ["DAYS", "HRS", "MIN", "SEC"] as const;

export default function TicketChartPage() {
  return (
    <SiteShell>
      <main className="ticket-chart-page" aria-label="Ticket chart">
        <div className="ticket-chart-list">
          {ticketBanners.map((ticket, index) => (
            <article className="ticket-chart-card" key={ticket.price}>
              <div
                className="ticket-chart-image"
                role="img"
                aria-label={ticket.alt}
                style={{ backgroundPosition: `center ${index * 25}%` }}
              />
              <section className="ticket-countdown" aria-label={`Countdown for ৳${ticket.price} ticket`}>
                <div className="ticket-countdown-heading">NEXT DRAW IN</div>
                <div className="ticket-countdown-units">
                  {countdownUnits.map((unit) => (
                    <div className="ticket-countdown-unit" key={unit}>
                      <strong>--</strong>
                      <span>{unit}</span>
                    </div>
                  ))}
                </div>
              </section>
            </article>
          ))}
        </div>
        <p className="ticket-chart-note">
          Draw countdowns will appear here after the draw schedule is connected to Supabase.
        </p>
      </main>
    </SiteShell>
  );
}
