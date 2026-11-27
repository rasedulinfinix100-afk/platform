import type { Metadata } from "next";
import "./globals.css";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { LanguageProvider } from "@/components/LanguageProvider";
export const metadata: Metadata = { title: "Lotto", description: "Lottery information and account portal" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><LanguageProvider><LoadingOverlay />{children}</LanguageProvider></body></html>; }
