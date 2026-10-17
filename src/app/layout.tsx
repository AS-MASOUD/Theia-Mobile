import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BottomNav } from "@/components/mobile/bottom-nav";

export const metadata: Metadata = {
  title: "Theia PFC Mobile | مدیریت مالی تئا",
  description: "داشبورد لوکس مدیریت مالی شخصی تئا برای موبایل",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Theia PFC",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0D0E10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#0D0E10] text-[#E8E8E8] min-h-dvh antialiased selection:bg-[#F0AE55]/20 selection:text-[#F0AE55]"
      >
        <Providers>
          <div className="max-w-md mx-auto min-h-dvh flex flex-col relative px-4 pt-4 pb-28">
            <main className="flex-1">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
