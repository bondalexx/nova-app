"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { ensureSocket } from "@/auth/socket";
import { IoSend } from "react-icons/io5";
import Message from "@/components/Message";
import { Message as MessageType } from "@/types/message";
import styles from "@/app/room/room.module.css";
import { useRooms } from "@/stores/rooms";
import { api } from "@/api/client/axios"; // axios instance

export default function RoomPage() {
  const { accessToken } = useAuth();
  const { selectedRoomId } = useRooms();

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
  const scrollToEnd = () =>
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 1) connect socket once
  useEffect(() => {
    if (!accessToken) return;
    setStatus("connecting");

    const sock = ensureSocket();
    console.log(sock); // should pass { auth: { token: accessToken } } under the hood
    if (!sock) {
      setStatus("error");
      return;
    }
    socketRef.current = sock;

    const onConnect = () => setStatus("online");
    const onConnectError = (err: any) => {
      console.error("[socket connect_error]", err?.message || err);
      setStatus("error");
    };
    const onReceive = (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
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
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    let canceled = false;

    // load first page
    (async () => {
      try {
        const res = await api.get(`/messages/${selectedRoomId}`, {
          params: { limit: 30 },
        });
        // server returns newest->oldest; show oldest->newest
        const list = (res.data.items as MessageType[]).slice().reverse();
        if (!canceled) setMessages(list);
        // join the room on socket
        const sock = socketRef.current;
        if (sock?.connected) {
          sock.emit("join_room", selectedRoomId);
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
  }, [selectedRoomId]);

  // 3) keep scrolled to bottom on new messages
  useEffect(() => {
    if (messages.length) scrollToEnd();
  }, [messages.length]);

  // 4) send via socket (persisted on server, ack returns saved message)
  const sendMessage = () => {
    const sock = socketRef.current;
    const trimmed = message.trim();
    if (!sock || !trimmed || !selectedRoomId) return;

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
      { room: selectedRoomId, message: trimmed },
      (saved: any) => {
        if (saved?.error) {
          console.error("[send_message ack error]", saved.error);
          return;
        }
        // If you didn’t do optimistic, append the acked saved message
        setMessages((prev) => [...prev, saved as MessageType]);
      }
    );

    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSend =
    status === "online" && !!selectedRoomId && message.trim().length > 0;

  if (!selectedRoomId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-zinc-400">Select a DM</p>
      </div>
    );
  }

  return (
    <div className={`w-[50%] max-h-full flex flex-col ${styles.room} `}>
      {/* Header */}
      <div className="w-full h-[64px] flex items-center justify-between px-6 border-b border-[#282538]">
        <div className="flex items-center gap-3">
          <span className="text-[#bbb] text-sm">Room</span>
          <input
            value={selectedRoomId}
            readOnly
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
