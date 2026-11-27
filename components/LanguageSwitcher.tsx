"use client";
import { useLanguage } from "./LanguageProvider";
export function LanguageSwitcher(){const {language,setLanguage}=useLanguage();return <button type="button" className="language-switch" onClick={()=>setLanguage(language==="en"?"bn":"en")} aria-label="Change language">{language==="en"?"বাংলা":"English"}</button>}
