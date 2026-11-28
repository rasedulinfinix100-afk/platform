"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from "react";

const SUPABASE_URL="https://vdmvgafybznsdyfartfo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_4egi-T8Chh51lQA14lCe7A_fbT9NUF8";
const SESSION_KEY="lotto-auth-session";
const AUTH_ENDPOINT=SUPABASE_URL+"/functions/v1/auth";

export type AuthUser={id:string;fullName:string;mobile:string};
export type AuthSession={access_token:string;refresh_token:string;expires_at?:number;expires_in?:number;token_type?:string;user?:{id?:string;phone?:string}};
type AuthContextValue={
  user:AuthUser|null;
  isAuthenticated:boolean;
  isReady:boolean;
  establishSession:(session:AuthSession,user:AuthUser)=>void;
  logout:()=>Promise<void>;
};
const AuthContext=createContext<AuthContextValue>({
  user:null,isAuthenticated:false,isReady:false,
  establishSession:()=>{},logout:async()=>{}
});

function saveSession(session:AuthSession,user:AuthUser){
  const expiresAt=session.expires_at??Math.floor(Date.now()/1000)+(session.expires_in??3600);
  const stored={session:{...session,expires_at:expiresAt},user};
  localStorage.setItem(SESSION_KEY,JSON.stringify(stored));
  return stored;
}
function readSession():{session:AuthSession;user:AuthUser}|null{
  try{
    const raw=localStorage.getItem(SESSION_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!parsed?.session?.access_token||!parsed?.session?.refresh_token||!parsed?.user?.id)return null;
    return parsed;
  }catch{return null;}
}
async function authRequest(action:string,accessToken?:string){
  const response=await fetch(AUTH_ENDPOINT,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_PUBLISHABLE_KEY,
      "Authorization":"Bearer "+(accessToken??SUPABASE_PUBLISHABLE_KEY)
    },
    body:JSON.stringify({action}),
    cache:"no-store"
  });
  const result=await response.json().catch(()=>({error:"Unexpected server response."}));
  if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"Authentication request failed.");
  return result;
}
async function refreshSession(session:AuthSession):Promise<AuthSession>{
  const response=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":SUPABASE_PUBLISHABLE_KEY},
    body:JSON.stringify({refresh_token:session.refresh_token}),
    cache:"no-store"
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.access_token||!result.refresh_token){
    throw new Error(typeof result.msg==="string"?result.msg:"Your session has expired. Please sign in again.");
  }
  return {...result,expires_at:result.expires_at??Math.floor(Date.now()/1000)+(result.expires_in??3600)};
}

export function AuthProvider({children}:{children:React.ReactNode}){
  const [user,setUser]=useState<AuthUser|null>(null);
  const [isReady,setReady]=useState(false);
  const sessionRef=useRef<AuthSession|null>(null);
  const refreshTimer=useRef<ReturnType<typeof setTimeout>|null>(null);

  const clearLocalSession=useCallback(()=>{
    if(refreshTimer.current)clearTimeout(refreshTimer.current);
    refreshTimer.current=null;
    sessionRef.current=null;
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  },[]);

  const scheduleRefresh=useCallback((session:AuthSession)=>{
    if(refreshTimer.current)clearTimeout(refreshTimer.current);
    const expiresAt=session.expires_at??Math.floor(Date.now()/1000)+(session.expires_in??3600);
    const delay=Math.max(1000,(expiresAt-Math.floor(Date.now()/1000)-60)*1000);
    refreshTimer.current=setTimeout(async()=>{
      try{
        const next=await refreshSession(session);
        const currentUser=readSession()?.user;
        if(!currentUser){clearLocalSession();return;}
        const stored=saveSession(next,currentUser);
        sessionRef.current=stored.session;
        setUser(stored.user);
        scheduleRefresh(stored.session);
      }catch{
        clearLocalSession();
      }
    },Math.min(delay,2147483000));
  },[clearLocalSession]);

  const establishSession=useCallback((session:AuthSession,nextUser:AuthUser)=>{
    const stored=saveSession(session,nextUser);
    sessionRef.current=stored.session;
    setUser(stored.user);
    scheduleRefresh(stored.session);
  },[scheduleRefresh]);

  useEffect(()=>{
    let active=true;
    async function restore(){
      const stored=readSession();
      if(!stored){if(active)setReady(true);return;}
      try{
        let session=stored.session;
        if((session.expires_at??0)*1000<Date.now()+60000){
          session=await refreshSession(session);
        }
        const result=await authRequest("me",session.access_token);
        if(!result.user?.id)throw new Error("Unable to verify session.");
        const verifiedUser:AuthUser={
          id:String(result.user.id),
          fullName:String(result.user.fullName??stored.user.fullName??""),
          mobile:String(result.user.mobile??stored.user.mobile??"")
        };
        if(active){
          const next=saveSession(session,verifiedUser);
          sessionRef.current=next.session;
          setUser(next.user);
          scheduleRefresh(next.session);
        }
      }catch{
        if(active)clearLocalSession();
      }finally{if(active)setReady(true);}
    }
    void restore();
    const onStorage=(event:StorageEvent)=>{
      if(event.key!==SESSION_KEY)return;
      const next=readSession();
      if(!next){clearLocalSession();return;}
      sessionRef.current=next.session;
      setUser(next.user);
      scheduleRefresh(next.session);
    };
    window.addEventListener("storage",onStorage);
    return()=>{
      active=false;
      window.removeEventListener("storage",onStorage);
      if(refreshTimer.current)clearTimeout(refreshTimer.current);
    };
  },[clearLocalSession,scheduleRefresh]);

  const logout=useCallback(async()=>{
    const session=sessionRef.current??readSession()?.session;
    if(!session){clearLocalSession();return;}
    try{
      await authRequest("logout",session.access_token);
      clearLocalSession();
    }catch(error){
      if(error instanceof Error&&/expired|invalid|authentication required/i.test(error.message)){
        clearLocalSession();
        return;
      }
      throw error;
    }
  },[clearLocalSession]);

  const value=useMemo(()=>({
    user,isAuthenticated:Boolean(user),isReady,establishSession,logout
  }),[user,isReady,establishSession,logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext)}
