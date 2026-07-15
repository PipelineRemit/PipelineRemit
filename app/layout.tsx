import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PipelineRemit — Send money home with ease",
  description: "Send GBP from the UK directly to MTN or Telecel mobile money wallets in Ghana. In under 30 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body style={{ fontFamily: 'var(--font-figtree), "Figtree", sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
