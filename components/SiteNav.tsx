"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: "AimShreem Flex" },
  { href: "/curio-flex-video", label: "AimShreem Flex Video" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-30 border-b border-[#00bbff]/25 bg-[#05003a]/85 shadow-[0_0_40px_rgba(0,187,255,0.18)] backdrop-blur-lg">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <span className="text-sm font-semibold uppercase tracking-[0.5em] text-[#66e1ff]/80">
          AimShreem Flex Lab
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          {links.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                  isActive
                    ? "bg-gradient-to-r from-[#00bbff] to-[#66e1ff] text-[#05003a] shadow-[0_0_25px_rgba(0,187,255,0.35)]"
                    : "border border-[#00bbff]/40 text-[#66e1ff]/80 hover:border-[#66e1ff]/80 hover:text-[#e0f9ff]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
