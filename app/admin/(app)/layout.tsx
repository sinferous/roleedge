import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Admin pages read the session on every request, so they are deliberately not instant.
export const instant = false;

async function Bar() {
  const admin = await requireAdmin();
  return (
    <div className="admin-bar">
      <div className="container">
        <Link className="brand" href="/admin/leads" aria-label="RoleEdge admin">
          {/* eslint-disable-next-line @next/next/no-img-element -- small logo */}
          <img src="/assets/roleedge-mark.png" width={47} height={24} alt="" />
          <span>
            Role<span className="brand-edge">Edge</span>
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <AdminNav />
        <form action={logout}>
          <button type="submit" title={admin.email}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <Suspense fallback={<div className="admin-bar" style={{ minHeight: 64 }} />}>
        <Bar />
      </Suspense>
      <main className="admin-main">
        <div className="container">
          <Suspense fallback={<p className="empty-state">Loading…</p>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
