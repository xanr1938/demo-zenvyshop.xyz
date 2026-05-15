import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 number */}
        <div className="relative mb-6">
          <p className="text-[140px] font-extrabold text-slate-100 dark:text-slate-800 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-[#FCE9E9] dark:bg-[#d44242]/15 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#d44242]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          หน้านี้อาจถูกย้ายหรือลบออกไปแล้ว
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#d44242]/20 text-sm"
          >
            กลับหน้าแรก
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-2xl hover:border-[#d44242]/40 hover:text-[#d44242] transition-all text-sm"
          >
            ไปหน้า Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
