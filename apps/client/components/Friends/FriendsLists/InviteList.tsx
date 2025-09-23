import { Filter, Friend } from "@/types/friends";
import Image from "next/image";

import { declineFriend, acceptFriendRequest } from "@/api/friends";
import { useAuth } from "@/stores/authStore";

import { IoIosClose, IoIosCheckmark } from "react-icons/io";

import avatar from "@/public/avatar.png";
import { useFriends } from "@/stores/friendsStore";
import { Dispatch, SetStateAction } from "react";

type ListType = "incoming" | "outgoing";

const InviteList = ({
  list,
  type,
  setActiveFilter,
}: {
  list: Friend[];
  type: ListType;
  setActiveFilter: Dispatch<SetStateAction<Filter>>;
}) => {
  const { accessToken, user } = useAuth();
  const { getFriends, friends } = useFriends();

  const handleAccept = ({ username }: { username: string }) => {
    acceptFriendRequest(username).then((res) => getFriends());
  };
  const handleDecline = (username: string) => {
    declineFriend(username).then((res) => getFriends());
  };
  return (
    <>
      {list.length > 0 ? (
        <div className="px-[20px] flex flex-col gap-[10px]">
          <p className=" text-[14px]">
            {type === "incoming" ? "Incoming" : "Outgoing"} Invites (
            {list.length})
          </p>
          {list.map((friend, i) => (
            <div
              key={friend.id}
              className="flex flex-col items-center h-[60px]"
            >
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
                <div className="flex">
                  {type === "incoming" && (
                    <IoIosCheckmark
                      fontSize={30}
                      className="mr-[10px] hover:text-[#43A25A] transition-all ease duration-300"
                      onClick={() =>
                        handleAccept({ username: friend.username })
                      }
                    />
                  )}
                  <IoIosClose
                    fontSize={30}
                    className="mr-[10px] hover:text-[#DA3E44] transition-all ease duration-300"
                    onClick={() => handleDecline(friend.username)}
                  />
                </div>
              </div>
              <div className="border-b border-b-[#29292D] h-[1px] w-[98.5%]"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className=" flex items-center justify-center text-[14px] mt-[8px] pl-[10px] text-[#82838B] hover:text-[white] cursor-default transition-all ease duration-300">
          <p>No invites</p>
        </div>
      )}
    </>
  );
};

export default InviteList;
