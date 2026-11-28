"use client";
import "./page.css";
import Link from "next/link";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {PremiumIcon} from "@/components/PremiumIcon";
import {useLanguage} from "@/components/LanguageProvider";

const TURNSTILE_SITE_KEY="0x4AAAAAAGWyHDWPn7y0aEQa";
const SUPABASE_URL="https://vdmvgafybznsdyfartfo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_4egi-T8Chh51lQA14lCe7A_fbT9NUF8";

type TurnstileApi={
  render:(container:HTMLElement,options:{
    sitekey:string;
    action:string;
    callback:(token:string)=>void;
    "expired-callback":()=>void;
    "error-callback":()=>void;
  })=>string;
  reset:(widgetId?:string)=>void;
  remove:(widgetId:string)=>void;
};

declare global {
  interface Window { turnstile?:TurnstileApi; }
}

export default function RegisterPage(){
  const {t}=useLanguage();
  const widgetRef=useRef<HTMLDivElement>(null);
  const widgetIdRef=useRef<string|undefined>(undefined);
  const [message,setMessage]=useState("");
  const [captchaToken,setCaptchaToken]=useState("");
  const [captchaReady,setCaptchaReady]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    let script:HTMLScriptElement|null=null;
    const renderWidget=()=>{
      if(cancelled||!window.turnstile||!widgetRef.current||widgetIdRef.current)return;
      widgetIdRef.current=window.turnstile.render(widgetRef.current,{
        sitekey:TURNSTILE_SITE_KEY,
        action:"register",
        callback:(token)=>{setCaptchaToken(token);setMessage("");},
        "expired-callback":()=>{setCaptchaToken("");setMessage("Security check expired. Please verify again.");},
        "error-callback":()=>{setCaptchaToken("");setCaptchaReady(false);setMessage("Security verification could not load. Please refresh and try again.");}
      });
      setCaptchaReady(true);
    };

    if(window.turnstile){renderWidget();}
    else{
      script=document.querySelector<HTMLScriptElement>('script[data-cloudflare-turnstile="true"]');
      if(!script){
        script=document.createElement("script");
        script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async=true;
        script.defer=true;
        script.dataset.cloudflareTurnstile="true";
        document.head.appendChild(script);
      }
      script.addEventListener("load",renderWidget);
      script.addEventListener("error",()=>setMessage("Security verification could not load. Please refresh and try again."));
    }

    return ()=>{
      cancelled=true;
      if(script)script.removeEventListener("load",renderWidget);
      if(widgetIdRef.current&&window.turnstile){
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current=undefined;
      }
    };
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!captchaToken){
      setMessage("Please complete the security verification first.");
      return;
    }
    const data=new FormData(event.currentTarget);
    if(data.get("password")!==data.get("confirmPassword")){
      setMessage("Passwords do not match. Please check again.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try{
      const response=await fetch(SUPABASE_URL+"/functions/v1/auth",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "apikey":SUPABASE_PUBLISHABLE_KEY,
          "Authorization":"Bearer "+SUPABASE_PUBLISHABLE_KEY
        },
        body:JSON.stringify({
          action:"register",
          fullName:String(data.get("fullName")??"").trim(),
          mobile:String(data.get("mobile")??""),
          password:String(data.get("password")??""),
          confirmPassword:String(data.get("confirmPassword")??""),
          turnstileToken:captchaToken
        })
      });
      const result=await response.json().catch(()=>({error:"Unexpected server response. Please try again."}));
      if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"Registration could not be completed. Please try again.");
      setMessage("Account created successfully. You can now continue to sign in.");
      event.currentTarget.reset();
      setCaptchaToken("");
      if(widgetIdRef.current)window.turnstile?.reset(widgetIdRef.current);
    }catch(error){
      setMessage(error instanceof Error?error.message:"Registration failed. Please try again.");
      setCaptchaToken("");
      if(widgetIdRef.current)window.turnstile?.reset(widgetIdRef.current);
    }finally{
      setSubmitting(false);
    }
  }

  return <SiteShell>
    <section className="auth-wrap auth-register">
      <header className="auth-heading">
        <span className="auth-eyebrow">LOTTO • ACCOUNT</span>
        <h1>{t("createAccountTitle")}</h1>
        <p>{t("registerSubtitle")}</p>
      </header>
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field"><span>{t("fullName")}</span><input name="fullName" type="text" autoComplete="name" placeholder={t("fullNamePlaceholder")} required minLength={2}/></label>
        <label className="auth-field">
          <span>{t("mobile")}</span>
          <span className="auth-input-wrap">
            <span className="country-code" aria-label="Bangladesh country code"><span className="country-flag">🇧🇩</span><span>+880</span></span>
            <input name="mobile" type="tel" autoComplete="tel" inputMode="numeric" placeholder={t("mobilePlaceholder")} required pattern="[0-9]*" onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^0-9]/g,"");}}/>
          </span>
        </label>
        <label className="auth-field"><span>{t("password")}</span><input name="password" type="password" autoComplete="new-password" placeholder={t("createPasswordPlaceholder")} required minLength={8} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/></label>
        <label className="auth-field"><span>{t("confirmPassword")}</span><input name="confirmPassword" type="password" autoComplete="new-password" placeholder={t("confirmPasswordPlaceholder")} required minLength={8} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/></label>
        <div className="turnstile-area">
          <span className="turnstile-label">SECURITY VERIFICATION</span>
          <div ref={widgetRef} className="turnstile-widget" aria-label="Cloudflare security verification"/>
          {!captchaReady&&<span className="turnstile-hint">Loading security verification…</span>}
        </div>
        <button className="auth-submit" type="submit" disabled={submitting||!captchaToken}>{submitting?"Creating account…":<>{t("createAccount")} <PremiumIcon name="chevron" size={18}/></>}</button>
        {message&&<p className="auth-message" role="status" aria-live="polite">{message}</p>}
      </form>
      <div className="auth-switch"><span>{t("alreadyAccountShort")}</span><Link href="/Client/Auth/Login/">{t("signIn")}</Link></div>
    </section>
  </SiteShell>;
}
