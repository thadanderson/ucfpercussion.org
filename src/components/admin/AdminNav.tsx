"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "News & Events" },
  { href: "/admin/faculty", label: "Faculty" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/alumni", label: "Alumni" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/content", label: "Content" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 bg-ucf-black text-ucf-white min-h-screen p-6 flex flex-col gap-1">
      <p className="text-ucf-gold font-bold text-sm uppercase tracking-widest mb-4">Admin</p>
      {links.map(({ href, label }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              active
                ? "bg-ucf-gold text-ucf-black font-semibold"
                : "text-gray-300 hover:text-ucf-white hover:bg-white/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
