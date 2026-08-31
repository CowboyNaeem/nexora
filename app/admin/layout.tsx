import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { verifySession } from "@/lib/auth";

import AdminSidebar from "./AdminSidebar";
import AdminMobileShell from "./components/AdminMobileShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexora_session")?.value;

  // No session → send user to login
  if (!token) {
    redirect("/login?redirect=/admin");
  }

  // Invalid / expired session → send user to login
  const session = await verifySession(token);

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  // Only ADMIN users can access the admin area
  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      <div className="flex min-h-screen">
        {/* =====================================================
            DESKTOP SIDEBAR
            Visible only on large screens.
            ===================================================== */}
        <AdminSidebar />

        {/* =====================================================
            MAIN ADMIN AREA
            ===================================================== */}
        <main className="min-w-0 flex-1">
          {/* ===================================================
              MOBILE SHELL

              Contains:
              - Mobile header
              - Mobile drawer
              - Global bottom navigation
              =================================================== */}
          <AdminMobileShell />

          {/* ===================================================
              PAGE CONTENT

              Extra bottom padding is applied only on mobile
              so the fixed bottom navigation never covers content.

              Desktop receives no extra padding.
              =================================================== */}
          <div className="pb-24 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}