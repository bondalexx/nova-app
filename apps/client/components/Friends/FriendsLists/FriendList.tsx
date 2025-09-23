import { Filter, Friend } from "@/types/friends";
import Image from "next/image";

import { declineFriend, acceptFriendRequest } from "@/api/friends";
import { useAuth } from "@/stores/authStore";

import { TbMessageCircleFilled } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";

import avatar from "@/public/avatar.png";
import { useFriends } from "@/stores/friendsStore";
import { Dispatch, SetStateAction } from "react";

type ListType = "online" | "all";

const FriendList = ({ list, type }: { list: Friend[]; type: ListType }) => {
  const { accessToken, user } = useAuth();
  const { getFriends, friends } = useFriends();

  return (
    <div className="px-[20px] flex flex-col gap-[10px]">
      <p className=" text-[14px]">
        {type === "online" ? "Online" : "All Friends"} - {list.length}
      </p>
      {list.map((friend) => (
        <div key={friend.id} className="flex flex-col items-center h-[60px]">
          <div className="border-t border-t-[#29292D] w-[98.5%] h-[1px]"></div>
          <div
            className={` w-full h-full px-[8px] hover:bg-[#242428] transition-all ease duration-300 cursor-pointer py-[8px] rounded-[10px] flex items-center justify-between `}
          >
            <div className="flex items-center gap-[10px]">
              <Image src={avatar} width={40} height={40} alt="avatar" />
              <div className="flex flex-col">
                <span className=" text-[16px] font-semibold">
                  {friend.displayName}
                </span>
                <span className=" text-[14px] text-[#82838B]">
                  {friend.username}
                </span>
              </div>
            </div>
            <div className="flex gap-[10px]">
              <TbMessageCircleFilled
                fontSize={22}
                className="mr-[10px] hover:text-[white] text-[#AAAAB1] transition-all ease duration-300"
              />
              <BsThreeDotsVertical
                fontSize={22}
                className="mr-[10px] hover:text-[white] text-[#AAAAB1] transition-all ease duration-300"
              />
            </div>
          </div>
          <div className="border-b border-b-[#29292D] h-[1px] w-[98.5%]"></div>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
