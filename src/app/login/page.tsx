"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppwriteException } from "appwrite";
import { useAuth } from "@/context/AuthContext";

function friendlyError(err: unknown): string {
  const type = err instanceof AppwriteException ? err.type : "";
  const msg  = err instanceof Error ? err.message : String(err);

  if (type === "user_invalid_credentials" || msg.includes("Invalid credentials") || msg.includes("invalid_credentials"))
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (type === "user_not_found" || msg.includes("user_not_found"))
    return "ไม่พบบัญชีนี้ในระบบ";
  if (type === "user_blocked")
    return "บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ";
  if (type === "general_rate_limit_exceeded" || msg.includes("rate limit") || msg.includes("too_many"))
    return "ลองใหม่อีกครั้งในภายหลัง (ทำรายการบ่อยเกินไป)";
  if (type === "user_session_already_exists" || msg.includes("session is active") || msg.includes("prohibited"))
    return "คุณเข้าสู่ระบบอยู่แล้ว";

  if (process.env.NODE_ENV === "development") console.error("[login error]", err);
  return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rawError, setRawError] = useState("");
  const [loading, setLoading] = useState(false);

  // ถ้า login อยู่แล้ว → redirect ไปหน้าแรก
  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(friendlyError(err));
      const e = err as AppwriteException;
      setRawError(`type: ${e?.type ?? "?"} | code: ${e?.code ?? "?"} | msg: ${e?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Zenvy<span className="text-[#d44242]">Shop</span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          {error && (
            <div className="px-4 py-3 bg-[#FCE9E9] dark:bg-[#d44242]/15 border border-[#d44242]/20 text-[#d44242] text-sm rounded-xl">
              {error}
              {rawError && <div className="mt-1 text-xs opacity-70 break-all">[debug] {rawError}</div>}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#d44242] hover:bg-[#E87A7A] disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md shadow-[#d44242]/20 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          No account?{" "}
          <Link href="/register" className="text-[#d44242] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
