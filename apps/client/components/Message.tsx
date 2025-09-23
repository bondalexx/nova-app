import { Message as MessageTypeAlias } from "@/types/message";
import Image from "next/image";
import avatar from "@/public/avatar.png";
import { useAuth } from "@/stores/authStore";
import User from "@/types/user";
const Message = ({ message }: { message: MessageTypeAlias }) => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div
      className={`w-full flex ${
        user.id === message.user.id ? "justify-end" : "justify-start"
      } `}
    >
      {user.id === message.user.id ? (
        <SentMessage message={message} user={user} />
      ) : (
        <RecievedMessage message={message} user={user} />
      )}
    </div>
  );
};

export default Message;

export const SentMessage = ({
  message,
  user,
}: {
  message: MessageTypeAlias;
  user: User;
}) => {
  return (
    <div className="max-w-[350px] relative pr-[50px]">
      <div className="flex flex-col max-w-[calc(100%-50px)] items-start">
        <span
          className={`px-[25px] py-[10px] rounded-[20px] leading-[30px] inline-block w-auto ${
            user.id === message.user.id
              ? "bg-[#4E38A2] text-white"
              : "bg-[#19182B] text-[#9D9CAF]"
          } `}
        >
          {message.message}
        </span>
      </div>
      <Image
        src={avatar}
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-[50%] absolute top-0 right-0"
      />
    </div>
  );
};

export const RecievedMessage = ({
  message,
  user,
}: {
  message: MessageTypeAlias;
  user: User;
}) => {
  return (
    <div className="max-w-[350px] relative pl-[50px]">
      <Image
        src={avatar}
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-[50%] absolute top-0 left-0"
      />
      <div className="flex flex-col max-w-[calc(100%-50px)] items-start">
        <span className="text-[12px] text-[#9D9CAF]">
          {message.user.displayName}
        </span>
        <span
          className={`px-[25px] py-[10px]  rounded-[20px] leading-[30px] inline-block w-auto ${
            user.id === message.user.id
              ? "bg-[#4E38A2] text-white"
              : "bg-[#19182B] text-[#9D9CAF]"
          } `}
        >
          {message.message}
        </span>
      </div>
    </div>
  );
};
