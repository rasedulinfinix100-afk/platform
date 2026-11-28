"use client";
import {useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {AuthGate} from "@/components/AuthGate";
import {withdrawalMethods,fiatWithdrawalChannels} from "@/lib/demo-config";
import {PremiumIcon} from "@/components/PremiumIcon";
import "./withdrawal.css";
const cryptoMethods=["USDT (BEP20)","USDT (TRC20)","USDT (ERC20)"] as const;
type PaymentMode="fiat"|"crypto";
export default function WithdrawalPage(){
 const [mode,setMode]=useState<PaymentMode>("fiat");
 const [channel,setChannel]=useState<string>("channel-one");
 const [method,setMethod]=useState<string>("bKash");
 const [amount,setAmount]=useState("");
 const [account,setAccount]=useState("");
 const [message,setMessage]=useState("");
 const isCrypto=mode==="crypto";
 const methods:readonly string[]=isCrypto?cryptoMethods:withdrawalMethods;
 const selectedChannel=fiatWithdrawalChannels.find(c=>c.id===channel)?.name??"Channel One";
 function changeMode(next:PaymentMode){setMode(next);setMethod(next==="crypto"?cryptoMethods[0]:"bKash");setAmount("");setAccount("");setMessage("")}
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage("Demo interface only. Your withdrawal request has not been submitted because backend integration is not connected yet.");}
 return <AuthGate><SiteShell>
  <section className="withdrawal-mode-switch" role="group" aria-label="Withdrawal type">
   <button type="button" className={mode==="fiat"?"withdrawal-mode-tab active":"withdrawal-mode-tab"} onClick={()=>changeMode("fiat")} aria-pressed={mode==="fiat"}>Fiat</button>
   <button type="button" className={mode==="crypto"?"withdrawal-mode-tab active":"withdrawal-mode-tab"} onClick={()=>changeMode("crypto")} aria-pressed={mode==="crypto"}>Crypto</button>
  </section>
  {!isCrypto&&<><h2 className="section-title">Withdrawal Channel</h2><div className="withdrawal-channel-list" role="group" aria-label="Withdrawal channel">{fiatWithdrawalChannels.map(c=><button type="button" key={c.id} className={channel===c.id?"withdrawal-channel active":"withdrawal-channel"} onClick={()=>setChannel(c.id)}>{c.name}</button>)}</div></>}
  <h2 className="section-title">{isCrypto?"Crypto Network":"Withdrawal Method"}</h2>
  <div className="withdrawal-method-grid" role="group" aria-label="Select withdrawal method">{methods.map(m=><button type="button" className={method===m?"withdrawal-method selected":"withdrawal-method"} key={m} onClick={()=>{setMethod(m);setMessage("")}} aria-pressed={method===m}><span className={`payment-logo logo-${m.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}>{m.includes("USDT")?"₮":m==="Bank"?"B":m==="bKash"?"bKash":m==="Nagad"?"N":m==="Rocket"?"R":m==="Upay"?"U":"C"}</span><strong>{m}</strong><span className="withdrawal-select-mark">{method===m?"✓":""}</span></button>)}</div>
  <form className="withdrawal-form" onSubmit={submit}>
   <h2>Withdrawal Details</h2>
   {!isCrypto&&<p className="withdrawal-selected-channel">{selectedChannel}</p>}
   <label className="withdrawal-field"><span>Withdrawal Amount ({isCrypto?"USDT":"BDT"})</span><div className="withdrawal-amount-input"><span>{isCrypto?"₮":"৳"}</span><input type="number" min={isCrypto?"0.000001":"1"} step={isCrypto?"0.000001":"1"} required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></div></label>
   <label className="withdrawal-field"><span>{isCrypto?"Destination Wallet Address":method==="Bank"?"Bank Account Number":`Your ${method} Number`}</span><input type="text" autoComplete="off" required value={account} onChange={e=>setAccount(e.target.value.replace(/[^A-Za-z0-9+@._-]/g,""))} placeholder={isCrypto?"Enter your receiving wallet address":method==="Bank"?"Enter bank account number":"Enter your receiving number"}/></label>
   <button className="withdrawal-submit" type="submit">Request Withdrawal via {method}<PremiumIcon name="chevron" size={18}/></button>
   {message&&<p className="withdrawal-demo-notice" role="status">{message}</p>}
  </form>
 </SiteShell>
}
