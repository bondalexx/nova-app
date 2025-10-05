import AuthBootstrap from "./providers/AuthBootstrap";
import "./globals.css";
import { Nunito } from "next/font/google";

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
        className={` ${nunito.className} antialiased flex gap-[20px] bg-[#0D070F]  w-screen h-screen p-[15px] overflow-hidden `}
      >
        <AuthBootstrap>{children}</AuthBootstrap>
      </body>
    </html>
  );
}
