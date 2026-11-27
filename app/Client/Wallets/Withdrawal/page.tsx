"use client";
import {useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {withdrawalMethods} from "@/lib/demo-config";
import {PremiumIcon} from "@/components/PremiumIcon";
import "./withdrawal.css";
export default function WithdrawalPage(){
 const [method,setMethod]=useState<string>("bKash");
 const [amount,setAmount]=useState("");
 const [account,setAccount]=useState("");
 const [message,setMessage]=useState("");
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage("Demo interface only. Your withdrawal request has not been submitted because backend integration is not connected yet.");}
 return <SiteShell>
  <section className="withdrawal-heading"><span className="eyebrow">WALLET</span><h1>Withdrawal</h1><p>Select your withdrawal method and enter the amount and receiving number.</p></section>
  <h2 className="section-title">Withdrawal Method</h2>
  <div className="withdrawal-method-grid" role="group" aria-label="Select withdrawal method">{withdrawalMethods.map(m=><button type="button" className={method===m?"withdrawal-method selected":"withdrawal-method"} key={m} onClick={()=>{setMethod(m);setMessage("")}} aria-pressed={method===m}><span className={`payment-logo logo-${m.toLowerCase()}`}>{m==="Bank"?"B":m==="bKash"?"bKash":m==="Nagad"?"N":m==="Rocket"?"R":m==="Upay"?"U":"C"}</span><strong>{m}</strong><span className="withdrawal-select-mark">{method===m?"✓":"↗"}</span></button>)}</div>
  <form className="withdrawal-form" onSubmit={submit}>
   <h2>Withdrawal Details</h2>
   <label className="withdrawal-field"><span>Withdrawal Amount (BDT)</span><div className="withdrawal-amount-input"><span>৳</span><input type="number" min="1" step="1" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></div></label>
   <label className="withdrawal-field"><span>{method==="Bank"?"Bank Account Number":"Your "+method+" Number"}</span><input type="text" inputMode={method==="Bank"?"numeric":"tel"} required value={account} onChange={e=>setAccount(e.target.value)} placeholder={method==="Bank"?"Enter bank account number":"Enter your receiving number"}/></label>
   <button className="withdrawal-submit" type="submit">Request Withdrawal via {method}<PremiumIcon name="chevron" size={18}/></button>
   {message&&<p className="withdrawal-demo-notice" role="status">{message}</p>}
  </form>
 </SiteShell>
}
