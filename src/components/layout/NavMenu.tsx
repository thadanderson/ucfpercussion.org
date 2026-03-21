"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function NavMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="bg-ucf-black text-ucf-white px-6 py-4 relative z-50 border-b-2 border-ucf-gold">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-ucf-gold text-lg shrink-0" onClick={close}>
          UCF Percussion
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/events">News &amp; Events</Link></li>
          <li><Link href="/auditions">Audition</Link></li>
          <li><Link href="/alumni">Alumni</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          {isLoggedIn ? (
            <>
              <li>
                <Link href="/dashboard" className="text-ucf-gold">Dashboard</Link>
              </li>
              <li><LogoutButton /></li>
            </>
          ) : (
            <li>
              <Link href="/login" className="text-ucf-gold">Login</Link>
            </li>
          )}
        </ul>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden text-ucf-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-ucf-black border-t border-white/10 px-6 py-4">
          <ul className="flex flex-col gap-4 text-sm">
            <li><Link href="/about" onClick={close}>About</Link></li>
            <li><Link href="/events" onClick={close}>News &amp; Events</Link></li>
            <li><Link href="/auditions" onClick={close}>Audition</Link></li>
            <li><Link href="/alumni" onClick={close}>Alumni</Link></li>
            <li><Link href="/contact" onClick={close}>Contact</Link></li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="text-ucf-gold" onClick={close}>Dashboard</Link>
                </li>
                <li><LogoutButton /></li>
              </>
            ) : (
              <li>
                <Link href="/login" className="text-ucf-gold" onClick={close}>Login</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
