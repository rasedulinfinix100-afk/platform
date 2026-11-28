"use client";

import Link from "next/link";
import { MenuDrawer } from "./MenuDrawer";
import { PremiumIcon } from "./PremiumIcon";
import { ProfileFooterLink } from "./ProfileFooterLink";
import { useAuth } from "./AuthProvider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand">Lotto</Link>
        <div className="header-actions">
          {isReady && isAuthenticated && (
            <span
              className="header-balance"
              title="Demo balance — live wallet balance is not connected yet"
              aria-label="Demo balance, zero Bangladeshi taka"
            >
              <PremiumIcon name="wallet" size={17} />
              <strong>৳ 0.00 · DEMO</strong>
            </span>
          )}
          <MenuDrawer />
        </div>
      </header>
      <main className="page-wrap">{children}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        <Link href="/"><PremiumIcon name="home" size={25}/><span>Home</span></Link>
        <Link href="/Ticket/Chart/"><PremiumIcon name="lottery" size={25}/><span>Ticket</span></Link>
        <Link href="/Ticket/Chack/"><PremiumIcon name="ticket" size={25}/><span>Chack</span></Link>
        <Link href="/Ticket/WinnerResult/"><PremiumIcon name="results" size={25}/><span>Results</span></Link>
        <ProfileFooterLink />
      </nav>
    </div>
  );
}
