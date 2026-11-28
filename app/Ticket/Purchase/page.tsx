"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import "./page.css";

const REQUIRED_NUMBERS = 16;
const ALL_NUMBERS = Array.from({ length: 72 }, (_, index) => index + 1);

// Frontend demo: this list will be replaced by Supabase availability data later.
const SOLD_NUMBERS: number[] = [];

const TICKET_PRICES = [10, 20, 50, 100, 200, 500, 1000];

export default function TicketPurchasePage() {
  const searchParams = useSearchParams();
  const requestedPrice = Number(searchParams.get("price"));
  const ticketPrice = TICKET_PRICES.includes(requestedPrice) ? requestedPrice : 10;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<"manual" | "auto">("manual");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">("info");

  const soldSet = useMemo(() => new Set(SOLD_NUMBERS), []);
  const selectedSet = useMemo(() => new Set(selectedNumbers), [selectedNumbers]);

  function showMessage(text: string, type: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function toggleNumber(number: number) {
    if (soldSet.has(number)) {
      showMessage("This Ticket Number Sold", "error");
      return;
    }

    setSelectionMode("manual");
    setMessage("");

    setSelectedNumbers((current) => {
      if (current.includes(number)) {
        return current.filter((item) => item !== number);
      }
      if (current.length >= REQUIRED_NUMBERS) {
        showMessage("আপনি সর্বোচ্চ ১৬টি নম্বর নির্বাচন করতে পারবেন।", "error");
        return current;
      }
      return [...current, number].sort((a, b) => a - b);
    });
  }

  function selectAutoNumbers() {
    const available = ALL_NUMBERS.filter((number) => !soldSet.has(number));
    if (available.length < REQUIRED_NUMBERS) {
      showMessage("এই মুহূর্তে ১৬টি নম্বর পাওয়া যাচ্ছে না।", "error");
      return;
    }

    const shuffled = [...available];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    setSelectedNumbers(shuffled.slice(0, REQUIRED_NUMBERS).sort((a, b) => a - b));
    setSelectionMode("auto");
    showMessage("অটো পদ্ধতিতে ১৬টি নম্বর নির্বাচন করা হয়েছে।", "success");
  }

  function clearSelection() {
    setSelectedNumbers([]);
    setSelectionMode("manual");
    showMessage("নির্বাচিত নম্বর মুছে ফেলা হয়েছে।", "info");
  }

  function continuePurchase() {
    if (selectedNumbers.length !== REQUIRED_NUMBERS) {
      showMessage("চালিয়ে যেতে ঠিক ১৬টি নম্বর নির্বাচন করুন।", "error");
      return;
    }
    showMessage("নম্বর নির্বাচন সম্পন্ন। পেমেন্ট ব্যবস্থা Supabase যুক্ত হলে চালু হবে।", "success");
  }

  return (
    <SiteShell>
      <main className="purchase-page">
        <header className="purchase-heading">
          <span className="purchase-eyebrow">LOTTO • TICKET PURCHASE</span>
          <h1>আপনার টিকিট নম্বর বেছে নিন</h1>
          <p>১ থেকে ৭২-এর মধ্যে ঠিক ১৬টি নম্বর নির্বাচন করুন।</p>
        </header>

        <section className="purchase-ticket-info" aria-label="টিকিটের তথ্য">
          <div>
            <span>টিকিটের মূল্য</span>
            <strong>৳{ticketPrice.toLocaleString("en-BD")}</strong>
          </div>
          <div className="purchase-count">
            <span>নির্বাচিত নম্বর</span>
            <strong>{selectedNumbers.length}<small> / ১৬</small></strong>
          </div>
        </section>

        <section className="number-selection-panel">
          <div className="number-panel-top">
            <div>
              <h2>নম্বর নির্বাচন</h2>
              <p>হলুদ রঙে নির্বাচিত নম্বর দেখানো হবে</p>
            </div>
            <span className="number-range">০১ — ৭২</span>
          </div>

          <div className="selection-tools">
            <button
              type="button"
              className={`selection-mode-button ${selectionMode === "manual" ? "active" : ""}`}
              aria-pressed={selectionMode === "manual"}
              onClick={() => { setSelectionMode("manual"); setMessage(""); }}
            >
              ম্যানুয়াল
            </button>
            <button type="button" className="selection-mode-button auto-button" onClick={selectAutoNumbers}>
              <span aria-hidden="true">✦</span> অটো সিলেক্ট
            </button>
            <button type="button" className="clear-selection-button" onClick={clearSelection}>
              মুছুন
            </button>
          </div>

          <div className="number-grid" role="group" aria-label="১ থেকে ৭২ পর্যন্ত টিকিট নম্বর">
            {ALL_NUMBERS.map((number) => {
              const isSold = soldSet.has(number);
              const isSelected = selectedSet.has(number);
              return (
                <button
                  key={number}
                  type="button"
                  className={`number-cell${isSelected ? " selected" : ""}${isSold ? " sold" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={`নম্বর ${number}${isSold ? ", বিক্রি হয়েছে" : isSelected ? ", নির্বাচিত" : ""}`}
                  disabled={isSold}
                  onClick={() => toggleNumber(number)}
                >
                  {number}
                </button>
              );
            })}
          </div>

          <div className="number-legend">
            <span><i className="legend-dot available-dot" /> পাওয়া যাচ্ছে</span>
            <span><i className="legend-dot selected-dot" /> নির্বাচিত</span>
            <span><i className="legend-dot sold-dot" /> বিক্রি হয়েছে</span>
          </div>
        </section>

        {message && (
          <div className={`purchase-message ${messageType}`} role="status" aria-live="polite">
            {message}
          </div>
        )}

        <section className="selected-summary">
          <div className="selected-summary-heading">
            <div>
              <h2>আপনার নির্বাচিত নম্বর</h2>
              <p>{selectedNumbers.length === REQUIRED_NUMBERS ? "১৬টি নম্বর নির্বাচন সম্পন্ন" : `আরও ${REQUIRED_NUMBERS - selectedNumbers.length}টি নম্বর নির্বাচন করুন`}</p>
            </div>
            <strong>{selectedNumbers.length}/১৬</strong>
          </div>
          <div className="selected-number-list" aria-live="polite">
            {selectedNumbers.length ? selectedNumbers.map((number) => (
              <span className="selected-number-chip" key={number}>{number}</span>
            )) : <span className="empty-selection">এখনো কোনো নম্বর নির্বাচন করা হয়নি</span>}
          </div>
          <div className="purchase-total">
            <span>টিকিটের দাম</span>
            <strong>৳{ticketPrice.toLocaleString("en-BD")}</strong>
          </div>
          <button
            type="button"
            className="purchase-continue-button"
            disabled={selectedNumbers.length !== REQUIRED_NUMBERS}
            onClick={continuePurchase}
          >
            ১৬টি নম্বর নিশ্চিত করুন
          </button>
          <p className="purchase-demo-note">এটি বর্তমানে ডেমো নির্বাচন ব্যবস্থা। প্রকৃত বিক্রি ও পেমেন্ট Supabase সংযুক্ত হওয়ার পর চালু হবে।</p>
        </section>
      </main>
    </SiteShell>
  );
}
