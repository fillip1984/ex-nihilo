import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaHourglassStart, FaSlidersH, FaSignOutAlt } from "react-icons/fa";

const Nav = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 flex h-16 items-center justify-between bg-slate-600 px-4 py-2">
      <Link href="/">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <FaHourglassStart />
          ex nihilo
        </h3>
      </Link>
      <AvatarAndMenu />
    </nav>
  );
};

const AvatarAndMenu = () => {
  const router = useRouter();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const { data: sessionData } = useSession();

  const menuItems = [
    { label: "Sign out", icon: <FaSignOutAlt />, action: () => void signOut() },
    {
      label: "Preferences",
      icon: <FaSlidersH />,
      action: () => void router.push("/preferences"),
    },
  ];

  const handleAvatarMenuToggle = () => {
    setAvatarMenuOpen((prev) => !prev);
  };

  return (
    <>
      <div
        id="avatar-button"
        className="cursor-pointer"
        onClick={handleAvatarMenuToggle}>
        {sessionData?.user.image && (
          <div className="relative">
            <Image
              src={sessionData?.user.image}
              width={200}
              height={200}
              alt="User profile image"
              className="h-14 w-14 rounded-full"
            />
            <div
              id="avatar-menu"
              className={`absolute right-0 top-16 z-[999] w-36 rounded bg-white/80 transition duration-300 ease-in-out ${
                avatarMenuOpen ? "" : "hidden"
              }`}>
              <div className="flex flex-col p-2">
                {menuItems.map((menuItem) => (
                  <button
                    type="button"
                    key={menuItem.label}
                    onClick={menuItem.action}
                    className="flex items-center gap-2 rounded p-2 text-slate-600 hover:bg-slate-400 hover:text-white">
                    {menuItem.icon}
                    {menuItem.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        id="avatar-backdrop"
        onClick={handleAvatarMenuToggle}
        className={`absolute bottom-0 left-0 right-0 top-0 z-[998] ${
          avatarMenuOpen ? "" : "hidden"
        }`}
      />
    </>
  );
};

export default Nav;
