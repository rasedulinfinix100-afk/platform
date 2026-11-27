"use client";
import { createContext,useContext,useEffect,useMemo,useState } from "react";
type Language="en"|"bn"; type LanguageContextValue={language:Language;setLanguage:(value:Language)=>void};
const LanguageContext=createContext<LanguageContextValue>({language:"en",setLanguage:()=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}){const [language,setLanguageState]=useState<Language>("en");useEffect(()=>{const saved=localStorage.getItem("lotto-language");if(saved==="bn"||saved==="en")setLanguageState(saved)},[]);const value=useMemo(()=>({language,setLanguage:(next:Language)=>{setLanguageState(next);localStorage.setItem("lotto-language",next)}}),[language]);return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>}
export function useLanguage(){return useContext(LanguageContext)}
