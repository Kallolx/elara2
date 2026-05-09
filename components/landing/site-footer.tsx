"use client";

import Image from "next/image";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { useStore } from "@/context/StoreContext";

const shopLinks = ["Cleansers", "Moisturizers", "Serums", "Best sellers"];
const helpLinks = ["Shipping", "Returns", "Support", "FAQ"];
const companyLinks = ["About", "Privacy", "Terms", "Contact"];

const socialLinks = [
  { label: "Instagram", icon: FiInstagram, href: "#" },
  { label: "Facebook", icon: FiFacebook, href: "#" },
  { label: "Twitter", icon: FiTwitter, href: "#" },
  { label: "YouTube", icon: FiYoutube, href: "#" },
];

export function SiteFooter() {
  const { settings } = useStore();

  return (
    <footer id="contact" className="border-t border-line bg-[rgba(243,232,220,0.9)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))]">
          <div className="max-w-sm">
            <span className="relative block h-10 w-36 overflow-hidden">
              <Image
                src={settings.logo || "/logo.svg"}
                alt={settings.logoAlt || "Elara"}
                fill
                className="object-contain object-left"
                unoptimized
                sizes="144px"
              />
            </span>
            <p className="mt-3 text-sm leading-7 text-text-soft">
              Minimal skincare with a warm, editorial feel. Built to keep the product story compact,
              clear, and easy to shop.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong"
                >
                  <Icon className="text-[15px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-soft">Shop</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#shop" className="hover:text-accent">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-soft">Help</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {helpLinks.map((link) => (
                <li key={link}>
                  <a href="#contact" className="hover:text-accent">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-soft">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#contact" className="hover:text-accent">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 text-xs uppercase tracking-[0.24em] text-text-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Elara. All rights reserved.</p>
          <a href="#top" className="hover:text-foreground">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
