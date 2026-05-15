"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@appwrite/database";
import { uploadAvatar, getAvatarUrl, deleteAvatar } from "@appwrite/storage";
import { account } from "@appwrite/appwrite";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
    } else if (user) {
      setName(user.name ?? "");
    }
  }, [profile, user]);

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError("");
    try {
      if (profile?.avatar) {
        await deleteAvatar(profile.avatar).catch(() => { });
      }
      const uploaded = await uploadAvatar(file);
      await updateProfile(user.$id, { avatar: uploaded.$id });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await Promise.all([
        account.updateName(name.trim()),
        updateProfile(user.$id, { name: name.trim(), phone: phone.trim() }),
      ]);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#d44242] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const avatarUrl = profile?.avatar ? getAvatarUrl(profile.avatar, 200) : null;
  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">โปรไฟล์</span>
        </nav>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">โปรไฟล์ของฉัน</h1>

        {/* Avatar section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-8 mb-6">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-6">รูปโปรไฟล์</h2>
          <div className="flex items-center gap-6">
            {/* Avatar circle */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800">
                {uploading ? (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#d44242] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FCE9E9] flex items-center justify-center text-3xl font-extrabold text-[#d44242]">
                    {initials}
                  </div>
                )}
              </div>
              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#d44242] hover:bg-[#E87A7A] text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-60"
                aria-label="เปลี่ยนรูปโปรไฟล์"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">{user.name || "ไม่ได้ตั้งชื่อ"}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">{user.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/40 hover:text-[#d44242] transition-all disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">JPG, PNG, WebP สูงสุด 2 MB</p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-8">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-6">ข้อมูลส่วนตัว</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-[#FCE9E9] dark:bg-[#d44242]/15 border border-[#d44242]/20 text-[#d44242] text-sm rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
              ✓ บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ชื่อ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed"
              />
            </div>
            {/* <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0XX-XXX-XXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div> */}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full py-3.5 bg-[#d44242] hover:bg-[#E87A7A] disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-md shadow-[#d44242]/20 text-sm"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
