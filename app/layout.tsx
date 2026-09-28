import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"Eazy 1000 — Mange mieux, sans te compliquer",description:"Recettes, courses intelligentes et livraison locale."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}