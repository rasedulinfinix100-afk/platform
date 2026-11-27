"use client";
import {useEffect,useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {PremiumIcon} from "@/components/PremiumIcon";
import {depositChannels,depositMethods} from "@/lib/demo-config";
import "./deposit.css";

const amounts=[100,500,5000,50000];
type DepositDraft={amount:string;sender:string;transactionId:string;proof:File|null};
export default function DepositPage(){
 const [channel,setChannel]=useState<string>("channel-one");
 const [method,setMethod]=useState<string>("Nagad");
 const [amount,setAmount]=useState("100");
 const [sender,setSender]=useState("");
 const [transactionId,setTransactionId]=useState("");
 const [proof,setProof]=useState<File|null>(null);
 const [modal,setModal]=useState(false);
 const [verification,setVerification]=useState<"idle"|"checking"|"success">("idle");
 const [notice,setNotice]=useState("");
 const selectedChannel=depositChannels.find(c=>c.id===channel)?.name??"Channel One";
 useEffect(()=>{if(!modal)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setModal(false)};window.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)}},[modal]);
 function openReview(event:FormEvent<HTMLFormElement>){event.preventDefault();setNotice("");setVerification("checking")}
 useEffect(()=>{if(verification==="idle")return;const timer=window.setTimeout(()=>{if(verification==="checking")setVerification("success");else{setVerification("idle");setModal(true)}},1700);return()=>window.clearTimeout(timer)},[verification]);
 function confirmDeposit(){setModal(false);setNotice("Demo preview only. Your deposit has not been sent or recorded because the payment backend is not connected yet.")}
 return <SiteShell>
  <section className="deposit-heading"><span className="eyebrow">WALLET</span><h1>Deposit</h1><p>Choose a payment method and enter your deposit details.</p></section>
  <h2 className="section-title">Deposit Channel</h2>
  <div className="channel-list" role="group" aria-label="Deposit channel">{depositChannels.map(c=><button type="button" className={channel===c.id?"channel active":"channel"} key={c.id} onClick={()=>setChannel(c.id)}>{c.name}</button>)}</div>
  <h2 className="section-title">Deposit Method</h2>
  <div className="deposit-method-grid" role="group" aria-label="Select deposit method">{depositMethods.map(m=><button type="button" className={method===m?"deposit-method selected":"deposit-method"} key={m} onClick={()=>{setMethod(m);setNotice("")}} aria-pressed={method===m}><span className={`payment-logo logo-${m.toLowerCase()}`}>{m==="USDT"?"₮":m==="bKash"?"bKash":m==="Nagad"?"N":m==="Rocket"?"R":m==="Upay"?"U":"C"}</span><strong>{m}</strong><span className="method-select-mark">{method===m?"✓":"↗"}</span></button>)}</div>
  <form className="deposit-form" onSubmit={openReview}>
   <div className="wallet-section-title"><h2>Deposit Amount</h2><span>BDT 100 – 50,000</span></div>
   <label className="amount-input-wrap"><span>৳</span><input aria-label="Deposit amount in BDT" type="number" min="100" max="50000" step="1" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label>
   <div className="quick-amount-grid">{amounts.map(value=><button type="button" key={value} className={Number(amount)===value?"quick-amount active":"quick-amount"} onClick={()=>setAmount(String(value))}>BDT {value.toLocaleString("en-US")}</button>)}</div>
   <div className="payment-instructions">
    <div className="wallet-section-title"><h2>{method} Payment Details</h2><span>{selectedChannel}</span></div>
    <div className="payment-account-card"><div><small>PAYMENT ACCOUNT / NUMBER</small><strong>Will be configured by Admin</strong></div><span className="account-status">Pending setup</span></div>
    <div className="payment-qr-placeholder"><PremiumIcon name="wallet" size={27}/><strong>Payment QR / Instruction Image</strong><span>Admin can add the official {method} QR image in payment settings.</span></div>
    <p className="payment-help">Complete the payment using the official account details shown here. Do not send money to an unverified number.</p>
   </div>
   <div className="manual-payment-fields">
    <h2>Payment Confirmation Details</h2>
    <label className="payment-field"><span>Your {method} Sender Number</span><input type="tel" inputMode="tel" autoComplete="tel" value={sender} onChange={e=>setSender(e.target.value)} placeholder="Enter the number you paid from" required/></label>
    <label className="payment-field"><span>Transaction ID</span><input type="text" value={transactionId} onChange={e=>setTransactionId(e.target.value)} placeholder="Enter transaction ID" required/></label>
    <label className="payment-field"><span>Payment Screenshot / Photo</span><input className="proof-file-input" type="file" accept="image/*" onChange={e=>setProof(e.target.files?.[0]??null)} required/><span className="proof-file-name">{proof?proof.name:"Upload payment screenshot (JPG, PNG)"}</span></label>
   </div>
   <button className="deposit-review-button" type="submit" disabled={verification!=="idle"}>Deposit Via {method}<PremiumIcon name="chevron" size={19}/></button>
  </form>
  {verification!=="idle"&&<div className="transaction-verify-screen" role="status" aria-live="assertive"><div className={verification==="checking"?"verify-emblem is-spinning":"verify-emblem is-success"}>{verification==="checking"?<PremiumIcon name="transactions" size={31}/>:<svg viewBox="0 0 24 24" width="31" height="31" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6"/></svg>}</div><strong>{verification==="checking"?"Verify Transaction":"Successfully Verify Transaction"}</strong><span>{verification==="checking"?"Checking your entered payment details...":"Your details are ready for final review."}</span><div className="verify-progress"><i/></div></div>}
  {notice&&<p className="deposit-demo-notice" role="status">{notice}</p>}
  {modal&&<div className="deposit-confirm-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="deposit-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="deposit-confirm-title"><div className="confirm-modal-header"><span>DEPOSIT REVIEW</span><button type="button" onClick={()=>setModal(false)} aria-label="Close confirmation"><PremiumIcon name="close" size={23}/></button></div><h2 id="deposit-confirm-title">Confirm your deposit details</h2><p className="confirm-modal-subtitle">Review the information before the final confirmation.</p><div className="confirm-summary"><div><span>Payment Method</span><strong>{method}</strong></div><div><span>Deposit Channel</span><strong>{selectedChannel}</strong></div><div><span>Amount</span><strong>৳ {Number(amount||0).toLocaleString("en-US")}</strong></div><div><span>Sender Number</span><strong>{sender}</strong></div><div><span>Transaction ID</span><strong>{transactionId}</strong></div><div><span>Payment Photo</span><strong className="confirm-proof">{proof?.name??"Not attached"}</strong></div></div><div className="confirm-modal-actions"><button type="button" className="confirm-back-button" onClick={()=>setModal(false)}>Edit Details</button><button type="button" className="confirm-deposit-button" onClick={confirmDeposit}>Confirm Deposit</button></div><small className="confirm-demo-note">Demo interface: confirmation will not submit a real payment until backend integration is completed.</small></section></div>}
 </SiteShell>
}
