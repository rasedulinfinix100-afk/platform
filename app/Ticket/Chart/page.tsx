import "../chart.css";
import { SiteShell } from "@/components/SiteShell";

const ticketBanners = [
  {
    price: 10,
    src: "/platform/images/tickets/01-ticket-10-prize-100000.png",
    alt: "৳10 ticket — ৳100,000 prize pool",
  },
  {
    price: 20,
    src: "/platform/images/tickets/02-ticket-20-prize-200000.png",
    alt: "৳20 ticket — ৳200,000 prize pool",
  },
  {
    price: 50,
    src: "/platform/images/tickets/03-ticket-50-prize-500000.png",
    alt: "৳50 ticket — ৳500,000 prize pool",
  },
  {
    price: 200,
    src: "/platform/images/tickets/05-ticket-200-prize-2000000.png",
    alt: "৳200 ticket — ৳2,000,000 prize pool",
  },
  {
    price: 500,
    src: "/platform/images/tickets/06-ticket-500-prize-5000000.png",
    alt: "৳500 ticket — ৳5,000,000 prize pool",
  },
] as const;

export default function TicketChartPage() {
  return (
    <SiteShell>
      <main className="ticket-chart-page" aria-label="Ticket chart">
        <div className="ticket-chart-list">
          {ticketBanners.map((ticket, index) => (
            <img
              className="ticket-chart-image"
              key={ticket.price}
              src={ticket.src}
              alt={ticket.alt}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
