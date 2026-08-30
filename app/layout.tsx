import type { Metadata } from "next";
import { ReactLenis } from "lenis/react";
import { geistSans, geistPixel, ibmPlexMono, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZEROFUNCTION",
  description: "Portfolio of ZEROFUNCTION — designer and developer based in Kuwait.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${geistPixel.variable} ${ibmPlexMono.variable} min-h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactLenis root>{children}</ReactLenis>
      </body>
    </html>
  );
}
