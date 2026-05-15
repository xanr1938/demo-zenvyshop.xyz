const SERVICES = [
    { name: "Netflix", color: "#E50914", img: "https://gafiwshop.xyz/api/image/netflix.png" },
    { name: "YouTube", color: "#FF0000", img: "https://gafiwshop.xyz/api/image/yt.png" },
    { name: "Disney+", color: "#1138C8", img: "https://gafiwshop.xyz/api/image/Disney.png" },
    { name: "HBO Max", color: "#5B21B6", img: "https://gafiwshop.xyz/api/image/max.jpeg" },
    { name: "WeTV", color: "#15803D", img: "https://gafiwshop.xyz/api/image/wetv.png" },
    { name: "VIU", color: "#D97706", img: "https://gafiwshop.xyz/api/image/viu.png" },
    { name: "BiliBili", color: "#FB7299", img: "https://gafiwshop.xyz/api/image/bili.png" },
    { name: "iQIYI", color: "#00BE06", img: "https://gafiwshop.xyz/api/image/iq.png" },
    { name: "Prime Video", color: "#00A8E0", img: "https://gafiwshop.xyz/api/image/pv.png" },
    { name: "ChatGPT", color: "#10A37F", img: "https://gafiwshop.xyz/api/image/ChatGPT.png" },
    { name: "Canva Pro", color: "#7C3AED", img: "https://gafiwshop.xyz/api/image/canva.png" },
    { name: "Spotify", color: "#1DB954", img: "https://gafiwshop.xyz/api/image/spotify.png" },
];

function ServiceMarquee() {
    const doubled = [...SERVICES, ...SERVICES];
    return (
        <>
            <style>{`
                @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
            `}</style>
            <div className="overflow-hidden py-2">
                <div className="flex gap-4 animate-[marquee_25s_linear_infinite] w-max">
                    {doubled.map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex-shrink-0 shadow-sm">
                            <img src={s.img} alt={s.name} className="w-6 h-6 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ServiceMarquee