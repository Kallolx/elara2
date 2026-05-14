"use client";

import Image from "next/image";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiRefreshCcw,
  FiTruck,
  FiFileText,
  FiShield,
  FiInfo,
  FiPhoneCall,
  FiUser,
  FiHelpCircle,
} from "react-icons/fi";
import { FaApple, FaGooglePlay, FaTiktok } from "react-icons/fa";
import { useStore } from "@/context/StoreContext";

const policyLinks = [
  { label: "Return Policy", href: "#", icon: "/nav/return.svg" },
  { label: "Shipping Policy", href: "#", icon: "/nav/shipping.svg" },
  { label: "Terms & Conditions", href: "#", icon: "/nav/terms.svg" },
  { label: "Privacy Policy", href: "#", icon: "/nav/privacy.svg" },
];

const insightLinks = [
  { label: "About Us", href: "#", icon: "/nav/about.svg" },
  { label: "Contact Us", href: "#", icon: "/nav/contact.svg" },
  { label: "My Account", href: "#", icon: "/nav/user.svg" },
  { label: "FAQ", href: "#", icon: "/nav/faq.svg" },
];

export function SiteFooter() {
  const { settings } = useStore();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-accent-deep via-accent to-[#DFB899] text-white">
      {/* Floating Ambient Objects (Top Right & Left) */}
      <div className="absolute top-12 right-24 w-20 h-24 sm:w-28 sm:h-32 bg-white/30 rounded-2xl rotate-12 blur-[2px] opacity-70 pointer-events-none z-0" />
      <div className="absolute top-32 right-[30%] w-12 h-12 bg-white/20 rounded-full blur-[1px] opacity-60 pointer-events-none z-0" />
      <div className="absolute top-40 left-10 w-16 h-20 bg-white/20 rounded-xl -rotate-12 blur-[3px] opacity-50 pointer-events-none z-0" />

      {/* 1. TOP SECTION: FOOTER CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:pt-20">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          {/* LEFT COLUMN: Logo, About, Apps */}
          <div className="max-w-md">
            <span className="relative block h-14 w-44 overflow-hidden mb-8 filter brightness-0 invert opacity-95">
              <Image
                src={settings.logo || "/logo.svg"}
                alt={settings.logoAlt || "Elara"}
                fill
                className="object-contain object-left"
                unoptimized
                sizes="176px"
              />
            </span>
            <p className="text-white/85 text-[15px] leading-relaxed mb-8 font-medium">
              Elara Skincare Limited is Bangladesh's premium beauty e-commerce
              company of high-end foreign Skincare Products. Inquiry: <br />
              <a
                href="mailto:support@elara.com"
                className="font-bold text-white hover:text-white/80 transition-colors mt-1 inline-block"
              >
                support@elara.com
              </a>
            </p>

            {/* PAYMENT BAR */}
            <img
              src="/payments.jpeg"
              alt="Secured Payment Methods"
              className="w-full max-w-[400px] h-auto rounded-md object-contain mt-2 opacity-95"
            />
          </div>

          {/* RIGHT COLUMN: Links, Socials & Payments */}
          <div className="flex flex-col gap-4 lg:pt-4 w-full max-w-[600px]">
            {/* Top Row: Policies/Insight Box + Social Pill */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch w-full">
              {/* Policies & Insight Container */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row flex-1 gap-6 sm:gap-10">
                {/* POLICIES */}
                <div className="flex-1">
                  <p className="text-xl font-serif uppercase text-white/50 mb-6">
                    Policies
                  </p>
                  <ul className="space-y-4 text-sm uppercase text-white/90 font-medium tracking-tight">
                    {policyLinks.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="group flex items-center gap-3 hover:text-white transition-colors"
                        >
                          <img
                            src={link.icon}
                            alt=""
                            className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity brightness-0 invert"
                          />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vertical Divider (becomes horizontal on mobile) */}
                <div className="h-[1px] sm:h-auto w-full sm:w-[1px] bg-white/20 self-stretch rounded-full" />

                {/* INSIGHT */}
                <div className="flex-1">
                  <p className="text-xl font-serif uppercase text-white/50 mb-6">
                    Insight
                  </p>
                  <ul className="space-y-4 text-sm uppercase text-white/90 font-medium tracking-tight">
                    {insightLinks.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="group flex items-center gap-3 hover:text-white transition-colors"
                        >
                          <img
                            src={link.icon}
                            alt=""
                            className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity brightness-0 invert"
                          />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SOCIAL MEDIA PILL (stacks horizontally on mobile, vertically on desktop) */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 sm:py-6 px-6 sm:px-4 flex flex-row sm:flex-col gap-8 sm:gap-6 items-center justify-center shrink-0 w-full sm:w-[70px]">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:scale-110 transition-transform"
                >
                  <img
                    src="/nav/facebook.svg"
                    alt="Facebook"
                    className="w-6 h-6 brightness-0 invert"
                  />
                </a>
                <a
                  href="#"
                  aria-label="Tiktok"
                  className="hover:scale-110 transition-transform"
                >
                  <img
                    src="/nav/tik-tok.svg"
                    alt="Tiktok"
                    className="w-6 h-6 brightness-0 invert"
                  />
                </a>
                <a
                  href="#"
                  aria-label="Youtube"
                  className="hover:scale-110 transition-transform"
                >
                  <img
                    src="/nav/youtube.svg"
                    alt="Youtube"
                    className="w-6 h-6 brightness-0 invert"
                  />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:scale-110 transition-transform"
                >
                  <img
                    src="/nav/instagram.svg"
                    alt="Instagram"
                    className="w-6 h-6 brightness-0 invert"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: COPYRIGHT SEPARATOR */}
      <div className="relative z-20 border-t border-white/20 py-5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/60 font-normal tracking-wide">
          <p>Copyright © 2026 Elara Skincare Limited.</p>
          <p>
            Design & Developed by{" "}
            <a
              href="https://kallol.me"
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white transition-all"
            >
              Kamrul hasan
            </a>
          </p>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: LOGO AND PRODUCTS SHOWCASE */}
      <div className="relative w-full h-[220px] md:h-[350px] lg:h-[450px] overflow-hidden flex items-end justify-center pointer-events-none">
        {/* Center Background Logo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] sm:w-[120vw] max-w-[1400px] h-full flex justify-center opacity-[0.5] filter brightness-0 invert select-none">
          <img
            src="/footer-logo.png"
            alt="Background Logo"
            className="object-contain object-bottom translate-y-[15%]"
          />
        </div>

        {/* Left Lined Up Products */}
        <div className="absolute bottom-0 left-0 opacity-100 z-10 w-[240px] md:w-[380px] xl:w-[480px] translate-y-[20%]">
          <img
            src="/footer-product-group-2.webp"
            alt="Elara Products Left"
            className="w-full h-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative z-0"
          />
        </div>

        {/* Right Lined Up Products */}
        <div className="absolute bottom-0 right-0 opacity-100 z-10 w-[240px] md:w-[380px] xl:w-[480px] translate-y-[20%]">
          <img
            src="/footer-product-group-1.webp"
            alt="Elara Products Right"
            className="w-full h-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative z-0"
          />
        </div>

        {/* Unified Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/70 to-transparent z-20 pointer-events-none" />
      </div>
    </footer>
  );
}
