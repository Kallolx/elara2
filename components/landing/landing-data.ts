import type { IconType } from "react-icons";
import { FiDroplet, FiEye, FiFeather, FiShield, FiStar, FiSun, FiTruck, FiZap } from "react-icons/fi";

export type BrandValue = {
  icon: IconType;
  title: string;
  text: string;
};

export type CategoryCard = {
  name: string;
  slug: string;
  icon: IconType;
  href: string;
  count: string;
};

export const heroImage = {
  src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  alt: "Skincare bottles in warm light",
};

export const bannerImage = {
  src: "https://images.pexels.com/photos/3762175/pexels-photo-3762175.jpeg?auto=compress&cs=tinysrgb&w=1200",
  alt: "Warm skincare product scene",
};

export const brandValues: BrandValue[] = [
  {
    icon: FiFeather,
    title: "Gentle formulations",
    text: "Clean ingredients for calm routines.",
  },
  {
    icon: FiTruck,
    title: "Bangladesh-ready delivery",
    text: "Local pricing and delivery-first flow.",
  },
  {
    icon: FiShield,
    title: "Admin-ready foundation",
    text: "Ready for coupons and analytics later.",
  },
];

export const categories: CategoryCard[] = [
  {
    name: "Cleansers",
    slug: "cleansers",
    icon: FiFeather,
    href: "/shop?category=cleansers",
    count: "12 products",
  },
  {
    name: "Moisturizers",
    slug: "moisturizers",
    icon: FiDroplet,
    href: "/shop?category=moisturizers",
    count: "8 products",
  },
  {
    name: "Serums",
    slug: "serums",
    icon: FiStar,
    href: "/shop?category=serums",
    count: "10 products",
  },
  {
    name: "Sunscreen",
    slug: "sunscreen",
    icon: FiSun,
    href: "/shop?category=sunscreen",
    count: "6 products",
  },
  {
    name: "Toners",
    slug: "toners",
    icon: FiZap,
    href: "/shop?category=toners",
    count: "9 products",
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    icon: FiEye,
    href: "/shop?category=eye-care",
    count: "5 products",
  },
];
