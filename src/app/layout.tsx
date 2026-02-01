import type { Metadata } from "next";
import "./globals.css";
// Importing Stellar Theme CSS
import "./stellar.css";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "LIHUI",
  description: "分享技术与生活",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.7.0/style.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono/index.css" />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <div className="main-container">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
