"use client";
import "./page.css";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {SiteShell} from "@/components/SiteShell";
import {PremiumIcon} from "@/components/PremiumIcon";
import {useLanguage} from "@/components/LanguageProvider";
import {useAuth,type AuthSession,type AuthUser} from "@/components/AuthProvider";

const SUPABASE_URL="https://vdmvgafybznsdyfartfo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_4egi-T8Chh51lQA14lCe7A_fbT9NUF8";

export default function LoginPage(){
  const {t}=useLanguage();
  const router=useRouter();
  const {establishSession}=useAuth();
  const [message,setMessage]=useState("");
  const [submitting,setSubmitting]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
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
          action:"login",
          mobile:String(data.get("mobile")??""),
          password:String(data.get("password")??"")
        }),
        cache:"no-store"
      });
      const result=await response.json().catch(()=>({error:"Unexpected server response. Please try again."}));
      if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"Login could not be completed. Please try again.");
      if(!result.session?.access_token||!result.session?.refresh_token||!result.user?.id){
        throw new Error("Login succeeded, but a secure session was not returned. Please try again.");
      }
      establishSession(result.session as AuthSession,result.user as AuthUser);
      form.reset();
      router.replace("/");
    }catch(error){
      setMessage(error instanceof Error?error.message:"Login failed. Please try again.");
    }finally{
      setSubmitting(false);
    }
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
          <span>{t("mobile")}</span>
          <span className="auth-input-wrap">
            <span className="country-code" aria-label="Bangladesh country code"><span className="country-flag">🇧🇩</span><span>+880</span></span>
            <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t("mobilePlaceholder")} required pattern="01[3-9][0-9]{8}" minLength={11} maxLength={11} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^0-9]/g,"");}}/>
          </span>
        </label>
        <label className="auth-field">
          <span>{t("password")}</span>
          <input name="password" type="password" autoComplete="current-password" placeholder={t("loginPasswordPlaceholder")} required minLength={8} maxLength={72} onChange={(event)=>{event.currentTarget.value=event.currentTarget.value.replace(/[^\x20-\x7E]/g,"");}}/>
        </label>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting?"Signing in…":<>{t("signIn")} <PremiumIcon name="chevron" size={18}/></>}</button>
        {message&&<p className="auth-message" role="status" aria-live="polite">{message}</p>}
      </form>
      <div className="auth-switch"><span>{t("dontHaveAccount")}</span><Link href="/Client/Auth/Register/">{t("register")}</Link></div>
    </section>
  </SiteShell>;
}
