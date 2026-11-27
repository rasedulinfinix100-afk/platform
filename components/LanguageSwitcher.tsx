"use client";
import {useLanguage} from "./LanguageProvider";
export function LanguageSwitcher(){const {language,setLanguage,t}=useLanguage();return <button type="button" className="language-switch" onClick={()=>setLanguage(language==="en"?"bn":"en")} aria-label="Change language" aria-live="polite">{language==="en"?"বাংলা":"English"}</button>}
