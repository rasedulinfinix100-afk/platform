"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useLanguage } from "@/components/LanguageProvider";
import "./page.css";

const REQUIRED_NUMBERS = 11;
const ALL_NUMBERS = Array.from({ length: 72 }, (_, index) => index + 1);

// Demo only. Supabase will provide the live sold-number list.
const SOLD_NUMBERS: number[] = [];

const TICKET_PRIZES: Record<number, number> = {
  10: 100000,
  20: 200000,
  50: 500000,
  100: 1000000,
  200: 2000000,
  500: 5000000,
  1000: 10000000,
};

type LoaderPhase = "checking" | "success" | "ready";

export default function TicketPurchasePage() {
  const { language, t } = useLanguage();
  const [ticketPrice, setTicketPrice] = useState(10);
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("checking");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<"manual" | "auto">("manual");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">("info");

  useEffect(() => {
    const requestedPrice = Number(new URLSearchParams(window.location.search).get("price"));
    if (TICKET_PRIZES[requestedPrice]) setTicketPrice(requestedPrice);
  }, []);

  useEffect(() => {
    const successTimer = window.setTimeout(() => setLoaderPhase("success"), 2100);
    const readyTimer = window.setTimeout(() => setLoaderPhase("ready"), 4000);
    return () => {
      window.clearTimeout(successTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  const soldSet = useMemo(() => new Set(SOLD_NUMBERS), []);
  const selectedSet = useMemo(() => new Set(selectedNumbers), [selectedNumbers]);
  const jackpot = TICKET_PRIZES[ticketPrice] ?? TICKET_PRIZES[10];
  const formattedJackpot = new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-BD").format(jackpot);

  function showMessage(text: string, type: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function toggleNumber(number: number) {
    if (soldSet.has(number)) {
      showMessage(t("soldTicket"), "error");
      return;
    }

    setSelectionMode("manual");
    setMessage("");

    if (selectedSet.has(number)) {
      setSelectedNumbers((current) => current.filter((item) => item !== number));
      return;
    }
    if (selectedNumbers.length >= REQUIRED_NUMBERS) {
      showMessage(t("maxEleven"), "error");
      return;
    }
    setSelectedNumbers((current) => [...current, number].sort((a, b) => a - b));
  }

  function selectAutoNumbers() {
    const available = ALL_NUMBERS.filter((number) => !soldSet.has(number));
    if (available.length < REQUIRED_NUMBERS) {
      showMessage(t("notEnoughNumbers"), "error");
      return;
    }

    const shuffled = [...available];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    setSelectedNumbers(shuffled.slice(0, REQUIRED_NUMBERS).sort((a, b) => a - b));
    setSelectionMode("auto");
    showMessage(t("autoEleven"), "success");
  }

  function clearSelection() {
    setSelectedNumbers([]);
    setSelectionMode("manual");
    showMessage(t("clearDone"), "info");
  }

  function continuePurchase() {
    if (selectedNumbers.length !== REQUIRED_NUMBERS) {
      showMessage(t("selectExactlyEleven"), "error");
      return;
    }
    showMessage(t("purchaseDemo"), "success");
  }

  if (loaderPhase !== "ready") {
    return (
      <div className={`ticket-auth-loader ${loaderPhase === "success" ? "is-success" : ""}`} role="status" aria-live="polite">
        {loaderPhase === "checking" ? (
          <>
            <div className="ticket-auth-mark" aria-hidden="true"><span /></div>
            <div className="ticket-auth-copy">
              <strong>{t("checkingTicketAuth")}</strong>
              <span className="ticket-auth-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
            </div>
          </>
        ) : (
          <>
            <div className="ticket-auth-success-icon" aria-hidden="true">✓</div>
            <strong>{t("ticketAuthSuccess")} <span>✓</span></strong>
          </>
        )}
      </div>
    );
  }

  return (
    <SiteShell>
      <main className="purchase-page">
        <section className="purchase-jackpot" aria-label={t("jackpot")}>
          <span>{t("jackpot")}</span>
          <strong>৳{formattedJackpot}</strong>
        </section>

        <section className="number-selection-panel">
          <div className="number-panel-top">
            <h2>{t("numberSelection")}</h2>
            <span className="number-range">01 — 72</span>
          </div>

          <div className="selection-tools">
            <button
              type="button"
              className={`selection-mode-button ${selectionMode === "manual" ? "active" : ""}`}
              aria-pressed={selectionMode === "manual"}
              onClick={() => { setSelectionMode("manual"); setMessage(""); }}
            >
              {t("manual")}
            </button>
            <button type="button" className="selection-mode-button auto-button" onClick={selectAutoNumbers}>
              <span aria-hidden="true">✦</span> {t("autoSelect")}
            </button>
            <button type="button" className="clear-selection-button" onClick={clearSelection}>
              {t("clear")}
            </button>
          </div>

          <div className="number-grid" role="group" aria-label={t("numberSelection")}>
            {ALL_NUMBERS.map((number) => {
              const isSold = soldSet.has(number);
              const isSelected = selectedSet.has(number);
              return (
                <button
                  key={number}
                  type="button"
                  className={`number-cell${isSelected ? " selected" : ""}${isSold ? " sold" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={` ${number}${isSold ? ` - ${t("sold")}` : isSelected ? ` - ${t("selected")}` : ""}`}
                  aria-disabled={isSold}
                  onClick={() => toggleNumber(number)}
                >
                  {number}
                </button>
              );
            })}
          </div>

          <div className="number-legend">
            <span><i className="legend-dot available-dot" /> {t("available")}</span>
            <span><i className="legend-dot selected-dot" /> {t("selected")}</span>
            <span><i className="legend-dot sold-dot" /> {t("sold")}</span>
          </div>
        </section>

        {message && (
          <div className={`purchase-message ${messageType}`} role="status" aria-live="polite">
            {message}
          </div>
        )}

        <section className="selected-summary">
          <div className="selected-summary-heading">
            <h2>{t("yourSelectedNumbers")}</h2>
            <strong>{selectedNumbers.length}/11</strong>
          </div>
          <div className="selected-number-list" aria-live="polite">
            {selectedNumbers.length ? selectedNumbers.map((number) => (
              <span className="selected-number-chip" key={number}>{number}</span>
            )) : <span className="empty-selection">{t("noSelection")}</span>}
          </div>
          <button
            type="button"
            className="purchase-continue-button"
            disabled={selectedNumbers.length !== REQUIRED_NUMBERS}
            onClick={continuePurchase}
          >
            {t("confirmEleven")}
          </button>
          <p className="purchase-demo-note">{t("purchaseDemo")}</p>
        </section>
      </main>
    </SiteShell>
  );
}
