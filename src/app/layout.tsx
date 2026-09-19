import "./globals.css";

import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Vanij App Studio",
  description:
    "AI-powered app studio template with polished UI components and modern Next.js setup.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={cn("min-h-screen bg-background")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;


