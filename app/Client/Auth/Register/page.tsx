"use client";
import "./page.css";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {PremiumIcon} from "@/components/PremiumIcon";
import {useLanguage} from "@/components/LanguageProvider";

export default function RegisterPage(){
  const {t}=useLanguage();
  const [message,setMessage]=useState("");
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    if(data.get("password")!==data.get("confirmPassword")){
      setMessage("Passwords do not match. Please check again.");
      return;
    }
    setMessage("Demo form only — account registration will be connected in the backend phase.");
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
        <label className="auth-field"><span>{t("password")}</span><input name="password" type="password" autoComplete="new-password" placeholder={t("createPasswordPlaceholder")} required minLength={6} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/></label>
        <label className="auth-field"><span>{t("confirmPassword")}</span><input name="confirmPassword" type="password" autoComplete="new-password" placeholder={t("confirmPasswordPlaceholder")} required minLength={6} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/></label>
        <button className="auth-submit" type="submit">{t("createAccount")} <PremiumIcon name="chevron" size={18}/></button>
        {message&&<p className="auth-message" role="status">{message}</p>}
      </form>
      <div className="auth-switch"><span>{t("alreadyAccountShort")}</span><Link href="/Client/Auth/Login/">{t("signIn")}</Link></div>
    </section>
  </SiteShell>;
}
