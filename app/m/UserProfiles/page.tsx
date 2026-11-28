"use client";

import "./page.css";
import {useCallback,useEffect,useState,type FormEvent,type ChangeEvent} from "react";
import {AuthGate} from "@/components/AuthGate";
import {useAuth} from "@/components/AuthProvider";

const SUPABASE_URL="https://vdmvgafybznsdyfartfo.supabase.co";
const SUPABASE_KEY="sb_publishable_4egi-T8Chh51lQA14lCe7A_fbT9NUF8";
const BUCKET="profile-verification-documents";
const MAX_NID_BYTES=409600;
const SESSION_KEY="lotto-auth-session";

type ProfileData={email:string|null;email_verified:boolean;avatar_url:string|null;account_status:string;last_login_at:string|null;last_login_browser:string|null;last_login_device_model:string|null};
type VerificationData={id:string;status:string;submitted_at:string;rejection_reason:string|null};

function getAccessToken():string|null{
  try{
    const raw=localStorage.getItem(SESSION_KEY);
    const parsed=raw?JSON.parse(raw):null;
    return parsed?.session?.access_token??null;
  }catch{return null;}
}

async function api(path:string,token:string,init:RequestInit={}){
  const response=await fetch(SUPABASE_URL+path,{
    ...init,
    headers:{
      apikey:SUPABASE_KEY,
      Authorization:"Bearer "+token,
      ...(init.headers??{})
    },
    cache:"no-store"
  });
  const text=await response.text();
  let data:unknown=null;
  try{data=text?JSON.parse(text):null;}catch{data=text;}
  if(!response.ok){
    const message=typeof data==="object"&&data&&"message" in data?String((data as {message:unknown}).message):"Request failed. Please try again.";
    throw new Error(message);
  }
  return data;
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

  useEffect(()=>{setToken(getAccessToken());},[isReady,user?.id]);

  const load=useCallback(async()=>{
    if(!token||!user?.id)return;
    try{
      const [profiles,verifications]=await Promise.all([
        api("/rest/v1/profiles?select=email,email_verified,avatar_url,account_status,last_login_at,last_login_browser,last_login_device_model&id=eq."+encodeURIComponent(user.id),token),
        api("/rest/v1/profile_verifications?select=id,status,submitted_at,rejection_reason&order=submitted_at.desc&limit=1",token)
      ]);
      const row=Array.isArray(profiles)?profiles[0] as ProfileData|undefined:undefined;
      setProfile(row??null);
      setEmail(row?.email??"");
      setVerification(Array.isArray(verifications)?(verifications[0] as VerificationData??null):null);
    }catch(e){setError(e instanceof Error?e.message:"Could not load profile.");}
  },[token,user?.id]);

  useEffect(()=>{void load();},[load]);

  async function saveProfile(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!token||!user?.id)return;
    setSaving(true);setError("");setMessage("");
    try{
      await api("/rest/v1/profiles?id=eq."+encodeURIComponent(user.id),token,{
        method:"PATCH",
        headers:{"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify({email:email.trim()||null})
      });
      setMessage("Profile updated successfully.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Could not save profile.");}
    finally{setSaving(false);}
  }

  function chooseFile(event:ChangeEvent<HTMLInputElement>){
    const selected=event.target.files?.[0]??null;
    setError("");setMessage("");
    if(!selected){setFile(null);return;}
    if(!["image/jpeg","image/png","application/pdf"].includes(selected.type)){
      setFile(null);event.target.value="";setError("Only JPG, PNG, or PDF files are accepted.");return;
    }
    if(selected.size>MAX_NID_BYTES){
      setFile(null);event.target.value="";setError("NID file must be 400 KB or smaller.");return;
    }
    setFile(selected);
  }

  async function submitNid(){
    if(!token||!user?.id||!file)return;
    if(file.size>MAX_NID_BYTES){setError("NID file must be 400 KB or smaller.");return;}
    setUploading(true);setError("");setMessage("");
    const extension=file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":"pdf";
    const objectPath=user.id+"/"+crypto.randomUUID()+"."+extension;
    let uploaded=false;
    try{
      await api("/storage/v1/object/"+BUCKET+"/"+objectPath,token,{
        method:"POST",
        headers:{"Content-Type":file.type,"x-upsert":"false"},
        body:file
      });
      uploaded=true;
      await api("/rest/v1/profile_verifications",token,{
        method:"POST",
        headers:{"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify({user_id:user.id,document_type:"NID",document_path:objectPath})
      });
      setFile(null);
      const input=document.getElementById("nid-file") as HTMLInputElement|null;
      if(input)input.value="";
      setMessage("NID submitted securely. Your verification is pending review.");
      await load();
    }catch(e){
      if(uploaded){
        try{await api("/storage/v1/object/"+BUCKET,token,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({prefix:objectPath})});}catch{/* Orphan cleanup can be handled by an administrator. */}
      }
      setError(e instanceof Error?e.message:"NID upload failed. Please try again.");
    }finally{setUploading(false);}
  }

  if(!isReady||!user)return <main className="profile-page"><p className="profile-muted">Loading your profile…</p></main>;

  return <main className="profile-page">
    <header className="profile-heading">
      <span className="profile-eyebrow">LOTTO • ACCOUNT</span>
      <h1>My Profile</h1>
      <p>Manage your contact details and identity verification.</p>
    </header>

    <section className="profile-card">
      <div className="profile-card-title"><div><span className="profile-kicker">PERSONAL INFORMATION</span><h2>Account details</h2></div><span className={"profile-status "+(profile?.account_status==="active"?"is-active":"")}>{profile?.account_status??"Loading"}</span></div>
      <div className="profile-detail"><span>Full name</span><strong>{user.fullName||"—"}</strong></div>
      <div className="profile-detail"><span>Mobile number</span><strong>{user.mobile||"—"}</strong></div>
      <form onSubmit={saveProfile} className="profile-form">
        <label htmlFor="contact-email">Contact email <small>Optional</small></label>
        <input id="contact-email" type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
        <p className="profile-hint">This is a contact email, not your login ID. Email verification is not enabled yet.</p>
        <button type="submit" disabled={saving}>{saving?"Saving…":"Save email"}</button>
      </form>
    </section>

    <section className="profile-card">
      <div className="profile-card-title"><div><span className="profile-kicker">IDENTITY CHECK</span><h2>NID verification</h2></div><span className={"profile-status "+(verification?.status==="approved"?"is-active":"")}>{verification?.status??"Not submitted"}</span></div>
      {verification?<div className="profile-verification-state">
        <p>Submitted {new Date(verification.submitted_at).toLocaleString()}</p>
        {verification.rejection_reason&&<p className="profile-error">{verification.rejection_reason}</p>}
        {verification.status==="pending"&&<p>Your document is waiting for an administrator review.</p>}
      </div>:<p className="profile-hint">Upload a clear photo or PDF of your Bangladesh NID. The document is stored privately and can only be accessed by you and authorized administrators.</p>}
      {(!verification||verification.status==="rejected"||verification.status==="needs_resubmission")&&<>
        <label className="profile-upload-label" htmlFor="nid-file">Choose NID file</label>
        <input id="nid-file" className="profile-file" type="file" accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf" onChange={chooseFile}/>
        <p className="profile-hint">JPG, PNG, or PDF • Maximum 400 KB</p>
        {file&&<p className="profile-file-name">{file.name} · {(file.size/1024).toFixed(1)} KB</p>}
        <button className="profile-primary" type="button" disabled={!file||uploading} onClick={()=>void submitNid()}>{uploading?"Uploading securely…":"Submit for verification"}</button>
      </>}
    </section>

    <section className="profile-card">
      <span className="profile-kicker">SECURITY INFORMATION</span>
      <h2>Last login</h2>
      <div className="profile-detail"><span>Time</span><strong>{profile?.last_login_at?new Date(profile.last_login_at).toLocaleString():"Not available"}</strong></div>
      <div className="profile-detail"><span>Browser</span><strong>{profile?.last_login_browser??"Not available"}</strong></div>
      <div className="profile-detail"><span>Device</span><strong>{profile?.last_login_device_model??"Not available"}</strong></div>
      <p className="profile-hint">IP address is retained for security review and is not displayed here.</p>
    </section>
    {message&&<p className="profile-success" role="status">{message}</p>}
    {error&&<p className="profile-error" role="alert">{error}</p>}
  </main>;
}

export default function UserProfilePage(){
  return <AuthGate><ProfileContent/></AuthGate>;
}
