"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "cn";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Check" },
  { href: "/conditions", label: "Library" },
  { href: "/method", label: "Method" },
  { href: "/history", label: "History" },
] as const;

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 text-primary" aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path d="M7 22.5c4.2-9 13.8-9 18 0" fill="none" stroke="#f6f1e7" strokeWidth="1.6" />
      <path d="M16 6.5v19" stroke="#f6f1e7" strokeWidth="1.3" />
      <circle cx="16" cy="15.5" r="2.1" fill="#f3c77a" />
    </svg>
  );
}

function navClass(active: boolean) {
  return cn(
    "rounded-full px-3 py-1.5 text-sm transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="leading-tight">
            <span className="block font-heading text-lg leading-none tracking-tight">Meridian</span>
            <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Symptom support</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navClass(active(link.href))} aria-current={active(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open menu" />}>
              <Menu />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Meridian</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {links.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<Link href={link.href} className={cn(navClass(active(link.href)), "px-3 py-2")} />}
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
