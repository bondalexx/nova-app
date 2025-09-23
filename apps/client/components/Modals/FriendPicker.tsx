"use client";
import { useFriends } from "@/stores/friendsStore";

export default function FriendPicker({
  onPick,
  onClose,
}: {
  onPick: (peerId: string) => void;
  onClose: () => void;
}) {
  const { friends } = useFriends();
  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center">
      <div className="bg-[#1A1A1E] rounded-xl p-4 w-[360px]">
        <h3 className="text-white mb-3">Start a DM</h3>
        <div className="space-y-2 max-h-80 overflow-auto">
          {friends.accepted.map((f) => (
            <button
              key={f.id}
              onClick={() => onPick(f.id)}
              className="w-full text-left px-3 py-2 rounded hover:bg-[#222225] text-white"
            >
              {f.displayName}
            </button>
          ))}
        </div>
        <div className="mt-3 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#2b2a2a] text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
