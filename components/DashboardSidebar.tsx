"use client";

import Link from "next/link";
import { MapPinned, Menu, Plane, Wallet, X } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { useState } from "react";

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="card h-fit w-full p-4 md:sticky md:top-4 md:w-64">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-brand/10 p-2 text-brand"><Plane size={18} /></div>
          <div>
            <p className="text-sm font-semibold">TripCentral</p>
            <p className="text-xs text-slate-500">Travel Workspace</p>
          </div>
        </div>
        <button type="button" className="btn-secondary px-2 py-2 md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} space-y-4 md:block`}>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
            <Wallet size={16} /> Trips
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
            <MapPinned size={16} /> Planner
          </Link>
        </nav>

        <LogoutButton />
      </div>
    </aside>
  );
}