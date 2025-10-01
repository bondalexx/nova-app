import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthBootstrap from "@/app/providers/AuthBootstrap";
import AsideNav from "@/components/Aside/AsideNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova",
  description: "Use Nova to chat with your friends",
};

export default function ChannelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={` antialiased flex gap-[20px] w-full h-full`}>
      <AsideNav />
      <AuthBootstrap>{children}</AuthBootstrap>
    </div>
  );
}
