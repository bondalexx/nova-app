"use client";
import { useEffect, useState } from "react";

import { useAuth } from "@/stores/authStore";
import { useFriends } from "@/stores/friendsStore";

import { Friend, Filter } from "@/types/friends";

import FriendsSearch from "@/components/Friends/FriendsSearch";
import FriendsFilter from "@/components/Friends/FriendsFilter";
import AddFriends from "@/components/Modals/AddFriends";
import InviteList from "@/components/Friends/FriendsLists/InviteList";
import FriendList from "@/components/Friends/FriendsLists/FriendList";

const My = () => {
  const { accessToken, user } = useAuth();
  const { getFriends, friends } = useFriends();

  const [addFriend, setAddFriend] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("online");

  // read lists directly from the store
  const { accepted, pendingIncoming, pendingOutgoing } = friends;

  useEffect(() => {
    if (accessToken && user) {
      // fire and forget; store handles errors/status internally
      getFriends().catch(() => {});
    }
  }, [accessToken, user, getFriends]);

  return (
    <div className="w-[calc(100%-300px)] h-full text-[white] bg-[#0E0D15] flex flex-col gap-[20px] rounded-r-[11px]">
      <div className=" flex flex-col gap-[10px]">
        <FriendsFilter
          setAddFriend={setAddFriend}
          addFriend={addFriend}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        {addFriend ? (
          <AddFriends setActiveFilter={setActiveFilter} />
        ) : (
          <FriendsSearch />
        )}
      </div>

      {activeFilter === "online" && (
        <FriendList list={accepted} type="online" />
      )}

      {activeFilter === "all" && <FriendList list={accepted} type="all" />}

      {activeFilter === "sent" && (
        <InviteList
          list={pendingOutgoing}
          type="outgoing"
          setActiveFilter={setActiveFilter}
        />
      )}

      {activeFilter === "received" && (
        <InviteList
          list={pendingIncoming}
          type="incoming"
          setActiveFilter={setActiveFilter}
        />
      )}
    </div>
  );
};

export default My;
