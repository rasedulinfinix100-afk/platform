"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
type AuthValue={isAuthenticated:boolean;isReady:boolean;loginDemo:()=>void;logout:()=>void};
const AuthContext=createContext<AuthValue>({isAuthenticated:false,isReady:false,loginDemo:()=>{},logout:()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){const [isAuthenticated,setAuthenticated]=useState(false);const [isReady,setReady]=useState(false);useEffect(()=>{try{setAuthenticated(localStorage.getItem("lotto-authenticated")==="true")}finally{setReady(true)}},[]);const loginDemo=useCallback(()=>{localStorage.setItem("lotto-authenticated","true");setAuthenticated(true)},[]);const logout=useCallback(()=>{localStorage.removeItem("lotto-authenticated");setAuthenticated(false)},[]);const value=useMemo(()=>({isAuthenticated,isReady,loginDemo,logout}),[isAuthenticated,isReady,loginDemo,logout]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){return useContext(AuthContext)}
