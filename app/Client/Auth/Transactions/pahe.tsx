"use client";
import Link from "next/link";import {SiteShell} from "@/components/SiteShell";
export default function TransactionsContent(){return <SiteShell><section className="panel"><span className="eyebrow">ACCOUNT</span><h1>Transactions</h1><p className="muted">Choose which transaction history you want to view.</p></section><div className="transaction-actions"><Link href="/Client/Wallets/Deposit/">Deposit</Link><Link href="/Client/Wallets/Withdrawal/">Withdrawal</Link><Link href="/Ticket/MyTicket/">Ticket Transaction</Link></div></SiteShell>}
