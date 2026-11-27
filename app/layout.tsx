import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "লটারি তথ্য — বাংলাদেশ", description: "বাংলাদেশের জন্য লটারি তথ্য ও ফলাফলের আর্কাইভ" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="bn"><body>{children}</body></html>; }
