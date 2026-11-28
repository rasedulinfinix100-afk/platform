"use client";

import "./page.css";
import Link from "next/link";
import {useCallback,useEffect,useState,type FormEvent,type ChangeEvent} from "react";
import {AuthGate} from "@/components/AuthGate";
import {useAuth} from "@/components/AuthProvider";

const SUPABASE_URL="https://vdmvgafybznsdyfartfo.supabase.co";
const SUPABASE_KEY="sb_publishable_4egi-T8Chh51lQA14lCe7A_fbT9NUF8";
const BUCKET="profile-verification-documents";
const MAX_NID_BYTES=409600;
const SESSION_KEY="lotto-auth-session";
type ProfileData={full_name:string|null;mobile:string|null;email:string|null;email_verified:boolean;avatar_url:string|null;account_status:string;last_login_at:string|null;last_login_browser:string|null;last_login_device_model:string|null};
type VerificationData={id:string;status:string;submitted_at:string;rejection_reason:string|null};
type Section="account"|"verification"|"login"|null;

function getAccessToken():string|null{
  try{const raw=localStorage.getItem(SESSION_KEY);const parsed=raw?JSON.parse(raw):null;return parsed?.session?.access_token??null;}catch{return null;}
}
async function api(path:string,token:string,init:RequestInit={}){
  const response=await fetch(SUPABASE_URL+path,{...init,headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+token,...(init.headers??{})},cache:"no-store"});
  const text=await response.text();let data:unknown=null;try{data=text?JSON.parse(text):null;}catch{data=text;}
  if(!response.ok){const message=typeof data==="object"&&data&&"message" in data?String((data as {message:unknown}).message):"Request failed. Please try again.";throw new Error(message);}
  return data;
}
function Icon({name}:{name:"settings"|"user"|"shield"|"clock"|"chevron"|"close"|"chip"}) {
  const common={width:22,height:22,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const, "aria-hidden":true as const};
  if(name==="settings")return <svg {...common} width="25" height="25" viewBox="0 0 24 24"><path d="M12 2.75 13.35 4.8a7.7 7.7 0 0 1 1.55.65l2.35-.55 1.55 2.7-1.55 1.85c.1.55.1 1.1 0 1.65l1.55 1.85-1.55 2.7-2.35-.55a7.7 7.7 0 0 1-1.55.65L12 17.8l-1.35-2.05a7.7 7.7 0 0 1-1.55-.65l-2.35.55-1.55-2.7 1.55-1.85a5.5 5.5 0 0 1 0-1.65L5.2 7.6l1.55-2.7 2.35.55a7.7 7.7 0 0 1 1.55-.65L12 2.75Z" transform="translate(0 1) scale(1 .9)"/><circle cx="12" cy="11" r="2.65"/></svg>;
  if(name==="user")return <svg {...common}><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.3 3.1-5 7-5s6.4 1.7 7 5"/></svg>;
  if(name==="shield")return <svg {...common}><path d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if(name==="clock")return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  if(name==="close")return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if(name==="chip")return <svg {...common}><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5V3m6 2V3M9 21v-2m6 2v-2M5 9H3m2 6H3m18-6h-2m2 6h-2"/></svg>;
  return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>;
}
function ProfileContent(){
  const {user,isReady}=useAuth();
  const [token,setToken]=useState<string|null>(null);
  const [profile,setProfile]=useState<ProfileData|null>(null);
  const [verification,setVerification]=useState<VerificationData|null>(null);
  const [email,setEmail]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [section,setSection]=useState<Section>(null);
  useEffect(()=>{setToken(getAccessToken());},[isReady,user?.id]);
  const load=useCallback(async()=>{
    if(!token||!user?.id)return;
    try{
      const [profiles,verifications]=await Promise.all([
        api("/rest/v1/profiles?select=full_name,mobile,email,email_verified,avatar_url,account_status,last_login_at,last_login_browser,last_login_device_model&id=eq."+encodeURIComponent(user.id),token),
        api("/rest/v1/profile_verifications?select=id,status,submitted_at,rejection_reason&order=submitted_at.desc&limit=1",token)
      ]);
      const row=Array.isArray(profiles)?profiles[0] as ProfileData|undefined:undefined;
      setProfile(row??null);setEmail(row?.email??"");
      setVerification(Array.isArray(verifications)?(verifications[0] as VerificationData??null):null);
    }catch(e){setError(e instanceof Error?e.message:"Could not load profile.");}
  },[token,user?.id]);
  useEffect(()=>{void load();},[load]);
  async function saveProfile(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!token||!user?.id)return;setSaving(true);setError("");setMessage("");
    try{await api("/rest/v1/profiles?id=eq."+encodeURIComponent(user.id),token,{method:"PATCH",headers:{"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({email:email.trim()||null})});setMessage("Profile updated successfully.");await load();}
    catch(e){setError(e instanceof Error?e.message:"Could not save profile.");}finally{setSaving(false);}
  }
  function chooseFile(event:ChangeEvent<HTMLInputElement>){
    const selected=event.target.files?.[0]??null;setError("");setMessage("");
    if(!selected){setFile(null);return;}
    if(!["image/jpeg","image/png","application/pdf"].includes(selected.type)){setFile(null);event.target.value="";setError("Only JPG, PNG, or PDF files are accepted.");return;}
    if(selected.size>MAX_NID_BYTES){setFile(null);event.target.value="";setError("NID file must be 400 KB or smaller.");return;}setFile(selected);
  }
  async function submitNid(){
    if(!token||!user?.id||!file)return;if(file.size>MAX_NID_BYTES){setError("NID file must be 400 KB or smaller.");return;}
    setUploading(true);setError("");setMessage("");const extension=file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":"pdf";const objectPath=user.id+"/"+crypto.randomUUID()+"."+extension;let uploaded=false;
    try{
      await api("/storage/v1/object/"+BUCKET+"/"+objectPath,token,{method:"POST",headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});uploaded=true;
      await api("/rest/v1/profile_verifications",token,{method:"POST",headers:{"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({user_id:user.id,document_type:"NID",document_path:objectPath})});
      setFile(null);const input=document.getElementById("nid-file") as HTMLInputElement|null;if(input)input.value="";setMessage("NID submitted securely. Your verification is pending review.");await load();
    }catch(e){if(uploaded){try{await api("/storage/v1/object/"+BUCKET,token,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({prefixes:[objectPath]})});}catch{/* Admin cleanup may be required. */}}setError(e instanceof Error?e.message:"NID upload failed. Please try again.");}
    finally{setUploading(false);}
  }
  if(!isReady||!user)return <main className="profile-page"><p className="profile-muted">Loading your profile…</p></main>;
  const holder=profile?.full_name||user.fullName||"LOTTO MEMBER";
  const mobile=profile?.mobile||user.mobile||"";
  return <main className="profile-page">
    <header className="profile-topbar">
      <Link className="profile-brand" href="/" aria-label="Lotto BD home"><span className="profile-brand-mark">L</span><span>LOTTO<span>BD</span></span></Link>
      <button className="profile-settings-trigger" type="button" aria-label="Open settings" aria-expanded={settingsOpen} onClick={()=>setSettingsOpen(true)}><Icon name="settings"/></button>
    </header>
    <section className="profile-card-stage" aria-label="Demo account card">
      <div className="profile-account-card">
        <div className="profile-card-shine"/>
        <div className="profile-card-top"><span className="profile-card-chip"><Icon name="chip"/></span></div>
        <div className="profile-card-number">4582&nbsp; 7391&nbsp; 6240&nbsp; 1856</div>
        <div className="profile-card-bottom"><div><span className="profile-card-caption">CARD HOLDER</span><strong>{holder.toUpperCase()}</strong></div><div className="profile-card-pin"><span className="profile-card-caption">PIN CODE</span><strong>4821</strong></div></div>
      </div>
    </section>
    {settingsOpen&&<div className="profile-drawer-backdrop" role="presentation" onClick={()=>setSettingsOpen(false)}>
      <aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profile-drawer-title" onClick={e=>e.stopPropagation()}>
        <div className="profile-drawer-heading"><div><span className="profile-eyebrow">LOTTO BD</span><h2 id="profile-drawer-title">Settings</h2></div><button type="button" className="profile-settings-close" aria-label="Close settings" onClick={()=>setSettingsOpen(false)}><Icon name="close"/></button></div>
        <nav className="profile-settings-nav" aria-label="Profile sections">
          <button type="button" onClick={()=>{setSection("account");setSettingsOpen(false);setMessage("");setError("");}}><Icon name="user"/><span><strong>Account Info</strong><small>Personal details and contact email</small></span><Icon name="chevron"/></button>
          <button type="button" onClick={()=>{setSection("verification");setSettingsOpen(false);setMessage("");setError("");}}><Icon name="shield"/><span><strong>Verification</strong><small>Identity information and NID</small></span><Icon name="chevron"/></button>
          <button type="button" onClick={()=>{setSection("login");setSettingsOpen(false);setMessage("");setError("");}}><Icon name="clock"/><span><strong>Last Login</strong><small>Recent sign-in information</small></span><Icon name="chevron"/></button>
        </nav>
      </aside>
    </div>}
    {section&&<div className="profile-fullscreen-modal" role="presentation">
      <section className="profile-fullscreen-content" role="dialog" aria-modal="true" aria-labelledby="profile-section-title">
        <header className="profile-fullscreen-header"><button type="button" className="profile-back-button" onClick={()=>{setSection(null);setSettingsOpen(true);}}>‹ Settings</button><h2 id="profile-section-title">{section==="account"?"Account Info":section==="verification"?"Verification":"Last Login"}</h2><button type="button" className="profile-settings-close" aria-label="Close section" onClick={()=>setSection(null)}><Icon name="close"/></button></header>
        <div className="profile-fullscreen-body">
          {section==="account"&&<section className="profile-info-section"><span className="profile-kicker">PERSONAL INFORMATION</span><h3>Account details</h3><div className="profile-detail"><span>Full name</span><strong>{holder}</strong></div><div className="profile-detail"><span>Mobile number</span><strong>{mobile||"—"}</strong></div><div className="profile-detail"><span>Account status</span><strong>{profile?.account_status??"—"}</strong></div><form onSubmit={saveProfile} className="profile-form"><label htmlFor="contact-email">Contact email <small>Optional</small></label><input id="contact-email" type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><p className="profile-hint">This is a contact email, not your login ID. Email verification is not enabled yet.</p><button type="submit" disabled={saving}>{saving?"Saving…":"Save email"}</button></form></section>}
          {section==="verification"&&<section className="profile-info-section"><span className="profile-kicker">IDENTITY CHECK</span><h3>NID verification</h3><div className="profile-verification-badge">{verification?.status??"Not submitted"}</div>{verification?<div className="profile-verification-state"><p>Submitted {new Date(verification.submitted_at).toLocaleString()}</p>{verification.rejection_reason&&<p className="profile-error">{verification.rejection_reason}</p>}{verification.status==="pending"&&<p>Your document is waiting for an administrator review.</p>}</div>:<p className="profile-hint">Upload a clear photo or PDF of your Bangladesh NID. The document is stored privately and can only be accessed by you and authorized administrators.</p>}{(!verification||verification.status==="rejected"||verification.status==="needs_resubmission")&&<><label className="profile-upload-label" htmlFor="nid-file">Choose NID file</label><input id="nid-file" className="profile-file" type="file" accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf" onChange={chooseFile}/><p className="profile-hint">JPG, PNG, or PDF · Maximum 400 KB</p>{file&&<p className="profile-file-name">{file.name} · {(file.size/1024).toFixed(1)} KB</p>}<button className="profile-primary" type="button" disabled={!file||uploading} onClick={()=>void submitNid()}>{uploading?"Uploading securely…":"Submit for verification"}</button></>}</section>}
          {section==="login"&&<section className="profile-info-section"><span className="profile-kicker">SECURITY INFORMATION</span><h3>Last login</h3><div className="profile-detail"><span>Time</span><strong>{profile?.last_login_at?new Date(profile.last_login_at).toLocaleString():"Not available"}</strong></div><div className="profile-detail"><span>Browser</span><strong>{profile?.last_login_browser??"Not available"}</strong></div><div className="profile-detail"><span>Device</span><strong>{profile?.last_login_device_model??"Not available"}</strong></div><p className="profile-hint">IP address is retained for security review and is not displayed here.</p></section>}
          {message&&<p className="profile-success" role="status">{message}</p>}{error&&<p className="profile-error" role="alert">{error}</p>}
        </div>
      </section>
    </div>}
  </main>;
}
export default function UserProfilePage(){return <AuthGate><ProfileContent/></AuthGate>;}
