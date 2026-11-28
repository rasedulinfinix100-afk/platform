"use client";
import Link from "next/link";
import {SiteShell} from "@/components/SiteShell";
import {AuthGate} from "@/components/AuthGate";
import {PremiumIcon} from "@/components/PremiumIcon";
import "./pahe.css";
const actions=[{label:"Deposit",href:"/Client/Wallets/Deposit/",icon:"deposit" as const},{label:"Withdrawal",href:"/Client/Wallets/Withdrawal/",icon:"withdrawal" as const},{label:"Ticket Transaction",href:"/Ticket/MyTicket/",icon:"transactions" as const}];
export default function TransactionsContent(){return <AuthGate><SiteShell><nav className="transactions-quick-actions" aria-label="Transaction types">{actions.map(action=><Link href={action.href} key={action.label}><PremiumIcon name={action.icon} size={22}/><span>{action.label}</span></Link>)}</nav></SiteShell></AuthGate>}
