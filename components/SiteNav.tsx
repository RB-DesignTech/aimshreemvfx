"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Curio Flex" },
  { href: "/curio-flex-video", label: "Curio Flex Video" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-30 border-b border-orange-500/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="text-sm font-semibold uppercase tracking-[0.5em] text-orange-200/80">
          Curio Flex Lab
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
                    ? "bg-gradient-to-r from-orange-500 to-orange-300 text-slate-950 shadow-[0_0_25px_rgba(255,122,0,0.35)]"
                    : "border border-orange-500/30 text-orange-200/80 hover:border-orange-300/80 hover:text-orange-50"
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
