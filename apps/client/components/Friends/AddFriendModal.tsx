"use client";
import { useState } from "react";

import styles from "@/styles/FriendsList.module.css";

const AddFriendModal = () => {
  const [search, setSearch] = useState<string>("");
  return (
    <>
      <h1>Add friends</h1>
      <p>You can add friend by nickname</p>
      <div className="relative w-full">
        <input
          name="search"
          type="text"
          placeholder="Search"
          className={`w-full border border-[#282538] rounded-lg px-3 py-1 text-sm  ${styles.messageInput} h-[40px] bg-[#18181C] `}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </>
  );
};

export default AddFriendModal;
