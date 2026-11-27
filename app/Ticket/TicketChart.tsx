import "./chart.css";

export type TicketChartProps = {
  jackpotAmounts?: Partial<Record<10 | 20 | 50 | 80 | 100, number | string>>;
};

const ticketOptions = [
  { price: 10, label: "৳10" },
  { price: 20, label: "৳20" },
  { price: 50, label: "৳50" },
  { price: 80, label: "৳80" },
  { price: 100, label: "৳100" },
] as const;

export default function TicketChart({ jackpotAmounts = {} }: TicketChartProps) {
  return (
    <section className="ticket-chart-grid" aria-label="Ticket prices and jackpots">
      {ticketOptions.map(({ price, label }) => {
        const jackpot = jackpotAmounts[price];
        return (
          <article className="ticket-chart-card" key={price}>
            <span className="ticket-chart-price">{label}</span>
            <strong className="ticket-chart-jackpot">
              {jackpot === undefined || jackpot === null || jackpot === ""
                ? "—"
                : typeof jackpot === "number"
                  ? `৳${jackpot.toLocaleString("en-US")}`
                  : jackpot}
            </strong>
            <span className="ticket-chart-caption">JACKPOT</span>
          </article>
        );
      })}
    </section>
  );
}
