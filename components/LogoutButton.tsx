"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="btn-secondary w-full"
      type="button"
    >
      Logout
    </button>
  );
}