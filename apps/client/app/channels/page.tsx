"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
const Channels = () => {
  useEffect(() => {
    redirect("/channels/my");
  }, []);
  return <div></div>;
};
export default Channels;
