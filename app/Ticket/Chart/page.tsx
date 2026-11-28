import "../chart.css";
import { SiteShell } from "@/components/SiteShell";

const ticketBanners = [
  { price: 10, prize: "৳1,00,000", prizePool: "এক লাখ টাকা", alt: "৳10 ticket — ৳1,00,000 prize pool", image: "/platform/images/tickets/ticket-10.webp" },
  { price: 20, prize: "৳2,00,000", prizePool: "দুই লাখ টাকা", alt: "৳20 ticket — ৳2,00,000 prize pool", image: "/platform/images/tickets/ticket-20.webp" },
  { price: 50, prize: "৳5,00,000", prizePool: "পাঁচ লাখ টাকা", alt: "৳50 ticket — ৳5,00,000 prize pool", image: "/platform/images/tickets/ticket-50.webp" },
  { price: 100, prize: "৳10,00,000", prizePool: "দশ লাখ টাকা", alt: "৳100 ticket — ৳10,00,000 prize pool", image: "/platform/images/tickets/ticket-100.webp" },
  { price: 200, prize: "৳20,00,000", prizePool: "বিশ লাখ টাকা", alt: "৳200 ticket — ৳20,00,000 prize pool", image: "/platform/images/tickets/ticket-200.webp" },
  { price: 500, prize: "৳50,00,000", prizePool: "পঞ্চাশ লাখ টাকা", alt: "৳500 ticket — ৳50,00,000 prize pool", image: "/platform/images/tickets/ticket-500.webp" },
  { price: 1000, prize: "৳1,00,00,000", prizePool: "এক কোটি টাকা", alt: "৳1,000 ticket — ৳1,00,00,000 prize pool", image: "/platform/images/tickets/ticket-1000.webp" },
] as const;


export default function TicketChartPage() {
  return (
    <SiteShell>
      <main className="ticket-chart-page" aria-label="Ticket chart">
        <div className="ticket-chart-list">
          {ticketBanners.map((ticket) => (
            <article className="ticket-chart-card" key={ticket.price}>
              <img
                className="ticket-chart-image"
                src={ticket.image}
                alt={ticket.alt}
                loading={ticket.price === 10 ? "eager" : "lazy"}
                decoding="async"
              />
            </article>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
