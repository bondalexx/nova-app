"use client";
import Image from "next/image";
import { redirect } from "next/navigation";

import { IoExitOutline } from "react-icons/io5";

import logo from "@/public/logo.png";

const AsideNav = () => {
  const handleLogout = () => {
    // Implement logout functionality here
    // For example, clear auth tokens, redirect to login page, etc.
    redirect("/logout");
  };

  return (
    <aside className="flex flex-col  items-center justify-between">
      <div className="flex flex-col items-center gap-[10px] ">
        <div
          onClick={() => redirect("/channels/my")}
          className="w-[40px] h-[40px] flex justify-center items-center rounded-[10px] cursor-pointer  bg-[#090913] "
        >
          <Image
            src={logo}
            height={40}
            width={40}
            alt={"logo"}
            className="hover:scale-110 transition-all ease duration-300"
          />
        </div>
        <div className="w-[32px] h-[1px] bg-[#222225] "></div>
      </div>
      <IoExitOutline
        onClick={handleLogout}
        fontSize={30}
        className="hover:text-[#DA3E44] transition-all ease duration-300 text-white cursor-pointer mb-[3px]"
      />
    </aside>
  );
};

export default AsideNav;
