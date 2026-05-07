import {
  FiActivity,
  FiBriefcase,
  FiCoffee,
  FiDroplet,
  FiFeather,
  FiGrid,
  FiHeart,
  FiScissors,
  FiShield,
  FiStar,
  FiSun,
  FiZap,
} from "react-icons/fi";

export const categoryIcons = [
  { name: "Droplet", icon: FiDroplet },
  { name: "Sun", icon: FiSun },
  { name: "Star", icon: FiStar },
  { name: "Zap", icon: FiZap },
  { name: "Heart", icon: FiHeart },
  { name: "Shield", icon: FiShield },
  { name: "Feather", icon: FiFeather },
  { name: "Activity", icon: FiActivity },
  { name: "Coffee", icon: FiCoffee },
  { name: "Briefcase", icon: FiBriefcase },
  { name: "Scissors", icon: FiScissors },
  { name: "Grid", icon: FiGrid },
] as const;

export type CategoryIconName = (typeof categoryIcons)[number]["name"];

export type AdminCategory = {
  name: string;
  slug: string;
  products: number;
  status: string;
  icon: CategoryIconName;
  description: string;
};

export const categoryStatusOptions = ["Active", "Inactive"] as const;

export const adminCategories: AdminCategory[] = [
  {
    name: "Cleansers",
    slug: "cleansers",
    products: 2,
    status: "Active",
    icon: "Droplet",
    description: "Mild daily cleansers and foam washes.",
  },
  {
    name: "Sunscreens",
    slug: "sunscreens",
    products: 2,
    status: "Active",
    icon: "Sun",
    description: "SPF and daily sun protection products.",
  },
  {
    name: "Serums",
    slug: "serums",
    products: 2,
    status: "Inactive",
    icon: "Zap",
    description: "Targeted treatment serums and boosters.",
  },
  {
    name: "Moisturizers",
    slug: "moisturizers",
    products: 2,
    status: "Active",
    icon: "Heart",
    description: "Hydrating creams and barrier support care.",
  },
  {
    name: "Toners",
    slug: "toners",
    products: 2,
    status: "Inactive",
    icon: "Star",
    description: "Balancing toners and prep formulas.",
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    products: 2,
    status: "Active",
    icon: "Shield",
    description: "Eye creams and targeted under-eye care.",
  },
];

export const getCategoryBySlug = (slug: string) =>
  adminCategories.find((category) => category.slug === slug);