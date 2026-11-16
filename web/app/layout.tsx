import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { SwRegister } from "@/components/sw-register";

export const metadata: Metadata = {
  title: { default: "Dharmic Data · Read the sacred texts", template: "%s · Dharmic Data" },
  description:
    "Read the Bhagavad Gita, Valmiki Ramayana, Ramcharitmanas, Mahabharata and the four Vedas in a fast, offline-friendly reader.",
  applicationName: "Dharmic Data",
  appleWebApp: { capable: true, title: "Dharmic Data", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#15110d" },
  ],
};

// Applies saved theme + font scale before first paint to avoid a flash.
const initScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('dd:theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;var s=localStorage.getItem('dd:scale');if(s)d.style.setProperty('--scale',s)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-dvh">
        <Header />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-10 text-center text-xs text-muted">
          <a className="underline" href="/about">
            About & credits
          </a>{" "}
          · Texts from the open DharmicData set (ODbL)
        </footer>
        <SwRegister />
      </body>
    </html>
  );
}
