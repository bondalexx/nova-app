import AuthBootstrap from "./providers/AuthBootstrap";
import "./globals.css";
import { Nunito } from "next/font/google";
import { useAuth } from "@/stores/authStore";
import { useEffect } from "react";
import { getSocket } from "@/realtime/socket";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "400", "600", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${nunito.className} antialiased flex gap-[20px] bg-[#121214] w-screen h-screen p-[15px]`}
      >
        <AuthBootstrap>{children}</AuthBootstrap>
      </body>
    </html>
  );
}
