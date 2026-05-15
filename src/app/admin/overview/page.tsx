"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminPage() {
    const [enabled, setEnabled] = useState(false);

    const fetchStatus = async () => {
        const res = await fetch("/api/maintenance");
        const data = await res.json();
        setEnabled(data.enabled);
    };

    const toggle = async () => {
        const res = await adminFetch("/api/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: !enabled }),
        });

        const data = await res.json();
        setEnabled(data.enabled);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-xl font-bold">
                Admin Control
            </h1>

            <p>
                Status: {enabled ? "ON" : "OFF"}
            </p>

            <button
                onClick={toggle}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Toggle Maintenance
            </button>
        </div>
    );
}