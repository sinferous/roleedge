"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Brand } from "./Brand";

const mobileLinks = [...site.nav, { href: "/start", label: "Find your starting point" }, { href: "/faq", label: "FAQs" }];

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The close plays shorter than the open, then the menu is hidden.
  const close = useCallback((restoreFocus = false) => {
    setOpen((wasOpen) => {
      if (wasOpen) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setClosing(true);
        window.setTimeout(() => setClosing(false), reduce ? 0 : 150);
      }
      return false;
    });
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Navigating closes the menu (adjusting state during render rather than in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    const onOutside = (e: Event) => {
      if (!headerRef.current?.contains(e.target as Node)) close();
    };
    const desktop = window.matchMedia("(min-width: 1000px)");
    const onResize = () => desktop.matches && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onOutside);
    document.addEventListener("focusin", onOutside);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onOutside);
      document.removeEventListener("focusin", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, close]);

  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined);

  return (
    <header ref={headerRef} className={`site-header${scrolled ? " is-scrolled" : ""}`} id="site-header">
      <div className="container header-inner">
        <Brand size={28} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="button button-small button-dark header-booking" href="/book">
          Free consultation
        </Link>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <span></span>
          <span></span>
        </button>
      </div>
      <nav
        id="mobile-nav"
        className={`mobile-nav${closing ? " is-closing" : ""}`}
        aria-label="Mobile navigation"
        hidden={!open && !closing}
      >
        {mobileLinks.map((item) => (
          <Link key={item.href} href={item.href} aria-current={current(item.href)} onClick={() => close()}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
