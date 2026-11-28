"use client";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {SiteShell} from "@/components/SiteShell";
import {AuthGate} from "@/components/AuthGate";
import {PremiumIcon} from "@/components/PremiumIcon";
import {cryptoDepositConfig,depositChannels,depositMethods,fiatPaymentAccounts} from "@/lib/demo-config";
import "./deposit.css";
const amounts=[100,500,5000,50000];
const cryptoMethods=["USDT (BEP20)","USDT (TRC20)","USDT (ERC20)"] as const;
type PaymentMode="fiat"|"crypto";
export default function DepositPage(){
 const router=useRouter();
 const [mode,setMode]=useState<PaymentMode>("fiat");
 const [channel,setChannel]=useState<string>("channel-one");
 const [method,setMethod]=useState<string>("Nagad");
 const [amount,setAmount]=useState("100");
 const [sender,setSender]=useState("");
 const [transactionId,setTransactionId]=useState("");
 const [proof,setProof]=useState<File|null>(null);
 const [modal,setModal]=useState(false);
 const [verification,setVerification]=useState<"idle"|"checking"|"success">("idle");
 const [processing,setProcessing]=useState(false);
 const [notice,setNotice]=useState("");
 const selectedChannel=depositChannels.find(c=>c.id===channel)?.name??"Channel One";
 const isCrypto=mode==="crypto";
 const cryptoConfig=isCrypto?cryptoDepositConfig[method as keyof typeof cryptoDepositConfig]:null;
 const paymentNumber=fiatPaymentAccounts[channel]?.[method]??"";
 const currency=isCrypto?"USDT":"BDT";
 const methods:readonly string[]=isCrypto?cryptoMethods:depositMethods.filter(m=>m!=="USDT");
 useEffect(()=>{if(!modal)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setModal(false)};window.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)}},[modal]);
 useEffect(()=>{if(!processing)return;const timer=window.setTimeout(()=>router.push("/"),2100);return()=>window.clearTimeout(timer)},[processing,router]);
 function resetForm(){setSender("");setTransactionId("");setProof(null);setNotice("");}
 function changeMode(next:PaymentMode){setMode(next);setMethod(next==="crypto"?cryptoMethods[0]:"Nagad");setAmount(next==="crypto"?"":"100");resetForm();}
 function openReview(event:FormEvent<HTMLFormElement>){event.preventDefault();setNotice("");setVerification("checking")}
 useEffect(()=>{if(verification==="idle")return;const duration=verification==="checking"?2100:1900;const timer=window.setTimeout(()=>{if(verification==="checking")setVerification("success");else{setVerification("idle");setModal(true)}},duration);return()=>window.clearTimeout(timer)},[verification]);
 function confirmDeposit(){setProcessing(true)}
 function updateTransactionId(value:string){setTransactionId(value.toUpperCase().replace(/[^A-Z0-9]/g,""))}
 return <AuthGate><SiteShell>
  <section className="deposit-mode-switch" role="group" aria-label="Deposit type">
   <button type="button" className={mode==="fiat"?"deposit-mode-tab active":"deposit-mode-tab"} onClick={()=>changeMode("fiat")} aria-pressed={mode==="fiat"}>Fiat</button>
   <button type="button" className={mode==="crypto"?"deposit-mode-tab active":"deposit-mode-tab"} onClick={()=>changeMode("crypto")} aria-pressed={mode==="crypto"}>Crypto</button>
  </section>
  {!isCrypto&&<>
   <h2 className="section-title">Deposit Channel</h2>
   <div className="channel-list" role="group" aria-label="Deposit channel">{depositChannels.map(c=><button type="button" className={channel===c.id?"channel active":"channel"} key={c.id} onClick={()=>setChannel(c.id)}>{c.name}</button>)}</div>
  </>}
  <h2 className="section-title">{isCrypto?"Crypto Network":"Deposit Method"}</h2>
  <div className="deposit-method-grid" role="group" aria-label={isCrypto?"Select crypto network":"Select deposit method"}>{methods.map(m=><button type="button" className={method===m?"deposit-method selected":"deposit-method"} key={m} onClick={()=>{setMethod(m);setNotice("")}} aria-pressed={method===m}><span className={`payment-logo logo-${m.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}>{m.includes("USDT")?"₮":m==="bKash"?"bKash":m==="Nagad"?"N":m==="Rocket"?"R":m==="Upay"?"U":"C"}</span><strong>{m}</strong><span className="method-select-mark">{method===m?"✓":""}</span></button>)}</div>
  <form className="deposit-form" onSubmit={openReview}>
   <div className="wallet-section-title"><h2>Deposit Amount</h2><span>{isCrypto?"Enter amount in USDT":"BDT 100 – 50,000"}</span></div>
   <label className="amount-input-wrap"><span>{isCrypto?"₮":"৳"}</span><input aria-label={`Deposit amount in ${currency}`} type="number" min={isCrypto?"0.000001":"100"} max={isCrypto?undefined:"50000"} step={isCrypto?"0.000001":"1"} required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label>
   {!isCrypto&&<div className="quick-amount-grid">{amounts.map(value=><button type="button" key={value} className={Number(amount)===value?"quick-amount active":"quick-amount"} onClick={()=>setAmount(String(value))}>BDT {value.toLocaleString("en-US")}</button>)}</div>}
   <div className="payment-instructions">
    <div className="wallet-section-title"><h2>{method} Payment Details</h2><span>{isCrypto?"Network transfer":selectedChannel}</span></div>
    {isCrypto?<><div className="payment-account-card"><strong>{cryptoConfig?.walletAddress||"Wallet address not configured"}</strong></div><div className="payment-qr-placeholder">{cryptoConfig?.qrImageUrl?<img className="payment-qr-image" src={cryptoConfig.qrImageUrl} alt={`${method} deposit QR code`}/>:<><PremiumIcon name="wallet" size={27}/><strong>{method} QR Code</strong></>}</div></>:<div className="payment-account-card fiat-payment-number"><strong>{paymentNumber}</strong></div>}
   </div>
   <div className="manual-payment-fields">
    <h2>Payment Confirmation Details</h2>
    <label className="payment-field"><span>{isCrypto?"Your Sending Wallet Address":`Your ${method} Sender Number`}</span><input type="text" autoComplete="off" value={sender} onChange={e=>setSender(e.target.value.replace(/[^A-Za-z0-9+@._-]/g,""))} placeholder={isCrypto?"Enter your sending wallet address":"Enter the number you paid from"} required/></label>
    <label className="payment-field"><span>{isCrypto?"Transaction Hash":"Transaction ID"}</span><input type="text" inputMode="text" autoComplete="off" minLength={8} pattern="[A-Z0-9]{8,}" title="Use at least 8 English uppercase letters or numbers. Lowercase and Bangla characters are not allowed." value={transactionId} onChange={e=>updateTransactionId(e.target.value)} placeholder="Minimum 8 characters (A–Z, 0–9)" required/><small className="transaction-id-hint">Minimum 8 characters · English A–Z and 0–9 only</small></label>
    <label className="payment-field"><span>Payment Screenshot / Photo</span><input className="proof-file-input" type="file" accept="image/*" onChange={e=>setProof(e.target.files?.[0]??null)} required/><span className="proof-file-name">{proof?proof.name:"Upload payment screenshot (JPG, PNG)"}</span></label>
   </div>
   <button className="deposit-review-button" type="submit" disabled={verification!=="idle"||processing}>Deposit Via {method}<PremiumIcon name="chevron" size={19}/></button>
  </form>
  {verification!=="idle"&&<div className="transaction-verify-screen" role="status" aria-live="assertive"><div className={verification==="checking"?"verify-emblem is-spinning":"verify-emblem is-success"}>{verification==="checking"?<PremiumIcon name="transactions" size={31}/>:<svg viewBox="0 0 24 24" width="31" height="31" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6"/></svg>}</div><strong>{verification==="checking"?"Verify Transaction":"Successfully Verify Transaction"}</strong><span>{verification==="checking"?"Checking your entered payment details...":"Your details are ready for final review."}</span><div className="verify-progress"><i/></div></div>}
  {notice&&<p className="deposit-demo-notice" role="status">{notice}</p>}
  {modal&&<div className="deposit-confirm-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="deposit-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="deposit-confirm-title"><div className="confirm-modal-header"><span>DEPOSIT REVIEW</span><button type="button" onClick={()=>setModal(false)} aria-label="Close confirmation"><PremiumIcon name="close" size={23}/></button></div><h2 id="deposit-confirm-title">Confirm your deposit details</h2><p className="confirm-modal-subtitle">Review the information before the final confirmation.</p><div className="confirm-summary"><div><span>Payment Type</span><strong>{isCrypto?"Crypto":"Fiat"}</strong></div>{!isCrypto&&<div><span>Deposit Channel</span><strong>{selectedChannel}</strong></div>}<div><span>Payment Method</span><strong>{method}</strong></div><div><span>Amount</span><strong>{isCrypto?"₮":"৳"} {Number(amount||0).toLocaleString("en-US")} {currency}</strong></div><div><span>{isCrypto?"Sending Wallet Address":"Sender Number"}</span><strong>{sender}</strong></div><div><span>{isCrypto?"Transaction Hash":"Transaction ID"}</span><strong>{transactionId}</strong></div><div><span>Payment Photo</span><strong className="confirm-proof">{proof?.name??"Not attached"}</strong></div></div><div className="confirm-modal-actions"><button type="button" className="confirm-back-button" onClick={()=>setModal(false)}>Edit Details</button><button type="button" className="confirm-deposit-button" onClick={confirmDeposit} disabled={processing}>{processing?"Processing":"Confirm Deposit"}</button></div><small className="confirm-demo-note">Demo interface: confirmation will not submit a real payment until backend integration is completed.</small></section></div>}
 </SiteShell>
}
