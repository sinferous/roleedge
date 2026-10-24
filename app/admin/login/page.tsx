import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <div className="form-card">
        {/* eslint-disable-next-line @next/next/no-img-element -- small logo */}
        <img src="/assets/roleedge-mark.png" width={70} height={36} alt="RoleEdge" />
        <h1>Admin sign in</h1>
        <p style={{ marginBottom: 22 }}>For the RoleEdge team only.</p>
        <LoginForm />
      </div>
    </main>
  );
}
