"use client";

import "./chart.css";

type TicketPrice = 10 | 20 | 50 | 100 | 200;

export type TicketChartProps = {
  prizePools?: Partial<Record<TicketPrice, number | string>>;
  drawsRemaining?: number | string;
};

const ticketOptions: Array<{
  price: TicketPrice;
  defaultPrizePool: number;
  spriteIndex: number;
}> = [
  { price: 10, defaultPrizePool: 100000, spriteIndex: 0 },
  { price: 20, defaultPrizePool: 200000, spriteIndex: 1 },
  { price: 50, defaultPrizePool: 500000, spriteIndex: 2 },
  { price: 100, defaultPrizePool: 100000, spriteIndex: 3 },
  { price: 200, defaultPrizePool: 2000000, spriteIndex: 4 },
];

function formatMoney(value: number | string) {
  if (typeof value === "number") return `৳${value.toLocaleString("en-US")}`;
  return value.startsWith("৳") ? value : `৳${value}`;
}

export default function TicketChart({
  prizePools = {},
  drawsRemaining = "—",
}: TicketChartProps) {
  return (
    <section className="ticket-chart-page" aria-label="Ticket prize and prize pool">
      <div className="ticket-chart-grid">
        {ticketOptions.map(({ price, defaultPrizePool, spriteIndex }) => {
          const prizePool = prizePools[price] ?? defaultPrizePool;
          return (
            <article
              className="ticket-chart-card"
              data-sprite-index={spriteIndex}
              key={price}
            >
              <div className="ticket-chart-card-copy">
                <span className="ticket-chart-label">TICKET PRICE</span>
                <strong className="ticket-chart-price">৳{price.toLocaleString("en-US")}</strong>
                <span className="ticket-chart-label ticket-chart-prize-label">PRIZE POOL</span>
                <strong className="ticket-chart-prize-pool">{formatMoney(prizePool)}</strong>
                <span className="ticket-chart-draw-label">DRAWS LEFT</span>
                <strong className="ticket-chart-draw-count">{drawsRemaining}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
