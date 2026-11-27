"use client";
import Link from "next/link";import {useAuth} from "./AuthProvider";import {PremiumIcon} from "./PremiumIcon";
export function ProfileFooterLink(){const {isAuthenticated}=useAuth();return <Link href={isAuthenticated?"/m/UserProfiles/":"/Client/Auth/Login/"} aria-label={isAuthenticated?"Profile":"Login"}><PremiumIcon name={isAuthenticated?"profile":"logout"} size={25}/><span>{isAuthenticated?"Profile":"Login"}</span></Link>}
