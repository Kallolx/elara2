export const categoryIcons = [
  { name: "Cleanser", path: "/category/cleanser.png" },
  { name: "Cream", path: "/category/cream.png" },
  { name: "Facemask", path: "/category/facemask.png" },
  { name: "Serum", path: "/category/serum.png" },
  { name: "Sun Screen", path: "/category/sun-screen.png" },
  { name: "Toner", path: "/category/toner.png" },
  { name: "Balm", path: "/category/balm.png" },
  { name: "Peel", path: "/category/peel.png" },
  { name: "Toner Pro", path: "/category/toner-2.png" },
] as const;

export type CategoryIconPath = (typeof categoryIcons)[number]["path"];
export type CategoryIconName = string; // Support both path and legacy names for transition

// Helper to derive image path from old names stored in DB or direct image path
export const getCategoryIconPath = (icon: string) => {
  if (!icon) return "/category/cream.png";
  if (icon.startsWith("/")) return icon; // is already a path

  // Legacy mapping for safety
  const legacyMap: Record<string, string> = {
    Droplet: "/category/cleanser.png",
    Sun: "/category/sun-screen.png",
    Zap: "/category/serum.png",
    Heart: "/category/cream.png",
    Star: "/category/toner.png",
    Shield: "/category/facemask.png",
    Feather: "/category/cleanser.png",
    Activity: "/category/cream.png",
    Coffee: "/category/toner.png",
    Briefcase: "/category/facemask.png",
    Scissors: "/category/facemask.png",
    Grid: "/category/cream.png",
  };

  return legacyMap[icon] || "/category/cream.png";
};

export type AdminCategory = {
  name: string;
  slug: string;
  products: number;
  status: string;
  icon: string;
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