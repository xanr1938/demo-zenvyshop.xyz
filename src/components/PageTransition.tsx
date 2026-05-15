"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useRef } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      key={pathname}
      ref={ref}
      style={{ animation: "pageIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
      onAnimationEnd={() => {
        if (ref.current) ref.current.style.animation = "";
      }}
    >
      {children}
    </div>
  );
}
