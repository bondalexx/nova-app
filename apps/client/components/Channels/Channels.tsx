"use client";
import { useEffect, useState } from "react";

import { LuMessageCirclePlus } from "react-icons/lu";
import { SlOptions } from "react-icons/sl";
import { FaUserFriends } from "react-icons/fa";
import { useRooms } from "@/stores/rooms";
import FriendPicker from "../Modals/FriendPicker";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/authStore";

import avatar from "@/public/avatar.png";
import Image from "next/image";

import styles from "@/styles/Channels.module.css";
import mainStyles from "@/styles/main.module.css";

const Channels = () => {
  const router = useRouter();
  const { rooms, status, error, load, select, selectedRoomId, openDM } =
    useRooms();
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  const onPickFriend = async (peerId: string) => {
    setShowPicker(false);
    await openDM(peerId); // ensures DM and selects it
  };

  useEffect(() => {
    load().catch(() => {});
  }, [load]);
  console.log(rooms);

  return (
    <div
      className={`h-full w-[300px] flex flex-col text-white overflow-auto ${mainStyles.scroll}`}
    >
      {showPicker && (
        <FriendPicker
          onPick={onPickFriend}
          onClose={() => setShowPicker(false)}
        />
      )}
      <header className="px-[10px] pt-[8px] pb-[9px] border-b border-b-[#222225] w-full">
        <button className="h-[32px] w-full bg-[#2b2a2a] outline-none hover:bg-[#333338] transition-all ease duration-300 text-white text-[14px] rounded-[10px] text-center cursor-pointer ">
          Find or start a conversation
        </button>
      </header>
      <section className="px-[6px] py-[10px] border-b border-b-[#222225]">
        <div
          onClick={() => router.push("/channels/my/")}
          className="flex items-center gap-[10px] py-[10px] pl-[10px] rounded-10px w-full bg-[#2C2C30] hover:bg-[#19191b] cursor-pointer h-[38px] text-[15px] rounded-[10px] transition-all ease duration-300"
        >
          <FaUserFriends fontSize={20} />
          <p>Friends</p>
        </div>
      </section>
      <section className="py-[10px] px-[6px] flex flex-col">
        <button
          onClick={() => setShowPicker(true)}
          className="h-[30px] bg-[#5865F2] hover:bg-[#4b56d1] active:bg-[#3e48af] transition-all ease duration-300 cursor-pointer rounded-[10px] text-[14px] flex items-center gap-[5px] justify-center"
        >
          <div>
            <LuMessageCirclePlus color="white" fontSize={18} />
          </div>{" "}
          <span>Create a PM</span>
        </button>
        <p className="text-[14px] mt-[8px] pl-[10px] text-[#82838B] hover:text-[white] cursor-default transition-all ease duration-300">
          Private message
        </p>
        <div className="flex flex-col w-full">
          {rooms.map((room) => {
            const other = room.members.find(
              (m) => m.user.id !== user?.id
            )?.user;

            return (
              <button
                key={room.id}
                className={`h-[48px] w-full hover:bg-[#222225] active:bg-[#3b3b3b] transition-all ease duration-300 cursor-pointer rounded-[10px] text-[14px] flex items-center justify-between px-[10px] ${styles.channel}`}
                onClick={() => {
                  select(room.id);
                  router.push(`/channels/my/${room.id}`);
                }}
              >
                <div className="flex items-center gap-[12px]">
                  <Image
                    src={other?.avatarUrl ?? avatar} // fallback to default
                    height={32}
                    width={32}
                    alt={other?.displayName ?? "avatar"}
                    className="rounded-[50%]"
                  />
                  <span>{other?.displayName ?? "Unknown"}</span>
                </div>
                <SlOptions
                  className={`text-[#B2B2B2] hover:text-white ${styles.options}`}
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Channels;
