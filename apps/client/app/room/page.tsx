"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { ensureSocket } from "@/auth/socket";
import { IoSend } from "react-icons/io5";
import Message from "@/components/Message";
import { Message as MessageType } from "@/types/message";
import styles from "./room.module.css";

export default function Room() {
  const { accessToken } = useAuth();

  const [room, setRoom] = useState("1");
  const roomRef = useRef(room);
  roomRef.current = room;

  // ui state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "online" | "error"
  >("idle");

  // refs
  const socketRef = useRef<ReturnType<typeof ensureSocket> | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // auto-scroll to the last message
  const scrollToEnd = () =>
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // connect & subscribe
  useEffect(() => {
    if (!accessToken) return;

    setStatus("connecting");

    const sock = ensureSocket();
    if (!sock) {
      setStatus("error");
      return;
    }
    socketRef.current = sock;

    // logs/helpful events
    const onConnect = () => {
      setStatus("online");
      // (re)join the current room after connect
      sock.emit("join_room", roomRef.current);
    };
    const onConnectError = (err: any) => {
      console.error("[socket connect_error]", err?.message || err);
      setStatus("error");
    };

    // message fanout from server
    const onReceive = (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    };

    // one-time “who am I” (from server middleware)
    const onSession = (user: any) => {
      // optionally store user in your auth store if needed
      // console.log("session user:", user);
    };

    sock.on("connect", onConnect);
    sock.on("connect_error", onConnectError);
    sock.on("receive_message", onReceive);
    sock.on("session", onSession);

    // if already connected (e.g., hot reload), force join
    if (sock.connected) onConnect();

    return () => {
      sock.off("connect", onConnect);
      sock.off("connect_error", onConnectError);
      sock.off("receive_message", onReceive);
      sock.off("session", onSession);
    };
  }, [accessToken]); // re-run if token becomes available

  // scroll whenever a message arrives
  useEffect(() => {
    if (messages.length) scrollToEnd();
  }, [messages.length]);

  const sendMessage = () => {
    const sock = socketRef.current;
    const trimmed = message.trim();
    if (!sock || !trimmed) return;

    // emit minimal, trusted payload; server will attach user
    sock.emit("send_message", { room: roomRef.current, message: trimmed });

    // (optional) optimistic append — if you want to show immediately:
    // setMessages((prev) => [...prev, { message: trimmed, room: roomRef.current, user: { id: "me" }, createdAt: new Date().toISOString() } as MessageType]);

    // reset input
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSend = status === "online" && message.trim().length > 0;

  console.log(messages);

  return (
    <div className={`w-[50%] max-h-full flex flex-col ${styles.room} `}>
      {/* Header */}
      <div className="w-full h-[64px] flex items-center justify-between px-6 border-b border-[#282538]">
        <div className="flex items-center gap-3">
          <span className="text-[#bbb] text-sm">Room</span>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onBlur={() => {
              // rejoin on room change
              const sock = socketRef.current;
              if (!sock || status !== "online") return;
              sock.emit("join_room", roomRef.current);
            }}
            className="bg-transparent border border-[#282538] rounded-lg px-3 py-1 text-sm"
          />
        </div>
        <div
          className={`text-xs px-2 py-0.5 rounded ${
            status === "online"
              ? "bg-green-600/20 text-green-400"
              : status === "connecting"
              ? "bg-yellow-600/20 text-yellow-300"
              : status === "error"
              ? "bg-red-600/20 text-red-400"
              : "bg-zinc-700 text-zinc-300"
          }`}
        >
          {status}
        </div>
      </div>

      {/* Messages */}
      <div className="h-[calc(100%-138px)] relative overflow-auto px-5 py-4">
        <h1 className="text-center text-sm text-[#aaa] mb-3">Messages</h1>
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <Message key={i} message={m} />
          ))}
          <div ref={listEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="w-full px-6 py-4 flex gap-3">
        <input
          ref={inputRef}
          placeholder={
            status === "online" ? "Write a message..." : "Connecting..."
          }
          className={`w-full border border-[#282538] rounded-[10px] px-4 py-2 text-[#ececec] ${styles.messageInput}`}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend) sendMessage();
          }}
          disabled={status !== "online"}
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
  );
}
