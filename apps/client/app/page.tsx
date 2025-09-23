"use client";
import { useAuth } from "@/stores/authStore";

import { redirect } from "next/navigation";

import styles from "@/styles/main.module.css";
import { useEffect } from "react";

export default function Home() {
  const { accessToken, user } = useAuth();
  useEffect(() => {
    redirect("/channels");
  }, []);
  return (
    <div className=" w-full h-full ">
      <div
        className={` w-full h-full flex  bg-black overflow-hidden ${styles.main} rounded-xl`}
      ></div>
    </div>
  );
}
