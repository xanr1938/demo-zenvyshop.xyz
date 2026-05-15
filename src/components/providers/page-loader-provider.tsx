"use client";

import { createContext, useContext, useState } from "react";
import PageLoader from "@/components/ui/page-loader";

type LoaderContextType = {
    showLoader: () => void;
    hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export function PageLoaderProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(false);

    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    return (
        <LoaderContext.Provider value={{ showLoader, hideLoader }}>
            {loading && <PageLoader />}
            {children}
        </LoaderContext.Provider>
    );
}

export function usePageLoader() {
    const context = useContext(LoaderContext);

    if (!context) {
        throw new Error("usePageLoader must be used inside PageLoaderProvider");
    }

    return context;
}