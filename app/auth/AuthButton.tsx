// app/components/auth/AuthButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button className="bg-gray-600 text-white font-medium py-2 px-4 rounded-full opacity-50">
        Loading...
      </button>
    );
  }

  return session ? (
    <div className="flex items-center gap-4">
      <span className="hidden sm:inline text-sm text-gray-300">
        Hello, {session.user?.name}
      </span>
      <form
        action={async () => {
          await signOut();
        }}
      >
        <button
          type="submit"
          className="bg-white text-charcoal hover:bg-gray-100 font-medium py-2 px-4 rounded-full transition"
        >
          Sign Out
        </button>
      </form>
    </div>
  ) : (
    <a
      href="/auth/signin"
      className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2 px-4 rounded-full transition flex items-center gap-2"
    >
      <DiscordIcon className="w-5 h-5" />
      Sign In with Discord
    </a>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472H4.46C3.104 24 2 22.896 2 21.528V2.472C2 1.104 3.104 0 4.46 0h15.08zm-4.632 15.672c.384.576.96.864 1.728.864.528 0 .96-.096 1.296-.384.336-.288.576-.672.72-1.152.144-.48.216-1.008.216-1.584 0-.576-.072-1.104-.216-1.584-.144-.48-.384-.864-.72-1.152-.336-.288-.768-.432-1.296-.432-.672 0-1.248.288-1.728.864l-.648.864c-.432.576-.768 1.2-1.008 1.872-.24.672-.36 1.368-.36 2.088 0 .72.12 1.416.36 2.088.24.672.576 1.296 1.008 1.872l.648.864zm-6.048-5.04c.192-.288.432-.528.72-.72.288-.192.6-.288.936-.288.336 0 .648.096.936.288.288.192.528.432.72.72l.648.864c.24.336.432.696.576 1.08.144.384.216.768.216 1.152 0 .384-.072.768-.216 1.152-.144.384-.336.744-.576 1.08l-.648.864c-.192.288-.432.528-.72.72-.288.192-.6.288-.936.288-.336 0-.648-.096-.936-.288-.288-.192-.528-.432-.72-.72l-.648-.864c-.24-.336-.432-.696-.576-1.08-.144-.384-.216-.768-.216-1.152 0-.384.072-.768.216-1.152.144-.384.336-.744.576-1.08l.648-.864z"
      />
    </svg>
  );
}