"use client";
import { useState } from "react";
import AddFriendModal from "./AddFriendModal";
import FriendsList from "./FriendsList";

const FriendSection = () => {
  const [addFriend, setAddFriend] = useState(false);

  return (
    <div className="w-[30%] h-full p-[15px] border-r border-[#282538]">
      {addFriend ? (
        <AddFriendModal />
      ) : (
        <FriendsList setAddFriend={setAddFriend} />
      )}
    </div>
  );
};

export default FriendSection;
