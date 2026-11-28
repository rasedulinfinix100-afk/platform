import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import "./page.css";

const ticketOptions = [
  { price: "৳10", prizePool: "৳1,00,000" },
  { price: "৳20", prizePool: "৳2,00,000" },
  { price: "৳50", prizePool: "৳5,00,000" },
  { price: "৳200", prizePool: "৳20,00,000" },
  { price: "৳500", prizePool: "৳50,00,000" },
];

export default function TicketPurchasePage() {
  return (
    <SiteShell>
      <main className="route-surface">
        <section className="panel">
          <span className="eyebrow">LOTTO</span>
          <h1>Purchase Tickets</h1>
          <p className="muted">Choose a ticket category to view its prize pool and draw information.</p>
          <div className="route-actions">
            {ticketOptions.map((ticket) => (
              <article className="method-card" key={ticket.price}>
                <strong>{ticket.price} Ticket</strong>
                <span className="muted">Prize Pool {ticket.prizePool}</span>
              </article>
            ))}
          </div>
          <Link className="primary-button" href="/Ticket/Chart/">
            View Ticket Chart
          </Link>
        </section>
        <p className="notice">
          Demonstration interface only. Ticket purchases are not processed until the purchase workflow is connected.
        </p>
      </main>
    </SiteShell>
  );
}
