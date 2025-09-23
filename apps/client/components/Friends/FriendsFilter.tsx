import { Dispatch, SetStateAction, useState } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { LuMessageCirclePlus } from "react-icons/lu";
import { useFriends } from "@/stores/friendsStore";
import { Filter } from "@/types/friends";

const FriendsFilter = ({
  setAddFriend,
  addFriend,
  activeFilter,
  setActiveFilter,
}: {
  setAddFriend: Dispatch<SetStateAction<boolean>>;
  addFriend: boolean;
  activeFilter: Filter;
  setActiveFilter: Dispatch<SetStateAction<Filter>>;
}) => {
  const { friends } = useFriends();
  return (
    <div className="flex h-[50px] items-center border-b border-b-[#222225] px-[20px] justify-between ">
      <div className="flex items-center gap-[8px]">
        <div className="flex items-center gap-[10px]">
          <FaUserFriends fontSize={24} color="#82838B" />
          <p className="font-medium text-[16px] cursor-default">Firends</p>{" "}
        </div>
        <div className="rounded-[50%] bg-[#333338] w-[4px] h-[4px] "></div>
        <div className="flex items-center gap-[16px]">
          <p
            className={`font-medium text-[16px] py-[4px] px-[16px] text-[#82838B] hover:text-white rounded-[10px] transition-all ease duration-300  ${
              activeFilter === "online"
                ? "bg-[#333338] text-[white] cursor-default"
                : "cursor-pointer"
            }`}
            onClick={() => {
              setActiveFilter("online");
              setAddFriend(false);
            }}
          >
            Online
          </p>{" "}
          <p
            className={`font-medium text-[16px] py-[4px] px-[16px] text-[#82838B] hover:text-white rounded-[10px] transition-all ease duration-300  ${
              activeFilter === "all"
                ? "bg-[#333338] text-[white] cursor-default"
                : "cursor-pointer"
            } hover:bg-[##2c2c30`}
            onClick={() => {
              setActiveFilter("all");
              setAddFriend(false);
            }}
          >
            All
          </p>{" "}
          {friends.pendingIncoming.length > 0 && (
            <p
              className={`font-medium text-[16px] py-[4px] px-[16px] text-[#82838B] hover:text-white rounded-[10px] transition-all ease duration-300  ${
                activeFilter === "received"
                  ? "bg-[#333338] text-[white] cursor-default"
                  : "cursor-pointer"
              }`}
              onClick={() => {
                setActiveFilter("received");
                setAddFriend(false);
              }}
            >
              Received
            </p>
          )}
          {friends.pendingOutgoing.length > 0 && (
            <p
              className={`font-medium text-[16px] py-[4px] px-[16px] text-[#82838B] hover:text-white rounded-[10px] transition-all ease duration-300  ${
                activeFilter === "sent"
                  ? "bg-[#333338] text-[white] cursor-default"
                  : "cursor-pointer"
              }`}
              onClick={() => {
                setActiveFilter("sent");
                setAddFriend(false);
              }}
            >
              Waiting
            </p>
          )}
          <p
            onClick={() => {
              setAddFriend(true);
              setActiveFilter("none");
            }}
            className={`text-[16px] py-[4px] px-[16px]  rounded-[10px] transition-all ease duration-300 cursor-pointer  font-semibold ${
              addFriend
                ? " bg-[#242640] text-[#7385E9] active:bg-[#2d2f50]"
                : "bg-[#5865F2] hover:bg-[#4b56d1] active:bg-[#3e48af] text-[white] "
            }`}
          >
            Add to friends
          </p>
        </div>
      </div>

      <LuMessageCirclePlus
        color="white"
        fontSize={24}
        onClick={() => setAddFriend(true)}
        cursor={"pointer"}
      />
    </div>
  );
};

export default FriendsFilter;
