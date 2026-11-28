"use client";
import "./page.css";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {SiteShell} from "@/components/SiteShell";
import {PremiumIcon} from "@/components/PremiumIcon";
import {useLanguage} from "@/components/LanguageProvider";

export default function LoginPage(){
  const {t}=useLanguage();
  const [message,setMessage]=useState("");
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setMessage("Demo form only — secure authentication will be connected in the backend phase.");
  }
  return <SiteShell>
    <section className="auth-wrap">
      <header className="auth-heading">
        <span className="auth-eyebrow">LOTTO • ACCOUNT</span>
        <h1>{t("welcomeBack")}</h1>
        <p>{t("loginSubtitle")}</p>
      </header>
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field">
          <span>{t("idOrMobile")}</span>
          <span className="auth-input-wrap">
            <span className="country-code" aria-label="Bangladesh country code"><span className="country-flag">🇧🇩</span><span>+880</span></span>
            <input name="identifier" type="text" autoComplete="username" placeholder={t("loginIdentifierPlaceholder")} required onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^A-Za-z0-9@._+-]/g,"");}}/>
          </span>
        </label>
        <label className="auth-field">
          <span>{t("password")}</span>
          <input name="password" type="password" autoComplete="current-password" placeholder={t("loginPasswordPlaceholder")} required minLength={6} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/>
        </label>
        <button className="auth-submit" type="submit">{t("signIn")} <PremiumIcon name="chevron" size={18}/></button>
        {message&&<p className="auth-message" role="status">{message}</p>}
      </form>
      <div className="auth-switch"><span>{t("dontHaveAccount")}</span><Link href="/Client/Auth/Register/">{t("register")}</Link></div>
    </section>
  </SiteShell>;
}
