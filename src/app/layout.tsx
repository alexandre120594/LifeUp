import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeUp",
  description: "Produtividade pessoal em um unico lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
  (function() {
    const savedMode = localStorage.getItem('app-display-mode');
    const displayMode = savedMode === 'dark' || savedMode === 'night' ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', displayMode === 'dark');
    root.dataset.theme = displayMode;
    root.style.colorScheme = displayMode;
  })()
`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
