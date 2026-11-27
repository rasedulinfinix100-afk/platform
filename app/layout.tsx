import type { Metadata } from "next";
import "./globals.css";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
export const metadata: Metadata = { title: "Lotto", description: "Lottery information and account portal" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><LanguageProvider><AuthProvider><LoadingOverlay />{children}</AuthProvider></LanguageProvider></body></html>; }
