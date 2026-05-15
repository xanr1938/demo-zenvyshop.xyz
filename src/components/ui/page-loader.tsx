"use client";

export default function PageLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />

                <h1 className="text-xl font-semibold">
                    Loading ZenvyShop...
                </h1>
            </div>
        </div>
    );
}