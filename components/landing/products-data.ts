export type ProductItem = {
  slug: string;
  sku: string;
  name: string;
  category: string;
  hasOffer?: boolean;
  rating: string;
  reviewCount: string;
  shortDescription: string;
  description: string;
  ingredients: string[];
  howToUse: string[];
  sizes: Array<{
    label: string;
    price: string;
    oldPrice: string;
  }>;
  reviews: Array<{
    author: string;
    rating: string;
    date: string;
    title: string;
    text: string;
  }>;
  gallery: Array<{
    src: string;
    alt: string;
  }>;
  image: {
    src: string;
    alt: string;
  };
};

export const featuredProducts: ProductItem[] = [
  {
    slug: "bright-cleanser",
    sku: "EL-CLN-BC-001",
    name: "Bright Cleanser",
    category: "Cleansers",
    hasOffer: true,
    rating: "4.8",
    reviewCount: "12",
    shortDescription:
      "A gentle foam cleanser that keeps skin fresh, balanced, and clean.",
    description:
      "Bright Cleanser is built for daily use with a soft foam texture that removes buildup without leaving the skin tight. It suits simple morning and evening routines and keeps the finish calm, smooth, and refreshed.",
    ingredients: [
      "Rice water extract",
      "Glycerin",
      "Coconut-derived surfactants",
      "Panthenol",
    ],
    howToUse: [
      "Wet the face with lukewarm water.",
      "Massage a small amount into a soft foam.",
      "Rinse thoroughly and follow with toner or serum.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "750 BDT",
        oldPrice: "850 BDT",
      },
      {
        label: "30 ml",
        price: "938 BDT",
        oldPrice: "1,063 BDT",
      },
      {
        label: "100 ml",
        price: "1,163 BDT",
        oldPrice: "1,318 BDT",
      },
    ],
    reviews: [
      {
        author: "Nusrat J.",
        rating: "5.0",
        date: "2026-04-18",
        title: "Super gentle and fresh",
        text: "It cleans well and feels soft on the skin. I use it twice a day and it never strips my face.",
      },
      {
        author: "Rahim S.",
        rating: "4.8",
        date: "2026-03-30",
        title: "Compact but effective",
        text: "The texture is nice and the foam is smooth. Great for travel size and daily use.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Cleanser product image",
      },
      {
        src: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Cleanser close-up shot",
      },
      {
        src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Cleanser lifestyle shot",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
      alt: "Minimal cleanser tube on warm beige background",
    },
  },
  {
    slug: "sun-veil-spf",
    sku: "EL-SUN-SV-002",
    name: "Sun Veil SPF",
    category: "Sunscreen",
    hasOffer: false,
    rating: "4.7",
    reviewCount: "18",
    shortDescription: "Light daily SPF with a soft finish and easy layering.",
    description:
      "Sun Veil SPF is a lightweight sunscreen designed to sit comfortably under makeup or on bare skin. It gives a clean finish, supports everyday protection, and feels breathable during long wear.",
    ingredients: ["Zinc oxide", "Niacinamide", "Vitamin E", "Hyaluronic acid"],
    howToUse: [
      "Apply as the final step of your morning routine.",
      "Use two finger-lengths for face and neck.",
      "Reapply every 2-3 hours when outdoors.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "980 BDT",
        oldPrice: "1,120 BDT",
      },
      {
        label: "30 ml",
        price: "1,225 BDT",
        oldPrice: "1,400 BDT",
      },
      {
        label: "50 ml",
        price: "1,519 BDT",
        oldPrice: "1,736 BDT",
      },
    ],
    reviews: [
      {
        author: "Mim A.",
        rating: "4.8",
        date: "2026-04-25",
        title: "No heavy sunscreen feel",
        text: "This absorbs quickly and doesn’t leave a thick white cast on my skin.",
      },
      {
        author: "Tareq H.",
        rating: "4.6",
        date: "2026-04-10",
        title: "Good for daily use",
        text: "Works nicely under light makeup and feels comfortable through the day.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
        alt: "Sun Veil SPF bottle image",
      },
      {
        src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80",
        alt: "Sun Veil SPF texture shot",
      },
      {
        src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80",
        alt: "Sun Veil SPF on vanity",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
      alt: "Sunscreen bottle on a warm natural background",
    },
  },
  {
    slug: "barrier-glow-serum",
    sku: "EL-SRM-BG-003",
    name: "Barrier Glow Serum",
    category: "Serums",
    hasOffer: false,
    rating: "4.8",
    reviewCount: "12",
    shortDescription:
      "A glow serum that supports barrier comfort and smooth skin texture.",
    description:
      "Barrier Glow Serum is a lightweight treatment serum that focuses on hydration, tone support, and a refined glow. It layers easily and works well in a minimal routine or a more complete skin-care stack.",
    ingredients: ["Niacinamide", "Ceramides", "Squalane", "Peptides"],
    howToUse: [
      "Apply 2-3 drops after cleansing and toning.",
      "Gently press into the skin until absorbed.",
      "Follow with moisturizer to lock in hydration.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "1,450 BDT",
        oldPrice: "1,650 BDT",
      },
      {
        label: "30 ml",
        price: "1,813 BDT",
        oldPrice: "2,063 BDT",
      },
      {
        label: "50 ml",
        price: "2,248 BDT",
        oldPrice: "2,558 BDT",
      },
    ],
    reviews: [
      {
        author: "Sadia K.",
        rating: "5.0",
        date: "2026-04-14",
        title: "Visible glow in a week",
        text: "My skin looks more even and feels smoother after regular use.",
      },
      {
        author: "Farhan R.",
        rating: "4.7",
        date: "2026-03-28",
        title: "Great layering serum",
        text: "It sits nicely under my moisturizer and doesn’t pill at all.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        alt: "Barrier Glow Serum bottle image",
      },
      {
        src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
        alt: "Barrier Glow Serum close-up",
      },
      {
        src: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=80",
        alt: "Barrier Glow Serum in lifestyle scene",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
      alt: "Amber serum bottle on a warm studio background",
    },
  },
  {
    slug: "veil-moisturizer",
    sku: "EL-MST-VM-004",
    name: "Veil Moisturizer",
    category: "Moisturizers",
    hasOffer: true,
    rating: "4.8",
    reviewCount: "12",
    shortDescription: "A soft cream moisturizer for calm, hydrated daily skin.",
    description:
      "Veil Moisturizer delivers a cushiony, comfort-first finish that helps lock in hydration without feeling greasy. It is designed for morning and night use and keeps skin feeling smooth and balanced.",
    ingredients: ["Shea butter", "Ceramides", "Panthenol", "Oat extract"],
    howToUse: [
      "Apply a pea-sized amount after serum.",
      "Massage into the face and neck.",
      "Use morning and evening for best results.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "1,250 BDT",
        oldPrice: "1,400 BDT",
      },
      {
        label: "30 ml",
        price: "1,563 BDT",
        oldPrice: "1,750 BDT",
      },
      {
        label: "75 ml",
        price: "1,938 BDT",
        oldPrice: "2,170 BDT",
      },
    ],
    reviews: [
      {
        author: "Nabila T.",
        rating: "4.9",
        date: "2026-04-20",
        title: "Comfortable all day",
        text: "Perfect for my combination skin. It keeps dryness away without feeling heavy.",
      },
      {
        author: "Rana M.",
        rating: "4.8",
        date: "2026-04-02",
        title: "Soft and rich",
        text: "The cream texture is smooth and the hydration lasts for hours.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        alt: "Veil Moisturizer jar image",
      },
      {
        src: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=80",
        alt: "Veil Moisturizer texture shot",
      },
      {
        src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=80",
        alt: "Veil Moisturizer styling shot",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
      alt: "Cream jar on a soft beige background",
    },
  },
  {
    slug: "bright-eye-gel",
    sku: "EL-EYE-BG-005",
    name: "Bright Eye Gel",
    category: "Eye Care",
    hasOffer: false,
    rating: "4.6",
    reviewCount: "9",
    shortDescription: "A cooling eye gel that helps refresh tired under-eyes.",
    description:
      "Bright Eye Gel is a lightweight under-eye treatment that feels cooling and easy to absorb. It is designed for daily use to support a smoother, fresher look under the eyes without a sticky residue.",
    ingredients: ["Caffeine", "Green tea extract", "Peptides", "Aloe vera"],
    howToUse: [
      "Tap a small amount around the orbital bone.",
      "Use your ring finger for a light touch.",
      "Apply morning and evening after serum.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "890 BDT",
        oldPrice: "990 BDT",
      },
      {
        label: "30 ml",
        price: "1,113 BDT",
        oldPrice: "1,238 BDT",
      },
    ],
    reviews: [
      {
        author: "Anika R.",
        rating: "4.7",
        date: "2026-04-16",
        title: "Feels instantly cooling",
        text: "Nice lightweight gel that helps my under-eyes feel less tired in the morning.",
      },
      {
        author: "Shuvo P.",
        rating: "4.5",
        date: "2026-03-22",
        title: "Nice for daily care",
        text: "Easy to use and gentle. I like that it absorbs fast and doesn’t feel greasy.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Eye Gel bottle image",
      },
      {
        src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Eye Gel close-up shot",
      },
      {
        src: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Eye Gel lifestyle shot",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
      alt: "Eye care product bottle on a clean soft-toned setup",
    },
  },
  {
    slug: "calming-rose-mist",
    sku: "EL-MST-CRM-006",
    name: "Calming Rose Mist",
    category: "Toners",
    hasOffer: false,
    rating: "4.8",
    reviewCount: "12",
    shortDescription:
      "A soothing facial mist that refreshes and lightly hydrates.",
    description:
      "Calming Rose Mist is a lightweight toner-mist hybrid that brings a refreshing layer of hydration. It can be used after cleansing, between steps, or anytime the skin needs a soft reset during the day.",
    ingredients: ["Rose water", "Glycerin", "Allantoin", "Chamomile extract"],
    howToUse: [
      "Mist over clean skin from a short distance.",
      "Use before serum or moisturizer.",
      "Reapply during the day for a fresh feel.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "680 BDT",
        oldPrice: "780 BDT",
      },
      {
        label: "30 ml",
        price: "850 BDT",
        oldPrice: "975 BDT",
      },
      {
        label: "100 ml",
        price: "1,054 BDT",
        oldPrice: "1,209 BDT",
      },
    ],
    reviews: [
      {
        author: "Maliha F.",
        rating: "4.9",
        date: "2026-04-22",
        title: "Lovely reset mist",
        text: "It feels refreshing and soft on the face. Great when the weather gets warm.",
      },
      {
        author: "Arif U.",
        rating: "4.8",
        date: "2026-04-05",
        title: "Easy everyday mist",
        text: "I keep it on my desk and use it throughout the day. Very light and pleasant.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        alt: "Calming Rose Mist bottle image",
      },
      {
        src: "https://images.unsplash.com/photo-1512659335523-8448d3a4a47f?auto=format&fit=crop&w=1000&q=80",
        alt: "Calming Rose Mist mist shot",
      },
      {
        src: "https://images.unsplash.com/photo-1556228453-efd6c7ff0e20?auto=format&fit=crop&w=1000&q=80",
        alt: "Calming Rose Mist lifestyle shot",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
      alt: "Tall mist bottle on a warm peach background",
    },
  },
  {
    slug: "bright-cleanser-refill",
    sku: "EL-CLN-BCR-007",
    name: "Bright Cleanser Refill",
    category: "Cleansers",
    hasOffer: false,
    rating: "4.7",
    reviewCount: "10",
    shortDescription: "A refill version of the gentle foam cleanser.",
    description:
      "Bright Cleanser Refill keeps the same soft cleansing feel in a simple, travel-friendly format. It removes daily buildup smoothly and fits neatly into a morning and night routine.",
    ingredients: [
      "Rice water extract",
      "Glycerin",
      "Panthenol",
      "Amino surfactants",
    ],
    howToUse: [
      "Wet the face with lukewarm water.",
      "Massage a small amount into a light foam.",
      "Rinse and continue with the rest of your routine.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "820 BDT",
        oldPrice: "920 BDT",
      },
      {
        label: "30 ml",
        price: "1,025 BDT",
        oldPrice: "1,150 BDT",
      },
      {
        label: "60 ml",
        price: "1,271 BDT",
        oldPrice: "1,426 BDT",
      },
    ],
    reviews: [
      {
        author: "Rina K.",
        rating: "4.8",
        date: "2026-04-24",
        title: "Soft and easy",
        text: "A really nice cleanser for daily use. It feels gentle and leaves the skin clean.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Cleanser Refill image",
      },
      {
        src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Cleanser Refill close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80",
      alt: "Bright Cleanser Refill tube on a warm background",
    },
  },
  {
    slug: "sun-veil-spf-mini",
    sku: "EL-SUN-SVM-008",
    name: "Sun Veil SPF Mini",
    category: "Sunscreen",
    hasOffer: true,
    rating: "4.8",
    reviewCount: "14",
    shortDescription: "A compact SPF for easy daily reapplication.",
    description:
      "Sun Veil SPF Mini keeps the same lightweight finish in a smaller size. It is made for travel, desk use, and quick reapplication throughout the day.",
    ingredients: ["Zinc oxide", "Niacinamide", "Vitamin E", "Hyaluronic acid"],
    howToUse: [
      "Apply as the final step of your morning routine.",
      "Use the amount you need for face and neck.",
      "Reapply during the day when outdoors.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "720 BDT",
        oldPrice: "820 BDT",
      },
      {
        label: "30 ml",
        price: "900 BDT",
        oldPrice: "1,025 BDT",
      },
      {
        label: "50 ml",
        price: "1,116 BDT",
        oldPrice: "1,271 BDT",
      },
    ],
    reviews: [
      {
        author: "Fahim A.",
        rating: "4.8",
        date: "2026-04-11",
        title: "Very convenient size",
        text: "Great for carrying around and topping up sunscreen during the day.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
        alt: "Sun Veil SPF Mini image",
      },
      {
        src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80",
        alt: "Sun Veil SPF Mini close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
      alt: "Mini sunscreen bottle on a warm natural background",
    },
  },
  {
    slug: "barrier-glow-serum-boost",
    sku: "EL-SRM-BGB-009",
    name: "Barrier Glow Serum Boost",
    category: "Serums",
    hasOffer: false,
    rating: "4.8",
    reviewCount: "11",
    shortDescription: "A deeper hydration serum with a smoother finish.",
    description:
      "Barrier Glow Serum Boost is a slightly richer take on the original serum, made for when the skin needs a little extra comfort and glow support without heaviness.",
    ingredients: ["Niacinamide", "Ceramides", "Squalane", "Peptides"],
    howToUse: [
      "Apply 2-3 drops after cleansing and toning.",
      "Press into the skin until absorbed.",
      "Follow with moisturizer to seal it in.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "1,620 BDT",
        oldPrice: "1,820 BDT",
      },
      {
        label: "30 ml",
        price: "2,025 BDT",
        oldPrice: "2,275 BDT",
      },
      {
        label: "50 ml",
        price: "2,511 BDT",
        oldPrice: "2,821 BDT",
      },
    ],
    reviews: [
      {
        author: "Nafisa J.",
        rating: "4.9",
        date: "2026-04-09",
        title: "Smooth layer",
        text: "It gives my skin a nice glow and layers well with other products.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
        alt: "Barrier Glow Serum Boost image",
      },
      {
        src: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=80",
        alt: "Barrier Glow Serum Boost close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
      alt: "Serum bottle on a warm studio background",
    },
  },
  {
    slug: "veil-moisturizer-rich",
    sku: "EL-MST-VMR-010",
    name: "Veil Moisturizer Rich",
    category: "Moisturizers",
    hasOffer: true,
    rating: "4.9",
    reviewCount: "15",
    shortDescription: "A richer cream for extra comfort and softness.",
    description:
      "Veil Moisturizer Rich brings a slightly denser cream texture for days when the skin needs a stronger comfort layer without feeling greasy.",
    ingredients: ["Shea butter", "Ceramides", "Panthenol", "Oat extract"],
    howToUse: [
      "Apply after serum in a thin layer.",
      "Massage into the face and neck.",
      "Use morning and evening as needed.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "1,380 BDT",
        oldPrice: "1,540 BDT",
      },
      {
        label: "30 ml",
        price: "1,725 BDT",
        oldPrice: "1,925 BDT",
      },
      {
        label: "75 ml",
        price: "2,139 BDT",
        oldPrice: "2,387 BDT",
      },
    ],
    reviews: [
      {
        author: "Tania S.",
        rating: "4.9",
        date: "2026-04-03",
        title: "Lovely creamy feel",
        text: "It feels richer than the regular moisturizer and works great for dry skin.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=80",
        alt: "Veil Moisturizer Rich jar image",
      },
      {
        src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=80",
        alt: "Veil Moisturizer Rich close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=80",
      alt: "Rich moisturizer jar on a soft beige background",
    },
  },
  {
    slug: "bright-eye-gel-refresh",
    sku: "EL-EYE-BGR-011",
    name: "Bright Eye Gel Refresh",
    category: "Eye Care",
    hasOffer: false,
    rating: "4.7",
    reviewCount: "8",
    shortDescription: "A cooling eye gel with a cleaner, fresher finish.",
    description:
      "Bright Eye Gel Refresh is designed for quick morning use, bringing a cool feel and a light finish that sits well under sunscreen or makeup.",
    ingredients: ["Caffeine", "Green tea extract", "Peptides", "Aloe vera"],
    howToUse: [
      "Tap a small amount around the orbital bone.",
      "Use a light touch with your ring finger.",
      "Apply morning and evening after serum.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "940 BDT",
        oldPrice: "1,040 BDT",
      },
      {
        label: "30 ml",
        price: "1,175 BDT",
        oldPrice: "1,300 BDT",
      },
    ],
    reviews: [
      {
        author: "Mina R.",
        rating: "4.7",
        date: "2026-04-08",
        title: "Fresh under-eyes",
        text: "Feels cooling and light. Nice for early mornings.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Eye Gel Refresh image",
      },
      {
        src: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80",
        alt: "Bright Eye Gel Refresh close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
      alt: "Eye gel bottle on a clean soft-toned setup",
    },
  },
  {
    slug: "calming-rose-mist-luxe",
    sku: "EL-MST-CRML-012",
    name: "Calming Rose Mist Luxe",
    category: "Toners",
    hasOffer: false,
    rating: "4.8",
    reviewCount: "13",
    shortDescription: "A smoother rose mist with a softer, dewier finish.",
    description:
      "Calming Rose Mist Luxe gives the same refreshing feel in a more elevated daily mist, made for quick hydration and a light reset throughout the day.",
    ingredients: ["Rose water", "Glycerin", "Allantoin", "Chamomile extract"],
    howToUse: [
      "Mist over clean skin from a short distance.",
      "Use before serum or moisturizer.",
      "Reapply whenever your skin needs a refresh.",
    ],
    sizes: [
      {
        label: "15 ml",
        price: "760 BDT",
        oldPrice: "860 BDT",
      },
      {
        label: "30 ml",
        price: "950 BDT",
        oldPrice: "1,075 BDT",
      },
      {
        label: "100 ml",
        price: "1,178 BDT",
        oldPrice: "1,333 BDT",
      },
    ],
    reviews: [
      {
        author: "Jannat H.",
        rating: "4.8",
        date: "2026-04-12",
        title: "Very fresh mist",
        text: "Lovely for quick hydration and it feels soft on the skin.",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1512659335523-8448d3a4a47f?auto=format&fit=crop&w=1000&q=80",
        alt: "Calming Rose Mist Luxe image",
      },
      {
        src: "https://images.unsplash.com/photo-1556228453-efd6c7ff0e20?auto=format&fit=crop&w=1000&q=80",
        alt: "Calming Rose Mist Luxe close-up",
      },
    ],
    image: {
      src: "https://images.unsplash.com/photo-1512659335523-8448d3a4a47f?auto=format&fit=crop&w=1000&q=80",
      alt: "Rose mist bottle on a warm peach background",
    },
  },
];

export function getProductBySlug(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}
