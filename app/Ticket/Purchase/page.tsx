"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
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
type PurchaseAuthPhase = "idle" | "checking" | "success";
const TEST_DRAW_AT = new Date("2026-12-05T20:00:00+06:00");
const DEMO_WALLET_BALANCE = 0; // Replace with authenticated Supabase wallet balance.

export default function TicketPurchasePage() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [ticketPrice, setTicketPrice] = useState(10);
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("checking");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<"manual" | "auto">("manual");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">("info");
  const [purchaseAuthPhase, setPurchaseAuthPhase] = useState<PurchaseAuthPhase>("idle");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

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
    if (purchaseAuthPhase !== "idle" || confirmationOpen) return;
    setMessage("");
    setPurchaseAuthPhase("checking");
    window.setTimeout(() => {
      setPurchaseAuthPhase("success");
      window.setTimeout(() => {
        setPurchaseAuthPhase("idle");
        setConfirmationOpen(true);
      }, 520);
    }, 3300);
  }

  function buyWithBalance() {
    if (!isAuthenticated) {
      router.push("/Client/Auth/Login/");
      return;
    }
    if (DEMO_WALLET_BALANCE < ticketPrice) {
      router.push("/Client/Wallets/Deposit/");
      return;
    }
    showMessage(t("balanceCheckoutPending"), "info");
    setConfirmationOpen(false);
  }

  function buyWithBkash() {
    if (!isAuthenticated) {
      router.push("/Client/Auth/Login/");
      return;
    }
    showMessage(t("paymentUnavailable"), "info");
  }

  const drawDateLabel = language === "bn"
    ? t("drawDateValue")
    : new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka", dateStyle: "long", timeStyle: "short"
      }).format(TEST_DRAW_AT);


  if (purchaseAuthPhase !== "idle") {
    return (
      <div className={"ticket-purchase-auth-screen " + (purchaseAuthPhase === "success" ? "is-success" : "")} role="status" aria-live="assertive">
        {purchaseAuthPhase === "checking" ? (
          <>
            <div className="ticket-purchase-auth-spinner" aria-hidden="true"><span /></div>
            <strong>{t("ticketNumberProfileAuth")}<span className="auth-ellipsis">...</span></strong>
          </>
        ) : (
          <>
            <div className="ticket-purchase-auth-check" aria-hidden="true">✓</div>
            <strong>{t("ticketAuthVerified")}</strong>
          </>
        )}
      </div>
    );
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
        </section>
      </main>

      {confirmationOpen && (
        <div className="ticket-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false); }}>
          <section className="ticket-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="ticket-confirm-title">
            <header className="ticket-confirm-header">
              <div><span className="ticket-confirm-eyebrow">LOTTO · CHECKOUT</span><h2 id="ticket-confirm-title">{t("ticketDetails")}</h2></div>
              <button type="button" className="ticket-confirm-close" onClick={() => setConfirmationOpen(false)} aria-label={t("close")}>×</button>
            </header>
            <div className="ticket-confirm-facts">
              <div className="ticket-confirm-fact"><span>{t("ticketNumbers")}</span><div className="ticket-confirm-numbers">{selectedNumbers.map((number) => <b key={number}>{number}</b>)}</div></div>
              <div className="ticket-confirm-fact-row">
                <div className="ticket-confirm-fact"><span>{t("ticketPriceLabel")}</span><strong>৳{ticketPrice.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}</strong></div>
                <div className="ticket-confirm-fact"><span>{t("jackpot")}</span><strong>৳{formattedJackpot}</strong></div>
              </div>
              <div className="ticket-confirm-fact"><span>{t("drawDate")}</span><strong>{drawDateLabel}</strong></div>
            </div>
            <div className="ticket-payment-options">
              <button type="button" className="ticket-payment-card balance" onClick={buyWithBalance}>
                
                <strong>{t("buyWithBalance")}</strong>
                <small>{t("demoBalance")}: ৳{DEMO_WALLET_BALANCE.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}</small>
              </button>
              <button type="button" className="ticket-payment-card bkash" onClick={buyWithBkash}>
                <img className="ticket-payment-logo bkash-payment-logo" src="/platform/images/payments/bkash.webp" alt="bKash" />
                <strong>{t("buyWithBkash")}</strong>
              </button>
              <button type="button" className="ticket-payment-card bank-card" disabled aria-disabled="true">
                <img className="ticket-payment-logo mastercard-payment-logo" src="/platform/images/payments/mastercard.webp" alt="Mastercard" />
                <strong>{t("visaMaster")}</strong>
              </button>
            </div>
            {!isAuthenticated && <p className="ticket-auth-required-note">{t("loginRequired")}</p>}
            {message && <p className={"ticket-payment-notice " + messageType} role="status">{message}</p>}
            <p className="ticket-payment-demo-note">{t("paymentUnavailable")}</p>
          </section>
        </div>
      )}
    </SiteShell>
  );
}
