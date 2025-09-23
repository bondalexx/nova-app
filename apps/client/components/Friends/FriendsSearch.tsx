"use client";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";

import styles from "@/styles/FriendsList.module.css";
import { useState } from "react";

const FriendsSearch = () => {
  const [search, setSearch] = useState("");
  const onSearch = () => {
    if (search.length > 0) {
    }
  };
  return (
    <div className="relative w-full px-[20px]">
      {search.length > 0 ? (
        <div className="absolute top-[8px] right-[33px]">
          <IoIosClose
            color="#bdbdbd"
            fontSize={24}
            style={{ cursor: "pointer" }}
            onClick={() => setSearch("")}
          />
        </div>
      ) : (
        <div className="absolute top-[10px] right-[33px]">
          <CiSearch
            color="#bdbdbd"
            fontSize={20}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}

      <input
        name="search"
        type="text"
        placeholder="Search"
        className={`w-full border border-[#282538] rounded-lg px-3 py-1 text-sm  ${styles.messageInput} h-[40px] bg-[#18181C] pr-[50px] `}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default FriendsSearch;
