"use client";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { AxiosError } from "axios";

import { sendFriendRequest } from "@/api/friends";
import { useAuth } from "@/stores/authStore";
import { useFriends } from "@/stores/friendsStore";
import { Filter } from "@/types/friends";

type FriendResponse =
  | { type: "success"; data: { status: string; username: string } }
  | { type: "error"; error: string }
  | null;

const AddFriends = ({
  setActiveFilter,
}: {
  setActiveFilter: Dispatch<SetStateAction<Filter>>;
}) => {
  const { accessToken } = useAuth();
  const { getFriends } = useFriends();
  const [search, setSearch] = useState("");
  const [response, setResponse] = useState<FriendResponse>(null);

  const searchForFriend = () => {
    if (!search.trim()) return;
    sendFriendRequest(search.trim())
      .then((res) => {
        setResponse({
          type: "success",
          data: { status: "OK", username: search },
        });
        getFriends();
        setActiveFilter("online");
      })
      .catch((err: AxiosError) => {
        setResponse({ type: "error", error: err.message });
      });
  };
  const handleEnterPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      searchForFriend();
    }
  };

  return (
    <div className="flex flex-col gap-[25px]">
      <div className="px-[20px] gap-[15px] flex flex-col">
        <div className="flex flex-col ">
          <h1 className="text-[20px] font-semibold">Add to firneds</h1>
          <p className="text-[14px] ">
            You can add friends by users nickname in Nova app
          </p>
        </div>
        <div className="relative w-full flex flex-col gap-[5px]">
          <input
            name="addFriend"
            type="text"
            placeholder="You can add friends by users nickname in Nova app"
            className={`w-full border ${
              response === null
                ? "border-[#282538] focus:border-[#302d44]"
                : response.type === "success"
                ? "border-[#43A25A] focus:border-[#43A25A]"
                : "border-[#DA3E44] focus:border-[#DA3E44]"
            } rounded-lg px-3 py-1 text-[16px] outline-none h-[54px] bg-[#18181C] pr-[50px] `}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setResponse(null);
            }}
            maxLength={37}
            onKeyDown={handleEnterPress}
          />
          <p
            className={`text-[14px] ${
              response === null
                ? "text-[#82838B] hidden"
                : response.type === "success"
                ? "text-[#43A25A]"
                : "text-[#DA3E44]"
            }`}
          >
            {response?.type === "error"
              ? "Something went wrong. Please check username you enter and try again."
              : `Success! You have sent a friend request to ${response?.data.username}`}
          </p>
          <button
            onClick={searchForFriend}
            className="w-[180px] text-center  transition-all ease duration-300 cursor-pointer rounded-[10px] h-[30px] absolute right-[10px] top-[12px] text-white text-[14px] bg-[#5865F2] hover:bg-[#4b56d1] active:bg-[#3e48af]"
          >
            Send friend request
          </button>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#29292D]"></div>
    </div>
  );
};

export default AddFriends;
