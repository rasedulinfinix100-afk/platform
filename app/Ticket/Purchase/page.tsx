"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import "./page.css";

const ticketOptions = [
  { amount: 10, price: "৳10", prizePool: "৳1,00,000", prizeText: "এক লাখ টাকা" },
  { amount: 20, price: "৳20", prizePool: "৳2,00,000", prizeText: "দুই লাখ টাকা" },
  { amount: 50, price: "৳50", prizePool: "৳5,00,000", prizeText: "পাঁচ লাখ টাকা" },
  { amount: 100, price: "৳100", prizePool: "৳10,00,000", prizeText: "দশ লাখ টাকা" },
  { amount: 200, price: "৳200", prizePool: "৳20,00,000", prizeText: "বিশ লাখ টাকা" },
  { amount: 500, price: "৳500", prizePool: "৳50,00,000", prizeText: "পঞ্চাশ লাখ টাকা" },
  { amount: 1000, price: "৳1,000", prizePool: "৳1,00,00,000", prizeText: "এক কোটি টাকা" },
];

export default function TicketPurchasePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  useEffect(() => {
    const amount = Number(new URLSearchParams(window.location.search).get("price"));
    if (ticketOptions.some((ticket) => ticket.amount === amount)) {
      setSelectedAmount(amount);
    }
  }, []);

  const selectedTicket = ticketOptions.find((ticket) => ticket.amount === selectedAmount);

  return (
    <SiteShell>
      <main className="route-surface">
        <section className="panel">
          <span className="eyebrow">LOTTO</span>
          <h1>Purchase Tickets</h1>
          {selectedTicket ? (
            <div className="selected-ticket-summary" aria-live="polite">
              <strong>{selectedTicket.price} Ticket Selected</strong>
              <span className="muted">Prize Pool: {selectedTicket.prizePool} ({selectedTicket.prizeText})</span>
            </div>
          ) : (
            <p className="muted">Choose a ticket category to view its prize pool and draw information.</p>
          )}
          <div className="route-actions">
            {ticketOptions.map((ticket) => (
              <button
                className={`method-card ticket-option${selectedAmount === ticket.amount ? " is-selected" : ""}`}
                key={ticket.amount}
                type="button"
                aria-pressed={selectedAmount === ticket.amount}
                onClick={() => setSelectedAmount(ticket.amount)}
              >
                <strong>{ticket.price} Ticket</strong>
                <span className="muted">Prize Pool {ticket.prizePool}</span>
              </button>
            ))}
          </div>
          <Link className="primary-button" href="/Ticket/Chart/">
            Back to Ticket Chart
          </Link>
        </section>
        <p className="notice">
          Demonstration interface only. Ticket purchases are not processed until the purchase workflow is connected.
        </p>
      </main>
    </SiteShell>
  );
}
