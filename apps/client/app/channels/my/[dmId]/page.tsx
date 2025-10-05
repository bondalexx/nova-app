"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ensureSocket } from "@/auth/socket";
import { useAuth } from "@/stores/authStore";
import { useRooms } from "@/stores/rooms";

import { api } from "@/api/client/axios";

import { IoSend } from "react-icons/io5";
import Message from "@/components/Message";

import { Message as MessageType } from "@/types/message";
import { MessageDTO } from "@/types/message.dto";

import { toClientMessage } from "@/helpers/messages";

import avatar from "@/public/avatar.png";
import styles from "@/app/room/room.module.css";
import Image from "next/image";

export default function RoomPage() {
  const params = useParams();
  const dmId = params.dmId;
  const { accessToken } = useAuth();
  const { user } = useAuth();

  const { rooms, selectedRoomId, status } = useRooms();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [connectedStatus, setConnectedStatus] = useState<
    "idle" | "connecting" | "online" | "error"
  >("idle");

  // refs
  const socketRef = useRef<ReturnType<typeof ensureSocket> | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollToEnd = () =>
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const room = useMemo(() => rooms.find((r) => r.id === dmId), [rooms, dmId]);

  const peer = useMemo(() => {
    if (!room) return null;
    // if your API already added room.otherUser, prefer it:
    // return (room as any).otherUser ?? room.members.find(m => m.user.id !== user?.id)?.user ?? null;
    const fromMembers =
      room.members?.find((m) => m.user.id !== user?.id)?.user ?? null;
    return (room as any).otherUser ?? fromMembers;
  }, [room, user?.id]);

  // 1) connect socket once
  useEffect(() => {
    if (!accessToken) return;
    setConnectedStatus("connecting");

    const sock = ensureSocket();
    console.log(sock); // should pass { auth: { token: accessToken } } under the hood
    if (!sock) {
      setConnectedStatus("error");
      return;
    }
    socketRef.current = sock;

    const onConnect = () => setConnectedStatus("online");
    const onConnectError = (err: any) => {
      console.error("[socket connect_error]", err?.message || err);
      setConnectedStatus("error");
    };
    const onReceive = (data: MessageDTO) => {
      setMessages((prev) => [...prev, toClientMessage(data)]);
    };
    sock.on("connect", onConnect);
    sock.on("connect_error", onConnectError);
    sock.on("message:new", onReceive);

    if (sock.connected) onConnect();

    return () => {
      sock.off("connect", onConnect);
      sock.off("connect_error", onConnectError);
      sock.off("message:new", onReceive);
    };
  }, [accessToken]);

  // 2) whenever room changes: load history and join room
  useEffect(() => {
    if (!dmId) {
      setMessages([]);
      return;
    }

    let canceled = false;

    // load first page
    (async () => {
      try {
        const res = await api.get(`/messages/${dmId}`, {
          params: { limit: 30 },
        });
        // server returns newest->oldest; show oldest->newest
        const list = (res.data.items as MessageDTO[])
          .map(toClientMessage)
          .reverse();
        setMessages(list);
        // join the room on socket
        const sock = socketRef.current;
        if (sock?.connected) {
          sock.emit("join_room", dmId);
        } else {
          // when socket connects later, it will still be on the latest selectedRoomId
        }
      } catch (e) {
        console.error("[history load]", e);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [dmId]);

  // 3) keep scrolled to bottom on new messages
  useEffect(() => {
    if (messages.length) scrollToEnd();
  }, [messages.length]);

  // 4) send via socket (persisted on server, ack returns saved message)
  const sendMessage = () => {
    const sock = socketRef.current;
    const trimmed = message.trim();
    if (!sock || !trimmed || !dmId) return;

    // Optimistic append (optional, uncomment if you want immediate UI)
    // const optimistic: MessageType = {
    //   id: `tmp-${Date.now()}`,
    //   roomId: selectedRoomId,
    //   senderId: "me",
    //   content: trimmed,
    //   createdAt: new Date().toISOString(),
    // };
    // setMessages((prev) => [...prev, optimistic]);

    sock.emit(
      "send_message",
      { room: String(dmId), message: trimmed },
      (saved: MessageDTO | { error: string }) => {
        if ((saved as any)?.error) {
          /* handle */ return;
        }
      }
    );

    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSend =
    connectedStatus === "online" && !!dmId && message.trim().length > 0;
  return (
    <div className="flex w-[calc(100%-300px)]">
      <div
        className={`w-[calc(100%-340px)] max-h-full flex flex-col ${styles.room} bg-[#0E0D15]`}
      >
        {/* Header */}
        <div className="w-full h-[50px] flex items-center justify-between px-4 border-b border-[#222225]">
          <div className="flex items-center gap-3">
            <Image
              src={peer?.avatarUrl ?? avatar}
              alt={peer?.displayName ?? "avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-white font-medium text-[15px] leading-tight">
                {peer?.displayName ?? "Direct Message"}
              </span>
              {/* optional subtitle: last seen / username / etc */}
              {/* <span className="text-xs text-[#82838B]">@{peer?.username}</span> */}
            </div>
          </div>

          <div
            className={`text-xs px-2 py-0.5 rounded ${
              connectedStatus === "online"
                ? "bg-green-600/20 text-green-400"
                : connectedStatus === "connecting"
                ? "bg-yellow-600/20 text-yellow-300"
                : connectedStatus === "error"
                ? "bg-red-600/20 text-red-400"
                : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {connectedStatus}
          </div>
        </div>

        {/* Messages */}
        <div
          className={`h-[calc(100%-138px)] relative overflow-auto px-5 py-4 ${styles.scroll} `}
        >
          <h1 className="text-center text-sm text-[#aaa] mb-3">Messages</h1>
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            <div ref={listEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="w-full px-6 py-4 flex gap-3">
          <input
            ref={inputRef}
            placeholder={
              connectedStatus === "online"
                ? "Write a message..."
                : "Connecting..."
            }
            className={`w-full border border-[#282538] rounded-[10px] px-4 py-2 text-[#ececec] ${styles.messageInput}`}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) sendMessage();
            }}
            disabled={connectedStatus !== "online"}
          />
          <button
            className={`cursor-pointer px-3 py-2 ${
              canSend ? "opacity-100" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={sendMessage}
            disabled={!canSend}
            aria-label="Send"
            title="Send"
          >
            <IoSend color="#ffffff" />
          </button>
        </div>
      </div>
      <div className="w-[340px] h-full bg-[#12111B]"></div>
    </div>
  );
}
