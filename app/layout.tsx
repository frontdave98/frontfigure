import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { DialogHost } from "@/components/ui/DialogHost";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Frontfigure — Brick Figure Studio",
  description:
    "Build custom brick figures in the browser. No account, local save, glass parts, custom sizes, and export GLB — a game-like figure studio, not a print CAD.",
};

const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('ff-theme');
    if (t !== 'light' && t !== 'dark') t = 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${dmSans.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <DialogHost />
      </body>
    </html>
  );
}
