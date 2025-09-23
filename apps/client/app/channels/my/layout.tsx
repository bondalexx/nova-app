import Channels from "@/components/Channels/Channels";

export default function ChannelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`flex w-full h-full border border-[#222225] rounded-[12px]`}
    >
      <Channels />
      {children}
    </div>
  );
}
