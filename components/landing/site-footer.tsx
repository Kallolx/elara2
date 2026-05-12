"use client";

import Image from "next/image";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useStore } from "@/context/StoreContext";

const categoryLinks = [
  { label: "Cleanser", href: "/shop?category=Cleanser" },
  { label: "Moisturizer", href: "/shop?category=Moisturizer" },
  { label: "Serum", href: "/shop?category=Serum" },
  { label: "Sunscreen", href: "/shop?category=Sunscreen" },
];
const usefulLinks = [
  { label: "Track Order", href: "/orders" },
  { label: "Shipping & Delivery", href: "#" },
  { label: "Returns & Refund", href: "#" },
  { label: "Terms of Service", href: "#" },
];
const companyLinks = [
  { label: "About Elara", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "FAQs", href: "#" },
];

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
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-1 max-w-sm">
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
            <p className="mt-3 text-sm leading-6 text-text-soft">
              Curated skincare for refined results. Built to keep the product story compact,
              clear, and easy to shop.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center border border-line bg-surface text-foreground transition-colors hover:border-accent/40 hover:bg-surface-strong rounded-full"
                >
                  <Icon className="text-[14px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground">Categories</p>
            <ul className="mt-5 space-y-3 text-[13px] text-text-soft">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground">Useful Links</p>
            <ul className="mt-5 space-y-3 text-[13px] text-text-soft">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground">Company</p>
            <ul className="mt-5 space-y-3 text-[13px] text-text-soft">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground">Contact Us</p>
            <ul className="mt-5 space-y-3 text-[13px] text-text-soft">
              <li>
                <a href="tel:+8801234567890" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <FiPhone className="shrink-0" />
                  +880 1234-567890
                </a>
              </li>
              <li>
                <a href="mailto:support@elara.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <FiMail className="shrink-0" />
                  support@elara.com
                </a>
              </li>
              <li className="pt-1">
                <a 
                  href="https://wa.me/8801234567890" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#1f9c4b] px-3 py-1.5 rounded-md border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white transition-all duration-300"
                >
                  <FaWhatsapp className="text-[16px]" />
                  <span className="font-semibold tracking-tight">WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-line/60 flex flex-col items-center justify-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-soft/80">Secured Payments by</p>
          <div className="w-full max-w-3xl mx-auto bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-line/40 hover:bg-white/80 transition-all duration-500">
            <img 
              src="/payments.png" 
              alt="Bangladeshi Payment Methods" 
              className="w-full h-auto object-contain filter grayscale-[20%] opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-xs uppercase tracking-[0.24em] text-text-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Elara. All rights reserved.</p>
          <a href="#top" className="hidden sm:block hover:text-foreground">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
