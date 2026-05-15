export default async function MaintenancePage() {
  let data = {
    enabled: false,
    type: "server",
  };

  try {
    const res = await fetch("http://localhost:3000/api/maintenance", {
      cache: "no-store",
    });

    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.error("Maintenance fetch error:", err);
  }

  const messageMap: Record<string, string> = {
    server: "กำลังปรับปรุงเซิร์ฟเวอร์",
    migrate: "กำลังย้ายเครื่องเซิร์ฟเวอร์",
    database: "กำลังย้ายฐานข้อมูล",
  };

  const message = messageMap[data.type] ?? "กำลังปรับปรุงระบบ";

  // ❌ ถ้าไม่ได้เปิด maintenance → ไม่ต้องโชว์หน้านี้
  if (!data.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-600 text-white">
        <h1>ระบบปกติ</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">

        {/* icon ธรรมดา (ไม่ animate) */}
        <div className="w-24 h-24 rounded-3xl bg-[#d44242]/10 border border-[#d44242]/20 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-[#d44242]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3">
          {message}
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          ขออภัยในความไม่สะดวก ใช้เวลาใน{message} ประมาณ 1-2 ชั่วโมง
          <br />
          เว็บไซต์จะกลับมาให้บริการในเร็วๆ นี้
        </p>

        {/* จุด loading แบบนิ่ง */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d44242]" />
          <div className="w-2 h-2 rounded-full bg-[#d44242]" />
          <div className="w-2 h-2 rounded-full bg-[#d44242]" />
        </div>

        <p className="text-slate-600 text-xs mt-8">
          ZenvyShop — ขอบคุณที่รอคอย
        </p>

      </div>
    </div>
  );
}